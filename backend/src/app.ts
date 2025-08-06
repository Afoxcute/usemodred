// story/backend/src/app.ts

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import registerRoutes from './routes/register';
import yakoaRoutes from './routes/yakoaRoutes';
import licenseRoutes from './routes/license';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: [
    'https://usemodred.vercel.app',
    'https://usemodred-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// API Routes
app.use('/api/register', registerRoutes);
app.use('/api/yakoa', yakoaRoutes);
app.use('/api/license', licenseRoutes);

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: '✅ Yakoa + Etherlink backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check for load balancers
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
