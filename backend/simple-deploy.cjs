const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log('🚀 Starting simple Charity contract deployment to Sepolia...');
  
  // Check environment variables
  if (!process.env.PRIVATE_KEY || !process.env.SEPOLIA_RPC_URL) {
    console.error('❌ Missing required environment variables!');
    console.log('Please make sure your .env file contains:');
    console.log('PRIVATE_KEY=your_private_key');
    console.log('SEPOLIA_RPC_URL=your_sepolia_rpc_url');
    process.exit(1);
  }

  // Connect to network
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log(`👤 Deployer: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance < ethers.parseEther('0.01')) {
    console.error('❌ Insufficient balance for deployment!');
    process.exit(1);
  }

  // Get network info
  const network = await provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Read the compiled contract
  const contractPath = path.join(__dirname, 'artifacts', 'contracts', 'Charity.sol', 'Charity.json');
  
  if (!fs.existsSync(contractPath)) {
    console.error('❌ Contract not compiled! Please run: npx hardhat compile');
    process.exit(1);
  }

  const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  
  // Create contract factory
  const factory = new ethers.ContractFactory(contractArtifact.abi, contractArtifact.bytecode, wallet);
  
  console.log('📦 Deploying Charity contract...');
  
  // Deploy contract
  const contract = await factory.deploy();
  console.log('⏳ Waiting for deployment...');
  
  // Wait for deployment
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log('✅ Contract deployed successfully!');
  console.log('📍 Contract Address:', contractAddress);
  
  // Save ABI for frontend
  const frontendAbiDir = path.join(__dirname, '..', 'frontend', 'src', 'abi');
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }
  
  const abiPath = path.join(frontendAbiDir, 'Charity.json');
  fs.writeFileSync(abiPath, JSON.stringify(contractArtifact.abi, null, 2));
  console.log('📄 ABI exported to:', abiPath);
  
  // Save deployment info
  const deploymentInfo = {
    contractName: 'Charity',
    contractAddress: contractAddress,
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: wallet.address,
    deploymentTime: new Date().toISOString(),
    abiPath: abiPath,
    etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
  };
  
  const deploymentsDir = path.join(__dirname, 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, 'charity-deployment.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log('💾 Deployment info saved to:', deploymentFile);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEPLOYMENT COMPLETE!');
  console.log('='.repeat(60));
  console.log(`Contract: Charity`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log('='.repeat(60));
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\n🎯 Contract deployed at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  });