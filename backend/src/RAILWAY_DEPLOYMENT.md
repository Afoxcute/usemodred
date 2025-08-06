# 🚀 Railway Deployment Guide

## Overview
This backend is configured for deployment on Railway using Docker.

## 🏗️ Files Structure
```
backend/src/
├── Dockerfile              # Docker configuration
├── .dockerignore          # Files to exclude from Docker build
├── railway.toml           # Railway-specific configuration
├── package.json           # Dependencies and scripts
├── index.ts              # Main application entry point
├── app.ts                # Alternative entry point
└── RAILWAY_DEPLOYMENT.md # This file
```

## 🚀 Deployment Steps

### 1. Connect to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link your project
railway link
```

### 2. Set Environment Variables
In Railway dashboard, set these environment variables:

**Required:**
- `PORT=5000`
- `NODE_ENV=production`
- `ETHERLINK_RPC_URL=https://node.ghostnet.tezos.marigold.dev`
- `ETHERLINK_CHAIN_ID=128123`
- `YAKOA_API_KEY=your_yakoa_api_key`
- `PINATA_JWT=your_pinata_jwt_token`
- `PRIVATE_KEY=your_private_key`

**Optional:**
- `ETHERLINK_EXPLORER_URL=https://testnet-explorer.etherlink.com`
- `PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/`

### 3. Deploy
```bash
# Deploy to Railway
railway up

# Or deploy from Railway dashboard
# Just push to your connected repository
```

## 🔧 Configuration

### Dockerfile
- Uses Node.js 18 Alpine for smaller image size
- Installs dependencies with yarn
- Exposes port 5000
- Includes health check

### Railway Configuration
- Uses Dockerfile builder
- Health check at `/` endpoint
- Automatic restart on failure
- 5-minute health check timeout

## 📊 Health Checks

The application provides two health check endpoints:
- `GET /` - Main health check with detailed status
- `GET /health` - Simple health check for Railway

## 🔍 Troubleshooting

### Common Issues:

1. **Build fails**: Check if all dependencies are in package.json
2. **Runtime errors**: Verify environment variables are set
3. **Health check fails**: Ensure the app starts correctly

### Logs:
```bash
# View Railway logs
railway logs

# Or check in Railway dashboard
```

## 🎯 API Endpoints

Once deployed, your API will be available at:
- `https://your-app-name.railway.app/`
- `https://your-app-name.railway.app/api/register`
- `https://your-app-name.railway.app/api/license`
- `https://your-app-name.railway.app/api/yakoa`
- `https://your-app-name.railway.app/api/infringement`

## 🔄 Updates

To update your deployment:
```bash
# Push changes to your repository
git push origin main

# Railway will automatically redeploy
```

## 📝 Notes

- The application uses `index.ts` as the main entry point
- TypeScript is compiled at runtime using ts-node
- All environment variables should be set in Railway dashboard
- Health checks run every 30 seconds 