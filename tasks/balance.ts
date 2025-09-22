import { task } from "hardhat/config";

task("balance", "Print account balance").setAction(async (_, hre) => {
  const [signer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Address: ${signer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
});
