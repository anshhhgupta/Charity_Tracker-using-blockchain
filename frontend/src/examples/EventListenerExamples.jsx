/**
 * Event Listener Integration Examples
 * 
 * This file contains practical examples of how to integrate
 * real-time event listeners into various components.
 */

import { useState, useEffect } from 'react';
import { useEventListener } from '../hooks/useEventListener';
import { useCampaigns } from '../context/CampaignContext-Enhanced';

// ============================================
// Example 1: Campaign List with Real-Time Updates
// ============================================
export const CampaignListRealtime = () => {
  const { campaigns, loading } = useCampaigns();

  // The context already handles events, so campaigns update automatically!
  // No additional event listener needed here.

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Campaigns</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        campaigns.map(campaign => (
          <div key={campaign.id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-bold">{campaign.name}</h3>
            <p className="text-gray-400">Balance: {campaign.balance} ETH</p>
            <p className="text-gray-400">Progress: {campaign.progress}%</p>
          </div>
        ))
      )}
    </div>
  );
};

// ============================================
// Example 2: Single Campaign with Custom Event Handling
// ============================================
export const SingleCampaignRealtime = ({ campaignId }) => {
  const [localBalance, setLocalBalance] = useState('0');
  const [donationCount, setDonationCount] = useState(0);
  const { getCampaignById } = useCampaigns();

  const campaign = getCampaignById(campaignId);

  // Custom event handler for donations
  const handleDonation = ({ amount, donor }) => {
    console.log(`New donation: ${amount} ETH from ${donor}`);
    setDonationCount(prev => prev + 1);
    
    // Update local balance immediately
    setLocalBalance(prev => {
      const newBalance = parseFloat(prev) + parseFloat(amount);
      return newBalance.toFixed(4);
    });
  };

  // Listen only to events for this campaign
  useEventListener({
    onDonationReceived: handleDonation,
    campaignId: campaignId,
    showToasts: true
  });

  // Sync with context data
  useEffect(() => {
    if (campaign) {
      setLocalBalance(campaign.balance);
    }
  }, [campaign]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold">{campaign?.name}</h3>
      <p className="text-2xl text-green-400">{localBalance} ETH</p>
      <p className="text-sm text-gray-400">
        {donationCount} donations received this session
      </p>
    </div>
  );
};

