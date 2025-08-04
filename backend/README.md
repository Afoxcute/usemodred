# ModredIP Backend - Railway Deployment

## Prerequisites
- Railway account
- GitHub repository with the project
- Node.js 18.x
- Yarn package manager

## Deployment Steps

### 1. Prepare Repository
1. Ensure your repository has the following files:
   - `Dockerfile`
   - `railway.json`
   - `.env.example`
   - `package.json` with proper scripts

### 2. Environment Variables
1. Create a `.env` file based on `.env.example`
2. Set all required environment variables in Railway project settings

### 3. Railway Configuration
- **Build**: Uses Dockerfile
- **Start Command**: `yarn start`
- **Port**: Dynamically assigned (default 3000)
- **Health Check**: `/health` endpoint

### Recommended Railway Settings
- Node.js version: 18.x
- Build command: `yarn build`
- Start command: `yarn start`

## Local Development
```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## Troubleshooting
- Ensure all environment variables are set
- Check Railway logs for deployment issues
- Verify Dockerfile and `railway.json` configurations

## Environment Variables
Refer to `.env.example` for required configuration keys.

### Key Variables
- `PORT`: Server listening port
- `NODE_ENV`: Application environment
- `YAKOA_API_KEY`: Yakoa integration key
- `PINATA_JWT`: IPFS pinning service token

## Deployment Checklist
- [x] Dockerfile present
- [x] `railway.json` configured
- [x] Environment variables set
- [x] Health check endpoint implemented
- [x] Production build scripts ready

## Support
For issues, please open a GitHub issue in the project repository. 