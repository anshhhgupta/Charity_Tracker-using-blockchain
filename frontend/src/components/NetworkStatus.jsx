import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { getNetworkByChainId, NETWORK_CONFIG, isCorrectNetwork } from '../config/config';
import { Wifi, WifiOff, AlertCircle, ExternalLink } from 'lucide-react';

const NetworkStatus = () => {
  const { account, chainId, isConnected, switchNetwork } = useWallet();
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (chainId) {
      const network = getNetworkByChainId(chainId);
      setCurrentNetwork(network);
    }
  }, [chainId]);

  const handleSwitchNetwork = async () => {
    try {
      await switchNetwork(NETWORK_CONFIG.chainId);
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <WifiOff className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Not Connected</span>
      </div>
    );
  }

  const onCorrectNetwork = isCorrectNetwork(chainId);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          onCorrectNetwork
            ? 'bg-green-100 hover:bg-green-200 text-green-800'
            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        }`}
      >
        {onCorrectNetwork ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">
            {currentNetwork?.name || 'Unknown Network'}
          </span>
          <span className="text-xs opacity-75">
            {formatAddress(account)}
          </span>
        </div>
      </button>

      {/* Dropdown Details */}
      {showDetails && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Network Status
            </h3>

            {/* Account Info */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">Connected Account</label>
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-sm font-mono">{formatAddress(account)}</span>
                <a
                  href={`${currentNetwork?.blockExplorer}/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Network Info */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">Current Network</label>
              <div className="bg-gray-50 px-3 py-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{currentNetwork?.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    onCorrectNetwork
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {onCorrectNetwork ? 'Correct' : 'Wrong Network'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Chain ID: {chainId}
                </div>
              </div>
            </div>

            {/* Expected Network */}
            {!onCorrectNetwork && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 block mb-1">Expected Network</label>
                <div className="bg-blue-50 px-3 py-2 rounded">
                  <div className="text-sm font-medium text-blue-900">
                    {NETWORK_CONFIG.name}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    Chain ID: {NETWORK_CONFIG.chainId}
                  </div>
                </div>
              </div>
            )}

            {/* Switch Network Button */}
            {!onCorrectNetwork && (
              <button
                onClick={handleSwitchNetwork}
                className="w-full btn-primary text-sm"
              >
                Switch to {NETWORK_CONFIG.name}
              </button>
            )}

            {/* Network Status Message */}
            {onCorrectNetwork ? (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="flex items-start space-x-2">
                  <Wifi className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Connected Successfully
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      You're on the correct network and ready to interact with the dApp.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">
                      Wrong Network
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Please switch to {NETWORK_CONFIG.name} to use this dApp.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDetails && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default NetworkStatus;
