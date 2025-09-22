import { ethers } from "hardhat";
import { expect } from "chai";
import { FHEStake } from "../types";

describe("FHEStake", function () {
  let stakeContract: FHEStake;
  let deployer: any;
  let alice: any;
  let bob: any;

  const rewardRate = ethers.parseEther("0.001"); // 0.001 ETH reward mỗi giây

  beforeEach(async function () {
    [deployer, alice, bob] = await ethers.getSigners();

    const FHEStakeFactory = await ethers.getContractFactory("FHEStake");
    stakeContract = (await FHEStakeFactory.deploy(rewardRate)) as FHEStake;
    await stakeContract.waitForDeployment();
  });

  it("Alice có thể stake ETH", async function () {
    const stakeAmount = ethers.parseEther("1");

    await expect(stakeContract.connect(alice).stake({ value: stakeAmount }))
      .to.emit(stakeContract, "Staked")
      .withArgs(alice.address, stakeAmount);

    const balance = await stakeContract.balances(alice.address);
    expect(balance).to.equal(stakeAmount);
  });

  it("Alice có thể withdraw ETH đã stake", async function () {
    const stakeAmount = ethers.parseEther("1");
    await stakeContract.connect(alice).stake({ value: stakeAmount });

    await expect(stakeContract.connect(alice).withdraw(stakeAmount))
      .to.emit(stakeContract, "Withdrawn")
      .withArgs(alice.address, stakeAmount);

    const balance = await stakeContract.balances(alice.address);
    expect(balance).to.equal(0);
  });

  it("Alice có thể claimReward sau khi stake", async function () {
    const stakeAmount = ethers.parseEther("1");
    await stakeContract.connect(alice).stake({ value: stakeAmount });

    // tăng thời gian để có reward
    await ethers.provider.send("evm_increaseTime", [5]);
    await ethers.provider.send("evm_mine", []);

    // gọi claimReward để trigger updateReward + nhận reward
    await expect(stakeContract.connect(alice).claimReward()).to.emit(stakeContract, "RewardPaid");

    // sau khi claim, rewards[alice] phải reset về 0
    const rewardAfter = await stakeContract.rewards(alice.address);
    expect(rewardAfter).to.equal(0);
  });

  it("Alice và Bob stake cùng lúc, cả hai đều có reward", async function () {
    const amountAlice = ethers.parseEther("1");
    const amountBob = ethers.parseEther("2");

    await stakeContract.connect(alice).stake({ value: amountAlice });
    await stakeContract.connect(bob).stake({ value: amountBob });

    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine", []);

    // gọi claimReward để trigger updateReward
    await expect(stakeContract.connect(alice).claimReward()).to.emit(stakeContract, "RewardPaid");
    await expect(stakeContract.connect(bob).claimReward()).to.emit(stakeContract, "RewardPaid");
  });
});
