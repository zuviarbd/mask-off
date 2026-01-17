/**
 * HighScore Service
 * Manages global high score with jsonbin.io
 * 
 * Strategy:
 * - READ: From local JSON file (no API request needed)
 * - WRITE: Only when player beats global high score (minimize API usage)
 */

const JSONBIN_BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';

/**
 * Create a new bin (only needed once for initial setup)
 * Call this manually if you need to create a new bin
 */
export async function createBin(initialScore = 0) {
    try {
        const response = await fetch(JSONBIN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_API_KEY,
                'X-Bin-Name': 'maskoff-global-highscore'
            },
            body: JSON.stringify({
                globalHighScore: initialScore,
                achievedAt: new Date().toISOString(),
                gameVersion: '1.0.0'
            })
        });
        
        const data = await response.json();
        console.log('📦 Created new bin! ID:', data.metadata.id);
        console.log('Update JSONBIN_BIN_ID in HighScoreService.js with:', data.metadata.id);
        return data.metadata.id;
    } catch (error) {
        console.error('Failed to create bin:', error);
        return null;
    }
}

/**
 * Update global high score
 * - In development: Uses jsonbin.io directly (with VITE_ env vars)
 * - In production (Vercel): Uses serverless function (API key on server)
 */
export async function updateGlobalHighScore(newScore) {
    const isProduction = import.meta.env.PROD;
    
    if (isProduction) {
        // Use serverless function in production (secure)
        try {
            const response = await fetch('/api/update-highscore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: newScore })
            });
            
            if (response.ok) {
                console.log('🏆 Global high score updated to:', newScore);
                return true;
            }
            console.error('Failed to update high score');
            return false;
        } catch (error) {
            console.error('Failed to update global high score:', error);
            return false;
        }
    } else {
        // Use direct API in development
        const binId = import.meta.env.VITE_JSONBIN_BIN_ID;
        const apiKey = import.meta.env.VITE_JSONBIN_API_KEY;
        
        if (!binId || !apiKey) {
            console.error('Missing JSONBIN env vars in development');
            return false;
        }
        
        try {
            const response = await fetch(`${JSONBIN_API_URL}/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': apiKey
                },
                body: JSON.stringify({
                    globalHighScore: newScore,
                    achievedAt: new Date().toISOString(),
                    gameVersion: '1.0.0'
                })
            });
            
            if (response.ok) {
                console.log('🏆 Global high score updated to:', newScore);
                return true;
            }
            console.error('Failed to update:', await response.text());
            return false;
        } catch (error) {
            console.error('Failed to update global high score:', error);
            return false;
        }
    }
}

/**
 * Fetch current global high score from jsonbin.io
 * (Optional - use sparingly to verify/sync)
 */
export async function fetchGlobalHighScore(binId = JSONBIN_BIN_ID) {
    if (!binId) return null;
    
    try {
        const response = await fetch(`${JSONBIN_API_URL}/${binId}/latest`, {
            headers: {
                'X-Access-Key': JSONBIN_API_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.record.globalHighScore;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch global high score:', error);
        return null;
    }
}
