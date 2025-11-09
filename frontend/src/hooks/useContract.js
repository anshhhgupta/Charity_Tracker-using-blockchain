import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS, NETWORK_CONFIG } from '../config/config';
import CharityABI from '../abi/Charity.json';
import toast from 'react-hot-toast';

/**
 * Custom hook for interacting with the Charity contract
 * Provides contract instance and helper functions
 */
export const useContract = () => {
  const { signer, provider, chainId, isConnected } = useWallet();
  const [contract, setContract] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create provider if not available
        let contractProvider = provider;
        if (!contractProvider) {
          contractProvider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
        }

        // Create contract instance with signer if available, otherwise with provider
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CharityABI.abi,
          signer || contractProvider
        );

        setContract(contractInstance);

        // Test contract connection and get basic info
        try {
          const campaignCount = await contractInstance.campaignCount();
          const contractBalance = await contractInstance.getContractBalance();
          
          setContractInfo({
            address: CONTRACT_ADDRESS,
            campaignCount: Number(campaignCount),
            balance: ethers.formatEther(contractBalance),
            isConnected: true
          });

          console.log('Contract initialized:', {
            address: CONTRACT_ADDRESS,
            campaignCount: Number(campaignCount),
            balance: ethers.formatEther(contractBalance),
            network: NETWORK_CONFIG.name
          });
        } catch (testError) {
          console.warn('Contract test call failed:', testError);
          setContractInfo({
            address: CONTRACT_ADDRESS,
            isConnected: false,
            error: testError.message
          });
        }
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError(err.message);
        toast.error('Failed to initialize contract');
      } finally {
        setLoading(false);
      }
    };

    initContract();
  }, [signer, provider, chainId]);

  // Get contract with signer (for write operations)
  const getContractWithSigner = useCallback(() => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CharityABI.abi, signer);
  }, [signer]);

  // Create campaign
  const createCampaign = useCallback(async (name, description, goal, deadline) => {
    try {
      const contractWithSigner = getContractWithSigner();
      const goalWei = ethers.parseEther(goal.toString());
      
      const tx = await contractWithSigner.createCampaign(
        name,
        description,
        goalWei,
        deadline
      );

      return { tx, hash: tx.hash };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }, [getContractWithSigner]);

  // Donate to campaign
  const donate = useCallback(async (campaignId, amount) => {
    try {
      const contractWithSigner = getContractWithSigner();
      const amountWei = ethers.parseEther(amount.toString());
      
      const tx = await contractWithSigner.donate(campaignId, {
        value: amountWei
      });

      return { tx, hash: tx.hash };
    } catch (error) {
      console.error('Error donating:', error);
      throw error;
    }
  }, [getContractWithSigner]);

  // Request expenditure
  const requestExpenditure = useCallback(async (campaignId, amount, recipient, purpose) => {
    try {
      const contractWithSigner = getContractWithSigner();
      const amountWei = ethers.parseEther(amount.toString());
      
      const tx = await contractWithSigner.requestExpenditure(
        campaignId,
        amountWei,
        recipient,
        purpose
      );

      return { tx, hash: tx.hash };
    } catch (error) {
      console.error('Error requesting expenditure:', error);
      throw error;
    }
  }, [getContractWithSigner]);

  // Execute expenditure
  const executeExpenditure = useCallback(async (campaignId, expenditureId) => {
    try {
      const contractWithSigner = getContractWithSigner();
      
      const tx = await contractWithSigner.executeExpenditure(
        campaignId,
        expenditureId
      );

      return { tx, hash: tx.hash };
    } catch (error) {
      console.error('Error executing expenditure:', error);
      throw error;
    }
  }, [getContractWithSigner]);

  // Get campaign
  const getCampaign = useCallback(async (campaignId) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const campaign = await contract.getCampaign(campaignId);
      const isActive = await contract.isCampaignActive(campaignId);
      const progress = await contract.getCampaignProgress(campaignId);
      
      return {
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
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  }, [contract]);

  // Get all campaigns
  const getAllCampaigns = useCallback(async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const count = await contract.campaignCount();
      const campaigns = [];
      
      for (let i = 0; i < count; i++) {
        try {
          const campaign = await getCampaign(i);
          campaigns.push(campaign);
        } catch (error) {
          console.warn(`Failed to load campaign ${i}:`, error);
        }
      }
      
      return campaigns;
    } catch (error) {
      console.error('Error getting all campaigns:', error);
      throw error;
    }
  }, [contract, getCampaign]);

  // Get campaign expenditures
  const getCampaignExpenditures = useCallback(async (campaignId) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      
      const expenditures = await contract.getCampaignExpenditures(campaignId);
      
      return expenditures.map((exp, index) => ({
        id: index,
        amount: ethers.formatEther(exp.amount),
        recipient: exp.recipient,
        purpose: exp.purpose,
        executed: exp.executed
      }));
    } catch (error) {
      console.error('Error getting expenditures:', error);
      throw error;
    }
  }, [contract]);

  // Wait for transaction
  const waitForTransaction = useCallback(async (tx) => {
    try {
      const receipt = await tx.wait();
      return {
        receipt,
        success: receipt.status === 1,
        hash: receipt.hash
      };
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  }, []);

  return {
    contract,
    contractInfo,
    loading,
    error,
    isConnected: isConnected && !!contract,
    // Write functions
    createCampaign,
    donate,
    requestExpenditure,
    executeExpenditure,
    // Read functions
    getCampaign,
    getAllCampaigns,
    getCampaignExpenditures,
    // Utilities
    waitForTransaction,
    getContractWithSigner
  };
};
