// src/routes/yakoaRoutes.ts
import express from 'express';
import axios from 'axios';

const router = express.Router();

const YAKOA_API_KEY = process.env.YAKOA_API_KEY!;

const BASE_URL = 'https://docs-demo.ip-api-sandbox.yakoa.io/docs-demo/token';

// GET /api/yakoa/status/:id
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const yakoaApiUrl = `https://docs-demo.ip-api-sandbox.yakoa.io/docs-demo/token/${encodeURIComponent(id)}`;

    console.log("Fetching Yakoa status from:", yakoaApiUrl);

    const response = await axios.get(yakoaApiUrl, {
      headers: {
        'X-API-KEY': process.env.YAKOA_API_KEY || 'your-api-key',
      },
    });
    console.log("Yakoa response:", response.data);

    res.json(response.data);
  } catch (error: any) {
    console.error('❌ Error fetching Yakoa status:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch infringement status' });
  }
});


export default router;
