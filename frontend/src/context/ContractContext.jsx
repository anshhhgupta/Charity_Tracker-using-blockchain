import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './WalletContext'
import { useTransaction } from '../hooks/useTransaction'
import toast from 'react-hot-toast'
import CharityABI from '../abi/Charity.json'

const ContractContext = createContext()

export const useContract = () => {
  const context = useContext(ContractContext)
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider')
  }
  return context
}

export const ContractProvider = ({ children }) => {
  const { provider, signer, chainId } = useWallet()
  const { executeTransaction, getTransaction, transactions, isLoading } = useTransaction()
  const [charityContract, setCharityContract] = useState(null)
  const [contractAddress, setContractAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Contract address from deployment - use environment variable
  const CHARITY_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x379A63482A2401a0d1b30f57921A58dEAB022aC6'

  useEffect(() => {
    initializeContract()
  }, [signer, provider])

  // Initialize contract on mount even without wallet connection
  useEffect(() => {
    if (!signer && !provider) {
      initializeContract()
    }
  }, [])

  const initializeContract = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create a default provider for Sepolia if no provider is available
      let contractProvider = provider
      if (!contractProvider) {
        // Use Sepolia RPC URL as fallback for read operations
        contractProvider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/4f8ace71a35746de8dde8e340be26137')
      }

      if (contractProvider) {
        // Initialize contract with signer if available, otherwise with provider for read operations
        const charity = new ethers.Contract(
          CHARITY_ADDRESS,
          CharityABI.abi,
          signer || contractProvider
        )
        setCharityContract(charity)
        setContractAddress(CHARITY_ADDRESS)
        console.log('ContractContext: Contract initialized:', {
          address: CHARITY_ADDRESS,
          withSigner: !!signer,
          readOnly: !signer,
          provider: !!contractProvider,
          chainId: chainId
        })
      } else {
        console.warn('ContractContext: No provider available, cannot initialize contract')
        setCharityContract(null)
        setContractAddress(null)
      }
    } catch (error) {
      console.error('ContractContext: Error initializing contract:', error)
      setError(`Failed to initialize contract: ${error.message}`)
      // Don't set contract to null on error, keep existing one if available
    } finally {
      setLoading(false)
    }
  }

  // Fetch all campaigns from the blockchain
  const fetchAllCampaigns = async () => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    try {
      const totalCampaigns = await charityContract.getTotalCampaigns()
      const campaigns = []

      for (let i = 0; i < totalCampaigns; i++) {
        const campaign = await charityContract.getCampaign(i)
        const progress = await charityContract.getCampaignProgress(i)
        
        campaigns.push({
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
        })
      }

      return campaigns
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      throw error
    }
  }

  // Donate to a campaign with enhanced transaction handling
  const donate = async (campaignId, amount, signer) => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    return executeTransaction(
      () => charityContract.connect(signer).donate(campaignId, {
        value: ethers.parseEther(amount.toString())
      }),
      {
        pendingMessage: 'Donation transaction pending...',
        successMessage: `Successfully donated ${amount} ETH!`,
        errorMessage: 'Donation failed. Please try again.',
        chainId: chainId,
        onSuccess: (receipt) => {
          console.log('Donation successful:', receipt);
        }
      }
    );
  }

  // Create a new campaign with enhanced transaction handling
  const createCampaign = async (name, description, goal, deadline, signer) => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    return executeTransaction(
      () => charityContract.connect(signer).createCampaign(
        name,
        description,
        ethers.parseEther(goal.toString()),
        deadline
      ),
      {
        pendingMessage: 'Creating campaign...',
        successMessage: `Campaign "${name}" created successfully!`,
        errorMessage: 'Failed to create campaign. Please try again.',
        chainId: chainId,
        onSuccess: (receipt) => {
          console.log('Campaign created successfully:', receipt);
        }
      }
    );
  }

  // Request expenditure for a campaign with enhanced transaction handling
  const requestExpenditure = async (campaignId, amount, purpose, signer) => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    return executeTransaction(
      () => charityContract.connect(signer).requestExpenditure(
        campaignId,
        ethers.parseEther(amount.toString()),
        purpose
      ),
      {
        pendingMessage: 'Requesting expenditure...',
        successMessage: `Expenditure request for ${amount} ETH submitted!`,
        errorMessage: 'Failed to request expenditure. Please try again.',
        chainId: chainId,
        onSuccess: (receipt) => {
          console.log('Expenditure requested successfully:', receipt);
        }
      }
    );
  }

  // Get campaign details
  const getCampaign = async (campaignId) => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    try {
      const campaign = await charityContract.getCampaign(campaignId)
      const progress = await charityContract.getCampaignProgress(campaignId)
      
      return {
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
      }
    } catch (error) {
      console.error('Error getting campaign:', error)
      throw error
    }
  }

  // Get campaign donations
  const getCampaignDonations = async (campaignId) => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    try {
      const donations = await charityContract.getCampaignDonations(campaignId)
      return donations.map(donation => ({
        donor: donation.donor,
        amount: ethers.formatEther(donation.amount),
        timestamp: Number(donation.timestamp),
        isRefunded: donation.isRefunded
      }))
    } catch (error) {
      console.error('Error getting campaign donations:', error)
      throw error
    }
  }

  // Get campaign expenditures
  const getCampaignExpenditures = async (campaignId) => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    try {
      const expenditures = await charityContract.getCampaignExpenditures(campaignId)
      return expenditures.map(expenditure => ({
        id: Number(expenditure.id),
        campaignId: Number(expenditure.campaignId),
        amount: ethers.formatEther(expenditure.amount),
        purpose: expenditure.purpose,
        requester: expenditure.requester,
        isApproved: expenditure.isApproved,
        isExecuted: expenditure.isExecuted,
        requestedAt: Number(expenditure.requestedAt)
      }))
    } catch (error) {
      console.error('Error getting campaign expenditures:', error)
      throw error
    }
  }

  // Get total campaigns count
  const getTotalCampaigns = async () => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    try {
      return await charityContract.getTotalCampaigns()
    } catch (error) {
      console.error('Error getting total campaigns:', error)
      throw error
    }
  }

  // Get total expenditures count
  const getTotalExpenditures = async () => {
    if (!charityContract) {
      throw new Error('Contract not initialized')
    }

    try {
      return await charityContract.getTotalExpenditures()
    } catch (error) {
      console.error('Error getting total expenditures:', error)
      throw error
    }
  }

  // Get Etherscan URL for transaction
  const getEtherscanUrl = (txHash) => {
    // Return Sepolia Etherscan URL for testnet transactions
    return `https://sepolia.etherscan.io/tx/${txHash}`
  }

  // Wait for transaction confirmation
  const waitForTransaction = async (tx) => {
    try {
      const receipt = await tx.wait()
      return {
        receipt,
        success: receipt.status === 1,
        gasUsed: receipt.gasUsed.toString(),
        etherscanUrl: getEtherscanUrl(tx.hash)
      }
    } catch (error) {
      console.error('Error waiting for transaction:', error)
      throw error
    }
  }

  // Admin functions
  const pauseContract = async (signer) => {
    if (!charityContract || !signer) {
      throw new Error('Contract or signer not available.')
    }

    try {
      const tx = await charityContract.connect(signer).pause()
      return { tx, hash: tx.hash, etherscanUrl: getEtherscanUrl(tx.hash) }
    } catch (error) {
      console.error('Error pausing contract:', error)
      throw error
    }
  }

  const unpauseContract = async (signer) => {
    if (!charityContract || !signer) {
      throw new Error('Contract or signer not available.')
    }

    try {
      const tx = await charityContract.connect(signer).unpause()
      return { tx, hash: tx.hash, etherscanUrl: getEtherscanUrl(tx.hash) }
    } catch (error) {
      console.error('Error unpausing contract:', error)
      throw error
    }
  }

  const emergencyWithdraw = async (amount, signer) => {
    if (!charityContract || !signer) {
      throw new Error('Contract or signer not available.')
    }

    try {
      const amountInWei = ethers.parseEther(amount.toString())
      const tx = await charityContract.connect(signer).emergencyWithdraw(amountInWei)
      return { tx, hash: tx.hash, etherscanUrl: getEtherscanUrl(tx.hash) }
    } catch (error) {
      console.error('Error emergency withdrawing:', error)
      throw error
    }
  }

  const getContractBalance = async () => {
    if (!charityContract) return '0'
    try {
      const balance = await charityContract.getContractBalance()
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Error getting contract balance:', error)
      return '0'
    }
  }

  const isContractPaused = async () => {
    if (!charityContract) return false
    try {
      const paused = await charityContract.paused()
      return paused
    } catch (error) {
      console.error('Error checking if contract is paused:', error)
      return false
    }
  }

  const activateCampaign = async (campaignId, signer) => {
    if (!charityContract || !signer) {
      throw new Error('Contract or signer not available.')
    }

    try {
      const tx = await charityContract.connect(signer).activateCampaign(campaignId)
      return { tx, hash: tx.hash, etherscanUrl: getEtherscanUrl(tx.hash) }
    } catch (error) {
      console.error('Error activating campaign:', error)
      throw error
    }
  }

  const deactivateCampaign = async (campaignId, signer) => {
    if (!charityContract || !signer) {
      throw new Error('Contract or signer not available.')
    }

    try {
      const tx = await charityContract.connect(signer).deactivateCampaign(campaignId)
      return { tx, hash: tx.hash, etherscanUrl: getEtherscanUrl(tx.hash) }
    } catch (error) {
      console.error('Error deactivating campaign:', error)
      throw error
    }
  }

  const approveExpenditure = async (expenditureId, signer) => {
    if (!charityContract || !signer) {
      throw new Error('Contract or signer not available.')
    }

    try {
      const tx = await charityContract.connect(signer).approveExpenditure(expenditureId)
      return { tx, hash: tx.hash, etherscanUrl: getEtherscanUrl(tx.hash) }
    } catch (error) {
      console.error('Error approving expenditure:', error)
      throw error
    }
  }

  const executeExpenditure = async (expenditureId, signer) => {
    if (!charityContract || !signer) {
      throw new Error('Contract or signer not available.')
    }

    try {
      const tx = await charityContract.connect(signer).executeExpenditure(expenditureId)
      return { tx, hash: tx.hash, etherscanUrl: getEtherscanUrl(tx.hash) }
    } catch (error) {
      console.error('Error executing expenditure:', error)
      throw error
    }
  }

  const value = {
    charityContract,
    contractAddress,
    loading,
    error,
    // Contract functions
    fetchAllCampaigns,
    donate,
    createCampaign,
    requestExpenditure,
    getCampaign,
    getCampaignDonations,
    getCampaignExpenditures,
    getTotalCampaigns,
    getTotalExpenditures,
    // Admin functions
    pauseContract,
    unpauseContract,
    emergencyWithdraw,
    getContractBalance,
    isContractPaused,
    activateCampaign,
    deactivateCampaign,
    approveExpenditure,
    executeExpenditure,
    // Transaction functions
    executeTransaction,
    getTransaction,
    transactions,
    isLoading,
    // Utility functions
    getEtherscanUrl,
    waitForTransaction
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
}

export default ContractContext