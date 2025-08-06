# 🚂 Railway Deployment Guide for ModredIP Backend

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your backend code should be in a GitHub repository
3. **Environment Variables**: Prepare your environment variables

## 🚀 Deployment Steps

### 1. Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` directory as the source

### 2. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```bash
# Required Environment Variables
PORT=5000
NODE_ENV=production

# Etherlink Network Configuration
ETHERLINK_RPC_URL=https://node.ghostnet.tezos.com
ETHERLINK_CHAIN_ID=128123
ETHERLINK_EXPLORER_URL=https://testnet-explorer.etherlink.com

# Private Key for Contract Interactions (Keep Secure!)
PRIVATE_KEY=your_private_key_here

# Yakoa API Configuration
YAKOA_API_KEY=your_yakoa_api_key_here
YAKOA_BASE_URL=https://api.yakoa.com

# IPFS Configuration (Pinata)
PINATA_JWT=your_pinata_jwt_here
PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Contract Addresses (Auto-populated from deployment)
MODRED_IP_CONTRACT_ADDRESS=your_contract_address_here
ERC6551_REGISTRY_ADDRESS=your_registry_address_here
ERC6551_ACCOUNT_ADDRESS=your_account_address_here

# Optional: CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Optional: Logging
LOG_LEVEL=info
```

### 3. Deploy

1. Railway will automatically detect the Node.js project
2. It will run `npm install` and `npm run build`
3. The app will start using `npm start`
4. Railway will provide a public URL for your API

### 4. Verify Deployment

Test your deployment:

```bash
# Health check
curl https://your-railway-url.railway.app/health

# API endpoints
curl https://your-railway-url.railway.app/
```

## 🔧 Configuration Files

### package.json
- `start`: Runs the compiled JavaScript
- `build`: Compiles TypeScript to JavaScript
- `postinstall`: Automatically builds after npm install

### railway.json
- Specifies NIXPACKS builder
- Configures health checks
- Sets restart policies

### Procfile
- Tells Railway to run `npm start`

## 📊 Monitoring

### Health Check Endpoint
- **URL**: `/health`
- **Response**: JSON with status, timestamp, and environment info

### Logs
- View logs in Railway dashboard
- Real-time log streaming available

### Metrics
- Railway provides built-in monitoring
- CPU, memory, and network usage

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **Private Keys**: Use Railway's secure environment variables
3. **CORS**: Configure properly for production
4. **Rate Limiting**: Consider adding rate limiting middleware

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are in `dependencies` (not `devDependencies`)

2. **Runtime Errors**
   - Check environment variables are set correctly
   - Verify contract addresses are correct
   - Check API keys are valid

3. **CORS Issues**
   - Set `CORS_ORIGIN` to your frontend domain
   - Or use `*` for development

### Debug Commands

```bash
# Check build locally
npm run build

# Test locally
npm run dev

# Check environment variables
echo $PORT
echo $NODE_ENV
```

## 🔄 Updates

To update your deployment:

1. Push changes to your GitHub repository
2. Railway will automatically redeploy
3. Monitor the deployment logs
4. Verify the health check endpoint

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Project Issues**: Check your repository issues

---

**🎉 Your ModredIP Backend is now ready for Railway deployment!** 