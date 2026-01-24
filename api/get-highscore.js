/**
 * Vercel Serverless Function - Get High Score
 * Fetches the latest high score from JsonBin
 * 
 * Deploy: This file goes in /api/get-highscore.js
 */

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || process.env.VITE_JSONBIN_BIN_ID;
    const JSONBIN_API_KEY = process.env.JSONBIN_X_ACCESS_KEY || process.env.VITE_JSONBIN_X_Access_Key;

    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
        return res.status(500).json({ error: 'Server configuration missing' });
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Return simply resolution of the record from JsonBin v3 response structure
            // JsonBin v3 structure: { record: { ...data }, metadata: { ... } }
            // But /latest endpoint returns the record directly inside 'record' key
            return res.status(200).json(data.record);
        } else {
            return res.status(500).json({ error: 'Failed to fetch' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
}
