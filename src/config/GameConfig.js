/**
 * Game Configuration
 * Central place to configure game parameters
 */

export const GAME_CONFIG = {
    // Game duration in seconds per round
    roundDuration: 10,

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
    },

    // Spawn behavior
    spawnBehavior: {
        unmaskedSpawnChance: 0.4 // 40% of characters spawn already unmasked
    },

    // Fonts
    FONTS: {
        primary: 'Birdman',
        numbers: 'CT Galbite',
        secondary: 'Arial',
        bangla: 'Li Abu J M Akkas'
    }
};

export const DIFFICULTY_LEVELS = {
    easy: {
        name: 'Easy',
        slipChance: 0.9,
        slipDuration: 450,
        maskDuration: { min: 1000, max: 1200 },
        popupInterval: { min: 900, max: 1500 },
        maxActiveCharacters: 4,
        bossInterval: 10000, // 10 seconds
        bossHitsRequired: 1
    },
    normal: {
        name: 'Normal',
        slipChance: 0.8,
        slipDuration: 400,
        maskDuration: { min: 900, max: 1100 },
        popupInterval: { min: 800, max: 1300 },
        maxActiveCharacters: 5,
        bossInterval: 12000,
        bossHitsRequired: 1
    },
    hard: {
        name: 'Hard',
        slipChance: 0.7,
        slipDuration: 350,
        maskDuration: { min: 800, max: 1000 },
        popupInterval: { min: 700, max: 1100 },
        maxActiveCharacters: 6,
        bossInterval: 15000,
        bossHitsRequired: 1
    }
};

export const CHARACTER_TYPES = {
    preacher: {
        id: 'preacher',
        name: 'The Preacher',
        description: 'Long mask, very fast slip',
        maskDurationModifier: 1.1,
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
        pointsModifier: 1.1,
        spriteKey: 'char_smiler'
    },
    shouter: {
        id: 'shouter',
        name: 'The Shouter',
        description: 'Loud audio bait',
        maskDurationModifier: 0.9,
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
        maskDurationModifier: 0.8,
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
        pointsModifier: 1.2,
        requiresTrigger: true,
        spriteKey: 'char_puppet'
    },
    boss: {
        id: 'boss',
        name: 'The Boss',
        description: 'Takes multiple hits to defeat',
        maskDurationModifier: 0.7,
        slipDurationModifier: 1.2,
        slipChanceModifier: 0.9,
        pointsModifier: 3.0,
        isBoss: true,
        spriteKey: 'char_boss'
    }
};

// Rating thresholds based on performance
// Requires BOTH minAccuracy AND minScorePercent of high score to achieve tier
export const RATINGS = {
    blindBeliever: {
        id: 'blind_believer',
        name: 'মুখোশ উন্মোচক!',
        emoji: '😴',
        minAccuracy: 0,
        minScorePercent: 0,  // No score requirement
        color: '#295242ff'
    },
    curious: {
        id: 'curious',
        name: 'মুনাফিক হান্টার!',
        emoji: '👀',
        minAccuracy: 0.4,    // 40% accuracy
        minScorePercent: 0.3, // 30% of high score
        color: '#007afdff'
    },
    criticalThinker: {
        id: 'critical_thinker',
        name: 'মগবাজারের যম!',
        emoji: '🧠',
        minAccuracy: 0.6,    // 60% accuracy
        minScorePercent: 0.6, // 60% of high score
        color: '#5849adff'
    },
    hypocrisyHunter: {
        id: 'hypocrisy_hunter',
        name: 'ছাগুশিকারী প্রো ম্যাক্স!',
        emoji: '🎯',
        minAccuracy: 0.75,   // 75% accuracy
        minScorePercent: 0.85, // 85% of high score
        color: '#e2193bff'
    }
};

['ছাগুশিকারী', 'গর্তা', 'অপরোধী', 'গর্তযোদ্ধা']