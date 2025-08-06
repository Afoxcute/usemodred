import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import registerRoutes from './routes/register';
import yakoaRoutes from './routes/yakoaRoutes';
import licenseRoutes from './routes/license';
import infringementRoutes from './routes/infringement';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/api/register', registerRoutes);
app.use('/api/yakoa', yakoaRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/infringement', infringementRoutes);

// Health check endpoint for Railway
app.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    message: '✅ ModredIP Backend API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'modredip-backend',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
