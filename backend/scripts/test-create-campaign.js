const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Create Campaign Function\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const contractAddress = "0x379A63482A2401a0d1b30f57921A58dEAB022aC6";
  
  // Get contract instance
  const Charity = await hre.ethers.getContractFactory("contracts/Charity-Final.sol:Charity");
  const charity = Charity.attach(contractAddress);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Testing with account:", signer.address);
  
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  try {
    // Test: Create a new campaign
    console.log("Test: Creating a new campaign...");
    
    const campaignName = "Test Campaign " + Date.now();
    const campaignDescription = "This is a test campaign to verify the create campaign function works correctly";
    const campaignGoal = hre.ethers.parseEther("5");
    const campaignDeadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now
    
    console.log("Campaign Details:");
    console.log("  Name:", campaignName);
    console.log("  Description:", campaignDescription);
    console.log("  Goal:", hre.ethers.formatEther(campaignGoal), "ETH");
    console.log("  Deadline:", new Date(campaignDeadline * 1000).toLocaleString());
    console.log("");

    console.log("⏳ Sending transaction...");
    const tx = await charity.createCampaign(
      campaignName,
      campaignDescription,
      campaignGoal,
      campaignDeadline
    );

    console.log("✅ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    console.log("✅ Transaction confirmed!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("");

    // Get the new campaign count
    const campaignCount = await charity.campaignCount();
    console.log("✅ New campaign count:", campaignCount.toString());
    
    // Get the newly created campaign details
    const newCampaignId = Number(campaignCount) - 1;
    console.log("✅ New campaign ID:", newCampaignId);
    console.log("");

    // Fetch the campaign details
    console.log("Fetching campaign details...");
    const campaign = await charity.getCampaign(newCampaignId);
    console.log("✅ Campaign Details:");
    console.log("   ID:", campaign.id.toString());
    console.log("   Name:", campaign.name);
    console.log("   Description:", campaign.description);
    console.log("   Goal:", hre.ethers.formatEther(campaign.goal), "ETH");
    console.log("   Balance:", hre.ethers.formatEther(campaign.balance), "ETH");
    console.log("   Admin:", campaign.admin);
    console.log("   Is Active:", campaign.isActive);
    console.log("   Deadline:", new Date(Number(campaign.deadline) * 1000).toLocaleString());
    console.log("");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Create Campaign Test Passed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("View on Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${tx.hash}\n`);

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
