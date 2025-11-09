import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useEventListener } from '../hooks/useEventListener';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS } from '../config/config';
import CharityABI from '../abi/Charity.json';

/**
 * Real-time Campaign Details Component
 * Demonstrates live updates using event listeners
 */
const CampaignDetailsRealtime = ({ campaignId }) => {
  const { provider, signer } = useWallet();
  const [campaign, setCampaign] = useState(null);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);

  // Initialize contract
  useEffect(() => {
    if (!provider) return;

    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CharityABI.abi,
      signer || provider
    );
    setContract(contractInstance);
  }, [provider, signer]);

  // Load campaign data
  const loadCampaignData = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      
      // Get campaign details
      const campaignData = await contract.getCampaign(campaignId);
      const isActive = await contract.isCampaignActive(campaignId);
      const progress = await contract.getCampaignProgress(campaignId);

      setCampaign({
        id: Number(campaignData.id),
        name: campaignData.name,
        description: campaignData.description,
        goal: ethers.formatEther(campaignData.goal),
        balance: ethers.formatEther(campaignData.balance),
        admin: campaignData.admin,
        deadline: Number(campaignData.deadline),
        expenditureCount: Number(campaignData.expenditureCount),
        isActive,
        progress: Number(progress)
      });

      // Load expenditures
      const expenditureCount = Number(campaignData.expenditureCount);
      const expenditureList = [];

      for (let i = 0; i < expenditureCount; i++) {
        try {
          const exp = await contract.getExpenditure(campaignId, i);
          expenditureList.push({
            id: Number(exp.id),
            amount: ethers.formatEther(exp.amount),
            recipient: exp.recipient,
            purpose: exp.purpose,
            executed: exp.executed,
            approvalCount: Number(exp.approvalCount)
          });
        } catch (error) {
          console.warn(`Failed to load expenditure ${i}:`, error);
        }
      }

      setExpenditures(expenditureList);
    } catch (error) {
      console.error('Error loading campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (contract) {
      loadCampaignData();
    }
  }, [contract, campaignId]);

  // Real-time event handlers
  const handleDonationReceived = async ({ campaignId: eventCampaignId }) => {
    if (eventCampaignId === campaignId) {
      console.log('Donation received, updating campaign data...');
      await loadCampaignData();
    }
  };

  const handleExpenditureRequested = async ({ campaignId: eventCampaignId }) => {
    if (eventCampaignId === campaignId) {
      console.log('Expenditure requested, updating campaign data...');
      await loadCampaignData();
    }
  };

  const handleExpenditureExecuted = async ({ campaignId: eventCampaignId }) => {
    if (eventCampaignId === campaignId) {
      console.log('Expenditure executed, updating campaign data...');
      await loadCampaignData();
    }
  };

  // Setup event listeners for this specific campaign
  const { activeListeners } = useEventListener({
    onDonationReceived: handleDonationReceived,
    onExpenditureRequested: handleExpenditureRequested,
    onExpenditureExecuted: handleExpenditureExecuted,
    showToasts: true,
    campaignId: campaignId // Only listen to events for this campaign
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center p-8 text-gray-400">
        Campaign not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time indicator */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
          <p className="text-gray-400 text-sm">{campaign.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">
            Live ({activeListeners} listeners)
          </span>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Current Balance</p>
          <p className="text-2xl font-bold text-white">{campaign.balance} ETH</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Goal</p>
          <p className="text-2xl font-bold text-white">{campaign.goal} ETH</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-400 text-sm">Progress</p>
          <p className="text-2xl font-bold text-white">{campaign.progress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(campaign.progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Expenditures */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Expenditures ({expenditures.length})
        </h3>
        {expenditures.length === 0 ? (
          <p className="text-gray-400">No expenditures yet</p>
        ) : (
          <div className="space-y-3">
            {expenditures.map((exp) => (
              <div
                key={exp.id}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-semibold">{exp.purpose}</p>
                  <p className="text-gray-400 text-sm">
                    {exp.amount} ETH to {exp.recipient.slice(0, 10)}...
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      exp.executed
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-black'
                    }`}
                  >
                    {exp.executed ? 'Executed' : 'Pending'}
                  </span>
                  <p className="text-gray-400 text-xs mt-1">
                    {exp.approvalCount} approvals
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Status */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status:</span>
          <span
            className={`px-4 py-2 rounded-full font-semibold ${
              campaign.isActive
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {campaign.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-gray-400">Deadline:</span>
          <span className="text-white">
            {new Date(campaign.deadline * 1000).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsRealtime;
