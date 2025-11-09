import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from '../config/config';
import { CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';

/**
 * ContractTest component
 * Tests and displays contract connection status
 */
const ContractTest = () => {
  const { contract, contractInfo, loading, error } = useContract();
  const [testResults, setTestResults] = useState({
    connection: null,
    campaignCount: null,
    balance: null
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (contractInfo) {
      setTestResults({
        connection: contractInfo.isConnected,
        campaignCount: contractInfo.campaignCount,
        balance: contractInfo.balance
      });
    }
  }, [contractInfo]);

  const runTests = async () => {
    if (!contract) return;

    setTesting(true);
    const results = {
      connection: false,
      campaignCount: null,
      balance: null
    };

    try {
      // Test 1: Check connection
      results.connection = true;

      // Test 2: Get campaign count
      const count = await contract.campaignCount();
      results.campaignCount = Number(count);

      // Test 3: Get contract balance
      const balance = await contract.getContractBalance();
      results.balance = ethers.formatEther(balance);

      setTestResults(results);
    } catch (err) {
      console.error('Test failed:', err);
      setTestResults(results);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === null) return <Loader className="h-5 w-5 text-gray-400 animate-spin" />;
    if (status === true || status >= 0) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 text-primary-600 animate-spin" />
          <span className="ml-3 text-gray-600">Initializing contract...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-start space-x-3">
          <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Contract Initialization Failed
            </h3>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Contract Connection Test
        </h3>
        <button
          onClick={runTests}
          disabled={testing || !contract}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {/* Contract Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Contract Address:</span>
            <div className="font-mono text-xs mt-1 flex items-center">
              <span className="truncate">{CONTRACT_ADDRESS}</span>
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Network:</span>
            <div className="font-medium mt-1">{NETWORK_CONFIG.name}</div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        {/* Connection Test */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Contract Connection</div>
            <div className="text-sm text-gray-500">
              {testResults.connection ? 'Connected successfully' : 'Not connected'}
            </div>
          </div>
          {getStatusIcon(testResults.connection)}
        </div>

        {/* Campaign Count Test */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Campaign Count</div>
            <div className="text-sm text-gray-500">
              {testResults.campaignCount !== null 
                ? `${testResults.campaignCount} campaign(s) found`
                : 'Not tested yet'}
            </div>
          </div>
          {getStatusIcon(testResults.campaignCount)}
        </div>

        {/* Balance Test */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Contract Balance</div>
            <div className="text-sm text-gray-500">
              {testResults.balance !== null 
                ? `${testResults.balance} ETH`
                : 'Not tested yet'}
            </div>
          </div>
          {getStatusIcon(testResults.balance)}
        </div>
      </div>

      {/* Success Message */}
      {testResults.connection && testResults.campaignCount !== null && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Contract Connected Successfully!
              </p>
              <p className="text-sm text-green-700 mt-1">
                The contract is deployed and responding correctly on {NETWORK_CONFIG.name}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTest;
