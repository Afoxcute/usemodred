import { Chain, createPublicClient, createWalletClient, http, WalletClient } from 'viem'
import { privateKeyToAccount, Address, Account } from 'viem/accounts'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Environment configuration
 */
export const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS configuration
  ALLOWED_ORIGINS: [
    'https://usemodred.vercel.app',
    'https://usemodred.vercel.app/',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173'
  ],
  
  // API Keys
  YAKOA_API_KEY: process.env.YAKOA_API_KEY,
  YAKOA_SUBDOMAIN: process.env.YAKOA_SUBDOMAIN || 'docs-demo',
  YAKOA_NETWORK: process.env.YAKOA_NETWORK || 'docs-demo',
  
  // Pinata configuration
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
  PINATA_JWT: process.env.PINATA_JWT,
  
  // Etherlink configuration
  ETHERLINK_RPC_URL: process.env.ETHERLINK_RPC_URL || 'https://rpc.etherlink.com',
  ETHERLINK_CHAIN_ID: process.env.ETHERLINK_CHAIN_ID || '128123',
  
  // Contract addresses
  MODRED_IP_CONTRACT: process.env.MODRED_IP_CONTRACT,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

/**
 * Check if running in production
 */
export const isProduction = config.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = config.NODE_ENV === 'development';

/**
 * Get CORS origins based on environment
 */
export function getCorsOrigins(): string[] {
  const origins = [...config.ALLOWED_ORIGINS];
  
  // Add environment-specific origins
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // Add additional origins from environment
  if (process.env.ADDITIONAL_CORS_ORIGINS) {
    const additionalOrigins = process.env.ADDITIONAL_CORS_ORIGINS.split(',');
    origins.push(...additionalOrigins);
  }
  
  return origins;
}

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  const required = [
    'YAKOA_API_KEY',
    'PINATA_API_KEY',
    'PINATA_SECRET_KEY',
    'PINATA_JWT'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
  }
}

// Etherlink testnet configuration
const etherlinkTestnet: Chain = {
  id: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://node.ghostnet.etherlink.com'],
    },
    public: {
      http: ['https://node.ghostnet.etherlink.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Testnet Explorer',
      url: 'https://testnet.explorer.etherlink.com',
    },
  },
}

interface NetworkConfig {
    rpcProviderUrl: string
    blockExplorer: string
    chain: Chain
    nativeTokenAddress: Address
}

// Network configuration
const networkConfig: NetworkConfig = {
    rpcProviderUrl: 'https://node.ghostnet.etherlink.com',
    blockExplorer: 'https://testnet.explorer.etherlink.com',
    chain: etherlinkTestnet,
    nativeTokenAddress: '0x0000000000000000000000000000000000000000' as Address, // Native XTZ token
}

// Helper functions
const validateEnvironmentVars = () => {
    if (!process.env.WALLET_PRIVATE_KEY) {
        throw new Error('WALLET_PRIVATE_KEY is required in .env file')
    }
}

// Initialize configuration
validateEnvironmentVars()

export const networkInfo = {
    ...networkConfig,
    rpcProviderUrl: process.env.RPC_PROVIDER_URL || networkConfig.rpcProviderUrl,
}

export const account: Account = privateKeyToAccount(`0x${process.env.WALLET_PRIVATE_KEY}` as Address)

const baseConfig = {
    chain: networkInfo.chain,
    transport: http(networkInfo.rpcProviderUrl),
} as const

export const publicClient = createPublicClient(baseConfig)
export const walletClient = createWalletClient({
    ...baseConfig,
    account,
}) as WalletClient

// Export constants
export const NATIVE_TOKEN_ADDRESS = networkInfo.nativeTokenAddress
export const BLOCK_EXPLORER_URL = networkInfo.blockExplorer
