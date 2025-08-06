# ModredIP Backend API

A comprehensive backend API for the ModredIP platform, providing IP management services on the Etherlink blockchain using ERC-6551 token standards.

## 🚀 Railway Deployment

This backend is configured for Railway deployment with automatic builds and deployments.

### Prerequisites

- Node.js 18+ 
- npm 8+
- Railway account

### Environment Variables

Set these environment variables in your Railway project:

```bash
# Blockchain Configuration
ETHERLINK_RPC_URL=https://node.ghostnet.tezos.marigold.dev
ETHERLINK_CHAIN_ID=128123
ETHERLINK_EXPLORER_URL=https://ghostnet.etherlink.com

# Contract Addresses
MODRED_IP_CONTRACT_ADDRESS=your_deployed_contract_address
ERC6551_REGISTRY_ADDRESS=your_registry_address
ERC6551_ACCOUNT_ADDRESS=your_account_address

# External APIs
PINATA_JWT=your_pinata_jwt_token
YAKOA_API_KEY=your_yakoa_api_key
YAKOA_API_URL=https://api.yakoa.com/v1

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Optional: Database (if needed)
DATABASE_URL=your_database_url
```

### Deployment Steps

1. **Connect to Railway**
   ```bash
   railway login
   ```

2. **Initialize Railway Project**
   ```bash
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set ETHERLINK_RPC_URL=https://node.ghostnet.tezos.marigold.dev
   railway variables set ETHERLINK_CHAIN_ID=128123
   # ... set all other required variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### API Endpoints

#### IP Registration
- `POST /api/register` - Register new IP asset
- `GET /api/register/:id` - Get IP asset details

#### License Management
- `POST /api/license/mint` - Mint license token
- `GET /api/license/:id` - Get license details

#### Infringement Monitoring
- `POST /api/infringement/check` - Check for infringements
- `GET /api/infringement/:id` - Get infringement details

#### Health Check
- `GET /` - Health check endpoint

### Build Process

The application uses the following build process:

1. **Install Dependencies**: `npm install`
2. **Build TypeScript**: `npm run build` (runs automatically via postinstall)
3. **Start Server**: `npm start`

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm run test` - Run tests (placeholder)

### Architecture

```
src/
├── controllers/     # API route handlers
├── services/        # Business logic
├── routes/          # Express route definitions
├── utils/           # Utility functions
├── scripts/         # CLI scripts
├── types/           # TypeScript type definitions
└── index.ts         # Main entry point
```

### Monitoring

The application includes health checks and logging for Railway monitoring:

- Health check endpoint: `GET /`
- Automatic restart on failure
- 300-second health check timeout

### Troubleshooting

1. **Build Failures**: Check TypeScript compilation errors
2. **Runtime Errors**: Check environment variables
3. **API Errors**: Verify contract addresses and RPC URLs
4. **CORS Issues**: Update CORS_ORIGIN environment variable

### Support

For issues with Railway deployment, check:
- Railway logs: `railway logs`
- Environment variables: `railway variables`
- Service status: `railway status`

## License

MIT License - see LICENSE file for details.
