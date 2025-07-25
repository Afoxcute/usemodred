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
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

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

    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        fileType: file.type,
        fileSize: file.size
      }
    });
    formData.append('pinataMetadata', metadata);

    // Add options
    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    // Prepare headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${PINATA_JWT}`
    };

    console.log('Uploading file to Pinata:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    // Make API call to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('Pinata Response Status:', response.status);

    // Check response status
    if (!response.ok) {
      // Try to parse error details
      let errorDetails = '';
      try {
        const errorData = await response.json();
        console.error('Pinata Error Response:', errorData);
        errorDetails = JSON.stringify(errorData);
      } catch (parseError) {
        console.error('Could not parse error response');
      }

      throw new Error(`Pinata upload failed. Status: ${response.status}. Details: ${errorDetails}`);
    }

    // Parse successful response
    const data = await response.json();
    console.log('Pinata Upload Success:', data);

    return {
      success: true,
      cid: data.IpfsHash,
    };
  } catch (error: any) {
    console.error('Complete Error in pinFileToIPFS:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to upload to IPFS',
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

/**
 * Extracts the CID from an IPFS URL
 * @param url IPFS URL in any format
 * @returns IPFS CID or null if not found
 */
const extractIPFSCid = (url: string): string | null => {
  if (!url) return null;

  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '');
  }

  // Handle /ipfs/ path
  if (url.includes('/ipfs/')) {
    const parts = url.split('/ipfs/');
    if (parts.length > 1) {
      // Remove any query parameters or path components after the CID
      return parts[1].split('?')[0].split('/')[0];
    }
  }

  // Handle gateway URLs with CID pattern
  const gatewayRegex = /https:\/\/[^/]+\/ipfs\/([^/?#]+)/;
  const match = url.match(gatewayRegex);
  if (match && match[1]) {
    return match[1];
  }

  return null;
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
  const [loading, setLoading] = useState<boolean>(false);
  
  // IP Assets state
  const [ipAssets, setIpAssets] = useState<Map<number, IPAsset>>(new Map());
  
  // Licenses state
  const [licenses, setLicenses] = useState<Map<number, License>>(new Map());
  
  // Form states
  const [ipFile, setIpFile] = useState<File | null>(null);
  const [ipHash, setIpHash] = useState<string>("");
  const [metadata, setMetadata] = useState<string>("");
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  
  const [selectedTokenId, setSelectedTokenId] = useState<number>(1);
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(10);
  const [licenseDuration, setLicenseDuration] = useState<number>(86400);
  const [commercialUse, setCommercialUse] = useState<boolean>(true);
  const [licenseTerms, setLicenseTerms] = useState<string>("");
  
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentTokenId, setPaymentTokenId] = useState<number>(1);
  
  const [claimTokenId, setClaimTokenId] = useState<number>(1);

  const [filePreview, setFilePreview] = useState<string | null>(null);

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
  const createNFTMetadata = async (ipHash: string, userMetadata: string, isEncrypted: boolean) => {
    // Generate metadata object
    const metadata = {
      name: `IP Asset #${Date.now()}`, // Unique name, could be replaced with actual token ID later
      description: userMetadata,
      image: ipHash, // Use IPFS hash as image reference
      properties: {
        ipHash,
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

  // Modify registerIP to use new metadata creation
  const registerIP = async () => {
    if (!account?.address || !ipHash) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Create and upload metadata to IPFS
      const metadataUri = await createNFTMetadata(ipHash, metadata, isEncrypted);

      const contract = getContract({
        abi: MODRED_IP_ABI,
        client: thirdwebClient,
        chain: defineChain(etherlinkTestnet.id),
        address: CONTRACT_ADDRESS_JSON["ModredIPModule#ModredIP"],
      });

      const preparedCall = await prepareContractCall({
        contract,
        method: "registerIP",
        params: [ipHash, metadataUri, isEncrypted],
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
      setIpFile(null);
      setIpHash("");
      setMetadata("");
      setIsEncrypted(false);

      // Reload data
      await loadContractData();

    } catch (error) {
      console.error("Error registering IP:", error);
      setError("Failed to register IP asset");
    } finally {
      setLoading(false);
    }
  };

  // Mint License
  const mintLicense = async () => {
    if (!account?.address || !licenseTerms) {
      setError("Please fill in all required fields");
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
        method: "mintLicense",
        params: [
          BigInt(selectedTokenId),
          BigInt(royaltyPercentage * 100), // Convert to basis points
          BigInt(licenseDuration),
          commercialUse,
          licenseTerms,
        ],
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
      setSelectedTokenId(1);
      setRoyaltyPercentage(10);
      setLicenseDuration(86400);
      setCommercialUse(true);
      setLicenseTerms("");

      // Reload data
      await loadContractData();

      } catch (error) {
      console.error("Error minting license:", error);
      setError("Failed to mint license");
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

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
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
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.style.display = 'block';
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
            <label>Metadata (IPFS):</label>
            <input
              type="text"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder="Describe your IP asset"
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
            disabled={loading || !account?.address || !ipHash}
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
              {Array.from(ipAssets.keys()).map((id) => (
                <option key={id} value={id}>
                  Token #{id} - {ipAssets.get(id)?.ipHash.substring(0, 10)}...
                </option>
              ))}
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
            <label>License Terms (IPFS):</label>
            <input
              type="text"
              value={licenseTerms}
              onChange={(e) => setLicenseTerms(e.target.value)}
              placeholder="Qm..."
            />
          </div>
          <button onClick={mintLicense} disabled={loading || !account?.address}>
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
              {Array.from(ipAssets.keys()).map((id) => (
                <option key={id} value={id}>
                  Token #{id} - {ipAssets.get(id)?.ipHash.substring(0, 10)}...
                </option>
              ))}
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
              {Array.from(ipAssets.keys()).map((id) => (
                <option key={id} value={id}>
                  Token #{id} - {ipAssets.get(id)?.ipHash.substring(0, 10)}...
                </option>
              ))}
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
            {Array.from(ipAssets.entries()).map(([id, asset]) => (
              <div key={id} className="asset-card">
                <h3>Token #{id}</h3>
                <p><strong>Owner:</strong> {asset.owner.substring(0, 10)}...</p>
                <p><strong>IP Hash:</strong> {asset.ipHash.substring(0, 20)}...</p>
                <p><strong>Metadata:</strong> {asset.metadata.substring(0, 20)}...</p>
                <p><strong>Encrypted:</strong> {asset.isEncrypted ? "Yes" : "No"}</p>
                <p><strong>Disputed:</strong> {asset.isDisputed ? "Yes" : "No"}</p>
                <p><strong>Total Revenue:</strong> {formatEther(asset.totalRevenue)} XTZ</p>
                <p><strong>Royalty Tokens:</strong> {Number(asset.royaltyTokens) / 100}%</p>
              </div>
            ))}
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
