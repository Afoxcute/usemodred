
// yakoaScanner.ts
import axios from "axios";
import dotenv from "dotenv";
import { sanitizeBigInts } from "../utils1/sanitizeBigInts";
dotenv.config();

const YAKOA_API_KEY = process.env.YAKOA_API_KEY!;
const SUBDOMAIN = process.env.YAKOA_SUBDOMAIN!;
const NETWORK = process.env.YAKOA_NETWORK!;
const REGISTER_TOKEN_URL = `https://${SUBDOMAIN}.ip-api-sandbox.yakoa.io/${NETWORK}/token`;

export async function registerToYakoa({
  Id,
  transactionHash,
  blockNumber,
  creatorId,
  metadata,
  media,
  brandId = null,
  brandName = null,
  emailAddress = null,
  licenseParents = [],
  authorizations = []
}: {
  Id: string;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
  creatorId: string;
  metadata: { [key: string]: string };
  media: { media_id: string; url: string }[];
  brandId?: string | null;
  brandName?: string | null;
  emailAddress?: string | null;
  licenseParents?: Array<{ parent_id: string; license_id: string }>;
  authorizations?: Array<{
    brand_id?: string | null;
    brand_name?: string | null;
    data: {
      type: 'email';
      email_address: string;
    } | null;
  }>;
}) {
  const timestamp = new Date().toISOString();
  try {
    const payload = {
      id: Id, // Keep original case for validation
      registration_tx: {
        hash: transactionHash.toLowerCase(),
        block_number: blockNumber,
        timestamp,
      },
      creator_id: creatorId.toLowerCase(), // Ensure creator_id is lowercase
      metadata,
      media,
      license_parents: licenseParents,
      token_authorizations: authorizations,
      creator_authorizations: authorizations,
    };
    console.log("🧪 Raw Payload Before Sanitization:", payload);

    let sanitizedPayload;
try {
  sanitizedPayload = sanitizeBigInts(payload);
} catch (err) {
  console.error("🔥 Error in sanitizeBigInts:", err);
  throw err;
}
    console.log("💡 Yakoa Payload:", JSON.stringify(sanitizedPayload, null, 2));

    const response = await axios.post(
      REGISTER_TOKEN_URL,
      sanitizedPayload,
      {
        headers: {
          "X-API-KEY": YAKOA_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Yakoa Registration Response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("❌ Error registering to Yakoa:", err.response?.data || err.message);
    throw err;
  }
}
export async function getYakoaToken(id: string) {
  try {
    const response = await axios.get(`${REGISTER_TOKEN_URL}/${id}`, {
      headers: {
        "X-API-KEY": YAKOA_API_KEY,
      },
    });

    console.log("✅ Yakoa Token Data:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("❌ Error fetching Yakoa token:", err.response?.data || err.message);
    throw err;
  }
}

export async function getYakoaInfringementStatus(id: string) {
  try {
    const response = await axios.get(`${REGISTER_TOKEN_URL}/${id}`, {
      headers: {
        "X-API-KEY": YAKOA_API_KEY,
      },
    });

    const tokenData = response.data;
    const infringementStatus = {
      id: tokenData.id,
      status: tokenData.infringements?.status || 'unknown',
      result: tokenData.infringements?.result || 'unknown',
      inNetworkInfringements: tokenData.infringements?.in_network_infringements || [],
      externalInfringements: tokenData.infringements?.external_infringements || [],
      credits: tokenData.infringements?.credits || {},
      lastChecked: tokenData.infringements?.last_checked || null,
      totalInfringements: (tokenData.infringements?.in_network_infringements?.length || 0) + 
                         (tokenData.infringements?.external_infringements?.length || 0)
    };

    console.log("✅ Yakoa Infringement Status:", infringementStatus);
    return infringementStatus;
  } catch (err: any) {
    console.error("❌ Error fetching Yakoa infringement status:", err.response?.data || err.message);
    throw err;
  }
}
