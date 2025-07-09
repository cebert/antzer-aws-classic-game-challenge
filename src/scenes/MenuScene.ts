import Phaser from "phaser";
import { AudioKeys, ImageKeys, SceneKeys } from "../config/Constants";
import { AudioManager } from "../utils/AudioManager";

export class MenuScene extends Phaser.Scene {
  private music!: Phaser.Sound.BaseSound;
  private audioManager!: AudioManager;

  constructor() {
    super({ key: SceneKeys.MENU });
  }

  create(): void {
    // Stop any existing audio from previous scenes
    this.sound.stopAll();
    
    // Initialize audio manager
    this.audioManager = new AudioManager(this);
    
    // Add background
    this.add.image(0, 0, ImageKeys.BACKGROUND)
      .setOrigin(0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    
    // Add logo - with much smaller size considering the 1024x1024 original
    const logo = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 4,
      ImageKeys.LOGO
    ).setOrigin(0.5)
     .setDisplaySize(120, 120); // Set a smaller size for the logo
    
    // Add start button
    const startButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(
      startButton.x,
      startButton.y,
      'START GAME',
      {
        font: '18px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Add controls button
    const controlsButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(
      controlsButton.x,
      controlsButton.y,
      'CONTROLS',
      {
        font: '18px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Add credits text
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      'Created for the AWS Build Games Challenge\nGenerated with Amazon Q Developer (w/ minimal time investment)',
      {
        font: '16px Arial',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    
    // Button interactions
    startButton.on('pointerover', () => {
      startButton.setTint(0xcccccc);
    });
    
    startButton.on('pointerout', () => {
      startButton.clearTint();
    });
    
    startButton.on('pointerdown', () => {
      this.sound.play(AudioKeys.SFX_BUTTON);
      this.startGame();
    });
    
    controlsButton.on('pointerover', () => {
      controlsButton.setTint(0xcccccc);
    });
    
    controlsButton.on('pointerout', () => {
      controlsButton.clearTint();
    });
    
    controlsButton.on('pointerdown', () => {
      this.sound.play(AudioKeys.SFX_BUTTON);
      this.showControls();
    });
    
    // Set up menu music using AudioManager
    this.music = this.audioManager.add(AudioKeys.MUSIC_MENU, { loop: true, volume: 0.4 });
    
    // Start music after user interaction (required by modern browsers)
    this.startMenuMusicOnInteraction();
    
    // Add animation to logo
    this.tweens.add({
      targets: logo,
      y: logo.y - 10,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  private startGame(): void {
    if (this.music) {
      this.music.stop();
    }
    this.scene.start(SceneKeys.GAME);
  }

  private startMenuMusicOnInteraction(): void {
    // Start music on first user interaction (keyboard or click)
    const startMusic = () => {
      if (!this.music.isPlaying) {
        try {
          this.music.play();
        } catch (error) {
          console.warn('Could not start menu music:', error);
        }
      }
      // Remove listeners after first interaction
      this.input.keyboard?.off('keydown', startMusic);
      this.input.off('pointerdown', startMusic);
    };

    // Listen for keyboard or pointer interaction
    this.input.keyboard?.on('keydown', startMusic);
    this.input.on('pointerdown', startMusic);
    
    // Also try to start immediately (might work if audio context is already unlocked)
    try {
      this.music.play();
    } catch (error) {
      // Ignore - will start on user interaction
    }
  }


  private showControls(): void {
    // Create a container for all modal elements
    const modalContainer = this.add.container(0, 0);
    
    // Create a modal background
    const modal = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      500,
      400,
      0x000000,
      0.8
    ).setOrigin(0.5);
    modalContainer.add(modal);
    
    // Add controls image
    const controlsImage = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      ImageKeys.CONTROLS
    ).setOrigin(0.5)
     .setDisplaySize(200, 150);
    modalContainer.add(controlsImage);
    
    // Add controls title
    const titleText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 150,
      'CONTROLS',
      {
        font: '32px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    modalContainer.add(titleText);
    
    // Add controls description
    const descText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      'Desktop: Arrow Keys\nMobile: Touch the directional buttons',
      {
        font: '20px Arial',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
    modalContainer.add(descText);
    
    // Add close button
    const closeButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    modalContainer.add(closeButton);
    
    // Add close text
    const closeText = this.add.text(
      closeButton.x,
      closeButton.y,
      'CLOSE',
      {
        font: '20px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    modalContainer.add(closeText);
    
    // Close button functionality
    closeButton.on('pointerdown', () => {
      this.sound.play(AudioKeys.SFX_BUTTON);
      modalContainer.destroy(); // This will destroy all children in the container
    });
  }
}