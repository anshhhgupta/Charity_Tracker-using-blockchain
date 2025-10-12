const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log("🔧 Setting up environment variables for Sepolia deployment...\n");
  
  console.log("📋 You'll need:");
  console.log("1. Your wallet's private key (without 0x prefix)");
  console.log("2. Sepolia RPC URL from Infura or Alchemy");
  console.log("3. Etherscan API key (optional, for verification)\n");
  
  const privateKey = await question("🔑 Enter your private key (without 0x): ");
  const rpcUrl = await question("🌐 Enter Sepolia RPC URL: ");
  const etherscanKey = await question("🔍 Enter Etherscan API key (optional): ");
  
  const envContent = `# Environment variables for Sepolia deployment
PRIVATE_KEY=${privateKey}
SEPOLIA_RPC_URL=${rpcUrl}
ETHERSCAN_API_KEY=${etherscanKey}
SEPOLIA_ETHERSCAN_API_KEY=${etherscanKey}

# Optional: Gas reporting
REPORT_GAS=false
`;

  const envPath = path.join(__dirname, ".env");
  fs.writeFileSync(envPath, envContent);
  
  console.log("\n✅ .env file created successfully!");
  console.log("📍 Location:", envPath);
  console.log("\n🚀 You can now run: node deploy-sepolia.js");
  
  rl.close();
}

setupEnvironment().catch(console.error);
