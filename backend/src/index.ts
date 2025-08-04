import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ModredIP Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      register: '/api/register',
      license: '/api/license',
      infringement: '/api/infringement'
    }
  });
});

// Try to load routes with error handling
try {
  // Import routes
  const registerRoutes = require('./routes/register').default;
  const licenseRoutes = require('./routes/license').default;
  const infringementRoutes = require('./routes/infringement').default;

  // Routes
  app.use('/api/register', registerRoutes);
  app.use('/api/license', licenseRoutes);
  app.use('/api/infringement', infringementRoutes);

  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('⚠️ Error loading routes:', error);
  
  // Add fallback endpoints
  app.use('/api/register', (req, res) => {
    res.status(503).json({
      error: 'Registration service temporarily unavailable',
      message: 'Routes are being loaded'
    });
  });

  app.use('/api/license', (req, res) => {
    res.status(503).json({
      error: 'License service temporarily unavailable',
      message: 'Routes are being loaded'
    });
  });

  app.use('/api/infringement', (req, res) => {
    res.status(503).json({
      error: 'Infringement service temporarily unavailable',
      message: 'Routes are being loaded'
    });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Determine port
const PORT = process.env.PORT || process.env.APP_PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
});

export default app;
