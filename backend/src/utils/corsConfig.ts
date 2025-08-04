import { CorsOptions } from 'cors';
import { getCorsOrigins, isDevelopment } from './config';

/**
 * Get CORS configuration based on environment
 */
export function getCorsConfig(): CorsOptions {
  const allowedOrigins = getCorsOrigins();

  if (isDevelopment) {
    // Allow all origins in development
    return {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      optionsSuccessStatus: 200
    };
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
  };
}

/**
 * Get simplified CORS config for specific domains
 */
export function getSimpleCorsConfig(): CorsOptions {
  return {
    origin: [
      'https://usemodred.vercel.app',
      'https://usemodred.vercel.app/',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
  };
} 