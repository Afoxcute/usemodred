# 🚀 ModredIP Backend - Railway Deployment

## 📋 Overview
This directory is configured for Railway deployment using Docker. The backend provides API endpoints for IP registration, license minting, and infringement monitoring on the Etherlink blockchain.

## 🏗️ Files Created/Modified

### Core Files:
- ✅ `Dockerfile` - Docker configuration for Railway
- ✅ `.dockerignore` - Excludes unnecessary files from Docker build
- ✅ `railway.toml` - Railway-specific deployment settings
- ✅ `package.json` - Updated with proper start scripts and dependencies
- ✅ `index.ts` - Enhanced with health check endpoints
- ✅ `RAILWAY_DEPLOYMENT.md` - Detailed deployment guide

### Scripts:
- ✅ `build-test.sh` - Local Docker build testing script

## 🔧 Key Changes Made

### 1. Package.json Updates:
- Added `start` script pointing to `index.ts`
- Added `build` script for TypeScript compilation
- Added missing dependencies: `body-parser`, `@types/body-parser`

### 2. Docker Configuration:
- Node.js 18 Alpine base image
- Yarn for dependency management
- Health check with curl
- Port 5000 exposed
- Proper build and runtime setup

### 3. Health Checks:
- `GET /` - Detailed health status
- `GET /health` - Simple health check for Railway

## 🚀 Quick Deployment

### Option 1: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Deploy
railway up
```

### Option 2: Railway Dashboard
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

## 🔑 Required Environment Variables

Set these in Railway dashboard:

```bash
# Server
PORT=5000
NODE_ENV=production

# Etherlink
ETHERLINK_RPC_URL=https://node.ghostnet.tezos.marigold.dev
ETHERLINK_CHAIN_ID=128123

# APIs
YAKOA_API_KEY=your_yakoa_key
PINATA_JWT=your_pinata_token

# Blockchain
PRIVATE_KEY=your_private_key
```

## 📊 API Endpoints

Once deployed, your API will be available at:
- `https://your-app.railway.app/` - Health check
- `https://your-app.railway.app/api/register` - IP registration
- `https://your-app.railway.app/api/license` - License operations
- `https://your-app.railway.app/api/yakoa` - Yakoa integration
- `https://your-app.railway.app/api/infringement` - Infringement monitoring

## 🔍 Testing Locally

```bash
# Test Docker build
chmod +x build-test.sh
./build-test.sh

# Or manually
docker build -t modredip-backend .
docker run -p 5000:5000 modredip-backend
```

## 📝 Notes

- The backend uses `index.ts` as the main entry point
- TypeScript is compiled at runtime with ts-node
- All environment variables must be set in Railway dashboard
- Health checks run every 30 seconds
- Automatic restarts on failure

## 🎯 Next Steps

1. Set up environment variables in Railway
2. Deploy using Railway CLI or dashboard
3. Update frontend to use the new Railway URL
4. Test all API endpoints
5. Monitor logs and health checks

---

**Ready for Railway deployment! 🚀** 