// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Simple ETH Staking with Rewards (Sepolia)
/// @notice Users can stake native ETH, earn ETH rewards over time, and withdraw
contract FHEStake {
    uint256 public rewardRate; // wei rewarded per second per wei staked
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;

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
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    constructor(uint256 _rewardRate) {
        owner = msg.sender;
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
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

    /// @notice Claim ETH rewards
    function claimReward() public updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        uint256 minReward = 1e12; // phần thưởng tối thiểu, ví dụ: 0.000001 ETH
        uint256 contractBalance = address(this).balance;
        if (reward >= minReward && contractBalance > 0) {
            uint256 payout = reward > contractBalance ? contractBalance : reward;
            rewards[msg.sender] = reward - payout;
            if (payout > 0) {
                payable(msg.sender).transfer(payout);
                emit RewardPaid(msg.sender, payout);
            }
        }
        // Nếu reward nhỏ hơn minReward hoặc contract hết tiền thì không trả, giữ lại cho lần sau
    }

    /// @notice Owner có thể reset reward của bất kỳ user
    function resetReward(address user) external onlyOwner {
        rewards[user] = 0;
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
}
