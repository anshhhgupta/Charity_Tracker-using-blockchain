const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Charity contract deployment...");

  try {
    // Get the contract factory
    const Charity = await ethers.getContractFactory("Charity");

    console.log("📦 Deploying Charity contract...");

    // Deploy the contract with gas configuration
    const charity = await Charity.deploy({
      gasLimit: 5000000, // 5M gas limit
    });

    // Wait for deployment to complete
    await charity.waitForDeployment();

    // Get the deployed contract address
    const contractAddress = await charity.getAddress();

    console.log("✅ Charity contract deployed successfully!");
    console.log("📍 Contract Address:", contractAddress);

    // Get network information
    const network = await ethers.provider.getNetwork();
    const deployer = await ethers.provider.getSigner();
    const deployerAddress = await deployer.getAddress();

    console.log("🌐 Network:", network.name);
    console.log("👤 Deployer:", deployerAddress);

    // Get contract ABI from artifacts
    const contractArtifactPath = path.join(__dirname, "..", "artifacts", "contracts", "Charity.sol", "Charity.json");
    const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, "utf8"));
    const abi = contractArtifact.abi;

    // Create frontend/src/abi directory if it doesn't exist
    const frontendAbiDir = path.join(__dirname, "..", "..", "frontend", "src", "abi");
    if (!fs.existsSync(frontendAbiDir)) {
      fs.mkdirSync(frontendAbiDir, { recursive: true });
      console.log("📁 Created frontend ABI directory");
    }

    // Write ABI to frontend
    const abiPath = path.join(frontendAbiDir, "Charity.json");
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    console.log("📄 ABI exported to:", abiPath);

    // Create a contract info file for frontend
    const contractInfo = {
      address: contractAddress,
      abi: abi,
      network: network.name,
      chainId: network.chainId.toString(),
      deployedAt: new Date().toISOString(),
      deployer: deployerAddress
    };

    const contractInfoPath = path.join(frontendAbiDir, "CharityInfo.json");
    fs.writeFileSync(contractInfoPath, JSON.stringify(contractInfo, null, 2));
    console.log("📋 Contract info exported to:", contractInfoPath);

    // Save deployment info
    const deploymentInfo = {
      contractName: "Charity",
      contractAddress: contractAddress,
      network: network.name,
      chainId: network.chainId.toString(),
      deployer: deployerAddress,
      deploymentTime: new Date().toISOString(),
      abiPath: abiPath,
      contractInfoPath: contractInfoPath,
      gasUsed: contractArtifact.gasEstimates?.deployment?.totalCost || "N/A"
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    // Save deployment info
    const deploymentFile = path.join(deploymentsDir, `charity-${network.name}-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentFile);

    // Try to verify contract on Etherscan (only for non-local networks)
    if (network.name !== "hardhat" && network.name !== "localhost") {
      try {
        console.log("🔍 Verifying contract on Etherscan...");
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [],
        });
        console.log("✅ Contract verified on Etherscan!");
      } catch (verificationError) {
        console.log("⚠️ Contract verification failed:", verificationError.message);
        console.log("💡 You can verify manually later with:");
        console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);
      }
    }

    // Display summary
    console.log("\n" + "=".repeat(70));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(70));
    console.log(`Contract: Charity`);
    console.log(`Address: ${contractAddress}`);
    console.log(`Network: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`Deployer: ${deployerAddress}`);
    console.log(`ABI: ${abiPath}`);
    console.log(`Info: ${contractInfoPath}`);
    console.log(`Deployment Log: ${deploymentFile}`);
    console.log("=".repeat(70));

    // Test basic contract functionality
    console.log("\n🧪 Testing contract functionality...");
    try {
      const totalCampaigns = await charity.getTotalCampaigns();
      console.log(`✅ Contract is working! Total campaigns: ${totalCampaigns}`);
    } catch (testError) {
      console.log("⚠️ Contract test failed:", testError.message);
    }

    return {
      contractAddress,
      abiPath,
      contractInfoPath,
      deploymentInfo
    };

  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error("Error:", error.message);
    
    if (error.code) {
      console.error("Error Code:", error.code);
    }
    
    if (error.transaction) {
      console.error("Transaction:", error.transaction);
    }
    
    throw error;
  }
}

// Execute deployment
main()
  .then(() => {
    console.log("\n✨ All done! Your Charity contract is ready to use.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed with error:");
    console.error(error);
    process.exit(1);
  });
