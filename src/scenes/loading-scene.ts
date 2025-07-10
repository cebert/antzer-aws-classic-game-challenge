import Phaser from "phaser";
import { AnimationKeys, AudioKeys, ImageKeys, SceneKeys } from "../config/constants";

/**
 * @fileoverview Loading scene for the Antzer game
 * Handles asset loading with visual progress feedback and animation creation
 * Displays loading progress and transitions to the menu scene when complete
 */


/**
 * LoadingScene class - handles all game asset loading with visual feedback
 * 
 * This scene is responsible for:
 * - Loading all game assets (images, audio, spritesheets)
 * - Displaying loading progress with a visual progress bar
 * - Creating all sprite animations for the game
 * - Showing game credits and challenge information
 * - Transitioning to the menu scene when loading is complete
 * 
 * **Scene Flow:**
 * BootScene → **LoadingScene** → MenuScene → GameScene → GameOverScene
 */
export class LoadingScene extends Phaser.Scene {
  /** Graphics object for the loading bar background */
  private loadingBar!: Phaser.GameObjects.Graphics;
  /** Graphics object for the progress bar fill */
  private progressBar!: Phaser.GameObjects.Graphics;
  /** Text object displaying loading progress */
  private loadingText!: Phaser.GameObjects.Text;

  /**
   * Create a new LoadingScene instance
   * Initializes the scene with the LOADING key for scene management
   */
  constructor() {
    super({ key: SceneKeys.LOADING });
  }

  /**
   * Preload phase - set up loading UI and load all game assets
   * Creates the loading screen interface and initiates asset loading
   */
  preload(): void {
    this.setupLoadingScreen();
    this.setupLoadingEvents();
    this.loadAssets();
  }

  /**
   * Create phase - finalize animations and transition to menu
   * Called after all assets are loaded, creates animations and starts menu scene
   */
  create(): void {
    this.createAnimations();
    
    // Start menu scene with a slight delay to show completion
    this.time.delayedCall(1000, () => {
      this.scene.start(SceneKeys.MENU);
    });
  }

