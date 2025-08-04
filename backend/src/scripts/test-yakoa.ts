import { registerToYakoa, checkYakoaTokenExists, getYakoaToken } from '../services/yakoascanner';
import { generateTimestampedId } from '../utils/idGenerator';

async function testYakoaConflictHandling() {
  console.log("🧪 Testing Yakoa conflict handling...");
  
  try {
    // Test with a sample IP asset
    const contractAddress = "0x8f0a1ac6ca4f8cb0417112069c0f4dc93b9f0217";
    const tokenId = 1117;
    const testId = generateTimestampedId(contractAddress, tokenId);
    
    console.log("📋 Test ID:", testId);
    
    // Check if it exists first
    const exists = await checkYakoaTokenExists(testId);
    console.log("🔍 Asset exists:", exists);
    
    if (!exists) {
      // Try to register (this should work for new assets)
      console.log("📝 Attempting to register new asset...");
      const result = await registerToYakoa({
        Id: testId,
        transactionHash: "0xa6aa90bc9033aebf5d3efa8be88b85377ebf8d55aa053439f0217e1ccdedd3b2" as `0x${string}`,
        blockNumber: 5177789n,
        creatorId: "0xd4a6166d966f4821ce8658807466dd0b0bb92ae9",
        metadata: {
          title: "Test IP Asset",
          description: "This is a test IP asset for conflict handling",
        },
        media: [{
          media_id: "Test IP Asset",
          url: "https://ipfs.io/ipfs/bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku"
        }],
      });
      
      console.log("✅ Registration result:", result);
    } else {
      // Try to register again (this should handle the conflict)
      console.log("🔄 Attempting to register existing asset (should handle conflict)...");
      const result = await registerToYakoa({
        Id: testId,
        transactionHash: "0xa6aa90bc9033aebf5d3efa8be88b85377ebf8d55aa053439f0217e1ccdedd3b2" as `0x${string}`,
        blockNumber: 5177789n,
        creatorId: "0xd4a6166d966f4821ce8658807466dd0b0bb92ae9",
        metadata: {
          title: "Test IP Asset (Duplicate)",
          description: "This is a duplicate registration attempt",
        },
        media: [{
          media_id: "Test IP Asset (Duplicate)",
          url: "https://ipfs.io/ipfs/bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku"
        }],
      });
      
      console.log("✅ Conflict handling result:", result);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testYakoaConflictHandling().then(() => {
  console.log("🏁 Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Test failed:", error);
  process.exit(1);
}); 