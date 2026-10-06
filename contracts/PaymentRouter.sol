// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Minimal burn interface required on PVX token.
interface IBurnable {
    function burn(uint256 value) external;
}

/// @title PRIVEX Payment Router v2
/// @notice Routes USDC service payments, sends 75% of fees to admin treasury,
///         and auto-burns 25% worth of PVX on every payment.
///         PVX token and fee wallet can be wired in after deploy via setters.
contract PaymentRouter is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_FEE_BPS   = 1_000; // 10% hard cap
    uint256 public constant BURN_SHARE_BPS = 2_500; // 25% of collected fee

    address public usdc;
    address public treasury;
    uint256 public feeBps;
    address public accessManager;

    /// @notice PVX token used for the 25% auto-burn. Zero = burn disabled.
    address public pvxToken;

    mapping(bytes32 => bool) public usedNonces;

    error ZeroAddress();
    error ZeroAmount();
    error InvalidFeeBps();
    error NonceAlreadyUsed();

    event ServicePayment(
        address indexed payer,
        bytes32 indexed serviceId,
        uint256 amount,
        uint256 fee,
        uint256 pvxBurned,
        bytes32 nonce
    );
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeBpsUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event AccessManagerUpdated(address indexed oldAccessManager, address indexed newAccessManager);
    event PvxTokenUpdated(address indexed oldPvx, address indexed newPvx);
    event FeesWithdrawn(address indexed treasury, uint256 amount);
    event PvxBurned(uint256 pvxAmount);

    /// @param initialOwner  Initial owner.
    /// @param usdcToken     USDC token address (Arc Mainnet: 0x3600…0000).
    /// @param treasury_     Admin fee collection wallet (75% of fees go here).
    /// @param accessManager_ AccessManager contract address.
    constructor(
        address initialOwner,
        address usdcToken,
        address treasury_,
        address accessManager_
    ) Ownable(initialOwner) {
        if (
            initialOwner   == address(0) ||
            usdcToken      == address(0) ||
            treasury_      == address(0) ||
            accessManager_ == address(0)
        ) revert ZeroAddress();

        usdc          = usdcToken;
        treasury      = treasury_;
        accessManager = accessManager_;
        feeBps        = 50; // 0.5% default
    }

    // ────────────────────────────────────────────────────────────
    // Core payment logic
    // ────────────────────────────────────────────────────────────

    /// @notice Pay for a PRIVEX service in USDC.
    /// @dev    Fee split on every call (if feeBps > 0):
    ///           • 75% of fee  → treasury (admin wallet)
    ///           • 25% of fee  → stays in contract, used to burn PVX
    ///         Net service amount always goes to treasury immediately.
    ///         PVX burn uses a 1:1 USDC-equivalent amount burned from
    ///         the contract's own PVX allowance (owner must approve).
    ///         If pvxToken is zero or burn fails, payment still succeeds.
    /// @param serviceId Arbitrary service identifier (keccak256 of service name).
    /// @param amount    Total USDC amount charged from payer (6 decimals on Arc).
    /// @param nonce     Replay-protection nonce, must be unique per payment.
    function payForService(
        bytes32 serviceId,
        uint256 amount,
        bytes32 nonce
    ) external nonReentrant {
        if (amount == 0)            revert ZeroAmount();
        if (usedNonces[nonce])      revert NonceAlreadyUsed();

        usedNonces[nonce] = true;

        uint256 fee       = (amount * feeBps) / 10_000;
        uint256 netAmount = amount - fee;

        // Pull full amount from payer
        IERC20(usdc).safeTransferFrom(_msgSender(), address(this), amount);

        // Send net service amount to treasury immediately
        IERC20(usdc).safeTransfer(treasury, netAmount);

        // Fee split: 75% to treasury, 25% stays for PVX burn
        uint256 burnShareUsdc = (fee * BURN_SHARE_BPS) / 10_000;
        uint256 treasuryShare = fee - burnShareUsdc;

        if (treasuryShare > 0) {
            IERC20(usdc).safeTransfer(treasury, treasuryShare);
        }

        // 25% auto-burn: burn PVX equal in raw units to the burn-share USDC amount
        uint256 pvxBurned = 0;
        if (pvxToken != address(0) && burnShareUsdc > 0) {
            // burnShareUsdc is in USDC units (6 dec on Arc).
            // PVX is 18 dec — scale up so 1 USDC unit = 1e12 PVX units.
            uint256 pvxAmount = burnShareUsdc * 1e12;
            uint256 bal = IERC20(pvxToken).balanceOf(address(this));
            if (bal >= pvxAmount) {
                // Effects before external call (reentrancy guard also active)
                pvxBurned = pvxAmount;
                IBurnable(pvxToken).burn(pvxAmount);
                emit PvxBurned(pvxAmount);
            }
        }

        emit ServicePayment(_msgSender(), serviceId, amount, fee, pvxBurned, nonce);
    }

    // ────────────────────────────────────────────────────────────
    // Owner setters
    // ────────────────────────────────────────────────────────────

    /// @notice Set the PVX token address for auto-burn. Pass zero to disable.
    function setPvxToken(address token) external onlyOwner {
        address old = pvxToken;
        pvxToken = token;
        emit PvxTokenUpdated(old, token);
    }

    /// @notice Update the admin fee collection wallet.
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    /// @notice Update protocol fee in basis points (max 10%).
    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFeeBps();
        uint256 old = feeBps;
        feeBps = newFeeBps;
        emit FeeBpsUpdated(old, newFeeBps);
    }

    /// @notice Update AccessManager reference.
    function setAccessManager(address am) external onlyOwner {
        if (am == address(0)) revert ZeroAddress();
        address old = accessManager;
        accessManager = am;
        emit AccessManagerUpdated(old, am);
    }

    /// @notice Withdraw any remaining USDC fees held by this contract to treasury.
    function withdrawFees() external nonReentrant onlyOwner {
        uint256 bal = IERC20(usdc).balanceOf(address(this));
        if (bal == 0) revert ZeroAmount();
        IERC20(usdc).safeTransfer(treasury, bal);
        emit FeesWithdrawn(treasury, bal);
    }

    /// @notice Withdraw any PVX held by this contract (e.g. excess top-up).
    function withdrawPvx(uint256 amount) external nonReentrant onlyOwner {
        if (pvxToken == address(0)) revert ZeroAddress();
        if (amount == 0)            revert ZeroAmount();
        IERC20(pvxToken).safeTransfer(treasury, amount);
    }
}
