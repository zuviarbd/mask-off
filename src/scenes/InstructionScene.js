/**
 * Instruction Scene
 * Shows game instructions and character profiles
 */
import Phaser from 'phaser';
import { GAME_CONFIG, CHARACTER_TYPES } from '../config/GameConfig.js';

// Bangla Name Mapping
const CHARACTER_NAMES_BN = {
    preacher: 'সাধুবাবা',
    smiler: 'জোকার',
    shouter: 'গলাবাজ',
    vanisher: 'সুগারমাম্মী',
    puppet: 'পুতুলবাবা',
    boss: 'রামছাগল'
};

export class InstructionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionScene' });
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
        
        // 1. Title (Top)
        this.add.text(centerX, 80, 'INSTRUCTIONS', {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '48px',
            color: '#e94560',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 2. Characters Grid (Below Title)
        // Reduced spacing to fit everything
        this.createCharactersGrid(centerX, 250);

        // 3. Instruction Text (Below Characters)
        // Bullet points in Bangla
        const instructions = [
            'গেমের ক্যারেকটার স্থির চেহারা এবং ভেংচি কাটা চেহারা দেখাবে',
            'ভেংচি কাটা চেহারা দেখা মাত্র টাচ করে গর্তে ঢুকাবেন',
            'স্থির চেহারায় থাকা অবস্থায় টাচ করলে পয়েন্ট কাটা যাবে',
            'গেমের সময়কাল ১ মিনিট'
        ];

        let textStartY = 850; 
        const spacing = 40;
        const boxPadding = 20;
        const boxWidth = 680;
        const boxHeight = (instructions.length * spacing) + (boxPadding * 2);
        
        // Semi-transparent background rectangle
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7); // Black with 0.5 alpha
        graphics.fillRoundedRect(centerX - (boxWidth / 2), textStartY - boxPadding, boxWidth, boxHeight, 15);

        instructions.forEach((text, index) => {
            const y = textStartY + (index * spacing) + 20; // Added top margin for vertical centering
            // aligned left relative to the box
            const x = centerX - (boxWidth / 2) + boxPadding + 10; 

            this.add.text(x, y, `• ${text}`, {
                fontFamily: GAME_CONFIG.FONTS.bangla,
                fontSize: '24px',
                color: '#ffffff',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 3,
                wordWrap: { width: boxWidth - (boxPadding * 2) - 20 }
            }).setOrigin(0, 0.5); // Left alignment
        });

        // 4. Start Button (Bottom)
        this.createStartButton(centerX, height - 100);
    }

    createPlaceholderBackground(width, height) {
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, width, height);
    }

    createCharactersGrid(centerX, startY) {
        // Background for Character Area
        const gridWidth = 680;
        const gridHeight = 580; // Estimated height for 3 rows
        const bgY = startY - 80; // Start slightly above first row
        
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7); // Black with 0.5 alpha
        graphics.fillRoundedRect(centerX - (gridWidth / 2), bgY, gridWidth, gridHeight, 15);

        // We want specific order or just iteration?
        // Let's iterate using CHARACTER_TYPES values but apply our mapping
        const characters = Object.values(CHARACTER_TYPES);
        
        const cols = 2;
        const xSpacing = 280;
        const ySpacing = 190;
        
        characters.forEach((char, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = centerX + (col === 0 ? -140 : 140);
            const y = startY + (row * ySpacing);

            // Container for each character
            this.createCharacterEntry(x, y, char);
        });
    }

    createCharacterEntry(x, y, char) {
        // Circular Background
        const circleRadius = 60;
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1); // Solid white
        graphics.fillCircle(x, y, circleRadius);
        graphics.lineStyle(2, 0xe94560, 0.8);
        graphics.strokeCircle(x, y, circleRadius);

        // Character Image (scaled down to fit circle)
        if (this.textures.exists(char.spriteKey)) {
            const sprite = this.add.sprite(x, y, char.spriteKey, 0);
            
            // Zoomed a little (scale 0.6) and positioned top-center to hide bottom cut-off
            sprite.setScale(0.6); 
            
            // Adjust position: 
            // Move slightly down to ensure face is centered better while hiding bottom
            // or just center it.
            // User requested "top-center". 
            // Let's set origin to 0.5, 0 (top-center) and align top with circle top?
            // If we do that, the bottom might still show cut off if it's not long enough.
            // Best bet for "headshot": center horizontally, align top slightly above center?
            // Actually, let's keep center origin (0.5, 0.5) but shift Y down a bit to show more head?
            // Or shift Y up? 
            // If "bottom cut-off line" is visible, it means we need to push the bottom down.
            // Scaling up helps.
            // Let's try placing it slightly lower so the top of the head is near the top of the circle.
            sprite.setOrigin(0.5, 0);
            sprite.setPosition(x, y - 50); // Start drawing near top of circle

            // Masking
            const maskShape = this.make.graphics();
            maskShape.fillCircle(x, y, circleRadius);
            const mask = maskShape.createGeometryMask();
            sprite.setMask(mask);
        } else {
            // Placeholder
             this.add.text(x, y, '?', { fontSize: '40px', color: '#000000' }).setOrigin(0.5);
        }

        // Character Name (Bangla from mapping)
        const nameText = CHARACTER_NAMES_BN[char.id] || char.name;
        
        this.add.text(x, y + 55, nameText, {
            fontFamily: GAME_CONFIG.FONTS.bangla,
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: 8,
            align: 'center',
            wordWrap: { width: 200 }
        }).setOrigin(0.5, 0); // Top center anchor relative to y+75
    }

    createStartButton(x, y) {
        const button = this.add.rectangle(x, y, 300, 80, 0x003F15)
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
                this.startGame();
            });

        // Button text
        this.add.text(x, y, 'START GAME', {
            fontFamily: GAME_CONFIG.FONTS.primary,
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Pulse animation for button
        this.tweens.add({
            targets: button,
            alpha: 0.9,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    startGame() {
        // Play sound if enabled (logic from MainMenuScene)
        if (this.registry.get('soundEnabled')) {
             if (this.sound.get('sfx_button')) {
                this.sound.play('sfx_button', { volume: 0.5 });
            }
        }

        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
             this.scene.start('GameScene');
        });
    }
}
