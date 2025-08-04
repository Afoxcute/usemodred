import { useEffect, useState } from "react";
import "./App.css";

import {
  defineChain,
  getContract,
  prepareContractCall,
  readContract,
  sendTransaction,
  ThirdwebClient,
  waitForReceipt,
} from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { parseEther, formatEther } from "viem";
import { etherlinkTestnet } from "viem/chains";
import CONTRACT_ADDRESS_JSON from "./deployed_addresses.json";

// Backend API configuration
const BACKEND_URL = "https://usemodred-production.up.railway.app";

// File validation and preview utilities
const MAX_FILE_SIZE_MB = 50; // Maximum file size in megabytes
const ALLOWED_FILE_TYPES = [
  'application/pdf',     // PDF
  'application/msword',  // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'text/plain',          // TXT
  'image/jpeg',          // JPG/JPEG
  'image/png',           // PNG
  'image/gif',           // GIF
  'audio/mpeg',          // MP3
  'audio/wav',           // WAV
  'video/mp4'            // MP4
];

// File validation function
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false, 
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false, 
      error: 'Unsupported file type'
    };
  }

  return { valid: true };
};

// File preview generator
const generateFilePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    } 
    // Preview for PDFs (basic)
    else if (file.type === 'application/pdf') {
      resolve('📄 PDF Document');
    }
    // Preview for text files
    else if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsText(file);
    }
    // Preview for other file types
    else {
      resolve(null);
    }
  });
};

// Remove hardcoded Pinata credentials
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5MjJjNmZkOC04ZTZhLTQxMzUtODA4ZS05ZTkwZTMyMjViNTIiLCJlbWFpbCI6Imp3YXZvbGFiaWxvdmUwMDE2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJkZDI1MzM4YmRmYTdjNzlmYjY4NyIsInNjb3BlZEtleVNlY3JldCI6ImFiYTJjMzcwNWExMzNlZmVjNzM3NzQwZGNjMGJjOTE4MGY2M2IzZjkxY2E5MzVlYWE3NzUxMDhjOGNkYjMyZDciLCJleHAiOjE3ODU3NDg3ODh9.I6RIrBphVycV-75XK_pippeZngj6QntUZZjFMnGtqFA";

/**
 * Uploads a file to IPFS via Pinata
 * @param file The file to upload
 * @returns Object with success status, CID and message
 */
