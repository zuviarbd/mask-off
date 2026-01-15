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
        
        this.createSprite();
    }
    
    createSprite() {
        // Try to use the character sprite, fallback to placeholder
        const spriteKey = this.scene.textures.exists(this.type.spriteKey) 
            ? this.type.spriteKey 
            : null;
        
        // If no sprites exist, create a placeholder graphic
        if (!spriteKey) {
            this.createPlaceholderSprite();
            return;
        }
        
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
    
    createPlaceholderSprite() {
        // Create a simple placeholder character using graphics
        const graphics = this.scene.add.graphics();
        
        // Body color based on character type
        const colors = {
            preacher: 0x8b5cf6,
            smiler: 0xf59e0b,
            shouter: 0xef4444,
            vanisher: 0x06b6d4,
            puppet: 0x84cc16,
            boss: 0xe94560
        };
        
        const color = colors[this.type.id] || 0x888888;
        
        // Draw character body
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(-60, -100, 120, 160, 20);
        
        // Draw head
        graphics.fillStyle(0xffd9b3, 1);
        graphics.fillCircle(0, -130, 50);
        
        // Draw mask (white overlay on face)
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillRoundedRect(-35, -160, 70, 50, 10);
        
        // Eyes
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(-15, -140, 6);
        graphics.fillCircle(15, -140, 6);
        
        // Smile
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginPath();
        graphics.arc(0, -130, 20, 0.2, Math.PI - 0.2);
        graphics.stroke();
        
        // Generate texture from graphics
        const key = `placeholder_${this.type.id}_${Date.now()}`;
        graphics.generateTexture(key, 140, 220);
        graphics.destroy();
        
        // Create sprite from generated texture
        this.sprite = this.scene.add.sprite(this.hole.x, this.hole.y + 150, key);
        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', () => this.onClick());
        
        // Store reference for mask overlay
        this.isPlaceholder = true;
        this.placeholderColor = color;
    }
    
    spawn() {
        this.isActive = true;
        this.currentState = 'masked';
        
        // Animate popping up
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.hole.y - 20,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.startStateTimer();
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
        if (this.isPlaceholder) {
            this.showPlaceholderCrack();
        } else if (this.scene.anims.exists(`${this.type.spriteKey}_crack`)) {
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
        
        // Show slip animation
        if (this.isPlaceholder) {
            this.showPlaceholderSlip();
        } else if (this.scene.anims.exists(`${this.type.spriteKey}_slip`)) {
            this.sprite.play(`${this.type.spriteKey}_slip`);
        }
        
        // Show micro-expression icons
        this.showMicroExpressions();
        
        // Calculate slip duration
        const duration = this.difficulty.slipDuration * this.type.slipDurationModifier;
        
        // End slip after duration
        this.scene.time.delayedCall(duration, () => {
            if (!this.isActive || this.currentState !== 'slip') return;
            this.leave();
        });
    }
    
    showPlaceholderCrack() {
        // Add crack lines overlay
        if (this.crackOverlay) this.crackOverlay.destroy();
        
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(3, 0x333333, 1);
        
        // Random crack lines
        graphics.moveTo(-20, -160);
        graphics.lineTo(0, -140);
        graphics.lineTo(20, -155);
        graphics.stroke();
        
        this.crackOverlay = graphics;
        this.crackOverlay.setPosition(this.sprite.x, this.sprite.y - 150);
    }
    
    showPlaceholderSlip() {
        // Change face to show "true nature"
        // Tint the sprite red/angry
        this.sprite.setTint(0xff6666);
        
        // Clean up crack overlay
        if (this.crackOverlay) {
            this.crackOverlay.destroy();
            this.crackOverlay = null;
        }
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
        
        this.scene.onCharacterClicked(this);
    }
    
    defeat() {
        this.currentState = 'hit';
        
        // Play hit animation
        if (!this.isPlaceholder && this.scene.anims.exists(`${this.type.spriteKey}_hit`)) {
            this.sprite.play(`${this.type.spriteKey}_hit`);
        } else {
            // Flash effect for placeholder
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
        if (this.crackOverlay) this.crackOverlay.destroy();
    }
    
    update(time, delta) {
        // Any per-frame updates can go here
        // e.g., subtle idle animations
    }
}
