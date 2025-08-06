# 🚀 Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] `ETHERLINK_RPC_URL` - Etherlink RPC endpoint
- [ ] `ETHERLINK_CHAIN_ID` - Set to 128123 for testnet
- [ ] `ETHERLINK_EXPLORER_URL` - Etherlink explorer URL
- [ ] `MODRED_IP_CONTRACT_ADDRESS` - Your deployed ModredIP contract
- [ ] `ERC6551_REGISTRY_ADDRESS` - Your deployed registry contract
- [ ] `ERC6551_ACCOUNT_ADDRESS` - Your deployed account contract
- [ ] `PINATA_JWT` - Pinata API token for IPFS
- [ ] `YAKOA_API_KEY` - Yakoa API key for infringement monitoring
- [ ] `YAKOA_API_URL` - Yakoa API endpoint
- [ ] `PORT` - Set to 5000 (Railway will override)
- [ ] `NODE_ENV` - Set to production
- [ ] `CORS_ORIGIN` - Your frontend domain

### 2. Railway CLI Setup
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login to Railway: `railway login`
- [ ] Create new Railway project or connect existing

### 3. Code Preparation
- [ ] All TypeScript files compile without errors
- [ ] All dependencies are in package.json
- [ ] Build script works locally: `npm run build`
- [ ] Start script works locally: `npm start`

## 🚀 Deployment Steps

### Option 1: Using Railway CLI
```bash
# Navigate to backend/src directory
cd backend/src

# Initialize Railway project (if not done)
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set PORT=5000
# ... set all other required variables

# Deploy
railway up
```

### Option 2: Using Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Create new project or select existing
3. Connect your GitHub repository
4. Set environment variables in the dashboard
5. Deploy automatically on push

### Option 3: Using Deployment Scripts
```bash
# Windows
deploy.bat

# Linux/Mac
./deploy.sh
```

## 🔍 Post-Deployment Verification

### 1. Health Check
- [ ] Visit your Railway app URL
- [ ] Should see: "✅ Yakoa + Etherlink backend is running!"

### 2. API Endpoints Test
- [ ] `GET /` - Health check
- [ ] `POST /api/register` - IP registration
- [ ] `POST /api/license/mint` - License minting
- [ ] `GET /api/infringement/:id` - Infringement check

### 3. Environment Variables
- [ ] All required variables are set in Railway dashboard
- [ ] No sensitive data in logs
- [ ] CORS is properly configured

### 4. Monitoring
- [ ] Check Railway logs for errors
- [ ] Monitor application performance
- [ ] Set up alerts if needed

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Check tsconfig.json configuration

2. **Runtime Errors**
   - Verify all environment variables are set
   - Check contract addresses are correct
   - Ensure RPC URLs are accessible

3. **API Errors**
   - Test endpoints locally first
   - Check CORS configuration
   - Verify blockchain network connectivity

4. **Deployment Issues**
   - Check Railway logs: `railway logs`
   - Verify environment variables: `railway variables`
   - Restart service if needed: `railway service restart`

### Useful Commands
```bash
# View logs
railway logs

# Check status
railway status

# View variables
railway variables

# Restart service
railway service restart

# Open in browser
railway open
```

## 📊 Monitoring & Maintenance

### Regular Checks
- [ ] Monitor Railway dashboard for resource usage
- [ ] Check application logs for errors
- [ ] Verify blockchain connectivity
- [ ] Test API endpoints regularly

### Updates
- [ ] Keep dependencies updated
- [ ] Monitor for security patches
- [ ] Update environment variables as needed
- [ ] Test changes in staging first

## 🔗 Useful Links

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Documentation](https://docs.railway.app/)
- [Etherlink Explorer](https://ghostnet.etherlink.com/)
- [Pinata Dashboard](https://app.pinata.cloud/)
- [Yakoa API Documentation](https://docs.yakoa.com/)

## 📞 Support

If you encounter issues:
1. Check Railway logs first
2. Verify all environment variables
3. Test locally to isolate issues
4. Check Railway status page
5. Contact Railway support if needed

---

**✅ Ready for Deployment!** 🚀 