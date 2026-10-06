// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title PRIVEX Utility Token
/// @notice ERC-20 utility token for the PRIVEX protocol with capped supply, permit approvals, and transfer pause controls.
contract PRIVEXToken is ERC20, ERC20Permit, ERC20Burnable, Pausable, Ownable2Step {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;

    error ZeroAddress();
    error ZeroAmount();
    error MaxSupplyExceeded();

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    /// @param initialOwner Initial owner of the token contract.
    constructor(address initialOwner)
        ERC20("PRIVEX", "PVX")
        ERC20Permit("PRIVEX")
        Ownable(initialOwner)
    {
        if (initialOwner == address(0)) revert ZeroAddress();
    }

    /// @notice Pauses token transfers.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses token transfers.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Mints new PVX tokens to a recipient, respecting the fixed max supply.
    /// @param to Recipient of minted tokens.
    /// @param amount Amount of tokens to mint.
    function mint(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();

        _mint(to, amount);
        emit Minted(to, amount);
    }

    /// @notice Burns caller-owned tokens.
    /// @param value Amount of tokens to burn.
    function burn(uint256 value) public override {
        if (value == 0) revert ZeroAmount();
        super.burn(value);
        emit Burned(_msgSender(), value);
    }

    /// @notice Burns tokens from an account using allowance.
    /// @param account Account to burn from.
    /// @param value Amount of tokens to burn.
    function burnFrom(address account, uint256 value) public override {
        if (account == address(0)) revert ZeroAddress();
        if (value == 0) revert ZeroAmount();
        super.burnFrom(account, value);
        emit Burned(account, value);
    }

    /// @dev Blocks transfers while paused, while still allowing mint/burn operations.
    function _update(address from, address to, uint256 value) internal override {
        if (paused() && from != address(0) && to != address(0)) {
            revert EnforcedPause();
        }
        super._update(from, to, value);
    }
}
