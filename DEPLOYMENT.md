# Deployment Guide - Chain of Hope DApp

This guide provides step-by-step instructions for deploying the Chain of Hope DApp to various environments.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- MetaMask or compatible wallet
- Access to blockchain RPC endpoints (Infura, Alchemy, etc.)

## 🏠 Local Development Deployment

### Step 1: Setup

```bash
# Clone the repository
git clone <repository-url>
cd chain-of-hope-dapp

# Run automated setup
npm run setup
```

### Step 2: Start Local Environment

```bash
# This will start Hardhat node, deploy contracts, and start frontend
npm start
```

The DApp will be available at `http://localhost:3000`

### Step 3: Connect MetaMask

1. Open MetaMask
2. Add network: `http://localhost:8545`
3. Chain ID: `31337`
4. Import test accounts using private keys from Hardhat console output

## 🌐 Testnet Deployment (Sepolia)

### Step 1: Configure Environment

Create `backend/.env`:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
CHARITY_WALLET_ADDRESS=0xYourCharityWalletAddress
```

### Step 2: Deploy Contracts

```bash
cd backend
npm run deploy:sepolia
```

### Step 3: Update Frontend Configuration

Create `frontend/.env`:

```env
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
REACT_APP_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
REACT_APP_CHAIN_ID=11155111
REACT_APP_NETWORK_NAME=sepolia
```

### Step 4: Build and Deploy Frontend

```bash
cd frontend
npm run build
```

Deploy the `dist` folder to your hosting platform (Vercel, Netlify, etc.).

## 🏭 Mainnet Deployment

### Step 1: Security Checklist

- [ ] Smart contract audited
- [ ] All tests passing
- [ ] Security review completed
- [ ] Charity wallet address verified
- [ ] Emergency procedures documented

### Step 2: Configure Production Environment

Create `backend/.env`:

```env
PRIVATE_KEY=your_production_private_key
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
CHARITY_WALLET_ADDRESS=0xYourProductionCharityWallet
```

### Step 3: Deploy to Mainnet

```bash
cd backend
npm run deploy
```

### Step 4: Verify Contract

```bash
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Step 5: Update Frontend for Production

Create `frontend/.env.production`:

```env
REACT_APP_CONTRACT_ADDRESS=0xYourMainnetContractAddress
REACT_APP_MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id
REACT_APP_CHAIN_ID=1
REACT_APP_NETWORK_NAME=mainnet
```

### Step 6: Build and Deploy

```bash
cd frontend
npm run build
```

Deploy to production hosting platform.

## 🔧 Manual Deployment Steps

### Backend Deployment

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Compile Contracts**
   ```bash
   npm run compile
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Deploy Contracts**
   ```bash
   npm run deploy:sepolia  # For testnet
   npm run deploy          # For mainnet
   ```

### Frontend Deployment

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Deploy to Hosting Platform**

   **Vercel:**
   ```bash
   npx vercel --prod
   ```

   **Netlify:**
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

## 🌍 Environment-Specific Configurations

### Development (localhost)

- Chain ID: `31337`
- RPC URL: `http://localhost:8545`
- Network Name: `localhost`

### Sepolia Testnet

- Chain ID: `11155111`
- RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- Network Name: `sepolia`

### Ethereum Mainnet

- Chain ID: `1`
- RPC URL: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
- Network Name: `mainnet`

## 📝 Post-Deployment Checklist

### Smart Contract

- [ ] Contract deployed successfully
- [ ] Contract verified on Etherscan
- [ ] Charity wallet address set correctly
- [ ] Emergency withdrawal threshold configured
- [ ] Owner permissions transferred (if needed)

### Frontend

- [ ] Contract address updated in environment
- [ ] RPC URLs configured correctly
- [ ] Chain ID matches deployment network
- [ ] Build completed without errors
- [ ] Frontend deployed to hosting platform

### Testing

- [ ] Can connect wallet
- [ ] Can make test donation
- [ ] Dashboard shows correct statistics
- [ ] All pages load correctly
- [ ] Mobile responsiveness verified

## 🔍 Troubleshooting

### Common Issues

1. **"Contract not deployed" error**
   - Verify contract address in frontend `.env`
   - Check network configuration

2. **"Insufficient funds" error**
   - Ensure wallet has enough ETH for gas
   - Check gas price settings

3. **"Network not supported" error**
   - Verify MetaMask network configuration
   - Check chain ID matches environment

4. **Build failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Debug Commands

```bash
# Check contract deployment
cd backend
npx hardhat console --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Check frontend build
cd frontend
npm run build
npm run preview
```

## 📊 Monitoring and Maintenance

### Smart Contract Monitoring

- Monitor contract balance
- Track donation patterns
- Review withdrawal activities
- Set up alerts for large transactions

### Frontend Monitoring

- Monitor user analytics
- Track error rates
- Monitor performance metrics
- Set up uptime monitoring

### Regular Maintenance

- Update dependencies regularly
- Monitor security advisories
- Backup important data
- Review and update documentation

## 🆘 Emergency Procedures

### Smart Contract Emergency

1. **Pause Operations** (if pause functionality exists)
2. **Review Transaction History**
3. **Contact Charity Wallet Owner**
4. **Document Incident**
5. **Implement Fixes**

### Frontend Emergency

1. **Rollback to Previous Version**
2. **Check Error Logs**
3. **Verify Contract Connectivity**
4. **Update Configuration**
5. **Test and Redeploy**

## 📞 Support

For deployment support:
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Contact: support@chainofhope.org
- Discord: [Join our community](https://discord.gg/chainofhope)

---

**Remember: Always test on testnet before mainnet deployment!**
