import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // set reward rate (tùy chỉnh theo nhu cầu)
  const rewardRate = "1"; // 1e12 wei

  const deployedFHEStake = await deploy("FHEStake", {
    from: deployer,
    args: [rewardRate], // 👈 truyền constructor argument
    log: true,
  });

  console.log(`FHEStake deployed at:`, deployedFHEStake.address);
};

export default func;
func.id = "deploy_fheStake";
func.tags = ["FHEStake"];
