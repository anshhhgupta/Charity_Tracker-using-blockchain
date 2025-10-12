import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../context/ContractContext';
import { useEvents } from '../context/EventContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { 
  Settings, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  User,
  Calendar
} from 'lucide-react';

const AdminPanel = () => {
  const { account, signer, isConnected } = useWallet();
  const { 
    requestExpenditure, 
    waitForTransaction,
    pauseContract,
    unpauseContract,
    emergencyWithdraw,
    getContractBalance,
    isContractPaused,
    activateCampaign,
    deactivateCampaign,
    approveExpenditure,
    executeExpenditure
  } = useContract();
  const { campaigns, expenditures, loading } = useEvents();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [expenditureForm, setExpenditureForm] = useState({
    amount: '',
    purpose: ''
  });
  const [contractPaused, setContractPaused] = useState(false);
  const [contractBalance, setContractBalance] = useState('0');
  const [emergencyAmount, setEmergencyAmount] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Filter campaigns created by current user
  const myCampaigns = campaigns.filter(campaign => 
    campaign.creator.toLowerCase() === account?.toLowerCase()
  );

  // Filter expenditures for user's campaigns
  const myExpenditures = expenditures.filter(expenditure => 
    myCampaigns.some(campaign => campaign.id === expenditure.campaignId)
  );

  // Load contract status
  useEffect(() => {
    const loadContractStatus = async () => {
      try {
        const paused = await isContractPaused();
        const balance = await getContractBalance();
        setContractPaused(paused);
        setContractBalance(balance);
      } catch (error) {
        console.error('Error loading contract status:', error);
      }
    };

    if (isConnected && account) {
      loadContractStatus();
    }
  }, [isConnected, account, isContractPaused, getContractBalance]);

  // Admin functions
  const handlePauseContract = async () => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setAdminLoading(true);
      const result = await pauseContract(signer);
      
      if (result.success) {
        setContractPaused(true);
        console.log('Contract paused successfully:', result.receipt);
      }
    } catch (error) {
      console.error('Error pausing contract:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUnpauseContract = async () => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setAdminLoading(true);
      const result = await unpauseContract(signer);
      
      if (result.success) {
        setContractPaused(false);
        console.log('Contract unpaused successfully:', result.receipt);
      }
    } catch (error) {
      console.error('Error unpausing contract:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!emergencyAmount || parseFloat(emergencyAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(emergencyAmount) > parseFloat(contractBalance)) {
      toast.error('Amount exceeds contract balance');
      return;
    }

    try {
      setAdminLoading(true);
      const result = await emergencyWithdraw(emergencyAmount, signer);
      
      if (result.success) {
        setEmergencyAmount('');
        // Refresh contract balance
        const balance = await getContractBalance();
        setContractBalance(balance);
        console.log('Emergency withdrawal successful:', result.receipt);
      }
    } catch (error) {
      console.error('Error emergency withdrawing:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleActivateCampaign = async (campaignId) => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setAdminLoading(true);
      const result = await activateCampaign(campaignId, signer);
      toast.success('Transaction submitted! Waiting for confirmation...');
      const receipt = await waitForTransaction(result.tx);
      
      if (receipt.success) {
        toast.success(`Campaign activated successfully! View on Etherscan: ${receipt.etherscanUrl}`);
      } else {
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Error activating campaign:', error);
      toast.error('Failed to activate campaign');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeactivateCampaign = async (campaignId) => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setAdminLoading(true);
      const result = await deactivateCampaign(campaignId, signer);
      toast.success('Transaction submitted! Waiting for confirmation...');
      const receipt = await waitForTransaction(result.tx);
      
      if (receipt.success) {
        toast.success(`Campaign deactivated successfully! View on Etherscan: ${receipt.etherscanUrl}`);
      } else {
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Error deactivating campaign:', error);
      toast.error('Failed to deactivate campaign');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleApproveExpenditure = async (expenditureId) => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setAdminLoading(true);
      const result = await approveExpenditure(expenditureId, signer);
      toast.success('Transaction submitted! Waiting for confirmation...');
      const receipt = await waitForTransaction(result.tx);
      
      if (receipt.success) {
        toast.success(`Expenditure approved successfully! View on Etherscan: ${receipt.etherscanUrl}`);
      } else {
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Error approving expenditure:', error);
      toast.error('Failed to approve expenditure');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleExecuteExpenditure = async (expenditureId) => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setAdminLoading(true);
      const result = await executeExpenditure(expenditureId, signer);
      toast.success('Transaction submitted! Waiting for confirmation...');
      const receipt = await waitForTransaction(result.tx);
      
      if (receipt.success) {
        toast.success(`Expenditure executed successfully! View on Etherscan: ${receipt.etherscanUrl}`);
        // Refresh contract balance
        const balance = await getContractBalance();
        setContractBalance(balance);
      } else {
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Error executing expenditure:', error);
      toast.error('Failed to execute expenditure');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleRequestExpenditure = async () => {
    if (!selectedCampaign) {
      toast.error('Please select a campaign');
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
        selectedCampaign.id,
        expenditureForm.amount,
        expenditureForm.purpose,
        signer
      );
      
      toast.success('Transaction submitted! Waiting for confirmation...');
      const receipt = await waitForTransaction(result.tx);
      
      if (receipt.success) {
        toast.success(`Expenditure request submitted! View on Etherscan: ${receipt.etherscanUrl}`);
        setExpenditureForm({ amount: '', purpose: '' });
        setShowExpenditureForm(false);
        // Data will be automatically updated via event listeners
      } else {
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Error requesting expenditure:', error);
      toast.error('Failed to request expenditure');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusIcon = (expenditure) => {
    if (expenditure.executed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (expenditure.approved) {
      return <Clock className="h-5 w-5 text-blue-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (expenditure) => {
    if (expenditure.executed) {
      return 'Executed';
    } else if (expenditure.approved) {
      return 'Approved';
    } else {
      return 'Pending';
    }
  };

  const getStatusColor = (expenditure) => {
    if (expenditure.executed) {
      return 'text-green-600 bg-green-50';
    } else if (expenditure.approved) {
      return 'text-blue-600 bg-blue-50';
    } else {
      return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (!isConnected || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your campaigns and expenditure requests</p>
        </div>

        {/* Contract Status & Admin Controls */}
        <div className="mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary-600" />
              Contract Status & Admin Controls
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contract Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contractPaused 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {contractPaused ? 'Paused' : 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Contract Balance</div>
                <div className="text-lg font-semibold text-gray-900">
                  {parseFloat(contractBalance).toFixed(4)} ETH
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">My Campaigns</div>
                <div className="text-lg font-semibold text-gray-900">
                  {myCampaigns.length}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">My Expenditures</div>
                <div className="text-lg font-semibold text-gray-900">
                  {myExpenditures.length}
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pause/Unpause Controls */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contract Control
                </label>
                <div className="flex space-x-2">
                  {contractPaused ? (
                    <button
                      onClick={handleUnpauseContract}
                      disabled={adminLoading}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adminLoading ? 'Unpausing...' : 'Unpause Contract'}
                    </button>
                  ) : (
                    <button
                      onClick={handlePauseContract}
                      disabled={adminLoading}
                      className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {adminLoading ? 'Pausing...' : 'Pause Contract'}
                    </button>
                  )}
                </div>
              </div>

              {/* Emergency Withdraw */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Emergency Withdraw
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={contractBalance}
                    value={emergencyAmount}
                    onChange={(e) => setEmergencyAmount(e.target.value)}
                    placeholder="Amount (ETH)"
                    className="form-input flex-1"
                  />
                  <button
                    onClick={handleEmergencyWithdraw}
                    disabled={adminLoading || !emergencyAmount}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adminLoading ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </div>
              </div>

              {/* Contract Balance Refresh */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Refresh Balance
                </label>
                <button
                  onClick={async () => {
                    const balance = await getContractBalance();
                    setContractBalance(balance);
                  }}
                  className="btn-secondary w-full"
                >
                  Refresh Balance
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Campaigns */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                My Campaigns
              </h2>
              
              {myCampaigns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No campaigns created yet</p>
              ) : (
                <div className="space-y-3">
                  {myCampaigns.map((campaign) => (
                    <div 
                      key={campaign.id} 
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCampaign?.id === campaign.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="font-medium text-gray-900 mb-1">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {parseFloat(campaign.raised).toFixed(4)} / {parseFloat(campaign.goal).toFixed(4)} ETH
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">
                          {campaign.progress}% complete • {campaign.totalDonors} donors
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {campaign.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (campaign.isActive) {
                                handleDeactivateCampaign(campaign.id);
                              } else {
                                handleActivateCampaign(campaign.id);
                              }
                            }}
                            disabled={adminLoading}
                            className={`text-xs px-2 py-1 rounded ${
                              campaign.isActive 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {campaign.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expenditure Management */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Expenditure Requests
                </h2>
                {selectedCampaign && selectedCampaign.isActive && (
                  <button
                    onClick={() => setShowExpenditureForm(!showExpenditureForm)}
                    className="btn-primary text-sm flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Request
                  </button>
                )}
              </div>

              {/* New Expenditure Form */}
              {showExpenditureForm && selectedCampaign && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Request Expenditure for "{selectedCampaign.name}"
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (ETH)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={selectedCampaign.raised}
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
                      <input
                        type="text"
                        value={expenditureForm.purpose}
                        onChange={(e) => setExpenditureForm(prev => ({ ...prev, purpose: e.target.value }))}
                        className="input-field"
                        placeholder="Emergency supplies, medical aid, etc."
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
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
              )}

              {/* Expenditures List */}
              {myExpenditures.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No expenditure requests yet</p>
                  {!selectedCampaign && (
                    <p className="text-sm text-gray-400 mt-2">Select a campaign to create requests</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {myExpenditures.map((expenditure) => (
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
                            <div>Campaign: {expenditure.campaignName}</div>
                            <div>Requested by: {formatAddress(expenditure.requester)}</div>
                            <div>Date: {formatDate(expenditure.requestTimestamp)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(expenditure)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!expenditure.executed && (
                        <div className="flex space-x-2 pt-3 border-t border-gray-100">
                          {!expenditure.approved && (
                            <button
                              onClick={() => handleApproveExpenditure(expenditure.id)}
                              disabled={adminLoading}
                              className="btn-success text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {adminLoading ? 'Approving...' : 'Approve'}
                            </button>
                          )}
                          {expenditure.approved && (
                            <button
                              onClick={() => handleExecuteExpenditure(expenditure.id)}
                              disabled={adminLoading}
                              className="btn-primary text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              {adminLoading ? 'Executing...' : 'Execute'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Stats */}
        {myCampaigns.length > 0 && (
          <div className="mt-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {myCampaigns.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Campaigns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {myCampaigns.reduce((sum, campaign) => sum + parseFloat(campaign.raised), 0).toFixed(4)} ETH
                  </div>
                  <div className="text-sm text-gray-500">Total Raised</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {myCampaigns.reduce((sum, campaign) => sum + campaign.totalDonors, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Donors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {myExpenditures.length}
                  </div>
                  <div className="text-sm text-gray-500">Expenditure Requests</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
