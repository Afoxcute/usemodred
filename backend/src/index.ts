import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import routes
import registerRoutes from './routes/registerRoutes';
import licenseRoutes from './routes/licenseRoutes';
import infringementRoutes from './routes/infringementRoutes';

// Configure dotenv
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/register', registerRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/infringement', infringementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Determine port
const PORT = process.env.PORT || process.env.APP_PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
