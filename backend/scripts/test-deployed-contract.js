const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Deployed Contract on Sepolia\n");
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
    // Test 1: Get campaign count
    console.log("Test 1: Campaign Count");
    const campaignCount = await charity.campaignCount();
    console.log("✅ Campaign count:", campaignCount.toString());
    console.log("");

    // Test 2: Get contract balance
    console.log("Test 2: Contract Balance");
    const contractBalance = await charity.getContractBalance();
    console.log("✅ Contract balance:", hre.ethers.formatEther(contractBalance), "ETH");
    console.log("");

    // Test 3: Get owner
    console.log("Test 3: Contract Owner");
    const owner = await charity.owner();
    console.log("✅ Owner address:", owner);
    console.log("✅ Is signer the owner?", owner.toLowerCase() === signer.address.toLowerCase());
    console.log("");

    // Test 4: Get campaign details (if exists)
    if (campaignCount > 0) {
      console.log("Test 4: Campaign Details (Campaign #0)");
      const campaign = await charity.getCampaign(0);
      console.log("✅ ID:", campaign.id.toString());
      console.log("✅ Name:", campaign.name);
      console.log("✅ Description:", campaign.description);
      console.log("✅ Goal:", hre.ethers.formatEther(campaign.goal), "ETH");
      console.log("✅ Balance:", hre.ethers.formatEther(campaign.balance), "ETH");
      console.log("✅ Admin:", campaign.admin);
      console.log("✅ Is Active:", campaign.isActive);
      
      const deadline = new Date(Number(campaign.deadline) * 1000);
      console.log("✅ Deadline:", deadline.toLocaleString());
      
      // Get progress
      const progress = await charity.getCampaignProgress(0);
      console.log("✅ Progress:", progress.toString(), "%");
      console.log("");

      // Test 5: Check if campaign is active
      console.log("Test 5: Campaign Status");
      const isActive = await charity.isCampaignActive(0);
      console.log("✅ Is campaign active?", isActive);
      console.log("");

      // Test 6: Get campaign expenditures
      console.log("Test 6: Campaign Expenditures");
      const expenditures = await charity.getCampaignExpenditures(0);
      console.log("✅ Number of expenditures:", expenditures.length);
      console.log("");
    }

    // Test 7: Verify contract on Etherscan
    console.log("Test 7: Etherscan Links");
    console.log("✅ Contract:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("✅ Transactions:", `https://sepolia.etherscan.io/address/${contractAddress}#internaltx`);
    console.log("");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 All Tests Passed!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
