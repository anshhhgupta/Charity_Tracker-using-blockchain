import { expect } from "chai";
import { ethers } from "hardhat";

describe("Charity", function () {
  let charity;
  let owner;
  let campaignCreator;
  let donor1;
  let donor2;
  let otherAccount;

  beforeEach(async function () {
    [owner, campaignCreator, donor1, donor2, otherAccount] = await ethers.getSigners();

    const Charity = await ethers.getContractFactory("Charity");
    charity = await Charity.deploy({
      gasLimit: 5000000, // 5M gas limit
    });
    await charity.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the owner correctly", async function () {
      expect(await charity.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero counters", async function () {
      expect(await charity.getTotalCampaigns()).to.equal(0);
      expect(await charity.getTotalExpenditures()).to.equal(0);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const campaignName = "Test Campaign";
      const campaignDescription = "A test campaign for humanitarian aid";
      const goal = ethers.parseEther("10.0");

      const tx = await charity.connect(campaignCreator).createCampaign(campaignName, campaignDescription, goal);
      
      await expect(tx)
        .to.emit(charity, "CampaignCreated")
        .withArgs(0, campaignCreator.address, campaignName, goal, await getCurrentTimestamp());

      const campaign = await charity.getCampaign(0);
      expect(campaign[0]).to.equal(0); // id
      expect(campaign[1]).to.equal(campaignName); // name
      expect(campaign[2]).to.equal(campaignDescription); // description
      expect(campaign[3]).to.equal(goal); // goal
      expect(campaign[4]).to.equal(0); // raised
      expect(campaign[5]).to.equal(campaignCreator.address); // creator
      expect(campaign[6]).to.be.true; // isActive
      expect(campaign[8]).to.equal(0); // totalDonors
    });

    it("Should reject campaign creation with zero goal", async function () {
      await expect(
        charity.connect(campaignCreator).createCampaign("Test", "Description", 0)
      ).to.be.revertedWith("Goal must be greater than 0");
    });

    it("Should reject campaign creation with empty name", async function () {
      await expect(
        charity.connect(campaignCreator).createCampaign("", "Description", ethers.parseEther("10.0"))
      ).to.be.revertedWith("Campaign name cannot be empty");
    });

    it("Should reject campaign creation with empty description", async function () {
      await expect(
        charity.connect(campaignCreator).createCampaign("Test", "", ethers.parseEther("10.0"))
      ).to.be.revertedWith("Campaign description cannot be empty");
    });
  });

  describe("Donations", function () {
    let campaignId;

    beforeEach(async function () {
      const tx = await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "A test campaign",
        ethers.parseEther("10.0")
      );
      campaignId = 0;
    });

    it("Should accept donations", async function () {
      const donationAmount = ethers.parseEther("1.0");

      const tx = await charity.connect(donor1).donate(campaignId, { value: donationAmount });
      
      await expect(tx)
        .to.emit(charity, "DonationReceived")
        .withArgs(campaignId, donor1.address, donationAmount, donationAmount, await getCurrentTimestamp());

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(donationAmount); // raised
      expect(campaign[8]).to.equal(1); // totalDonors

      const donorContribution = await charity.getDonorContribution(donor1.address, campaignId);
      expect(donorContribution).to.equal(donationAmount);
    });

    it("Should track multiple donations from same donor", async function () {
      const firstDonation = ethers.parseEther("1.0");
      const secondDonation = ethers.parseEther("0.5");

      await charity.connect(donor1).donate(campaignId, { value: firstDonation });
      await charity.connect(donor1).donate(campaignId, { value: secondDonation });

      const donorContribution = await charity.getDonorContribution(donor1.address, campaignId);
      expect(donorContribution).to.equal(firstDonation + secondDonation);

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(firstDonation + secondDonation); // raised
      expect(campaign[8]).to.equal(1); // totalDonors (still 1 since same donor)
    });

    it("Should track multiple donors", async function () {
      const donation1 = ethers.parseEther("1.0");
      const donation2 = ethers.parseEther("2.0");

      await charity.connect(donor1).donate(campaignId, { value: donation1 });
      await charity.connect(donor2).donate(campaignId, { value: donation2 });

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(donation1 + donation2); // raised
      expect(campaign[8]).to.equal(2); // totalDonors

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
        charity.connect(donor1).donate(999, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Campaign does not exist");
    });

    it("Should calculate campaign progress correctly", async function () {
      const goal = ethers.parseEther("10.0");
      const donation = ethers.parseEther("3.0");

      await charity.connect(donor1).donate(campaignId, { value: donation });

      const progress = await charity.getCampaignProgress(campaignId);
      expect(progress).to.equal(30); // 30% progress
    });
  });

  describe("Expenditure Requests", function () {
    let campaignId;

    beforeEach(async function () {
      const tx = await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "A test campaign",
        ethers.parseEther("10.0")
      );
      campaignId = 0;

      // Add some funds to the campaign
      await charity.connect(donor1).donate(campaignId, { value: ethers.parseEther("5.0") });
    });

    it("Should allow campaign creator to request expenditure", async function () {
      const expenditureAmount = ethers.parseEther("2.0");
      const purpose = "Emergency relief supplies";

      const tx = await charity.connect(campaignCreator).requestExpenditure(campaignId, expenditureAmount, purpose);
      
      await expect(tx)
        .to.emit(charity, "ExpenditureRequested")
        .withArgs(0, campaignId, campaignCreator.address, expenditureAmount, purpose, await getCurrentTimestamp());

      const expenditure = await charity.getExpenditure(0);
      expect(expenditure[0]).to.equal(0); // id
      expect(expenditure[1]).to.equal(campaignId); // campaignId
      expect(expenditure[2]).to.equal(expenditureAmount); // amount
      expect(expenditure[3]).to.equal(purpose); // purpose
      expect(expenditure[4]).to.equal(campaignCreator.address); // requester
      expect(expenditure[5]).to.be.false; // isApproved
      expect(expenditure[6]).to.be.false; // isExecuted
    });

    it("Should reject expenditure request exceeding campaign funds", async function () {
      const expenditureAmount = ethers.parseEther("10.0"); // More than raised (5.0)

      await expect(
        charity.connect(campaignCreator).requestExpenditure(campaignId, expenditureAmount, "Purpose")
      ).to.be.revertedWith("Requested amount exceeds campaign funds");
    });

    it("Should reject expenditure request from non-creator", async function () {
      await expect(
        charity.connect(otherAccount).requestExpenditure(campaignId, ethers.parseEther("1.0"), "Purpose")
      ).to.be.revertedWith("Only campaign creator can perform this action");
    });

    it("Should reject expenditure request with empty purpose", async function () {
      await expect(
        charity.connect(campaignCreator).requestExpenditure(campaignId, ethers.parseEther("1.0"), "")
      ).to.be.revertedWith("Purpose cannot be empty");
    });

    it("Should reject expenditure request with zero amount", async function () {
      await expect(
        charity.connect(campaignCreator).requestExpenditure(campaignId, 0, "Purpose")
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Expenditure Approval and Execution", function () {
    let campaignId;
    let expenditureId;

    beforeEach(async function () {
      const tx = await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "A test campaign",
        ethers.parseEther("10.0")
      );
      campaignId = 0;

      // Add funds and create expenditure request
      await charity.connect(donor1).donate(campaignId, { value: ethers.parseEther("5.0") });
      await charity.connect(campaignCreator).requestExpenditure(campaignId, ethers.parseEther("2.0"), "Purpose");
      expenditureId = 0;
    });

    it("Should allow owner to approve expenditure", async function () {
      await expect(
        charity.connect(owner).approveExpenditure(expenditureId)
      )
        .to.emit(charity, "ExpenditureApproved")
        .withArgs(expenditureId, campaignId, ethers.parseEther("2.0"), owner.address);

      const expenditure = await charity.getExpenditure(expenditureId);
      expect(expenditure[5]).to.be.true; // isApproved
    });

    it("Should allow owner to execute approved expenditure", async function () {
      // First approve
      await charity.connect(owner).approveExpenditure(expenditureId);

      const initialBalance = await ethers.provider.getBalance(campaignCreator.address);

      await expect(
        charity.connect(owner).executeExpenditure(expenditureId)
      )
        .to.emit(charity, "ExpenditureExecuted")
        .withArgs(expenditureId, campaignId, ethers.parseEther("2.0"), owner.address);

      const expenditure = await charity.getExpenditure(expenditureId);
      expect(expenditure[6]).to.be.true; // isExecuted

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[4]).to.equal(ethers.parseEther("3.0")); // raised reduced by expenditure
    });

    it("Should reject expenditure execution without approval", async function () {
      await expect(
        charity.connect(owner).executeExpenditure(expenditureId)
      ).to.be.revertedWith("Expenditure not approved");
    });

    it("Should reject duplicate expenditure approval", async function () {
      await charity.connect(owner).approveExpenditure(expenditureId);

      await expect(
        charity.connect(owner).approveExpenditure(expenditureId)
      ).to.be.revertedWith("Expenditure already approved");
    });

    it("Should reject duplicate expenditure execution", async function () {
      await charity.connect(owner).approveExpenditure(expenditureId);
      await charity.connect(owner).executeExpenditure(expenditureId);

      await expect(
        charity.connect(owner).executeExpenditure(expenditureId)
      ).to.be.revertedWith("Expenditure already executed");
    });

    it("Should reject non-owner from approving expenditure", async function () {
      await expect(
        charity.connect(otherAccount).approveExpenditure(expenditureId)
      ).to.be.reverted;
    });
  });

  describe("Campaign Management", function () {
    let campaignId;

    beforeEach(async function () {
      const tx = await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "A test campaign",
        ethers.parseEther("10.0")
      );
      campaignId = 0;
    });

    it("Should allow owner to deactivate campaign", async function () {
      await charity.connect(owner).deactivateCampaign(campaignId);

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[6]).to.be.false; // isActive
    });

    it("Should allow owner to activate campaign", async function () {
      await charity.connect(owner).deactivateCampaign(campaignId);
      await charity.connect(owner).activateCampaign(campaignId);

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign[6]).to.be.true; // isActive
    });

    it("Should reject donations to inactive campaign", async function () {
      await charity.connect(owner).deactivateCampaign(campaignId);

      await expect(
        charity.connect(donor1).donate(campaignId, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Campaign is not active");
    });

    it("Should reject expenditure requests for inactive campaign", async function () {
      await charity.connect(owner).deactivateCampaign(campaignId);

      await expect(
        charity.connect(campaignCreator).requestExpenditure(campaignId, ethers.parseEther("1.0"), "Purpose")
      ).to.be.revertedWith("Campaign is not active");
    });
  });

  describe("View Functions", function () {
    it("Should return campaign donations", async function () {
      const tx = await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "A test campaign",
        ethers.parseEther("10.0")
      );
      const campaignId = 0;

      await charity.connect(donor1).donate(campaignId, { value: ethers.parseEther("1.0") });
      await charity.connect(donor2).donate(campaignId, { value: ethers.parseEther("2.0") });

      const donations = await charity.getCampaignDonations(campaignId);
      expect(donations.length).to.equal(2);
      expect(donations[0].donor).to.equal(donor1.address);
      expect(donations[0].amount).to.equal(ethers.parseEther("1.0"));
      expect(donations[1].donor).to.equal(donor2.address);
      expect(donations[1].amount).to.equal(ethers.parseEther("2.0"));
    });

    it("Should return campaign expenditures", async function () {
      const tx = await charity.connect(campaignCreator).createCampaign(
        "Test Campaign",
        "A test campaign",
        ethers.parseEther("10.0")
      );
      const campaignId = 0;

      await charity.connect(donor1).donate(campaignId, { value: ethers.parseEther("5.0") });
      await charity.connect(campaignCreator).requestExpenditure(campaignId, ethers.parseEther("1.0"), "Purpose 1");
      await charity.connect(campaignCreator).requestExpenditure(campaignId, ethers.parseEther("2.0"), "Purpose 2");

      const expenditures = await charity.getCampaignExpenditures(campaignId);
      expect(expenditures.length).to.equal(2);
      expect(expenditures[0].amount).to.equal(ethers.parseEther("1.0"));
      expect(expenditures[0].purpose).to.equal("Purpose 1");
      expect(expenditures[1].amount).to.equal(ethers.parseEther("2.0"));
      expect(expenditures[1].purpose).to.equal("Purpose 2");
    });
  });
});

// Helper function to get current timestamp
async function getCurrentTimestamp() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block.timestamp;
}
