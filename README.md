# Chain of Hope - Transparent Charity DApp

A full-stack blockchain application for transparent charity donations built with React, Vite, Hardhat, and Solidity. This DApp provides complete transparency in charitable giving through blockchain technology.

## 🌟 Features

- **Transparent Donations**: All transactions are recorded on the blockchain
- **Anonymous Option**: Donors can choose to remain anonymous
- **Real-time Dashboard**: View donation statistics and recent activity
- **Secure Smart Contracts**: Built with OpenZeppelin security standards
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Multi-network Support**: Deployable on Ethereum, Sepolia, and local networks

## 🏗️ Architecture

```
chain-of-hope-dapp/
├── backend/                 # Smart contracts and blockchain backend
│   ├── contracts/          # Solidity smart contracts
│   ├── scripts/           # Deployment and utility scripts
│   ├── test/              # Smart contract tests
│   └── hardhat.config.js  # Hardhat configuration
├── frontend/              # React frontend application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
└── scripts/               # Project setup and deployment scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chain-of-hope-dapp.git
cd chain-of-hope-dapp
```

### 2. Automated Setup

```bash
npm run setup
```

This will:
- Install all dependencies for both backend and frontend
- Compile smart contracts
- Create environment files from examples
- Set up the complete development environment

### 3. Manual Setup (Alternative)

#### Backend Setup

```bash
cd backend
npm install
npm run compile
```

#### Frontend Setup

```bash
cd frontend
npm install
```

### 4. Configure Environment Variables

#### Backend Configuration (`backend/.env`)

```env
# Private key for deployment (DO NOT commit this file with real keys)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Charity wallet address (where donations will be sent)
CHARITY_WALLET_ADDRESS=0x1234567890123456789012345678901234567890
```

#### Frontend Configuration (`frontend/.env`)

```env
# Contract address - Update this with your deployed contract address
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# RPC URLs for different networks
REACT_APP_MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id
REACT_APP_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
REACT_APP_LOCALHOST_RPC_URL=http://localhost:8545

# App configuration
REACT_APP_CHAIN_ID=31337
REACT_APP_NETWORK_NAME=localhost
```

## 🛠️ Development

### Start Local Development Environment

```bash
npm start
```

This will:
1. Start a local Hardhat blockchain
2. Deploy the smart contracts
3. Start the React frontend development server

The DApp will be available at `http://localhost:3000`

### Individual Commands

#### Backend Commands

```bash
# Start local blockchain
cd backend && npm run node

# Compile contracts
cd backend && npm run compile

# Run tests
cd backend && npm test

# Deploy to localhost
cd backend && npm run deploy:localhost

# Deploy to Sepolia testnet
cd backend && npm run deploy:sepolia
```

#### Frontend Commands

```bash
# Start development server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

## 📋 Smart Contract Features

### CharityDonation Contract

The main smart contract includes:

- **Donation Functionality**: Accept donations with optional messages and anonymity
- **Withdrawal Management**: Charity can withdraw funds with purpose tracking
- **Emergency Withdrawals**: Emergency withdrawal when balance exceeds threshold
- **Transparency Features**: Public viewing of all donations and withdrawals
- **Admin Controls**: Owner can update charity information and settings

### Key Functions

```solidity
// Make a donation
function donate(string memory _message, bool _isAnonymous) external payable

// Withdraw funds for charity purposes
function withdraw(uint256 _amount, string memory _purpose) external

// Get donation statistics
function getStats() external view returns (uint256, uint256, uint256, uint256, uint256)

// Get recent donations
function getRecentDonations(uint256 _count) external view returns (Donation[] memory)
```

## 🎨 Frontend Features

### Pages

- **Home**: Landing page with charity information and statistics
- **Donate**: Donation form with wallet integration
- **Dashboard**: Real-time statistics and transaction history
- **About**: Information about the platform and mission

### Components

- **Web3 Integration**: Ethers.js integration for blockchain interactions
- **Wallet Connection**: MetaMask and other wallet support
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live transaction status and statistics

## 🧪 Testing

### Smart Contract Tests

```bash
cd backend
npm test
```

The test suite covers:
- Contract deployment
- Donation functionality
- Withdrawal mechanisms
- Access controls
- Edge cases and error handling

### Frontend Testing

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Local Development

```bash
npm start
```

### Testnet Deployment (Sepolia)

1. Configure your `.env` files with testnet credentials
2. Deploy contracts:
   ```bash
   cd backend
   npm run deploy:sepolia
   ```
3. Update frontend `.env` with deployed contract address
4. Build and deploy frontend to your hosting platform

### Mainnet Deployment

1. Ensure all security audits are complete
2. Configure production environment variables
3. Deploy contracts to mainnet
4. Update frontend configuration
5. Deploy frontend to production hosting

## 📊 Contract Addresses

After deployment, update the contract address in `frontend/.env`:

```env
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## 🔒 Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Smart Contract Audits**: Consider professional audits before mainnet deployment
- **Access Controls**: Review and test all access control mechanisms
- **Input Validation**: All user inputs are validated both client and server side

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for development environment
- React and Vite for frontend framework
- Ethers.js for blockchain interactions
- Tailwind CSS for styling

## 📞 Support

For support, email support@chainofhope.org or join our Discord community.

## 🔗 Links

- [Website](https://chainofhope.org)
- [Documentation](https://docs.chainofhope.org)
- [GitHub Repository](https://github.com/chain-of-hope/dapp)

---

**Built with ❤️ for transparent humanitarian aid**
