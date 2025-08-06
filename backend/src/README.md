# ModredIP Backend API

A comprehensive backend API for the ModredIP platform, providing IP management services on the Etherlink blockchain with ERC-6551 token standard support.

## 🚀 Railway Deployment

This backend is configured for Railway deployment with automatic builds and deployments.

### Quick Deploy

1. **Connect to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Link to your Railway project
   railway link
   ```

2. **Deploy to Railway**
   ```bash
   railway up
   ```

3. **Set Environment Variables**
   - Go to your Railway project dashboard
   - Navigate to "Variables" tab
   - Add all required environment variables (see `ENVIRONMENT.md`)

### Manual Deployment

1. **Fork/Clone this repository**
2. **Connect to Railway project**
3. **Set environment variables**
4. **Deploy**

## 🏗️ Architecture

### Core Components

- **Express.js Server**: RESTful API endpoints
- **Etherlink Integration**: Blockchain interactions via Viem
- **Yakoa Integration**: IP infringement monitoring
- **IPFS Integration**: Decentralized storage via Pinata
- **TypeScript**: Type-safe development

### API Endpoints

- `POST /api/register` - Register IP assets
- `POST /api/license/mint` - Mint license tokens
- `GET /api/health` - Health check
- `GET /` - Root endpoint

## 🔧 Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run yakoa` - Test Yakoa integration

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `viem` - Ethereum client for Etherlink
- `axios` - HTTP client
- `@openzeppelin/contracts` - Smart contract utilities

### Development Dependencies
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `@types/express` - Express type definitions
- `@types/cors` - CORS type definitions
- `@types/node` - Node.js type definitions

## 🔐 Environment Variables

See `ENVIRONMENT.md` for complete list of required environment variables.

### Required Variables
- `PORT` - Server port (default: 5000)
- `PRIVATE_KEY` - Etherlink private key
- `YAKOA_API_KEY` - Yakoa API key
- `PINATA_JWT` - Pinata IPFS JWT token

## 🚀 Railway Configuration

### Build Process
1. Railway detects Node.js project
2. Runs `npm install`
3. Executes `npm run postinstall` (builds TypeScript)
4. Starts with `npm start`

### Health Checks
- Endpoint: `/`
- Timeout: 300 seconds
- Restart policy: On failure

### Scaling
- Automatic scaling based on traffic
- Horizontal scaling support
- Load balancing enabled

## 📊 Monitoring

### Railway Dashboard
- Real-time logs
- Performance metrics
- Error tracking
- Deployment history

### Health Monitoring
- Automatic health checks
- Uptime monitoring
- Performance alerts

## 🔄 CI/CD

### Automatic Deployments
- Deploy on push to main branch
- Automatic rollback on failure
- Environment-specific deployments

### Manual Deployments
```bash
# Deploy to production
railway up --service production

# Deploy to staging
railway up --service staging
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation errors
   - Verify all dependencies are installed
   - Ensure proper Node.js version

2. **Runtime Errors**
   - Check environment variables
   - Verify blockchain connectivity
   - Review API key configurations

3. **Performance Issues**
   - Monitor Railway metrics
   - Check database connections
   - Review external API calls

### Logs
```bash
# View Railway logs
railway logs

# View specific service logs
railway logs --service backend
```

## 📈 Performance

### Optimization
- TypeScript compilation for production
- Efficient dependency management
- Optimized build process
- Caching strategies

### Monitoring
- Response time tracking
- Error rate monitoring
- Resource utilization
- External API performance

## 🔒 Security

### Best Practices
- Environment variable management
- API key rotation
- CORS configuration
- Input validation
- Rate limiting

### Railway Security
- Automatic HTTPS
- Secret management
- Network isolation
- Access controls

## 📞 Support

For deployment issues:
1. Check Railway documentation
2. Review environment variables
3. Check build logs
4. Contact Railway support

For application issues:
1. Review application logs
2. Check API responses
3. Verify blockchain connectivity
4. Test external integrations

---

**Ready for Railway deployment! 🚀**
