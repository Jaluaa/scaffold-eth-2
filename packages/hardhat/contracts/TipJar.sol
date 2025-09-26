// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TipJar
 * @dev A social tipping contract that allows users to tip creators with ETH or ERC20 tokens
 * @notice This contract enables creators to receive tips and provides analytics-ready events
 */
contract TipJar is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Supported token addresses (ETH is address(0))
    mapping(address => bool) public supportedTokens;

    // Creator balances by token
    mapping(address => mapping(address => uint256)) public creatorBalances;

    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max

    // Platform fee recipient
    address public feeRecipient;

    // Minimum tip amounts by token
    mapping(address => uint256) public minTipAmounts;

    // Events for The Graph indexing
    event TipSent(
        address indexed tipper,
        address indexed creator,
        address indexed token,
        uint256 amount,
        uint256 fee,
        string message,
        uint256 timestamp
    );

    event CreatorWithdrawal(
        address indexed creator,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    event TokenAdded(address indexed token, uint256 minAmount);
    event TokenRemoved(address indexed token);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;

        // Add ETH as supported token (address(0))
        supportedTokens[address(0)] = true;
        minTipAmounts[address(0)] = 0.001 ether; // 0.001 ETH minimum

        emit TokenAdded(address(0), minTipAmounts[address(0)]);
    }

    /**
     * @dev Send a tip to a creator with ETH
     * @param creator The address of the creator receiving the tip
     * @param message Optional message from the tipper
     */
    function tipWithETH(address creator, string calldata message)
        external
        payable
        nonReentrant
    {
        require(creator != address(0), "Invalid creator address");
        require(creator != msg.sender, "Cannot tip yourself");
        require(msg.value >= minTipAmounts[address(0)], "Tip amount too low");

        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 creatorAmount = msg.value - fee;

        // Update creator balance
        creatorBalances[creator][address(0)] += creatorAmount;

        // Transfer fee to platform
        if (fee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        emit TipSent(
            msg.sender,
            creator,
            address(0),
            creatorAmount,
            fee,
            message,
            block.timestamp
        );
    }

    /**
     * @dev Send a tip to a creator with ERC20 token
     * @param creator The address of the creator receiving the tip
     * @param token The ERC20 token address
     * @param amount The amount of tokens to tip
     * @param message Optional message from the tipper
     */
    function tipWithToken(
        address creator,
        address token,
        uint256 amount,
        string calldata message
    ) external nonReentrant {
        require(creator != address(0), "Invalid creator address");
        require(creator != msg.sender, "Cannot tip yourself");
        require(supportedTokens[token], "Token not supported");
        require(amount >= minTipAmounts[token], "Tip amount too low");

        uint256 fee = (amount * platformFee) / 10000;
        uint256 creatorAmount = amount - fee;

        // Transfer tokens from tipper
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Update creator balance
        creatorBalances[creator][token] += creatorAmount;

        // Transfer fee to platform
        if (fee > 0) {
            IERC20(token).safeTransfer(feeRecipient, fee);
        }

        emit TipSent(
            msg.sender,
            creator,
            token,
            creatorAmount,
            fee,
            message,
            block.timestamp
        );
    }

    /**
     * @dev Withdraw accumulated tips for a creator
     * @param token The token address to withdraw (address(0) for ETH)
     */
    function withdraw(address token) external nonReentrant {
        uint256 balance = creatorBalances[msg.sender][token];
        require(balance > 0, "No balance to withdraw");

        creatorBalances[msg.sender][token] = 0;

        if (token == address(0)) {
            // Withdraw ETH
            (bool success, ) = payable(msg.sender).call{value: balance}("");
            require(success, "ETH withdrawal failed");
        } else {
            // Withdraw ERC20 token
            IERC20(token).safeTransfer(msg.sender, balance);
        }

        emit CreatorWithdrawal(msg.sender, token, balance, block.timestamp);
    }

    /**
     * @dev Get creator balance for a specific token
     * @param creator The creator address
     * @param token The token address
     * @return The balance amount
     */
    function getCreatorBalance(address creator, address token)
        external
        view
        returns (uint256)
    {
        return creatorBalances[creator][token];
    }

    // Admin functions

    /**
     * @dev Add a supported token
     * @param token The token address to add
     * @param minAmount The minimum tip amount for this token
     */
    function addSupportedToken(address token, uint256 minAmount)
        external
        onlyOwner
    {
        require(token != address(0), "Use ETH functions for native token");
        require(!supportedTokens[token], "Token already supported");

        supportedTokens[token] = true;
        minTipAmounts[token] = minAmount;

        emit TokenAdded(token, minAmount);
    }

    /**
     * @dev Remove a supported token
     * @param token The token address to remove
     */
    function removeSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Cannot remove ETH");
        require(supportedTokens[token], "Token not supported");

        supportedTokens[token] = false;
        minTipAmounts[token] = 0;

        emit TokenRemoved(token);
    }

    /**
     * @dev Update platform fee
     * @param newFee The new fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_PLATFORM_FEE, "Fee too high");

        uint256 oldFee = platformFee;
        platformFee = newFee;

        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update fee recipient
     * @param newRecipient The new fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");

        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;

        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Update minimum tip amount for a token
     * @param token The token address
     * @param newMinAmount The new minimum amount
     */
    function setMinTipAmount(address token, uint256 newMinAmount)
        external
        onlyOwner
    {
        require(supportedTokens[token], "Token not supported");
        minTipAmounts[token] = newMinAmount;
    }

    /**
     * @dev Emergency withdrawal function (only owner)
     * @param token The token to withdraw (address(0) for ETH)
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount)
        external
        onlyOwner
    {
        if (token == address(0)) {
            (bool success, ) = payable(owner()).call{value: amount}("");
            require(success, "Emergency ETH withdrawal failed");
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }
}