// scripts/simulate-donation-expenditure.js
// Simulates the full donation-expenditure cycle on Hardhat local or Sepolia

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // 1. Deploy Charity contract (or get deployed address)
  const Charity = await ethers.getContractFactory("Charity");
  let charity;
  if (hre.network.name === "hardhat") {
    charity = await Charity.deploy();
    await charity.deployed();
    console.log("Charity deployed to:", charity.address);
  } else {
    // On Sepolia, use deployed address (replace with actual address)
    charity = await Charity.attach(process.env.CHARITY_ADDRESS);
    console.log("Using Charity at:", charity.address);
  }

  const [admin, donor1, donor2] = await ethers.getSigners();

  // 2. Create campaign
  const txCreate = await charity.connect(admin).createCampaign(
    "Test Campaign",
    ethers.utils.parseEther("10"), // goal
    Math.floor(Date.now() / 1000) + 86400 // deadline: +1 day
  );
  const receiptCreate = await txCreate.wait();
  const campaignId = receiptCreate.events.find(e => e.event === "CampaignCreated").args.campaignId;
  console.log("Campaign created with ID:", campaignId.toString());

  // 3. Donate from multiple accounts
  const tx1 = await charity.connect(donor1).donate(campaignId, { value: ethers.utils.parseEther("1") });
  const tx2 = await charity.connect(donor2).donate(campaignId, { value: ethers.utils.parseEther("2") });
  await tx1.wait();
  await tx2.wait();
  console.log("Donations made by donor1 and donor2");

  // 4. Admin requests expenditure
  const txExp = await charity.connect(admin).requestExpenditure(
    campaignId,
    ethers.utils.parseEther("1.5"),
    "Medical supplies"
  );
  const receiptExp = await txExp.wait();
  console.log("Expenditure requested");

  // 5. Verify events
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
