import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  console.log("Starting deployment of Chain of Hope charity donation contract...");

  // Get the contract factory
  const CharityDonation = await ethers.getContractFactory("CharityDonation");

  // Charity information
  const charityWallet = process.env.CHARITY_WALLET_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Default to a test address
  const charityName = "Chain of Hope Foundation";
  const charityDescription = "A transparent blockchain-based charity platform for humanitarian aid and disaster relief";
  const charityWebsite = "https://chainofhope.org";

  console.log("Deploying contract with the following parameters:");
  console.log("- Charity Wallet:", charityWallet);
  console.log("- Charity Name:", charityName);
  console.log("- Description:", charityDescription);
  console.log("- Website:", charityWebsite);

  // Deploy the contract
  const charityContract = await CharityDonation.deploy(
    charityWallet,
    charityName,
    charityDescription,
    charityWebsite
  );

  await charityContract.waitForDeployment();

  const contractAddress = await charityContract.getAddress();

  console.log("✅ CharityDonation contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Charity Wallet:", charityWallet);
  console.log("Network:", network.name);

  // Verify contract on Etherscan if not on localhost
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations before verification...");
    await charityContract.deploymentTransaction().wait(6);

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          charityWallet,
          charityName,
          charityDescription,
          charityWebsite
        ],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("⚠️ Contract verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    charityWallet,
    charityName,
    charityDescription,
    charityWebsite,
    network: network.name,
    deployer: (await ethers.provider.getSigner()).address,
    deploymentTime: new Date().toISOString(),
  };

  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n📁 Deployment info saved to: ${deploymentFile}`);

  // Display useful information
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Charity Name: ${charityName}`);
  console.log(`Charity Wallet: ${charityWallet}`);
  console.log("=".repeat(60));

  return {
    contractAddress,
    charityWallet,
    charityName,
    charityDescription,
    charityWebsite,
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
