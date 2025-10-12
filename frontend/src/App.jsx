import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { ContractProvider } from './context/ContractContext'
import { EventProvider } from './context/EventContext'
import ErrorBoundary from './components/ErrorBoundary'
import DebugInfo from './components/DebugInfo'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Donate from './pages/Donate'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Campaigns from './pages/Campaigns'
import CreateCampaign from './pages/CreateCampaign'
import CampaignDetails from './pages/CampaignDetails'
import AdminPanel from './pages/AdminPanel'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <ContractProvider>
          <EventProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/donate" element={<Donate />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/campaigns" element={<Campaigns />} />
                        <Route path="/create-campaign" element={<CreateCampaign />} />
                        <Route path="/campaign/:id" element={<CampaignDetails />} />
                        <Route path="/admin" element={<AdminPanel />} />
                      </Routes>
                    </main>
              </div>
              <Toaster />
              <DebugInfo />
            </Router>
          </EventProvider>
        </ContractProvider>
      </WalletProvider>
    </ErrorBoundary>
  )
}

export default App
