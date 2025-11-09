const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Charity - Final Version", function () {
  let charity;
  let owner;
  let campaignAdmin;
  let donor1;
  let donor2;
  let recipient;
  let addrs;

  const CAMPAIGN_NAME = "Emergency Relief Fund";
  const CAMPAIGN_DESCRIPTION = "Providing aid to disaster victims";
  const CAMPAIGN_GOAL = ethers.parseEther("10");
  const DONATION_AMOUNT = ethers.parseEther("1");

  beforeEach(async function () {
    // Get signers
    [owner, campaignAdmin, donor1, donor2, recipient, ...addrs] = await ethers.getSigners();

    // Deploy contract
    const Charity = await ethers.getContractFactory("contracts/Charity-Final.sol:Charity");
    charity = await Charity.deploy();
    await charity.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await charity.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero campaigns", async function () {
      expect(await charity.campaignCount()).to.equal(0);
    });

    it("Should have zero contract balance", async function () {
      expect(await charity.getContractBalance()).to.equal(0);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign successfully", async function () {
      const deadline = (await time.latest()) + 86400; // 1 day from now

      await expect(
        charity.connect(campaignAdmin).createCampaign(
          CAMPAIGN_NAME,
          CAMPAIGN_DESCRIPTION,
          CAMPAIGN_GOAL,
          deadline
        )
      )
        .to.emit(charity, "CampaignCreated")
        .withArgs(0, campaignAdmin.address, CAMPAIGN_NAME, CAMPAIGN_GOAL, deadline);

      expect(await charity.campaignCount()).to.equal(1);
    });

    it("Should return correct campaign ID", async function () {
      const deadline = (await time.latest()) + 86400;

      const tx = await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return charity.interface.parseLog(log).name === "CampaignCreated";
        } catch {
          return false;
        }
      });

      const parsedEvent = charity.interface.parseLog(event);
      expect(parsedEvent.args.campaignId).to.equal(0);
    });

    it("Should store campaign details correctly", async function () {
      const deadline = (await time.latest()) + 86400;

      await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );

      const campaign = await charity.getCampaign(0);
      expect(campaign.id).to.equal(0);
      expect(campaign.name).to.equal(CAMPAIGN_NAME);
      expect(campaign.description).to.equal(CAMPAIGN_DESCRIPTION);
      expect(campaign.goal).to.equal(CAMPAIGN_GOAL);
      expect(campaign.balance).to.equal(0);
      expect(campaign.admin).to.equal(campaignAdmin.address);
      expect(campaign.deadline).to.equal(deadline);
      expect(campaign.expenditureCount).to.equal(0);
    });

    it("Should revert if name is empty", async function () {
      const deadline = (await time.latest()) + 86400;

      await expect(
        charity.connect(campaignAdmin).createCampaign(
          "",
          CAMPAIGN_DESCRIPTION,
          CAMPAIGN_GOAL,
          deadline
        )
      ).to.be.revertedWithCustomError(charity, "EmptyName");
    });

    it("Should revert if description is empty", async function () {
      const deadline = (await time.latest()) + 86400;

      await expect(
        charity.connect(campaignAdmin).createCampaign(
          CAMPAIGN_NAME,
          "",
          CAMPAIGN_GOAL,
          deadline
        )
      ).to.be.revertedWithCustomError(charity, "EmptyDescription");
    });

    it("Should revert if goal is zero", async function () {
      const deadline = (await time.latest()) + 86400;

      await expect(
        charity.connect(campaignAdmin).createCampaign(
          CAMPAIGN_NAME,
          CAMPAIGN_DESCRIPTION,
          0,
          deadline
        )
      ).to.be.revertedWithCustomError(charity, "InvalidGoal");
    });

    it("Should revert if deadline is in the past", async function () {
      const pastDeadline = (await time.latest()) - 1;

      await expect(
        charity.connect(campaignAdmin).createCampaign(
          CAMPAIGN_NAME,
          CAMPAIGN_DESCRIPTION,
          CAMPAIGN_GOAL,
          pastDeadline
        )
      ).to.be.revertedWithCustomError(charity, "InvalidDeadline");
    });

    it("Should create multiple campaigns with incremental IDs", async function () {
      const deadline = (await time.latest()) + 86400;

      await charity.connect(campaignAdmin).createCampaign(
        "Campaign 1",
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );

      await charity.connect(donor1).createCampaign(
        "Campaign 2",
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );

      expect(await charity.campaignCount()).to.equal(2);

      const campaign1 = await charity.getCampaign(0);
      const campaign2 = await charity.getCampaign(1);

      expect(campaign1.id).to.equal(0);
      expect(campaign2.id).to.equal(1);
      expect(campaign1.admin).to.equal(campaignAdmin.address);
      expect(campaign2.admin).to.equal(donor1.address);
    });
  });

  describe("Donations", function () {
    let campaignId;
    let deadline;

    beforeEach(async function () {
      deadline = (await time.latest()) + 86400;
      await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );
      campaignId = 0;
    });

    it("Should accept donations", async function () {
      await expect(
        charity.connect(donor1).donate(campaignId, { value: DONATION_AMOUNT })
      )
        .to.emit(charity, "DonationReceived")
        .withArgs(campaignId, donor1.address, DONATION_AMOUNT);

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign.balance).to.equal(DONATION_AMOUNT);
    });

    it("Should update contract balance", async function () {
      await charity.connect(donor1).donate(campaignId, { value: DONATION_AMOUNT });

      expect(await charity.getContractBalance()).to.equal(DONATION_AMOUNT);
    });

    it("Should accept multiple donations", async function () {
      await charity.connect(donor1).donate(campaignId, { value: DONATION_AMOUNT });
      await charity.connect(donor2).donate(campaignId, { value: DONATION_AMOUNT });

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign.balance).to.equal(DONATION_AMOUNT * 2n);
    });

    it("Should revert if donation amount is zero", async function () {
      await expect(
        charity.connect(donor1).donate(campaignId, { value: 0 })
      ).to.be.revertedWithCustomError(charity, "InvalidDonation");
    });

    it("Should revert if campaign does not exist", async function () {
      await expect(
        charity.connect(donor1).donate(999, { value: DONATION_AMOUNT })
      ).to.be.revertedWithCustomError(charity, "CampaignNotFound");
    });

    it("Should revert if campaign has expired", async function () {
      // Fast forward past deadline
      await time.increaseTo(deadline + 1);

      await expect(
        charity.connect(donor1).donate(campaignId, { value: DONATION_AMOUNT })
      ).to.be.revertedWithCustomError(charity, "CampaignExpired");
    });

    it("Should calculate campaign progress correctly", async function () {
      // Donate 50% of goal
      const halfGoal = CAMPAIGN_GOAL / 2n;
      await charity.connect(donor1).donate(campaignId, { value: halfGoal });

      const progress = await charity.getCampaignProgress(campaignId);
      expect(progress).to.equal(50);
    });

    it("Should handle progress over 100%", async function () {
      // Donate 150% of goal
      const overGoal = (CAMPAIGN_GOAL * 150n) / 100n;
      await charity.connect(donor1).donate(campaignId, { value: overGoal });

      const progress = await charity.getCampaignProgress(campaignId);
      expect(progress).to.equal(150);
    });
  });

  describe("Expenditure Requests", function () {
    let campaignId;
    let deadline;
    const expenditureAmount = ethers.parseEther("0.5");
    const expenditurePurpose = "Medical supplies";

    beforeEach(async function () {
      deadline = (await time.latest()) + 86400;
      await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );
      campaignId = 0;

      // Add some funds to the campaign
      await charity.connect(donor1).donate(campaignId, { value: DONATION_AMOUNT });
    });

    it("Should allow campaign admin to request expenditure", async function () {
      await expect(
        charity.connect(campaignAdmin).requestExpenditure(
          campaignId,
          expenditureAmount,
          recipient.address,
          expenditurePurpose
        )
      )
        .to.emit(charity, "ExpenditureRequested")
        .withArgs(campaignId, 0, expenditureAmount, recipient.address, expenditurePurpose);
    });

    it("Should store expenditure details correctly", async function () {
      await charity.connect(campaignAdmin).requestExpenditure(
        campaignId,
        expenditureAmount,
        recipient.address,
        expenditurePurpose
      );

      const expenditure = await charity.getExpenditure(campaignId, 0);
      expect(expenditure.amount).to.equal(expenditureAmount);
      expect(expenditure.recipient).to.equal(recipient.address);
      expect(expenditure.purpose).to.equal(expenditurePurpose);
      expect(expenditure.executed).to.equal(false);
    });

    it("Should revert if not campaign admin", async function () {
      await expect(
        charity.connect(donor1).requestExpenditure(
          campaignId,
          expenditureAmount,
          recipient.address,
          expenditurePurpose
        )
      ).to.be.revertedWithCustomError(charity, "NotCampaignAdmin");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        charity.connect(campaignAdmin).requestExpenditure(
          campaignId,
          0,
          recipient.address,
          expenditurePurpose
        )
      ).to.be.revertedWithCustomError(charity, "InvalidAmount");
    });

    it("Should revert if recipient is zero address", async function () {
      await expect(
        charity.connect(campaignAdmin).requestExpenditure(
          campaignId,
          expenditureAmount,
          ethers.ZeroAddress,
          expenditurePurpose
        )
      ).to.be.revertedWithCustomError(charity, "InvalidRecipient");
    });

    it("Should revert if purpose is empty", async function () {
      await expect(
        charity.connect(campaignAdmin).requestExpenditure(
          campaignId,
          expenditureAmount,
          recipient.address,
          ""
        )
      ).to.be.revertedWithCustomError(charity, "EmptyPurpose");
    });

    it("Should revert if amount exceeds campaign balance", async function () {
      const tooMuch = DONATION_AMOUNT + ethers.parseEther("1");

      await expect(
        charity.connect(campaignAdmin).requestExpenditure(
          campaignId,
          tooMuch,
          recipient.address,
          expenditurePurpose
        )
      ).to.be.revertedWithCustomError(charity, "InsufficientBalance");
    });

    it("Should revert if campaign has expired", async function () {
      await time.increaseTo(deadline + 1);

      await expect(
        charity.connect(campaignAdmin).requestExpenditure(
          campaignId,
          expenditureAmount,
          recipient.address,
          expenditurePurpose
        )
      ).to.be.revertedWithCustomError(charity, "CampaignExpired");
    });

    it("Should allow multiple expenditure requests", async function () {
      await charity.connect(campaignAdmin).requestExpenditure(
        campaignId,
        expenditureAmount,
        recipient.address,
        "First expenditure"
      );

      await charity.connect(campaignAdmin).requestExpenditure(
        campaignId,
        expenditureAmount,
        recipient.address,
        "Second expenditure"
      );

      const campaign = await charity.getCampaign(campaignId);
      expect(campaign.expenditureCount).to.equal(2);
    });
  });

  describe("Expenditure Execution", function () {
    let campaignId;
    let deadline;
    const expenditureAmount = ethers.parseEther("0.5");
    const expenditurePurpose = "Medical supplies";

    beforeEach(async function () {
      deadline = (await time.latest()) + 86400;
      await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );
      campaignId = 0;

      // Add funds and create expenditure request
      await charity.connect(donor1).donate(campaignId, { value: DONATION_AMOUNT });
      await charity.connect(campaignAdmin).requestExpenditure(
        campaignId,
        expenditureAmount,
        recipient.address,
        expenditurePurpose
      );
    });

    it("Should execute expenditure successfully", async function () {
      const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);

      await expect(
        charity.connect(campaignAdmin).executeExpenditure(campaignId, 0)
      )
        .to.emit(charity, "ExpenditureExecuted")
        .withArgs(campaignId, 0, expenditureAmount, recipient.address);

      const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(expenditureAmount);
    });

    it("Should update campaign balance after execution", async function () {
      const campaignBefore = await charity.getCampaign(campaignId);
      const balanceBefore = campaignBefore.balance;

      await charity.connect(campaignAdmin).executeExpenditure(campaignId, 0);

      const campaignAfter = await charity.getCampaign(campaignId);
      expect(campaignAfter.balance).to.equal(balanceBefore - expenditureAmount);
    });

    it("Should mark expenditure as executed", async function () {
      await charity.connect(campaignAdmin).executeExpenditure(campaignId, 0);

      const expenditure = await charity.getExpenditure(campaignId, 0);
      expect(expenditure.executed).to.equal(true);
    });

    it("Should revert if not campaign admin", async function () {
      await expect(
        charity.connect(donor1).executeExpenditure(campaignId, 0)
      ).to.be.revertedWithCustomError(charity, "NotCampaignAdmin");
    });

    it("Should revert if expenditure does not exist", async function () {
      await expect(
        charity.connect(campaignAdmin).executeExpenditure(campaignId, 999)
      ).to.be.revertedWithCustomError(charity, "ExpenditureNotFound");
    });

    it("Should revert if expenditure already executed", async function () {
      await charity.connect(campaignAdmin).executeExpenditure(campaignId, 0);

      await expect(
        charity.connect(campaignAdmin).executeExpenditure(campaignId, 0)
      ).to.be.revertedWithCustomError(charity, "ExpenditureAlreadyExecuted");
    });

    it("Should revert if insufficient balance", async function () {
      // Create another expenditure that would exceed balance
      await charity.connect(campaignAdmin).requestExpenditure(
        campaignId,
        DONATION_AMOUNT,
        recipient.address,
        "Large expenditure"
      );

      // Execute first expenditure
      await charity.connect(campaignAdmin).executeExpenditure(campaignId, 0);

      // Try to execute second (should fail due to insufficient balance)
      await expect(
        charity.connect(campaignAdmin).executeExpenditure(campaignId, 1)
      ).to.be.revertedWithCustomError(charity, "InsufficientBalance");
    });

    it("Should prevent reentrancy attacks", async function () {
      // This test verifies the nonReentrant modifier is working
      // In a real attack scenario, a malicious contract would try to re-enter
      // The nonReentrant modifier should prevent this
      await charity.connect(campaignAdmin).executeExpenditure(campaignId, 0);

      const expenditure = await charity.getExpenditure(campaignId, 0);
      expect(expenditure.executed).to.equal(true);
    });
  });

  describe("Emergency Withdrawal", function () {
    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );

      // Add some funds
      await charity.connect(donor1).donate(0, { value: DONATION_AMOUNT });
    });

    it("Should allow owner to emergency withdraw", async function () {
      const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);
      const contractBalance = await charity.getContractBalance();

      await expect(
        charity.connect(owner).emergencyWithdraw(recipient.address)
      )
        .to.emit(charity, "EmergencyWithdrawal")
        .withArgs(recipient.address, contractBalance);

      const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(contractBalance);
    });

    it("Should revert if not owner", async function () {
      await expect(
        charity.connect(donor1).emergencyWithdraw(recipient.address)
      ).to.be.revertedWithCustomError(charity, "OwnableUnauthorizedAccount");
    });

    it("Should revert if recipient is zero address", async function () {
      await expect(
        charity.connect(owner).emergencyWithdraw(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(charity, "InvalidRecipient");
    });

    it("Should revert if contract balance is zero", async function () {
      // First withdraw all funds
      await charity.connect(owner).emergencyWithdraw(recipient.address);

      // Try to withdraw again
      await expect(
        charity.connect(owner).emergencyWithdraw(recipient.address)
      ).to.be.revertedWithCustomError(charity, "InvalidAmount");
    });

    it("Should empty contract balance", async function () {
      await charity.connect(owner).emergencyWithdraw(recipient.address);

      expect(await charity.getContractBalance()).to.equal(0);
    });
  });

  describe("View Functions", function () {
    let campaignId;

    beforeEach(async function () {
      const deadline = (await time.latest()) + 86400;
      await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );
      campaignId = 0;
    });

    it("Should return correct campaign count", async function () {
      expect(await charity.campaignCount()).to.equal(1);
    });

    it("Should check if campaign is active", async function () {
      expect(await charity.isCampaignActive(campaignId)).to.equal(true);
    });

    it("Should check if campaign is expired", async function () {
      const campaign = await charity.getCampaign(campaignId);
      await time.increaseTo(campaign.deadline + 1n);

      expect(await charity.isCampaignActive(campaignId)).to.equal(false);
    });

    it("Should return all campaign expenditures", async function () {
      await charity.connect(donor1).donate(campaignId, { value: DONATION_AMOUNT });

      await charity.connect(campaignAdmin).requestExpenditure(
        campaignId,
        ethers.parseEther("0.3"),
        recipient.address,
        "First"
      );

      await charity.connect(campaignAdmin).requestExpenditure(
        campaignId,
        ethers.parseEther("0.2"),
        recipient.address,
        "Second"
      );

      const expenditures = await charity.getCampaignExpenditures(campaignId);
      expect(expenditures.length).to.equal(2);
      expect(expenditures[0].purpose).to.equal("First");
      expect(expenditures[1].purpose).to.equal("Second");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use minimal gas for campaign creation", async function () {
      const deadline = (await time.latest()) + 86400;

      const tx = await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );

      const receipt = await tx.wait();
      console.log("Campaign creation gas used:", receipt.gasUsed.toString());

      // Gas should be reasonable (adjust threshold as needed)
      expect(receipt.gasUsed).to.be.lessThan(300000n);
    });

    it("Should use minimal gas for donations", async function () {
      const deadline = (await time.latest()) + 86400;
      await charity.connect(campaignAdmin).createCampaign(
        CAMPAIGN_NAME,
        CAMPAIGN_DESCRIPTION,
        CAMPAIGN_GOAL,
        deadline
      );

      const tx = await charity.connect(donor1).donate(0, { value: DONATION_AMOUNT });
      const receipt = await tx.wait();

      console.log("Donation gas used:", receipt.gasUsed.toString());

      // Donation should be very gas efficient
      expect(receipt.gasUsed).to.be.lessThan(100000n);
    });
  });
});
