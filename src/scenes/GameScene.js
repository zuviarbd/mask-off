/**
 * Game Scene
 * Main gameplay - the core whack-a-mole mechanics with satire
 */
import Phaser from 'phaser';
import { GAME_CONFIG, DIFFICULTY_LEVELS, CHARACTER_TYPES } from '../config/GameConfig.js';
import { Character } from '../objects/Character.js';
import { HUD } from '../objects/HUD.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Reset game state
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.correctHits = 0;
        this.wrongHits = 0;
        this.consecutiveWrongHits = 0;
        this.missedSlips = 0;
        this.isBlindFaithMode = false;
        this.blindFaithEndTime = 0;
        this.bossesDefeated = 0;
        this.timeRemaining = GAME_CONFIG.roundDuration;
        this.isPaused = false;
        this.puppetTriggered = false;
        
        // Get difficulty settings
        const diffKey = this.registry.get('difficulty') || 'normal';
        this.difficulty = DIFFICULTY_LEVELS[diffKey];
        
        // Holes and active characters
        this.holes = [];
        this.characters = [];
        this.lastBossTime = 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Fade in
        this.cameras.main.fadeIn(500);
        
        // Background
        this.createBackground(width, height);
        
        // Create the game grid
        this.createGrid(width, height);
        
        // Create HUD
        this.hud = new HUD(this);
        
        // Start game timer
        this.startGameTimer();
        
        // Start character spawning
        this.startSpawning();
        
        // Play gameplay music
        this.playGameplayMusic();
        
        // Input handling for pause
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    }
    
    createBackground(width, height) {
        if (this.textures.exists('ui_background')) {
            this.add.image(width / 2, height / 2, 'ui_background');
        } else {
            // Placeholder background
            const graphics = this.add.graphics();
            graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f3460, 0x0f3460, 1);
            graphics.fillRect(0, 0, width, height);
            
            // Stage floor
            graphics.fillStyle(0x2d2d44, 1);
            graphics.fillRect(0, height - 400, width, 400);
        }
    }
    
    createGrid(width, height) {
        const { grid } = GAME_CONFIG;
        const totalWidth = grid.cols * (grid.holeSize + grid.holeSpacing) - grid.holeSpacing;
        const totalHeight = grid.rows * (grid.holeSize + grid.holeSpacing) - grid.holeSpacing;
        const startX = (width - totalWidth) / 2 + grid.holeSize / 2;
        const startY = height / 2 + 100;
        
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const x = startX + col * (grid.holeSize + grid.holeSpacing);
                const y = startY + row * (grid.holeSize + grid.holeSpacing);
                
                const hole = this.createHole(x, y, row * grid.cols + col);
                this.holes.push(hole);
            }
        }
    }
    
    createHole(x, y, index) {
        // Draw the hole sprite
        let holeSprite;
        if (this.textures.exists('ui_hole')) {
            holeSprite = this.add.image(x, y, 'ui_hole');
        } else {
            // Placeholder hole
            const graphics = this.add.graphics();
            graphics.fillStyle(0x111122, 1);
            graphics.fillEllipse(x, y, 160, 80);
            graphics.fillStyle(0x0a0a15, 1);
            graphics.fillEllipse(x, y + 10, 140, 60);
            holeSprite = graphics;
        }
        holeSprite.setDepth(1); // Holes are background, characters (depth 10) render on top
        
        // Create a mask that allows characters to be visible ABOVE the hole
        // and clips them at the hole's edge with a curved bottom
        const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
        maskShape.fillStyle(0xffffff);
        
        // Main visible area - large rectangle from above the screen down to the hole
        // Width: 250px (enough for character width with some margin)
        // Height: starts 500px above hole center
        maskShape.fillRect(x - 125, y - 500, 250, 500);
        
        // Curved bottom extension - positioned to align with hole rim
        // Ellipse sized to show upper body while clipping at hole edge
        maskShape.fillEllipse(x, y - 5, 150, 70);
        
        const mask = maskShape.createGeometryMask();
        
        return {
            sprite: holeSprite,
            x,
            y,
            index,
            mask,
            isOccupied: false,
            character: null
        };
    }
    
    startGameTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeRemaining--;
                this.hud.updateTimer(this.timeRemaining);
                
                // Warning sound at 10 seconds
                if (this.timeRemaining === 10) {
                    this.playSound('sfx_timer_warning');
                }
                
                // Game over
                if (this.timeRemaining <= 0) {
                    this.endGame();
                }
            },
            loop: true
        });
    }
    
    startSpawning() {
        // Random spawn interval
        const scheduleNextSpawn = () => {
            if (this.isPaused || this.timeRemaining <= 0) return;
            
            const { popupInterval } = this.difficulty;
            const delay = Phaser.Math.Between(popupInterval.min, popupInterval.max);
            
            // Apply blind faith mode penalty
            const adjustedDelay = this.isBlindFaithMode ? delay * 1.5 : delay;
            
            this.time.delayedCall(adjustedDelay, () => {
                this.spawnCharacter();
                scheduleNextSpawn();
            });
        };
        
        scheduleNextSpawn();
        
        // Check for boss spawn
        this.time.addEvent({
            delay: 1000,
            callback: () => this.checkBossSpawn(),
            loop: true
        });
    }
    
    checkBossSpawn() {
        const timePlayed = (GAME_CONFIG.roundDuration - this.timeRemaining) * 1000;
        
        if (timePlayed - this.lastBossTime >= this.difficulty.bossInterval) {
            this.spawnBoss();
            this.lastBossTime = timePlayed;
        }
    }
    
    spawnCharacter(forceBoss = false) {
        // Find available hole
        const availableHoles = this.holes.filter(h => !h.isOccupied);
        if (availableHoles.length === 0) return;
        
        // Check max active characters
        const activeCount = this.characters.filter(c => c.isActive).length;
        if (activeCount >= this.difficulty.maxActiveCharacters && !forceBoss) return;
        
        // Pick random hole (center bias for normal chars)
        let hole;
        if (forceBoss) {
            // Boss always in center
            hole = availableHoles.find(h => h.index === 4) || availableHoles[0];
        } else {
            // 30% chance for center hole
            if (availableHoles.find(h => h.index === 4) && Math.random() < 0.3) {
                hole = availableHoles.find(h => h.index === 4);
            } else {
                hole = Phaser.Utils.Array.GetRandom(availableHoles);
            }
        }
        
        // Pick character type
        const charType = forceBoss ? CHARACTER_TYPES.boss : this.pickCharacterType();
        
        // Create character
        const character = new Character(this, hole, charType, this.difficulty);
        
        // Check if character will slip
        let willSlip = Math.random() < this.difficulty.slipChance * charType.slipChanceModifier;
        
        // Apply blind faith mode penalty
        if (this.isBlindFaithMode) {
            willSlip = willSlip && Math.random() < (1 - GAME_CONFIG.antiSpam.slipReduction);
        }
        
        // Puppet only slips if triggered
        if (charType.requiresTrigger) {
            willSlip = this.puppetTriggered;
            this.puppetTriggered = false;
        }
        
        character.willSlip = willSlip;
        character.spawn();
        
        this.characters.push(character);
        hole.isOccupied = true;
        hole.character = character;
    }
    
    spawnBoss() {
        this.spawnCharacter(true);
    }
    
    pickCharacterType() {
        // Weighted random selection (excluding boss and puppet for normal spawns)
        const types = ['preacher', 'smiler', 'shouter', 'vanisher'];
        
        // Add puppet occasionally
        if (Math.random() < 0.2) {
            types.push('puppet');
        }
        
        const typeKey = Phaser.Utils.Array.GetRandom(types);
        return CHARACTER_TYPES[typeKey];
    }
    
    onCharacterClicked(character) {
        if (this.isPaused || !character.isActive) return;
        
        const isSlipping = character.currentState === 'slip';
        
        if (isSlipping) {
            this.handleCorrectHit(character);
        } else {
            this.handleWrongHit(character);
        }
    }
    
    handleCorrectHit(character) {
        // Calculate score with combo multiplier
        const basePoints = GAME_CONFIG.scoring.correctHit * character.type.pointsModifier;
        const multiplier = this.getComboMultiplier();
        const points = Math.floor(basePoints * multiplier);
        
        // Update stats
        this.score += points;
        this.correctHits++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.consecutiveWrongHits = 0;
        
        // Trigger puppet slips
        this.puppetTriggered = true;
        
        // Boss handling
        if (character.type.isBoss) {
            character.bossHits++;
            if (character.bossHits >= this.difficulty.bossHitsRequired) {
                this.bossesDefeated++;
                character.defeat();
            } else {
                character.takeDamage();
                return; // Don't despawn yet
            }
        } else {
            character.defeat();
        }
        
        // Visual and audio feedback
        this.showHitFeedback(character, true, points);
        this.playSound('sfx_hit_correct');
        this.playRandomExcuse();
        
        // Update HUD
        this.hud.updateScore(this.score);
        this.hud.updateCombo(this.combo);
        this.hud.showPoints(character.hole.x, character.hole.y - 100, points);
        
        // Screen shake
        this.cameras.main.shake(100, 0.01);
    }
    
    handleWrongHit(character) {
        // Apply penalty
        this.score = Math.max(0, this.score + GAME_CONFIG.scoring.wrongHit);
        this.wrongHits++;
        this.combo = 0;
        this.consecutiveWrongHits++;
        
        // Check for blind faith mode trigger
        if (this.consecutiveWrongHits >= GAME_CONFIG.antiSpam.wrongHitsToTrigger) {
            this.triggerBlindFaithMode();
        }
        
        // Visual and audio feedback
        this.showHitFeedback(character, false);
        this.playSound('sfx_hit_wrong');
        this.playSound('sfx_crowd_murmur');
        
        // Update HUD
        this.hud.updateScore(this.score);
        this.hud.updateCombo(0);
        this.hud.showText(character.hole.x, character.hole.y - 100, 'WRONG!', '#ff4444');
        
        // Small screen shake
        this.cameras.main.shake(50, 0.005);
    }
    
    triggerBlindFaithMode() {
        this.isBlindFaithMode = true;
        this.blindFaithEndTime = this.time.now + GAME_CONFIG.antiSpam.penaltyDuration;
        
        // Show warning
        this.hud.showBlindFaithWarning();
        
        // End after duration
        this.time.delayedCall(GAME_CONFIG.antiSpam.penaltyDuration, () => {
            this.isBlindFaithMode = false;
            this.consecutiveWrongHits = 0;
        });
    }
    
    showHitFeedback(character, isCorrect, points = 0) {
        // Show stamp overlay
        const stampKey = isCorrect ? 'ui_stamp_caught' : 'ui_stamp_wrong';
        
        if (this.textures.exists(stampKey)) {
            const stamp = this.add.image(character.hole.x, character.hole.y - 50, stampKey);
            stamp.setScale(0);
            stamp.setDepth(50); // Stamps appear on top of characters
            
            this.tweens.add({
                targets: stamp,
                scale: 1,
                duration: 150,
                ease: 'Back.easeOut',
                onComplete: () => {
                    this.tweens.add({
                        targets: stamp,
                        alpha: 0,
                        delay: 300,
                        duration: 200,
                        onComplete: () => stamp.destroy()
                    });
                }
            });
        }
    }
    
    getComboMultiplier() {
        const { multipliers, thresholds } = GAME_CONFIG.combo;
        
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (this.combo >= thresholds[i]) {
                return multipliers[i];
            }
        }
        return 1;
    }
    
    onCharacterMissed(character) {
        if (character.willSlip && character.currentState === 'slip') {
            this.missedSlips++;
        }
        
        // Free up the hole
        character.hole.isOccupied = false;
        character.hole.character = null;
    }
    
    playSound(key) {
        if (!this.registry.get('soundEnabled')) return;
        
        if (this.sound.get(key) || this.cache.audio.exists(key)) {
            this.sound.play(key, { volume: 0.5 });
        }
    }
    
    playRandomExcuse() {
        if (!this.registry.get('soundEnabled')) return;
        
        const excuses = ['voice_excuse_1', 'voice_excuse_2', 'voice_excuse_3', 'voice_excuse_4', 'voice_excuse_5'];
        const excuse = Phaser.Utils.Array.GetRandom(excuses);
        
        if (this.cache.audio.exists(excuse)) {
            this.sound.play(excuse, { volume: 0.7 });
        }
    }
    
    playGameplayMusic() {
        if (!this.registry.get('musicEnabled')) return;
        
        if (this.cache.audio.exists('music_gameplay')) {
            this.sound.play('music_gameplay', { loop: true, volume: 0.3 });
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.gameTimer.paused = true;
            this.hud.showPauseMenu();
        } else {
            this.gameTimer.paused = false;
            this.hud.hidePauseMenu();
        }
    }
    
    endGame() {
        // Stop all spawning
        this.isPaused = true;
        this.gameTimer.remove();
        
        // Stop music
        this.sound.stopAll();
        
        // Calculate final stats
        const totalAttempts = this.correctHits + this.wrongHits;
        const accuracy = totalAttempts > 0 ? this.correctHits / totalAttempts : 0;
        
        // Save high score
        const highScore = this.registry.get('highScore') || 0;
        if (this.score > highScore) {
            this.registry.set('highScore', this.score);
            try {
                localStorage.setItem('maskoff_highscore', this.score.toString());
            } catch (e) {
                // localStorage not available
            }
        }
        
        // Transition to game over
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                correctHits: this.correctHits,
                wrongHits: this.wrongHits,
                maxCombo: this.maxCombo,
                accuracy: accuracy,
                bossesDefeated: this.bossesDefeated,
                isNewHighScore: this.score > highScore
            });
        });
    }
    
    update(time, delta) {
        if (this.isPaused) return;
        
        // Update all active characters
        this.characters.forEach(char => {
            if (char.isActive) {
                char.update(time, delta);
            }
        });
        
        // Clean up inactive characters
        this.characters = this.characters.filter(c => c.isActive);
    }
}
