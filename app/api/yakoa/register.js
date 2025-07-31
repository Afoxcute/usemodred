/**
 * Vercel Serverless Function for Yakoa API Proxy
 * 
 * This handles CORS issues when calling Yakoa's API from the frontend
 */

const YAKOA_API_BASE_URL = 'https://docs-demo.ip-api-sandbox.yakoa.io/docs-demo';
const YAKOA_API_KEY = 'UAY1k44Ew29rncTD9ik4j97DBmKHi0B59Fkm3G2x';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-KEY');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
} 