import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  Heart,
  Shield,
  Activity
} from 'lucide-react'
import { ContractProvider } from '../context/ContractContext'
import { useContract } from '../context/ContractContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const DashboardPage = () => {
  return (
    <ContractProvider>
      <DashboardContent />
    </ContractProvider>
  )
}

const DashboardContent = () => {
  const { 
    charityInfo, 
    stats, 
    getRecentDonations, 
    getRecentWithdrawals,
    loading 
  } = useContract()
  
  const [recentDonations, setRecentDonations] = useState([])
  const [recentWithdrawals, setRecentWithdrawals] = useState([])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [donations, withdrawals] = await Promise.all([
        getRecentDonations(10),
        getRecentWithdrawals(10)
      ])
      
      setRecentDonations(donations)
      setRecentWithdrawals(withdrawals)
      
      // Generate sample chart data (in a real app, this would come from the contract)
      const sampleData = [
        { date: '2025-01-01', donations: 12.5, withdrawals: 10.0 },
        { date: '2025-01-02', donations: 8.3, withdrawals: 5.0 },
        { date: '2025-01-03', donations: 15.7, withdrawals: 12.0 },
        { date: '2025-01-04', donations: 22.1, withdrawals: 18.0 },
        { date: '2025-01-05', donations: 18.9, withdrawals: 15.0 },
        { date: '2025-01-06', donations: 25.4, withdrawals: 20.0 },
        { date: '2025-01-07', donations: 19.8, withdrawals: 16.0 },
      ]
      setChartData(sampleData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const formatEther = (wei) => {
    if (!wei) return '0'
    return (parseFloat(wei) / 1e18).toFixed(4)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatAddress = (address) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'Anonymous'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const statsCards = [
    {
      title: 'Total Donated',
      value: stats ? `${formatEther(stats.totalDonated)} ETH` : '0 ETH',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+12.5%'
    },
    {
      title: 'Total Donors',
      value: stats ? stats.totalDonations.toString() : '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8.2%'
    },
    {
      title: 'Current Balance',
      value: stats ? `${formatEther(stats.currentBalance)} ETH` : '0 ETH',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+5.1%'
    },
    {
      title: 'Total Withdrawals',
      value: stats ? `${formatEther(stats.totalWithdrawn)} ETH` : '0 ETH',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+3.7%'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Real-time transparency and statistics for Chain of Hope donations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donation Trend Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Donation Trends (7 Days)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="donations" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Donations (ETH)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="withdrawals" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Withdrawals (ETH)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Monthly Comparison
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="donations" fill="#22c55e" name="Donations (ETH)" />
                  <Bar dataKey="withdrawals" fill="#f59e0b" name="Withdrawals (ETH)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Donations */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Donations
              </h3>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-4">
              {recentDonations.length > 0 ? (
                recentDonations.slice(0, 5).map((donation, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {formatEther(donation.amount)} ETH
                        </p>
                        {donation.isAnonymous && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        From: {formatAddress(donation.donor)}
                      </p>
                      {donation.message && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          "{donation.message}"
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(donation.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent donations to display
                </p>
              )}
            </div>
          </div>

          {/* Recent Withdrawals */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Withdrawals
              </h3>
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              {recentWithdrawals.length > 0 ? (
                recentWithdrawals.slice(0, 5).map((withdrawal, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {formatEther(withdrawal.amount)} ETH
                      </p>
                      <p className="text-sm text-gray-600">
                        Purpose: {withdrawal.purpose}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {formatDate(withdrawal.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent withdrawals to display
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Charity Information */}
        {charityInfo && (
          <div className="mt-8">
            <div className="card">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  About {charityInfo.name}
                </h3>
                <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
                  {charityInfo.description}
                </p>
                <div className="flex items-center justify-center space-x-6">
                  <a
                    href={charityInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Visit Website
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${charityInfo.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {charityInfo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transparency Notice */}
        <div className="mt-8">
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Complete Transparency
                </h4>
                <p className="text-blue-800 mb-4">
                  All transactions are recorded on the blockchain and are publicly verifiable. 
                  You can view the complete transaction history and verify every donation and withdrawal.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700">Public blockchain records</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700">No hidden fees</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700">Real-time updates</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