const pinFileToIPFS = async (file: File): Promise<{
  success: boolean;
  cid?: string;
  message?: string;
}> => {
  try {
    // Validate JWT is present
    if (!PINATA_JWT) {
      throw new Error('Pinata JWT is not configured. Please set VITE_PINATA_JWT in your environment.');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = {
      name: file.name,
      description: `Uploaded via ModredIP frontend`,
      attributes: {
        uploadedBy: 'ModredIP',
        timestamp: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Make request to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Pinata upload successful:', result);

    return {
      success: true,
      cid: result.IpfsHash,
      message: 'File uploaded successfully to IPFS'
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Converts an IPFS URL to a gateway URL for better compatibility
 * @param url IPFS URL (ipfs://, /ipfs/, or already a gateway URL)
 * @returns Gateway URL
 */
const getIPFSGatewayURL = (url: string): string => {
  if (!url) return '';

  // Use preferred gateway
  const gateway = 'https://gateway.pinata.cloud';

  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return `${gateway}/ipfs/${cid}`;
  }

  // Handle /ipfs/ path
  if (url.includes('/ipfs/')) {
    const parts = url.split('/ipfs/');
    if (parts.length > 1) {
      return `${gateway}/ipfs/${parts[1]}`;
    }
  }

  // If it's already a gateway URL or something else, return as is
  return url;
};

// Parse metadata to extract name and description
const parseMetadata = async (metadataUri: string) => {
  try {
    // If metadata is a direct JSON string, parse it
    if (metadataUri.startsWith('{')) {
      return JSON.parse(metadataUri);
    }
    
    // If it's an IPFS URI, fetch it
    if (metadataUri.startsWith('ipfs://')) {
      const gatewayUrl = getIPFSGatewayURL(metadataUri);
      const response = await fetch(gatewayUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      return metadata;
    }
    
    // If it's already a gateway URL, fetch it
    if (metadataUri.includes('gateway.pinata.cloud')) {
      const response = await fetch(metadataUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      return metadata;
    }
    
    // Default fallback
    return {
      name: "Unknown",
      description: "No description available"
    };
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return {
      name: "Unknown",
      description: "No description available"
    };
  }
};

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email", "passkey", "phone"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
  createWallet("com.trustwallet.app"),
  createWallet("global.safe"),
];

// ModredIP Contract ABI (simplified for the functions we need)
const MODRED_IP_ABI = [
  {
    inputs: [
      { name: "tokenId", type: "uint256" }
    ],
    name: "getIPAsset",
    outputs: [
      { name: "owner", type: "address" },
      { name: "ipHash", type: "string" },
      { name: "metadata", type: "string" },
      { name: "isEncrypted", type: "bool" },
      { name: "isDisputed", type: "bool" },
      { name: "registrationDate", type: "uint256" },
      { name: "totalRevenue", type: "uint256" },
      { name: "royaltyTokens", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "licenseId", type: "uint256" }
    ],
    name: "getLicense",
    outputs: [
      { name: "licensee", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "royaltyPercentage", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "startDate", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "commercialUse", type: "bool" },
      { name: "terms", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "nextTokenId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "nextLicenseId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "ipHash", type: "string" },
      { name: "metadata", type: "string" },
      { name: "isEncrypted", type: "bool" }
    ],
    name: "registerIP",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "royaltyPercentage", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "commercialUse", type: "bool" },
      { name: "terms", type: "string" }
    ],
    name: "mintLicense",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" }
    ],
    name: "payRevenue",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" }
    ],
    name: "claimRoyalties",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

interface IPAsset {
  owner: string;
  ipHash: string;
  metadata: string;
  isEncrypted: boolean;
  isDisputed: boolean;
  registrationDate: bigint;
  totalRevenue: bigint;
  royaltyTokens: bigint;
}

interface License {
  licensee: string;
  tokenId: bigint;
  royaltyPercentage: bigint;
  duration: bigint;
  startDate: bigint;
  isActive: boolean;
  commercialUse: boolean;
  terms: string;
}

interface AppProps {
  thirdwebClient: ThirdwebClient;
}

export default function App({ thirdwebClient }: AppProps) {
  const account = useActiveAccount();

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<boolean>(false);
  
  // IP Assets state
  const [ipAssets, setIpAssets] = useState<Map<number, IPAsset>>(new Map());
  
  // Licenses state
  const [licenses, setLicenses] = useState<Map<number, License>>(new Map());
  
  // Parsed metadata state
  const [parsedMetadata, setParsedMetadata] = useState<Map<number, any>>(new Map());
  
  // Form states
  const [ipFile, setIpFile] = useState<File | null>(null);
  const [ipHash, setIpHash] = useState<string>("");
  const [ipName, setIpName] = useState<string>("");
  const [ipDescription, setIpDescription] = useState<string>("");
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  
  const [selectedTokenId, setSelectedTokenId] = useState<number>(1);
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(10);
  const [licenseDuration, setLicenseDuration] = useState<number>(86400);
  // License parameters
  const [commercialUse, setCommercialUse] = useState<boolean>(true);
  const [commercialAttribution, setCommercialAttribution] = useState<boolean>(true);
  const [commercializerChecker, setCommercializerChecker] = useState<string>("0x0000000000000000000000000000000000000000");
  const [commercializerCheckerData, setCommercializerCheckerData] = useState<string>("0000000000000000000000000000000000000000");
  const [commercialRevShare, setCommercialRevShare] = useState<number>(100000000);
  const [commercialRevCeiling, setCommercialRevCeiling] = useState<number>(0);
  const [derivativesAllowed, setDerivativesAllowed] = useState<boolean>(true);
  const [derivativesAttribution, setDerivativesAttribution] = useState<boolean>(true);
  const [derivativesApproval, setDerivativesApproval] = useState<boolean>(false);
  const [derivativesReciprocal, setDerivativesReciprocal] = useState<boolean>(true);
  const [derivativeRevCeiling, setDerivativeRevCeiling] = useState<number>(0);
  const [licenseCurrency, setLicenseCurrency] = useState<string>("0x15140000000000000000000000000000000000000");
  const [licenseTerms, setLicenseTerms] = useState<string>("N/A");
  
  const [paymentAmount, setPaymentAmount] = useState<string>("0.001");
  const [paymentTokenId, setPaymentTokenId] = useState<number>(1);
  
  const [claimTokenId, setClaimTokenId] = useState<number>(1);

  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/`);
      setBackendStatus(response.ok);
    } catch (error) {
      setBackendStatus(false);
    }
  };

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus();
  }, []);

  // Handle file selection for IP asset
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      try {
        const preview = await generateFilePreview(file);
        setFilePreview(preview);
        setIpFile(file);
      } catch (err) {
        console.error('File preview error:', err);
        setIpFile(file);
      }
    }
  };

  // Upload file to IPFS
  const uploadToIPFS = async () => {
    if (!ipFile) {
      setError("Please select a file to upload");
      return null;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous errors
      
      const uploadResult = await pinFileToIPFS(ipFile);
      
      if (uploadResult.success && uploadResult.cid) {
        // Clear any previous file preview
        setFilePreview(null);
        
        // Set the IPFS hash
        const ipfsUrl = `ipfs://${uploadResult.cid}`;
        setIpHash(ipfsUrl);
        
        // Get gateway URL for display
        const gatewayUrl = getIPFSGatewayURL(ipfsUrl);
        
        // Show success message with both IPFS and gateway URLs
        setError(`✅ File successfully uploaded to IPFS!\nIPFS: ${ipfsUrl}\nGateway: ${gatewayUrl}`);
        
        return uploadResult.cid;
    } else {
        // Handle specific upload errors
        const errorMessage = uploadResult.message || "Failed to upload file";
        setError(errorMessage);
        
        // Reset file selection if upload fails
        setIpFile(null);
        setFilePreview(null);
        
        return null;
      }
    } catch (err: any) {
      console.error('Unexpected upload error:', err);
      setError(err.message || "Unexpected error during file upload");
      
      // Reset file selection
      setIpFile(null);
      setFilePreview(null);
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load contract data
  const loadContractData = async () => {
    if (!account?.address) return;

    try {
      setLoading(true);
      const contract = getContract({
        abi: MODRED_IP_ABI,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
        address: CONTRACT_ADDRESS_JSON["ModredIPModule#ModredIP"],
      });

      // Get next token ID
      const nextId = await readContract({
        contract,
        method: "nextTokenId",
        params: [],
      });
      const nextTokenIdNum = Number(nextId);

      // Get next license ID
      const nextLicenseId = await readContract({
        contract,
        method: "nextLicenseId",
        params: [],
      });
      const nextLicenseIdNum = Number(nextLicenseId);

      // Load IP assets
      const newIpAssets = new Map<number, IPAsset>();
      for (let i = 1; i < nextTokenIdNum; i++) {
        try {
          const ipAsset = await readContract({
            contract,
            method: "getIPAsset",
            params: [BigInt(i)],
          });
          newIpAssets.set(i, {
            owner: ipAsset[0],
            ipHash: ipAsset[1],
            metadata: ipAsset[2],
            isEncrypted: ipAsset[3],
            isDisputed: ipAsset[4],
            registrationDate: ipAsset[5],
            totalRevenue: ipAsset[6],
            royaltyTokens: ipAsset[7],
          });
        } catch (error) {
          // Token doesn't exist, skip
        }
      }
      setIpAssets(newIpAssets);

      // Parse metadata for all IP assets
      const newParsedMetadata = new Map<number, any>();
      for (const [id, asset] of newIpAssets.entries()) {
        try {
          const metadata = await parseMetadata(asset.metadata);
          newParsedMetadata.set(id, metadata);
        } catch (error) {
          console.error(`Error parsing metadata for token ${id}:`, error);
          newParsedMetadata.set(id, {
            name: "Unknown",
            description: "No description available"
          });
        }
      }
      setParsedMetadata(newParsedMetadata);

      // Load licenses
      const newLicenses = new Map<number, License>();
      for (let i = 1; i < nextLicenseIdNum; i++) {
        try {
          const license = await readContract({
            contract,
            method: "getLicense",
            params: [BigInt(i)],
          });
          newLicenses.set(i, {
            licensee: license[0],
            tokenId: license[1],
            royaltyPercentage: license[2],
            duration: license[3],
            startDate: license[4],
            isActive: license[5],
            commercialUse: license[6],
            terms: license[7],
          });
        } catch (error) {
          // License doesn't exist, skip
        }
      }
      setLicenses(newLicenses);

    } catch (error) {
      console.error("Error loading contract data:", error);
      setError("Failed to load contract data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractData();
  }, [account?.address]);

  // Create standardized NFT metadata
  const createNFTMetadata = async (ipHash: string, name: string, description: string, isEncrypted: boolean) => {
    // Generate metadata object
    const metadata = {
      name: name || `IP Asset #${Date.now()}`, // Use provided name or generate unique name
      description: description || "No description provided",
      image: ipHash, // Use IPFS hash as image reference
      properties: {
        ipHash,
        name: name || "Unnamed",
        description: description || "No description provided",
        isEncrypted,
        uploadDate: new Date().toISOString()
      }
    };

    // Upload metadata to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    
    const metadataUploadResult = await pinFileToIPFS(metadataFile);
    
    if (!metadataUploadResult.success || !metadataUploadResult.cid) {
      throw new Error('Failed to upload metadata to IPFS');
    }

    // Return IPFS URL for metadata
    return `ipfs://${metadataUploadResult.cid}`;
  };

  // Register IP using backend API
  const registerIP = async () => {
    if (!account?.address || !ipHash || !ipName.trim()) {
      setError("Please fill in all required fields (IP Hash and Name are required)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create and upload metadata to IPFS
      const metadataUri = await createNFTMetadata(ipHash, ipName, ipDescription, isEncrypted);

      // Prepare comprehensive IP metadata for backend and infringement detection
      const ipMetadata = {
        name: ipName,
        description: ipDescription,
        image: metadataUri,
        creator: account.address,
        created_at: new Date().toISOString(),
        // Additional metadata for better infringement detection
        content_type: ipFile?.type || 'unknown',
        file_size: ipFile?.size || 0,
        mime_type: ipFile?.type || 'unknown',
        tags: [], // Could be enhanced with user input
        category: 'general', // Could be enhanced with user input
        license_type: 'all_rights_reserved',
        commercial_use: false,
        derivatives_allowed: false,
        creator_email: 'creator@modredip.com', // Could be enhanced with user input
        // File-specific metadata
        file_name: ipFile?.name || 'unknown',
        file_extension: ipFile?.name?.split('.').pop() || 'unknown',
        upload_timestamp: new Date().toISOString(),
        // Blockchain metadata
        network: 'etherlink',
        chain_id: '128123',
        contract_address: CONTRACT_ADDRESS_JSON["ModredIPModule#ModredIP"],
        // Infringement detection metadata
        monitoring_enabled: true,
        infringement_alerts: true,
        content_hash: ipHash,
        original_filename: ipFile?.name || 'unknown'
      };

      // Prepare NFT metadata for backend
      // const nftMetadata = {
      //   name: ipName,
      //   description: ipDescription,
      //   image: metadataUri,
      //   attributes: [
      //     {
      //       trait_type: "IP Hash",
      //       value: ipHash
      //     },
      //     {
      //       trait_type: "Creator",
      //       value: account.address
      //     },
      //     {
      //       trait_type: "Encrypted",
      //       value: isEncrypted
      //     }
      //   ]
      // };

      // Call backend API
      const response = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipHash: ipHash,
          metadata: JSON.stringify(ipMetadata),
          isEncrypted: isEncrypted,
          modredIpContractAddress: CONTRACT_ADDRESS_JSON["ModredIPModule#ModredIP"]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register IP');
      }

      const result = await response.json();
      console.log('IP Registration successful:', result);

      // Show success message
      setSuccess(`✅ IP Asset registered successfully!\nTransaction: ${result.etherlink.txHash}\nIP Asset ID: ${result.etherlink.ipAssetId}`);

      // Reset form
      setIpFile(null);
      setIpHash("");
      setIpName("");
      setIpDescription("");
      setIsEncrypted(false);

      // Reload data
      await loadContractData();

      } catch (error) {
      console.error("Error registering IP:", error);
      setError(error instanceof Error ? error.message : "Failed to register IP asset");
    } finally {
      setLoading(false);
    }
  };

  // Mint License using backend API
  const mintLicense = async () => {
    if (!account?.address || !selectedTokenId) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Prepare license terms for backend
      const licenseTerms = {
        tokenId: selectedTokenId,
        royaltyPercentage: royaltyPercentage,
        duration: licenseDuration,
        commercialUse: commercialUse,
        terms: JSON.stringify({
          transferable: true,
          commercialAttribution: commercialAttribution,
          commercializerChecker: commercializerChecker,
          commercializerCheckerData: commercializerCheckerData,
          commercialRevShare: commercialRevShare,
          commercialRevCeiling: commercialRevCeiling,
          derivativesAllowed: derivativesAllowed,
          derivativesAttribution: derivativesAttribution,
          derivativesApproval: derivativesApproval,
          derivativesReciprocal: derivativesReciprocal,
          derivativeRevCeiling: derivativeRevCeiling,
          currency: licenseCurrency
        })
      };

      // Call backend API
      const response = await fetch(`${BACKEND_URL}/api/license/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: selectedTokenId,
          royaltyPercentage: royaltyPercentage,
          duration: licenseDuration,
          commercialUse: commercialUse,
          terms: licenseTerms.terms,
          modredIpContractAddress: CONTRACT_ADDRESS_JSON["ModredIPModule#ModredIP"]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mint license');
      }

      const result = await response.json();
      console.log('License minting successful:', result);

      // Show success message
      setSuccess(`✅ License minted successfully!\nTransaction: ${result.data.txHash}`);

      // Reset form
      setSelectedTokenId(1);
      setRoyaltyPercentage(10);
      setLicenseDuration(86400);
      setCommercialUse(true);
      setCommercialAttribution(true);
      setCommercializerChecker("0x0000000000000000000000000000000000000000");
      setCommercializerCheckerData("0000000000000000000000000000000000000000");
      setCommercialRevShare(100000000);
      setCommercialRevCeiling(0);
      setDerivativesAllowed(true);
      setDerivativesAttribution(true);
      setDerivativesApproval(false);
      setDerivativesReciprocal(true);
      setDerivativeRevCeiling(0);
      setLicenseCurrency("0x15140000000000000000000000000000000000000");
      setLicenseTerms("N/A");

      // Reload data
      await loadContractData();

    } catch (error) {
      console.error("Error minting license:", error);
      setError(error instanceof Error ? error.message : "Failed to mint license");
    } finally {
      setLoading(false);
    }
  };

  // Pay Revenue
  const payRevenue = async () => {
    if (!account?.address || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    try {
      setLoading(true);
      setError("");

        const contract = getContract({
        abi: MODRED_IP_ABI,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
        address: CONTRACT_ADDRESS_JSON["ModredIPModule#ModredIP"],
        });

      const preparedCall = await prepareContractCall({
          contract,
        method: "payRevenue",
        params: [BigInt(paymentTokenId)],
        value: parseEther(paymentAmount),
        });

        const transaction = await sendTransaction({
        transaction: preparedCall,
        account: account,
        });

      await waitForReceipt({
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
          transactionHash: transaction.transactionHash,
        });

      // Reset form
      setPaymentAmount("");
      setPaymentTokenId(1);

      // Reload data
      await loadContractData();

      } catch (error) {
      console.error("Error paying revenue:", error);
      setError("Failed to pay revenue");
    } finally {
      setLoading(false);
    }
  };

  // Claim Royalties
  const claimRoyalties = async () => {
    if (!account?.address) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const contract = getContract({
        abi: MODRED_IP_ABI,
          client: thirdwebClient,
          chain: defineChain(etherlinkTestnet.id),
        address: CONTRACT_ADDRESS_JSON["ModredIPModule#ModredIP"],
      });

      const preparedCall = await prepareContractCall({
        contract,
        method: "claimRoyalties",
        params: [BigInt(claimTokenId)],
      });

      const transaction = await sendTransaction({
        transaction: preparedCall,
        account: account,
      });

      await waitForReceipt({
        client: thirdwebClient,
        chain: defineChain(etherlinkTestnet.id),
        transactionHash: transaction.transactionHash,
      });

      // Reload data
      await loadContractData();

    } catch (error) {
      console.error("Error claiming royalties:", error);
      setError("Failed to claim royalties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>ModredIP - Intellectual Property Management</h1>
          <div className="flex items-center gap-4">
            <ConnectButton
              client={thirdwebClient}
              wallets={wallets}
              chain={defineChain(etherlinkTestnet.id)}
            />
          </div>
      </header>

      {/* Backend Status */}
      <div className={`backend-status ${backendStatus ? 'connected' : 'disconnected'}`}>
        Backend: {backendStatus ? '🟢 Connected' : '🔴 Disconnected'}
        <button onClick={checkBackendStatus} className="refresh-btn">🔄</button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
                      </div>
      )}

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {loading && <div className="loading">Loading...</div>}

      <div className="main-content">
        {/* Register IP Asset */}
        <section className="section">
          <h2>Register IP Asset</h2>
          <div className="file-upload-container">
            <input
              type="file"
              id="ip-file-upload"
              className="file-upload-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4"
            />
            <label 
              htmlFor="ip-file-upload" 
              className={`file-upload-label ${loading ? 'disabled' : ''}`}
            >
              Choose File
            </label>
            {filePreview && (
              <div className="file-preview">
                {filePreview.startsWith('data:image') ? (
                  <img 
                    src={filePreview} 
                    alt="File preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px' }} 
                  />
                ) : (
                  <p>{filePreview}</p>
                )}
        </div>
            )}
            <button 
              className="file-upload-button"
              onClick={uploadToIPFS} 
              disabled={!ipFile || loading}
            >
              Upload to IPFS
            </button>
        </div>
          <div className="form-group">
            <label>IP Hash (IPFS):</label>
            <input
              type="text"
              value={ipHash}
              onChange={(e) => setIpHash(e.target.value)}
              placeholder="IPFS hash will appear after upload"
              readOnly
            />
            {ipHash && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Uploaded Media:</p>
                <div className="border rounded-lg p-3 bg-gray-50">
                  {ipFile && ipFile.type.startsWith('image/') ? (
                    <img 
                      src={getIPFSGatewayURL(ipHash)} 
                      alt="Uploaded media" 
                      className="max-w-full h-32 object-contain rounded"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = 'none';
                        
                        const nextSibling = imgElement.nextElementSibling as HTMLElement | null;
                        if (nextSibling) {
                          nextSibling.setAttribute('style', 'display: block');
                        }
                      }}
                    />
                  ) : null}
                  <div className="text-sm">
                    <p><strong>File:</strong> {ipFile?.name}</p>
                    <p><strong>IPFS URL:</strong> <a href={ipHash} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{ipHash}</a></p>
                    <p><strong>Gateway URL:</strong> <a href={getIPFSGatewayURL(ipHash)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{getIPFSGatewayURL(ipHash)}</a></p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={ipName}
              onChange={(e) => setIpName(e.target.value)}
              placeholder="Enter a name for your IP asset"
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={ipDescription}
              onChange={(e) => setIpDescription(e.target.value)}
              placeholder="Describe your IP asset"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isEncrypted}
                onChange={(e) => setIsEncrypted(e.target.checked)}
              />
              Encrypted Content
            </label>
          </div>
          <button 
            onClick={registerIP} 
            disabled={loading || !account?.address || !ipHash || !ipName.trim()}
          >
            Register IP
          </button>
        </section>

        {/* Mint License */}
        <section className="section">
          <h2>Mint License</h2>
          <div className="form-group">
            <label>IP Token ID:</label>
            <select
              value={selectedTokenId}
              onChange={(e) => setSelectedTokenId(Number(e.target.value))}
            >
              {Array.from(ipAssets.keys()).map((id) => {
                const asset = ipAssets.get(id);
                const metadata = parsedMetadata.get(id) || { name: "Unknown" };
                return (
                  <option key={id} value={id}>
                    Token #{id} - {metadata.name || asset?.ipHash.substring(0, 10) || 'Unknown'}...
                  </option>
                );
              })}
            </select>
        </div>
          <div className="form-group">
            <label>Royalty Percentage (%):</label>
            <input
              type="number"
              value={royaltyPercentage}
              onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
              min="1"
              max="100"
            />
      </div>
          <div className="form-group">
            <label>Duration (seconds):</label>
            <input
              type="number"
              value={licenseDuration}
              onChange={(e) => setLicenseDuration(Number(e.target.value))}
              min="3600"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={commercialUse}
                onChange={(e) => setCommercialUse(e.target.checked)}
              />
              Commercial Use Allowed
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={commercialAttribution}
                onChange={(e) => setCommercialAttribution(e.target.checked)}
              />
              Commercial Attribution
            </label>
          </div>
          <div className="form-group">
            <label>Commercializer Checker:</label>
            <input
              type="text"
              value={commercializerChecker}
              onChange={(e) => setCommercializerChecker(e.target.value)}
              placeholder="0x0000000000000000000000000000000000000000"
            />
          </div>
          <div className="form-group">
            <label>Commercializer Checker Data:</label>
            <input
              type="text"
              value={commercializerCheckerData}
              onChange={(e) => setCommercializerCheckerData(e.target.value)}
              placeholder="0000000000000000000000000000000000000000"
            />
          </div>
          <div className="form-group">
            <label>Commercial Rev Share (%):</label>
            <input
              type="number"
              value={commercialRevShare / 1000000}
              onChange={(e) => setCommercialRevShare(Number(e.target.value) * 1000000)}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Commercial Rev Ceiling:</label>
            <input
              type="number"
              value={commercialRevCeiling}
              onChange={(e) => setCommercialRevCeiling(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={derivativesAllowed}
                onChange={(e) => setDerivativesAllowed(e.target.checked)}
              />
              Derivatives Allowed
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={derivativesAttribution}
                onChange={(e) => setDerivativesAttribution(e.target.checked)}
              />
              Derivatives Attribution
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={derivativesApproval}
                onChange={(e) => setDerivativesApproval(e.target.checked)}
              />
              Derivatives Approval Required
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={derivativesReciprocal}
                onChange={(e) => setDerivativesReciprocal(e.target.checked)}
              />
              Derivatives Reciprocal
            </label>
          </div>
          <div className="form-group">
            <label>Derivative Rev Ceiling:</label>
            <input
              type="number"
              value={derivativeRevCeiling}
              onChange={(e) => setDerivativeRevCeiling(Number(e.target.value))}
              min="0"
            />
          </div>
          <div className="form-group">
            <label>License Currency:</label>
            <input
              type="text"
              value={licenseCurrency}
              onChange={(e) => setLicenseCurrency(e.target.value)}
              placeholder="0x15140000000000000000000000000000000000000"
            />
          </div>
          <div className="form-group">
            <label>License Terms (IPFS):</label>
            <input
              type="text"
              value={licenseTerms}
              onChange={(e) => setLicenseTerms(e.target.value)}
              placeholder="N/A"
            />
          </div>
          <button 
            onClick={mintLicense} 
            disabled={loading || !account?.address || !licenseTerms}
          >
            Mint License
          </button>
        </section>

        {/* Pay Revenue */}
        <section className="section">
          <h2>Pay Revenue</h2>
          <div className="form-group">
            <label>IP Token ID:</label>
            <select
              value={paymentTokenId}
              onChange={(e) => setPaymentTokenId(Number(e.target.value))}
            >
              {Array.from(ipAssets.keys()).map((id) => {
                const asset = ipAssets.get(id);
                const metadata = parsedMetadata.get(id) || { name: "Unknown" };
                return (
                  <option key={id} value={id}>
                    Token #{id} - {metadata.name || asset?.ipHash.substring(0, 10) || 'Unknown'}...
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label>Amount (XTZ):</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0.001"
              step="0.001"
            />
          </div>
          <button onClick={payRevenue} disabled={loading || !account?.address}>
            Pay Revenue
          </button>
        </section>

        {/* Claim Royalties */}
        <section className="section">
          <h2>Claim Royalties</h2>
          <div className="form-group">
            <label>IP Token ID:</label>
            <select
              value={claimTokenId}
              onChange={(e) => setClaimTokenId(Number(e.target.value))}
            >
              {Array.from(ipAssets.keys()).map((id) => {
                const asset = ipAssets.get(id);
                const metadata = parsedMetadata.get(id) || { name: "Unknown" };
                return (
                  <option key={id} value={id}>
                    Token #{id} - {metadata.name || asset?.ipHash.substring(0, 10) || 'Unknown'}...
                  </option>
                );
              })}
            </select>
          </div>
          <button onClick={claimRoyalties} disabled={loading || !account?.address}>
            Claim Royalties
          </button>
        </section>

        {/* IP Assets Display */}
        <section className="section">
          <h2>Registered IP Assets</h2>
          <div className="assets-grid">
            {Array.from(ipAssets.entries()).map(([id, asset]) => {
              const metadata = parsedMetadata.get(id) || { name: "Unknown", description: "No description available" };
              const mediaUrl = getIPFSGatewayURL(asset.ipHash);
              
              return (
                <div key={id} className="asset-card">
                  <h3>{metadata.name || `Token #${id}`}</h3>
                  
                  {/* Media Preview */}
                  <div className="media-preview">
                    {asset.ipHash && (
                      <div className="media-container">
                        {asset.ipHash.includes('image') || asset.ipHash.includes('jpg') || asset.ipHash.includes('jpeg') || asset.ipHash.includes('png') || asset.ipHash.includes('gif') ? (
                          <img 
                            src={mediaUrl} 
                            alt={metadata.name || `IP Asset ${id}`}
                            className="media-image"
                            onError={(e) => {
                              const imgElement = e.target as HTMLImageElement;
                              imgElement.style.display = 'none';
                              const fallback = imgElement.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div className="media-fallback" style={{ display: 'none' }}>
                          <div className="file-icon">📄</div>
                          <p>Media Preview</p>
                          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="view-media-link">
                            View Media
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p><strong>Owner:</strong> {asset.owner.substring(0, 10)}...</p>
                  <p><strong>Description:</strong> {metadata.description || "No description"}</p>
                  <p><strong>IP Hash:</strong> {asset.ipHash.substring(0, 20)}...</p>
                  <p><strong>Encrypted:</strong> {asset.isEncrypted ? "Yes" : "No"}</p>
                  <p><strong>Disputed:</strong> {asset.isDisputed ? "Yes" : "No"}</p>
                  <p><strong>Total Revenue:</strong> {formatEther(asset.totalRevenue)} XTZ</p>
                  <p><strong>Royalty Tokens:</strong> {Number(asset.royaltyTokens) / 100}%</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Licenses Display */}
        <section className="section">
          <h2>Licenses</h2>
          <div className="licenses-grid">
            {Array.from(licenses.entries()).map(([id, license]) => (
              <div key={id} className="license-card">
                <h3>License #{id}</h3>
                <p><strong>Licensee:</strong> {license.licensee.substring(0, 10)}...</p>
                <p><strong>Token ID:</strong> {Number(license.tokenId)}</p>
                <p><strong>Royalty:</strong> {Number(license.royaltyPercentage) / 100}%</p>
                <p><strong>Duration:</strong> {Number(license.duration)} seconds</p>
                <p><strong>Active:</strong> {license.isActive ? "Yes" : "No"}</p>
                <p><strong>Commercial:</strong> {license.commercialUse ? "Yes" : "No"}</p>
                <p><strong>Terms:</strong> {license.terms.substring(0, 20)}...</p>
              </div>
            ))}
        </div>
        </section>
      </div>
    </div>
  );
}
