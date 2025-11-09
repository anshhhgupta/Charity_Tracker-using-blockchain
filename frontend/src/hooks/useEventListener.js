import { useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS, getEtherscanUrl } from '../config/config';
import CharityABI from '../abi/Charity.json';
import toast from 'react-hot-toast';

/**
 * Custom hook for listening to contract events with real-time UI updates
 * @param {Object} options - Configuration options
 * @param {Function} onCampaignCreated - Callback for CampaignCreated event
 * @param {Function} onDonationReceived - Callback for DonationReceived event
 * @param {Function} onExpenditureRequested - Callback for ExpenditureRequested event
 * @param {Function} onExpenditureExecuted - Callback for ExpenditureExecuted event
 * @param {Function} onEmergencyWithdrawal - Callback for EmergencyWithdrawal event
 * @param {boolean} showToasts - Whether to show toast notifications (default: true)
 * @param {number} campaignId - Optional: only listen for events from specific campaign
 */
export const useEventListener = ({
  onCampaignCreated,
  onDonationReceived,
  onExpenditureRequested,
  onExpenditureExecuted,
  onEmergencyWithdrawal,
  showToasts = true,
  campaignId = null
} = {}) => {
  const { provider, chainId } = useWallet();
  const contractRef = useRef(null);
  const listenersRef = useRef([]);

  // Initialize contract
  useEffect(() => {
    if (!provider) return;

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CharityABI.abi,
        provider
      );
      contractRef.current = contract;
    } catch (error) {
      console.error('Error initializing contract for events:', error);
    }
  }, [provider]);

  // Format address for display
  const formatAddress = useCallback((address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  // Create toast content with Etherscan link
  const createToastContent = useCallback((title, subtitle, txHash, icon) => {
    return (
      <div>
        <p className="font-semibold flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </p>
        {subtitle && <p className="text-sm text-gray-300">{subtitle}</p>}
        {txHash && (
          <a 
            href={getEtherscanUrl(txHash, chainId)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs flex items-center mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            View on Etherscan →
          </a>
        )}
      </div>
    );
  }, [chainId]);

  // Show toast notification
  const showToast = useCallback((type, content, options = {}) => {
    if (!showToasts) return;

    const toastOptions = {
      duration: 5000,
      ...options
    };

    switch (type) {
      case 'success':
        toast.success(content, toastOptions);
        break;
      case 'info':
        toast(content, { ...toastOptions, icon: 'ℹ️' });
        break;
      case 'warning':
        toast(content, { ...toastOptions, icon: '⚠️' });
        break;
      case 'error':
        toast.error(content, toastOptions);
        break;
      default:
        toast(content, toastOptions);
    }
  }, [showToasts]);

  // Setup event listeners
  useEffect(() => {
    const contract = contractRef.current;
    if (!contract) return;

    console.log('Setting up event listeners...', { campaignId, showToasts });

    // CampaignCreated event handler
    const handleCampaignCreated = async (eventCampaignId, admin, name, goal, deadline, event) => {
      const campaignIdNum = Number(eventCampaignId);
      
      console.log('CampaignCreated event:', {
        campaignId: campaignIdNum,
        admin,
        name,
        goal: ethers.formatEther(goal)
      });

      // Show toast notification
      const toastContent = createToastContent(
        'New Campaign Created!',
        `${name} by ${formatAddress(admin)}`,
        event.log?.transactionHash,
        '🎯'
      );
      showToast('success', toastContent);

      // Call callback if provided
      if (onCampaignCreated) {
        onCampaignCreated({
          campaignId: campaignIdNum,
          admin,
          name,
          goal: ethers.formatEther(goal),
          deadline: Number(deadline),
          event
        });
      }
    };

    // DonationReceived event handler
    const handleDonationReceived = async (eventCampaignId, donor, amount, event) => {
      const campaignIdNum = Number(eventCampaignId);
      const amountEth = ethers.formatEther(amount);
      
      // Filter by campaign ID if specified
      if (campaignId !== null && campaignIdNum !== campaignId) return;

      console.log('DonationReceived event:', {
        campaignId: campaignIdNum,
        donor,
        amount: amountEth
      });

      // Show toast notification
      const toastContent = createToastContent(
        'New Donation Received!',
        `${amountEth} ETH from ${formatAddress(donor)}`,
        event.log?.transactionHash,
        '💝'
      );
      showToast('success', toastContent);

      // Call callback if provided
      if (onDonationReceived) {
        onDonationReceived({
          campaignId: campaignIdNum,
          donor,
          amount: amountEth,
          amountWei: amount,
          event
        });
      }
    };

    // ExpenditureRequested event handler
    const handleExpenditureRequested = async (eventCampaignId, expenditureId, amount, recipient, purpose, event) => {
      const campaignIdNum = Number(eventCampaignId);
      const expenditureIdNum = Number(expenditureId);
      const amountEth = ethers.formatEther(amount);
      
      // Filter by campaign ID if specified
      if (campaignId !== null && campaignIdNum !== campaignId) return;

      console.log('ExpenditureRequested event:', {
        campaignId: campaignIdNum,
        expenditureId: expenditureIdNum,
        amount: amountEth,
        recipient,
        purpose
      });

      // Show toast notification
      const toastContent = createToastContent(
        'Expenditure Requested',
        `${amountEth} ETH for ${purpose}`,
        event.log?.transactionHash,
        '📋'
      );
      showToast('info', toastContent);

      // Call callback if provided
      if (onExpenditureRequested) {
        onExpenditureRequested({
          campaignId: campaignIdNum,
          expenditureId: expenditureIdNum,
          amount: amountEth,
          amountWei: amount,
          recipient,
          purpose,
          event
        });
      }
    };

    // ExpenditureExecuted event handler
    const handleExpenditureExecuted = async (eventCampaignId, expenditureId, amount, recipient, event) => {
      const campaignIdNum = Number(eventCampaignId);
      const expenditureIdNum = Number(expenditureId);
      const amountEth = ethers.formatEther(amount);
      
      // Filter by campaign ID if specified
      if (campaignId !== null && campaignIdNum !== campaignId) return;

      console.log('ExpenditureExecuted event:', {
        campaignId: campaignIdNum,
        expenditureId: expenditureIdNum,
        amount: amountEth,
        recipient
      });

      // Show toast notification
      const toastContent = createToastContent(
        'Expenditure Executed!',
        `${amountEth} ETH sent to ${formatAddress(recipient)}`,
        event.log?.transactionHash,
        '✅'
      );
      showToast('success', toastContent);

      // Call callback if provided
      if (onExpenditureExecuted) {
        onExpenditureExecuted({
          campaignId: campaignIdNum,
          expenditureId: expenditureIdNum,
          amount: amountEth,
          amountWei: amount,
          recipient,
          event
        });
      }
    };

    // EmergencyWithdrawal event handler
    const handleEmergencyWithdrawal = async (to, amount, event) => {
      const amountEth = ethers.formatEther(amount);
      
      console.log('EmergencyWithdrawal event:', {
        to,
        amount: amountEth
      });

      // Show toast notification
      const toastContent = createToastContent(
        'Emergency Withdrawal!',
        `${amountEth} ETH withdrawn to ${formatAddress(to)}`,
        event.log?.transactionHash,
        '⚠️'
      );
      showToast('warning', toastContent, { duration: 8000 });

      // Call callback if provided
      if (onEmergencyWithdrawal) {
        onEmergencyWithdrawal({
          to,
          amount: amountEth,
          amountWei: amount,
          event
        });
      }
    };

    // Register event listeners
    contract.on('CampaignCreated', handleCampaignCreated);
    contract.on('DonationReceived', handleDonationReceived);
    contract.on('ExpenditureRequested', handleExpenditureRequested);
    contract.on('ExpenditureExecuted', handleExpenditureExecuted);
    contract.on('EmergencyWithdrawal', handleEmergencyWithdrawal);

    // Store listeners for cleanup
    listenersRef.current = [
      { event: 'CampaignCreated', handler: handleCampaignCreated },
      { event: 'DonationReceived', handler: handleDonationReceived },
      { event: 'ExpenditureRequested', handler: handleExpenditureRequested },
      { event: 'ExpenditureExecuted', handler: handleExpenditureExecuted },
      { event: 'EmergencyWithdrawal', handler: handleEmergencyWithdrawal }
    ];

    console.log('Event listeners registered:', listenersRef.current.length);

    // Cleanup function
    return () => {
      console.log('Cleaning up event listeners...');
      contract.off('CampaignCreated', handleCampaignCreated);
      contract.off('DonationReceived', handleDonationReceived);
      contract.off('ExpenditureRequested', handleExpenditureRequested);
      contract.off('ExpenditureExecuted', handleExpenditureExecuted);
      contract.off('EmergencyWithdrawal', handleEmergencyWithdrawal);
      listenersRef.current = [];
    };
  }, [
    provider, 
    campaignId, 
    showToasts, 
    onCampaignCreated, 
    onDonationReceived, 
    onExpenditureRequested, 
    onExpenditureExecuted, 
    onEmergencyWithdrawal, 
    createToastContent, 
    showToast, 
    formatAddress
  ]);

  return {
    contract: contractRef.current,
    activeListeners: listenersRef.current.length
  };
};

export default useEventListener;
