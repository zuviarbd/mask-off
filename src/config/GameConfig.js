/**
 * Game Configuration
 * Central place to configure game parameters
 */

export const GAME_CONFIG = {
    // Game duration in seconds per round
    roundDuration: 60,
    
    // Grid configuration
    grid: {
        rows: 3,
        cols: 3,
        holeSize: 180,
        holeSpacing: 20
    },
    
    // Scoring
    scoring: {
        correctHit: 10,
        wrongHit: -5,
        bossHit: 25,
        missedSlip: 0 // No penalty for missing
    },
    
    // Combo system
    combo: {
        multipliers: [1, 1.2, 1.5, 2.0, 2.5, 3.0],
        thresholds: [0, 2, 4, 6, 8, 10],
        chainWindow: 2000 // ms to maintain chain
    },
    
    // Anti-spam system
    antiSpam: {
        wrongHitsToTrigger: 3,
        penaltyDuration: 3000, // ms
        slipReduction: 0.5, // Reduce slip chance by 50%
        maskDurationIncrease: 1.5 // Increase mask duration by 50%
    }
};

export const DIFFICULTY_LEVELS = {
    easy: {
        name: 'Easy',
        slipChance: 0.8,
        slipDuration: 400,
        maskDuration: { min: 1000, max: 1200 },
        popupInterval: { min: 800, max: 1500 },
        maxActiveCharacters: 2,
        bossInterval: 60000, // 60 seconds
        bossHitsRequired: 2
    },
    normal: {
        name: 'Normal',
        slipChance: 0.6,
        slipDuration: 300,
        maskDuration: { min: 800, max: 1000 },
        popupInterval: { min: 600, max: 1200 },
        maxActiveCharacters: 3,
        bossInterval: 45000,
        bossHitsRequired: 3
    },
    hard: {
        name: 'Hard',
        slipChance: 0.4,
        slipDuration: 200,
        maskDuration: { min: 600, max: 800 },
        popupInterval: { min: 400, max: 800 },
        maxActiveCharacters: 4,
        bossInterval: 30000,
        bossHitsRequired: 4
    }
};

export const CHARACTER_TYPES = {
    preacher: {
        id: 'preacher',
        name: 'The Preacher',
        description: 'Long mask, very fast slip',
        maskDurationModifier: 1.3,
        slipDurationModifier: 0.7,
        slipChanceModifier: 1.0,
        pointsModifier: 1.0,
        spriteKey: 'char_preacher'
    },
    smiler: {
        id: 'smiler',
        name: 'The Smiler',
        description: 'Fake kindness, rare slip',
        maskDurationModifier: 1.0,
        slipDurationModifier: 1.0,
        slipChanceModifier: 0.7,
        pointsModifier: 1.5,
        spriteKey: 'char_smiler'
    },
    shouter: {
        id: 'shouter',
        name: 'The Shouter',
        description: 'Loud audio bait',
        maskDurationModifier: 0.8,
        slipDurationModifier: 1.2,
        slipChanceModifier: 1.0,
        pointsModifier: 1.0,
        hasAudioBait: true,
        spriteKey: 'char_shouter'
    },
    vanisher: {
        id: 'vanisher',
        name: 'The Vanisher',
        description: 'Short popup, high reward',
        maskDurationModifier: 0.5,
        slipDurationModifier: 0.8,
        slipChanceModifier: 0.9,
        pointsModifier: 2.0,
        spriteKey: 'char_vanisher'
    },
    puppet: {
        id: 'puppet',
        name: 'The Puppet',
        description: 'Slip only after another is hit',
        maskDurationModifier: 1.2,
        slipDurationModifier: 1.0,
        slipChanceModifier: 0.0, // Only slips when triggered
        pointsModifier: 1.5,
        requiresTrigger: true,
        spriteKey: 'char_puppet'
    },
    boss: {
        id: 'boss',
        name: 'The Boss',
        description: 'Takes multiple hits to defeat',
        maskDurationModifier: 2.0,
        slipDurationModifier: 1.5,
        slipChanceModifier: 1.0,
        pointsModifier: 3.0,
        isBoss: true,
        spriteKey: 'char_boss'
    }
};

// Rating thresholds based on performance
export const RATINGS = {
    blindBeliever: {
        id: 'blind_believer',
        name: 'Blind Believer',
        emoji: '😴',
        minAccuracy: 0,
        maxAccuracy: 0.3,
        color: '#888888'
    },
    curious: {
        id: 'curious',
        name: 'Curious',
        emoji: '👀',
        minAccuracy: 0.3,
        maxAccuracy: 0.5,
        color: '#4a90d9'
    },
    criticalThinker: {
        id: 'critical_thinker',
        name: 'Critical Thinker',
        emoji: '🧠',
        minAccuracy: 0.5,
        maxAccuracy: 0.75,
        color: '#7b68ee'
    },
    hypocrisyHunter: {
        id: 'hypocrisy_hunter',
        name: 'Hypocrisy Hunter',
        emoji: '🎯',
        minAccuracy: 0.75,
        maxAccuracy: 1.0,
        color: '#e94560'
    }
};
