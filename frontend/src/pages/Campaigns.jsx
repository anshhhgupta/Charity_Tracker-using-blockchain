import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../context/ContractContext';
import { useEvents } from '../context/EventContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const { account, signer, isConnected } = useWallet();
  const { donate, waitForTransaction } = useContract();
  const { campaigns, loading } = useEvents();
  const [donating, setDonating] = useState({});

  // Campaigns are now loaded automatically via EventContext

  const handleDonate = async (campaignId, amount) => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setDonating(prev => ({ ...prev, [campaignId]: true }));
      
      const result = await donate(campaignId, amount, signer);
      
      toast.success('Transaction submitted! Waiting for confirmation...');
      const receipt = await waitForTransaction(result.tx);
      
      if (receipt.success) {
        toast.success(`Donation successful! View on Etherscan: ${receipt.etherscanUrl}`);
        // Data will be automatically updated via event listeners
      } else {
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Error donating:', error);
      toast.error('Donation failed');
    } finally {
      setDonating(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Charity Campaigns
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover and support meaningful causes that are making a difference in the world.
            Every donation helps create positive change.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500">Be the first to create a campaign and make a difference!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                      {campaign.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {campaign.description}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{campaign.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Raised</span>
                    <p className="font-semibold text-gray-900">
                      {parseFloat(campaign.raised).toFixed(4)} ETH
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Goal</span>
                    <p className="font-semibold text-gray-900">
                      {parseFloat(campaign.goal).toFixed(4)} ETH
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p>Donors: {campaign.totalDonors}</p>
                  <p className="truncate">Creator: {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}</p>
                </div>

                {campaign.isActive && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="0.1"
                        step="0.01"
                        min="0.001"
                        className="flex-1 input-field"
                        id={`amount-${campaign.id}`}
                      />
                      <button
                        onClick={() => {
                          const amount = document.getElementById(`amount-${campaign.id}`).value;
                          if (amount && parseFloat(amount) > 0) {
                            handleDonate(campaign.id, amount);
                          } else {
                            toast.error('Please enter a valid amount');
                          }
                        }}
                        disabled={donating[campaign.id]}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {donating[campaign.id] ? 'Donating...' : 'Donate'}
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          document.getElementById(`amount-${campaign.id}`).value = '0.1';
                          handleDonate(campaign.id, '0.1');
                        }}
                        disabled={donating[campaign.id]}
                        className="btn-secondary text-xs py-1 px-2 disabled:opacity-50"
                      >
                        0.1 ETH
                      </button>
                      <button
                        onClick={() => {
                          document.getElementById(`amount-${campaign.id}`).value = '0.5';
                          handleDonate(campaign.id, '0.5');
                        }}
                        disabled={donating[campaign.id]}
                        className="btn-secondary text-xs py-1 px-2 disabled:opacity-50"
                      >
                        0.5 ETH
                      </button>
                      <button
                        onClick={() => {
                          document.getElementById(`amount-${campaign.id}`).value = '1.0';
                          handleDonate(campaign.id, '1.0');
                        }}
                        disabled={donating[campaign.id]}
                        className="btn-secondary text-xs py-1 px-2 disabled:opacity-50"
                      >
                        1.0 ETH
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <a
            href="/create-campaign"
            className="btn-primary text-lg px-8 py-3"
          >
            Create New Campaign
          </a>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
