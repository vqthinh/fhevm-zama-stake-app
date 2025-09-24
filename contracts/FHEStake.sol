// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHEVM-Enabled ETH Staking with Encrypted Rewards (Sepolia)
/// @notice Users can stake native ETH with encrypted reward tracking using FHEVM
contract FHEStake is SepoliaConfig {
    uint256 public rewardRate; // wei rewarded per second per wei staked
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => euint32) public encryptedRewards; // Encrypted rewards using FHEVM
    mapping(address => uint256) public balances; // Keep public balances for transparency
    
    // Legacy mapping for backward compatibility - will be deprecated
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    address public owner;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateChanged(uint256 newRate);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            uint256 earnedAmount = earned(account);
            rewards[account] = earnedAmount;
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
            
            // Update encrypted rewards
            euint32 encryptedEarnedAmount = FHE.asEuint32(uint32(earnedAmount / 1e12)); // Convert to smaller unit
            encryptedRewards[account] = encryptedEarnedAmount;
            
            // Grant FHE permissions
            FHE.allowThis(encryptedRewards[account]);
            FHE.allow(encryptedRewards[account], account);
        }
        _;
    }

    constructor(uint256 _rewardRate) {
        owner = msg.sender;
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
        
        // Initialize owner's encrypted rewards
        encryptedRewards[msg.sender] = FHE.asEuint32(0);
        FHE.allowThis(encryptedRewards[msg.sender]);
        FHE.allow(encryptedRewards[msg.sender], msg.sender);
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored + ((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / _totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return (balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 + rewards[account];
    }

    /// @notice Stake native ETH
    function stake() external payable updateReward(msg.sender) {
        require(msg.value > 0, "Cannot stake 0");
        _totalSupply += msg.value;
        balances[msg.sender] += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    /// @notice Withdraw staked ETH
    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Not enough staked");
        _totalSupply -= amount;
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim ETH rewards using encrypted reward amount
    function claimReward() public updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        uint256 minReward = 1e12; // minimum reward threshold: 0.000001 ETH
        uint256 contractBalance = address(this).balance;
        if (reward >= minReward && contractBalance > 0) {
            uint256 payout = reward > contractBalance ? contractBalance : reward;
            rewards[msg.sender] = reward - payout;
            
            // Update encrypted rewards
            euint32 encryptedPayout = FHE.asEuint32(uint32(payout / 1e12)); // Convert to smaller unit for euint32
            euint32 currentEncryptedReward = encryptedRewards[msg.sender];
            encryptedRewards[msg.sender] = FHE.sub(currentEncryptedReward, encryptedPayout);
            
            // Grant FHE permissions
            FHE.allowThis(encryptedRewards[msg.sender]);
            FHE.allow(encryptedRewards[msg.sender], msg.sender);
            
            if (payout > 0) {
                payable(msg.sender).transfer(payout);
                emit RewardPaid(msg.sender, payout);
            }
        }
    }
    
    /// @notice Claim rewards with encrypted input amount
    function claimEncryptedReward(externalEuint32 inputEuint32, bytes calldata inputProof) external updateReward(msg.sender) {
        euint32 requestedAmount = FHE.fromExternal(inputEuint32, inputProof);
        euint32 currentEncryptedReward = encryptedRewards[msg.sender];
        
        // Convert encrypted amount back to wei for validation
        // Note: In production, you might want to implement encrypted comparisons
        uint256 reward = rewards[msg.sender];
        uint256 minReward = 1e12;
        uint256 contractBalance = address(this).balance;
        
        if (reward >= minReward && contractBalance > 0) {
            uint256 payout = reward > contractBalance ? contractBalance : reward;
            rewards[msg.sender] = reward - payout;
            
            // Update encrypted rewards
            encryptedRewards[msg.sender] = FHE.sub(currentEncryptedReward, requestedAmount);
            
            // Grant FHE permissions
            FHE.allowThis(encryptedRewards[msg.sender]);
            FHE.allow(encryptedRewards[msg.sender], msg.sender);
            
            if (payout > 0) {
                payable(msg.sender).transfer(payout);
                emit RewardPaid(msg.sender, payout);
            }
        }
    }

    /// @notice Owner can reset reward of any user (both encrypted and plain)
    function resetReward(address user) external onlyOwner {
        rewards[user] = 0;
        encryptedRewards[user] = FHE.asEuint32(0);
        
        // Grant FHE permissions for the reset encrypted reward
        FHE.allowThis(encryptedRewards[user]);
        FHE.allow(encryptedRewards[user], user);
    }

    /// @notice Withdraw stake + claim rewards
    function exit() external {
        withdraw(balances[msg.sender]);
        claimReward();
    }

    /// @notice Owner can change reward rate
    function setRewardRate(uint256 _rate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rate;
        emit RewardRateChanged(_rate);
    }

    /// @notice Contract can receive ETH (to fund rewards)
    receive() external payable {}
    
    /// @notice Get encrypted rewards for a user (requires proper FHE permissions)
    /// @param account The user address to get encrypted rewards for
    /// @return The encrypted reward amount as euint32
    function getEncryptedRewards(address account) external view returns (euint32) {
        return encryptedRewards[account];
    }
    
    /// @notice Initialize encrypted rewards for a new user
    /// @param user The user address to initialize
    function initializeEncryptedRewards(address user) external {
        // Simply set encrypted rewards to 0 - FHEVM will handle initialization properly
        encryptedRewards[user] = FHE.asEuint32(0);
        FHE.allowThis(encryptedRewards[user]);
        FHE.allow(encryptedRewards[user], user);
    }
}
