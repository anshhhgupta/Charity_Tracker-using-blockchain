const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Charity Contract (Final Version)...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("⏳ Deploying Charity contract...");
  const Charity = await hre.ethers.getContractFactory("contracts/Charity-Final.sol:Charity");
  const charity = await Charity.deploy();

  await charity.waitForDeployment();
  const charityAddress = await charity.getAddress();

  console.log("✅ Charity contract deployed to:", charityAddress);
  console.log("👤 Contract owner:", await charity.owner());
  console.log("📊 Initial campaign count:", await charity.campaignCount());
  console.log("💵 Initial contract balance:", hre.ethers.formatEther(await charity.getContractBalance()), "ETH\n");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: charityAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  console.log("📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network:          ", deploymentInfo.network);
  console.log("Contract Address: ", deploymentInfo.contractAddress);
  console.log("Deployer:         ", deploymentInfo.deployer);
  console.log("Block Number:     ", deploymentInfo.blockNumber);
  console.log("Deployment Time:  ", deploymentInfo.deploymentTime);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Wait for block confirmations on non-local networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await charity.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!\n");

    // Verify contract on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
      console.log("🔍 Verifying contract on Etherscan...");
      try {
        await hre.run("verify:verify", {
          address: charityAddress,
          constructorArguments: [],
        });
        console.log("✅ Contract verified on Etherscan!\n");
      } catch (error) {
        if (error.message.includes("Already Verified")) {
          console.log("ℹ️  Contract already verified on Etherscan\n");
        } else {
          console.error("❌ Error verifying contract:", error.message, "\n");
        }
      }
    }
  }

  // Create a sample campaign for testing (only on local/testnet)
  if (hre.network.name === "hardhat" || hre.network.name === "localhost" || hre.network.name === "sepolia") {
    console.log("🎯 Creating sample campaign for testing...");

    const campaignName = "Emergency Relief Fund";
    const campaignDescription = "Providing immediate aid to disaster victims in affected regions";
    const campaignGoal = hre.ethers.parseEther("10");
    const campaignDeadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now

    const tx = await charity.createCampaign(
      campaignName,
      campaignDescription,
      campaignGoal,
      campaignDeadline
    );

    await tx.wait();

    console.log("✅ Sample campaign created!");
    console.log("   Campaign ID: 0");
    console.log("   Name:", campaignName);
    console.log("   Goal:", hre.ethers.formatEther(campaignGoal), "ETH");
    console.log("   Deadline:", new Date(campaignDeadline * 1000).toLocaleDateString(), "\n");
  }

  // Display next steps
  console.log("📝 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Update frontend .env with contract address:");
  console.log("   VITE_CONTRACT_ADDRESS=" + charityAddress);
  console.log("\n2. Update frontend ABI:");
  console.log("   Copy: artifacts/contracts/Charity.sol/Charity.json");
  console.log("   To:   frontend/src/abi/Charity.json");
  console.log("\n3. Test the contract:");
  console.log("   npx hardhat test test/Charity-Final.test.js");
  console.log("\n4. Interact with the contract:");
  console.log("   npx hardhat console --network", hre.network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info to file
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `charity-final-${hre.network.name}.json`
  );

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile, "\n");

  console.log("🎉 Deployment complete!\n");

  return charityAddress;
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
