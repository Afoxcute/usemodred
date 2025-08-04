// story/backend/src/app.ts

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import registerRoutes from './routes/register';
import yakoaRoutes from './routes/yakoaRoutes';
import licenseRoutes from './routes/license';

const app = express();
const PORT = process.env.PORT || 5000;

// Secure CORS configuration
const corsOptions = {
  origin: [
    'https://usemodred.vercel.app',  // Production frontend
    'http://localhost:3000',         // Local development
    'https://localhost:3000',        // Secure local development
    'http://localhost:5173',         // Vite default port
    'https://localhost:5173'         // Secure Vite port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/register', registerRoutes);
app.use('/api/yakoa', yakoaRoutes);
app.use('/api/license', licenseRoutes);

// Default route (optional)
app.get('/', (_req, res) => {
  res.send('✅ Yakoa + Etherlink backend is running!');
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

export default app;
