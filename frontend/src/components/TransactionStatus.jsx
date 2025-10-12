import { useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionStatus = ({ 
  txHash, 
  status, 
  message, 
  etherscanUrl, 
  onRetry,
  showToast = true 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader className="h-4 w-4 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleViewOnEtherscan = () => {
    if (etherscanUrl) {
      window.open(etherscanUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRetry = async () => {
    if (onRetry && !isLoading) {
      setIsLoading(true);
      try {
        await onRetry();
      } catch (error) {
        console.error('Retry failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Show toast notifications
  if (showToast) {
    switch (status) {
      case 'pending':
        toast.loading(message || 'Transaction pending...', { 
          id: txHash,
          duration: Infinity 
        });
        break;
      case 'success':
        toast.success(message || 'Transaction successful!', { 
          id: txHash,
          duration: 5000 
        });
        break;
      case 'error':
        toast.error(message || 'Transaction failed!', { 
          id: txHash,
          duration: 5000 
        });
        break;
    }
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-sm font-medium">
        {message || 'Transaction in progress...'}
      </span>
      
      {txHash && (
        <button
          onClick={handleViewOnEtherscan}
          className="inline-flex items-center space-x-1 text-xs hover:underline"
          title="View on Etherscan"
        >
          <ExternalLink className="h-3 w-3" />
          <span>View</span>
        </button>
      )}
      
      {status === 'error' && onRetry && (
        <button
          onClick={handleRetry}
          disabled={isLoading}
          className="inline-flex items-center space-x-1 text-xs hover:underline disabled:opacity-50"
          title="Retry transaction"
        >
          {isLoading ? (
            <Loader className="h-3 w-3 animate-spin" />
          ) : (
            <span>Retry</span>
          )}
        </button>
      )}
    </div>
  );
};

export default TransactionStatus;
