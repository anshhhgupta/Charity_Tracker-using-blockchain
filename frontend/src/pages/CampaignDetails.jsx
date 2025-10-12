import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../context/ContractContext';
import { useEvents } from '../context/EventContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  DollarSign, 
  Calendar, 
  User, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const CampaignDetails = () => {
  const { id } = useParams();
  const { account, signer, isConnected } = useWallet();
  const { donate, requestExpenditure, waitForTransaction } = useContract();
  const { 
    getCampaignById, 
    getCampaignDonations, 
    getCampaignExpenditures, 
    loading 
  } = useEvents();
  const [donating, setDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [expenditureForm, setExpenditureForm] = useState({
    amount: '',
    purpose: ''
  });

  // Get campaign data from EventContext
  const campaign = getCampaignById(parseInt(id));
  const donations = getCampaignDonations(parseInt(id));
  const expenditures = getCampaignExpenditures(parseInt(id));

  // Data is now loaded automatically via EventContext

  const handleDonate = async () => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    try {
      setDonating(true);
      
      const result = await donate(parseInt(id), donationAmount, signer);
      
      if (result.success) {
        setDonationAmount('');
        // Data will be automatically updated via event listeners
        console.log('Donation successful:', result.receipt);
      }
    } catch (error) {
      console.error('Error donating:', error);
    } finally {
      setDonating(false);
    }
  };

  const handleRequestExpenditure = async () => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (account !== campaign.creator) {
      toast.error('Only campaign creator can request expenditures');
      return;
    }

    if (!expenditureForm.amount || parseFloat(expenditureForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!expenditureForm.purpose.trim()) {
      toast.error('Please enter a purpose');
      return;
    }

    try {
      const result = await requestExpenditure(
        parseInt(id),
        expenditureForm.amount,
        expenditureForm.purpose,
        signer
      );
      
      if (result.success) {
        setExpenditureForm({ amount: '', purpose: '' });
        setShowExpenditureForm(false);
        // Data will be automatically updated via event listeners
        console.log('Expenditure request successful:', result.receipt);
      }
    } catch (error) {
      console.error('Error requesting expenditure:', error);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h2>
          <Link to="/campaigns" className="btn-primary">
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/campaigns" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {campaign.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {formatAddress(campaign.creator)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {campaign.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{campaign.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {parseFloat(campaign.raised).toFixed(4)} ETH
                  </div>
                  <div className="text-sm text-gray-500">Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {parseFloat(campaign.goal).toFixed(4)} ETH
                  </div>
                  <div className="text-sm text-gray-500">Goal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {campaign.totalDonors}
                  </div>
                  <div className="text-sm text-gray-500">Donors</div>
                </div>
              </div>
            </div>

            {/* Donations */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Recent Donations
              </h2>
              
              {donations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No donations yet</p>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 10).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatAddress(donation.donor)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(donation.timestamp)}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {parseFloat(donation.amount).toFixed(4)} ETH
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expenditures */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                  Expenditure Requests
                </h2>
                {isConnected && account === campaign.creator && campaign.isActive && (
                  <button
                    onClick={() => setShowExpenditureForm(!showExpenditureForm)}
                    className="btn-primary text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Request Expenditure
                  </button>
                )}
              </div>

              {/* Expenditure Form */}
              {showExpenditureForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Request New Expenditure</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (ETH)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={expenditureForm.amount}
                        onChange={(e) => setExpenditureForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="input-field"
                        placeholder="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose
                      </label>
                      <textarea
                        value={expenditureForm.purpose}
                        onChange={(e) => setExpenditureForm(prev => ({ ...prev, purpose: e.target.value }))}
                        className="input-field"
                        rows={3}
                        placeholder="Describe the purpose of this expenditure..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleRequestExpenditure}
                        className="btn-primary text-sm"
                      >
                        Submit Request
                      </button>
                      <button
                        onClick={() => setShowExpenditureForm(false)}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {expenditures.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No expenditure requests yet</p>
              ) : (
                <div className="space-y-3">
                  {expenditures.map((expenditure) => (
                    <div key={expenditure.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {parseFloat(expenditure.amount).toFixed(4)} ETH
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {expenditure.purpose}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {expenditure.executed ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Executed
                            </span>
                          ) : expenditure.approved ? (
                            <span className="flex items-center text-blue-600 text-sm">
                              <Clock className="h-4 w-4 mr-1" />
                              Approved
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-600 text-sm">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Requested by {formatAddress(expenditure.requester)} • {formatDate(expenditure.requestTimestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            {campaign.isActive && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Make a Donation
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.001"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="input-field"
                      placeholder="0.1"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['0.1', '0.5', '1.0'].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className="btn-secondary text-sm py-2"
                      >
                        {amount} ETH
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={donating || !donationAmount || parseFloat(donationAmount) <= 0}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {donating ? 'Processing...' : 'Donate Now'}
                  </button>
                </div>
              </div>
            )}

            {/* Campaign Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creator</span>
                  <span className="font-medium">{formatAddress(campaign.creator)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${
                    campaign.isActive ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {campaign.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Donors</span>
                  <span className="font-medium">{campaign.totalDonors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expenditures</span>
                  <span className="font-medium">{campaign.totalExpenditures}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
