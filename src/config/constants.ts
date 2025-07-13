/**
 * @fileoverview Game constants and enums for the Antzer game
 * Contains all shared constants, enums, and configuration values used throughout the game
 */

/**
 * Animation keys for sprite animations
 */
export enum AnimationKeys {
  ANT_DEATH = 'ant-death',
  ANT_IDLE = 'ant-idle',
  ANT_JUMP = 'ant-jump',
  ANT_WALK = 'ant-walk',
  FROG_IDLE = 'frog-idle',
  FROG_JUMP = 'frog-jump'
}

/**
 * Audio keys for sound effects and music
 */
export enum AudioKeys {
  MUSIC_GAME = 'music-game',
  MUSIC_MENU = 'music-menu',
  SFX_BUTTON = 'sfx-button',
  SFX_COLLECT = 'sfx-collect',
  SFX_DEATH = 'sfx-death',
  SFX_JUMP = 'sfx-jump',
  SFX_WIN = 'sfx-win'
}

/**
 * Movement directions for game objects
 */
export enum Direction {
  LEFT = 'left',
  RIGHT = 'right'
}

/**
 * Image keys for textures and sprites
 */
export enum ImageKeys {
  ANT = 'ant',
  ANT_HILL = 'ant-hill',
  BACKGROUND = 'background',
  BACKGROUND_TILES = 'background-tiles',
  BUTTON = 'button',
  CHERRY = 'cherry',
  CONTROLS = 'controls',
  COOKIE = 'cookie',
  LEAF = 'leaf',
  LOG = 'log',
  LOGO = 'logo',
  NAIL = 'nail',
  POISON = 'poison',
  SPRAY = 'spray'
}

/**
 * Scene keys for Phaser scene management
 */
export enum SceneKeys {
  BOOT = 'BootScene',
  GAME = 'GameScene',
  GAME_OVER = 'GameOverScene',
  LOADING = 'LoadingScene',
  MENU = 'MenuScene'
}

/**
 * Grid size in pixels for the game's grid-based movement system
 */
export const GRID_SIZE = 48;

/**
 * Depth layer for sparkle particle effects
 */
export const SPARKLE_PARTICLE_DEPTH = 150;

/**
 * Standard gold color for visual effects and collectibles
 */
export const GOLD_COLOR = 0xFFD700;