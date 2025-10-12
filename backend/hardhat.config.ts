import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Custom Hardhat tasks

task("deploy", "Deploy contracts to the specified network")
  .addOptionalParam("contract", "Contract name to deploy", "")
  .setAction(async (taskArgs, hre) => {
    console.log(`🚀 Deploying contracts to ${hre.network.name}...`);
    
    if (taskArgs.contract) {
      // Deploy specific contract
      await hre.run("deploy:" + taskArgs.contract);
    } else {
      // Deploy all contracts
      await hre.run("deploy:charity-donation");
      await hre.run("deploy:charity");
    }
    
    console.log("✅ Deployment complete!");
  });

task("verify-contract", "Verify contracts on Etherscan")
  .addOptionalParam("address", "Contract address to verify", "")
  .addOptionalParam("contract", "Contract name to verify", "")
  .setAction(async (taskArgs, hre) => {
    console.log(`🔍 Verifying contracts on ${hre.network.name}...`);
    
    if (taskArgs.address) {
      // Verify specific contract by address
      await hre.run("verify:verify", {
        address: taskArgs.address,
      });
    } else if (taskArgs.contract) {
      // Verify specific contract by name
      await hre.run("verify:" + taskArgs.contract);
    } else {
      // Verify all contracts
      await hre.run("verify:all");
    }
    
    console.log("✅ Verification complete!");
  });

task("accounts", "Print the list of accounts")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    console.log("📋 Available accounts:");
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const balance = await hre.ethers.provider.getBalance(account.address);
      console.log(`Account ${i}: ${account.address} (${hre.ethers.formatEther(balance)} ETH)`);
    }
  });

task("balance", "Get balance of an address")
  .addParam("address", "Address to check balance for")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.address);
    console.log(`💰 Balance of ${taskArgs.address}: ${hre.ethers.formatEther(balance)} ETH`);
  });

task("network", "Get current network information")
  .setAction(async (taskArgs, hre) => {
    const network = await hre.ethers.provider.getNetwork();
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    const feeData = await hre.ethers.provider.getFeeData();
    
    console.log("🌐 Network Information:");
    console.log(`Name: ${network.name}`);
    console.log(`Chain ID: ${network.chainId}`);
    console.log(`Block Number: ${blockNumber}`);
    if (feeData.gasPrice) {
      console.log(`Gas Price: ${hre.ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
    }
    if (feeData.maxFeePerGas) {
      console.log(`Max Fee Per Gas: ${hre.ethers.formatUnits(feeData.maxFeePerGas, "gwei")} gwei`);
    }
    if (feeData.maxPriorityFeePerGas) {
      console.log(`Max Priority Fee Per Gas: ${hre.ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei")} gwei`);
    }
  });

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 2100000,
      gasPrice: 8000000000,
      blockGasLimit: 12000000,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        initialIndex: 0,
        path: "m/44'/60'/0'/0",
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 60000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : undefined,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || process.env.ALCHEMY_SEPOLIA_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 20000000000, // 20 gwei
      timeout: 120000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.etherscan.io/api",
        },
      },
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || process.env.SEPOLIA_ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
    dontOverrideCompile: false,
  },
};

export default config;
