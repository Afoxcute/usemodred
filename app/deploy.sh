#!/bin/bash

# 🚀 ModredIP Production Deployment Script

echo "🚀 Starting ModredIP Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the app directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Building application..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_status "Build completed successfully!"

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    print_status "Vercel CLI found. Deploying to Vercel..."
    
    # Check if user is logged in to Vercel
    if vercel whoami &> /dev/null; then
        print_status "Deploying to Vercel..."
        vercel --prod --yes
        
        if [ $? -eq 0 ]; then
            print_status "✅ Deployment to Vercel completed successfully!"
            print_status "Your application is now live!"
        else
            print_error "Deployment to Vercel failed"
            exit 1
        fi
    else
        print_warning "Not logged in to Vercel. Please run 'vercel login' first."
        print_status "You can deploy manually by running: vercel --prod"
    fi
else
    print_warning "Vercel CLI not found. You can install it with: npm install -g vercel"
    print_status "Build completed. You can deploy manually to your preferred platform."
fi

print_status "Deployment script completed!"
print_status "Next steps:"
echo "1. Set environment variables in your hosting platform"
echo "2. Configure custom domain (optional)"
echo "3. Test all functionality"
echo "4. Monitor performance and errors"

echo ""
print_status "🎉 ModredIP is ready for production!" 