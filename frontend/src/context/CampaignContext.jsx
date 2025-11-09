import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { CONTRACT_ADDRESS, getEtherscanUrl } from '../config/config';
import CharityABI from '../abi/Charity.json';
import toast from 'react-hot-toast';

const CampaignContext = createContext();

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};

export const CampaignProvider = ({ children }) => {
  const { provider, signer, chainId, isConnected } = useWallet();
  
  // State
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [eventListeners, setEventListeners] = useState([]);

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      try {
        const contractProvider = provider || new ethers.JsonRpcProvider('http://localhost:8545');
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CharityABI.abi,
          signer || contractProvider
        );
        setContract(contractInstance);
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, [provider, signer]);

  // Load all campaigns
  const loadCampaigns = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const count = await contract.campaignCount();
      const campaignList = [];

      for (let i = 0; i < count; i++) {
        try {
          const campaign = await contract.getCampaign(i);
          const isActive = await contract.isCampaignActive(i);
          const progress = await contract.getCampaignProgress(i);

          campaignList.push({
            id: Number(campaign.id),
            name: campaign.name,
            description: campaign.description,
            goal: ethers.formatEther(campaign.goal),
            balance: ethers.formatEther(campaign.balance),
            admin: campaign.admin,
            deadline: Number(campaign.deadline),
            expenditureCount: Number(campaign.expenditureCount),
            isActive,
            progress: Number(progress)
          });
        } catch (error) {
          console.warn(`Failed to load campaign ${i}:`, error);
        }
      }

      setCampaigns(campaignList);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Update single campaign
  const updateCampaign = useCallback(async (campaignId) => {
    if (!contract) return;

    try {
      const campaign = await contract.getCampaign(campaignId);
      const isActive = await contract.isCampaignActive(campaignId);
      const progress = await contract.getCampaignProgress(campaignId);

      const updatedCampaign = {
        id: Number(campaign.id),
        name: campaign.name,
        description: campaign.description,
        goal: ethers.formatEther(campaign.goal),
        balance: ethers.formatEther(campaign.balance),
        admin: campaign.admin,
        deadline: Number(campaign.deadline),
        expenditureCount: Number(campaign.expenditureCount),
        isActive,
        progress: Number(progress)
      };

      setCampaigns(prev => {
        const index = prev.findIndex(c => c.id === campaignId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedCampaign;
          return updated;
        }
        return [...prev, updatedCampaign];
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  }, [contract]);

  // Setup event listeners
  useEffect(() => {
    if (!contract || !provider) return;

    console.log('Setting up event listeners...');
    const listeners = [];

    // CampaignCreated event
    const onCampaignCreated = async (campaignId, admin, name, goal, deadline, event) => {
      console.log('CampaignCreated event:', { campaignId: campaignId.toString(), admin, name });
      
      toast.success(
        <div>
          <p className="font-semibold">New Campaign Created!</p>
          <p className="text-sm">{name}</p>
          <a 
            href={getEtherscanUrl(event.log.transactionHash, chainId)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs flex items-center mt-1"
          >
            View on Etherscan →
          </a>
        </div>,
        { duration: 5000 }
      );

      // Reload campaigns to include new one
      await loadCampaigns();
    };

    // DonationReceived event
    const onDonationReceived = async (campaignId, donor, amount, event) => {
      console.log('DonationReceived event:', { 
        campaignId: campaignId.toString(), 
        donor, 
        amount: ethers.formatEther(amount) 
      });

      // Get campaign name for notification
      const campaign = campaigns.find(c => c.id === Number(campaignId));
      const campaignName = campaign?.name || `Campaign #${campaignId}`;

      toast.success(
        <div>
          <p className="font-semibold">New Donation Received!</p>
          <p className="text-sm">{ethers.formatEther(amount)} ETH to {campaignName}</p>
          <a 
            href={getEtherscanUrl(event.log.transactionHash, chainId)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs flex items-center mt-1"
          >
            View on Etherscan →
          </a>
        </div>,
        { duration: 5000, icon: '💝' }
      );

      // Update campaign data
      await updateCampaign(Number(campaignId));
    };

    // ExpenditureRequested event
    const onExpenditureRequested = async (campaignId, expenditureId, amount, recipient, purpose, event) => {
      console.log('ExpenditureRequested event:', { 
        campaignId: campaignId.toString(), 
        expenditureId: expenditureId.toString(),
        amount: ethers.formatEther(amount),
        purpose
      });

      const campaign = campaigns.find(c => c.id === Number(campaignId));
      const campaignName = campaign?.name || `Campaign #${campaignId}`;

      toast.info(
        <div>
          <p className="font-semibold">Expenditure Requested</p>
          <p className="text-sm">{ethers.formatEther(amount)} ETH from {campaignName}</p>
          <p className="text-xs text-gray-300">{purpose}</p>
          <a 
            href={getEtherscanUrl(event.log.transactionHash, chainId)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs flex items-center mt-1"
          >
            View on Etherscan →
          </a>
        </div>,
        { duration: 5000, icon: '📋' }
      );

      // Update campaign data
      await updateCampaign(Number(campaignId));
    };

    // ExpenditureExecuted event
    const onExpenditureExecuted = async (campaignId, expenditureId, amount, recipient, event) => {
      console.log('ExpenditureExecuted event:', { 
        campaignId: campaignId.toString(), 
        expenditureId: expenditureId.toString(),
        amount: ethers.formatEther(amount),
        recipient
      });

      const campaign = campaigns.find(c => c.id === Number(campaignId));
      const campaignName = campaign?.name || `Campaign #${campaignId}`;

      toast.success(
        <div>
          <p className="font-semibold">Expenditure Executed!</p>
          <p className="text-sm">{ethers.formatEther(amount)} ETH from {campaignName}</p>
          <a 
            href={getEtherscanUrl(event.log.transactionHash, chainId)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs flex items-center mt-1"
          >
            View on Etherscan →
          </a>
        </div>,
        { duration: 5000, icon: '✅' }
      );

      // Update campaign data
      await updateCampaign(Number(campaignId));
    };

    // EmergencyWithdrawal event
    const onEmergencyWithdrawal = async (to, amount, event) => {
      console.log('EmergencyWithdrawal event:', { 
        to, 
        amount: ethers.formatEther(amount) 
      });

      toast.error(
        <div>
          <p className="font-semibold">Emergency Withdrawal!</p>
          <p className="text-sm">{ethers.formatEther(amount)} ETH withdrawn</p>
          <a 
            href={getEtherscanUrl(event.log.transactionHash, chainId)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-xs flex items-center mt-1"
          >
            View on Etherscan →
          </a>
        </div>,
        { duration: 6000, icon: '⚠️' }
      );

      // Reload all campaigns
      await loadCampaigns();
    };

    // Register event listeners
    contract.on('CampaignCreated', onCampaignCreated);
    contract.on('DonationReceived', onDonationReceived);
    contract.on('ExpenditureRequested', onExpenditureRequested);
    contract.on('ExpenditureExecuted', onExpenditureExecuted);
    contract.on('EmergencyWithdrawal', onEmergencyWithdrawal);

    listeners.push(
      { event: 'CampaignCreated', handler: onCampaignCreated },
      { event: 'DonationReceived', handler: onDonationReceived },
      { event: 'ExpenditureRequested', handler: onExpenditureRequested },
      { event: 'ExpenditureExecuted', handler: onExpenditureExecuted },
      { event: 'EmergencyWithdrawal', handler: onEmergencyWithdrawal }
    );

    setEventListeners(listeners);
    console.log('Event listeners registered:', listeners.length);

    // Cleanup function
    return () => {
      console.log('Cleaning up event listeners...');
      contract.off('CampaignCreated', onCampaignCreated);
      contract.off('DonationReceived', onDonationReceived);
      contract.off('ExpenditureRequested', onExpenditureRequested);
      contract.off('ExpenditureExecuted', onExpenditureExecuted);
      contract.off('EmergencyWithdrawal', onEmergencyWithdrawal);
    };
  }, [contract, provider, chainId, campaigns, loadCampaigns, updateCampaign]);

  // Load campaigns on mount
  useEffect(() => {
    if (contract) {
      loadCampaigns();
    }
  }, [contract, loadCampaigns]);

  // Get campaign by ID
  const getCampaignById = useCallback((id) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  // Refresh single campaign
  const refreshCampaign = useCallback(async (campaignId) => {
    await updateCampaign(campaignId);
  }, [updateCampaign]);

  // Refresh all campaigns
  const refreshAllCampaigns = useCallback(async () => {
    await loadCampaigns();
  }, [loadCampaigns]);

  const value = {
    campaigns,
    loading,
    contract,
    eventListeners,
    getCampaignById,
    refreshCampaign,
    refreshAllCampaigns,
    loadCampaigns
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};

export default CampaignContext;
