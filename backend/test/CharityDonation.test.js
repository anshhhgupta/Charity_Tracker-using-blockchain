import { expect } from "chai";
import { ethers } from "hardhat";

describe("CharityDonation", function () {
  let charityDonation;
  let owner;
  let charityWallet;
  let donor1;
  let donor2;
  let otherAccount;

  const charityName = "Test Charity";
  const charityDescription = "A test charity for humanitarian aid";
  const charityWebsite = "https://testcharity.org";

  beforeEach(async function () {
    [owner, charityWallet, donor1, donor2, otherAccount] = await ethers.getSigners();

    const CharityDonation = await ethers.getContractFactory("CharityDonation");
    charityDonation = await CharityDonation.deploy(
      charityWallet.address,
      charityName,
      charityDescription,
      charityWebsite
    );
    await charityDonation.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct charity wallet", async function () {
      expect(await charityDonation.charityWallet()).to.equal(charityWallet.address);
    });

    it("Should set the correct charity info", async function () {
      const info = await charityDonation.charityInfo();
      expect(info.name).to.equal(charityName);
      expect(info.description).to.equal(charityDescription);
      expect(info.website).to.equal(charityWebsite);
      expect(info.isActive).to.be.true;
    });

    it("Should set the owner correctly", async function () {
      expect(await charityDonation.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero values", async function () {
      const stats = await charityDonation.getStats();
      expect(stats.totalDonated).to.equal(0);
      expect(stats.totalWithdrawn).to.equal(0);
      expect(stats.currentBalance).to.equal(0);
      expect(stats.totalDonations).to.equal(0);
      expect(stats.totalWithdrawals).to.equal(0);
    });
  });

  describe("Donations", function () {
    it("Should allow donations with message and anonymity", async function () {
      const donationAmount = ethers.parseEther("1.0");
      const message = "Happy to help!";
      const isAnonymous = false;

      await expect(
        charityDonation.connect(donor1).donate(message, isAnonymous, {
          value: donationAmount,
        })
      )
        .to.emit(charityDonation, "DonationMade")
        .withArgs(donor1.address, donationAmount, message, isAnonymous, await getCurrentTimestamp());

      const stats = await charityDonation.getStats();
      expect(stats.totalDonated).to.equal(donationAmount);
      expect(stats.currentBalance).to.equal(donationAmount);
      expect(stats.totalDonations).to.equal(1);
    });

    it("Should allow anonymous donations", async function () {
      const donationAmount = ethers.parseEther("0.5");
      const message = "Anonymous donation";
      const isAnonymous = true;

      await charityDonation.connect(donor1).donate(message, isAnonymous, {
        value: donationAmount,
      });

      const donation = await charityDonation.getDonation(0);
      expect(donation.donor).to.equal(ethers.ZeroAddress);
      expect(donation.amount).to.equal(donationAmount);
      expect(donation.message).to.equal(message);
      expect(donation.isAnonymous).to.be.true;
    });

    it("Should reject zero amount donations", async function () {
      await expect(
        charityDonation.connect(donor1).donate("Test message", false, {
          value: 0,
        })
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });

    it("Should track donor donations correctly", async function () {
      const donationAmount1 = ethers.parseEther("1.0");
      const donationAmount2 = ethers.parseEther("0.5");

      await charityDonation.connect(donor1).donate("First donation", false, {
        value: donationAmount1,
      });

      await charityDonation.connect(donor1).donate("Second donation", false, {
        value: donationAmount2,
      });

      const donorDonations = await charityDonation.getDonorDonations(donor1.address);
      expect(donorDonations.length).to.equal(2);
      expect(donorDonations[0]).to.equal(0);
      expect(donorDonations[1]).to.equal(1);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Make a donation first
      const donationAmount = ethers.parseEther("2.0");
      await charityDonation.connect(donor1).donate("Test donation", false, {
        value: donationAmount,
      });
    });

    it("Should allow charity to withdraw funds", async function () {
      const withdrawalAmount = ethers.parseEther("1.0");
      const purpose = "Emergency relief fund";

      await expect(
        charityDonation.connect(charityWallet).withdraw(withdrawalAmount, purpose)
      )
        .to.emit(charityDonation, "WithdrawalMade")
        .withArgs(charityWallet.address, withdrawalAmount, purpose, await getCurrentTimestamp());

      const stats = await charityDonation.getStats();
      expect(stats.totalWithdrawn).to.equal(withdrawalAmount);
      expect(stats.currentBalance).to.equal(ethers.parseEther("1.0"));
      expect(stats.totalWithdrawals).to.equal(1);
    });

    it("Should reject withdrawals from non-charity addresses", async function () {
      const withdrawalAmount = ethers.parseEther("1.0");
      const purpose = "Emergency relief fund";

      await expect(
        charityDonation.connect(otherAccount).withdraw(withdrawalAmount, purpose)
      ).to.be.revertedWith("Only charity wallet can perform this action");
    });

    it("Should reject withdrawals exceeding balance", async function () {
      const withdrawalAmount = ethers.parseEther("5.0");
      const purpose = "Emergency relief fund";

      await expect(
        charityDonation.connect(charityWallet).withdraw(withdrawalAmount, purpose)
      ).to.be.revertedWith("Insufficient contract balance");
    });

    it("Should reject zero amount withdrawals", async function () {
      await expect(
        charityDonation.connect(charityWallet).withdraw(0, "Test purpose")
      ).to.be.revertedWith("Withdrawal amount must be greater than 0");
    });

    it("Should reject withdrawals without purpose", async function () {
      const withdrawalAmount = ethers.parseEther("1.0");

      await expect(
        charityDonation.connect(charityWallet).withdraw(withdrawalAmount, "")
      ).to.be.revertedWith("Purpose must be provided");
    });
  });

  describe("Emergency Withdrawals", function () {
    it("Should allow emergency withdrawal when threshold is met", async function () {
      // Make donation above emergency threshold
      const donationAmount = ethers.parseEther("2.0");
      await charityDonation.connect(donor1).donate("Large donation", false, {
        value: donationAmount,
      });

      const emergencyAmount = ethers.parseEther("0.5");
      await expect(
        charityDonation.connect(charityWallet).emergencyWithdraw(emergencyAmount)
      )
        .to.emit(charityDonation, "EmergencyWithdrawal")
        .withArgs(charityWallet.address, emergencyAmount, await getCurrentTimestamp());
    });

    it("Should reject emergency withdrawal when threshold not met", async function () {
      // Make small donation below emergency threshold
      const donationAmount = ethers.parseEther("0.5");
      await charityDonation.connect(donor1).donate("Small donation", false, {
        value: donationAmount,
      });

      const emergencyAmount = ethers.parseEther("0.3");
      await expect(
        charityDonation.connect(charityWallet).emergencyWithdraw(emergencyAmount)
      ).to.be.revertedWith("Emergency threshold not met");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update charity info", async function () {
      const newName = "Updated Charity Name";
      const newDescription = "Updated description";
      const newWebsite = "https://updated.org";

      await charityDonation.updateCharityInfo(
        newName,
        newDescription,
        newWebsite,
        false
      );

      const info = await charityDonation.charityInfo();
      expect(info.name).to.equal(newName);
      expect(info.description).to.equal(newDescription);
      expect(info.website).to.equal(newWebsite);
      expect(info.isActive).to.be.false;
    });

    it("Should allow owner to set emergency fund threshold", async function () {
      const newThreshold = ethers.parseEther("5.0");
      await charityDonation.setEmergencyFundThreshold(newThreshold);
      expect(await charityDonation.emergencyFundThreshold()).to.equal(newThreshold);
    });

    it("Should reject non-owner from updating charity info", async function () {
      await expect(
        charityDonation.connect(otherAccount).updateCharityInfo(
          "New Name",
          "New Description",
          "https://new.org",
          true
        )
      ).to.be.reverted;
    });
  });

  describe("Getters", function () {
    beforeEach(async function () {
      // Make multiple donations
      await charityDonation.connect(donor1).donate("First donation", false, {
        value: ethers.parseEther("1.0"),
      });
      await charityDonation.connect(donor2).donate("Second donation", true, {
        value: ethers.parseEther("0.5"),
      });
      await charityDonation.connect(donor1).donate("Third donation", false, {
        value: ethers.parseEther("0.3"),
      });
    });

    it("Should return correct recent donations", async function () {
      const recentDonations = await charityDonation.getRecentDonations(2);
      expect(recentDonations.length).to.equal(2);
      expect(recentDonations[0].amount).to.equal(ethers.parseEther("0.3"));
      expect(recentDonations[1].amount).to.equal(ethers.parseEther("0.5"));
    });

    it("Should return all donations when count exceeds total", async function () {
      const recentDonations = await charityDonation.getRecentDonations(10);
      expect(recentDonations.length).to.equal(3);
    });
  });
});

// Helper function to get current timestamp
async function getCurrentTimestamp() {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  return block.timestamp;
}
