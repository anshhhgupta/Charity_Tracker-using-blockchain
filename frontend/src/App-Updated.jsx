import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import NetworkGuard from './components/NetworkGuard'
import Navbar from './components/Navbar'

// Import pages
import Home from './pages/Home'
import Donate from './pages/Donate'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Campaigns from './pages/Campaigns'
import CreateCampaign from './pages/CreateCampaign'
import CampaignDetails from './pages/CampaignDetails'
import AdminPanel from './pages/AdminPanel'

// Import final version pages
import AdminPanelFinal from './pages/AdminPanel-Final'
import CampaignDetailsFinal from './pages/CampaignDetails-Final'

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <Router>
          <NetworkGuard>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Routes>
                  {/* Main routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/about" element={<About />} />
                  
                  {/* Campaign routes */}
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/create-campaign" element={<CreateCampaign />} />
                  <Route path="/campaign/:id" element={<CampaignDetails />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminPanel />} />
                  
                  {/* Final version routes (Sepolia-ready) */}
                  <Route path="/admin-final" element={<AdminPanelFinal />} />
                  <Route path="/campaign-final/:id" element={<CampaignDetailsFinal />} />
                </Routes>
              </main>
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </NetworkGuard>
        </Router>
      </WalletProvider>
    </ErrorBoundary>
  )
}

export default App
