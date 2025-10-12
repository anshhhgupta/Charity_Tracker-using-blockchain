import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export const useTransaction = () => {
  const [transactions, setTransactions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getEtherscanUrl = useCallback((txHash, chainId) => {
    switch (chainId) {
      case 11155111: // Sepolia
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      case 1: // Mainnet
        return `https://etherscan.io/tx/${txHash}`;
      case 31337: // Hardhat Local
        return `http://localhost:4000/tx/${txHash}`;
      default:
        return `https://etherscan.io/tx/${txHash}`;
    }
  }, []);

  const executeTransaction = useCallback(async (
    transactionFunction,
    options = {}
  ) => {
    const {
      pendingMessage = 'Transaction pending...',
      successMessage = 'Transaction successful!',
      errorMessage = 'Transaction failed!',
      showToast = true,
      onSuccess,
      onError,
      onPending
    } = options;

    let txHash = null;
    let toastId = null;

    try {
      setIsLoading(true);

      // Show pending toast
      if (showToast) {
        toastId = toast.loading(pendingMessage, { duration: Infinity });
      }

      // Execute transaction
      const tx = await transactionFunction();
      txHash = tx.hash;

      // Update transaction state
      setTransactions(prev => ({
        ...prev,
        [txHash]: {
          hash: txHash,
          status: 'pending',
          message: pendingMessage,
          etherscanUrl: getEtherscanUrl(txHash, options.chainId)
        }
      }));

      // Call pending callback
      if (onPending) {
        onPending(tx, txHash);
      }

      // Wait for confirmation
      const receipt = await tx.wait();

      // Update transaction state to success
      setTransactions(prev => ({
        ...prev,
        [txHash]: {
          ...prev[txHash],
          status: 'success',
          message: successMessage,
          receipt
        }
      }));

      // Show success toast
      if (showToast && toastId) {
        toast.success(successMessage, { id: toastId, duration: 5000 });
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(receipt, txHash);
      }

      return { success: true, receipt, txHash };

    } catch (error) {
      console.error('Transaction failed:', error);

      // Update transaction state to error
      if (txHash) {
        setTransactions(prev => ({
          ...prev,
          [txHash]: {
            ...prev[txHash],
            status: 'error',
            message: errorMessage,
            error: error.message
          }
        }));
      }

      // Show error toast
      if (showToast && toastId) {
        toast.error(errorMessage, { id: toastId, duration: 5000 });
      } else if (showToast) {
        toast.error(errorMessage, { duration: 5000 });
      }

      // Call error callback
      if (onError) {
        onError(error, txHash);
      }

      return { success: false, error, txHash };

    } finally {
      setIsLoading(false);
    }
  }, [getEtherscanUrl]);

  const getTransaction = useCallback((txHash) => {
    return transactions[txHash] || null;
  }, [transactions]);

  const clearTransaction = useCallback((txHash) => {
    setTransactions(prev => {
      const newTransactions = { ...prev };
      delete newTransactions[txHash];
      return newTransactions;
    });
  }, []);

  const clearAllTransactions = useCallback(() => {
    setTransactions({});
  }, []);

  return {
    executeTransaction,
    getTransaction,
    clearTransaction,
    clearAllTransactions,
    transactions,
    isLoading
  };
};
