/**
 * Game Over Scene
 * Display results, ratings, and share functionality
 */
import Phaser from 'phaser';
import { RATINGS } from '../config/GameConfig.js';

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
        this.add.text(centerX, 100, this.isNewHighScore ? '🎉 NEW HIGH SCORE! 🎉' : 'GAME OVER', {
            fontFamily: 'Arial Black, Arial',
            fontSize: this.isNewHighScore ? '36px' : '48px',
            color: this.isNewHighScore ? '#ffd700' : '#e94560',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Score
        this.add.text(centerX, 180, `Score: ${this.finalScore}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '42px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Rating
        const rating = this.getRating();
        this.createRatingDisplay(centerX, 280, rating);
        
        // Stats breakdown
        this.createStatsBreakdown(centerX, 450);
        
        // Buttons
        this.createButtons(centerX, height - 200);
        
        // Fact mode disclaimer
        this.add.text(centerX, height - 50, '"Always verify before believing."', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // Play victory music if high score
        if (this.isNewHighScore && this.cache.audio.exists('music_victory')) {
            this.sound.play('music_victory', { volume: 0.5 });
        }
    }
    
    createBackground(width, height) {
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
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
        
        // Emoji
        const emoji = this.add.text(0, -30, rating.emoji, {
            fontSize: '64px'
        }).setOrigin(0.5);
        
        // Rating name
        const name = this.add.text(0, 40, rating.name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: rating.color
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
            { label: 'Frauds Exposed', value: this.correctHits },
            { label: 'Sentiment Traps Hit', value: this.wrongHits },
            { label: 'Best Combo', value: this.maxCombo },
            { label: 'Bosses Defeated', value: this.bossesDefeated },
            { label: 'Accuracy', value: `${Math.round(this.accuracy * 100)}%` }
        ];
        
        const lineHeight = 40;
        const startY = y - ((stats.length - 1) * lineHeight) / 2;
        
        stats.forEach((stat, index) => {
            const statY = startY + index * lineHeight;
            
            // Label
            this.add.text(x - 150, statY, stat.label, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#aaaaaa'
            }).setOrigin(0, 0.5);
            
            // Value
            this.add.text(x + 150, statY, stat.value.toString(), {
                fontFamily: 'Arial Black, Arial',
                fontSize: '24px',
                color: '#ffffff'
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
        const button = this.add.rectangle(x, y, 280, 50, 0xe94560)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setFillStyle(0xff6b85);
            })
            .on('pointerout', () => {
                button.setFillStyle(0xe94560);
            })
            .on('pointerdown', () => {
                this.playButtonSound();
                callback();
            });
        
        this.add.text(x, y, text, {
            fontFamily: 'Arial',
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
