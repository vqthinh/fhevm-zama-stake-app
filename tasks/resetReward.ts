import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

// Task: resetReward
// Ví dụ sử dụng:
// npx hardhat task:resetReward --address <user_address> --network sepolia

task("task:resetReward", "Reset reward của một user cho FHEStake")
  .addParam("address", "Địa chỉ user cần reset reward")
  .setAction(async (args: TaskArguments, hre) => {
    const { deployments, ethers } = hre;
    const deployment = await deployments.get("FHEStake");
    const contract = await ethers.getContractAt("FHEStake", deployment.address);
    const [deployer] = await ethers.getSigners();
    const tx = await contract.connect(deployer).resetReward(args.address);
    await tx.wait();
    console.log(`Đã reset reward cho user: ${args.address}`);
  });
