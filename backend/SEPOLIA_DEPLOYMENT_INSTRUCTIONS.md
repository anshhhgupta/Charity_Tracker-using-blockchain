# 🚀 Sepolia Testnet Deployment Instructions

## ⚠️ IMPORTANT: You need to set up environment variables first!

The deployment failed because the RPC URL is not configured. Follow these steps:

## Step 1: Get Required Credentials

### 1.1 Get Sepolia ETH
- Go to [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your wallet address
- Request Sepolia ETH (you need ~0.1 ETH for deployment)

### 1.2 Get RPC URL (Choose one)

#### Option A: Infura (Recommended)
1. Go to [Infura](https://infura.io/)
2. Create account and new project
3. Select "Ethereum" network
4. Copy the Sepolia endpoint URL (looks like: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`)

#### Option B: Alchemy
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create account and new app
3. Select "Ethereum" and "Sepolia" network
4. Copy the HTTP URL (looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`)

### 1.3 Get Etherscan API Key (Optional)
1. Go to [Etherscan](https://etherscan.io/)
2. Create account
3. Go to API Keys section
4. Create new API key

## Step 2: Create Environment File

Create a file named `.env` in the `backend` directory with this content:

```bash
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (replace with your actual URL)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Etherscan API Key (optional, for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
SEPOLIA_ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### How to get your private key:
1. Open MetaMask
2. Click on account details
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key (remove the 0x prefix)

## Step 3: Deploy to Sepolia

Once you have the `.env` file set up, run:

```bash
npx hardhat run scripts/deploy-charity-simple.js --network sepolia
```

## Step 4: Verify Contract (Optional)

After deployment, verify the contract on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Step 5: Update Frontend

The deployment script will automatically:
- Export ABI to `frontend/src/abi/Charity.json`
- Save deployment info to `backend/deployments/charity-deployment.json`

Then update your frontend:
1. Open `frontend/src/context/ContractContext.jsx`
2. Update `CONTRACT_ADDRESS` with the deployed address
3. Update the network configuration if needed

## Expected Output

After successful deployment, you'll see:
```
🚀 Starting Charity contract deployment...
📦 Deploying Charity contract...
✅ Charity contract deployed successfully!
📍 Contract Address: 0x...
📄 ABI exported to: .../frontend/src/abi/Charity.json
💾 Deployment info saved to: .../backend/deployments/charity-deployment.json

============================================================
🎉 DEPLOYMENT COMPLETE!
============================================================
Contract: Charity
Address: 0x...
Network: sepolia
Deployer: 0x...
ABI: .../frontend/src/abi/Charity.json
============================================================
```

## Troubleshooting

### Common Issues:

1. **"Invalid project id"**: Check your RPC URL in `.env` file
2. **"Insufficient balance"**: Get more Sepolia ETH from faucet
3. **"Invalid private key"**: Make sure private key doesn't have 0x prefix
4. **"Network not found"**: Make sure you're using `--network sepolia`

### Gas Configuration:
- Gas Limit: 5,000,000
- Gas Price: 20 gwei (for Sepolia)

## Security Notes

- Never commit your `.env` file to version control
- Keep your private key secure
- Use testnet for development only
- Consider using a dedicated deployment wallet

## Next Steps After Deployment

1. **Test the contract** with your frontend
2. **Verify on Etherscan** for transparency
3. **Update documentation** with the new contract address
4. **Test all functions** (create campaign, donate, etc.)
