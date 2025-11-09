import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { 
  Settings, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  ExternalLink,
  User,
  Calendar,
  TrendingUp,
  Loader
} from 'lucide-react';
import CharityABI from '../abi/Charity.json';

const AdminPanelFinal = () => {
  const { account, signer, isConnected, chainId } = useWallet();
  
  // State
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  
  // Form state
  const [expenditureForm, setExpenditureForm] = useState({
    amount: '',
    recipient: '',
    purpose: ''
  });

  // Contract address - update this with your deployed address
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  // Get contract instance
  const getContract = useCallback(() => {
    if (!signer) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CharityABI.abi, signer);
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

  // Load campaigns created by current user
  const loadMyCampaigns = useCallback(async () => {
    if (!account || !signer) return;

    try {
      setLoading(true);
      const contract = getContract();
      if (!contract) return;

      const campaignCount = await contract.campaignCount();
      const myCampaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.getCampaign(i);
        
        // Only include campaigns where current user is admin
        if (campaign.admin.toLowerCase() === account.toLowerCase()) {
          const isActive = await contract.isCampaignActive(i);
          const progress = await contract.getCampaignProgress(i);
          
          myCampaigns.push({
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
        }
      }

      setCampaigns(myCampaigns);
      
      // Auto-select first campaign if available
      if (myCampaigns.length > 0 && !selectedCampaign) {
        setSelectedCampaign(myCampaigns[0]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [account, signer, getContract, selectedCampaign]);

  // Load expenditures for selected campaign
  const loadExpenditures = useCallback(async () => {
    if (!selectedCampaign || !signer) return;

    try {
      const contract = getContract();
      if (!contract) return;

      const expenditureList = await contract.getCampaignExpenditures(selectedCampaign.id);
      
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
      toast.error('Failed to load expenditures');
    }
  }, [selectedCampaign, signer, getContract]);

  // Request new expenditure
  const handleRequestExpenditure = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign || !signer) {
      toast.error('Please connect wallet and select a campaign');
      return;
    }

    // Validation
    if (!expenditureForm.amount || parseFloat(expenditureForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!ethers.isAddress(expenditureForm.recipient)) {
      toast.error('Please enter a valid recipient address');
      return;
    }

    if (!expenditureForm.purpose.trim()) {
      toast.error('Please enter a purpose');
      return;
    }

    if (parseFloat(expenditureForm.amount) > parseFloat(selectedCampaign.balance)) {
      toast.error('Amount exceeds campaign balance');
      return;
    }

    try {
      setProcessing(true);
      const contract = getContract();
      
      const amountWei = ethers.parseEther(expenditureForm.amount);
      
      toast.loading('Requesting expenditure...', { id: 'request-exp' });
      
      const tx = await contract.requestExpenditure(
        selectedCampaign.id,
        amountWei,
        expenditureForm.recipient,
        expenditureForm.purpose
      );

      toast.loading('Waiting for confirmation...', { id: 'request-exp' });
      const receipt = await tx.wait();

      toast.success(
        <div>
          <p>Expenditure requested successfully!</p>
          <a 
            href={getEtherscanUrl(receipt.hash)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center mt-1"
          >
            View on Etherscan <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>,
        { id: 'request-exp', duration: 5000 }
      );

      // Reset form
      setExpenditureForm({ amount: '', recipient: '', purpose: '' });
      setShowExpenditureForm(false);

      // Reload data
      await loadExpenditures();
      await loadMyCampaigns();
    } catch (error) {
      console.error('Error requesting expenditure:', error);
      
      let errorMessage = 'Failed to request expenditure';
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas';
      }
      
      toast.error(errorMessage, { id: 'request-exp' });
    } finally {
      setProcessing(false);
    }
  };

  // Execute expenditure
  const handleExecuteExpenditure = async (expenditureId) => {
    if (!selectedCampaign || !signer) {
      toast.error('Please connect wallet and select a campaign');
      return;
    }

    try {
      setProcessing(true);
      const contract = getContract();
      
      toast.loading('Executing expenditure...', { id: 'execute-exp' });
      
      const tx = await contract.executeExpenditure(
        selectedCampaign.id,
        expenditureId
      );

      toast.loading('Waiting for confirmation...', { id: 'execute-exp' });
      const receipt = await tx.wait();

      toast.success(
        <div>
          <p>Expenditure executed successfully!</p>
          <a 
            href={getEtherscanUrl(receipt.hash)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm flex items-center mt-1"
          >
            View on Etherscan <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>,
        { id: 'execute-exp', duration: 5000 }
      );

      // Reload data
      await loadExpenditures();
      await loadMyCampaigns();
    } catch (error) {
      console.error('Error executing expenditure:', error);
      
      let errorMessage = 'Failed to execute expenditure';
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message.includes('ExpenditureAlreadyExecuted')) {
        errorMessage = 'Expenditure already executed';
      } else if (error.message.includes('InsufficientBalance')) {
        errorMessage = 'Insufficient campaign balance';
      }
      
      toast.error(errorMessage, { id: 'execute-exp' });
    } finally {
      setProcessing(false);
    }
  };

  // Setup event listeners
  useEffect(() => {
    if (!signer) return;

    const contract = getContract();
    if (!contract) return;

    // Listen for ExpenditureRequested events
    const onExpenditureRequested = (campaignId, expenditureId, amount, recipient, purpose) => {
      if (selectedCampaign && Number(campaignId) === selectedCampaign.id) {
        toast.success('New expenditure request detected!');
        loadExpenditures();
        loadMyCampaigns();
      }
    };

    // Listen for ExpenditureExecuted events
    const onExpenditureExecuted = (campaignId, expenditureId, amount, recipient) => {
      if (selectedCampaign && Number(campaignId) === selectedCampaign.id) {
        toast.success('Expenditure executed!');
        loadExpenditures();
        loadMyCampaigns();
      }
    };

    contract.on('ExpenditureRequested', onExpenditureRequested);
    contract.on('ExpenditureExecuted', onExpenditureExecuted);

    return () => {
      contract.off('ExpenditureRequested', onExpenditureRequested);
      contract.off('ExpenditureExecuted', onExpenditureExecuted);
    };
  }, [signer, selectedCampaign, getContract, loadExpenditures, loadMyCampaigns]);

  // Load data on mount and when account changes
  useEffect(() => {
    if (isConnected && account) {
      loadMyCampaigns();
    }
  }, [isConnected, account, loadMyCampaigns]);

  // Load expenditures when campaign changes
  useEffect(() => {
    if (selectedCampaign) {
      loadExpenditures();
    }
  }, [selectedCampaign, loadExpenditures]);

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format address
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get status icon
  const getStatusIcon = (expenditure) => {
    if (expenditure.executed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  // Get status text
  const getStatusText = (expenditure) => {
    return expenditure.executed ? 'Executed' : 'Pending';
  };

  // Get status color
  const getStatusColor = (expenditure) => {
    return expenditure.executed 
      ? 'text-green-600 bg-green-50' 
      : 'text-yellow-600 bg-yellow-50';
  };

  // Not connected state
  if (!isConnected || !account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Settings className="mx-auto h-24 w-24" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-12 w-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  // No campaigns state
  if (campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Settings className="mx-auto h-24 w-24" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Campaigns Found</h2>
            <p className="text-gray-600 mb-6">You haven't created any campaigns yet.</p>
            <a href="/create-campaign" className="btn-primary">
              Create Your First Campaign
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Admin Panel</h1>
          <p className="text-gray-600">Manage your campaigns and expenditure requests</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                My Campaigns
              </h2>
              
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div 
                    key={campaign.id} 
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedCampaign?.id === campaign.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="font-medium text-gray-900 mb-1 truncate">
                      {campaign.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {parseFloat(campaign.balance).toFixed(4)} / {parseFloat(campaign.goal).toFixed(4)} ETH
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {campaign.progress}% • {campaign.expenditureCount} requests
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {campaign.isActive ? 'Active' : 'Expired'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Stats */}
            {selectedCampaign && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Balance</span>
                    <span className="font-medium">{parseFloat(selectedCampaign.balance).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Goal</span>
                    <span className="font-medium">{parseFloat(selectedCampaign.goal).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{selectedCampaign.progress}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Deadline</span>
                    <span className="font-medium">{formatDate(selectedCampaign.deadline)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expenditures</span>
                    <span className="font-medium">{selectedCampaign.expenditureCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expenditure Management */}
          <div className="lg:col-span-2">
            {selectedCampaign && (
              <>
                {/* Campaign Header */}
                <div className="card mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCampaign.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {selectedCampaign.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Campaign Progress</span>
                      <span>{selectedCampaign.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(selectedCampaign.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {parseFloat(selectedCampaign.balance).toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-500">Balance (ETH)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {parseFloat(selectedCampaign.goal).toFixed(4)}
                      </div>
                      <div className="text-sm text-gray-500">Goal (ETH)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedCampaign.expenditureCount}
                      </div>
                      <div className="text-sm text-gray-500">Expenditures</div>
                    </div>
                  </div>
                </div>

                {/* Expenditure Requests */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Expenditure Requests
                    </h2>
                    {selectedCampaign.isActive && parseFloat(selectedCampaign.balance) > 0 && (
                      <button
                        onClick={() => setShowExpenditureForm(!showExpenditureForm)}
                        className="btn-primary text-sm flex items-center"
                        disabled={processing}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New Request
                      </button>
                    )}
                  </div>

                  {/* New Expenditure Form */}
                  {showExpenditureForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Request New Expenditure
                      </h3>
                      <form onSubmit={handleRequestExpenditure} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (ETH)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            max={selectedCampaign.balance}
                            value={expenditureForm.amount}
                            onChange={(e) => setExpenditureForm(prev => ({ ...prev, amount: e.target.value }))}
                            className="input-field"
                            placeholder="0.1"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {parseFloat(selectedCampaign.balance).toFixed(4)} ETH
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Address
                          </label>
                          <input
                            type="text"
                            value={expenditureForm.recipient}
                            onChange={(e) => setExpenditureForm(prev => ({ ...prev, recipient: e.target.value }))}
                            className="input-field"
                            placeholder="0x..."
                            required
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
                            required
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="btn-primary text-sm flex-1"
                            disabled={processing}
                          >
                            {processing ? 'Processing...' : 'Submit Request'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowExpenditureForm(false)}
                            className="btn-secondary text-sm"
                            disabled={processing}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Expenditures List */}
                  {expenditures.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No expenditure requests yet</p>
                      {selectedCampaign.isActive && parseFloat(selectedCampaign.balance) > 0 && (
                        <button
                          onClick={() => setShowExpenditureForm(true)}
                          className="btn-primary text-sm mt-4"
                        >
                          Create First Request
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expenditures.map((expenditure) => (
                        <div key={expenditure.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-medium text-gray-900">
                                  {parseFloat(expenditure.amount).toFixed(4)} ETH
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expenditure)}`}>
                                  {getStatusText(expenditure)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {expenditure.purpose}
                              </p>
                              <div className="text-xs text-gray-500">
                                <div>Recipient: {formatAddress(expenditure.recipient)}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(expenditure)}
                            </div>
                          </div>

                          {/* Action Button */}
                          {!expenditure.executed && (
                            <div className="flex space-x-2 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => handleExecuteExpenditure(expenditure.id)}
                                disabled={processing || parseFloat(expenditure.amount) > parseFloat(selectedCampaign.balance)}
                                className="btn-primary text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                {processing ? 'Processing...' : 'Execute'}
                              </button>
                              {parseFloat(expenditure.amount) > parseFloat(selectedCampaign.balance) && (
                                <span className="text-xs text-red-600 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Insufficient balance
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelFinal;
