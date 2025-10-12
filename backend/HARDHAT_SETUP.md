# Hardhat Configuration Guide

## 🚀 Overview

This document outlines the complete Hardhat configuration for the Chain of Hope DApp project, including Solidity 0.8.20, network configurations, and custom tasks.

## ⚙️ Configuration Features

### ✅ Solidity Configuration
- **Version**: 0.8.20
- **Optimizer**: Enabled with 200 runs
- **EVM Version**: Paris
- **Target**: ethereum-v6

### ✅ Network Configuration

#### Hardhat Network (Default)
- **Chain ID**: 31337
- **Gas Limit**: 2,100,000
- **Gas Price**: 8 gwei
- **Block Gas Limit**: 12,000,000
- **Test Accounts**: 20 accounts with 10,000 ETH each

#### Localhost Network
- **URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Private Key**: From environment variable
- **Timeout**: 60 seconds

#### Sepolia Testnet
- **URL**: Supports both Infura and Alchemy
- **Chain ID**: 11155111
- **Gas Price**: 20 gwei
- **Timeout**: 120 seconds
- **Etherscan Integration**: Automatic verification

### ✅ Custom Tasks

#### `deploy`
Deploy contracts to the specified network
```bash
npx hardhat deploy
npx hardhat deploy --network sepolia
npx hardhat deploy --contract charity
```

#### `verify-contract`
Verify contracts on Etherscan
```bash
npx hardhat verify-contract --address 0x...
npx hardhat verify-contract --contract charity
```

#### `accounts`
Display all available accounts with balances
```bash
npx hardhat accounts
```

#### `balance`
Check balance of a specific address
```bash
npx hardhat balance --address 0x...
```

#### `network`
Display current network information
```bash
npx hardhat network
```

### ✅ Environment Variables

Create a `.env` file from `env.example`:

```bash
# Wallet Configuration
PRIVATE_KEY=your_private_key_without_0x_prefix

# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Contract Configuration
CHARITY_WALLET_ADDRESS=0x...

# Development Settings
REPORT_GAS=false
```

## 🛠️ Available Scripts

### Compilation
```bash
npm run compile              # Compile all contracts
npm run clean                # Clean artifacts and cache
npm run clean:all           # Clean everything including typechain
```

### Testing
```bash
npm test                     # Run all tests
npm run test:gas            # Run tests with gas reporting
npm run coverage            # Generate test coverage report
```

### Deployment
```bash
# CharityDonation Contract
npm run deploy:charity-donation           # Deploy to hardhat
npm run deploy:charity-donation:localhost # Deploy to localhost
npm run deploy:charity-donation:sepolia   # Deploy to Sepolia

# Charity Contract
npm run deploy:charity                    # Deploy to hardhat
npm run deploy:charity:localhost          # Deploy to localhost
npm run deploy:charity:sepolia            # Deploy to Sepolia
```

### Verification
```bash
npm run verify                           # Verify contracts
npm run verify:sepolia                   # Verify on Sepolia
```

### Development
```bash
npm run node                             # Start local Hardhat node
npm run node:fork                        # Start forked node from Sepolia
npm run accounts                         # List accounts
npm run network                          # Show network info
```

### Utilities
```bash
npm run typechain                        # Generate TypeScript types
npm run size                             # Show contract sizes
npm run gas                              # Generate gas report
npm run lint                             # Run ESLint
npm run lint:fix                         # Fix ESLint issues
```

## 🌐 Network Setup Instructions

### 1. Local Development

Start a local Hardhat node:
```bash
npm run node
```

In another terminal, deploy contracts:
```bash
npm run deploy:localhost
```

### 2. Sepolia Testnet

1. **Get Test ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request test ETH for your wallet

2. **Configure Environment**:
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Deploy to Sepolia**:
   ```bash
   npm run deploy:sepolia
   ```

4. **Verify Contracts**:
   ```bash
   npm run verify:sepolia
   ```

## 🔧 API Keys Setup

### Infura Setup
1. Visit [Infura.io](https://infura.io/)
2. Create a new project
3. Copy the Project ID
4. Add to `.env`: `SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Alchemy Setup
1. Visit [Alchemy.com](https://www.alchemy.com/)
2. Create a new app
3. Copy the API Key
4. Add to `.env`: `ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### Etherscan Setup
1. Visit [Etherscan.io](https://etherscan.io/apis)
2. Create an account
3. Generate an API key
4. Add to `.env`: `ETHERSCAN_API_KEY=your_api_key`

## 📊 Gas Reporting

Enable gas reporting by setting:
```bash
REPORT_GAS=true
```

Run tests with gas reporting:
```bash
npm run test:gas
```

## 🔍 Contract Verification

### Automatic Verification
Contracts are automatically verified on Etherscan after deployment when:
- Etherscan API key is configured
- Network supports verification
- Contract source code is available

### Manual Verification
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot connect to localhost"**
   - Make sure Hardhat node is running: `npm run node`

2. **"Insufficient funds"**
   - Get test ETH from Sepolia faucet
   - Check wallet balance: `npx hardhat balance --address <YOUR_ADDRESS>`

3. **"Contract verification failed"**
   - Ensure Etherscan API key is correct
   - Wait for block confirmations before verification

4. **"Private key not found"**
   - Check `.env` file exists and contains `PRIVATE_KEY`
   - Ensure private key doesn't have `0x` prefix

### Debug Commands

```bash
npx hardhat accounts                    # Check available accounts
npx hardhat network                     # Check network configuration
npx hardhat balance --address 0x...    # Check specific balance
```

## 📝 Best Practices

1. **Never commit `.env` file** to version control
2. **Use test networks** for development and testing
3. **Verify contracts** after deployment
4. **Monitor gas usage** during development
5. **Use TypeScript** for better development experience
6. **Run tests** before deployment
7. **Keep private keys secure**

## 🔗 Useful Links

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

---

**Happy Coding! 🚀**
