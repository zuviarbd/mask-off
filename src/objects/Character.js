/**
 * Character Class
 * Represents a pop-up character with mask/slip states
 */
import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class Character {
    constructor(scene, hole, type, difficulty) {
        this.scene = scene;
        this.hole = hole;
        this.type = type;
        this.difficulty = difficulty;
        
        this.isActive = false;
        this.currentState = 'hidden'; // hidden, masked, cracking, slip, hit, leaving
        this.willSlip = false;
        this.bossHits = 0;
        this.startedUnmasked = false; // For 40% of spawns that start unmasked
        this.wrongHitBlocked = false; // Prevents repeated wrong hits on same character
        this.hitSuccessfully = false; // Prevents clicks after a successful hit
        
        this.createSprite();
    }
    
    createSprite() {
        const spriteKey = this.type.spriteKey;
        
        // Position character below the hole (will animate up)
        this.sprite = this.scene.add.sprite(this.hole.x, this.hole.y + 150, spriteKey);
        this.sprite.setScale(0.8);
        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', () => this.onClick());
        
        // Characters render above holes (depth 1) but below stamps (depth 50)
        this.sprite.setDepth(10);
        
        // Apply mask so character is clipped at the hole edge
        if (this.hole.mask) {
            this.sprite.setMask(this.hole.mask);
        }
    }
    
    spawn() {
        this.isActive = true;
        
        // Determine starting state based on startedUnmasked flag
        if (this.startedUnmasked) {
            this.currentState = 'slip';
        } else {
            this.currentState = 'masked';
        }
        
        // Animate popping up
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.hole.y - 40,
            duration: 150,
            ease: 'Back.easeOut',
            onComplete: () => {
                if (this.startedUnmasked) {
                    // Already unmasked - show slip state and start timer
                    this.showSlipState();
                    this.startSlipTimer();
                } else {
                    this.startStateTimer();
                }
            }
        });
        
        // Play popup sound
        this.scene.playSound('sfx_popup');
        
        // Shouter audio bait
        if (this.type.hasAudioBait) {
            this.scene.time.delayedCall(100, () => {
                // Could play a distinctive shout sound here
            });
        }
    }
    
    startStateTimer() {
        // Calculate mask duration
        const baseDuration = Phaser.Math.Between(
            this.difficulty.maskDuration.min,
            this.difficulty.maskDuration.max
        );
        const duration = baseDuration * this.type.maskDurationModifier;
        
        // Apply blind faith mode extension
        const finalDuration = this.scene.isBlindFaithMode 
            ? duration * GAME_CONFIG.antiSpam.maskDurationIncrease 
            : duration;
        
        this.scene.time.delayedCall(finalDuration, () => {
            if (!this.isActive || this.currentState !== 'masked') return;
            
            if (this.willSlip) {
                this.startSlip();
            } else {
                this.leave();
            }
        });
    }
    
    startSlip() {
        this.currentState = 'cracking';
        
        // Show mask cracking animation
        if (this.scene.anims.exists(`${this.type.spriteKey}_crack`)) {
            this.sprite.play(`${this.type.spriteKey}_crack`);
        }
        
        // Play crack sound
        this.scene.playSound('sfx_mask_crack');
        
        // Transition to full slip after brief crack
        this.scene.time.delayedCall(150, () => {
            if (!this.isActive) return;
            this.revealSlip();
        });
    }
    
    revealSlip() {
        this.currentState = 'slip';
        
        // Show slip state
        this.showSlipState();
        
        // Show micro-expression icons
        this.showMicroExpressions();
        
        // Start slip timer
        this.startSlipTimer();
    }
    
    showSlipState() {
        // Show slip animation
        if (this.scene.anims.exists(`${this.type.spriteKey}_slip`)) {
            this.sprite.play(`${this.type.spriteKey}_slip`);
        }
        // No fallback tint - animations should exist for all characters
    }
    
    startSlipTimer() {
        // Calculate slip duration
        const duration = this.difficulty.slipDuration * this.type.slipDurationModifier;
        
        // End slip after duration
        this.scene.time.delayedCall(duration, () => {
            if (!this.isActive || this.currentState !== 'slip') return;
            this.leave();
        });
    }
    
    showMicroExpressions() {
        // Show floating icons (coin, crown, etc.)
        const icons = ['💰', '👑', '🗳️'];
        const icon = Phaser.Utils.Array.GetRandom(icons);
        
        const iconText = this.scene.add.text(
            this.sprite.x + Phaser.Math.Between(-30, 30),
            this.sprite.y - 80,
            icon,
            { fontSize: '32px' }
        ).setOrigin(0.5);
        
        // Float up and fade
        this.scene.tweens.add({
            targets: iconText,
            y: iconText.y - 50,
            alpha: 0,
            duration: 400,
            onComplete: () => iconText.destroy()
        });
    }
    
    onClick() {
        if (!this.isActive || this.currentState === 'hidden' || this.currentState === 'hit') return;
        
        // Check if wrong hit blocking is active or already hit successfully
        if (this.wrongHitBlocked || this.hitSuccessfully) return;
        
        this.scene.onCharacterClicked(this);
    }
    
    defeat() {
        this.currentState = 'hit';
        
        // Play hit animation
        if (this.scene.anims.exists(`${this.type.spriteKey}_hit`)) {
            this.sprite.play(`${this.type.spriteKey}_hit`);
        } else {
            // Flash effect fallback
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 50,
                yoyo: true,
                repeat: 3
            });
        }
        
        // Fall down animation
        this.scene.time.delayedCall(300, () => {
            this.leave();
        });
    }
    
    takeDamage() {
        // Boss taking damage but not defeated
        this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
        
        // Show damage indicator
        const damageText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 100,
            `${this.bossHits}/${this.difficulty.bossHitsRequired}`,
            {
                fontFamily: 'Arial Black',
                fontSize: '24px',
                color: '#ff4444',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 500,
            onComplete: () => damageText.destroy()
        });
    }
    
    leave() {
        this.currentState = 'leaving';
        
        // Notify scene of missed slip opportunity
        if (this.willSlip && this.currentState !== 'hit') {
            this.scene.onCharacterMissed(this);
        }
        
        // Animate going back down
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.hole.y + 150,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.destroy();
            }
        });
    }
    
    destroy() {
        this.isActive = false;
        this.hole.isOccupied = false;
        this.hole.character = null;
        
        if (this.sprite) this.sprite.destroy();
    }
    
    update(time, delta) {
        // Any per-frame updates can go here
        // e.g., subtle idle animations
    }
}
