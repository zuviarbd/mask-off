/**
 * Game Over Scene
 * Display results, ratings, and share functionality
 */
import Phaser from 'phaser';
import { RATINGS, GAME_CONFIG } from '../config/GameConfig.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.correctHits = data.correctHits || 0;
        this.wrongHits = data.wrongHits || 0;
        this.maxCombo = data.maxCombo || 0;
        this.accuracy = data.accuracy || 0;
        this.bossesDefeated = data.bossesDefeated || 0;
        this.isNewHighScore = data.isNewHighScore || false;
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        
        // Fade in
        this.cameras.main.fadeIn(500);
        
        // Background
        this.createBackground(width, height);
        
        // Title
        this.add.text(centerX, 100, this.isNewHighScore ? '🎉 NEW HIGH SCORE! 🎉' : 'GAME OVER!', {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: this.isNewHighScore ? '36px' : '48px',
            color: this.isNewHighScore ? '#ffd700' : '#FFFF00',
            stroke: '#003F15',
            strokeThickness: 4
        }).setOrigin(0.5);
        // Score
        this.add.text(centerX, 180, `YOUR SCORE`, {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '36px',
            color: '#000000ff'
        }).setOrigin(0.5);
        this.add.text(centerX, 230, `${this.finalScore}`, {
            fontFamily: GAME_CONFIG.FONTS.numbers,
            fontSize: '60px',
            color: '#ff0000ff'
        }).setOrigin(0.5);
        
        // Rating
        const rating = this.getRating();
        this.createRatingDisplay(centerX, 400, rating);
        
        // Stats breakdown
        this.createStatsBreakdown(centerX, 600);
        
        // Buttons
        this.createButtons(centerX, height - 400);
        
        // Fact mode disclaimer
        this.add.text(centerX, height - 50, '"বিশ্বাস করার আগে যাচাই করুন।"', {
            fontFamily: GAME_CONFIG.FONTS.bangla,
            fontSize: '28px',
            color: '#003F15ff',
            fontStyle: 'italic',
            padding: { top: 8, bottom: 8 },
        }).setOrigin(0.5);
        
        // Play victory music if high score
        if (this.isNewHighScore && this.cache.audio.exists('music_victory')) {
            this.sound.play('music_victory', { volume: 0.5 });
        }
    }
    
    createBackground(width, height) {
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(
            0xC3E3C0, 0xC3E3C0,
            0x74C47A, 0x74C47A,
            1
        );
        graphics.fillRect(0, 0, width, height);
    }
    
    getRating() {
        // Find appropriate rating based on accuracy
        for (const key of ['hypocrisyHunter', 'criticalThinker', 'curious', 'blindBeliever']) {
            const rating = RATINGS[key];
            if (this.accuracy >= rating.minAccuracy && this.accuracy < rating.maxAccuracy) {
                return rating;
            }
            if (this.accuracy >= rating.maxAccuracy && key === 'hypocrisyHunter') {
                return rating;
            }
        }
        return RATINGS.blindBeliever;
    }
    
    createRatingDisplay(x, y, rating) {
        // Rating container with animation
        const container = this.add.container(x, y);
        
        // Emoji - padding prevents clipping
        const emoji = this.add.text(0, -30, rating.emoji, {
            fontSize: '50px',
            padding: { top: 10, bottom: 10 },
        }).setOrigin(0.5);
        
        // Rating name - padding prevents Bangla font clipping
        const name = this.add.text(0, 40, rating.name, {
            fontFamily: GAME_CONFIG.FONTS.bangla,
            fontSize: '32px',
            color: rating.color,
            padding: { top: 8, bottom: 8 },
        }).setOrigin(0.5);
        
        container.add([emoji, name]);
        
        // Bounce animation
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut',
            delay: 300
        });
        
        // Pulsing glow effect
        this.tweens.add({
            targets: emoji,
            scale: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createStatsBreakdown(x, y) {
        const stats = [
            { label: 'Chagu Exposed', value: this.correctHits },
            { label: 'Wrong Hit', value: this.wrongHits },
            { label: 'Best Combo', value: this.maxCombo },
            { label: 'Boss Defeated', value: this.bossesDefeated },
            { label: 'Accuracy', value: `${Math.round(this.accuracy * 100)}%` }
        ];
        
        const lineHeight = 40;
        const startY = y - ((stats.length - 1) * lineHeight) / 2;
        
        stats.forEach((stat, index) => {
            const statY = startY + index * lineHeight;
            
            // Label
            this.add.text(x - 150, statY, stat.label, {
                fontFamily: GAME_CONFIG.FONTS.primary,
                fontSize: '20px',
                color: '#0f380fff'
            }).setOrigin(0, 0.5);
            
            // Value
            this.add.text(x + 150, statY, stat.value.toString(), {
                fontFamily: GAME_CONFIG.FONTS.numbers,
                fontSize: '28px',
                color: '#0f380fff'
            }).setOrigin(1, 0.5);
        });
    }
    
    createButtons(x, y) {
        const buttonSpacing = 70;
        
        // Play Again
        this.createButton(x, y, '🔁  Play Again', () => {
            this.scene.start('GameScene');
        });
        
        // Main Menu
        this.createButton(x, y + buttonSpacing, '🏠  Main Menu', () => {
            this.scene.start('MainMenuScene');
        });
        
        // Share (if supported)
        this.createButton(x, y + buttonSpacing * 2, '📊  Share Result', () => {
            this.shareResult();
        });
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 280, 50, 0x003F15)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setFillStyle(0x084C08);
            })
            .on('pointerout', () => {
                button.setFillStyle(0x003F15);
            })
            .on('pointerdown', () => {
                this.playButtonSound();
                callback();
            });
        
        this.add.text(x, y, text, {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
    
    shareResult() {
        const rating = this.getRating();
        const shareText = `🎭 Mask Off: The Hypocrisy Hunter\n\n` +
            `Score: ${this.finalScore}\n` +
            `Rating: ${rating.emoji} ${rating.name}\n` +
            `Accuracy: ${Math.round(this.accuracy * 100)}%\n\n` +
            `Can you spot the hypocrites? Play now!`;
        
        // Try Web Share API first
        if (navigator.share) {
            navigator.share({
                title: 'Mask Off: The Hypocrisy Hunter',
                text: shareText
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    this.showCopiedMessage();
                })
                .catch(console.error);
        }
    }
    
    showCopiedMessage() {
        const { width, height } = this.cameras.main;
        const message = this.add.text(width / 2, height / 2, 'Copied to clipboard!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 50,
            duration: 1500,
            onComplete: () => message.destroy()
        });
    }
    
    playButtonSound() {
        if (!this.registry.get('soundEnabled')) return;
        
        if (this.cache.audio.exists('sfx_button')) {
            this.sound.play('sfx_button', { volume: 0.5 });
        }
    }
}
