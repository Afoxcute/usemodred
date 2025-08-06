@echo off
REM Railway Deployment Script for ModredIP Backend (Windows)

echo 🚀 Starting Railway deployment for ModredIP Backend...

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Please install it first:
    echo npm install -g @railway/cli
    pause
    exit /b 1
)

REM Login to Railway
echo 🔐 Logging into Railway...
railway login

REM Initialize project if not already done
if not exist "railway.toml" (
    echo 📁 Initializing Railway project...
    railway init
)

REM Set environment variables
echo ⚙️ Setting environment variables...
railway variables set NODE_ENV=production
railway variables set PORT=5000

echo 📝 Please set the following environment variables in Railway dashboard:
echo    - ETHERLINK_RPC_URL
echo    - ETHERLINK_CHAIN_ID
echo    - MODRED_IP_CONTRACT_ADDRESS
echo    - ERC6551_REGISTRY_ADDRESS
echo    - ERC6551_ACCOUNT_ADDRESS
echo    - PINATA_JWT
echo    - YAKOA_API_KEY
echo    - CORS_ORIGIN

REM Deploy to Railway
echo 🚀 Deploying to Railway...
railway up

echo ✅ Deployment complete!
echo 🔗 Your API will be available at: https://your-app-name.railway.app
echo 📊 Monitor your deployment at: https://railway.app/dashboard

pause 