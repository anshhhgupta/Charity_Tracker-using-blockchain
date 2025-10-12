# Sepolia Testnet Deployment Guide

## Prerequisites

1. **MetaMask Wallet** with Sepolia ETH
2. **Alchemy or Infura Account** for RPC endpoint
3. **Etherscan Account** for contract verification

## Step 1: Get Sepolia ETH

1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request Sepolia ETH (you'll need ~0.1 ETH for deployment)

## Step 2: Set Up Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```bash
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (choose one)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# OR
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Etherscan API Key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
SEPOLIA_ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Getting Your Private Key

1. Open MetaMask
2. Click on account details
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key (remove the 0x prefix)

### Getting RPC URL

#### Option A: Infura
1. Go to [Infura](https://infura.io/)
2. Create account and new project
3. Select "Ethereum" network
4. Copy the Sepolia endpoint URL

#### Option B: Alchemy
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create account and new app
3. Select "Ethereum" and "Sepolia" network
4. Copy the HTTP URL

### Getting Etherscan API Key
1. Go to [Etherscan](https://etherscan.io/)
2. Create account
3. Go to API Keys section
4. Create new API key

## Step 3: Deploy to Sepolia

Run the deployment command:

```bash
cd backend
npm run deploy:charity:simple:sepolia
```

## Step 4: Verify Contract (Optional)

After deployment, verify the contract on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Step 5: Update Frontend

The deployment script automatically:
- Exports ABI to `frontend/src/abi/Charity.json`
- Saves deployment info to `backend/deployments/charity-deployment.json`

Update the contract address in your frontend:
1. Open `frontend/src/context/ContractContext.jsx`
2. Update `CONTRACT_ADDRESS` with the deployed address
3. Update the network configuration if needed

## Deployment Output

After successful deployment, you'll see:
- Contract address
- Network information
- Deployer address
- ABI file location
- Deployment info file location

## Troubleshooting

### Common Issues:

1. **Insufficient ETH**: Make sure you have enough Sepolia ETH
2. **Wrong Private Key**: Ensure private key is correct and has 0x prefix removed
3. **RPC Issues**: Verify your RPC URL is correct
4. **Gas Issues**: Try increasing gas limit in deployment script

### Gas Configuration:

The deployment uses:
- Gas Limit: 5,000,000
- Gas Price: 20 gwei (for Sepolia)

You can adjust these in the deployment script if needed.

## Security Notes

- Never commit your `.env` file to version control
- Keep your private key secure
- Use testnet for development only
- Consider using a dedicated deployment wallet
