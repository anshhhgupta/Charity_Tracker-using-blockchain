// scripts/simulate-donation-expenditure-sepolia.js
// Simulates the full donation-expenditure cycle on Sepolia
// Usage: npx hardhat run --network sepolia scripts/simulate-donation-expenditure-sepolia.js

const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

async function main() {
  // Attach to deployed Charity contract on Sepolia
  const Charity = await ethers.getContractFactory("Charity");
  const charity = await Charity.attach(process.env.CHARITY_ADDRESS);
  console.log("Using Charity at:", charity.address);

  // Use accounts from hardhat.config.js or .env
  const [admin, donor1, donor2] = await ethers.getSigners();

  // 1. Create campaign
  const txCreate = await charity.connect(admin).createCampaign(
    "Sepolia Test Campaign",
    ethers.utils.parseEther("5"),
    Math.floor(Date.now() / 1000) + 86400
  );
  const receiptCreate = await txCreate.wait();
  const campaignId = receiptCreate.events.find(e => e.event === "CampaignCreated").args.campaignId;
  console.log("Campaign created with ID:", campaignId.toString());

  // 2. Donate from multiple accounts
  const tx1 = await charity.connect(donor1).donate(campaignId, { value: ethers.utils.parseEther("0.5") });
  const tx2 = await charity.connect(donor2).donate(campaignId, { value: ethers.utils.parseEther("1") });
  await tx1.wait();
  await tx2.wait();
  console.log("Donations made by donor1 and donor2");

  // 3. Admin requests expenditure
  const txExp = await charity.connect(admin).requestExpenditure(
    campaignId,
    ethers.utils.parseEther("0.8"),
    "Sepolia medical supplies"
  );
  const receiptExp = await txExp.wait();
  console.log("Expenditure requested");

  // 4. Verify events
  const events = [
    ...receiptCreate.events,
    ...(await tx1.wait()).events,
    ...(await tx2.wait()).events,
    ...receiptExp.events
  ];
  for (const evt of events) {
    if (evt.event) {
      console.log(`Event: ${evt.event}`, evt.args);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
