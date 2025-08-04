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

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ModredIP Backend API - Test Mode',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Determine port
const PORT = process.env.PORT || process.env.APP_PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
});

export default app; 