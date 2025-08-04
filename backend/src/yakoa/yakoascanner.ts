// yakoaScanner.ts
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const YAKOA_API_KEY = process.env.YAKOA_API_KEY!;
const SUBDOMAIN = process.env.YAKOA_SUBDOMAIN!;
const NETWORK = process.env.YAKOA_NETWORK!;
const REGISTER_TOKEN_URL = `https://${SUBDOMAIN}.ip-api-sandbox.yakoa.io/${NETWORK}/token`;

export async function registerToYakoa() {
  const tokenId = "0x8f0a1ac6ca4f8cb0417112069c0f4dc93b9f0217:1117";
  const transactionHash = "0xa6aa90bc9033aebf5d3efa8be88b85377ebf8d55aa053439f0217e1ccdedd3b2"; // 32 char fake hash
  const creatorId = "0xd4a6166d966f4821ce8658807466dd0b0bb92ae9";
  const timestamp = new Date().toISOString(); // ISO string format

  try {
    const response = await axios.post(
      REGISTER_TOKEN_URL,
      {
        id: tokenId,
        registration_tx: {
          hash: transactionHash,
          block_number: 5177789,
          timestamp: timestamp,
        },
        creator_id: creatorId,
        metadata: {
          title: "Skeleton's gift",
          description: "This IP Asset represents ownership of the IP Asset.",
        },
        media: [
          {
            media_id: "Skeleton's gift",
            url: "https://ipfs.io/ipfs/bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku"
          }
        ]
      },
      {
        headers: {
          "X-API-KEY": YAKOA_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Yakoa Registration Response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("❌ Error registering to Yakoa:", err.response?.data || err.message);
    throw err;
  }
}