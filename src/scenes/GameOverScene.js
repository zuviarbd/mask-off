/**
 * Game Over Scene
 * Display results, ratings, and share functionality
 */
import Phaser from 'phaser';
import { RATINGS, GAME_CONFIG } from '../config/GameConfig.js';
import { updateGlobalHighScore } from '../services/HighScoreService.js';

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
        this.isNewGlobalRecord = data.isNewGlobalRecord || false;
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
        this.createRatingDisplay(centerX, 350, rating);
        
        // Stats breakdown
        this.createStatsBreakdown(centerX, 520);
        
        // Buttons
        // If Global Record, ask for name first
        if (this.isNewGlobalRecord) {
            this.createNameInput(centerX, 780);
        } else {
            this.createButtons(centerX, 750);
        }
        
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
        // Get high score for comparison (use personal or global, whichever is higher)
        const personalHighScore = this.registry.get('highScore') || 0;
        const globalHighScore = this.registry.get('globalHighScore') || 0;
        const referenceHighScore = Math.max(personalHighScore, globalHighScore, 1); // Min 1 to avoid division by zero
        
        // Calculate score percentage (capped at 100%)
        const scorePercent = Math.min(this.finalScore / referenceHighScore, 1);
        
        // Check tiers from highest to lowest - must meet BOTH thresholds
        const tiers = ['hypocrisyHunter', 'criticalThinker', 'curious', 'blindBeliever'];
        
        for (const key of tiers) {
            const rating = RATINGS[key];
            const meetsAccuracy = this.accuracy >= rating.minAccuracy;
            const meetsScore = scorePercent >= rating.minScorePercent;
            
            if (meetsAccuracy && meetsScore) {
                return rating;
            }
        }
        
        // Fallback (should never reach here due to blindBeliever having 0/0 thresholds)
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
            { label: 'Correct Hit', value: this.correctHits },
            { label: 'Wrong Hit', value: this.wrongHits },
            { label: 'Best Combo', value: this.maxCombo },
            { label: 'Monster Hit', value: this.bossesDefeated },
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
        const buttonSpacing = 60;
        
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
        
        // External Link - জাশির সেকাল একাল
        this.createButton(x, y + buttonSpacing * 3, '📚  জাশির সেকাল একাল', () => {
            window.open('https://jamatshibir.com', '_blank');
        }, GAME_CONFIG.FONTS.bangla);
    }
    
    createButton(x, y, text, callback, fontFamily = GAME_CONFIG.FONTS.primary) {
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
            fontFamily: fontFamily,
            fontSize: '20px',
            color: '#ffffff',
            padding: { top: 4, bottom: 4 }
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
    createNameInput(x, y) {
        // Create an HTML input form
        const element = this.add.dom(x, y).createFromHTML(`
            <div style="background-color: rgba(0,0,0,0.85); padding: 20px; border-radius: 15px; text-align: center; border: 2px solid #ffd700;">
                <h3 style="color: #ffd700; margin: 0 0 15px 0; font-family: sans-serif;">🏆 NEW WORLD RECORD!</h3>
                <input type="text" name="nameField" placeholder="Your Name" maxlength="12" style="font-size: 24px; padding: 10px; width: 220px; text-align: center; border-radius: 8px; border: none; outline: none;">
                <br><br>
                <button name="submitBtn" style="font-size: 20px; font-weight: bold; padding: 10px 30px; cursor: pointer; background-color: #00ff00; border: none; border-radius: 8px; color: #003F15;">SUBMIT RECORD</button>
            </div>
        `);
        
        element.addListener('click');
        
        element.on('click', async (event) => {
            if (event.target.name === 'submitBtn') {
                const input = element.getChildByName('nameField');
                const name = input.value.trim();
                
                if (name.length > 0) {
                    // Disable input
                    input.disabled = true;
                    event.target.textContent = 'SENDING...';
                    event.target.style.backgroundColor = '#cccccc';
                    
                    // Send to server
                    const success = await updateGlobalHighScore(this.finalScore, name);
                    
                    if (success) {
                        // Update registry
                        this.registry.set('globalHighScore', this.finalScore);
                        this.registry.set('globalHighScoreHolder', name);
                        
                        // Show success
                        element.destroy();
                        this.showSubmissionSuccess(x, y, name);
                    } else {
                        // Show error
                        event.target.textContent = 'RETRY';
                        event.target.style.backgroundColor = '#ff0000';
                        input.disabled = false;
                    }
                }
            }
        });
        
        this.tweens.add({
            targets: element,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    showSubmissionSuccess(x, y, name) {
        this.add.text(x, y, `High Score Recorded!\n${name}`, {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '24px',
            color: '#00ff00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Show normal buttons after delay
        this.time.delayedCall(1500, () => {
             this.createButtons(this.cameras.main.width / 2, 900);
        });
    }
}
