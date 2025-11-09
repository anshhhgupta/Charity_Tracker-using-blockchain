const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Charity Contract - Comprehensive Tests", function () {
  // Test fixture for deployment
  async function deployCharityFixture() {
    const [owner, campaignAdmin, donor1, donor2, donor3, recipient, attacker] = await ethers.getSigners();
    
    const Charity = await ethers.getContractFactory("Charity");
    const charity = await Charity.deploy();
    await charity.waitForDeployment();

    return { charity, owner, campaignAdmin, donor1, donor2, donor3, recipient, attacker };
  }

  // Helper function to create a campaign
  async function createTestCampaign(charity, admin) {
    const deadline = (await time.latest()) + 86400 * 30; // 30 days
    const tx = await charity.connect(admin).createCampaign(
      "Test Campaign",
      "A test campaign for charity",
      ethers.parseEther("10"),
      deadline
    );
    await tx.wait();
    return { campaignId: 0, deadline };
  }

  describe("1. UNIT TESTS", function () {
    describe("1.1 Campaign Creation", function () {
      it("Should create a campaign with correct details", async function () {
        const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
        const deadline = (await time.latest()) + 86400;
        
        await expect(
          charity.connect(campaignAdmin).createCampaign(
            "Emergency Relief",
            "Help disaster victims",
            ethers.parseEther("5"),
            deadline
          )
        ).to.emit(charity, "CampaignCreated");

        const campaign = await charity.getCampaign(0);
        expect(campaign.name).to.equal("Emergency Relief");
        expect(campaign.description).to.equal("Help disaster victims");
        expect(campaign.goal).to.equal(ethers.parseEther("5"));
        expect(campaign.admin).to.equal(campaignAdmin.address);
      });
    });
  });
});

      it("Should increment campaign count", async function () {
        const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
        const deadline = (await time.latest()) + 86400;
        
        expect(await charity.campaignCount()).to.equal(0);
        
        await charity.connect(campaignAdmin).createCampaign(
          "Campaign 1", "Description 1", ethers.parseEther("1"), deadline
        );
        expect(await charity.campaignCount()).to.equal(1);
        
        await charity.connect(campaignAdmin).createCampaign(
          "Campaign 2", "Description 2", ethers.parseEther("2"), deadline
        );
        expect(await charity.campaignCount()).to.equal(2);
      });

      it("Should revert if name is empty", async function () {
        const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
        const deadline = (await time.latest()) + 86400;
        
        await expect(
          charity.connect(campaignAdmin).createCampaign(
            "", "Description", ethers.parseEther("1"), deadline
          )
        ).to.be.revertedWithCustomError(charity, "EmptyName");
      });

      it("Should revert if description is empty", async function () {
        const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
        const deadline = (await time.latest()) + 86400;
        
        await expect(
          charity.connect(campaignAdmin).createCampaign(
            "Name", "", ethers.parseEther("1"), deadline
          )
        ).to.be.revertedWithCustomError(charity, "EmptyDescription");
      });

      it("Should revert if goal is zero", async function () {
        const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
        const deadline = (await time.latest()) + 86400;
        
        await expect(
          charity.connect(campaignAdmin).createCampaign(
            "Name", "Description", 0, deadline
          )
        ).to.be.revertedWithCustomError(charity, "InvalidGoal");
      });

      it("Should revert if deadline is in the past", async function () {
        const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
        const pastDeadline = (await time.latest()) - 1;
        
        await expect(
          charity.connect(campaignAdmin).createCampaign(
            "Name", "Description", ethers.parseEther("1"), pastDeadline
          )
        ).to.be.revertedWithCustomError(charity, "InvalidDeadline");
      });
    });

    describe("1.2 Donations from Multiple Accounts", function () {
      it("Should accept donation from single donor", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        
        const donationAmount = ethers.parseEther("1");
        await expect(
          charity.connect(donor1).donate(0, { value: donationAmount })
        ).to.emit(charity, "DonationReceived")
          .withArgs(0, donor1.address, donationAmount);

        const campaign = await charity.getCampaign(0);
        expect(campaign.balance).to.equal(donationAmount);
      });

      it("Should accept donations from multiple donors", async function () {
        const { charity, campaignAdmin, donor1, donor2, donor3 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("1") });
        await charity.connect(donor2).donate(0, { value: ethers.parseEther("2") });
        await charity.connect(donor3).donate(0, { value: ethers.parseEther("0.5") });

        const campaign = await charity.getCampaign(0);
        expect(campaign.balance).to.equal(ethers.parseEther("3.5"));
      });

      it("Should update contract balance correctly", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        
        const initialBalance = await charity.getContractBalance();
        const donationAmount = ethers.parseEther("1");
        
        await charity.connect(donor1).donate(0, { value: donationAmount });
        
        const finalBalance = await charity.getContractBalance();
        expect(finalBalance - initialBalance).to.equal(donationAmount);
      });

      it("Should revert if donation amount is zero", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        
        await expect(
          charity.connect(donor1).donate(0, { value: 0 })
        ).to.be.revertedWithCustomError(charity, "InvalidDonation");
      });

      it("Should revert if campaign does not exist", async function () {
        const { charity, donor1 } = await loadFixture(deployCharityFixture);
        
        await expect(
          charity.connect(donor1).donate(999, { value: ethers.parseEther("1") })
        ).to.be.revertedWithCustomError(charity, "CampaignNotFound");
      });

      it("Should revert if campaign has expired", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        const { deadline } = await createTestCampaign(charity, campaignAdmin);
        
        await time.increaseTo(deadline + 1);
        
        await expect(
          charity.connect(donor1).donate(0, { value: ethers.parseEther("1") })
        ).to.be.revertedWithCustomError(charity, "CampaignExpired");
      });
    });

    describe("1.3 Request and Execute Expenditure", function () {
      it("Should allow campaign admin to request expenditure", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        const expenditureAmount = ethers.parseEther("1");
        await expect(
          charity.connect(campaignAdmin).requestExpenditure(
            0, expenditureAmount, recipient.address, "Medical supplies"
          )
        ).to.emit(charity, "ExpenditureRequested")
          .withArgs(0, 0, expenditureAmount, recipient.address, "Medical supplies");
      });

      it("Should execute expenditure and transfer funds", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        const expenditureAmount = ethers.parseEther("1");
        await charity.connect(campaignAdmin).requestExpenditure(
          0, expenditureAmount, recipient.address, "Medical supplies"
        );
        
        const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);
        
        await expect(
          charity.connect(campaignAdmin).executeExpenditure(0, 0)
        ).to.emit(charity, "ExpenditureExecuted")
          .withArgs(0, 0, expenditureAmount, recipient.address);
        
        const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
        expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(expenditureAmount);
      });

      it("Should update campaign balance after execution", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        const expenditureAmount = ethers.parseEther("1");
        await charity.connect(campaignAdmin).requestExpenditure(
          0, expenditureAmount, recipient.address, "Medical supplies"
        );
        
        const campaignBefore = await charity.getCampaign(0);
        await charity.connect(campaignAdmin).executeExpenditure(0, 0);
        const campaignAfter = await charity.getCampaign(0);
        
        expect(campaignBefore.balance - campaignAfter.balance).to.equal(expenditureAmount);
      });

      it("Should mark expenditure as executed", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await charity.connect(campaignAdmin).requestExpenditure(
          0, ethers.parseEther("1"), recipient.address, "Medical supplies"
        );
        
        await charity.connect(campaignAdmin).executeExpenditure(0, 0);
        
        const expenditure = await charity.getExpenditure(0, 0);
        expect(expenditure.executed).to.be.true;
      });

      it("Should revert if expenditure already executed", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await charity.connect(campaignAdmin).requestExpenditure(
          0, ethers.parseEther("1"), recipient.address, "Medical supplies"
        );
        await charity.connect(campaignAdmin).executeExpenditure(0, 0);
        
        await expect(
          charity.connect(campaignAdmin).executeExpenditure(0, 0)
        ).to.be.revertedWithCustomError(charity, "ExpenditureAlreadyExecuted");
      });
    });

    describe("1.4 Emergency Withdrawal (Owner Only)", function () {
      it("Should allow owner to emergency withdraw", async function () {
        const { charity, owner, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        const contractBalance = await charity.getContractBalance();
        const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
        
        const tx = await charity.connect(owner).emergencyWithdraw(owner.address);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        
        const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
        expect(ownerBalanceAfter - ownerBalanceBefore + gasUsed).to.equal(contractBalance);
      });

      it("Should emit EmergencyWithdrawal event", async function () {
        const { charity, owner, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        const contractBalance = await charity.getContractBalance();
        
        await expect(
          charity.connect(owner).emergencyWithdraw(owner.address)
        ).to.emit(charity, "EmergencyWithdrawal")
          .withArgs(owner.address, contractBalance);
      });

      it("Should revert if not owner", async function () {
        const { charity, campaignAdmin, donor1, attacker } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await expect(
          charity.connect(attacker).emergencyWithdraw(attacker.address)
        ).to.be.revertedWithCustomError(charity, "OwnableUnauthorizedAccount");
      });

      it("Should revert if recipient is zero address", async function () {
        const { charity, owner, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await expect(
          charity.connect(owner).emergencyWithdraw(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(charity, "InvalidRecipient");
      });

      it("Should revert if contract balance is zero", async function () {
        const { charity, owner } = await loadFixture(deployCharityFixture);
        
        await expect(
          charity.connect(owner).emergencyWithdraw(owner.address)
        ).to.be.revertedWithCustomError(charity, "InvalidAmount");
      });
    });
  });

  describe("2. INTEGRATION TESTS", function () {
    describe("2.1 Full Campaign Lifecycle", function () {
      it("Should complete full flow: create → donate → request → execute", async function () {
        const { charity, campaignAdmin, donor1, donor2, recipient } = await loadFixture(deployCharityFixture);
        
        // Step 1: Create campaign
        const deadline = (await time.latest()) + 86400 * 30;
        await charity.connect(campaignAdmin).createCampaign(
          "Full Flow Campaign",
          "Testing complete lifecycle",
          ethers.parseEther("10"),
          deadline
        );
        
        let campaign = await charity.getCampaign(0);
        expect(campaign.name).to.equal("Full Flow Campaign");
        expect(campaign.balance).to.equal(0);
        
        // Step 2: Multiple donations
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("3") });
        await charity.connect(donor2).donate(0, { value: ethers.parseEther("2") });
        
        campaign = await charity.getCampaign(0);
        expect(campaign.balance).to.equal(ethers.parseEther("5"));
        
        // Step 3: Request expenditure
        await charity.connect(campaignAdmin).requestExpenditure(
          0,
          ethers.parseEther("1.5"),
          recipient.address,
          "Emergency supplies"
        );
        
        let expenditure = await charity.getExpenditure(0, 0);
        expect(expenditure.executed).to.be.false;
        expect(expenditure.amount).to.equal(ethers.parseEther("1.5"));
        
        // Step 4: Execute expenditure
        const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);
        await charity.connect(campaignAdmin).executeExpenditure(0, 0);
        const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
        
        expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(ethers.parseEther("1.5"));
        
        expenditure = await charity.getExpenditure(0, 0);
        expect(expenditure.executed).to.be.true;
        
        campaign = await charity.getCampaign(0);
        expect(campaign.balance).to.equal(ethers.parseEther("3.5"));
      });

      it("Should handle multiple expenditures in sequence", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        
        // Donate
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("10") });
        
        // Request and execute multiple expenditures
        await charity.connect(campaignAdmin).requestExpenditure(
          0, ethers.parseEther("2"), recipient.address, "First expenditure"
        );
        await charity.connect(campaignAdmin).executeExpenditure(0, 0);
        
        await charity.connect(campaignAdmin).requestExpenditure(
          0, ethers.parseEther("3"), recipient.address, "Second expenditure"
        );
        await charity.connect(campaignAdmin).executeExpenditure(0, 1);
        
        const campaign = await charity.getCampaign(0);
        expect(campaign.balance).to.equal(ethers.parseEther("5"));
        expect(campaign.expenditureCount).to.equal(2);
      });

      it("Should track campaign progress correctly", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        
        // Initial progress should be 0
        let progress = await charity.getCampaignProgress(0);
        expect(progress).to.equal(0);
        
        // Donate 50% of goal
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        progress = await charity.getCampaignProgress(0);
        expect(progress).to.equal(50);
        
        // Donate another 30%
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("3") });
        progress = await charity.getCampaignProgress(0);
        expect(progress).to.equal(80);
      });
    });
  });

  describe("3. NEGATIVE TESTS", function () {
    describe("3.1 Non-Admin Attempting Operations", function () {
      it("Should revert if non-admin tries to request expenditure", async function () {
        const { charity, campaignAdmin, donor1, attacker, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await expect(
          charity.connect(attacker).requestExpenditure(
            0, ethers.parseEther("1"), recipient.address, "Unauthorized"
          )
        ).to.be.revertedWithCustomError(charity, "NotCampaignAdmin");
      });

      it("Should revert if non-admin tries to execute expenditure", async function () {
        const { charity, campaignAdmin, donor1, attacker, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await charity.connect(campaignAdmin).requestExpenditure(
          0, ethers.parseEther("1"), recipient.address, "Medical supplies"
        );
        
        await expect(
          charity.connect(attacker).executeExpenditure(0, 0)
        ).to.be.revertedWithCustomError(charity, "NotCampaignAdmin");
      });

      it("Should allow only campaign admin to manage their campaign", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        const deadline = (await time.latest()) + 86400;
        
        // Create two campaigns by different admins
        await charity.connect(campaignAdmin).createCampaign(
          "Campaign 1", "Description 1", ethers.parseEther("5"), deadline
        );
        await charity.connect(donor1).createCampaign(
          "Campaign 2", "Description 2", ethers.parseEther("5"), deadline
        );
        
        // Donate to both
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("2") });
        await charity.connect(campaignAdmin).donate(1, { value: ethers.parseEther("2") });
        
        // campaignAdmin should not be able to manage campaign 1 (created by donor1)
        await expect(
          charity.connect(campaignAdmin).requestExpenditure(
            1, ethers.parseEther("1"), donor1.address, "Unauthorized"
          )
        ).to.be.revertedWithCustomError(charity, "NotCampaignAdmin");
      });
    });

    describe("3.2 Insufficient Balance Scenarios", function () {
      it("Should revert if expenditure amount exceeds campaign balance", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("2") });
        
        await expect(
          charity.connect(campaignAdmin).requestExpenditure(
            0, ethers.parseEther("5"), recipient.address, "Too much"
          )
        ).to.be.revertedWithCustomError(charity, "InsufficientBalance");
      });

      it("Should revert execution if balance decreased after request", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        // Request two expenditures
        await charity.connect(campaignAdmin).requestExpenditure(
          0, ethers.parseEther("3"), recipient.address, "First"
        );
        await charity.connect(campaignAdmin).requestExpenditure(
          0, ethers.parseEther("3"), recipient.address, "Second"
        );
        
        // Execute first (balance becomes 2 ETH)
        await charity.connect(campaignAdmin).executeExpenditure(0, 0);
        
        // Second should fail (needs 3 ETH but only 2 available)
        await expect(
          charity.connect(campaignAdmin).executeExpenditure(0, 1)
        ).to.be.revertedWithCustomError(charity, "InsufficientBalance");
      });

      it("Should handle zero balance campaign correctly", async function () {
        const { charity, campaignAdmin, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        
        await expect(
          charity.connect(campaignAdmin).requestExpenditure(
            0, ethers.parseEther("1"), recipient.address, "No funds"
          )
        ).to.be.revertedWithCustomError(charity, "InsufficientBalance");
      });
    });

    describe("3.3 Invalid Input Tests", function () {
      it("Should revert if expenditure amount is zero", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await expect(
          charity.connect(campaignAdmin).requestExpenditure(
            0, 0, recipient.address, "Zero amount"
          )
        ).to.be.revertedWithCustomError(charity, "InvalidAmount");
      });

      it("Should revert if recipient is zero address", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await expect(
          charity.connect(campaignAdmin).requestExpenditure(
            0, ethers.parseEther("1"), ethers.ZeroAddress, "Invalid recipient"
          )
        ).to.be.revertedWithCustomError(charity, "InvalidRecipient");
      });

      it("Should revert if purpose is empty", async function () {
        const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await expect(
          charity.connect(campaignAdmin).requestExpenditure(
            0, ethers.parseEther("1"), recipient.address, ""
          )
        ).to.be.revertedWithCustomError(charity, "EmptyPurpose");
      });

      it("Should revert if expenditure does not exist", async function () {
        const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
        await createTestCampaign(charity, campaignAdmin);
        await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
        
        await expect(
          charity.connect(campaignAdmin).executeExpenditure(0, 999)
        ).to.be.revertedWithCustomError(charity, "ExpenditureNotFound");
      });
    });
  });

  describe("4. REENTRANCY PROTECTION TESTS", function () {
    it("Should prevent reentrancy on executeExpenditure", async function () {
      const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("10") });
      
      // Deploy malicious contract that attempts reentrancy
      const MaliciousReceiver = await ethers.getContractFactory("MaliciousReceiver");
      const malicious = await MaliciousReceiver.deploy(await charity.getAddress());
      
      // Request expenditure to malicious contract
      await charity.connect(campaignAdmin).requestExpenditure(
        0,
        ethers.parseEther("5"),
        await malicious.getAddress(),
        "Malicious expenditure"
      );
      
      // Attempt to execute - should fail due to reentrancy guard
      await expect(
        charity.connect(campaignAdmin).executeExpenditure(0, 0)
      ).to.be.reverted; // Will revert due to reentrancy attempt
    });

    it("Should prevent reentrancy on emergencyWithdraw", async function () {
      const { charity, owner, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("10") });
      
      // Deploy malicious contract
      const MaliciousReceiver = await ethers.getContractFactory("MaliciousReceiver");
      const malicious = await MaliciousReceiver.deploy(await charity.getAddress());
      
      // Attempt emergency withdraw to malicious contract
      await expect(
        charity.connect(owner).emergencyWithdraw(await malicious.getAddress())
      ).to.be.reverted; // Will revert due to reentrancy attempt
    });

    it("Should allow sequential expenditure executions (not reentrancy)", async function () {
      const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("10") });
      
      // Create multiple expenditures
      await charity.connect(campaignAdmin).requestExpenditure(
        0, ethers.parseEther("2"), recipient.address, "First"
      );
      await charity.connect(campaignAdmin).requestExpenditure(
        0, ethers.parseEther("2"), recipient.address, "Second"
      );
      
      // Execute them sequentially (should work fine)
      await charity.connect(campaignAdmin).executeExpenditure(0, 0);
      await charity.connect(campaignAdmin).executeExpenditure(0, 1);
      
      const campaign = await charity.getCampaign(0);
      expect(campaign.balance).to.equal(ethers.parseEther("6"));
    });
  });

  describe("5. VIEW FUNCTIONS TESTS", function () {
    it("Should return correct campaign details", async function () {
      const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
      const deadline = (await time.latest()) + 86400;
      
      await charity.connect(campaignAdmin).createCampaign(
        "View Test", "Testing view functions", ethers.parseEther("5"), deadline
      );
      
      const campaign = await charity.getCampaign(0);
      expect(campaign.id).to.equal(0);
      expect(campaign.name).to.equal("View Test");
      expect(campaign.description).to.equal("Testing view functions");
      expect(campaign.goal).to.equal(ethers.parseEther("5"));
      expect(campaign.balance).to.equal(0);
      expect(campaign.admin).to.equal(campaignAdmin.address);
      expect(campaign.deadline).to.equal(deadline);
      expect(campaign.expenditureCount).to.equal(0);
    });

    it("Should return correct expenditure details", async function () {
      const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
      
      await charity.connect(campaignAdmin).requestExpenditure(
        0, ethers.parseEther("2"), recipient.address, "Test expenditure"
      );
      
      const expenditure = await charity.getExpenditure(0, 0);
      expect(expenditure.amount).to.equal(ethers.parseEther("2"));
      expect(expenditure.recipient).to.equal(recipient.address);
      expect(expenditure.purpose).to.equal("Test expenditure");
      expect(expenditure.executed).to.be.false;
    });

    it("Should return all campaign expenditures", async function () {
      const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("10") });
      
      await charity.connect(campaignAdmin).requestExpenditure(
        0, ethers.parseEther("1"), recipient.address, "First"
      );
      await charity.connect(campaignAdmin).requestExpenditure(
        0, ethers.parseEther("2"), recipient.address, "Second"
      );
      await charity.connect(campaignAdmin).requestExpenditure(
        0, ethers.parseEther("3"), recipient.address, "Third"
      );
      
      const expenditures = await charity.getCampaignExpenditures(0);
      expect(expenditures.length).to.equal(3);
      expect(expenditures[0].purpose).to.equal("First");
      expect(expenditures[1].purpose).to.equal("Second");
      expect(expenditures[2].purpose).to.equal("Third");
    });

    it("Should check if campaign is active", async function () {
      const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
      const deadline = (await time.latest()) + 86400;
      
      await charity.connect(campaignAdmin).createCampaign(
        "Active Test", "Testing active status", ethers.parseEther("5"), deadline
      );
      
      expect(await charity.isCampaignActive(0)).to.be.true;
      
      await time.increaseTo(deadline + 1);
      
      expect(await charity.isCampaignActive(0)).to.be.false;
    });

    it("Should calculate campaign progress correctly", async function () {
      const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      
      expect(await charity.getCampaignProgress(0)).to.equal(0);
      
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("2.5") });
      expect(await charity.getCampaignProgress(0)).to.equal(25);
      
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("7.5") });
      expect(await charity.getCampaignProgress(0)).to.equal(100);
      
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
      expect(await charity.getCampaignProgress(0)).to.equal(150);
    });

    it("Should return correct contract balance", async function () {
      const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      
      expect(await charity.getContractBalance()).to.equal(0);
      
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("3") });
      expect(await charity.getContractBalance()).to.equal(ethers.parseEther("3"));
    });
  });

  describe("6. GAS OPTIMIZATION TESTS", function () {
    it("Should use minimal gas for campaign creation", async function () {
      const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
      const deadline = (await time.latest()) + 86400;
      
      const tx = await charity.connect(campaignAdmin).createCampaign(
        "Gas Test", "Testing gas usage", ethers.parseEther("5"), deadline
      );
      const receipt = await tx.wait();
      
      console.log("Campaign creation gas used:", receipt.gasUsed.toString());
      expect(receipt.gasUsed).to.be.lessThan(300000n);
    });

    it("Should use minimal gas for donations", async function () {
      const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      
      const tx = await charity.connect(donor1).donate(0, { value: ethers.parseEther("1") });
      const receipt = await tx.wait();
      
      console.log("Donation gas used:", receipt.gasUsed.toString());
      expect(receipt.gasUsed).to.be.lessThan(100000n);
    });

    it("Should use minimal gas for expenditure execution", async function () {
      const { charity, campaignAdmin, donor1, recipient } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      await charity.connect(donor1).donate(0, { value: ethers.parseEther("5") });
      
      await charity.connect(campaignAdmin).requestExpenditure(
        0, ethers.parseEther("1"), recipient.address, "Gas test"
      );
      
      const tx = await charity.connect(campaignAdmin).executeExpenditure(0, 0);
      const receipt = await tx.wait();
      
      console.log("Expenditure execution gas used:", receipt.gasUsed.toString());
      expect(receipt.gasUsed).to.be.lessThan(100000n);
    });
  });

  describe("7. EDGE CASES", function () {
    it("Should handle very small donations", async function () {
      const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      
      await charity.connect(donor1).donate(0, { value: 1 }); // 1 wei
      
      const campaign = await charity.getCampaign(0);
      expect(campaign.balance).to.equal(1);
    });

    it("Should handle very large donations", async function () {
      const { charity, campaignAdmin, donor1 } = await loadFixture(deployCharityFixture);
      await createTestCampaign(charity, campaignAdmin);
      
      const largeAmount = ethers.parseEther("1000");
      await charity.connect(donor1).donate(0, { value: largeAmount });
      
      const campaign = await charity.getCampaign(0);
      expect(campaign.balance).to.equal(largeAmount);
    });

    it("Should handle campaign with very long deadline", async function () {
      const { charity, campaignAdmin } = await loadFixture(deployCharityFixture);
      const farFutureDeadline = (await time.latest()) + (86400 * 365 * 10); // 10 years
      
      await charity.connect(campaignAdmin).createCampaign(
        "Long Campaign", "Very long deadline", ethers.parseEther("5"), farFutureDeadline
      );
      
      expect(await charity.isCampaignActive(0)).to.be.true;
    });

    it("Should handle multiple campaigns simultaneously", async function () {
      const { charity, campaignAdmin, donor1, donor2 } = await loadFixture(deployCharityFixture);
      const deadline = (await time.latest()) + 86400;
      
      // Create 5 campaigns
      for (let i = 0; i < 5; i++) {
        await charity.connect(campaignAdmin).createCampaign(
          `Campaign ${i}`, `Description ${i}`, ethers.parseEther("5"), deadline
        );
      }
      
      // Donate to all campaigns
      for (let i = 0; i < 5; i++) {
        await charity.connect(donor1).donate(i, { value: ethers.parseEther("1") });
        await charity.connect(donor2).donate(i, { value: ethers.parseEther("2") });
      }
      
      // Verify all campaigns received donations
      for (let i = 0; i < 5; i++) {
        const campaign = await charity.getCampaign(i);
        expect(campaign.balance).to.equal(ethers.parseEther("3"));
      }
    });
  });
});

// Malicious contract for reentrancy testing
// Note: This contract should be created separately for actual testing
// This is a placeholder to show the test structure
