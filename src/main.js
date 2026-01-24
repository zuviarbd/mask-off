/**
 * Mask Off: The Hypocrisy Hunter
 * Main entry point
 */
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { InstructionScene } from './scenes/InstructionScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 720,
        height: 1280,
        min: {
            width: 360,
            height: 640
        },
        max: {
            width: 1080,
            height: 1920
        }
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        InstructionScene,
        GameScene,
        GameOverScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    audio: {
        disableWebAudio: false
    },
    render: {
        pixelArt: false,
        antialias: true
    },
    dom: {
        createContainer: true
    }
};

// Hide loading screen once Phaser is ready
const hideLoading = () => {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
};

// Start the game
window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
    game.events.once('ready', hideLoading);
    
    // Expose game instance for debugging (remove in production)
    if (import.meta.env.DEV) {
        window.game = game;
    }
});
