const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Charity contract deployment...");

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

  // Get contract ABI from artifacts
  const contractArtifactPath = path.join(__dirname, "..", "artifacts", "contracts", "Charity.sol", "Charity.json");
  const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, "utf8"));
  const abi = contractArtifact.abi;

  // Create frontend/src/abi directory if it doesn't exist
  const frontendAbiDir = path.join(__dirname, "..", "..", "frontend", "src", "abi");
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }

  // Write ABI to frontend
  const abiPath = path.join(frontendAbiDir, "Charity.json");
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

  console.log("📄 ABI exported to:", abiPath);

  // Save deployment info
  const deploymentInfo = {
    contractName: "Charity",
    contractAddress: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    deployer: (await ethers.provider.getSigner()).address,
    deploymentTime: new Date().toISOString(),
    abiPath: abiPath
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, "charity-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("💾 Deployment info saved to:", deploymentFile);

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log(`Contract: Charity`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`ABI: ${abiPath}`);
  console.log("=".repeat(60));

  return {
    contractAddress,
    abiPath,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
