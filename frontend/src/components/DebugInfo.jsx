import { useWallet } from '../context/WalletContext';
import { useContract } from '../context/ContractContext';

const DebugInfo = () => {
  const { account, chainId, isConnected, error: walletError } = useWallet();
  const { contractAddress, loading, error: contractError } = useContract();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🐛 Debug Info</div>
      
      <div className="space-y-1">
        <div><span className="text-blue-300">Wallet:</span> {isConnected ? '✅ Connected' : '❌ Not connected'}</div>
        {account && <div><span className="text-blue-300">Account:</span> {account.slice(0, 6)}...{account.slice(-4)}</div>}
        {chainId && <div><span className="text-blue-300">Chain ID:</span> {chainId}</div>}
        {walletError && <div><span className="text-red-300">Wallet Error:</span> {walletError}</div>}
        
        <div><span className="text-green-300">Contract:</span> {contractAddress ? '✅ Initialized' : '❌ Not initialized'}</div>
        {contractAddress && <div><span className="text-green-300">Address:</span> {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</div>}
        <div><span className="text-green-300">Loading:</span> {loading ? '🔄 Yes' : '✅ No'}</div>
        {contractError && <div><span className="text-red-300">Contract Error:</span> {contractError}</div>}
      </div>
    </div>
  );
};

export default DebugInfo;