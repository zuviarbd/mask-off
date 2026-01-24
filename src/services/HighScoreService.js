/**
 * HighScore Service
 * Manages global high score with jsonbin.io
 * 
 * Strategy:
 * - READ: From local JSON file (no API request needed)
 * - WRITE: Only when player beats global high score (minimize API usage)
 */

const JSONBIN_BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_X_Access_Key;
const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';

// LocalStorage cache key
const CACHE_KEY = 'maskoff_global_highscore_cache';

// Only warn about missing API key in development
// In production, serverless functions handle API calls securely
if (!JSONBIN_API_KEY && import.meta.env.DEV) {
    console.error('[HighScoreService] No API Key found in .env file!');
}

/**
 * Get cached high score from localStorage
 * @returns {Object|null} Cached data or null
 */
function getCachedHighScore() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn('[HighScoreService] Failed to read cache:', e);
    }
    return null;
}

/**
 * Save high score to localStorage cache
 * @param {Object} data - { score, achievedBy, achievedAt }
 */
function setCachedHighScore(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('[HighScoreService] Failed to write cache:', e);
    }
}

/**
 * Invalidate the localStorage cache
 */
function invalidateCache() {
    try {
        localStorage.removeItem(CACHE_KEY);
    } catch (e) {
        console.warn('[HighScoreService] Failed to invalidate cache:', e);
    }
}

/**
 * Create a new bin (only needed once for initial setup)
 * Call this manually if you need to create a new bin
 */
/**
 * Create a new bin (only needed once for initial setup)
 * Call this manually if you need to create a new bin
 */
export async function createBin(initialScore = 0, initialName = 'Anonymous') {
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
                achievedBy: initialName,
                achievedAt: new Date().toISOString(),
                gameVersion: '1.0.0'
            })
        });
        
        const data = await response.json();
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
export async function updateGlobalHighScore(newScore, playerName = 'Anonymous') {
    const isProduction = import.meta.env.PROD;
    
    if (isProduction) {
        // Use serverless function in production (secure)
        try {
            const response = await fetch('/api/update-highscore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    score: newScore,
                    achievedBy: playerName
                })
            });
            
            if (response.ok) {
                // Update cache with new record
                setCachedHighScore({
                    score: newScore,
                    achievedBy: playerName,
                    achievedAt: new Date().toISOString()
                });
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
        const apiKey = import.meta.env.VITE_JSONBIN_X_Access_Key;
        
        if (!binId || !apiKey) {
            console.error('Missing JSONBIN env vars in development');
            return false;
        }

        // Use API key directly - Vite handles .env parsing correctly
        
        try {
            const response = await fetch(`${JSONBIN_API_URL}/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': apiKey
                },
                body: JSON.stringify({
                    globalHighScore: newScore,
                    achievedBy: playerName,
                    achievedAt: new Date().toISOString(),
                    gameVersion: '1.0.0'
                })
            });
            
            if (response.ok) {
                // Update cache with new record
                setCachedHighScore({
                    score: newScore,
                    achievedBy: playerName,
                    achievedAt: new Date().toISOString()
                });
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
 * Uses localStorage cache to minimize API calls
 * @param {boolean} forceRefresh - If true, skip cache and fetch fresh data
 * @returns {Object|null} { score, achievedBy } or null
 */
export async function fetchGlobalHighScore(forceRefresh = false) {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
        const cached = getCachedHighScore();
        if (cached) {
            return cached;
        }
    }
    
    const isProduction = import.meta.env.PROD;
    let result = null;

    // Production: Use serverless function to hide API key
    if (isProduction) {
        try {
            const response = await fetch('/api/get-highscore');
            
            if (response.ok) {
                const data = await response.json();
                result = {
                    score: data.globalHighScore,
                    achievedBy: data.achievedBy || ''
                };
            }
        } catch (error) {
            console.error('Failed to fetch from /api/get-highscore:', error);
        }
    } else if (JSONBIN_BIN_ID) {
        // Development: Direct API call
        try {
            const response = await fetch(`${JSONBIN_API_URL}/${JSONBIN_BIN_ID}/latest`, {
                headers: {
                    'X-Access-Key': JSONBIN_API_KEY
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                result = {
                    score: data.record.globalHighScore,
                    achievedBy: data.record.achievedBy || ''
                };
            }
        } catch (error) {
            console.error('Failed to fetch global high score from bin:', error);
        }
    }
    
    // Cache the result if successful
    if (result) {
        setCachedHighScore(result);
        return result;
    }
    
    console.error('Failed to fetch global high score from all sources');
    return null;
}
