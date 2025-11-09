import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { CONTRACT_ADDRESS } from '../config/config';
import CharityABI from '../abi/Charity.json';
import { useEventListener } from '../hooks/useEventListener';

const CampaignContext = createContext();

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};

export const CampaignProvider = ({ children }) => {
  const { provider, signer } = useWallet();
  
  // State
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);

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

  // Update single campaign (real-time)
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

      return updatedCampaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return null;
    }
  }, [contract]);

  // Event handlers for real-time updates
  const handleCampaignCreated = useCallback(async ({ campaignId }) => {
    console.log('Handling CampaignCreated event, reloading all campaigns...');
    await loadCampaigns();
  }, [loadCampaigns]);

  const handleDonationReceived = useCallback(async ({ campaignId }) => {
    console.log(`Handling DonationReceived event for campaign ${campaignId}`);
    await updateCampaign(campaignId);
  }, [updateCampaign]);

  const handleExpenditureRequested = useCallback(async ({ campaignId }) => {
    console.log(`Handling ExpenditureRequested event for campaign ${campaignId}`);
    await updateCampaign(campaignId);
  }, [updateCampaign]);

  const handleExpenditureExecuted = useCallback(async ({ campaignId }) => {
    console.log(`Handling ExpenditureExecuted event for campaign ${campaignId}`);
    await updateCampaign(campaignId);
  }, [updateCampaign]);

  const handleEmergencyWithdrawal = useCallback(async () => {
    console.log('Handling EmergencyWithdrawal event, reloading all campaigns...');
    await loadCampaigns();
  }, [loadCampaigns]);

  // Setup event listeners with real-time UI updates
  const { activeListeners } = useEventListener({
    onCampaignCreated: handleCampaignCreated,
    onDonationReceived: handleDonationReceived,
    onExpenditureRequested: handleExpenditureRequested,
    onExpenditureExecuted: handleExpenditureExecuted,
    onEmergencyWithdrawal: handleEmergencyWithdrawal,
    showToasts: true
  });

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
    return await updateCampaign(campaignId);
  }, [updateCampaign]);

  // Refresh all campaigns
  const refreshAllCampaigns = useCallback(async () => {
    await loadCampaigns();
  }, [loadCampaigns]);

  const value = {
    campaigns,
    loading,
    contract,
    activeListeners,
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