// ============================================
// Example 3: Admin Dashboard with All Events
// ============================================
export const AdminDashboardRealtime = () => {
  const [recentEvents, setRecentEvents] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalExpenditures: 0,
    newCampaigns: 0
  });

  // Track all events
  const handleCampaignCreated = ({ campaignId, name }) => {
    const event = {
      type: 'campaign_created',
      message: `New campaign: ${name}`,
      timestamp: Date.now()
    };
    setRecentEvents(prev => [event, ...prev].slice(0, 10));
    setStats(prev => ({ ...prev, newCampaigns: prev.newCampaigns + 1 }));
  };

  const handleDonation = ({ campaignId, amount }) => {
    const event = {
      type: 'donation',
      message: `Donation: ${amount} ETH to campaign #${campaignId}`,
      timestamp: Date.now()
    };
    setRecentEvents(prev => [event, ...prev].slice(0, 10));
    setStats(prev => ({ ...prev, totalDonations: prev.totalDonations + 1 }));
  };

  const handleExpenditureExecuted = ({ campaignId, amount }) => {
    const event = {
      type: 'expenditure',
      message: `Expenditure: ${amount} ETH from campaign #${campaignId}`,
      timestamp: Date.now()
    };
    setRecentEvents(prev => [event, ...prev].slice(0, 10));
    setStats(prev => ({ ...prev, totalExpenditures: prev.totalExpenditures + 1 }));
  };

  useEventListener({
    onCampaignCreated: handleCampaignCreated,
    onDonationReceived: handleDonation,
    onExpenditureExecuted: handleExpenditureExecuted,
    showToasts: true
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">New Campaigns</p>
          <p className="text-3xl font-bold">{stats.newCampaigns}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">Total Donations</p>
          <p className="text-3xl font-bold">{stats.totalDonations}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400">Expenditures</p>
          <p className="text-3xl font-bold">{stats.totalExpenditures}</p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <span className="text-white">{event.message}</span>
              <span className="text-gray-400 text-sm">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// Example 4: Donation Form with Instant Feedback
// ============================================
export const DonationFormRealtime = ({ campaignId }) => {
  const [amount, setAmount] = useState('');
  const [recentDonations, setRecentDonations] = useState([]);

  const handleDonation = ({ campaignId: eventCampaignId, amount, donor }) => {
    if (eventCampaignId === campaignId) {
      setRecentDonations(prev => [
        { amount, donor, timestamp: Date.now() },
        ...prev
      ].slice(0, 5));
    }
  };

  useEventListener({
    onDonationReceived: handleDonation,
    campaignId: campaignId,
    showToasts: true
  });

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Make a Donation</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in ETH"
          className="w-full p-3 bg-gray-700 rounded"
        />
        <button className="w-full mt-4 bg-blue-500 text-white p-3 rounded">
          Donate
        </button>
      </div>

      {/* Recent Donations */}
      {recentDonations.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h4 className="font-bold mb-3">Recent Donations</h4>
          {recentDonations.map((donation, index) => (
            <div key={index} className="flex justify-between p-2 bg-gray-700 rounded mb-2">
              <span>{donation.amount} ETH</span>
              <span className="text-gray-400 text-sm">
                {donation.donor.slice(0, 10)}...
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Example 5: Expenditure Tracker with Real-Time Status
// ============================================
export const ExpenditureTrackerRealtime = ({ campaignId }) => {
  const [expenditures, setExpenditures] = useState([]);

  const handleExpenditureRequested = ({ campaignId: eventCampaignId, expenditureId, amount, purpose }) => {
    if (eventCampaignId === campaignId) {
      setExpenditures(prev => [
        ...prev,
        {
          id: expenditureId,
          amount,
          purpose,
          status: 'pending',
          timestamp: Date.now()
        }
      ]);
    }
  };

  const handleExpenditureExecuted = ({ campaignId: eventCampaignId, expenditureId }) => {
    if (eventCampaignId === campaignId) {
      setExpenditures(prev =>
        prev.map(exp =>
          exp.id === expenditureId
            ? { ...exp, status: 'executed' }
            : exp
        )
      );
    }
  };

  useEventListener({
    onExpenditureRequested: handleExpenditureRequested,
    onExpenditureExecuted: handleExpenditureExecuted,
    campaignId: campaignId,
    showToasts: true
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Expenditure Tracker</h3>
      <div className="space-y-3">
        {expenditures.map((exp) => (
          <div key={exp.id} className="bg-gray-700 p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{exp.purpose}</p>
              <p className="text-sm text-gray-400">{exp.amount} ETH</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                exp.status === 'executed'
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-black'
              }`}
            >
              {exp.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// Example 6: Live Campaign Progress Bar
// ============================================
export const LiveProgressBar = ({ campaignId }) => {
  const { getCampaignById } = useCampaigns();
  const campaign = getCampaignById(campaignId);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress changes
  useEffect(() => {
    if (campaign) {
      const timer = setTimeout(() => {
        setAnimatedProgress(campaign.progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [campaign?.progress]);

  if (!campaign) return null;

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="text-gray-400">Progress</span>
        <span className="text-white font-bold">{campaign.progress}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
          style={{ width: `${Math.min(animatedProgress, 100)}%` }}
        >
          {animatedProgress > 10 && (
            <span className="text-white text-xs font-bold">
              {campaign.balance} / {campaign.goal} ETH
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// Example 7: Event Log Component
// ============================================
export const EventLogRealtime = () => {
  const [events, setEvents] = useState([]);

  const addEvent = (type, data) => {
    setEvents(prev => [
      {
        type,
        data,
        timestamp: Date.now(),
        id: Math.random()
      },
      ...prev
    ].slice(0, 20)); // Keep last 20 events
  };

  useEventListener({
    onCampaignCreated: (data) => addEvent('CampaignCreated', data),
    onDonationReceived: (data) => addEvent('DonationReceived', data),
    onExpenditureRequested: (data) => addEvent('ExpenditureRequested', data),
    onExpenditureExecuted: (data) => addEvent('ExpenditureExecuted', data),
    onEmergencyWithdrawal: (data) => addEvent('EmergencyWithdrawal', data),
    showToasts: false // We're showing events in the log instead
  });

  const getEventIcon = (type) => {
    const icons = {
      CampaignCreated: '🎯',
      DonationReceived: '💝',
      ExpenditureRequested: '📋',
      ExpenditureExecuted: '✅',
      EmergencyWithdrawal: '⚠️'
    };
    return icons[type] || '📌';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Live Event Log</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="bg-gray-700 p-3 rounded flex items-start space-x-3">
            <span className="text-2xl">{getEventIcon(event.type)}</span>
            <div className="flex-1">
              <p className="font-semibold text-white">{event.type}</p>
              <p className="text-sm text-gray-400">
                {JSON.stringify(event.data, null, 2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  CampaignListRealtime,
  SingleCampaignRealtime,
  AdminDashboardRealtime,
  DonationFormRealtime,
  ExpenditureTrackerRealtime,
  LiveProgressBar,
  EventLogRealtime
};
