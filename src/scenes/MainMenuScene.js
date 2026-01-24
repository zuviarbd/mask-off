/**
 * Main Menu Scene
 * Title screen with difficulty selection and settings
 */
import Phaser from 'phaser';
import { DIFFICULTY_LEVELS, GAME_CONFIG } from '../config/GameConfig.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        
        // Background
        if (this.textures.exists('ui_background')) {
            this.add.image(centerX, height / 2, 'ui_background');
        } else {
            this.createPlaceholderBackground(width, height);
        }
        
        // Logo or Title
        if (this.textures.exists('ui_logo')) {
            this.add.image(centerX, 680, 'ui_logo');
        } else {
            this.createPlaceholderTitle(centerX);
        }
        
        // High Score display
        this.add.text(centerX, 200, `- YOUR HIGH SCORE -`, {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        const highScore = this.registry.get('highScore') || 0;
        this.add.text(centerX, 235, `${highScore}`, {
            fontFamily: GAME_CONFIG.FONTS.numbers,
            fontSize: '42px',
            color: '#ffff00'
        }).setOrigin(0.5);
        
        // Global High Score display
        const globalHighScore = this.registry.get('globalHighScore') || 0;
        this.add.text(centerX, 290, `- GLOBAL RECORD -`, {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '16px',
            color: '#dedede'
        }).setOrigin(0.5);
        this.add.text(centerX, 320, `${globalHighScore}`, {
            fontFamily: GAME_CONFIG.FONTS.numbers,
            fontSize: '36px',
            color: '#00ffff'
        }).setOrigin(0.5);

        
        // Difficulty buttons
        this.createDifficultyButtons(centerX, 940);
        
        // Settings buttons (sound/music toggles)
        this.createSettingsButtons(centerX, height - 100);
        
        // Instructions
        // Tap the hypocrites when their face changes!
        this.add.text(centerX, 820, 'মুনাফিকের আসল চেহারা দেখামাত্র', {
            fontFamily: GAME_CONFIG.FONTS.bangla,
            fontSize: '28px',
            color: '#fbff00ff',
            stroke: '#000000',
            strokeThickness: 6,
            padding: { top: 8, bottom: 8 },
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(centerX, 860, 'টাচ করে গর্তে ঢুকান!', {
            fontFamily: GAME_CONFIG.FONTS.bangla,
            fontSize: '28px',
            color: '#fbff00ff',
            stroke: '#000000',
            strokeThickness: 6,
            padding: { top: 8, bottom: 8 },
            align: 'center'
        }).setOrigin(0.5);
        
        // Play menu music
        this.playMenuMusic();
    }
    
    createPlaceholderBackground(width, height) {
        // Gradient-like background with rectangles
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, width, height);
        
        // Add some decorative elements
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const alpha = Phaser.Math.FloatBetween(0.05, 0.15);
            graphics.fillStyle(0xe94560, alpha);
            graphics.fillCircle(x, y, Phaser.Math.Between(20, 80));
        }
    }
    
    createPlaceholderTitle(centerX) {
        // Main title
        const title = this.add.text(centerX, 150, 'MASK OFF', {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '64px',
            color: '#e94560',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(centerX, 230, 'The Hypocrisy Hunter', {
            fontFamily: GAME_CONFIG.FONTS.secondary,
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // Add pulsing animation to title
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createDifficultyButtons(centerX, startY) {
        const difficulties = Object.keys(DIFFICULTY_LEVELS);
        const buttonSpacing = 80;
        
        difficulties.forEach((diffKey, index) => {
            const diff = DIFFICULTY_LEVELS[diffKey];
            const y = startY + (index * buttonSpacing);
            
            this.createButton(
                centerX,
                y,
                diff.name.toUpperCase(),
                () => this.startGame(diffKey)
            );
        });
    }
    
    createButton(x, y, text, callback) {
        // Button background
        const button = this.add.rectangle(x, y, 300, 60, 0x003F15)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setFillStyle(0x084C08);
                this.tweens.add({
                    targets: button,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
            })
            .on('pointerout', () => {
                button.setFillStyle(0x003F15);
                this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            })
            .on('pointerdown', () => {
                this.playButtonSound();
                callback();
            });
        
        // Button text
        this.add.text(x, y, text, {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        return button;
    }
    
    createSettingsButtons(centerX, y) {
        const soundEnabled = this.registry.get('soundEnabled');
        const musicEnabled = this.registry.get('musicEnabled');
        
        // Sound toggle
        this.soundBtn = this.createToggleButton(
            centerX - 80,
            y,
            soundEnabled ? '🔊' : '🔇',
            () => this.toggleSound()
        );
        
        // Music toggle  
        this.musicBtn = this.createToggleButton(
            centerX + 80,
            y,
            musicEnabled ? '🎵' : '🎵',
            () => this.toggleMusic()
        );
    }
    
    createToggleButton(x, y, emoji, callback) {
        const button = this.add.text(x, y, emoji, {
            fontSize: '40px'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', callback);
        
        return button;
    }
    
    toggleSound() {
        const current = this.registry.get('soundEnabled');
        this.registry.set('soundEnabled', !current);
        this.soundBtn.setText(!current ? '🔊' : '🔇');
    }
    
    toggleMusic() {
        const current = this.registry.get('musicEnabled');
        this.registry.set('musicEnabled', !current);
        this.musicBtn.setText(!current ? '🎵' : '❌');
        
        if (!current) {
            this.playMenuMusic();
        } else {
            this.stopMenuMusic();
        }
    }
    
    playMenuMusic() {
        if (!this.registry.get('musicEnabled')) return;
        
        if (this.sound.get('music_menu')) {
            this.menuMusic = this.sound.play('music_menu', { loop: true, volume: 0.5 });
        }
    }
    
    stopMenuMusic() {
        if (this.menuMusic) {
            this.sound.stopByKey('music_menu');
        }
    }
    
    playButtonSound() {
        if (!this.registry.get('soundEnabled')) return;
        
        if (this.sound.get('sfx_button')) {
            this.sound.play('sfx_button', { volume: 0.5 });
        }
    }
    
    startGame(difficulty) {
        this.stopMenuMusic();
        this.registry.set('difficulty', difficulty);
        
        // Transition effect
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('InstructionScene');
        });
    }
}
