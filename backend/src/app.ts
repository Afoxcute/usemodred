// story/backend/src/app.ts

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import registerRoutes from './routes/register';
import yakoaRoutes from './routes/yakoaRoutes';
import licenseRoutes from './routes/license';
import { getCorsConfig } from './utils/corsConfig';
import { validateConfig } from './utils/config';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(getCorsConfig()));
app.use(bodyParser.json());

// Debug middleware for CORS issues
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// API Routes
app.use('/api/register', registerRoutes);
app.use('/api/yakoa', yakoaRoutes);
app.use('/api/license', licenseRoutes);

// Health check route
app.get('/', (_req, res) => {
  res.json({
    message: '✅ Yakoa + Etherlink backend is running!',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: [
        'https://usemodred.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
      ]
    }
  });
});

// CORS test endpoint
app.get('/api/cors-test', (_req, res) => {
  res.json({
    message: 'CORS is working correctly!',
    timestamp: new Date().toISOString()
  });
});

// Validate configuration
validateConfig();

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for origins: ${getCorsConfig().origin}`);
});
