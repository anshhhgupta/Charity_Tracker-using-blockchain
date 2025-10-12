const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Charity Contract Tests", function () {
  let charity;
  let owner;
  let campaignCreator;
  let donor1;
  let donor2;
  let otherAccount;

  beforeEach(async function () {
    // Get signers
    [owner, campaignCreator, donor1, donor2, otherAccount] = await ethers.getSigners();

    // Deploy Charity contract
    const Charity = await ethers.getContractFactory("Charity");
    charity = await Charity.deploy({
      gasLimit: 5000000, // 5M gas limit
    });
    await charity.waitForDeployment();

    console.log("✅ Charity contract deployed at:", await charity.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await charity.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero campaign counter", async function () {
      expect(await charity.getTotalCampaigns()).to.equal(0);
    });

    it("Should initialize with zero expenditure counter", async function () {
      expect(await charity.getTotalExpenditures()).to.equal(0);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign with correct name and goal", async function () {
      const campaignName = "Emergency Relief Fund";
      const campaignDescription = "Help for disaster victims";
      const goal = ethers.parseEther("100.0");

      // Create campaign
      const tx = await charity.connect(campaignCreator).createCampaign(
        campaignName,
        campaignDescription,
        goal
      );

      // Check event emission
      await expect(tx)
        .to.emit(charity, "CampaignCreated")
        .withArgs(
          0, // campaignId
          campaignCreator.address,
          campaignName,
          goal,
          await getCurrentTimestamp()
        );

      // Verify campaign data
      const campaign = await charity.getCampaign(0);
      expect(campaign[0]).to.equal(0); // id
      expect(campaign[1]).to.equal(campaignName); // name
      expect(campaign[2]).to.equal(campaignDescription); // description
      expect(campaign[3]).to.equal(goal); // goal
      expect(campaign[4]).to.equal(0); // raised
      expect(campaign[5]).to.equal(campaignCreator.address); // creator
      expect(campaign[6]).to.be.true; // isActive
      expect(campaign[8]).to.equal(0); // totalDonors

      // Verify total campaigns increased
      expect(await charity.getTotalCampaigns()).to.equal(1);
    });

    it("Should reject campaign creation with zero goal", async function () {
      await expect(
        charity.connect(campaignCreator).createCampaign(
          "Test Campaign",
          "Test Description",
          0
        )
      ).to.be.revertedWith("Goal must be greater than 0");
    });

    it("Should reject campaign creation with empty name", async function () {
      await expect(
        charity.connect(campaignCreator).createCampaign(
          "",
          "Test Description",
          ethers.parseEther("10.0")
        )
      ).to.be.revertedWith("Campaign name cannot be empty");
    });

    it("Should reject campaign creation with empty description", async function () {
      await expect(
        charity.connect(campaignCreator).createCampaign(
          "Test Campaign",
          "",
          ethers.parseEther("10.0")
        )
      ).to.be.revertedWith("Campaign description cannot be empty");
    });

    it("Should create multiple campaigns with unique IDs", async function () {
      // Create first campaign
      await charity.connect(campaignCreator).createCampaign(
        "Campaign 1",
        "Description 1",
        ethers.parseEther("50.0")
      );

      // Create second campaign
      await charity.connect(donor1).createCampaign(
        "Campaign 2",
        "Description 2",
        ethers.parseEther("75.0")
      );

      expect(await charity.getTotalCampaigns()).to.equal(2);

      // Verify campaign IDs are unique
      const campaign1 = await charity.getCampaign(0);
      const campaign2 = await charity.getCampaign(1);
      
      expect(campaign1[1]).to.equal("Campaign 1");
      expect(campaign2[1]).to.equal("Campaign 2");
      expect(campaign1[5]).to.equal(campaignCreator.address); // creator
      expect(campaign2[5]).to.equal(donor1.address); // creator
    });
  });

  describe("Donation Flow", function () {
    let campaignId;

    beforeEach(async function () {
      // Create a campaign for donation tests
      const tx = await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("100.0")
      );
      campaignId = 0;
    });

    it("Should accept donations and update balances correctly", async function () {
      const donationAmount = ethers.parseEther("25.0");

      // Make donation
      const tx = await charity.connect(donor1).donate(campaignId, {
        value: donationAmount,
      });

      // Check event emission
      await expect(tx)
        .to.emit(charity, "DonationReceived")
        .withArgs(
          campaignId,
          donor1.address,
          donationAmount,
          donationAmount, // totalRaised
          await getCurrentTimestamp()
        );

      // Verify campaign raised amount
      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(donationAmount); // raised

      // Verify donor contribution tracking
      const donorContribution = await charity.getDonorContribution(donor1.address, campaignId);
      expect(donorContribution).to.equal(donationAmount);

      // Verify total donors count
      expect(campaign[8]).to.equal(1); // totalDonors

      // Verify campaign progress
      const progress = await charity.getCampaignProgress(campaignId);
      expect(progress).to.equal(25); // 25% progress (25/100)
    });

    it("Should track multiple donations from same donor", async function () {
      const firstDonation = ethers.parseEther("10.0");
      const secondDonation = ethers.parseEther("15.0");

      // Make first donation
      await charity.connect(donor1).donate(campaignId, {
        value: firstDonation,
      });

      // Make second donation from same donor
      await charity.connect(donor1).donate(campaignId, {
        value: secondDonation,
      });

      // Verify total raised
      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(firstDonation + secondDonation);

      // Verify donor's total contribution
      const donorContribution = await charity.getDonorContribution(donor1.address, campaignId);
      expect(donorContribution).to.equal(firstDonation + secondDonation);

      // Verify donor count remains 1 (same donor)
      expect(campaign[8]).to.equal(1);
    });

    it("Should track multiple donors correctly", async function () {
      const donation1 = ethers.parseEther("20.0");
      const donation2 = ethers.parseEther("30.0");

      // First donor
      await charity.connect(donor1).donate(campaignId, {
        value: donation1,
      });

      // Second donor
      await charity.connect(donor2).donate(campaignId, {
        value: donation2,
      });

      // Verify total raised
      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(donation1 + donation2);

      // Verify donor count
      expect(campaign[8]).to.equal(2);

      // Verify individual contributions
      expect(await charity.getDonorContribution(donor1.address, campaignId)).to.equal(donation1);
      expect(await charity.getDonorContribution(donor2.address, campaignId)).to.equal(donation2);
    });

    it("Should reject zero amount donations", async function () {
      await expect(
        charity.connect(donor1).donate(campaignId, { value: 0 })
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });

    it("Should reject donations to non-existent campaigns", async function () {
      await expect(
        charity.connect(donor1).donate(999, { value: ethers.parseEther("10.0") })
      ).to.be.revertedWith("Campaign does not exist");
    });

    it("Should reject donations to inactive campaigns", async function () {
      // Deactivate campaign
      await charity.connect(owner).deactivateCampaign(campaignId);

      await expect(
        charity.connect(donor1).donate(campaignId, { value: ethers.parseEther("10.0") })
      ).to.be.revertedWith("Campaign is not active");
    });

    it("Should return campaign donations correctly", async function () {
      const donation1 = ethers.parseEther("10.0");
      const donation2 = ethers.parseEther("20.0");

      // Make donations
      await charity.connect(donor1).donate(campaignId, { value: donation1 });
      await charity.connect(donor2).donate(campaignId, { value: donation2 });

      // Get donations
      const donations = await charity.getCampaignDonations(campaignId);
      
      expect(donations.length).to.equal(2);
      expect(donations[0].donor).to.equal(donor1.address);
      expect(donations[0].amount).to.equal(donation1);
      expect(donations[1].donor).to.equal(donor2.address);
      expect(donations[1].amount).to.equal(donation2);
    });
  });

  describe("Expenditure Requests", function () {
    let campaignId;

    beforeEach(async function () {
      // Create campaign and add funds
      await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("100.0")
      );
      campaignId = 0;

      // Add funds to campaign
      await charity.connect(donor1).donate(campaignId, {
        value: ethers.parseEther("50.0"),
      });
    });

    it("Should allow campaign creator to request expenditure", async function () {
      const expenditureAmount = ethers.parseEther("20.0");
      const purpose = "Emergency relief supplies";

      // Request expenditure
      const tx = await charity.connect(campaignCreator).requestExpenditure(
        campaignId,
        expenditureAmount,
        purpose
      );

      // Check event emission
      await expect(tx)
        .to.emit(charity, "ExpenditureRequested")
        .withArgs(
          0, // expenditureId
          campaignId,
          campaignCreator.address,
          expenditureAmount,
          purpose,
          await getCurrentTimestamp()
        );

      // Verify expenditure data
      const expenditure = await charity.getExpenditure(0);
      expect(expenditure[0]).to.equal(0); // id
      expect(expenditure[1]).to.equal(campaignId); // campaignId
      expect(expenditure[2]).to.equal(expenditureAmount); // amount
      expect(expenditure[3]).to.equal(purpose); // purpose
      expect(expenditure[4]).to.equal(campaignCreator.address); // requester
      expect(expenditure[5]).to.be.false; // isApproved
      expect(expenditure[6]).to.be.false; // isExecuted

      // Verify total expenditures
      expect(await charity.getTotalExpenditures()).to.equal(1);
    });

    it("Should reject expenditure requests from non-creators", async function () {
      await expect(
        charity.connect(otherAccount).requestExpenditure(
          campaignId,
          ethers.parseEther("10.0"),
          "Purpose"
        )
      ).to.be.revertedWith("Only campaign creator can perform this action");
    });

    it("Should reject expenditure requests exceeding campaign funds", async function () {
      const excessiveAmount = ethers.parseEther("100.0"); // More than raised (50.0)

      await expect(
        charity.connect(campaignCreator).requestExpenditure(
          campaignId,
          excessiveAmount,
          "Purpose"
        )
      ).to.be.revertedWith("Requested amount exceeds campaign funds");
    });

    it("Should reject expenditure requests with empty purpose", async function () {
      await expect(
        charity.connect(campaignCreator).requestExpenditure(
          campaignId,
          ethers.parseEther("10.0"),
          ""
        )
      ).to.be.revertedWith("Purpose cannot be empty");
    });

    it("Should reject expenditure requests with zero amount", async function () {
      await expect(
        charity.connect(campaignCreator).requestExpenditure(
          campaignId,
          0,
          "Purpose"
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should reject expenditure requests for inactive campaigns", async function () {
      // Deactivate campaign
      await charity.connect(owner).deactivateCampaign(campaignId);

      await expect(
        charity.connect(campaignCreator).requestExpenditure(
          campaignId,
          ethers.parseEther("10.0"),
          "Purpose"
        )
      ).to.be.revertedWith("Campaign is not active");
    });

    it("Should allow multiple expenditure requests from campaign creator", async function () {
      // First expenditure request
      await charity.connect(campaignCreator).requestExpenditure(
        campaignId,
        ethers.parseEther("15.0"),
        "Food supplies"
      );

      // Second expenditure request
      await charity.connect(campaignCreator).requestExpenditure(
        campaignId,
        ethers.parseEther("10.0"),
        "Medical supplies"
      );

      // Verify both expenditures exist
      const expenditures = await charity.getCampaignExpenditures(campaignId);
      expect(expenditures.length).to.equal(2);
      expect(expenditures[0].amount).to.equal(ethers.parseEther("15.0"));
      expect(expenditures[0].purpose).to.equal("Food supplies");
      expect(expenditures[1].amount).to.equal(ethers.parseEther("10.0"));
      expect(expenditures[1].purpose).to.equal("Medical supplies");
    });
  });

  describe("Campaign Management", function () {
    let campaignId;

    beforeEach(async function () {
      // Create campaign
      await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "Test Description",
        ethers.parseEther("100.0")
      );
      campaignId = 0;
    });

    it("Should allow owner to deactivate campaign", async function () {
      await charity.connect(owner).deactivateCampaign(campaignId);

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[6]).to.be.false; // isActive
    });

    it("Should allow owner to activate campaign", async function () {
      // First deactivate
      await charity.connect(owner).deactivateCampaign(campaignId);

      // Then activate
      await charity.connect(owner).activateCampaign(campaignId);

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[6]).to.be.true; // isActive
    });

    it("Should reject non-owner from managing campaigns", async function () {
      await expect(
        charity.connect(otherAccount).deactivateCampaign(campaignId)
      ).to.be.reverted;
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete campaign lifecycle", async function () {
      // 1. Create campaign
      await charity.connect(campaignCreator).createCampaign(
        "Complete Campaign",
        "End-to-end test campaign",
        ethers.parseEther("200.0")
      );
      const campaignId = 0;

      // 2. Multiple donations
      await charity.connect(donor1).donate(campaignId, {
        value: ethers.parseEther("50.0"),
      });
      await charity.connect(donor2).donate(campaignId, {
        value: ethers.parseEther("75.0"),
      });

      // 3. Request expenditures
      await charity.connect(campaignCreator).requestExpenditure(
        campaignId,
        ethers.parseEther("30.0"),
        "Emergency supplies"
      );
      await charity.connect(campaignCreator).requestExpenditure(
        campaignId,
        ethers.parseEther("40.0"),
        "Medical aid"
      );

      // 4. Verify final state
      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(ethers.parseEther("125.0")); // raised
      expect(campaign[8]).to.equal(2); // totalDonors

      const expenditures = await charity.getCampaignExpenditures(campaignId);
      expect(expenditures.length).to.equal(2);

      const donations = await charity.getCampaignDonations(campaignId);
      expect(donations.length).to.equal(2);

      const progress = await charity.getCampaignProgress(campaignId);
      expect(progress).to.equal(62); // 125/200 = 62.5% ≈ 62%
    });
  });
});

// Helper function to get current timestamp
async function getCurrentTimestamp() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block.timestamp;
}
