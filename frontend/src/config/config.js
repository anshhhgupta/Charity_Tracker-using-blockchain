/**
 * Chain of Hope DApp Configuration
 * 
 * This file contains all configuration settings for the application
 * including contract addresses, network settings, and RPC URLs.
 */

// Contract Addresses
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Network Configuration
export const NETWORKS = {
  localhost: {
    chainId: 31337,
    chainIdHex: '0x7A69',
    name: 'Hardhat Local',
    rpcUrl: 'http://localhost:8545',
    blockExplorer: 'http://localhost:4000',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  sepolia: {
    chainId: 11155111,
    chainIdHex: '0xAA36A7',
    name: 'Sepolia Testnet',
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  mainnet: {
    chainId: 1,
    chainIdHex: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: import.meta.env.VITE_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Get current network from environment
export const CURRENT_NETWORK = import.meta.env.VITE_NETWORK || 'localhost';

// Get network config
export const getNetworkConfig = (networkName = CURRENT_NETWORK) => {
  return NETWORKS[networkName] || NETWORKS.localhost;
};

// Get network by chain ID
export const getNetworkByChainId = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};

// Get Etherscan URL for transaction
export const getEtherscanUrl = (txHash, chainId) => {
  const network = getNetworkByChainId(chainId);
  return network ? `${network.blockExplorer}/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`;
};

// Get Etherscan URL for address
export const getEtherscanAddressUrl = (address, chainId) => {
  const network = getNetworkByChainId(chainId);
  return network ? `${network.blockExplorer}/address/${address}` : `https://etherscan.io/address/${address}`;
};

// Check if on correct network
export const isCorrectNetwork = (chainId) => {
  const targetNetwork = getNetworkConfig();
  return chainId === targetNetwork.chainId;
};

// Export current network config
export const NETWORK_CONFIG = getNetworkConfig();

// App Configuration
export const APP_CONFIG = {
  name: 'Chain of Hope',
  description: 'Transparent blockchain charity donations',
  version: '1.0.0',
  supportedNetworks: ['localhost', 'sepolia', 'mainnet']
};
