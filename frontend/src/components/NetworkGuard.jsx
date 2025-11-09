import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { NETWORK_CONFIG, isCorrectNetwork } from '../config/config';
import { AlertCircle, Wifi } from 'lucide-react';

/**
 * NetworkGuard component
 * Checks if user is on the correct network and prompts to switch if not
 */
const NetworkGuard = ({ children }) => {
  const { chainId, isConnected, switchNetwork } = useWallet();
  const [checking, setChecking] = useState(true);
  const [onCorrectNetwork, setOnCorrectNetwork] = useState(false);

  useEffect(() => {
    if (isConnected && chainId) {
      setOnCorrectNetwork(isCorrectNetwork(chainId));
      setChecking(false);
    } else {
      setChecking(false);
    }
  }, [chainId, isConnected]);

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(NETWORK_CONFIG.chainId);
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  // If not connected, show children (let wallet connection handle it)
  if (!isConnected) {
    return <>{children}</>;
  }

  // If checking, show loading
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking network...</p>
        </div>
      </div>
    );
  }

  // If on wrong network, show warning
  if (!onCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Wrong Network
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              This dApp requires you to be connected to <strong>{NETWORK_CONFIG.name}</strong>.
              Please switch your network to continue.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Current Network:</span>
                <span className="text-sm font-medium text-gray-900">
                  Chain ID: {chainId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Required Network:</span>
                <span className="text-sm font-medium text-primary-600">
                  {NETWORK_CONFIG.name} (Chain ID: {NETWORK_CONFIG.chainId})
                </span>
              </div>
            </div>

            <button
              onClick={handleSwitchNetwork}
              className="w-full btn-primary flex items-center justify-center"
            >
              <Wifi className="h-5 w-5 mr-2" />
              Switch to {NETWORK_CONFIG.name}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              If the network doesn't exist in your wallet, it will be added automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // On correct network, show children
  return <>{children}</>;
};

export default NetworkGuard;
