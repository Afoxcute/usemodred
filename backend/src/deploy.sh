#!/bin/bash

# ModredIP Backend Railway Deployment Script

echo "🚀 Starting ModredIP Backend Railway Deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📋 Don't forget to set environment variables in Railway dashboard"
echo "📖 See ENVIRONMENT.md for required variables" 