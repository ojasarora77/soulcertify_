import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the Certificate contract
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployCertificate: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Certificate", {
    from: deployer,
    // Constructor arguments
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract
  const certificate = await hre.ethers.getContract<Contract>("Certificate", deployer);
  console.log("Certificate contract deployed at:", await certificate.getAddress());
};

export default deployCertificate;

// Tags are useful if you have multiple deploy files and only want to run one of them.
deployCertificate.tags = ["Certificate"];