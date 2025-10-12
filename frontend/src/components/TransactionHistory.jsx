import { useState, useEffect } from 'react';
import { useContract } from '../context/ContractContext';
import TransactionStatus from './TransactionStatus';
import { Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const TransactionHistory = ({ maxTransactions = 5 }) => {
  const { transactions, getTransaction } = useContract();
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    // Get recent transactions
    const transactionList = Object.values(transactions)
      .sort((a, b) => {
        // Sort by timestamp if available, otherwise by order added
        if (a.timestamp && b.timestamp) {
          return b.timestamp - a.timestamp;
        }
        return 0;
      })
      .slice(0, maxTransactions);

    setRecentTransactions(transactionList);
  }, [transactions, maxTransactions]);

  if (recentTransactions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
      {recentTransactions.map((tx) => (
        <div key={tx.hash} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {tx.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
              {tx.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {tx.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {tx.message || 'Transaction'}
                </p>
                <p className="text-xs text-gray-500">
                  {tx.hash ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}` : 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {tx.etherscanUrl && (
                <button
                  onClick={() => window.open(tx.etherscanUrl, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  title="View on Etherscan"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View</span>
                </button>
              )}
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                tx.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : tx.status === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {tx.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory;
