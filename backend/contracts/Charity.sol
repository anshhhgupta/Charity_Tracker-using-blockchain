// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Charity - Transparent blockchain charity contract for Chain of Hope
/// @notice Allows creation of campaigns, donations, and secure expenditure requests
contract Charity is Ownable, ReentrancyGuard {
    // ============ STRUCTS ============
    /// @notice Campaign data structure
    struct Campaign {
        string name;
        string description;
        uint256 goal;
        uint256 balance;
        address admin;
        uint256 deadline;
        uint256 expenditureCount;
        mapping(uint256 => Expenditure) expenditures;
    }

    /// @notice Expenditure request structure
    struct Expenditure {
        uint256 amount;
        address recipient;
        bool executed;
        string purpose;
    }

    // ============ STATE VARIABLES ============
    uint256 public campaignCount;
    mapping(uint256 => Campaign) private campaigns;

    // ============ EVENTS ============
    event CampaignCreated(uint256 indexed campaignId, address indexed admin, string name, uint256 goal, uint256 deadline);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event ExpenditureRequested(uint256 indexed campaignId, uint256 indexed expenditureId, uint256 amount, address indexed recipient, string purpose);
    event ExpenditureExecuted(uint256 indexed campaignId, uint256 indexed expenditureId, uint256 amount, address indexed recipient);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    // ============ ERRORS ============
    error NotCampaignAdmin();
    error CampaignNotFound();
    error CampaignExpired();
    error InvalidAmount();
    error ExpenditureAlreadyExecuted();
    error ExpenditureNotFound();
    error ExpenditureNotReady();
    error TransferFailed();

    // ============ MODIFIERS ============
    modifier onlyCampaignAdmin(uint256 campaignId) {
        if (campaignId >= campaignCount) revert CampaignNotFound();
        if (msg.sender != campaigns[campaignId].admin) revert NotCampaignAdmin();
        _;
    }

    modifier campaignExists(uint256 campaignId) {
        if (campaignId >= campaignCount) revert CampaignNotFound();
        _;
    }

    modifier notExpired(uint256 campaignId) {
        if (block.timestamp > campaigns[campaignId].deadline) revert CampaignExpired();
        _;
    }

    // ============ CORE FUNCTIONS ============

    /**
     * @notice Create a new charity campaign
     * @param name Campaign name
     * @param description Campaign description
     * @param goal Fundraising goal in wei
     * @param deadline Campaign deadline (timestamp)
     */
    function createCampaign(
        string calldata name,
        string calldata description,
        uint256 goal,
        uint256 deadline
    ) external {
        if (goal == 0) revert InvalidAmount();
        if (deadline <= block.timestamp) revert CampaignExpired();
        uint256 campaignId = campaignCount;
        unchecked { campaignCount++; }
        Campaign storage c = campaigns[campaignId];
        c.name = name;
        c.description = description;
        c.goal = goal;
        c.balance = 0;
        c.admin = msg.sender;
        c.deadline = deadline;
        c.expenditureCount = 0;
        emit CampaignCreated(campaignId, msg.sender, name, goal, deadline);
    }

    /**
     * @notice Donate to a campaign
     * @param campaignId Campaign ID
     */
    function donate(uint256 campaignId) external payable campaignExists(campaignId) notExpired(campaignId) {
        if (msg.value == 0) revert InvalidAmount();
        Campaign storage c = campaigns[campaignId];
        c.balance += msg.value;
        emit DonationReceived(campaignId, msg.sender, msg.value);
    }

    /**
     * @notice Request an expenditure from a campaign (admin only)
     * @param campaignId Campaign ID
     * @param amount Amount requested (wei)
     * @param recipient Address to receive funds
     * @param purpose Purpose of expenditure
     */
    function requestExpenditure(
        uint256 campaignId,
        uint256 amount,
        address recipient,
        string calldata purpose
    ) external onlyCampaignAdmin(campaignId) notExpired(campaignId) {
        if (amount == 0 || amount > campaigns[campaignId].balance) revert InvalidAmount();
        if (recipient == address(0)) revert();
        if (bytes(purpose).length == 0) revert();
        Campaign storage c = campaigns[campaignId];
        uint256 expenditureId = c.expenditureCount;
        unchecked { c.expenditureCount++; }
        c.expenditures[expenditureId] = Expenditure({
            amount: amount,
            recipient: recipient,
            executed: false,
            purpose: purpose
        });
        emit ExpenditureRequested(campaignId, expenditureId, amount, recipient, purpose);
    }

    /**
     * @notice Execute an expenditure (admin only, nonReentrant)
     * @param campaignId Campaign ID
     * @param expenditureId Expenditure ID
     */
    function executeExpenditure(uint256 campaignId, uint256 expenditureId)
        external
        onlyCampaignAdmin(campaignId)
        nonReentrant
    {
        Campaign storage c = campaigns[campaignId];
        if (expenditureId >= c.expenditureCount) revert ExpenditureNotFound();
        Expenditure storage e = c.expenditures[expenditureId];
        if (e.executed) revert ExpenditureAlreadyExecuted();
        if (e.amount > c.balance) revert InvalidAmount();
        // Effects: update state before external call
        e.executed = true;
        c.balance -= e.amount;
        // Interactions: external call after state changes
        (bool success, ) = e.recipient.call{value: e.amount}("");
        if (!success) revert TransferFailed();
        emit ExpenditureExecuted(campaignId, expenditureId, e.amount, e.recipient);
    }

    /**
     * @notice Emergency withdraw contract balance (owner only, nonReentrant)
     * @param amount Amount to withdraw (wei)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0 || amount > address(this).balance) revert InvalidAmount();
        (bool success, ) = owner().call{value: amount}("");
        if (!success) revert TransferFailed();
        emit EmergencyWithdrawal(msg.sender, amount);
    }

    /**
     * @notice Get campaign details
     * @param campaignId Campaign ID
     */
    function getCampaign(uint256 campaignId) external view campaignExists(campaignId)
        returns (
            string memory name,
            string memory description,
            uint256 goal,
            uint256 balance_,
            address admin,
            uint256 deadline,
            uint256 expenditureCount
        )
    {
        Campaign storage c = campaigns[campaignId];
        return (c.name, c.description, c.goal, c.balance, c.admin, c.deadline, c.expenditureCount);
    }

    /**
     * @notice Get expenditure details for a campaign
     * @param campaignId Campaign ID
     * @param expenditureId Expenditure ID
     */
    function getExpenditure(uint256 campaignId, uint256 expenditureId)
        external
        view
        campaignExists(campaignId)
        returns (
            uint256 amount,
            address recipient,
            bool executed,
            string memory purpose
        )
    {
        Campaign storage c = campaigns[campaignId];
        if (expenditureId >= c.expenditureCount) revert ExpenditureNotFound();
        Expenditure storage e = c.expenditures[expenditureId];
        return (e.amount, e.recipient, e.executed, e.purpose);
    }

    /**
     * @notice Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
        uint256 indexed campaignId,
        address indexed creator,
        string name,
        uint256 goal,
        uint256 timestamp
    );
    
    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 totalRaised,
        uint256 timestamp
    );
    
    event ExpenditureRequested(
        uint256 indexed expenditureId,
        uint256 indexed campaignId,
        address indexed requester,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );
    
    event ExpenditureApproved(
        uint256 indexed expenditureId,
        uint256 indexed campaignId,
        uint256 amount,
        address indexed approver
    );
    
    event ExpenditureExecuted(
        uint256 indexed expenditureId,
        uint256 indexed campaignId,
        uint256 amount,
        address indexed executor
    );
    
    event CampaignDeactivated(
        uint256 indexed campaignId,
        uint256 timestamp
    );
    
    event CampaignActivated(
        uint256 indexed campaignId,
        uint256 timestamp
    );
    
    event ContractPaused(
        address indexed pauser,
        uint256 timestamp
    );
    
    event ContractUnpaused(
        address indexed unpauser,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        _;
    }
    
    modifier expenditureExists(uint256 _expenditureId) {
        require(_expenditureId < expenditureCounter, "Expenditure does not exist");
        _;
    }
    
    modifier onlyCampaignCreator(uint256 _campaignId) {
        require(campaigns[_campaignId].creator == msg.sender, "Only campaign creator can perform this action");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Create a new charity campaign
     * @param _name Campaign name
     * @param _description Campaign description
     * @param _goal Fundraising goal in wei
     */
    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal
    ) external whenNotPaused returns (uint256) {
        require(_goal > 0, "Goal must be greater than 0");
        require(bytes(_name).length > 0, "Campaign name cannot be empty");
        require(bytes(_description).length > 0, "Campaign description cannot be empty");
        
        uint256 campaignId = campaignCounter;
        campaignCounter++;
        
        Campaign storage newCampaign = campaigns[campaignId];
        newCampaign.id = campaignId;
        newCampaign.name = _name;
        newCampaign.description = _description;
        newCampaign.goal = _goal;
        newCampaign.raised = 0;
        newCampaign.creator = msg.sender;
        newCampaign.isActive = true;
        newCampaign.createdAt = block.timestamp;
        newCampaign.totalDonors = 0;
        
        emit CampaignCreated(campaignId, msg.sender, _name, _goal, block.timestamp);
        
        return campaignId;
    }
    
    /**
     * @dev Donate to a specific campaign
     * @param _campaignId Campaign ID to donate to
     */
    function donate(uint256 _campaignId) 
        external 
        payable 
        nonReentrant
        whenNotPaused
        campaignExists(_campaignId)
        campaignActive(_campaignId)
    {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Campaign storage campaign = campaigns[_campaignId];
        
        // Update campaign raised amount
        campaign.raised += msg.value;
        
        // Track donor amount for this campaign
        donorAmounts[msg.sender][_campaignId] += msg.value;
        
        // Create donation record
        Donation memory newDonation = Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            isRefunded: false
        });
        
        campaignDonations[_campaignId].push(newDonation);
        
        // Update donor count if this is first donation from this address
        if (donorAmounts[msg.sender][_campaignId] == msg.value) {
            campaign.totalDonors++;
        }
        
        emit DonationReceived(
            _campaignId,
            msg.sender,
            msg.value,
            campaign.raised,
            block.timestamp
        );
    }
    
    /**
     * @dev Request expenditure from campaign funds
     * @param _campaignId Campaign ID to request expenditure from
     * @param _amount Amount to request in wei
     * @param _purpose Purpose of the expenditure
     */
    function requestExpenditure(
        uint256 _campaignId,
        uint256 _amount,
        string memory _purpose
    ) 
        external 
        whenNotPaused
        campaignExists(_campaignId)
        campaignActive(_campaignId)
        onlyCampaignCreator(_campaignId)
    {
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_purpose).length > 0, "Purpose cannot be empty");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(_amount <= campaign.raised, "Requested amount exceeds campaign funds");
        
        uint256 expenditureId = expenditureCounter;
        expenditureCounter++;
        
        Expenditure memory newExpenditure = Expenditure({
            id: expenditureId,
            campaignId: _campaignId,
            amount: _amount,
            purpose: _purpose,
            requester: msg.sender,
            isApproved: false,
            isExecuted: false,
            requestedAt: block.timestamp
        });
        
        expenditures[expenditureId] = newExpenditure;
        campaignExpenditures[_campaignId].push(newExpenditure);
        
        emit ExpenditureRequested(
            expenditureId,
            _campaignId,
            msg.sender,
            _amount,
            _purpose,
            block.timestamp
        );
    }
    
    /**
     * @dev Approve an expenditure request (only owner)
     * @param _expenditureId Expenditure ID to approve
     */
    function approveExpenditure(uint256 _expenditureId) 
        external 
        onlyOwner
        expenditureExists(_expenditureId)
    {
        Expenditure storage expenditure = expenditures[_expenditureId];
        require(!expenditure.isApproved, "Expenditure already approved");
        require(!expenditure.isExecuted, "Expenditure already executed");
        
        expenditure.isApproved = true;
        
        emit ExpenditureApproved(
            _expenditureId,
            expenditure.campaignId,
            expenditure.amount,
            msg.sender
        );
    }
    
    /**
     * @dev Execute an approved expenditure
     * @param _expenditureId Expenditure ID to execute
     */
    function executeExpenditure(uint256 _expenditureId) 
        external 
        onlyOwner
        expenditureExists(_expenditureId)
        nonReentrant
    {
        Expenditure storage expenditure = expenditures[_expenditureId];
        require(expenditure.isApproved, "Expenditure not approved");
        require(!expenditure.isExecuted, "Expenditure already executed");
        
        Campaign storage campaign = campaigns[expenditure.campaignId];
        require(expenditure.amount <= campaign.raised, "Insufficient campaign funds");
        
        expenditure.isExecuted = true;
        campaign.raised -= expenditure.amount;
        
        // Transfer funds to the requester
        (bool success, ) = expenditure.requester.call{value: expenditure.amount}("");
        require(success, "Transfer failed");
        
        emit ExpenditureExecuted(
            _expenditureId,
            expenditure.campaignId,
            expenditure.amount,
            msg.sender
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get campaign details
     * @param _campaignId Campaign ID
     */
    function getCampaign(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId)
        returns (
            uint256 id,
            string memory name,
            string memory description,
            uint256 goal,
            uint256 raised,
            address creator,
            bool isActive,
            uint256 createdAt,
            uint256 totalDonors
        )
    {
        Campaign memory campaign = campaigns[_campaignId];
        return (
            campaign.id,
            campaign.name,
            campaign.description,
            campaign.goal,
            campaign.raised,
            campaign.creator,
            campaign.isActive,
            campaign.createdAt,
            campaign.totalDonors
        );
    }
    
    /**
     * @dev Get donations for a campaign
     * @param _campaignId Campaign ID
     */
    function getCampaignDonations(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId)
        returns (Donation[] memory)
    {
        return campaignDonations[_campaignId];
    }
    
    /**
     * @dev Get expenditures for a campaign
     * @param _campaignId Campaign ID
     */
    function getCampaignExpenditures(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId)
        returns (Expenditure[] memory)
    {
        return campaignExpenditures[_campaignId];
    }
    
    /**
     * @dev Get expenditure details
     * @param _expenditureId Expenditure ID
     */
    function getExpenditure(uint256 _expenditureId) 
        external 
        view 
        expenditureExists(_expenditureId)
        returns (
            uint256 id,
            uint256 campaignId,
            uint256 amount,
            string memory purpose,
            address requester,
            bool isApproved,
            bool isExecuted,
            uint256 requestedAt
        )
    {
        Expenditure memory expenditure = expenditures[_expenditureId];
        return (
            expenditure.id,
            expenditure.campaignId,
            expenditure.amount,
            expenditure.purpose,
            expenditure.requester,
            expenditure.isApproved,
            expenditure.isExecuted,
            expenditure.requestedAt
        );
    }
    
    /**
     * @dev Get total number of campaigns
     */
    function getTotalCampaigns() external view returns (uint256) {
        return campaignCounter;
    }
    
    /**
     * @dev Get total number of expenditures
     */
    function getTotalExpenditures() external view returns (uint256) {
        return expenditureCounter;
    }
    
    /**
     * @dev Get donor's total contribution to a campaign
     * @param _donor Donor address
     * @param _campaignId Campaign ID
     */
    function getDonorContribution(address _donor, uint256 _campaignId) 
        external 
        view 
        returns (uint256)
    {
        return donorAmounts[_donor][_campaignId];
    }
    
    /**
     * @dev Get campaign funding progress percentage
     * @param _campaignId Campaign ID
     */
    function getCampaignProgress(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId)
        returns (uint256)
    {
        Campaign memory campaign = campaigns[_campaignId];
        if (campaign.goal == 0) return 0;
        return (campaign.raised * 100) / campaign.goal;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Deactivate a campaign (only owner)
     * @param _campaignId Campaign ID to deactivate
     */
    function deactivateCampaign(uint256 _campaignId) 
        external 
        onlyOwner
        campaignExists(_campaignId)
    {
        campaigns[_campaignId].isActive = false;
        emit CampaignDeactivated(_campaignId, block.timestamp);
    }
    
    /**
     * @dev Activate a campaign (only owner)
     * @param _campaignId Campaign ID to activate
     */
    function activateCampaign(uint256 _campaignId) 
        external 
        onlyOwner
        campaignExists(_campaignId)
    {
        campaigns[_campaignId].isActive = true;
        emit CampaignActivated(_campaignId, block.timestamp);
    }
    
    /**
     * @dev Pause the contract in case of emergency (only owner)
     */
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Emergency withdraw function (only owner)
     * @param _amount Amount to withdraw in wei
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient contract balance");
        require(_amount > 0, "Amount must be greater than 0");
        
        (bool success, ) = owner().call{value: _amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get donor amount for a specific campaign
     * @param _campaignId Campaign ID
     * @param _donor Donor address
     */
    function getDonorCampaignAmount(uint256 _campaignId, address _donor) 
        external 
        view 
        campaignExists(_campaignId)
        returns (uint256) 
    {
        return donorAmounts[_donor][_campaignId];
    }
    
    /**
     * @dev Get total donations count
     */
    function getTotalDonations() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < campaignCounter; i++) {
            total += campaignDonations[i].length;
        }
        return total;
    }
}
