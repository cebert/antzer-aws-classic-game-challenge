export enum SceneKeys {
  BOOT = 'BootScene',
  LOADING = 'LoadingScene',
  MENU = 'MenuScene',
  GAME = 'GameScene',
  GAME_OVER = 'GameOverScene'
}

export enum AudioKeys {
  MUSIC_MENU = 'music-menu',
  MUSIC_GAME = 'music-game',
  SFX_JUMP = 'sfx-jump',
  SFX_COLLECT = 'sfx-collect',
  SFX_DEATH = 'sfx-death',
  SFX_WIN = 'sfx-win',
  SFX_BUTTON = 'sfx-button'
}

export enum ImageKeys {
  LOGO = 'logo',
  BACKGROUND = 'background',
  BACKGROUND_TILES = 'background-tiles',
  ANT = 'ant',
  ANT_HILL = 'ant-hill',
  CHERRY = 'cherry',
  COOKIE = 'cookie',
  POISON = 'poison',
  SPRAY = 'spray',
  NAIL = 'nail',
  LEAF = 'leaf',
  LOG = 'log',
  FROG = 'frog',
  BUTTON = 'button',
  CONTROLS = 'controls'
}

export enum AnimationKeys {
  ANT_IDLE = 'ant-idle',
  ANT_WALK = 'ant-walk',
  ANT_JUMP = 'ant-jump',
  ANT_DEATH = 'ant-death',
  FROG_IDLE = 'frog-idle',
  FROG_JUMP = 'frog-jump'
}

export const GRID_SIZE = 48; // Reduced grid size to fit better on screen
export const PLAYER_SPEED = 180; // Slightly reduced player speed for better control
export const OBSTACLE_SPEED_MIN = 40; // Reduced obstacle speed (this was for the spider and frog which were removed due to time boxed effort on this game)
export const OBSTACLE_SPEED_MAX = 120; // Reduced max obstacle speed  (this was for the spider and frog which were removed due to time boxed effort on this game)
export const COLLECTIBLE_POINTS = 10;