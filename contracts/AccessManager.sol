// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title PRIVEX Access Manager
/// @notice Manages PRIVEX user identity registrations and access tiers based on PVX balances.
contract AccessManager is Ownable2Step, ReentrancyGuard {
    uint8 public constant FREE = 0;
    uint8 public constant BASIC = 1;
    uint8 public constant PRO = 2;
    uint8 public constant PREMIUM = 3;
    uint8 public constant VIP = 4;

    mapping(address => string) public userHandles;
    mapping(string => address) public handleToWallet;
    mapping(address => bytes32) public identityCommitments;
    mapping(address => uint256) public registeredAt;

    address public privexToken;
    uint256[5] public tierThresholds;

    error ZeroAddress();
    error EmptyHandle();
    error InvalidHandleLength();
    error InvalidHandleCharacter();
    error HandleTaken();
    error NotRegistered();

    event IdentityRegistered(address indexed wallet, string handle, bytes32 commitment);
    event HandleUpdated(address indexed wallet, string oldHandle, string newHandle);
    event CommitmentUpdated(address indexed wallet, bytes32 commitment);
    event TierThresholdsUpdated(uint256[5] thresholds);

    /// @param initialOwner Initial owner of the manager.
    /// @param token Address of the PRIVEX (PVX) token.
    constructor(address initialOwner, address token) Ownable(initialOwner) {
        if (initialOwner == address(0) || token == address(0)) revert ZeroAddress();

        privexToken = token;
        tierThresholds = [uint256(0), 1_000 ether, 10_000 ether, 50_000 ether, 100_000 ether];
    }

    /// @notice Registers or updates caller's identity handle and commitment.
    /// @param handle Lowercase alphanumeric handle between 3 and 32 characters.
    /// @param commitment Hash commitment of the user's public key bundle.
    function registerIdentity(string calldata handle, bytes32 commitment) external nonReentrant {
        _setHandle(_msgSender(), handle);
        identityCommitments[_msgSender()] = commitment;

        if (registeredAt[_msgSender()] == 0) {
            registeredAt[_msgSender()] = block.timestamp;
        }

        emit IdentityRegistered(_msgSender(), handle, commitment);
    }

    /// @notice Updates caller's registered handle.
    /// @param newHandle New lowercase alphanumeric handle between 3 and 32 characters.
    function updateHandle(string calldata newHandle) external nonReentrant {
        string memory oldHandle = userHandles[_msgSender()];
        if (bytes(oldHandle).length == 0) revert NotRegistered();

        _setHandle(_msgSender(), newHandle);
        emit HandleUpdated(_msgSender(), oldHandle, newHandle);
    }

    /// @notice Rotates caller's identity commitment.
    /// @param commitment New hash commitment of the user's public key bundle.
    function updateCommitment(bytes32 commitment) external nonReentrant {
        if (!isRegistered(_msgSender())) revert NotRegistered();
        identityCommitments[_msgSender()] = commitment;
        emit CommitmentUpdated(_msgSender(), commitment);
    }

    /// @notice Returns access tier for a user based on PVX balance.
    /// @param user Wallet address to evaluate.
    /// @return tier Tier id (0 to 4).
    function getAccessTier(address user) public view returns (uint8 tier) {
        if (user == address(0)) revert ZeroAddress();

        uint256 balance = IERC20(privexToken).balanceOf(user);

        if (balance >= tierThresholds[VIP]) return VIP;
        if (balance >= tierThresholds[PREMIUM]) return PREMIUM;
        if (balance >= tierThresholds[PRO]) return PRO;
        if (balance >= tierThresholds[BASIC]) return BASIC;
        return FREE;
    }

    /// @notice Updates tier threshold configuration.
    /// @param thresholds New threshold array for tier indices 0..4.
    function setTierThresholds(uint256[5] calldata thresholds) external onlyOwner nonReentrant {
        tierThresholds = thresholds;
        emit TierThresholdsUpdated(thresholds);
    }

    /// @notice Returns true if user has registered an identity.
    /// @param user Wallet to check.
    /// @return True when user has a registered handle.
    function isRegistered(address user) public view returns (bool) {
        return bytes(userHandles[user]).length != 0;
    }

    /// @notice Gets registered handle for a wallet.
    /// @param user Wallet address.
    /// @return Handle string.
    function getHandle(address user) external view returns (string memory) {
        return userHandles[user];
    }

    /// @notice Resolves wallet address by handle.
    /// @param handle Handle to resolve.
    /// @return Wallet address currently mapped to the handle.
    function getWalletByHandle(string calldata handle) external view returns (address) {
        return handleToWallet[handle];
    }

    function _setHandle(address wallet, string calldata handle) internal {
        bytes calldata handleBytes = bytes(handle);
        uint256 len = handleBytes.length;
        if (len == 0) revert EmptyHandle();
        if (len < 3 || len > 32) revert InvalidHandleLength();

        for (uint256 i = 0; i < len; ++i) {
            bytes1 char = handleBytes[i];
            bool isDigit = char >= 0x30 && char <= 0x39;
            bool isLower = char >= 0x61 && char <= 0x7a;
            if (!(isDigit || isLower)) revert InvalidHandleCharacter();
        }

        address currentOwner = handleToWallet[handle];
        if (currentOwner != address(0) && currentOwner != wallet) revert HandleTaken();

        string memory oldHandle = userHandles[wallet];
        if (bytes(oldHandle).length != 0) {
            delete handleToWallet[oldHandle];
        }

        userHandles[wallet] = handle;
        handleToWallet[handle] = wallet;
    }
}
