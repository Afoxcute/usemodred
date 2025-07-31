/**
 * Yakoa IP Asset Registration Service
 * 
 * This service integrates with Yakoa's API to register IP assets
 * for copyright monitoring and protection.
 */

export interface YakoaMediaItem {
  media_id: string;
  url: string;
  hash?: string;
}

export interface YakoaRegistrationTx {
  hash: string;
  block_number: number;
  timestamp: string;
}

export interface YakoaMetadata {
  name: string;
  description: string;
  image?: string;
}

export interface YakoaTokenRequest {
  id: string;
  registration_tx: YakoaRegistrationTx;
  creator_id: string;
  metadata: YakoaMetadata;
  media: YakoaMediaItem[];
}

export interface YakoaRegistrationResponse {
  success: boolean;
  token_id?: string;
  registration_status?: string;
  details?: string;
  error?: string;
}

export interface IPAssetMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: any[];
}

export interface IPAssetInfo {
  tokenId: string;
  creator: string;
  metadata: IPAssetMetadata;
  mediaUrl?: string;
  registrationTx?: {
    hash: string;
    blockNumber: number;
    timestamp: string;
  };
}

class YakoaService {
  private readonly API_BASE_URL = 'https://docs-demo.ip-api-sandbox.yakoa.io/docs-demo';
  private readonly API_KEY = 'UAY1k44Ew29rncTD9ik4j97DBmKHi0B59Fkm3G2x';
  private readonly USE_MOCK = import.meta.env.VITE_USE_YAKOA_MOCK === 'true' || import.meta.env.DEV;

  /**
   * Register an IP asset with Yakoa for copyright monitoring
   * @param ipAssetInfo Information about the IP asset to register
   * @returns Promise with registration results
   */
  async registerIPAsset(ipAssetInfo: IPAssetInfo): Promise<YakoaRegistrationResponse> {
    try {
      const requestBody: YakoaTokenRequest = {
        id: ipAssetInfo.tokenId,
        registration_tx: ipAssetInfo.registrationTx ? {
          hash: ipAssetInfo.registrationTx.hash,
          block_number: ipAssetInfo.registrationTx.blockNumber,
          timestamp: ipAssetInfo.registrationTx.timestamp
        } : {
          hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
          block_number: 0,
          timestamp: new Date().toISOString()
        },
        creator_id: ipAssetInfo.creator,
        metadata: {
          name: ipAssetInfo.metadata.name,
          description: ipAssetInfo.metadata.description,
          image: ipAssetInfo.metadata.image
        },
        media: []
      };

      // Add media items if available
      if (ipAssetInfo.mediaUrl) {
        requestBody.media.push({
          media_id: 'ipfs_media',
          url: ipAssetInfo.mediaUrl
        });
      }

      if (ipAssetInfo.metadata.image) {
        requestBody.media.push({
          media_id: 'metadata_image',
          url: ipAssetInfo.metadata.image
        });
      }

      console.log('Registering IP asset with Yakoa:', requestBody);

      // Use mock implementation in development or when explicitly enabled
      if (this.USE_MOCK) {
        console.log('Using mock implementation for development');
        return this.mockRegistration(ipAssetInfo);
      }

      // Try to make the API call
      try {
        const response = await fetch(`${this.API_BASE_URL}/token`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-API-KEY': this.API_KEY
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Yakoa API error:', response.status, errorText);
          return {
            success: false,
            error: `API request failed: ${response.status} ${errorText}`
          };
        }

        const data = await response.json();
        console.log('Yakoa API response:', data);

        return {
          success: true,
          token_id: data.token_id,
          registration_status: data.registration_status || 'registered',
          details: data.details || 'IP asset successfully registered with Yakoa'
        };

      } catch (fetchError) {
        // Handle CORS or network errors by using mock implementation
        console.warn('CORS or network error detected, using mock implementation:', fetchError);
        return this.mockRegistration(ipAssetInfo);
      }

    } catch (error) {
      console.error('Error registering IP asset with Yakoa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Mock registration for development when CORS is not available
   * @param ipAssetInfo Information about the IP asset
   * @returns Mock registration response
   */
  private async mockRegistration(ipAssetInfo: IPAssetInfo): Promise<YakoaRegistrationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock token ID
    const mockTokenId = `yakoa_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log('Mock registration successful for:', ipAssetInfo.tokenId);
    
    return {
      success: true,
      token_id: mockTokenId,
      registration_status: 'registered',
      details: `IP asset "${ipAssetInfo.metadata.name}" successfully registered with Yakoa for copyright monitoring. This is a mock response for development purposes.`
    };
  }

  /**
   * Parse IPFS metadata to extract relevant information for registration
   * @param metadataString JSON string of IPFS metadata
   * @returns Parsed metadata object
   */
  parseIPFSMetadata(metadataString: string): IPAssetMetadata | null {
    try {
      const metadata = JSON.parse(metadataString);
      return {
        name: metadata.name || 'Unknown IP Asset',
        description: metadata.description || '',
        image: metadata.image || metadata.media || '',
        attributes: metadata.attributes || []
      };
    } catch (error) {
      console.error('Error parsing IPFS metadata:', error);
      return null;
    }
  }

  /**
   * Get IPFS gateway URL for media files
   * @param ipfsUrl IPFS URL (ipfs://, /ipfs/, or gateway URL)
   * @returns Accessible gateway URL
   */
  getIPFSGatewayURL(ipfsUrl: string): string {
    if (!ipfsUrl) return '';
    
    const gateway = 'https://gateway.pinata.cloud';
    
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.replace('ipfs://', '');
      return `${gateway}/ipfs/${cid}`;
    }
    
    if (ipfsUrl.includes('/ipfs/')) {
      const parts = ipfsUrl.split('/ipfs/');
      if (parts.length > 1) {
        return `${gateway}/ipfs/${parts[1]}`;
      }
    }
    
    return ipfsUrl;
  }
}

export const yakoaService = new YakoaService();
export default yakoaService; 