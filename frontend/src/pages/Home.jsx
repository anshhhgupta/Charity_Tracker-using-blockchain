import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Shield, Globe, TrendingUp, Users, DollarSign, ArrowRight, Plus, Eye } from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { ContractProvider, useContract } from '../context/ContractContext'
import { useEvents } from '../context/EventContext'
import TransactionHistory from '../components/TransactionHistory'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const HomePage = () => {
  return (
    <ContractProvider>
      <HomeContent />
    </ContractProvider>
  )
}

const HomeContent = () => {
  const { account, signer, isConnected } = useWallet()
  const { donate, waitForTransaction } = useContract()
  const { 
    campaigns, 
    stats, 
    loading, 
    getRecentDonations 
  } = useEvents()
  const [donating, setDonating] = useState({})
  const [recentDonations, setRecentDonations] = useState([])
  const [charityInfo] = useState(null) // Set to null to hide section, or add charity data object

  useEffect(() => {
    // Get recent donations for display
    if (getRecentDonations) {
      const recent = getRecentDonations()
      setRecentDonations(recent || [])
    }
  }, [getRecentDonations])

  // Get featured campaigns (first 6)
  const featuredCampaigns = campaigns ? campaigns.slice(0, 6) : []

  const handleDonate = async (campaignId, amount) => {
    if (!isConnected || !account || !signer) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setDonating(prev => ({ ...prev, [campaignId]: true }))
      
      const result = await donate(campaignId, amount, signer)
      
      if (result.success) {
        // Data will be automatically updated via event listeners
        console.log('Donation successful:', result.receipt)
      }
    } catch (error) {
      console.error('Error donating:', error)
    } finally {
      setDonating(prev => ({ ...prev, [campaignId]: false }))
    }
  }

  const formatEther = (wei) => {
    if (!wei) return '0'
    return (parseFloat(wei) / 1e18).toFixed(4)
  }

  const features = [
    {
      icon: Shield,
      title: 'Transparent',
      description: 'All donations and withdrawals are recorded on the blockchain for complete transparency.'
    },
    {
      icon: Globe,
      title: 'Global',
      description: 'Make donations from anywhere in the world using cryptocurrency.'
    },
    {
      icon: Heart,
      title: 'Charitable',
      description: 'Direct impact on humanitarian causes with minimal fees and maximum efficiency.'
    }
  ]

  const statsCards = [
    {
      icon: DollarSign,
      title: 'Total Raised',
      value: `${(stats?.totalRaised || 0).toFixed(4)} ETH`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Total Donations',
      value: (stats?.totalDonations || 0).toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Active Campaigns',
      value: (stats?.totalCampaigns || 0).toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Chain of Hope
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Transparent charity donations powered by blockchain technology. 
              Make a difference with complete transparency and trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/campaigns"
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                View Campaigns
              </Link>
              <Link
                to="/donate"
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Make a Donation
              </Link>
              <Link
                to="/dashboard"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {statsCards.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`${stat.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Campaigns Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Campaigns
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover and support meaningful causes that are making a difference in the world.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Heart className="mx-auto h-24 w-24" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-6">Be the first to create a campaign and make a difference!</p>
              <Link to="/create-campaign" className="btn-primary">
                Create Campaign
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCampaigns.map((campaign) => (
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

                  <div className="flex space-x-2">
                    <Link
                      to={`/campaign/${campaign.id}`}
                      className="btn-secondary flex-1 text-center flex items-center justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    {campaign.isActive && (
                      <button
                        onClick={() => {
                          const amount = prompt('Enter donation amount (ETH):', '0.1');
                          if (amount && parseFloat(amount) > 0) {
                            handleDonate(campaign.id, amount);
                          }
                        }}
                        disabled={donating[campaign.id]}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {donating[campaign.id] ? 'Donating...' : 'Donate'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/campaigns" className="btn-primary text-lg px-8 py-3">
              View All Campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Chain of Hope?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines the power of blockchain technology with humanitarian values 
              to create a transparent, efficient, and trustworthy donation system.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-200">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity Info Section */}
      {charityInfo && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About {charityInfo.name}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {charityInfo.description}
              </p>
              <a
                href={charityInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg"
              >
                Visit Our Website
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Recent Donations Section */}
      {recentDonations.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Donations
              </h2>
              <p className="text-xl text-gray-600">
                See how our community is making a difference
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentDonations.slice(0, 6).map((donation, index) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="font-semibold text-gray-900">
                        {parseFloat(donation.amount).toFixed(4)} ETH
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {donation.donor.slice(0, 6)}...{donation.donor.slice(-4)}
                    </span>
                  </div>
                  <p className="text-gray-600 italic">to "{donation.campaignName}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Transaction History Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transaction History
            </h2>
            <p className="text-xl text-gray-600">
              Track your recent blockchain transactions
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <TransactionHistory maxTransactions={5} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of donors who trust Chain of Hope for transparent, 
            secure, and impactful charitable giving.
          </p>
          <Link
            to="/donate"
            className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg inline-flex items-center"
          >
            Start Donating Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
