import Phaser from 'phaser';
import { SceneKeys, ImageKeys, AudioKeys, AnimationKeys } from '../config/Constants';

export class LoadingScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private progressBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SceneKeys.LOADING });
  }

  preload(): void {
    this.cameras.main.setBackgroundColor('#000000');
    
    // Create loading bar
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillStyle(0x222222, 1);
    this.loadingBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      36
    );
    
    // Create progress bar
    this.progressBar = this.add.graphics();
    
    // Loading text
    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'Loading...',
      {
        font: '20px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Add Amazon Q logo text instead of image
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'Amazon Q Developer',
      {
        font: 'bold 24px Arial',
        color: '#00a1c9'
      }
    ).setOrigin(0.5);
    
    // Add text about the challenge
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
    
    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRect(
        this.cameras.main.width / 4,
        this.cameras.main.height / 2 - 16,
        (this.cameras.main.width / 2) * value,
        32
      );
      this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
    });
    
    // Clean up when loading complete
    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.loadingBar.destroy();
      this.loadingText.destroy();
    });
    
    // Load game assets
    this.loadAssets();
  }

  create(): void {
    // Create animations
    this.createAnimations();
    
    // Start with a slight delay to show the loading screen
    this.time.delayedCall(1000, () => {
      this.scene.start(SceneKeys.MENU);
    });
  }

  private loadAssets(): void {
    // Load images
    this.load.image(ImageKeys.LOGO, 'assets/images/logo.png');
    this.load.image(ImageKeys.BACKGROUND, 'assets/images/background.png');
    this.load.spritesheet(ImageKeys.BACKGROUND_TILES, 'assets/images/background-tiles.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(ImageKeys.ANT_HILL, 'assets/images/ant-hill.png');
    this.load.image(ImageKeys.CHERRY, 'assets/images/cherry.png');
    this.load.image(ImageKeys.COOKIE, 'assets/images/cookie.png');
    this.load.image(ImageKeys.POISON, 'assets/images/poison.png');
    this.load.image(ImageKeys.SPRAY, 'assets/images/spray.png');
    this.load.image(ImageKeys.NAIL, 'assets/images/nail.png');
    this.load.image(ImageKeys.LEAF, 'assets/images/leaf.png');
    this.load.image(ImageKeys.LOG, 'assets/images/log.png');
    this.load.image(ImageKeys.BUTTON, 'assets/images/button.png');
    this.load.image(ImageKeys.CONTROLS, 'assets/images/controls.png');
    
    // Load ant spritesheet - actual dimensions are 1536x1024, with 8 frames horizontally
    this.load.spritesheet(ImageKeys.ANT, 'assets/images/ant-spritesheet.png', {
      frameWidth: 192, // 1536 / 8 frames = 192px per frame
      frameHeight: 1024
    });
    
    this.load.spritesheet(ImageKeys.FROG, 'assets/images/frog-spritesheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // Load audio
    this.load.audio(AudioKeys.MUSIC_MENU, 'assets/audio/menu-music.mp3');
    this.load.audio(AudioKeys.MUSIC_GAME, 'assets/audio/game-music.mp3');
    this.load.audio(AudioKeys.SFX_JUMP, 'assets/audio/jump.mp3');
    this.load.audio(AudioKeys.SFX_COLLECT, 'assets/audio/collect.mp3');
    this.load.audio(AudioKeys.SFX_DEATH, 'assets/audio/death.mp3');
    this.load.audio(AudioKeys.SFX_WIN, 'assets/audio/win.mp3');
    this.load.audio(AudioKeys.SFX_BUTTON, 'assets/audio/button-click.mp3');
    
    // Add error handler for loading errors
    this.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
      console.warn('Error loading asset:', fileObj.key);
    });
  }

  private createAnimations(): void {
    // Ant animations - 8 frames total (0-7)
    // Use single frame for idle to prevent flickering
    this.anims.create({
      key: AnimationKeys.ANT_IDLE,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0
    });
    
    this.anims.create({
      key: AnimationKeys.ANT_WALK,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 2, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: AnimationKeys.ANT_JUMP,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 6, end: 7 }),
      frameRate: 8,
      repeat: 0
    });
    
    this.anims.create({
      key: AnimationKeys.ANT_DEATH,
      frames: this.anims.generateFrameNumbers(ImageKeys.ANT, { start: 7, end: 7 }),
      frameRate: 4,
      repeat: 0
    });
    
    
    // Frog animations
    this.anims.create({
      key: AnimationKeys.FROG_IDLE,
      frames: this.anims.generateFrameNumbers(ImageKeys.FROG, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    
    this.anims.create({
      key: AnimationKeys.FROG_JUMP,
      frames: this.anims.generateFrameNumbers(ImageKeys.FROG, { start: 4, end: 7 }),
      frameRate: 12,
      repeat: 0
    });
  }
}