// Simple deployment script that can be run with environment variables
// Usage: PRIVATE_KEY=your_key SEPOLIA_RPC_URL=your_url node deploy-with-env.js

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Charity contract deployment to Sepolia...");
  
  // Check environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY environment variable not set!");
    console.log("Usage: PRIVATE_KEY=your_key SEPOLIA_RPC_URL=your_url node deploy-with-env.js");
    process.exit(1);
  }
  
  if (!rpcUrl) {
    console.error("❌ SEPOLIA_RPC_URL environment variable not set!");
    console.log("Usage: PRIVATE_KEY=your_key SEPOLIA_RPC_URL=your_url node deploy-with-env.js");
    process.exit(1);
  }

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`👤 Deployer: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
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
  const charity = await Charity.connect(wallet).deploy();
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
    network: "sepolia",
    chainId: "11155111",
    deployer: wallet.address,
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
  console.log(`Network: Sepolia (11155111)`);
  console.log(`Deployer: ${wallet.address}`);
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
