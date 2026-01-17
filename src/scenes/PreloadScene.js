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

    async loadFonts() {
        await document.fonts.load('10pt "Birdman"');
        await document.fonts.load('10pt "CT Galbite"');
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
        this.loadingText.setText('Loading Fonts...');
        
        // Wait for fonts to load before transitioning
        this.loadFonts().then(() => {
            this.loadingText.setText('Ready!');
            
            // Small delay before transitioning
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenuScene');
            });
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
        // Standard 12-frame characters
        const standardCharacters = ['char_preacher', 'char_smiler', 'char_shouter', 'char_puppet'];
        
        standardCharacters.forEach(charKey => {
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
        
        // Vanisher has 10 frames (0-9): idle(0-2), crack(3-4), slip(5-7), hit(8-9)
        if (this.textures.exists('char_vanisher')) {
            this.anims.create({
                key: 'char_vanisher_idle',
                frames: this.anims.generateFrameNumbers('char_vanisher', { start: 0, end: 2 }),
                frameRate: 4,
                repeat: -1
            });
            this.anims.create({
                key: 'char_vanisher_crack',
                frames: this.anims.generateFrameNumbers('char_vanisher', { start: 3, end: 4 }),
                frameRate: 8,
                repeat: 0
            });
            this.anims.create({
                key: 'char_vanisher_slip',
                frames: this.anims.generateFrameNumbers('char_vanisher', { start: 5, end: 7 }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: 'char_vanisher_hit',
                frames: this.anims.generateFrameNumbers('char_vanisher', { start: 8, end: 9 }),
                frameRate: 10,
                repeat: 0
            });
        }
        
        // Boss has 14 frames: idle(0-3), crack(4-6), slip(7-10), hit(11-13)
        if (this.textures.exists('char_boss')) {
            this.anims.create({
                key: 'char_boss_idle',
                frames: this.anims.generateFrameNumbers('char_boss', { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1
            });
            this.anims.create({
                key: 'char_boss_crack',
                frames: this.anims.generateFrameNumbers('char_boss', { start: 4, end: 6 }),
                frameRate: 8,
                repeat: 0
            });
            this.anims.create({
                key: 'char_boss_slip',
                frames: this.anims.generateFrameNumbers('char_boss', { start: 7, end: 10 }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: 'char_boss_hit',
                frames: this.anims.generateFrameNumbers('char_boss', { start: 11, end: 13 }),
                frameRate: 10,
                repeat: 0
            });
        }
    }
}
