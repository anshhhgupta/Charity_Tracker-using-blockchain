# Deployment Scripts

This directory contains deployment scripts for the Chain of Hope DApp smart contracts.

## Available Scripts

### Charity Contract Deployment

#### 1. Simple Deployment (`deploy-charity-simple.js`)
Basic deployment script that:
- Deploys the Charity contract
- Logs the contract address
- Exports ABI to `frontend/src/abi/Charity.json`
- Saves deployment info

**Usage:**
```bash
npm run deploy:charity:simple
npm run deploy:charity:simple:localhost
npm run deploy:charity:simple:sepolia
```

#### 2. Advanced Deployment (`deploy-charity-advanced.js`)
Comprehensive deployment script that:
- Deploys the Charity contract
- Logs detailed deployment information
- Exports ABI to `frontend/src/abi/Charity.json`
- Creates contract info file `frontend/src/abi/CharityInfo.json`
- Attempts automatic Etherscan verification
- Tests contract functionality after deployment
- Enhanced error handling and logging

**Usage:**
```bash
npm run deploy:charity:advanced
npm run deploy:charity:advanced:localhost
npm run deploy:charity:advanced:sepolia
```

#### 3. TypeScript Deployment (`deploy-charity.ts`)
TypeScript deployment script with full type safety.

**Usage:**
```bash
npm run deploy:charity
npm run deploy:charity:localhost
npm run deploy:charity:sepolia
```

### CharityDonation Contract Deployment

#### TypeScript Deployment (`deploy.ts`)
Deploys the CharityDonation contract with charity information.

**Usage:**
```bash
npm run deploy:charity-donation
npm run deploy:charity-donation:localhost
npm run deploy:charity-donation:sepolia
```

## Generated Files

After deployment, the following files are created:

### Frontend Files
- `frontend/src/abi/Charity.json` - Contract ABI
- `frontend/src/abi/CharityInfo.json` - Complete contract info (address, ABI, network, etc.)

### Backend Files
- `backend/deployments/charity-{network}-{timestamp}.json` - Deployment information

## Environment Setup

Before deploying to testnets, ensure your `.env` file is configured:

```env
PRIVATE_KEY=your_private_key_without_0x_prefix
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Deployment Examples

### Local Development
```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy to localhost
npm run deploy:charity:simple:localhost
```

### Sepolia Testnet
```bash
# Deploy to Sepolia testnet
npm run deploy:charity:advanced:sepolia
```

### Mainnet (Production)
```bash
# Deploy to mainnet (ensure proper configuration)
npm run deploy:charity:advanced --network mainnet
```

## Contract Addresses

After deployment, the contract address will be logged and saved to:
- Console output
- Deployment info JSON file
- Frontend contract info file

## Verification

Contracts deployed to testnets/mainnet will be automatically verified on Etherscan if:
- `ETHERSCAN_API_KEY` is set in `.env`
- Network supports verification
- Contract source code is available

Manual verification:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Troubleshooting

### Gas Issues
If deployment fails with "out of gas":
- Check gas limit in script (currently set to 5M)
- Increase gas limit if needed
- Check network gas prices

### ABI Export Issues
If ABI export fails:
- Ensure contracts are compiled: `npm run compile`
- Check file permissions
- Verify frontend directory structure

### Network Issues
If network connection fails:
- Check RPC URL in `.env`
- Verify network configuration in `hardhat.config.ts`
- Ensure sufficient test ETH for gas fees

## Best Practices

1. **Always test locally first** before deploying to testnets
2. **Verify contracts** after deployment for transparency
3. **Save deployment info** for future reference
4. **Use environment variables** for sensitive data
5. **Test contract functionality** after deployment
6. **Keep deployment logs** for audit purposes

---

For more information, see the main [HARDHAT_SETUP.md](../HARDHAT_SETUP.md) file.
