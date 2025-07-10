/**
 * @fileoverview Game constants and enums for the Antzer game
 * Contains all shared constants, enums, and configuration values used throughout the game
 */

/**
 * Animation keys for sprite animations
 * Used with Phaser's animation system to reference specific animations
 */
export enum AnimationKeys {
  /** Ant death animation */
  ANT_DEATH = 'ant-death',
  /** Ant idle animation */
  ANT_IDLE = 'ant-idle',
  /** Ant jump animation */
  ANT_JUMP = 'ant-jump',
  /** Ant walking animation */
  ANT_WALK = 'ant-walk',
  /** Frog idle animation */
  FROG_IDLE = 'frog-idle',
  /** Frog jump animation */
  FROG_JUMP = 'frog-jump'
}

/**
 * Audio keys for sound effects and music
 * Used with Phaser's audio system to reference specific audio files
 */
export enum AudioKeys {
  /** Background music for gameplay */
  MUSIC_GAME = 'music-game',
  /** Background music for menu */
  MUSIC_MENU = 'music-menu',
  /** Button click sound effect */
  SFX_BUTTON = 'sfx-button',
  /** Item collection sound effect */
  SFX_COLLECT = 'sfx-collect',
  /** Player death sound effect */
  SFX_DEATH = 'sfx-death',
  /** Player jump sound effect */
  SFX_JUMP = 'sfx-jump',
  /** Victory sound effect */
  SFX_WIN = 'sfx-win'
}

/**
 * Movement directions for game objects
 * Used by platforms, obstacles, and other moving entities
 */
export enum Direction {
  /** Left movement direction */
  LEFT = 'left',
  /** Right movement direction */
  RIGHT = 'right'
}

/**
 * Image keys for textures and sprites
 * Used with Phaser's texture system to reference specific image assets
 */
export enum ImageKeys {
  /** Player ant sprite */
  ANT = 'ant',
  /** Goal ant hill sprite */
  ANT_HILL = 'ant-hill',
  /** Background image */
  BACKGROUND = 'background',
  /** Background tile spritesheet */
  BACKGROUND_TILES = 'background-tiles',
  /** UI button sprite */
  BUTTON = 'button',
  /** Cherry collectible sprite */
  CHERRY = 'cherry',
  /** Controls instruction image */
  CONTROLS = 'controls',
  /** Cookie collectible sprite */
  COOKIE = 'cookie',
  /** Frog obstacle sprite */
  FROG = 'frog',
  /** Leaf platform sprite */
  LEAF = 'leaf',
  /** Log platform sprite */
  LOG = 'log',
  /** Game logo image */
  LOGO = 'logo',
  /** Nail obstacle sprite */
  NAIL = 'nail',
  /** Poison obstacle sprite */
  POISON = 'poison',
  /** Spray obstacle sprite */
  SPRAY = 'spray'
}

/**
 * Scene keys for Phaser scene management
 * Used to identify and transition between different game scenes
 */
export enum SceneKeys {
  /** Initial boot scene */
  BOOT = 'BootScene',
  /** Main gameplay scene */
  GAME = 'GameScene',
  /** Game over scene */
  GAME_OVER = 'GameOverScene',
  /** Asset loading scene */
  LOADING = 'LoadingScene',
  /** Main menu scene */
  MENU = 'MenuScene'
}

/**
 * Grid size in pixels for the game's grid-based movement system
 * All game objects align to this grid for consistent positioning
 * Reduced from default to fit better on screen
 */
export const GRID_SIZE = 48;

/**
 * Depth layer for sparkle particle effects
 * Ensures particles appear above most game objects but below UI
 */
export const SPARKLE_PARTICLE_DEPTH = 150;

/**
 * Standard gold color used for visual effects and collectibles
 * Hexadecimal color value for consistent gold appearance
 */
export const GOLD_COLOR = 0xFFD700;