import { task } from "hardhat/config";

// Usage:
// npx hardhat setRewardRate --rate 50000000000 --contract <address> --network sepolia

task("setRewardRate", "Set reward rate for FHEStake contract")
  .addParam("rate", "Reward rate in wei per second per wei staked")
  .addParam("contract", "Contract address")
  .setAction(async ({ rate, contract }, hre) => {
    const [owner] = await hre.ethers.getSigners();
    const FHEStake = await hre.ethers.getContractAt("FHEStake", contract, owner);
    const tx = await FHEStake.setRewardRate(rate);
    await tx.wait();
    console.log(`Reward rate set to ${rate} for contract ${contract}`);
  });

export default {};
