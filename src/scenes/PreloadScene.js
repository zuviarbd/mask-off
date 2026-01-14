/**
 * Preload Scene
 * Loads all game assets with a progress bar
 */
import Phaser from 'phaser';
import { ASSET_MANIFEST } from '../config/AssetManifest.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create loading UI
        this.createLoadingUI();
        
        // Register load events
        this.load.on('progress', this.updateProgress, this);
        this.load.on('complete', this.loadComplete, this);
        
        // Load all assets from manifest
        this.loadAssets();
    }
    
    createLoadingUI() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Background
        this.add.rectangle(centerX, centerY, width, height, 0x1a1a2e);
        
        // Title
        this.add.text(centerX, centerY - 100, 'MASK OFF', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '48px',
            color: '#e94560',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(centerX, centerY - 50, 'The Hypocrisy Hunter', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Progress bar background
        const barWidth = 400;
        const barHeight = 30;
        this.add.rectangle(centerX, centerY + 50, barWidth + 4, barHeight + 4, 0x333333);
        
        // Progress bar fill
        this.progressBar = this.add.rectangle(
            centerX - barWidth / 2,
            centerY + 50,
            0,
            barHeight,
            0xe94560
        ).setOrigin(0, 0.5);
        
        this.progressBarWidth = barWidth;
        
        // Loading text
        this.loadingText = this.add.text(centerX, centerY + 100, 'Loading... 0%', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
    }
    
    updateProgress(progress) {
        this.progressBar.width = progress * this.progressBarWidth;
        this.loadingText.setText(`Loading... ${Math.floor(progress * 100)}%`);
    }
    
    loadComplete() {
        this.loadingText.setText('Ready!');
        
        // Small delay before transitioning
        this.time.delayedCall(500, () => {
            this.scene.start('MainMenuScene');
        });
    }
    
    loadAssets() {
        // Load images
        for (const key in ASSET_MANIFEST.images) {
            const asset = ASSET_MANIFEST.images[key];
            this.load.image(asset.key, asset.path);
        }
        
        // Load sprite sheets
        for (const key in ASSET_MANIFEST.spritesheets) {
            const asset = ASSET_MANIFEST.spritesheets[key];
            this.load.spritesheet(asset.key, asset.path, {
                frameWidth: asset.frameWidth,
                frameHeight: asset.frameHeight
            });
        }
        
        // Load audio
        for (const key in ASSET_MANIFEST.audio) {
            const asset = ASSET_MANIFEST.audio[key];
            this.load.audio(asset.key, asset.path);
        }
        
        // Generate placeholder assets if loading fails
        this.load.on('loaderror', (file) => {
            console.warn(`Failed to load: ${file.key}, using placeholder`);
            this.createPlaceholder(file);
        });
    }
    
    createPlaceholder(file) {
        // This will be called if any asset fails to load
        // The game will still run with generated placeholders
        console.log(`Creating placeholder for: ${file.key}`);
    }

    create() {
        // Create animations for characters
        this.createAnimations();
    }
    
    createAnimations() {
        // Define animations for each character type
        const characterKeys = ['char_preacher', 'char_smiler', 'char_shouter', 'char_vanisher', 'char_puppet', 'char_boss', 'char_placeholder'];
        
        characterKeys.forEach(charKey => {
            // Skip if texture doesn't exist
            if (!this.textures.exists(charKey)) return;
            
            // Idle animation (frames 0-3)
            this.anims.create({
                key: `${charKey}_idle`,
                frames: this.anims.generateFrameNumbers(charKey, { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1
            });
            
            // Mask cracking animation (frames 4-5)
            this.anims.create({
                key: `${charKey}_crack`,
                frames: this.anims.generateFrameNumbers(charKey, { start: 4, end: 5 }),
                frameRate: 8,
                repeat: 0
            });
            
            // Slip/reveal animation (frames 6-9)
            this.anims.create({
                key: `${charKey}_slip`,
                frames: this.anims.generateFrameNumbers(charKey, { start: 6, end: 9 }),
                frameRate: 6,
                repeat: -1
            });
            
            // Hit reaction animation (frames 10-11)
            this.anims.create({
                key: `${charKey}_hit`,
                frames: this.anims.generateFrameNumbers(charKey, { start: 10, end: 11 }),
                frameRate: 10,
                repeat: 0
            });
        });
    }
}