  /**
   * Set up the visual loading screen interface
   * Creates progress bars, loading text, and credit information
   */
  private setupLoadingScreen(): void {
    this.cameras.main.setBackgroundColor('#000000');
    
    // Create loading bar background
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 1);
    this.loadingBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      36
    );
    
    // Create progress bar (will be filled as loading progresses)
    this.progressBar = this.add.graphics();
    
    // Loading progress text
    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'Loading...',
      {
        font: '20px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    this.createCreditText();
  }

  /**
   * Create credit and challenge information text
   * Displays information about Amazon Q Developer and the AWS Build Games Challenge
   */
  private createCreditText(): void {
    // Amazon Q Developer branding
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'Amazon Q Developer',
      {
        font: 'bold 24px Arial',
        color: '#00a1c9'
      }
    ).setOrigin(0.5);
    
    // Challenge information
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      'Created for the AWS Build Games Challenge',
      {
        font: '16px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 180,
      'Generated with Amazon Q Developer',
      {
        font: '16px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
  }

  /**
   * Set up loading progress and completion event handlers
   * Handles progress bar updates and cleanup when loading is complete
   */
  private setupLoadingEvents(): void {
    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      this.updateProgressBar(value);
    });
    
    // Clean up loading UI when complete
    this.load.on('complete', () => {
      this.cleanupLoadingUI();
    });
    
    // Handle loading errors silently
    this.load.on('loaderror', (_: Phaser.Loader.File) => {
      // Asset failed to load - continue silently for better user experience
    });
  }

  /**
   * Update the visual progress bar based on loading progress
   * @param value - Loading progress as a decimal (0.0 to 1.0)
   */
  private updateProgressBar(value: number): void {
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(
      this.cameras.main.width / 4,
      this.cameras.main.height / 2 - 16,
      (this.cameras.main.width / 2) * value,
      32
    );
    this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
  }

  /**
   * Clean up loading UI elements when loading is complete
   * Destroys progress bars and loading text to free memory
   */
  private cleanupLoadingUI(): void {
    this.progressBar.destroy();
    this.loadingBar.destroy();
    this.loadingText.destroy();
  }

  /**
   * Load all game assets including images, audio, and spritesheets
   * Loads all required assets for the game to function properly
   */
  private loadAssets(): void {
    this.loadImages();
    this.loadSpritesheets();
    this.loadAudio();
  }

  /**
   * Load all static image assets
   * Includes UI elements, game objects, and background images
   */
  private loadImages(): void {
    // UI and branding images
    this.load.image(ImageKeys.LOGO, 'assets/images/logo.png');
    this.load.image(ImageKeys.BACKGROUND, 'assets/images/background.png');
    this.load.image(ImageKeys.BUTTON, 'assets/images/button.png');
    this.load.image(ImageKeys.CONTROLS, 'assets/images/controls.png');
    
    // Game object images
    this.load.image(ImageKeys.ANT_HILL, 'assets/images/ant-hill.png');
    this.load.image(ImageKeys.CHERRY, 'assets/images/cherry.png');
    this.load.image(ImageKeys.COOKIE, 'assets/images/cookie.png');
    this.load.image(ImageKeys.LEAF, 'assets/images/leaf.png');
    this.load.image(ImageKeys.LOG, 'assets/images/log.png');
    
    // Obstacle images
    this.load.image(ImageKeys.NAIL, 'assets/images/nail.png');
    this.load.image(ImageKeys.POISON, 'assets/images/poison.png');
    this.load.image(ImageKeys.SPRAY, 'assets/images/spray.png');
  }

  /**
   * Load all spritesheet assets with proper frame configurations
   * Includes animated sprites for characters and background tiles
   */
  private loadSpritesheets(): void {
    // Background tiles spritesheet (256x256 total, 64x64 per frame)
    this.load.spritesheet(ImageKeys.BACKGROUND_TILES, 'assets/images/background-tiles.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // Ant character spritesheet (1536x1024 total, 192x1024 per frame, 8 frames)
    this.load.spritesheet(ImageKeys.ANT, 'assets/images/ant-spritesheet.png', {
      frameWidth: 192, // 1536 / 8 frames = 192px per frame
      frameHeight: 1024
    });
    
    // Frog obstacle spritesheet (512x64 total, 64x64 per frame, 8 frames)
    this.load.spritesheet(ImageKeys.FROG, 'assets/images/frog-spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
  }

  /**
   * Load all audio assets including music and sound effects
   * Includes background music and interactive sound effects
   */
  private loadAudio(): void {
    // Background music
    this.load.audio(AudioKeys.MUSIC_MENU, 'assets/audio/menu-music.mp3');
    this.load.audio(AudioKeys.MUSIC_GAME, 'assets/audio/game-music.mp3');
    
    // Sound effects
    this.load.audio(AudioKeys.SFX_BUTTON, 'assets/audio/button-click.mp3');
    this.load.audio(AudioKeys.SFX_COLLECT, 'assets/audio/collect.mp3');
    this.load.audio(AudioKeys.SFX_DEATH, 'assets/audio/death.mp3');
    this.load.audio(AudioKeys.SFX_JUMP, 'assets/audio/jump.mp3');
    this.load.audio(AudioKeys.SFX_WIN, 'assets/audio/win.mp3');
  }

  /**
   * Create all sprite animations for the game
   * Defines animation sequences for all animated game objects
   */
  private createAnimations(): void {
    this.createAntAnimations();
  }

  /**
   * Create all animations for the ant character
   * Includes idle, walking, jumping, and death animations
   */
  private createAntAnimations(): void {
    // Ant idle animation (single frame to prevent flickering)
    this.anims.create({
      key: AnimationKeys.ANT_IDLE,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0
    });
    
    // Ant walking animation
    this.anims.create({
      key: AnimationKeys.ANT_WALK,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 2, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    
    // Ant jumping animation
    this.anims.create({
      key: AnimationKeys.ANT_JUMP,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 6, end: 7 }),
      frameRate: 8,
      repeat: 0
    });
    
    // Ant death animation
    this.anims.create({
      key: AnimationKeys.ANT_DEATH,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 7, end: 7 }),
      frameRate: 4,
      repeat: 0
    });
  }
}