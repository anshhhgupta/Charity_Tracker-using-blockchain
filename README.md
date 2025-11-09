# Chain of Hope - Blockchain Charity DApp

A transparent, decentralized charity donation platform built on Ethereum blockchain with real-time updates.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Usage](#usage)
- [Smart Contract](#smart-contract)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Chain of Hope is a blockchain-based charity platform that enables transparent donations with complete accountability. All transactions are recorded on the Ethereum blockchain, ensuring trust and transparency.

**Deployed Contract (Sepolia):** `0x379A63482A2401a0d1b30f57921A58dEAB022aC6`

---

## ✨ Features

### Core Features
- ✅ **Create Campaigns** - Start fundraising campaigns with goals and deadlines
- ✅ **Make Donations** - Donate ETH to campaigns securely
- ✅ **Real-Time Updates** - See donations and balances update instantly
- ✅ **Campaign Management** - Track progress, donors, and expenditures
- ✅ **Admin Panel** - Manage campaigns and request expenditures
- ✅ **Transparent Tracking** - All transactions visible on blockchain

### Technical Features
- ✅ Real-time event listeners for instant UI updates
- ✅ MetaMask integration for wallet connectivity
- ✅ Network guard to ensure correct blockchain network
- ✅ Responsive design for mobile and desktop
- ✅ Gas-optimized smart contracts
- ✅ Comprehensive error handling

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Ethers.js v6** - Ethereum interaction
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend/Blockchain
- **Solidity 0.8.25** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Security libraries
- **Ethers.js** - Contract deployment

### Network
- **Sepolia Testnet** - Testing environment
- **Infura** - RPC provider

---

## 📁 Project Structure

```
chain-of-hope-dapp/
├── backend/
│   ├── contracts/
│   │   ├── Charity-Final.sol      # Main smart contract
│   │   └── Charity.sol            # Backup contract
│   ├── scripts/
│   │   ├── deploy-charity-final.js
│   │   ├── test-deployed-contract.js
│   │   └── test-create-campaign.js
│   ├── test/
│   │   ├── Charity-Final.test.js
│   │   └── Charity-Comprehensive.test.js
│   ├── hardhat.config.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── config/            # Configuration files
│   │   └── abi/               # Contract ABI
│   ├── package.json
│   └── .env
├── deploy-to-sepolia.ps1      # Deployment script
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v16 or higher)
2. **MetaMask** browser extension
3. **Test ETH** on Sepolia network
4. **API Keys:**
   - Infura Project ID
   - Etherscan API Key

### Get Test ETH
Visit: https://sepoliafaucet.com/

### Get API Keys
- **Infura:** https://infura.io/
- **Etherscan:** https://etherscan.io/myapikey

---

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd chain-of-hope-dapp
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure Backend Environment
Create `backend/.env`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=0xyour_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 5. Configure Frontend Environment
Create `frontend/.env`:
```env
VITE_CONTRACT_ADDRESS=0x379A63482A2401a0d1b30f57921A58dEAB022aC6
VITE_NETWORK_ID=11155111
VITE_NETWORK=sepolia
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

---

## 🌐 Deployment

### Deploy Smart Contract

#### Option 1: Using PowerShell Script (Windows)
```powershell
.\deploy-to-sepolia.ps1
```

#### Option 2: Manual Deployment
```bash
cd backend

# Compile contract
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy-charity-final.js --network sepolia
```

**Save the deployed contract address!**

### Update Frontend Configuration
After deployment, update `frontend/.env` with your contract address:
```env
VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

### Copy Contract ABI
```bash
# Windows PowerShell
Copy-Item backend/artifacts/contracts/Charity-Final.sol/Charity.json frontend/src/abi/Charity.json -Force

# Linux/Mac
cp backend/artifacts/contracts/Charity-Final.sol/Charity.json frontend/src/abi/Charity.json
```

### Start Frontend
```bash
cd frontend
npm run dev
```

Access at: http://localhost:3000/

---

## 🧪 Testing

### Backend Tests

#### Run All Tests
```bash
cd backend
npx hardhat test
```

#### Run Specific Test File
```bash
npx hardhat test test/Charity-Final.test.js
```

#### Test with Gas Reporting
```bash
REPORT_GAS=true npx hardhat test
```

#### Test Deployed Contract
```bash
npx hardhat run scripts/test-deployed-contract.js --network sepolia
```

### Test Results
- **Total Tests:** 47
- **Status:** All Passing ✅
- **Coverage:** Deployment, Campaigns, Donations, Expenditures, Security

### Frontend Tests
```bash
cd frontend
node test-frontend.js
```

---

## 💻 Usage

### For Users

#### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve MetaMask connection
- **Important:** Switch to Sepolia network

#### 2. View Campaigns
- Navigate to "Campaigns" page
- Browse available campaigns
- Click on a campaign to view details

#### 3. Make a Donation
- Select a campaign
- Enter donation amount (in ETH)
- Click "Donate Now"
- Confirm transaction in MetaMask
- Wait for confirmation (~15-30 seconds)
- See balance update in real-time!

### For Campaign Creators

#### 1. Create Campaign
- Navigate to "Create Campaign"
- Fill in details:
  - Campaign Name
  - Description
  - Goal (in ETH)
  - Duration (in days)
- Click "Create Campaign"
- Confirm transaction in MetaMask

#### 2. Manage Campaign
- Go to "Admin Panel"
- View your campaigns
- Request expenditures
- Track donations and progress

---

## 📜 Smart Contract

### Contract Details
- **Name:** Charity
- **Solidity Version:** 0.8.25
- **Network:** Sepolia Testnet
- **Address:** `0x379A63482A2401a0d1b30f57921A58dEAB022aC6`

### Main Functions

#### Public Functions
```solidity
// Create a new campaign
function createCampaign(
    string calldata name,
    string calldata description,
    uint256 goal,
    uint256 deadline
) external returns (uint256 campaignId)

// Donate to a campaign
function donate(uint256 campaignId, uint256 deadline) external payable

// Request expenditure (campaign admin only)
function requestExpenditure(
    uint256 campaignId,
    uint256 amount,
    address recipient,
    string calldata purpose
) external

// Execute expenditure (campaign admin only)
function executeExpenditure(
    uint256 campaignId,
    uint256 expenditureId
) external
```

#### View Functions
```solidity
// Get campaign details
function getCampaign(uint256 campaignId) external view returns (...)

// Get campaign progress percentage
function getCampaignProgress(uint256 campaignId) external view returns (uint256)

// Check if campaign is active
function isCampaignActive(uint256 campaignId) external view returns (bool)

// Get contract balance
function getContractBalance() external view returns (uint256)

// Get campaign expenditures
function getCampaignExpenditures(uint256 campaignId) external view returns (...)
```

### Events
```solidity
event CampaignCreated(uint256 indexed campaignId, address indexed admin, string name, uint256 goal, uint256 deadline)
event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)
event ExpenditureRequested(uint256 indexed campaignId, uint256 indexed expenditureId, uint256 amount, address recipient, string purpose)
event ExpenditureExecuted(uint256 indexed campaignId, uint256 indexed expenditureId, uint256 amount)
```

### Security Features
- ✅ ReentrancyGuard (OpenZeppelin)
- ✅ Ownable pattern
- ✅ Input validation
- ✅ Access control
- ✅ Safe math operations
- ✅ Event emissions for transparency

### Gas Optimization
- Campaign creation: ~209K gas
- Donations: ~50K gas
- Expenditure requests: ~124K gas
- Expenditure execution: ~74K gas

---

## 🔧 Troubleshooting

### Common Issues

#### "Contract Not Initialized"
**Problem:** Contract shows as not initialized in debug panel

**Solution:**
1. Check you're on Sepolia network (Chain ID: 11155111)
2. Switch network in MetaMask
3. Refresh the page

#### "Wrong Network" Warning
**Problem:** App shows "Wrong Network" screen

**Solution:**
1. Click "Switch to Sepolia" button
2. Or manually switch in MetaMask:
   - Open MetaMask
   - Click network dropdown
   - Select "Sepolia test network"

#### "Insufficient Funds"
**Problem:** Transaction fails due to insufficient funds

**Solution:**
1. Get test ETH from faucet: https://sepoliafaucet.com/
2. Ensure you have at least 0.1 ETH for testing

#### "Transaction Failed"
**Problem:** Transaction reverts or fails

**Possible Causes:**
- Campaign expired
- Insufficient gas
- Invalid parameters
- Not campaign admin (for admin functions)

**Solution:**
1. Check campaign is still active
2. Increase gas limit
3. Verify you're the campaign admin
4. Check transaction details on Etherscan

#### Frontend Not Loading
**Problem:** Blank page or errors

**Solution:**
1. Check console for errors (F12)
2. Verify `.env` file exists and is correct
3. Ensure dependencies are installed: `npm install`
4. Clear browser cache
5. Restart development server

#### MetaMask Not Connecting
**Problem:** Wallet won't connect

**Solution:**
1. Refresh the page
2. Unlock MetaMask
3. Check MetaMask is installed
4. Try disconnecting and reconnecting
5. Clear MetaMask cache in settings

---

## 📊 Project Status

### Completed Features
- ✅ Smart contract deployed on Sepolia
- ✅ Frontend fully functional
- ✅ Real-time event listeners working
- ✅ Campaign creation and management
- ✅ Donation functionality
- ✅ Admin panel
- ✅ Network guard
- ✅ Comprehensive testing (47/47 tests passing)

### Tested Components
- ✅ Contract deployment
- ✅ Campaign creation
- ✅ Donations
- ✅ Expenditure management
- ✅ Security features
- ✅ Gas optimization
- ✅ Real-time updates
- ✅ Frontend integration

---

## 🔗 Important Links

- **Contract on Etherscan:** https://sepolia.etherscan.io/address/0x379A63482A2401a0d1b30f57921A58dEAB022aC6
- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Infura:** https://infura.io/
- **Etherscan API:** https://etherscan.io/myapikey
- **MetaMask:** https://metamask.io/

---

## 📝 Development Commands

### Backend
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy-charity-final.js --network sepolia

# Test deployed contract
npx hardhat run scripts/test-deployed-contract.js --network sepolia

# Open Hardhat console
npx hardhat console --network sepolia
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🎯 Quick Start Summary

1. **Install dependencies** (backend & frontend)
2. **Configure `.env` files** (both directories)
3. **Deploy contract** to Sepolia (or use existing)
4. **Copy contract ABI** to frontend
5. **Start frontend** server
6. **Connect MetaMask** to Sepolia network
7. **Start using** the DApp!

---

## 🤝 Contributing

This is a demonstration project. For production use:
- Conduct security audits
- Add more comprehensive tests
- Implement additional features
- Optimize gas costs further
- Add multi-signature support
- Implement governance mechanisms

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## 🎉 Success!

Your Chain of Hope DApp is now ready to use! Make transparent, blockchain-verified donations and track every transaction on the Ethereum blockchain.

**Happy Donating! 💝**
