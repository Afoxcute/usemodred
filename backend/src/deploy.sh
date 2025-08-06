#!/bin/bash

# Railway Deployment Script for ModredIP Backend

echo "🚀 Starting Railway deployment for ModredIP Backend..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Initialize project if not already done
if [ ! -f "railway.toml" ]; then
    echo "📁 Initializing Railway project..."
    railway init
fi

# Set environment variables (you'll need to update these with your actual values)
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=5000

echo "📝 Please set the following environment variables in Railway dashboard:"
echo "   - ETHERLINK_RPC_URL"
echo "   - ETHERLINK_CHAIN_ID"
echo "   - MODRED_IP_CONTRACT_ADDRESS"
echo "   - ERC6551_REGISTRY_ADDRESS"
echo "   - ERC6551_ACCOUNT_ADDRESS"
echo "   - PINATA_JWT"
echo "   - YAKOA_API_KEY"
echo "   - CORS_ORIGIN"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🔗 Your API will be available at: https://your-app-name.railway.app"
echo "📊 Monitor your deployment at: https://railway.app/dashboard" 