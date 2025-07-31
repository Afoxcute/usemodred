/**
 * Yakoa API Proxy Server
 * 
 * This proxy server handles CORS issues when calling Yakoa's API
 * from browser-based applications.
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['https://usemodred.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY']
}));

app.use(express.json());

// Yakoa API configuration
const YAKOA_API_BASE_URL = 'https://docs-demo.ip-api-sandbox.yakoa.io/docs-demo';
const YAKOA_API_KEY = 'UAY1k44Ew29rncTD9ik4j97DBmKHi0B59Fkm3G2x';

// Proxy endpoint for Yakoa token registration
app.post('/api/yakoa/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);

    const response = await fetch(`${YAKOA_API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': YAKOA_API_KEY
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('Yakoa API response:', data);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Yakoa API error: ${response.status}`,
        details: data
      });
    }

    res.json({
      success: true,
      token_id: data.token_id,
      registration_status: data.registration_status || 'registered',
      details: data.details || 'IP asset successfully registered with Yakoa'
    });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Yakoa proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Yakoa proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Registration endpoint: http://localhost:${PORT}/api/yakoa/register`);
}); 