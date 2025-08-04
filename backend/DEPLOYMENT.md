# Railway Deployment Troubleshooting Guide

## Common Issues and Solutions

### 502 Bad Gateway Error

**Symptoms:**
- Application fails to start
- Railway shows 502 error
- No response from application

**Solutions:**

1. **Check Build Process**
   ```bash
   # Test build locally
   yarn build
   ```

2. **Verify Dependencies**
   ```bash
   # Install dependencies
   yarn install
   ```

3. **Test Startup**
   ```bash
   # Test basic startup
   yarn test:startup
   ```

4. **Check Environment Variables**
   - Ensure all required env vars are set in Railway
   - Check for missing API keys
   - Verify contract addresses

### Environment Variables Required

```env
# Server
PORT=3000
NODE_ENV=production

# Blockchain
NETWORK_RPC_URL=https://evm.ezyblockchain.com
CHAIN_ID=128123

# Yakoa
YAKOA_API_KEY=your_key
YAKOA_SUBDOMAIN=docs-demo
YAKOA_NETWORK=docs-demo

# IPFS
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
PINATA_JWT=your_jwt
```

### Debugging Steps

1. **Check Railway Logs**
   - Go to Railway dashboard
   - View deployment logs
   - Look for error messages

2. **Test Locally**
   ```bash
   # Test with production settings
   NODE_ENV=production yarn start
   ```

3. **Verify Health Endpoint**
   ```bash
   curl https://your-app.railway.app/health
   ```

4. **Check Build Output**
   ```bash
   # Verify dist folder exists
   ls -la dist/
   ```

### Common Fixes

1. **Missing Dependencies**
   - Add missing packages to package.json
   - Run `yarn install` again

2. **TypeScript Errors**
   - Fix type errors in source code
   - Ensure all imports are correct

3. **Environment Issues**
   - Set all required environment variables
   - Check for typos in variable names

4. **Port Issues**
   - Ensure PORT is set correctly
   - Check for port conflicts

### Health Check Endpoints

- **Health**: `GET /health`
- **Root**: `GET /`
- **API Status**: `GET /api/register` (503 if not loaded)

### Monitoring

1. **Railway Dashboard**
   - Monitor deployment status
   - Check resource usage
   - View logs

2. **Application Logs**
   - Check console output
   - Look for error messages
   - Monitor startup sequence

### Emergency Fallback

If the main application fails to start, the server will:
1. Start with basic endpoints
2. Return 503 for API routes
3. Provide health check endpoint
4. Log detailed error information

### Support

For persistent issues:
1. Check Railway documentation
2. Review application logs
3. Test with minimal configuration
4. Contact support with specific error messages 