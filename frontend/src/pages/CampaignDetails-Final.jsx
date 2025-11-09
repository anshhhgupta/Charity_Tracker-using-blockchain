import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Heart, 
  Users, 
  DollarSign, 
  Calendar, 
  User, 
  TrendingUp,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader,
  AlertCircle
} from 'lucide-react';
import CharityABI from '../abi/Charity.json';

const CampaignDetailsFinal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, signer, isConnected, chainId } = useWallet();
  
  // State
  const [campaign, setCampaign] = useState(null);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');

  // Contract address - update this with your deployed address
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  // Get contract instance
  const getContract = useCallback(() => {
    const provider = signer || new ethers.JsonRpcProvider(
      import.meta.env.VITE_LOCALHOST_RPC_URL || 'http://localhost:8545'
    );
    return new ethers.Contract(CONTRACT_ADDRESS, CharityABI.abi, provider);
  }, [signer]);

  // Get Etherscan URL
  const getEtherscanUrl = (txHash) => {
    const baseUrls = {
      1: 'https://etherscan.io',
      11155111: 'https://sepolia.etherscan.io',
      31337: 'http://localhost:4000'
    };
    const baseUrl = baseUrls[chainId] || 'https://etherscan.io';
    return `${baseUrl}/tx/${txHash}`;
  };

  // Load campaign details
  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const contract = getContract();
      
      const campaignData = await contract.getCampaign(id);
      const isActive = await contract.isCampaignActive(id);
      const progress = await contract.getCampaignProgress(id);
      
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
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign details');
      
      // If campaign not found, redirect to campaigns page
      if (error.message.includes('CampaignNotFound')) {
        setTimeout(() => navigate('/campaigns'), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [id, getContract, navigate]);

  // Load expenditures
  const loadExpenditures = useCallback(async () => {
    try {
      const contract = getContract();
      const expenditureList = await contract.getCampaignExpenditures(id);
      
      const formattedExpenditures = expenditureList.map((exp, index) => ({
        id: index,
        amount: ethers.formatEther(exp.amount),
        recipient: exp.recipient,
        purpose: exp.purpose,
        executed: exp.executed
      }));

      setExpenditures(formattedExpenditures);
    } catch (error) {
      console.error('Error loading expenditures:', error);
    }
  }, [id, getContract]);

  // Handle donation
  const handleDonate = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (!campaign.isActive) {
      toast.error('This campaign has expired');
      return;
    }

    try {
      setDonating(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CharityABI.abi, signer);
      
      const amountWei = ethers.parseEther(donationAmount);
      
      toast.loading('Processing donation...', { id: 'donate' });
      
      const tx = await contract.donate(id, { value: amountWei });

      toast.loading('Waiting for confirmation...', { id: 'donate' });
      const receipt = await tx.wait();

      toast.success(
        <div>
          <p>Thank you for your donation of {donationAmount} ETH!</p>
          <a 
            href={getEtherscanUrl(receipt.hash)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center mt-1"
          >
            View on Etherscan <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>,
        { id: 'donate', duration: 5000 }
      );

      // Reset form
      setDonationAmount('');

      // Reload campaign data
      await loadCampaign();
    } catch (error) {
      console.error('Error donating:', error);
      
      let errorMessage = 'Donation failed';
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for donation and gas';
      } else if (error.message.includes('CampaignExpired')) {
        errorMessage = 'Campaign has expired';
      }
      
      toast.error(errorMessage, { id: 'donate' });
    } finally {
      setDonating(false);
    }
  };

  // Setup event listeners
  useEffect(() => {
    const contract = getContract();

    // Listen for DonationReceived events
    const onDonationReceived = (campaignId, donor, amount) => {
      if (Number(campaignId) === Number(id)) {
        toast.success(`New donation received: ${ethers.formatEther(amount)} ETH!`);
        loadCampaign();
      }
    };

    // Listen for ExpenditureExecuted events
    const onExpenditureExecuted = (campaignId, expenditureId, amount, recipient) => {
      if (Number(campaignId) === Number(id)) {
        toast.info(`Expenditure executed: ${ethers.formatEther(amount)} ETH`);
        loadCampaign();
        loadExpenditures();
      }
    };

    contract.on('DonationReceived', onDonationReceived);
    contract.on('ExpenditureExecuted', onExpenditureExecuted);

    return () => {
      contract.off('DonationReceived', onDonationReceived);
      contract.off('ExpenditureExecuted', onExpenditureExecuted);
    };
  }, [id, getContract, loadCampaign, loadExpenditures]);

  // Load data on mount
  useEffect(() => {
    loadCampaign();
    loadExpenditures();
  }, [loadCampaign, loadExpenditures]);

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format address
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get time remaining
  const getTimeRemaining = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return 'Less than 1 hour remaining';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  // Campaign not found
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
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
          <div className="lg:col-span-2 space-y-6">
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
                      {formatAddress(campaign.admin)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.isActive 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.isActive ? 'Active' : 'Expired'}
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
                  <span>Campaign Progress</span>
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {parseFloat(campaign.balance).toFixed(4)} ETH
                  </div>
                  <div className="text-sm text-gray-500">Raised</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {parseFloat(campaign.goal).toFixed(4)} ETH
                  </div>
                  <div className="text-sm text-gray-500">Goal</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {campaign.expenditureCount}
                  </div>
                  <div className="text-sm text-gray-500">Expenditures</div>
                </div>
              </div>
            </div>

            {/* Expenditure History */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                Expenditure History
              </h2>
              
              {expenditures.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No expenditures yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenditures.map((expenditure) => (
                    <div key={expenditure.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-medium text-gray-900">
                              {parseFloat(expenditure.amount).toFixed(4)} ETH
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              expenditure.executed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {expenditure.executed ? 'Executed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {expenditure.purpose}
                          </p>
                          <div className="text-xs text-gray-500">
                            Recipient: {formatAddress(expenditure.recipient)}
                          </div>
                        </div>
                        <div>
                          {expenditure.executed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Make a Donation
                </h3>
                
                <form onSubmit={handleDonate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="input-field"
                      placeholder="0.1"
                      disabled={donating}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['0.1', '0.5', '1.0'].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationAmount(amount)}
                        className="btn-secondary text-sm py-2"
                        disabled={donating}
                      >
                        {amount} ETH
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={donating || !donationAmount || parseFloat(donationAmount) <= 0 || !isConnected}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {donating ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Processing...
                      </span>
                    ) : !isConnected ? (
                      'Connect Wallet to Donate'
                    ) : (
                      'Donate Now'
                    )}
                  </button>
                </form>

                {!isConnected && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Connect your wallet to make a donation
                  </p>
                )}
              </div>
            )}

            {/* Campaign expired message */}
            {!campaign.isActive && (
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Campaign Expired
                    </h4>
                    <p className="text-sm text-yellow-800">
                      This campaign has reached its deadline and is no longer accepting donations.
                    </p>
                  </div>
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
                  <span className="text-gray-500">Campaign Admin</span>
                  <span className="font-medium">{formatAddress(campaign.admin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${
                    campaign.isActive ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {campaign.isActive ? 'Active' : 'Expired'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deadline</span>
                  <span className="font-medium">{formatDate(campaign.deadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time Remaining</span>
                  <span className="font-medium">{getTimeRemaining(campaign.deadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{campaign.progress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expenditures</span>
                  <span className="font-medium">{campaign.expenditureCount}</span>
                </div>
              </div>
            </div>

            {/* Transparency Notice */}
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Complete Transparency
                  </h4>
                  <p className="text-sm text-blue-800">
                    All donations and expenditures are recorded on the blockchain. 
                    You can verify every transaction on Etherscan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsFinal;
