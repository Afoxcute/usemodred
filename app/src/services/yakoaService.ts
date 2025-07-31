/**
 * Yakoa IP Infringement Detection Service
 * 
 * This service integrates with Yakoa's API to detect potential copyright violations
 * for registered IP assets by analyzing their metadata and media content.
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

export interface YakoaTokenResponse {
  success: boolean;
  token_id?: string;
  infringement_detected?: boolean;
  confidence_score?: number;
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

  /**
   * Check for IP infringement using Yakoa's API
   * @param ipAssetInfo Information about the IP asset to check
   * @returns Promise with infringement detection results
   */
  async checkInfringement(ipAssetInfo: IPAssetInfo): Promise<YakoaTokenResponse> {
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

      console.log('Sending infringement check request to Yakoa:', requestBody);

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
        infringement_detected: data.infringement_detected || false,
        confidence_score: data.confidence_score || 0,
        details: data.details || 'No infringement detected'
      };

    } catch (error) {
      console.error('Error checking infringement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Parse IPFS metadata to extract relevant information for infringement checking
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