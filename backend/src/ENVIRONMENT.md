# Environment Variables for Railway Deployment

## Required Environment Variables

Copy these variables to your Railway project's environment settings:

### Server Configuration
```bash
PORT=5000
NODE_ENV=production
```

### Etherlink Blockchain Configuration
```bash
ETHERLINK_RPC_URL=https://node.ghostnet.teztnets.xyz
ETHERLINK_CHAIN_ID=128123
ETHERLINK_EXPLORER_URL=https://testnet-explorer.etherlink.com
```

### Private Key (for contract interactions)
```bash
PRIVATE_KEY=your_private_key_here
```

### Contract Addresses (from deployment)
```bash
MODRED_IP_CONTRACT_ADDRESS=your_deployed_contract_address
ERC6551_REGISTRY_ADDRESS=your_registry_address
ERC6551_ACCOUNT_IMPLEMENTATION_ADDRESS=your_account_implementation_address
```

### Yakoa API Configuration
```bash
YAKOA_API_KEY=your_yakoa_api_key
YAKOA_BASE_URL=https://api.yakoa.com
```

### IPFS Configuration (Pinata)
```bash
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY_URL=https://gateway.pinata.cloud
```

### CORS Configuration
```bash
CORS_ORIGIN=https://your-frontend-domain.com
```

## Optional Environment Variables

### Database Configuration (if needed)
```bash
DATABASE_URL=your_database_url
```

### Redis Configuration (if needed)
```bash
REDIS_URL=your_redis_url
```

## Setting up in Railway

1. Go to your Railway project dashboard
2. Navigate to the "Variables" tab
3. Add each environment variable with its corresponding value
4. Deploy your application

## Security Notes

- Never commit private keys to version control
- Use Railway's secret management for sensitive values
- Rotate API keys regularly
- Use environment-specific configurations 