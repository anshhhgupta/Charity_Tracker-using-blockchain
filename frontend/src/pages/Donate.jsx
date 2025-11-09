import { useState, useEffect } from 'react'
import { Heart, Eye, ExternalLink, Users, Target, Clock, Shield, MapPin, CheckCircle, ArrowRight } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { useContract } from '../context/ContractContext'
import { useEvents } from '../context/EventContext'
import toast from 'react-hot-toast'

const DonatePage = () => {
  const { account, connectWallet, isConnected, signer } = useWallet()
  const { donate } = useContract()
  const { campaigns, loading } = useEvents()
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    isAnonymous: false
  })
  const [errors, setErrors] = useState({})
  const [donating, setDonating] = useState(false)

  // Set first campaign as selected by default
  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaign) {
      setSelectedCampaign(campaigns[0])
    }
  }, [campaigns, selectedCampaign])

  const validateForm = () => {
    const newErrors = {}

    if (!selectedCampaign) {
      newErrors.campaign = 'Please select a campaign to donate to'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid donation amount'
    }

    if (parseFloat(formData.amount) > 10) {
      newErrors.amount = 'Donation amount cannot exceed 10 ETH for demo'
    }

    if (formData.message.length > 200) {
      newErrors.message = 'Message cannot exceed 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isConnected || !account) {
      try {
        await connectWallet()
        return
      } catch (error) {
        toast.error('Please connect your wallet to make a donation')
        return
      }
    }

    if (!validateForm()) {
      return
    }

    // Real blockchain donation
    try {
      setDonating(true)
      await donate(
        selectedCampaign.id,
        parseFloat(formData.amount),
        signer
      )
      
      // Reset form on success
      setFormData({
        amount: '',
        message: '',
        isAnonymous: false
      })
    } catch (error) {
      console.error('Donation failed:', error)
      toast.error('Donation failed. Please try again.')
    } finally {
      setDonating(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const presetAmounts = [0.01, 0.05, 0.1, 0.5, 1.0]

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Make a Donation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Support meaningful causes with transparent, secure blockchain donations. 
            Choose a campaign and make a difference today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Campaign Selection Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Campaign
              </h3>
              
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No campaigns available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedCampaign?.id === campaign.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="flex items-start space-x-4">
                        {campaign.imageUrl && (
                          <img
                            src={campaign.imageUrl}
                            alt={campaign.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {campaign.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {campaign.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center">
                              <Target className="h-3 w-3 mr-1" />
                              {campaign.progress}% funded
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {campaign.totalDonors} donors
                            </span>
                          </div>
                          
                          <div className="mt-2 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                            ></div>
                          </div>
                          
                          <div className="mt-2 flex justify-between text-sm">
                            <span className="font-medium text-gray-900">
                              {campaign.raised} ETH raised
                            </span>
                            <span className="text-gray-600">
                              of {campaign.goal} ETH
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-3 space-y-6">
            {selectedCampaign && (
              <>
                {/* Selected Campaign Details */}
                <div className="card">
                  <div className="flex items-start space-x-4 mb-6">
                    {selectedCampaign.imageUrl && (
                      <img
                        src={selectedCampaign.imageUrl}
                        alt={selectedCampaign.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCampaign.name}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {selectedCampaign.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedCampaign.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {selectedCampaign.location}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          Started {formatDate(selectedCampaign.createdAt)}
                        </div>
                        {selectedCampaign.organizer && (
                          <div className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Verified by {selectedCampaign.organizer.name}
                          </div>
                        )}
                        {selectedCampaign.urgency && (
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              selectedCampaign.urgency === 'High' ? 'bg-red-500' :
                              selectedCampaign.urgency === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-sm text-gray-600">
                              {selectedCampaign.urgency} Priority
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-900">
                        Progress: {selectedCampaign.raised} ETH raised
                      </span>
                      <span className="text-gray-600">
                        Goal: {selectedCampaign.goal} ETH
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(selectedCampaign.progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2 text-gray-600">
                      <span>{selectedCampaign.progress}% funded</span>
                      <span>{selectedCampaign.totalDonors} supporters</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedCampaign.tags && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedCampaign.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Donation Form */}
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Make Your Donation
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Donation Amount (ETH)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        step="0.001"
                        min="0.001"
                        max="10"
                        className={`input-field ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="0.00"
                      />
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>

                    {/* Preset Amounts */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Quick Amounts</p>
                      <div className="flex flex-wrap gap-2">
                        {presetAmounts.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                          >
                            {amount} ETH
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message Input */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        maxLength={200}
                        className={`input-field resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Share a message with your donation..."
                      />
                      <div className="flex justify-between mt-1">
                        {errors.message && (
                          <p className="text-sm text-red-600">{errors.message}</p>
                        )}
                        <p className="text-sm text-gray-500 ml-auto">
                          {formData.message.length}/200 characters
                        </p>
                      </div>
                    </div>

                    {/* Anonymous Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAnonymous"
                        name="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                        Make this donation anonymous
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={donating || loading}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                        donating || loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {donating ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Donation...
                        </div>
                      ) : !isConnected ? (
                        <span className="flex items-center justify-center">
                          Connect Wallet to Donate
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Donate {formData.amount || '0.00'} ETH
                          <Heart className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </button>
                  </form>
                </div>

                {/* Security Info */}
                <div className="card bg-blue-50 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Safe & Transparent
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• All donations are recorded on the blockchain</li>
                        <li>• Smart contracts ensure secure fund transfers</li>
                        <li>• Complete transparency in fund utilization</li>
                        <li>• No hidden fees or intermediaries</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* No Campaign Selected */}
            {!selectedCampaign && campaigns.length > 0 && (
              <div className="card text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Campaign
                </h3>
                <p className="text-gray-600">
                  Choose a campaign from the sidebar to start making a donation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonatePage