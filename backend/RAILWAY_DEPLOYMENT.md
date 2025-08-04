# Railway Deployment Guide for ModredIP Backend

## 🚀 Quick Deploy to Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your backend code
- Environment variables configured

### Step 1: Connect to Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 2: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Etherlink Testnet Configuration
ETHERLINK_RPC_URL=https://node.ghostnet.tezos.marigold.dev
ETHERLINK_CHAIN_ID=128123
ETHERLINK_BLOCK_EXPLORER_URL=https://testnet-explorer.etherlink.com

# Private Key for Contract Interactions
PRIVATE_KEY=your_private_key_here

# Yakoa API Configuration
YAKOA_API_KEY=your_yakoa_api_key_here
YAKOA_REGISTER_TOKEN_URL=https://api.yakoa.com/docs-demo/token

# Platform Fee Configuration
PLATFORM_FEE_COLLECTOR=0x0000000000000000000000000000000000000000

# Contract Addresses (update after deployment)
MODRED_IP_CONTRACT_ADDRESS=0x0734d90FA1857C073c4bf1e57f4F4151BE2e9f82
ERC6551_REGISTRY_ADDRESS=your_registry_address
ERC6551_ACCOUNT_ADDRESS=your_account_address

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Logging Configuration
LOG_LEVEL=info
```

### Step 3: Deploy
1. Railway will automatically detect the Node.js project
2. It will use the `railway.json` configuration
3. Build process will run automatically
4. Your app will be deployed to a Railway URL

### Step 4: Update Frontend
Update your frontend's `BACKEND_URL` to point to your Railway deployment:

```typescript
// In your frontend App.tsx
const BACKEND_URL = 'https://your-railway-app.railway.app';
```

## 🔧 Configuration Files

### railway.json
- Specifies build and deployment settings
- Configures health checks
- Sets restart policies

### nixpacks.toml
- Defines build phases
- Specifies Node.js and Yarn installation
- Configures build and start commands

### Dockerfile (Alternative)
- Container-based deployment option
- Uses Node.js 18 Alpine for smaller image
- Includes all necessary build steps

## 📊 Monitoring

### Health Checks
- `/` - Main health check endpoint
- `/health` - Railway-specific health check

### Logs
- View logs in Railway dashboard
- Real-time log streaming available
- Error tracking and monitoring

## 🔒 Security Considerations

### Environment Variables
- Never commit private keys to Git
- Use Railway's secure environment variable storage
- Rotate keys regularly

### CORS Configuration
- Set `CORS_ORIGIN` to your frontend domain
- Avoid using `*` in production
- Configure proper CORS headers

### Rate Limiting
- Consider adding rate limiting middleware
- Monitor API usage
- Set appropriate limits

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are in package.json
   - Ensure tsconfig.json is properly configured

2. **Runtime Errors**
   - Check environment variables are set
   - Verify contract addresses are correct
   - Monitor logs for detailed error messages

3. **CORS Issues**
   - Verify CORS_ORIGIN is set correctly
   - Check frontend URL matches CORS configuration
   - Test with Postman or curl

### Debug Commands
```bash
# Check build locally
yarn build

# Test production build
yarn start

# Check TypeScript compilation
npx tsc --noEmit
```

## 📈 Scaling

### Railway Auto-Scaling
- Railway automatically scales based on traffic
- No manual configuration needed
- Pay-per-use pricing model

### Performance Optimization
- Enable compression middleware
- Implement caching strategies
- Monitor response times

## 🔄 CI/CD Integration

### GitHub Actions (Optional)
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: railway/cli@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📞 Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: Create GitHub issue

## 🎯 Next Steps

1. Deploy to Railway
2. Update frontend backend URL
3. Test all API endpoints
4. Monitor performance and logs
5. Set up monitoring and alerts 