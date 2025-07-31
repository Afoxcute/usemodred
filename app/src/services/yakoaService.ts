import axios from 'axios';

// Helper function to serialize BigInt
const serializeBigInt = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (_, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
};

// Yakoa API configuration
const YAKOA_API_KEY = 'your-yakoa-api-key'; // Replace with actual API key
const YAKOA_SUBDOMAIN = 'docs-demo';
const YAKOA_NETWORK = 'docs-demo';
const YAKOA_BASE_URL = `https://${YAKOA_SUBDOMAIN}.ip-api-sandbox.yakoa.io/${YAKOA_NETWORK}/token`;

// Types for Yakoa API
export interface YakoaRegistrationTx {
  hash: string;
  block_number: number | string;
  timestamp: string;
}

export interface YakoaMediaItem {
  media_id: string;
  url: string;
}

export interface YakoaPayload {
  id: string; // IPA_ID:token_id
  registration_tx: YakoaRegistrationTx;
  creator_id: string;
  metadata: Record<string, string>;
  media: YakoaMediaItem[];
}

export interface YakoaResponse {
  id: string;
  metadata: Record<string, string>;
  media: YakoaMediaItem[];
  infringements?: {
    result: 'checked' | 'not_checked' | 'infringed';
    details?: any;
  };
  creator_id: string;
  registration_tx: YakoaRegistrationTx;
}

/**
 * Register an IP asset with Yakoa for infringement detection
 */
export const registerToYakoa = async ({
  id,
  transactionHash,
  blockNumber,
  creatorId,
  metadata,
  media
}: {
  id: string;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
  creatorId: string;
  metadata: Record<string, string>;
  media: YakoaMediaItem[];
}): Promise<YakoaResponse> => {
  const timestamp = new Date().toISOString();
  
  try {
    const payload: YakoaPayload = {
      id: id.toLowerCase(),
      registration_tx: {
        hash: transactionHash.toLowerCase(),
        block_number: blockNumber.toString(), // Convert BigInt to string
        timestamp,
      },
      creator_id: creatorId.toLowerCase(),
      metadata,
      media,
    };

    // Use serializeBigInt to ensure proper serialization
    const serializedPayload = serializeBigInt(payload);

    console.log("🧪 Yakoa Registration Payload:", JSON.stringify(serializedPayload, null, 2));

    const response = await axios.post(
      YAKOA_BASE_URL,
      serializedPayload,
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
};

/**
 * Get token details from Yakoa
 */
export const getYakoaToken = async (id: string): Promise<YakoaResponse> => {
  try {
    const response = await axios.get(`${YAKOA_BASE_URL}/${id.toLowerCase()}`, {
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
};

/**
 * Update token metadata in Yakoa
 */
export const updateYakoaToken = async (
  id: string, 
  metadata: Record<string, string>
): Promise<YakoaResponse> => {
  try {
    const response = await axios.put(
      `${YAKOA_BASE_URL}/${id.toLowerCase()}`,
      { metadata },
      {
        headers: {
          "X-API-KEY": YAKOA_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Yakoa Token Update Response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("❌ Error updating Yakoa token:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Update media for a token in Yakoa
 */
export const updateYakoaMedia = async (
  id: string,
  mediaId: string,
  mediaData: Partial<YakoaMediaItem>
): Promise<YakoaResponse> => {
  try {
    const response = await axios.put(
      `${YAKOA_BASE_URL}/${id.toLowerCase()}/media/${mediaId}`,
      mediaData,
      {
        headers: {
          "X-API-KEY": YAKOA_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Yakoa Media Update Response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("❌ Error updating Yakoa media:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Get brand authorization for a token
 */
export const getYakoaBrandAuth = async (id: string, brandId: string): Promise<any> => {
  try {
    const response = await axios.get(
      `${YAKOA_BASE_URL}/${id.toLowerCase()}/brand-auth/${brandId}`,
      {
        headers: {
          "X-API-KEY": YAKOA_API_KEY,
        },
      }
    );

    console.log("✅ Yakoa Brand Auth Response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("❌ Error fetching Yakoa brand auth:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Create or update brand authorization for a token
 */
export const setYakoaBrandAuth = async (
  id: string,
  brandId: string,
  authData: any
): Promise<any> => {
  try {
    const response = await axios.put(
      `${YAKOA_BASE_URL}/${id.toLowerCase()}/brand-auth/${brandId}`,
      authData,
      {
        headers: {
          "X-API-KEY": YAKOA_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Yakoa Brand Auth Set Response:", response.data);
    return response.data;
  } catch (err: any) {
    console.error("❌ Error setting Yakoa brand auth:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Delete brand authorization for a token
 */
export const deleteYakoaBrandAuth = async (id: string, brandId: string): Promise<void> => {
  try {
    await axios.delete(
      `${YAKOA_BASE_URL}/${id.toLowerCase()}/brand-auth/${brandId}`,
      {
        headers: {
          "X-API-KEY": YAKOA_API_KEY,
        },
      }
    );

    console.log("✅ Yakoa Brand Auth Deleted");
  } catch (err: any) {
    console.error("❌ Error deleting Yakoa brand auth:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Check infringement status for an IP asset
 */
export const checkInfringementStatus = async (id: string): Promise<YakoaResponse> => {
  try {
    const tokenData = await getYakoaToken(id);
    return tokenData;
  } catch (err: any) {
    console.error("❌ Error checking infringement status:", err);
    throw err;
  }
}; 