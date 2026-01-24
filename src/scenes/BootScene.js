/**
 * Boot Scene
 * First scene - sets up basic system config and loads minimal assets for preloader
 */
import Phaser from 'phaser';
import { fetchGlobalHighScore } from '../services/HighScoreService.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load only what's needed for the preloader UI
        // Everything else loads in PreloadScene
    }

    create() {
        // Set up any global game systems here
        
        // Initialize game registry for global state
        this.registry.set('score', 0);
        this.registry.set('highScore', this.getHighScore());
        this.registry.set('globalHighScore', 0);
        this.registry.set('globalHighScoreHolder', '');
        this.registry.set('difficulty', 'normal');
        this.registry.set('soundEnabled', true);
        this.registry.set('musicEnabled', true);
        
        // Fetch global high score from JSON file
        this.fetchGlobalHighScore();
        
        // Move to the preload scene
        this.scene.start('PreloadScene');
    }
    
    getHighScore() {
        try {
            return parseInt(localStorage.getItem('maskoff_highscore') || '0', 10);
        } catch (e) {
            return 0;
        }
    }
    
    async fetchGlobalHighScore() {
        try {
            // Always fetch fresh data on game load to ensure we have the latest record
            // forceRefresh=true bypasses localStorage cache
            const data = await fetchGlobalHighScore(true);
            if (data) {
                this.registry.set('globalHighScore', data.score || 0);
                this.registry.set('globalHighScoreHolder', data.achievedBy || '');
            }
        } catch (e) {
            // Silent fail - cache/fallback will be used
        }
    }
}
