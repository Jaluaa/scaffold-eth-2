// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SimpleTipJar - Hackathon MVP Version
 * @dev Minimal tipping contract for 36-hour hackathon
 */
contract SimpleTipJar is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Creator balances: creator => token => amount
    mapping(address => mapping(address => uint256)) public balances;

    // Events for frontend
    event TipSent(
        address indexed tipper,
        address indexed creator,
        address indexed token,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed creator,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Send ETH tip to creator
     */
    function tipETH(address creator, string calldata message)
        external
        payable
        nonReentrant
    {
        require(creator != address(0), "Invalid creator");
        require(creator != msg.sender, "Cannot tip yourself");
        require(msg.value > 0, "Must send ETH");

        balances[creator][address(0)] += msg.value;

        emit TipSent(
            msg.sender,
            creator,
            address(0),
            msg.value,
            message,
            block.timestamp
        );
    }

    /**
     * @dev Send ERC20 token tip to creator
     */
    function tipToken(
        address creator,
        address token,
        uint256 amount,
        string calldata message
    ) external nonReentrant {
        require(creator != address(0), "Invalid creator");
        require(creator != msg.sender, "Cannot tip yourself");
        require(token != address(0), "Invalid token");
        require(amount > 0, "Must send tokens");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        balances[creator][token] += amount;

        emit TipSent(
            msg.sender,
            creator,
            token,
            amount,
            message,
            block.timestamp
        );
    }

    /**
     * @dev Withdraw tips (ETH or tokens)
     */
    function withdraw(address token) external nonReentrant {
        uint256 amount = balances[msg.sender][token];
        require(amount > 0, "No balance");

        balances[msg.sender][token] = 0;

        if (token == address(0)) {
            // Withdraw ETH
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            // Withdraw ERC20
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit Withdrawal(msg.sender, token, amount, block.timestamp);
    }

    /**
     * @dev Get creator balance
     */
    function getBalance(address creator, address token)
        external
        view
        returns (uint256)
    {
        return balances[creator][token];
    }
}