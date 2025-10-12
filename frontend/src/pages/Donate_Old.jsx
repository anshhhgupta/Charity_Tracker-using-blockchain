import { useState, useEffect } from 'react'
import { Heart, Eye, EyeOff, ExternalLink, Users, Target, Clock, Shield, MapPin, CheckCircle } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { useContract } from '../context/ContractContext'
import { useEvents } from '../context/EventContext'
import toast from 'react-hot-toast'

const DonatePage = () => {
  const { account, connectWallet, isConnected, signer } = useWallet()
  const { donate } = useContract()
  const { campaigns, demoMode, loading } = useEvents()
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

    if (parseFloat(formData.amount) > 100) {
      newErrors.amount = 'Donation amount cannot exceed 100 ETH'
    }

    if (formData.message.length > 200) {
      newErrors.message = 'Message cannot exceed 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!account) {
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

    try {
      await makeDonation(
        parseFloat(formData.amount),
        formData.message,
        formData.isAnonymous
      )
      
      // Reset form
      setFormData({
        amount: '',
        message: '',
        isAnonymous: false
      })
    } catch (error) {
      console.error('Donation failed:', error)
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="bg-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Make a Donation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Support humanitarian causes with transparent, secure blockchain donations. 
            Every contribution makes a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <div className="card">
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
                    max="1000"
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
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : account ? (
                    `Donate ${formData.amount || '0.00'} ETH`
                  ) : (
                    'Connect Wallet to Donate'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Charity Info */}
            {charityInfo && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About {charityInfo.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {charityInfo.description}
                </p>
                <a
                  href={charityInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Visit Website
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            )}

            {/* Wallet Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Wallet Status
              </h3>
              {account ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">
                      Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 break-all">
                    {account}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">
                      Not Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Connect your wallet to make a donation
                  </p>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Transparent & Secure
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All transactions are public on blockchain</li>
                    <li>• Smart contract ensures secure transfers</li>
                    <li>• No hidden fees or intermediaries</li>
                    <li>• Complete donation history available</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Last donation</span>
                  <span className="text-sm font-medium">0.5 ETH</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Today's donations</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">This month</span>
                  <span className="text-sm font-medium">156.7 ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonatePage
