// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PRIVEX Payment Router
/// @notice Routes USDC service payments and accounts for protocol fees.
contract PaymentRouter is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_FEE_BPS = 1_000;

    address public usdc;
    address public treasury;
    uint256 public feeBps;
    address public accessManager;

    mapping(bytes32 => bool) public usedNonces;

    error ZeroAddress();
    error ZeroAmount();
    error InvalidFeeBps();
    error NonceAlreadyUsed();

    event ServicePayment(address indexed payer, bytes32 indexed serviceId, uint256 amount, uint256 fee, bytes32 nonce);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeBpsUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event AccessManagerUpdated(address indexed oldAccessManager, address indexed newAccessManager);
    event FeesWithdrawn(address indexed treasury, uint256 amount);

    /// @param initialOwner Initial owner of the router.
    /// @param usdcToken USDC token address.
    /// @param treasury_ Treasury address receiving net service payments and withdrawn fees.
    /// @param accessManager_ AccessManager contract address.
    constructor(address initialOwner, address usdcToken, address treasury_, address accessManager_) Ownable(initialOwner) {
        if (initialOwner == address(0) || usdcToken == address(0) || treasury_ == address(0) || accessManager_ == address(0)) {
            revert ZeroAddress();
        }

        usdc = usdcToken;
        treasury = treasury_;
        accessManager = accessManager_;
        feeBps = 50;
    }

    /// @notice Pays for a service in USDC with replay-protected nonce usage.
    /// @dev Transfers full amount from payer; sends net amount to treasury and retains fee in this contract until withdrawn.
    /// @param serviceId Service identifier.
    /// @param amount USDC amount to charge from payer.
    /// @param nonce Unique nonce used for replay protection.
    function payForService(bytes32 serviceId, uint256 amount, bytes32 nonce) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (usedNonces[nonce]) revert NonceAlreadyUsed();

        usedNonces[nonce] = true;

        uint256 fee = (amount * feeBps) / 10_000;
        uint256 netAmount = amount - fee;

        IERC20(usdc).safeTransferFrom(_msgSender(), address(this), amount);
        IERC20(usdc).safeTransfer(treasury, netAmount);

        emit ServicePayment(_msgSender(), serviceId, amount, fee, nonce);
    }

    /// @notice Updates treasury destination.
    /// @param newTreasury New treasury address.
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();

        address oldTreasury = treasury;
        treasury = newTreasury;

        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /// @notice Updates protocol fee basis points.
    /// @param newFeeBps New fee in basis points, capped at 1000.
    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFeeBps();

        uint256 oldFeeBps = feeBps;
        feeBps = newFeeBps;

        emit FeeBpsUpdated(oldFeeBps, newFeeBps);
    }

    /// @notice Updates AccessManager contract reference.
    /// @param am New AccessManager address.
    function setAccessManager(address am) external onlyOwner {
        if (am == address(0)) revert ZeroAddress();

        address oldAccessManager = accessManager;
        accessManager = am;

        emit AccessManagerUpdated(oldAccessManager, am);
    }

    /// @notice Withdraws accumulated protocol fees held by this contract to treasury.
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = IERC20(usdc).balanceOf(address(this));
        if (amount == 0) revert ZeroAmount();

        IERC20(usdc).safeTransfer(treasury, amount);
        emit FeesWithdrawn(treasury, amount);
    }
}
