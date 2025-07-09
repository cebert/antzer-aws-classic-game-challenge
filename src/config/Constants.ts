export enum AnimationKeys {
  ANT_DEATH = 'ant-death',
  ANT_IDLE = 'ant-idle',
  ANT_JUMP = 'ant-jump',
  ANT_WALK = 'ant-walk',
  FROG_IDLE = 'frog-idle',
  FROG_JUMP = 'frog-jump'
}

export enum AudioKeys {
  MUSIC_GAME = 'music-game',
  MUSIC_MENU = 'music-menu',
  SFX_BUTTON = 'sfx-button',
  SFX_COLLECT = 'sfx-collect',
  SFX_DEATH = 'sfx-death',
  SFX_JUMP = 'sfx-jump',
  SFX_WIN = 'sfx-win'
}

export enum ImageKeys {
  ANT = 'ant',
  ANT_HILL = 'ant-hill',
  BACKGROUND = 'background',
  BACKGROUND_TILES = 'background-tiles',
  BUTTON = 'button',
  CHERRY = 'cherry',
  CONTROLS = 'controls',
  COOKIE = 'cookie',
  FROG = 'frog',
  LEAF = 'leaf',
  LOG = 'log',
  LOGO = 'logo',
  NAIL = 'nail',
  POISON = 'poison',
  SPRAY = 'spray'
}

export enum SceneKeys {
  BOOT = 'BootScene',
  GAME = 'GameScene',
  GAME_OVER = 'GameOverScene',
  LOADING = 'LoadingScene',
  MENU = 'MenuScene'
}

export const GRID_SIZE = 48; // Reduced grid size to fit better on screen
export const PLAYER_SPEED = 180; // Slightly reduced player speed for better control
export const COLLECTIBLE_POINTS = 10;