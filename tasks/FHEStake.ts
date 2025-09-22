import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
// ...existing code...

function listAvailableFunctions(contract: import("ethers").Contract) {
  return contract.interface.fragments
    .filter((f: { type: string; name?: string }) => f.type === "function")
    .map((f: { type: string; name?: string }) => f.name ?? "");
}

task("task:address", "Prints the FHEStake address").setAction(async (_, hre) => {
  const { deployments } = hre;
  const deployment = await deployments.get("FHEStake");
  console.log("FHEStake address is " + deployment.address);
});

task("task:stake", "Stake ETH into FHEStake")
  .addParam("value", "Amount of ETH to stake (in ether)")
  .addOptionalParam("address", "Optionally specify the FHEStake contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { deployments } = hre;

    const deployment = await deployments.get("FHEStake");
    const contractAddress = args.address || deployment.address;
    const contract = await hre.ethers.getContractAt(deployment.abi, contractAddress);

    const candidates = ["stake", "stakePlain", "deposit"];
    const fn = candidates.find((n) => {
      try {
        contract.interface.getFunction(n);
        return true;
      } catch {
        return false;
      }
    });

    if (!fn) {
      console.error("No stake function found. Available:");
      console.log(listAvailableFunctions(contract));
      throw new Error("Missing stake function");
    }

    const tx = await contract[fn]({
      value: hre.ethers.parseEther(args.value),
    });
    console.log(`tx:${tx.hash} waiting...`);
    await tx.wait();
    console.log(`Staked ${args.value} ETH with ${fn}`);
  });

task("task:withdraw", "Withdraw ETH")
  .addParam("value", "Amount of ETH to withdraw (in ether)")
  .addOptionalParam("address", "Optionally specify the FHEStake contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { deployments } = hre;

    const deployment = await deployments.get("FHEStake");
    const contractAddress = args.address || deployment.address;
    const contract = await hre.ethers.getContractAt(deployment.abi, contractAddress);

    const candidates = ["withdraw", "unstake"];
    const fn = candidates.find((n) => {
      try {
        contract.interface.getFunction(n);
        return true;
      } catch {
        return false;
      }
    });

    if (!fn) {
      console.error("No withdraw function found. Available:");
      console.log(listAvailableFunctions(contract));
      throw new Error("Missing withdraw function");
    }

    const amount = hre.ethers.parseEther(args.value);
    const tx = await contract[fn](amount);
    console.log(`tx:${tx.hash} waiting...`);
    await tx.wait();
    console.log(`Withdrew ${args.value} ETH with ${fn}`);
  });

task("task:claim", "Claim rewards")
  .addOptionalParam("address", "Optionally specify the FHEStake contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { deployments } = hre;

    const deployment = await deployments.get("FHEStake");
    const contractAddress = args.address || deployment.address;
    const contract = await hre.ethers.getContractAt(deployment.abi, contractAddress);

    const candidates = ["claimReward", "claim", "getReward"];
    const fn = candidates.find((n) => {
      try {
        contract.interface.getFunction(n);
        return true;
      } catch {
        return false;
      }
    });

    if (!fn) {
      console.error("No claim function found. Available:");
      console.log(listAvailableFunctions(contract));
      throw new Error("Missing claim function");
    }

    const tx = await contract[fn]();
    console.log(`tx:${tx.hash} waiting...`);
    await tx.wait();
    console.log(`Claimed rewards with ${fn}`);
  });
