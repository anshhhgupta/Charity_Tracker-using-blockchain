import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  console.log("Starting deployment of Charity contract...");

  // Get the contract factory
  const Charity = await ethers.getContractFactory("Charity");

  console.log("Deploying Charity contract...");

  // Deploy the contract
  const charityContract = await Charity.deploy();

  await charityContract.waitForDeployment();

  const contractAddress = await charityContract.getAddress();

  console.log("✅ Charity contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);

  // Verify contract on Etherscan if not on localhost
  const network = await ethers.provider.getNetwork();
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations before verification...");
    await charityContract.deploymentTransaction()?.wait(6);

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    contractName: "Charity",
    network: network.name,
    deployer: (await ethers.provider.getSigner()).address,
    deploymentTime: new Date().toISOString(),
    constructorArgs: [],
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `charity-${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n📁 Deployment info saved to: ${deploymentFile}`);

  // Display useful information
  console.log("\n" + "=".repeat(60));
  console.log("🎉 CHARITY CONTRACT DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Contract Name: Charity`);
  console.log("=".repeat(60));

  return {
    contractAddress,
    contractName: "Charity",
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
