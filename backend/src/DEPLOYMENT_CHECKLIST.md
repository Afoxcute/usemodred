# 🚀 Railway Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] TypeScript compilation works (`npm run build`)
- [ ] All dependencies are in `package.json`
- [ ] Environment variables documented in `ENVIRONMENT.md`
- [ ] Health check endpoints configured
- [ ] CORS settings configured
- [ ] Error handling implemented

### ✅ Railway Setup
- [ ] Railway CLI installed (`npm install -g @railway/cli`)
- [ ] Logged in to Railway (`railway login`)
- [ ] Project created in Railway dashboard
- [ ] Repository connected to Railway project

### ✅ Environment Variables
- [ ] `PORT` - Server port (Railway sets this automatically)
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PRIVATE_KEY` - Etherlink private key
- [ ] `ETHERLINK_RPC_URL` - Blockchain RPC endpoint
- [ ] `ETHERLINK_CHAIN_ID` - Chain ID (128123 for testnet)
- [ ] `YAKOA_API_KEY` - Yakoa API key
- [ ] `PINATA_JWT` - Pinata IPFS JWT token
- [ ] `CORS_ORIGIN` - Frontend domain

### ✅ Contract Addresses
- [ ] `MODRED_IP_CONTRACT_ADDRESS` - Deployed contract address
- [ ] `ERC6551_REGISTRY_ADDRESS` - Registry contract address
- [ ] `ERC6551_ACCOUNT_IMPLEMENTATION_ADDRESS` - Account implementation

## Deployment Steps

### 1. Initial Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link
```

### 2. Set Environment Variables
1. Go to Railway dashboard
2. Navigate to your project
3. Go to "Variables" tab
4. Add all required environment variables
5. Save changes

### 3. Deploy
```bash
# Deploy to Railway
railway up

# Or use the deployment script
chmod +x deploy.sh
./deploy.sh
```

### 4. Verify Deployment
1. Check Railway dashboard for deployment status
2. Visit the deployed URL
3. Test health check endpoint: `https://your-app.railway.app/health`
4. Test API endpoints

## Post-Deployment Verification

### ✅ Health Checks
- [ ] Root endpoint returns healthy status
- [ ] Health endpoint responds correctly
- [ ] No build errors in Railway logs

### ✅ API Testing
- [ ] `/api/register` endpoint accessible
- [ ] `/api/license/mint` endpoint accessible
- [ ] CORS headers properly set
- [ ] Error responses formatted correctly

### ✅ External Integrations
- [ ] Etherlink blockchain connectivity
- [ ] Yakoa API integration
- [ ] IPFS (Pinata) integration
- [ ] All API keys working

### ✅ Monitoring
- [ ] Railway logs accessible
- [ ] Performance metrics visible
- [ ] Error tracking enabled
- [ ] Uptime monitoring active

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation
   - Verify all dependencies installed
   - Review Railway build logs

2. **Runtime Errors**
   - Check environment variables
   - Verify API keys
   - Review application logs

3. **Connection Issues**
   - Test blockchain connectivity
   - Verify external API endpoints
   - Check CORS configuration

### Useful Commands
```bash
# View Railway logs
railway logs

# Check deployment status
railway status

# Redeploy
railway up

# View environment variables
railway variables
```

## Security Checklist

### ✅ Environment Security
- [ ] No sensitive data in code
- [ ] Environment variables properly set
- [ ] API keys rotated regularly
- [ ] Private keys secured

### ✅ Network Security
- [ ] HTTPS enabled (automatic with Railway)
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation active

### ✅ Monitoring
- [ ] Error logging enabled
- [ ] Performance monitoring active
- [ ] Security alerts configured
- [ ] Backup procedures in place

## Performance Optimization

### ✅ Build Optimization
- [ ] TypeScript compilation optimized
- [ ] Dependencies minimized
- [ ] Bundle size optimized
- [ ] Caching strategies implemented

### ✅ Runtime Optimization
- [ ] Database connections pooled
- [ ] External API calls optimized
- [ ] Memory usage monitored
- [ ] Response times tracked

---

**🎉 Ready for production deployment!** 