import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../context/ContractContext';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateCampaign = () => {
  const { account, signer, isConnected } = useWallet();
  const { createCampaign, waitForTransaction } = useContract();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Campaign description is required');
      return;
    }

    if (!formData.goal || parseFloat(formData.goal) <= 0) {
      toast.error('Please enter a valid goal amount');
      return;
    }

    try {
      setLoading(true);
      
      const result = await createCampaign(
        formData.name.trim(),
        formData.description.trim(),
        formData.goal,
        signer
      );
      
      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          goal: ''
        });
        
        // Navigate to campaigns page
        navigate('/campaigns');
      }
      
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to create a campaign.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create New Campaign
          </h1>
          <p className="text-xl text-gray-600">
            Start a campaign to raise funds for your cause and make a difference.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter campaign name"
                className="input-field"
                required
                maxLength={100}
              />
              <p className="mt-1 text-sm text-gray-500">
                Choose a clear, compelling name for your campaign
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your campaign, its purpose, and how the funds will be used"
                rows={6}
                className="input-field resize-none"
                required
                maxLength={1000}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                Fundraising Goal (ETH) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  step="0.01"
                  min="0.01"
                  className="input-field pr-12"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">ETH</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Set a realistic fundraising goal for your campaign
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Campaign Guidelines
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure your campaign description is clear and honest</li>
                      <li>Set a realistic fundraising goal</li>
                      <li>Be prepared to provide updates on fund usage</li>
                      <li>Campaigns will be reviewed before going live</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By creating a campaign, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
