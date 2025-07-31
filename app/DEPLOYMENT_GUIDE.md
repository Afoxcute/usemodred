# 🚀 Production Deployment Guide

## **Option 1: Vercel Deployment (Recommended)**

### **Step 1: Prepare the Application**

1. **Build the application locally first:**
```bash
cd app
npm install
npm run build
```

2. **Verify the build works:**
```bash
npm run preview
```

### **Step 2: Deploy to Vercel**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy the application:**
```bash
cd app
vercel --prod
```

4. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add environment variable: `VITE_YAKOA_PROXY_URL` = `/api/yakoa/register`

### **Step 3: Configure Domain (Optional)**
- In Vercel dashboard, go to Settings → Domains
- Add your custom domain

---

## **Option 2: Railway Deployment**

### **Step 1: Prepare for Railway**

1. **Create `railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Deploy to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## **Option 3: Netlify Deployment**

### **Step 1: Create `netlify.toml`:**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Step 2: Deploy to Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## **Option 4: Traditional Hosting (Apache/Nginx)**

### **Step 1: Build the Application**
```bash
cd app
npm install
npm run build
```

### **Step 2: Upload to Server**
- Upload the `dist` folder to your web server
- Configure your web server to serve static files

### **Step 3: Configure Server**
- Set up reverse proxy for API calls
- Configure CORS headers
- Set up SSL certificates

---

## **🔧 Environment Configuration**

### **Required Environment Variables**

```bash
# Yakoa Proxy URL (for production)
VITE_YAKOA_PROXY_URL=/api/yakoa/register

# Pinata JWT (already hardcoded in the app)
# VITE_PINATA_JWT=your_jwt_here

# Etherlink Network
VITE_CHAIN_ID=128123
```

### **Optional Environment Variables**

```bash
# Custom API endpoints
VITE_RPC_URL=https://node.ghostnet.etherlink.com
VITE_EXPLORER_URL=https://testnet.explorer.etherlink.com

# IPFS Gateway
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud
```

---

## **📋 Pre-Deployment Checklist**

### **✅ Application Ready**
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] All dependencies installed

### **✅ Smart Contracts Deployed**
- [ ] ModredIP contract deployed to Etherlink testnet
- [ ] Contract addresses updated in `deployed_addresses.json`
- [ ] Contract verified on Etherlink explorer

### **✅ Environment Variables**
- [ ] Yakoa proxy URL configured
- [ ] Network configuration set
- [ ] API keys secured

### **✅ Domain & SSL**
- [ ] Custom domain configured (optional)
- [ ] SSL certificate installed
- [ ] HTTPS redirects configured

---

## **🚀 Deployment Commands**

### **Vercel (Recommended)**
```bash
# Quick deploy
cd app
vercel --prod

# With custom domain
vercel --prod --name your-app-name
```

### **Manual Build & Deploy**
```bash
# Build
cd app
npm run build

# Test locally
npm run preview

# Deploy to your preferred platform
```

---

## **🔍 Post-Deployment Verification**

### **1. Test Core Functionality**
- [ ] Wallet connection works
- [ ] IP asset registration works
- [ ] File upload to IPFS works
- [ ] License minting works
- [ ] Revenue payment works
- [ ] Yakoa registration works

### **2. Test Network Features**
- [ ] Contract interactions work
- [ ] Transaction confirmations
- [ ] Error handling
- [ ] Loading states

### **3. Performance Check**
- [ ] Page load times
- [ ] API response times
- [ ] File upload speeds
- [ ] Mobile responsiveness

---

## **🛠️ Troubleshooting**

### **Common Issues**

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **CORS Issues**
   - Ensure Yakoa proxy is configured
   - Check environment variables
   - Verify API endpoints

3. **Contract Connection Issues**
   - Verify contract addresses
   - Check network configuration
   - Ensure wallet is connected to correct network

4. **File Upload Issues**
   - Check Pinata JWT token
   - Verify file size limits
   - Test with different file types

---

## **📊 Monitoring & Analytics**

### **Vercel Analytics**
- Built-in performance monitoring
- Real-time error tracking
- User analytics

### **Custom Monitoring**
```javascript
// Add to your app for custom tracking
console.log('User action:', action);
```

---

## **🔒 Security Considerations**

### **Environment Variables**
- Never commit API keys to git
- Use environment variables for sensitive data
- Rotate keys regularly

### **HTTPS Only**
- Force HTTPS redirects
- Use secure cookies
- Implement CSP headers

### **API Security**
- Rate limiting on proxy endpoints
- Input validation
- Error message sanitization

---

## **📈 Performance Optimization**

### **Build Optimization**
```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
# Use WebP format
# Implement lazy loading
```

### **Caching Strategy**
- Static assets caching
- API response caching
- Browser caching headers

---

## **🎯 Success Metrics**

### **Technical Metrics**
- Page load time < 3 seconds
- API response time < 500ms
- 99.9% uptime
- Zero critical errors

### **User Metrics**
- Successful IP registrations
- License minting success rate
- Revenue payment completion
- User engagement time

---

## **📞 Support**

If you encounter issues during deployment:

1. **Check the logs** in your hosting platform
2. **Verify environment variables** are set correctly
3. **Test locally** before deploying
4. **Review the troubleshooting section** above

---

## **🎉 Deployment Complete!**

Once deployed, your ModredIP application will be available at your chosen URL with full functionality including:

- ✅ IP asset registration
- ✅ License management
- ✅ Revenue tracking
- ✅ Yakoa integration
- ✅ Mobile-responsive design
- ✅ Production-ready security

**Congratulations! Your ModredIP application is now live in production! 🚀** 