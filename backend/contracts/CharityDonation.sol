// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CharityDonation
 * @dev A transparent charity donation system with donor anonymity options and withdrawal tracking
 */
contract CharityDonation is ReentrancyGuard, Ownable {
    // Events
    event DonationMade(
        address indexed donor,
        uint256 amount,
        string message,
        bool isAnonymous,
        uint256 timestamp
    );
    
    event WithdrawalMade(
        address indexed charity,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );
    
    event EmergencyWithdrawal(
        address indexed charity,
        uint256 amount,
        uint256 timestamp
    );

    // Structs
    struct Donation {
        address donor;
        uint256 amount;
        string message;
        bool isAnonymous;
        uint256 timestamp;
    }
    
    struct Withdrawal {
        address charity;
        uint256 amount;
        string purpose;
        uint256 timestamp;
    }
    
    struct CharityInfo {
        string name;
        string description;
        string website;
        bool isActive;
    }

    // State variables
    uint256 private _donationCounter;
    uint256 private _withdrawalCounter;
    
    address public immutable charityWallet;
    CharityInfo public charityInfo;
    
    uint256 public totalDonated;
    uint256 public totalWithdrawn;
    uint256 public emergencyFundThreshold = 1 ether; // Minimum balance before emergency withdrawal allowed
    
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => Withdrawal) public withdrawals;
    mapping(address => uint256[]) public donorDonations;

    // Modifiers
    modifier onlyCharity() {
        require(msg.sender == charityWallet, "Only charity wallet can perform this action");
        _;
    }
    
    modifier validDonation() {
        require(msg.value > 0, "Donation amount must be greater than 0");
        _;
    }

    constructor(
        address _charityWallet,
        string memory _name,
        string memory _description,
        string memory _website
    ) Ownable(msg.sender) {
        require(_charityWallet != address(0), "Charity wallet cannot be zero address");
        
        charityWallet = _charityWallet;
        charityInfo = CharityInfo({
            name: _name,
            description: _description,
            website: _website,
            isActive: true
        });
    }

    /**
     * @dev Make a donation to the charity
     * @param _message Optional message from donor
     * @param _isAnonymous Whether donor wants to remain anonymous
     */
    function donate(string memory _message, bool _isAnonymous) 
        external 
        payable 
        validDonation 
        nonReentrant 
    {
        uint256 donationId = _donationCounter;
        _donationCounter++;
        
        address donor = _isAnonymous ? address(0) : msg.sender;
        
        donations[donationId] = Donation({
            donor: donor,
            amount: msg.value,
            message: _message,
            isAnonymous: _isAnonymous,
            timestamp: block.timestamp
        });
        
        if (!_isAnonymous) {
            donorDonations[msg.sender].push(donationId);
        }
        
        totalDonated += msg.value;
        
        emit DonationMade(donor, msg.value, _message, _isAnonymous, block.timestamp);
    }

    /**
     * @dev Withdraw funds for charity purposes
     * @param _amount Amount to withdraw
     * @param _purpose Purpose of withdrawal
     */
    function withdraw(uint256 _amount, string memory _purpose) 
        external 
        onlyCharity 
        nonReentrant 
    {
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(_amount <= address(this).balance, "Insufficient contract balance");
        require(bytes(_purpose).length > 0, "Purpose must be provided");
        
        uint256 withdrawalId = _withdrawalCounter;
        _withdrawalCounter++;
        
        withdrawals[withdrawalId] = Withdrawal({
            charity: charityWallet,
            amount: _amount,
            purpose: _purpose,
            timestamp: block.timestamp
        });
        
        totalWithdrawn += _amount;
        
        (bool success, ) = charityWallet.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit WithdrawalMade(charityWallet, _amount, _purpose, block.timestamp);
    }

    /**
     * @dev Emergency withdrawal when balance exceeds threshold
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 _amount) external onlyCharity nonReentrant {
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(_amount <= address(this).balance, "Insufficient contract balance");
        require(address(this).balance >= emergencyFundThreshold, "Emergency threshold not met");
        
        totalWithdrawn += _amount;
        
        (bool success, ) = charityWallet.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit EmergencyWithdrawal(charityWallet, _amount, block.timestamp);
    }

    /**
     * @dev Update charity information (only owner)
     */
    function updateCharityInfo(
        string memory _name,
        string memory _description,
        string memory _website,
        bool _isActive
    ) external onlyOwner {
        charityInfo = CharityInfo({
            name: _name,
            description: _description,
            website: _website,
            isActive: _isActive
        });
    }

    /**
     * @dev Set emergency fund threshold (only owner)
     */
    function setEmergencyFundThreshold(uint256 _threshold) external onlyOwner {
        emergencyFundThreshold = _threshold;
    }

    /**
     * @dev Get donation by ID
     */
    function getDonation(uint256 _donationId) external view returns (Donation memory) {
        require(_donationId < _donationCounter, "Donation does not exist");
        return donations[_donationId];
    }

    /**
     * @dev Get withdrawal by ID
     */
    function getWithdrawal(uint256 _withdrawalId) external view returns (Withdrawal memory) {
        require(_withdrawalId < _withdrawalCounter, "Withdrawal does not exist");
        return withdrawals[_withdrawalId];
    }

    /**
     * @dev Get donor's donations
     */
    function getDonorDonations(address _donor) external view returns (uint256[] memory) {
        return donorDonations[_donor];
    }

    /**
     * @dev Get total number of donations
     */
    function getTotalDonations() external view returns (uint256) {
        return _donationCounter;
    }

    /**
     * @dev Get total number of withdrawals
     */
    function getTotalWithdrawals() external view returns (uint256) {
        return _withdrawalCounter;
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get donation statistics
     */
    function getStats() external view returns (
        uint256 _totalDonated,
        uint256 _totalWithdrawn,
        uint256 _currentBalance,
        uint256 _totalDonations,
        uint256 _totalWithdrawals
    ) {
        return (
            totalDonated,
            totalWithdrawn,
            address(this).balance,
            _donationCounter,
            _withdrawalCounter
        );
    }

    /**
     * @dev Get recent donations (last N donations)
     */
    function getRecentDonations(uint256 _count) external view returns (Donation[] memory) {
        uint256 totalDonations = _donationCounter;
        if (_count > totalDonations) {
            _count = totalDonations;
        }
        
        Donation[] memory recentDonations = new Donation[](_count);
        uint256 startIndex = totalDonations - _count;
        
        for (uint256 i = 0; i < _count; i++) {
            recentDonations[i] = donations[startIndex + i];
        }
        
        return recentDonations;
    }

    /**
     * @dev Get recent withdrawals (last N withdrawals)
     */
    function getRecentWithdrawals(uint256 _count) external view returns (Withdrawal[] memory) {
        uint256 totalWithdrawals = _withdrawalCounter;
        if (_count > totalWithdrawals) {
            _count = totalWithdrawals;
        }
        
        Withdrawal[] memory recentWithdrawals = new Withdrawal[](_count);
        uint256 startIndex = totalWithdrawals - _count;
        
        for (uint256 i = 0; i < _count; i++) {
            recentWithdrawals[i] = withdrawals[startIndex + i];
        }
        
        return recentWithdrawals;
    }
}
