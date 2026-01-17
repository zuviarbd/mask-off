/**
 * Asset Manifest
 * 
 * IMPORTANT: This file defines all game assets in a central location.
 * When replacing placeholder assets with final versions:
 * 1. Keep the same key names
 * 2. Update the file paths as needed
 * 3. The game will automatically use the new assets
 * 
 * Asset naming convention:
 * - Sprites: [type]_[name].png (e.g., char_preacher.png)
 * - Audio: [category]_[name].mp3 (e.g., sfx_hit.mp3)
 */

export const ASSET_MANIFEST = {
    // ============================================
    // IMAGES - Sprites and UI elements
    // ============================================
    images: {
        // UI Elements
        ui_hole: {
            key: 'ui_hole',
            path: 'assets/sprites/ui/hole.png',
            description: 'Circular hole where characters pop up (180x180px)'
        },
        ui_stamp_caught: {
            key: 'ui_stamp_caught',
            path: 'assets/sprites/ui/stamp_caught.png',
            description: 'CAUGHT! stamp overlay (300x150px)'
        },
        ui_stamp_wrong: {
            key: 'ui_stamp_wrong',
            path: 'assets/sprites/ui/stamp_wrong.png',
            description: 'WRONG! stamp overlay (300x150px)'
        },
        ui_combo_flames: {
            key: 'ui_combo_flames',
            path: 'assets/sprites/ui/combo_flames.png',
            description: 'Animated flame effect for combo meter'
        },
        ui_background: {
            key: 'ui_background',
            path: 'assets/sprites/ui/background.png',
            description: 'Main game background (720x1280px)'
        },
        ui_logo: {
            key: 'ui_logo',
            path: 'assets/sprites/ui/logo.png',
            description: 'Game logo for menu screen (400x200px)'
        }
    },

    // ============================================
    // SPRITE SHEETS - Animated characters
    // ============================================
    spritesheets: {
        // Character sprite sheets
        // Frame size: 200x250px, arranged horizontally
        char_preacher: {
            key: 'char_preacher',
            path: 'assets/sprites/characters/preacher.png',
            frameWidth: 200,
            frameHeight: 250,
            description: 'The Preacher - 12 frames: idle(4), cracking(2), slip(4), hit(2)'
        },
        char_smiler: {
            key: 'char_smiler',
            path: 'assets/sprites/characters/smiler.png',
            frameWidth: 200,
            frameHeight: 250,
            description: 'The Smiler - 12 frames: idle(4), cracking(2), slip(4), hit(2)'
        },
        char_shouter: {
            key: 'char_shouter',
            path: 'assets/sprites/characters/shouter.png',
            frameWidth: 200,
            frameHeight: 250,
            description: 'The Shouter - 12 frames: idle(4), cracking(2), slip(4), hit(2)'
        },
        char_vanisher: {
            key: 'char_vanisher',
            path: 'assets/sprites/characters/vanisher.png',
            frameWidth: 200,
            frameHeight: 250,
            totalFrames: 10,
            description: 'The Vanisher - 10 frames: idle(3), cracking(2), slip(3), hit(2) [frames 0-9]'
        },
        char_puppet: {
            key: 'char_puppet',
            path: 'assets/sprites/characters/puppet.png',
            frameWidth: 200,
            frameHeight: 250,
            description: 'The Puppet - 12 frames: idle(4), cracking(2), slip(4), hit(2)'
        },
        char_boss: {
            key: 'char_boss',
            path: 'assets/sprites/characters/boss.png',
            frameWidth: 250,
            frameHeight: 300,
            description: 'The Boss - 14 frames: idle(4), cracking(3), slip(4), hit(3)'
        },
        // Visual effect overlays
        fx_mask_crack: {
            key: 'fx_mask_crack',
            path: 'assets/sprites/fx/mask_crack.png',
            frameWidth: 200,
            frameHeight: 250,
            description: 'Mask cracking overlay effect - 4 frames'
        },
        fx_icons: {
            key: 'fx_icons',
            path: 'assets/sprites/fx/icons.png',
            frameWidth: 64,
            frameHeight: 64,
            description: 'Icon sprites: coin, crown, vote, halo, horns (5 frames)'
        }
    },

    // ============================================
    // AUDIO - Sound effects and music
    // ============================================
    audio: {
        // Hit sounds
        sfx_hit_correct: {
            key: 'sfx_hit_correct',
            path: 'assets/audio/sfx/hit_correct.mp3',
            description: 'Sharp smack sound for correct hit (0.3s)'
        },
        sfx_hit_wrong: {
            key: 'sfx_hit_wrong',
            path: 'assets/audio/sfx/hit_wrong.mp3',
            description: 'Soft thud for wrong hit (0.3s)'
        },
        sfx_stamp: {
            key: 'sfx_stamp',
            path: 'assets/audio/sfx/stamp.mp3',
            description: 'Stamp impact effect (0.5s)'
        },
        sfx_popup: {
            key: 'sfx_popup',
            path: 'assets/audio/sfx/popup.mp3',
            description: 'Character appearing sound (0.2s)'
        },
        sfx_mask_crack: {
            key: 'sfx_mask_crack',
            path: 'assets/audio/sfx/mask_crack.mp3',
            description: 'Subtle crack sound (0.3s)'
        },
        sfx_combo_up: {
            key: 'sfx_combo_up',
            path: 'assets/audio/sfx/combo_up.mp3',
            description: 'Combo increase sound (0.3s)'
        },
        sfx_combo_break: {
            key: 'sfx_combo_break',
            path: 'assets/audio/sfx/combo_break.mp3',
            description: 'Combo lost sound (0.5s)'
        },
        sfx_timer_warning: {
            key: 'sfx_timer_warning',
            path: 'assets/audio/sfx/timer_warning.mp3',
            description: 'Last 10 seconds warning beep (0.5s)'
        },
        sfx_button: {
            key: 'sfx_button',
            path: 'assets/audio/sfx/button.mp3',
            description: 'UI button click (0.2s)'
        },
        
        // Crowd reactions
        sfx_crowd_cheer: {
            key: 'sfx_crowd_cheer',
            path: 'assets/audio/sfx/crowd_cheer.mp3',
            description: 'Applause for correct hit (1.5s)'
        },
        sfx_crowd_murmur: {
            key: 'sfx_crowd_murmur',
            path: 'assets/audio/sfx/crowd_murmur.mp3',
            description: 'Disapproving murmur (1.5s)'
        },
        
        // Voice lines (character-specific excuses when caught)
        voice_preacher: {
            key: 'voice_preacher',
            path: 'assets/audio/voice/excuse_preacher.mp3',
            text: "It's a conspiracy!",
            description: 'The Preacher excuse voice line'
        },
        voice_smiler: {
            key: 'voice_smiler',
            path: 'assets/audio/voice/excuse_smiler.mp3',
            text: "You misunderstood me!",
            description: 'The Smiler excuse voice line'
        },
        voice_shouter: {
            key: 'voice_shouter',
            path: 'assets/audio/voice/excuse_shouter.mp3',
            text: "This is out of context!",
            description: 'The Shouter excuse voice line'
        },
        voice_vanisher: {
            key: 'voice_vanisher',
            path: 'assets/audio/voice/excuse_vanisher.mp3',
            text: "I never said that!",
            description: 'The Vanisher excuse voice line'
        },
        voice_puppet: {
            key: 'voice_puppet',
            path: 'assets/audio/voice/excuse_puppet.mp3',
            text: "I was just following orders!",
            description: 'The Puppet excuse voice line'
        },
        voice_boss: {
            key: 'voice_boss',
            path: 'assets/audio/voice/excuse_boss.mp3',
            text: "Fake news!",
            description: 'The Boss excuse voice line'
        },
        
        // Music
        music_menu: {
            key: 'music_menu',
            path: 'assets/audio/music/menu_theme.mp3',
            description: 'Upbeat satirical menu theme (loop)'
        },
        music_gameplay: {
            key: 'music_gameplay',
            path: 'assets/audio/music/gameplay_loop.mp3',
            description: 'Tension-building gameplay music (loop)'
        },
        music_victory: {
            key: 'music_victory',
            path: 'assets/audio/music/victory_fanfare.mp3',
            description: 'High score celebration (5s)'
        }
    }
};

/**
 * Helper function to get all asset keys of a specific type
 */
export function getAssetKeys(type) {
    const assets = ASSET_MANIFEST[type];
    if (!assets) return [];
    return Object.keys(assets).map(k => assets[k].key);
}

/**
 * Get voice line key for a specific character type
 * @param {string} characterTypeId - The character type id (e.g., 'preacher', 'smiler')
 * @returns {string|null} The voice line key or null if not found
 */
export function getVoiceLineKey(characterTypeId) {
    const voiceKey = `voice_${characterTypeId}`;
    return ASSET_MANIFEST.audio[voiceKey]?.key || null;
}

/**
 * Get all voice line keys (for preloading)
 */
export function getVoiceLineKeys() {
    return Object.keys(ASSET_MANIFEST.audio)
        .filter(k => k.startsWith('voice_'))
        .map(k => ASSET_MANIFEST.audio[k].key);
}
