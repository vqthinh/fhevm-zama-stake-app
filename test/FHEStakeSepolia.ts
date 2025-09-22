import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { FHEStake } from "../types";

describe("FHEStakeSepolia (debug mode)", function () {
  this.timeout(120000); // Tăng timeout lên 2 phút cho test mạng Sepolia
  let alice: HardhatEthersSigner;
  let deployer: HardhatEthersSigner;
  let fheStake: FHEStake;
  let fheStakeAddress: string;

  before(async function () {
    const network = await ethers.provider.getNetwork();
    console.log("Connected to chainId:", network.chainId.toString());

    if (network.chainId === 31337n) {
      console.warn("⚠️  This test is only for Sepolia Testnet");
      this.skip();
    }

    const FHEStakeDeployment = await deployments.get("FHEStake");
    fheStakeAddress = FHEStakeDeployment.address;
    fheStake = await ethers.getContractAt("FHEStake", fheStakeAddress);

    const signers: HardhatEthersSigner[] = await ethers.getSigners();
    deployer = signers[0];
    alice = signers[1];
    // Fund ví Alice (signer thứ 2)
    const fundAliceTx = await deployer.sendTransaction({
      to: alice.address,
      value: ethers.parseEther("0.01"),
    });
    await fundAliceTx.wait();

    console.log("Using FHEStake at:", fheStakeAddress);
    console.log("Alice address:", alice.address);

    // ✅ Fund contract reward pool
    const fundTx = await deployer.sendTransaction({
      to: fheStakeAddress,
      value: ethers.parseEther("0.01"),
    });
    await fundTx.wait();

    const contractBalance = await ethers.provider.getBalance(fheStakeAddress);
    console.log("Contract funded with:", ethers.formatEther(contractBalance), "ETH");

    const aliceBalance = await ethers.provider.getBalance(alice.address);
    console.log("Alice funded with:", ethers.formatEther(aliceBalance), "ETH");

    // ✅ Giảm reward xuống cực thấp
    const txSetReward = await fheStake.connect(deployer).setRewardRate(1);
    await txSetReward.wait();

    const currentRate = await fheStake.rewardRate();
    console.log("Reward rate set to:", currentRate.toString(), "wei/sec per ETH");
  });

  it("Alice có thể stake ETH", async function () {
    const balanceBefore = await fheStake.balances(alice.address);
    console.log("Alice staked balance trước khi stake:", ethers.formatEther(balanceBefore), "ETH");
    const tx = await fheStake.connect(alice).stake({ value: ethers.parseEther("0.001") });
    const receipt = await tx.wait();
    console.log("Stake tx hash:", receipt?.hash);

    const balanceAfter = await fheStake.balances(alice.address);
    console.log("Alice staked balance sau khi stake:", ethers.formatEther(balanceAfter), "ETH");
    expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("0.001"));
  });

  it("Alice có thể withdraw ETH đã stake", async function () {
    const balanceBefore = await fheStake.balances(alice.address);
    console.log("Balance before withdraw:", ethers.formatEther(balanceBefore));

    const tx = await fheStake.connect(alice).withdraw(balanceBefore);
    const receipt = await tx.wait();
    console.log("Withdraw tx hash:", receipt?.hash);

    const balanceAfter = await fheStake.balances(alice.address);
    console.log("Balance after withdraw:", ethers.formatEther(balanceAfter));
    expect(balanceAfter).to.equal(0n);
  });

  it("Alice có thể claimReward", async function () {
    // Stake lại để tạo reward
    await fheStake.connect(alice).stake({ value: ethers.parseEther("0.001") });

    const pendingReward = await fheStake.earned(alice.address);
    console.log("Pending reward:", ethers.formatEther(pendingReward), "ETH");

    const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);

    const tx = await fheStake.connect(alice).claimReward();
    const receipt = await tx.wait();
    console.log("Claim tx hash:", receipt?.hash);

    const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
    console.log(
      "Alice balance before:",
      ethers.formatEther(aliceBalanceBefore),
      "after:",
      ethers.formatEther(aliceBalanceAfter),
    );

    expect(receipt?.status).to.equal(1);
  });
});
