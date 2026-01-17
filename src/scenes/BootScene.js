/**
 * Boot Scene
 * First scene - sets up basic system config and loads minimal assets for preloader
 */
import Phaser from 'phaser';

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
            const response = await fetch('/data/highscore.json');
            if (response.ok) {
                const data = await response.json();
                this.registry.set('globalHighScore', data.globalHighScore || 0);
            }
        } catch (e) {
            console.log('Could not fetch global high score:', e);
        }
    }
}
