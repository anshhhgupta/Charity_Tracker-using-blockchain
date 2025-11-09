import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { useContract } from './ContractContext';
import { demoCampaigns, demoDonations, demoStats, generateMoreDemoDonations } from '../data/demoData';
import toast from 'react-hot-toast';

const EventContext = createContext();

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const { provider, isConnected } = useWallet();
  const { charityContract, contractAddress } = useContract();
  
  // State management
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalDonations: 0,
    totalRaised: 0,
    totalExpenditures: 0
  });
  const [loading, setLoading] = useState(true);
  const [eventListeners, setEventListeners] = useState([]);

  // Load demo data for demonstration purposes
  const loadDemoData = useCallback(() => {
    console.log('EventContext: Loading demo data for demonstration...');
    
    setCampaigns(demoCampaigns);
    
    // Add some additional generated donations
    const additionalDonations = [
      ...demoDonations,
      ...generateMoreDemoDonations(0, 15),
      ...generateMoreDemoDonations(1, 10)
    ];
    setDonations(additionalDonations.sort((a, b) => b.timestamp - a.timestamp));
    
    setExpenditures([]);
    setStats(demoStats);
    
    console.log('EventContext: Demo data loaded successfully');
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!charityContract) {
      console.log('EventContext: No charity contract available yet');
      return;
    }

    console.log('EventContext: Starting to load initial data...');
    try {
      setLoading(true);
      
      // Load campaigns
      const campaignsData = await charityContract.getTotalCampaigns();
      const totalCampaigns = Number(campaignsData);
      const allCampaigns = [];
      
      // Only fetch campaigns if there are any
      if (totalCampaigns > 0) {
        for (let i = 0; i < totalCampaigns; i++) {
          try {
            const campaign = await charityContract.getCampaign(i);
            const progress = await charityContract.getCampaignProgress(i);
            
            allCampaigns.push({
              id: i,
              name: campaign[1],
              description: campaign[2],
              goal: ethers.formatEther(campaign[3]),
              raised: ethers.formatEther(campaign[4]),
              creator: campaign[5],
              isActive: campaign[6],
              createdAt: Number(campaign[7]),
              totalDonors: Number(campaign[8]),
              progress: Number(progress)
            });
          } catch (error) {
            console.warn(`Failed to load campaign ${i}:`, error);
          }
        }
      }
      
      setCampaigns(allCampaigns);

      // Load recent donations across all campaigns
      const allDonations = [];
      if (allCampaigns.length > 0) {
        for (const campaign of allCampaigns) {
          try {
            const campaignDonations = await charityContract.getCampaignDonations(campaign.id);
            if (campaignDonations && campaignDonations.length > 0) {
              campaignDonations.forEach(donation => {
                allDonations.push({
                  ...donation,
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  amount: ethers.formatEther(donation.amount),
                  timestamp: Number(donation.timestamp)
                });
              });
            }
          } catch (error) {
            console.warn(`Failed to load donations for campaign ${campaign.id}:`, error);
          }
        }
      }
      
      setDonations(allDonations.sort((a, b) => b.timestamp - a.timestamp));

      // Load expenditures
      const totalExpenditures = Number(await charityContract.getTotalExpenditures());
      const allExpenditures = [];
      
      if (totalExpenditures > 0) {
        for (let i = 0; i < totalExpenditures; i++) {
          try {
            const expenditure = await charityContract.getExpenditure(i);
            const campaign = allCampaigns.find(c => c.id === Number(expenditure[1]));
            
            allExpenditures.push({
              id: Number(expenditure[0]),
              campaignId: Number(expenditure[1]),
              campaignName: campaign?.name || 'Unknown Campaign',
              amount: ethers.formatEther(expenditure[2]),
              purpose: expenditure[3],
              requester: expenditure[4],
              isApproved: expenditure[5],
              isExecuted: expenditure[6],
              requestedAt: Number(expenditure[7])
            });
          } catch (error) {
            console.warn(`Failed to load expenditure ${i}:`, error);
          }
        }
      }
      
      setExpenditures(allExpenditures.sort((a, b) => b.requestedAt - a.requestedAt));

      // Calculate stats
      const totalRaised = allCampaigns.reduce((sum, campaign) => sum + parseFloat(campaign.raised), 0);
      const totalDonationCount = allDonations.length;
      
      setStats({
        totalCampaigns: allCampaigns.length,
        totalDonations: totalDonationCount,
        totalRaised: totalRaised,
        totalExpenditures: allExpenditures.length
      });

      console.log('EventContext: Successfully loaded data:', {
        campaigns: allCampaigns.length,
        donations: allDonations.length,
        expenditures: allExpenditures.length,
        totalRaised: totalRaised
      });
      
      console.log('EventContext: Loaded', allCampaigns.length, 'campaigns and', allDonations.length, 'donations from blockchain');

    } catch (error) {
      console.error('Error loading initial data:', error);
      // Don't load demo data - show actual blockchain state
      console.log('EventContext: Will show actual blockchain data only');
    } finally {
      setLoading(false);
    }
  }, [charityContract, loadDemoData]);

  // Update campaign data
  const updateCampaign = useCallback(async (campaignId) => {
    if (!charityContract) return;

    try {
      const campaign = await charityContract.getCampaign(campaignId);
      const progress = await charityContract.getCampaignProgress(campaignId);
      
      const updatedCampaign = {
        id: campaignId,
        name: campaign[1],
        description: campaign[2],
        goal: ethers.formatEther(campaign[3]),
        raised: ethers.formatEther(campaign[4]),
        creator: campaign[5],
        isActive: campaign[6],
        createdAt: Number(campaign[7]),
        totalDonors: Number(campaign[8]),
        progress: Number(progress)
      };

      setCampaigns(prev => {
        const index = prev.findIndex(c => c.id === campaignId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = updatedCampaign;
          return updated;
        } else {
          return [...prev, updatedCampaign];
        }
      });

      // Update stats - calculate from fresh campaigns state
      setCampaigns(currentCampaigns => {
        const totalRaised = currentCampaigns.reduce((sum, campaign) => {
          if (campaign.id === campaignId) {
            return sum + parseFloat(updatedCampaign.raised);
          }
          return sum + parseFloat(campaign.raised);
        }, 0);
        
        setStats(prevStats => ({
          ...prevStats,
          totalRaised: totalRaised
        }));
        
        return currentCampaigns;
      });

    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  }, [charityContract]);

  // Add new donation
  const addDonation = useCallback(async (campaignId, donor, amount, timestamp) => {
    setCampaigns(prevCampaigns => {
      const campaign = prevCampaigns.find(c => c.id === campaignId);
      if (!campaign) return prevCampaigns;

      const newDonation = {
        donor,
        amount: ethers.formatEther(amount),
        timestamp: Number(timestamp),
        campaignId,
        campaignName: campaign.name,
        isRefunded: false
      };

      setDonations(prev => [newDonation, ...prev]);

      // Update stats
      setStats(prev => ({
        ...prev,
        totalDonations: prev.totalDonations + 1,
        totalRaised: prev.totalRaised + parseFloat(ethers.formatEther(amount))
      }));

      // Show toast notification
      toast.success(`New donation of ${ethers.formatEther(amount)} ETH to "${campaign.name}"!`);

      // Return updated campaigns with incremented donor count
      return prevCampaigns.map(c => 
        c.id === campaignId 
          ? { ...c, totalDonors: c.totalDonors + 1 }
          : c
      );
    });
  }, []);

  // Add new campaign
  const addCampaign = useCallback(async (campaignId, creator, name, goal, timestamp) => {
    const newCampaign = {
      id: campaignId,
      name,
      description: '', // Will be updated when we fetch full campaign data
      goal: ethers.formatEther(goal),
      raised: '0',
      creator,
      isActive: true,
      createdAt: Number(timestamp),
      totalDonors: 0,
      progress: 0
    };

    setCampaigns(prev => [...prev, newCampaign]);

    // Update stats
    setStats(prev => ({
      ...prev,
      totalCampaigns: prev.totalCampaigns + 1
    }));

    // Show toast notification
    toast.success(`New campaign created: "${name}"!`);
  }, []);

  // Add new expenditure
  const addExpenditure = useCallback(async (expenditureId, campaignId, requester, amount, purpose, timestamp) => {
    setCampaigns(prevCampaigns => {
      const campaign = prevCampaigns.find(c => c.id === campaignId);
      if (!campaign) return prevCampaigns;

      const newExpenditure = {
        id: expenditureId,
        campaignId,
        campaignName: campaign.name,
        amount: ethers.formatEther(amount),
        purpose,
        requester,
        isApproved: false,
        isExecuted: false,
        requestedAt: Number(timestamp)
      };

      setExpenditures(prev => [newExpenditure, ...prev]);

      // Update stats
      setStats(prev => ({
        ...prev,
        totalExpenditures: prev.totalExpenditures + 1
      }));

      // Show toast notification
      toast.success(`New expenditure request for "${campaign.name}": ${ethers.formatEther(amount)} ETH`);
      
      return prevCampaigns;
    });
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    if (!charityContract || !provider) {
      console.log('EventContext: Cannot setup event listeners - missing contract or provider');
      return;
    }

    try {
      console.log('EventContext: Setting up blockchain event listeners...');
      // Clear existing listeners
      eventListeners.forEach(listener => {
        try {
          listener.removeAllListeners();
        } catch (err) {
          console.warn('EventContext: Error removing listener:', err);
        }
      });
      setEventListeners([]);

    const newListeners = [];

    // Listen for CampaignCreated events
    const campaignCreatedListener = charityContract.on('CampaignCreated', async (campaignId, creator, name, goal, timestamp) => {
      console.log('CampaignCreated event:', { campaignId: campaignId.toString(), creator, name, goal: goal.toString(), timestamp: timestamp.toString() });
      await addCampaign(Number(campaignId), creator, name, goal, timestamp);
    });
    newListeners.push(campaignCreatedListener);

    // Listen for DonationReceived events
    const donationReceivedListener = charityContract.on('DonationReceived', async (campaignId, donor, amount, totalRaised, timestamp) => {
      console.log('DonationReceived event:', { 
        campaignId: campaignId.toString(), 
        donor, 
        amount: amount.toString(), 
        totalRaised: totalRaised.toString(), 
        timestamp: timestamp.toString() 
      });
      await addDonation(Number(campaignId), donor, amount, timestamp);
      await updateCampaign(Number(campaignId));
    });
    newListeners.push(donationReceivedListener);

    // Listen for ExpenditureRequested events
    const expenditureRequestedListener = charityContract.on('ExpenditureRequested', async (expenditureId, campaignId, requester, amount, purpose, timestamp) => {
      console.log('ExpenditureRequested event:', { 
        expenditureId: expenditureId.toString(), 
        campaignId: campaignId.toString(), 
        requester, 
        amount: amount.toString(), 
        purpose, 
        timestamp: timestamp.toString() 
      });
      await addExpenditure(Number(expenditureId), Number(campaignId), requester, amount, purpose, timestamp);
    });
    newListeners.push(expenditureRequestedListener);

    // Listen for ExpenditureApproved events
    const expenditureApprovedListener = charityContract.on('ExpenditureApproved', async (expenditureId, campaignId, approver, timestamp) => {
      console.log('ExpenditureApproved event:', { 
        expenditureId: expenditureId.toString(), 
        campaignId: campaignId.toString(), 
        approver, 
        timestamp: timestamp.toString() 
      });
      
      setExpenditures(prev => prev.map(exp => 
        exp.id === Number(expenditureId) 
          ? { ...exp, isApproved: true }
          : exp
      ));

      // Use a fresh campaign lookup instead of relying on stale closure
      setCampaigns(prevCampaigns => {
        const campaign = prevCampaigns.find(c => c.id === Number(campaignId));
        if (campaign) {
          toast.success(`Expenditure approved for "${campaign.name}"!`);
        }
        return prevCampaigns;
      });
    });
    newListeners.push(expenditureApprovedListener);

    // Listen for ExpenditureExecuted events
    const expenditureExecutedListener = charityContract.on('ExpenditureExecuted', async (expenditureId, campaignId, executor, timestamp) => {
      console.log('ExpenditureExecuted event:', { 
        expenditureId: expenditureId.toString(), 
        campaignId: campaignId.toString(), 
        executor, 
        timestamp: timestamp.toString() 
      });
      
      setExpenditures(prev => prev.map(exp => 
        exp.id === Number(expenditureId) 
          ? { ...exp, isExecuted: true }
          : exp
      ));

      // Use a fresh campaign lookup instead of relying on stale closure
      setCampaigns(prevCampaigns => {
        const campaign = prevCampaigns.find(c => c.id === Number(campaignId));
        if (campaign) {
          toast.success(`Expenditure executed for "${campaign.name}"!`);
        }
        return prevCampaigns;
      });
    });
    newListeners.push(expenditureExecutedListener);

    // Listen for CampaignDeactivated events
    const campaignDeactivatedListener = charityContract.on('CampaignDeactivated', async (campaignId, timestamp) => {
      console.log('CampaignDeactivated event:', { 
        campaignId: campaignId.toString(), 
        timestamp: timestamp.toString() 
      });
      
      setCampaigns(prev => {
        const campaign = prev.find(c => c.id === Number(campaignId));
        if (campaign) {
          toast.info(`Campaign "${campaign.name}" has been deactivated`);
        }
        return prev.map(c => 
          c.id === Number(campaignId) 
            ? { ...c, isActive: false }
            : c
        );
      });
    });
    newListeners.push(campaignDeactivatedListener);

    // Listen for CampaignActivated events
    const campaignActivatedListener = charityContract.on('CampaignActivated', async (campaignId, timestamp) => {
      console.log('CampaignActivated event:', { 
        campaignId: campaignId.toString(), 
        timestamp: timestamp.toString() 
      });
      
      setCampaigns(prev => {
        const campaign = prev.find(c => c.id === Number(campaignId));
        if (campaign) {
          toast.success(`Campaign "${campaign.name}" has been activated`);
        }
        return prev.map(c => 
          c.id === Number(campaignId) 
            ? { ...c, isActive: true }
            : c
        );
      });
    });
    newListeners.push(campaignActivatedListener);

    // Listen for ContractPaused events
    const contractPausedListener = charityContract.on('ContractPaused', async (pauser, timestamp) => {
      console.log('ContractPaused event:', { 
        pauser, 
        timestamp: timestamp.toString() 
      });
      
      toast.error('Contract has been paused by admin. Some functions may be unavailable.');
    });
    newListeners.push(contractPausedListener);

    // Listen for ContractUnpaused events
    const contractUnpausedListener = charityContract.on('ContractUnpaused', async (unpauser, timestamp) => {
      console.log('ContractUnpaused event:', { 
        unpauser, 
        timestamp: timestamp.toString() 
      });
      
      toast.success('Contract has been unpaused. All functions are now available.');
    });
    newListeners.push(contractUnpausedListener);

    setEventListeners(newListeners);
    console.log('EventContext: Event listeners setup complete, total listeners:', newListeners.length);

    } catch (error) {
      console.error('EventContext: Error setting up event listeners:', error);
      // Don't crash the app if event listeners fail to setup
    }
  }, [charityContract, provider]);

  // Cleanup event listeners
  const cleanupEventListeners = useCallback(() => {
    eventListeners.forEach(listener => {
      try {
        listener.removeAllListeners();
      } catch (error) {
        console.error('Error removing event listener:', error);
      }
    });
    setEventListeners([]);
  }, []);

  // Track if initial data has been loaded to prevent re-loading
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Load initial data only once when contract becomes available
  useEffect(() => {
    if (charityContract && !initialDataLoaded) {
      console.log('EventContext: Loading initial data for the first time...');
      loadInitialData();
      setInitialDataLoaded(true);
    }
  }, [charityContract, initialDataLoaded, loadInitialData]);

  // Setup event listeners when wallet connects
  useEffect(() => {
    if (charityContract && isConnected) {
      console.log('EventContext: Setting up event listeners...');
      setupEventListeners();
    }
    
    return () => {
      // Clean up event listeners on unmount or when dependencies change
      eventListeners.forEach(listener => {
        try {
          listener.removeAllListeners();
        } catch (error) {
          console.error('Error removing event listener:', error);
        }
      });
    };
  }, [charityContract, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupEventListeners();
    };
  }, [cleanupEventListeners]);

  // Get campaign by ID
  const getCampaignById = useCallback((id) => {
    return campaigns.find(campaign => campaign.id === id);
  }, [campaigns]);

  // Get donations for a specific campaign
  const getCampaignDonations = useCallback((campaignId) => {
    return donations.filter(donation => donation.campaignId === campaignId);
  }, [donations]);

  // Get expenditures for a specific campaign
  const getCampaignExpenditures = useCallback((campaignId) => {
    return expenditures.filter(expenditure => expenditure.campaignId === campaignId);
  }, [expenditures]);

  // Get recent donations (last 10)
  const getRecentDonations = useCallback(() => {
    return donations.slice(0, 10);
  }, [donations]);

  // Get recent expenditures (last 10)
  const getRecentExpenditures = useCallback(() => {
    return expenditures.slice(0, 10);
  }, [expenditures]);

  const value = {
    // State
    campaigns,
    donations,
    expenditures,
    stats,
    loading,
    
    // Actions
    loadInitialData,
    loadDemoData,
    updateCampaign,
    addDonation,
    addCampaign,
    addExpenditure,
    
    // Getters
    getCampaignById,
    getCampaignDonations,
    getCampaignExpenditures,
    getRecentDonations,
    getRecentExpenditures,
    
    // Event management
    setupEventListeners,
    cleanupEventListeners
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export default EventContext;
