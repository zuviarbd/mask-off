/**
 * HUD Class
 * Handles all UI elements during gameplay
 */
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        
        this.create();
    }
    
    create() {
        const { width } = this.scene.cameras.main;
        
        // Top bar background
        this.elements.topBar = this.scene.add.rectangle(width / 2, 60, width, 120, 0x000000, 0.5);
        
        // Score display
        this.elements.scoreLabel = this.scene.add.text(width / 2, 40, 'SCORE', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
        
        this.elements.scoreText = this.scene.add.text(width / 2, 70, '0', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Timer display
        this.elements.timerIcon = this.scene.add.text(width - 80, 35, '⏱️', {
            fontSize: '24px'
        }).setOrigin(0.5);
        
        this.elements.timerText = this.scene.add.text(width - 80, 70, GAME_CONFIG.roundDuration.toString(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Combo meter
        this.elements.comboContainer = this.scene.add.container(80, 55);
        
        this.elements.comboLabel = this.scene.add.text(0, -15, 'COMBO', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5);
        
        this.elements.comboText = this.scene.add.text(0, 15, '0', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#e94560'
        }).setOrigin(0.5);
        
        this.elements.comboContainer.add([this.elements.comboLabel, this.elements.comboText]);
        
        // Multiplier display (shows when combo > 0)
        this.elements.multiplierText = this.scene.add.text(80, 95, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffd700'
        }).setOrigin(0.5).setAlpha(0);
        
        // Blind faith mode warning (hidden by default)
        this.elements.blindFaithWarning = this.scene.add.container(width / 2, 150);
        
        const warningBg = this.scene.add.rectangle(0, 0, 300, 40, 0xff0000, 0.8);
        const warningText = this.scene.add.text(0, 0, '⚠️ BLIND FAITH MODE ⚠️', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.elements.blindFaithWarning.add([warningBg, warningText]);
        this.elements.blindFaithWarning.setAlpha(0);
        
        // Pause menu (hidden by default)
        this.createPauseMenu();
    }
    
    updateScore(score) {
        this.elements.scoreText.setText(score.toString());
        
        // Pop animation
        this.scene.tweens.add({
            targets: this.elements.scoreText,
            scale: 1.2,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }
    
    updateTimer(seconds) {
        this.elements.timerText.setText(seconds.toString());
        
        // Color change at low time
        if (seconds <= 10) {
            this.elements.timerText.setColor('#ff4444');
            
            // Pulse effect
            this.scene.tweens.add({
                targets: this.elements.timerText,
                scale: 1.2,
                duration: 200,
                yoyo: true
            });
        } else if (seconds <= 30) {
            this.elements.timerText.setColor('#ffaa00');
        }
    }
    
    updateCombo(combo) {
        this.elements.comboText.setText(combo.toString());
        
        if (combo > 0) {
            // Show combo with animation
            this.scene.tweens.add({
                targets: this.elements.comboText,
                scale: 1.3,
                duration: 100,
                yoyo: true
            });
            
            // Show multiplier
            const multiplier = this.getMultiplier(combo);
            if (multiplier > 1) {
                this.elements.multiplierText.setText(`×${multiplier.toFixed(1)}`);
                this.elements.multiplierText.setAlpha(1);
            }
            
            // Color based on combo level
            if (combo >= 10) {
                this.elements.comboText.setColor('#ffd700');
            } else if (combo >= 6) {
                this.elements.comboText.setColor('#ff6b85');
            } else {
                this.elements.comboText.setColor('#e94560');
            }
        } else {
            // Reset combo display
            this.elements.comboText.setColor('#e94560');
            this.elements.multiplierText.setAlpha(0);
        }
    }
    
    getMultiplier(combo) {
        const { multipliers, thresholds } = GAME_CONFIG.combo;
        
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (combo >= thresholds[i]) {
                return multipliers[i];
            }
        }
        return 1;
    }
    
    showPoints(x, y, points) {
        const text = this.scene.add.text(x, y, `+${points}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '28px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: text,
            y: y - 60,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeOut',
            onComplete: () => text.destroy()
        });
    }
    
    showText(x, y, message, color = '#ffffff') {
        const text = this.scene.add.text(x, y, message, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: text,
            y: y - 40,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => text.destroy()
        });
    }
    
    showBlindFaithWarning() {
        // Show warning
        this.scene.tweens.add({
            targets: this.elements.blindFaithWarning,
            alpha: 1,
            duration: 200
        });
        
        // Pulse animation
        this.scene.tweens.add({
            targets: this.elements.blindFaithWarning,
            scale: 1.1,
            duration: 300,
            yoyo: true,
            repeat: 5
        });
        
        // Hide after duration
        this.scene.time.delayedCall(GAME_CONFIG.antiSpam.penaltyDuration, () => {
            this.scene.tweens.add({
                targets: this.elements.blindFaithWarning,
                alpha: 0,
                duration: 300
            });
        });
    }
    
    createPauseMenu() {
        const { width, height } = this.scene.cameras.main;
        
        this.elements.pauseMenu = this.scene.add.container(width / 2, height / 2);
        
        // Overlay
        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        
        // Pause text
        const pauseTitle = this.scene.add.text(0, -100, 'PAUSED', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Resume button
        const resumeBtn = this.scene.add.rectangle(0, 0, 200, 50, 0xe94560)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.scene.togglePause());
        
        const resumeText = this.scene.add.text(0, 0, 'RESUME', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Quit button
        const quitBtn = this.scene.add.rectangle(0, 70, 200, 50, 0x444444)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.sound.stopAll();
                this.scene.scene.start('MainMenuScene');
            });
        
        const quitText = this.scene.add.text(0, 70, 'QUIT', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.elements.pauseMenu.add([overlay, pauseTitle, resumeBtn, resumeText, quitBtn, quitText]);
        this.elements.pauseMenu.setVisible(false);
        this.elements.pauseMenu.setDepth(1000);
    }
    
    showPauseMenu() {
        this.elements.pauseMenu.setVisible(true);
    }
    
    hidePauseMenu() {
        this.elements.pauseMenu.setVisible(false);
    }
}
