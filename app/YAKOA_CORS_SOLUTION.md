# Yakoa API CORS Solution

## Problem
The Yakoa API doesn't support CORS (Cross-Origin Resource Sharing) for browser-based applications, causing the error:
```
Access to fetch at 'https://docs-demo.ip-api-sandbox.yakoa.io/docs-demo/token' from origin 'https://usemodred.vercel.app' has been blocked by CORS policy
```

## Solution

### Option 1: Use the Proxy Server (Recommended)

1. **Deploy the proxy server** to handle CORS issues:

```bash
# Navigate to the app directory
cd app

# Install proxy server dependencies
npm install --prefix . express cors node-fetch

# Start the proxy server
node yakoa-proxy.js
```

2. **Set the proxy URL** in your environment variables:
```bash
VITE_YAKOA_PROXY_URL=http://localhost:3001
```

3. **Deploy the proxy server** to a hosting service like:
   - Vercel (create a new project for the proxy)
   - Railway
   - Heroku
   - DigitalOcean

### Option 2: Mock Response (Development)

The service automatically falls back to a mock response when the API is unavailable. This allows development and testing to continue while the CORS issue is resolved.

### Option 3: Backend Integration

For production, integrate the Yakoa API calls into your backend server instead of calling from the frontend.

## Proxy Server Features

- **CORS Support**: Handles cross-origin requests
- **Error Handling**: Graceful error handling and logging
- **Health Check**: `/api/health` endpoint for monitoring
- **Flexible Configuration**: Environment variable support

## Usage

The Yakoa service will automatically try:
1. **Proxy server** (if available)
2. **Direct API call** (may fail due to CORS)
3. **Mock response** (fallback for development)

## Environment Variables

```bash
# Proxy server URL (optional)
VITE_YAKOA_PROXY_URL=http://localhost:3001

# Yakoa API key (already configured)
YAKOA_API_KEY=UAY1k44Ew29rncTD9ik4j97DBmKHi0B59Fkm3G2x
```

## Deployment

### Local Development
```bash
# Start the proxy server
cd app
node yakoa-proxy.js

# In another terminal, start the frontend
cd app
npm run dev
```

### Production Deployment
1. Deploy the proxy server to a hosting service
2. Set the `VITE_YAKOA_PROXY_URL` environment variable
3. Deploy the frontend application

## Testing

The mock response will show:
- ✅ Success message with mock Yakoa Token ID
- 📝 Clear indication that it's a mock response
- 🔄 Automatic fallback when API is unavailable

This ensures the application continues to work while the CORS issue is being resolved. 