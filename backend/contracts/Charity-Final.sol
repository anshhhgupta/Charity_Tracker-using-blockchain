// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Charity
 * @author Chain of Hope Team
 * @notice A transparent blockchain-based charity system for managing campaigns and expenditures
 * @dev Implements secure donation handling with campaign management and expenditure tracking
 */
contract Charity is Ownable, ReentrancyGuard {
    // ============ STRUCTS ============

    /**
     * @notice Expenditure request structure
     * @param amount Amount requested in wei
     * @param recipient Address to receive the funds
     * @param purpose Description of expenditure purpose
     * @param executed Whether the expenditure has been executed
     */
    struct Expenditure {
        uint256 amount;
        address recipient;
        string purpose;
        bool executed;
    }

    /**
     * @notice Campaign data structure
     * @param id Unique campaign identifier
     * @param name Campaign name
     * @param description Campaign description
     * @param goal Fundraising goal in wei
     * @param balance Current campaign balance in wei
     * @param admin Campaign administrator address
     * @param deadline Campaign deadline timestamp
     * @param expenditures Array of expenditure requests
     */
    struct Campaign {
        uint256 id;
        string name;
        string description;
        uint256 goal;
        uint256 balance;
        address admin;
        uint256 deadline;
        Expenditure[] expenditures;
    }

    // ============ STATE VARIABLES ============

    /// @notice Total number of campaigns created
    uint256 public campaignCount;

    /// @notice Mapping from campaign ID to Campaign struct
    mapping(uint256 => Campaign) private campaigns;

    // ============ EVENTS ============

    /**
     * @notice Emitted when a new campaign is created
     * @param campaignId Unique identifier for the campaign
     * @param admin Address of the campaign administrator
     * @param name Campaign name
     * @param goal Fundraising goal in wei
     * @param deadline Campaign deadline timestamp
     */
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed admin,
        string name,
        uint256 goal,
        uint256 deadline
    );

    /**
     * @notice Emitted when a donation is received
     * @param campaignId Campaign receiving the donation
     * @param donor Address of the donor
     * @param amount Donation amount in wei
     */
    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    /**
     * @notice Emitted when an expenditure is requested
     * @param campaignId Campaign ID
     * @param expenditureId Expenditure index in the campaign
     * @param amount Amount requested in wei
     * @param recipient Address to receive funds
     * @param purpose Purpose of the expenditure
     */
    event ExpenditureRequested(
        uint256 indexed campaignId,
        uint256 indexed expenditureId,
        uint256 amount,
        address indexed recipient,
        string purpose
    );

    /**
     * @notice Emitted when an expenditure is executed
     * @param campaignId Campaign ID
     * @param expenditureId Expenditure index
     * @param amount Amount transferred in wei
     * @param recipient Address that received funds
     */
    event ExpenditureExecuted(
        uint256 indexed campaignId,
        uint256 indexed expenditureId,
        uint256 amount,
        address indexed recipient
    );

    /**
     * @notice Emitted when emergency withdrawal is performed
     * @param to Address receiving the funds
     * @param amount Amount withdrawn in wei
     */
    event EmergencyWithdrawal(address indexed to, uint256 amount);

    // ============ ERRORS ============

    error InvalidGoal();
    error InvalidDeadline();
    error EmptyName();
    error EmptyDescription();
    error CampaignNotFound();
    error CampaignExpired();
    error InvalidDonation();
    error NotCampaignAdmin();
    error InvalidAmount();
    error InsufficientBalance();
    error EmptyPurpose();
    error InvalidRecipient();
    error ExpenditureNotFound();
    error ExpenditureAlreadyExecuted();
    error TransferFailed();

    // ============ MODIFIERS ============

    /**
     * @notice Ensures campaign exists
     * @param campaignId Campaign ID to check
     */
    modifier campaignExists(uint256 campaignId) {
        if (campaignId >= campaignCount) revert CampaignNotFound();
        _;
    }

    /**
     * @notice Ensures campaign has not expired
     * @param campaignId Campaign ID to check
     */
    modifier notExpired(uint256 campaignId) {
        if (block.timestamp > campaigns[campaignId].deadline) revert CampaignExpired();
        _;
    }

    /**
     * @notice Ensures caller is the campaign admin
     * @param campaignId Campaign ID to check
     */
    modifier onlyCampaignAdmin(uint256 campaignId) {
        if (msg.sender != campaigns[campaignId].admin) revert NotCampaignAdmin();
        _;
    }

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initializes the contract
     * @dev Sets the deployer as the initial owner
     */
    constructor() Ownable(msg.sender) {}

    // ============ EXTERNAL FUNCTIONS ============

    /**
     * @notice Creates a new charity campaign
     * @dev Campaign ID is auto-incremented starting from 0
     * @param name Campaign name (must not be empty)
     * @param description Campaign description (must not be empty)
     * @param goal Fundraising goal in wei (must be greater than 0)
     * @param deadline Campaign deadline as Unix timestamp (must be in the future)
     * @return campaignId The ID of the newly created campaign
     */
    function createCampaign(
        string calldata name,
        string calldata description,
        uint256 goal,
        uint256 deadline
    ) external returns (uint256 campaignId) {
        // Input validation
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(description).length == 0) revert EmptyDescription();
        if (goal == 0) revert InvalidGoal();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        // Get campaign ID and increment counter (gas optimization with unchecked)
        campaignId = campaignCount;
        unchecked {
            ++campaignCount;
        }

        // Create campaign storage reference
        Campaign storage newCampaign = campaigns[campaignId];
        newCampaign.id = campaignId;
        newCampaign.name = name;
        newCampaign.description = description;
        newCampaign.goal = goal;
        newCampaign.balance = 0;
        newCampaign.admin = msg.sender;
        newCampaign.deadline = deadline;

        emit CampaignCreated(campaignId, msg.sender, name, goal, deadline);
    }

    /**
     * @notice Donate to a specific campaign
     * @dev Campaign must exist and not be expired. Donation amount must be greater than 0
     * @param campaignId The ID of the campaign to donate to
     */
    function donate(uint256 campaignId)
        external
        payable
        campaignExists(campaignId)
        notExpired(campaignId)
    {
        if (msg.value == 0) revert InvalidDonation();

        // Update state before any external interactions
        Campaign storage campaign = campaigns[campaignId];
        campaign.balance += msg.value;

        emit DonationReceived(campaignId, msg.sender, msg.value);
    }

    /**
     * @notice Request an expenditure from campaign funds
     * @dev Only campaign admin can request expenditures. Campaign must not be expired
     * @param campaignId Campaign ID to request expenditure from
     * @param amount Amount to request in wei (must be > 0 and <= campaign balance)
     * @param recipient Address to receive the funds (must not be zero address)
     * @param purpose Description of expenditure purpose (must not be empty)
     * @return expenditureId The index of the created expenditure
     */
    function requestExpenditure(
        uint256 campaignId,
        uint256 amount,
        address recipient,
        string calldata purpose
    )
        external
        campaignExists(campaignId)
        notExpired(campaignId)
        onlyCampaignAdmin(campaignId)
        returns (uint256 expenditureId)
    {
        // Input validation
        if (amount == 0) revert InvalidAmount();
        if (recipient == address(0)) revert InvalidRecipient();
        if (bytes(purpose).length == 0) revert EmptyPurpose();

        Campaign storage campaign = campaigns[campaignId];
        if (amount > campaign.balance) revert InsufficientBalance();

        // Create expenditure
        expenditureId = campaign.expenditures.length;
        campaign.expenditures.push(
            Expenditure({
                amount: amount,
                recipient: recipient,
                purpose: purpose,
                executed: false
            })
        );

        emit ExpenditureRequested(campaignId, expenditureId, amount, recipient, purpose);
    }

    /**
     * @notice Execute an approved expenditure
     * @dev Only campaign admin can execute. Uses Checks-Effects-Interactions pattern
     * @param campaignId Campaign ID
     * @param expenditureId Index of the expenditure in the campaign's expenditure array
     */
    function executeExpenditure(uint256 campaignId, uint256 expenditureId)
        external
        campaignExists(campaignId)
        onlyCampaignAdmin(campaignId)
        nonReentrant
    {
        Campaign storage campaign = campaigns[campaignId];

        // Checks
        if (expenditureId >= campaign.expenditures.length) revert ExpenditureNotFound();

        Expenditure storage expenditure = campaign.expenditures[expenditureId];
        if (expenditure.executed) revert ExpenditureAlreadyExecuted();
        if (expenditure.amount > campaign.balance) revert InsufficientBalance();

        // Effects - Update state before external call
        expenditure.executed = true;
        campaign.balance -= expenditure.amount;

        // Cache values for event and external call
        uint256 amount = expenditure.amount;
        address recipient = expenditure.recipient;

        // Emit event before external call
        emit ExpenditureExecuted(campaignId, expenditureId, amount, recipient);

        // Interactions - External call last
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Emergency withdrawal function for contract owner
     * @dev Only owner can call. Uses Checks-Effects-Interactions pattern with nonReentrant
     * @param to Address to receive the withdrawn funds
     */
    function emergencyWithdraw(address payable to) external onlyOwner nonReentrant {
        if (to == address(0)) revert InvalidRecipient();

        uint256 amount = address(this).balance;
        if (amount == 0) revert InvalidAmount();

        // Emit event before external call
        emit EmergencyWithdrawal(to, amount);

        // External call last
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get campaign details
     * @param campaignId Campaign ID to query
     * @return id Campaign ID
     * @return name Campaign name
     * @return description Campaign description
     * @return goal Fundraising goal
     * @return balance Current balance
     * @return admin Campaign administrator
     * @return deadline Campaign deadline
     * @return expenditureCount Number of expenditures
     */
    function getCampaign(uint256 campaignId)
        external
        view
        campaignExists(campaignId)
        returns (
            uint256 id,
            string memory name,
            string memory description,
            uint256 goal,
            uint256 balance,
            address admin,
            uint256 deadline,
            uint256 expenditureCount
        )
    {
        Campaign storage campaign = campaigns[campaignId];
        return (
            campaign.id,
            campaign.name,
            campaign.description,
            campaign.goal,
            campaign.balance,
            campaign.admin,
            campaign.deadline,
            campaign.expenditures.length
        );
    }

    /**
     * @notice Get expenditure details
     * @param campaignId Campaign ID
     * @param expenditureId Expenditure index
     * @return amount Expenditure amount
     * @return recipient Recipient address
     * @return purpose Expenditure purpose
     * @return executed Whether executed
     */
    function getExpenditure(uint256 campaignId, uint256 expenditureId)
        external
        view
        campaignExists(campaignId)
        returns (
            uint256 amount,
            address recipient,
            string memory purpose,
            bool executed
        )
    {
        Campaign storage campaign = campaigns[campaignId];
        if (expenditureId >= campaign.expenditures.length) revert ExpenditureNotFound();

        Expenditure storage expenditure = campaign.expenditures[expenditureId];
        return (expenditure.amount, expenditure.recipient, expenditure.purpose, expenditure.executed);
    }

    /**
     * @notice Get all expenditures for a campaign
     * @param campaignId Campaign ID
     * @return Array of expenditures
     */
    function getCampaignExpenditures(uint256 campaignId)
        external
        view
        campaignExists(campaignId)
        returns (Expenditure[] memory)
    {
        return campaigns[campaignId].expenditures;
    }

    /**
     * @notice Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Check if campaign is active (not expired)
     * @param campaignId Campaign ID to check
     * @return True if campaign is still active
     */
    function isCampaignActive(uint256 campaignId)
        external
        view
        campaignExists(campaignId)
        returns (bool)
    {
        return block.timestamp <= campaigns[campaignId].deadline;
    }

    /**
     * @notice Get campaign progress percentage
     * @param campaignId Campaign ID
     * @return Progress as percentage (0-100+)
     */
    function getCampaignProgress(uint256 campaignId)
        external
        view
        campaignExists(campaignId)
        returns (uint256)
    {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.goal == 0) return 0;
        return (campaign.balance * 100) / campaign.goal;
    }
}
