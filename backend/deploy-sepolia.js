const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Charity contract deployment to Sepolia...");
  
  // Check if we have the required environment variables
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in environment variables!");
    console.log("\n📋 Please create a .env file in the backend directory with:");
    console.log("PRIVATE_KEY=your_private_key_here");
    console.log("SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID");
    console.log("ETHERSCAN_API_KEY=your_etherscan_api_key_here");
    console.log("\n🔗 Get Sepolia ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  if (!process.env.SEPOLIA_RPC_URL && !process.env.ALCHEMY_SEPOLIA_URL) {
    console.error("❌ No Sepolia RPC URL found!");
    console.log("Please set either SEPOLIA_RPC_URL or ALCHEMY_SEPOLIA_URL in your .env file");
    process.exit(1);
  }

  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Deploying to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Check deployer balance
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance for deployment!");
    console.log("🔗 Get Sepolia ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  // Get the contract factory
  const Charity = await ethers.getContractFactory("Charity");
  console.log("📦 Deploying Charity contract...");

  // Deploy the contract
  const charity = await Charity.deploy();
  console.log("⏳ Waiting for deployment confirmation...");

  // Wait for deployment to complete
  await charity.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await charity.getAddress();
  console.log("✅ Charity contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);

  // Get contract ABI from artifacts
  const contractArtifactPath = path.join(__dirname, "artifacts", "contracts", "Charity.sol", "Charity.json");
  const contractArtifact = JSON.parse(fs.readFileSync(contractArtifactPath, "utf8"));
  const abi = contractArtifact.abi;

  // Create frontend/src/abi directory if it doesn't exist
  const frontendAbiDir = path.join(__dirname, "..", "frontend", "src", "abi");
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
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    abiPath: abiPath,
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `charity-sepolia-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Display summary
  console.log("\n" + "=".repeat(80));
  console.log("🎉 SEPOLIA DEPLOYMENT COMPLETE!");
  console.log("=".repeat(80));
  console.log(`Contract: Charity`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network.name} (${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`ABI: ${abiPath}`);
  console.log("=".repeat(80));
  
  console.log("\n📋 Next Steps:");
  console.log("1. Update frontend/src/context/ContractContext.jsx with the new contract address");
  console.log("2. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("3. Test the deployed contract with your frontend");

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
