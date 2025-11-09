import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import NetworkStatus from './NetworkStatus'
import { Menu, X, Heart } from 'lucide-react'

const Navbar = () => {
  const { account, isConnected, connectWallet } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Create', href: '/create-campaign' },
    { name: 'Admin', href: '/admin-final' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'About', href: '/about' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Chain of Hope
              </span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Network Status and Connect Button */}
          <div className="flex items-center space-x-4">
            {/* Network Status - Always show if connected */}
            {isConnected && <NetworkStatus />}

            {/* Connect Wallet Button */}
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="btn-primary text-sm"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Network Status */}
            {isConnected && (
              <div className="px-3 py-2">
                <NetworkStatus />
              </div>
            )}
            
            {/* Mobile Connect Button */}
            {!isConnected && (
              <div className="px-3 py-2">
                <button
                  onClick={connectWallet}
                  className="w-full btn-primary text-sm"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
