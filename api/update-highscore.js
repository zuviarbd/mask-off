/**
 * Vercel Serverless Function - Update High Score
 * This keeps the API key on the server side, not exposed to clients
 * 
 * Deploy: This file goes in /api/update-highscore.js
 */

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { score, achievedBy } = req.body;
    
    if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Invalid score' });
    }
    
    // API key is safely stored in Vercel environment variables (no VITE_ prefix)
    // Also check VITE_ prefix for local development compatibility
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || process.env.VITE_JSONBIN_BIN_ID;
    const JSONBIN_API_KEY = process.env.JSONBIN_X_ACCESS_KEY || process.env.VITE_JSONBIN_X_Access_Key;
    
    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
        return res.status(500).json({ error: 'Server configuration missing' });
    }
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                globalHighScore: score,
                achievedBy: achievedBy || 'Anonymous',
                achievedAt: new Date().toISOString(),
                gameVersion: '1.0.0'
            })
        });
        
        if (response.ok) {
            return res.status(200).json({ success: true, score });
        } else {
            const error = await response.text();
            return res.status(500).json({ error: 'Failed to update', details: error });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
}
