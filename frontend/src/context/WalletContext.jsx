import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  // State management
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Get current network info
  const getNetworkInfo = useCallback(async () => {
    if (!provider) return null;
    
    try {
      const network = await provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name,
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }, [provider]);

  // Connect to MetaMask
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        setError('No accounts found. Please unlock MetaMask.');
        return false;
      }

      // Create provider and signer
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const network = await newProvider.getNetwork();

      // Update state
      setAccount(accounts[0]);
      setProvider(newProvider);
      setSigner(newSigner);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      console.log('Wallet connected:', {
        account: accounts[0],
        chainId: Number(network.chainId),
        network: network.name,
      });

      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific MetaMask errors
      if (error.code === 4001) {
        setError('Connection rejected by user.');
      } else if (error.code === -32002) {
        setError('Connection request already pending. Please check MetaMask.');
      } else {
        setError(`Failed to connect wallet: ${error.message}`);
      }
      
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
    
    console.log('Wallet disconnected');
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    if (!window.ethereum) {
      setError('MetaMask is not installed.');
      return false;
    }

    try {
      setError(null);
      
      // Try to switch to the target network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      
      // If the network doesn't exist, try to add it
      if (error.code === 4902) {
        try {
          await addNetwork(targetChainId);
          return true;
        } catch (addError) {
          setError(`Failed to add network: ${addError.message}`);
          return false;
        }
      } else {
        setError(`Failed to switch network: ${error.message}`);
        return false;
      }
    }
  }, []);

  // Add custom network
  const addNetwork = useCallback(async (chainId) => {
    const networkConfigs = {
      31337: {
        chainId: '0x7A69', // 31337 in hex
        chainName: 'Hardhat Local',
        rpcUrls: ['http://localhost:8545'],
        blockExplorerUrls: null,
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      11155111: {
        chainId: '0xAA36A7', // 11155111 in hex
        chainName: 'Sepolia Test Network',
        rpcUrls: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
    };

    const config = networkConfigs[chainId];
    if (!config) {
      throw new Error(`Network configuration not found for chain ID: ${chainId}`);
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [config],
    });
  }, []);

  // Get account balance
  const getBalance = useCallback(async (address = account) => {
    if (!provider || !address) return null;
    
    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }, [provider, account]);

  // Send transaction
  const sendTransaction = useCallback(async (transaction) => {
    if (!signer) {
      setError('Wallet not connected');
      return null;
    }

    try {
      setError(null);
      const tx = await signer.sendTransaction(transaction);
      return tx;
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError(`Transaction failed: ${error.message}`);
      return null;
    }
  }, [signer]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnectWallet();
      } else if (accounts[0] !== account) {
        // User switched accounts
        setAccount(accounts[0]);
        if (provider) {
          provider.getSigner().then(setSigner);
        }
      }
    };

    const handleChainChanged = (chainId) => {
      const newChainId = parseInt(chainId, 16);
      setChainId(newChainId);
      
      // Optionally reload the page to ensure proper network handling
      if (isConnected) {
        window.location.reload();
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    // Cleanup
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account, provider, isConnected, disconnectWallet]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          const newProvider = new ethers.BrowserProvider(window.ethereum);
          const newSigner = await newProvider.getSigner();
          const network = await newProvider.getNetwork();

          setAccount(accounts[0]);
          setProvider(newProvider);
          setSigner(newSigner);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Context value
  const value = {
    // State
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isConnecting,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getBalance,
    sendTransaction,
    getNetworkInfo,
    
    // Utilities
    isMetaMaskInstalled,
    formatAddress: (address) => {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },
    clearError: () => setError(null),
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
