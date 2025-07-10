/**
 * @fileoverview Main menu scene for the Antzer game
 * Displays the game logo, navigation buttons, and handles user interactions
 * Includes background music and animated elements for visual appeal
 */

import Phaser from "phaser";
import { AudioKeys, ImageKeys, SceneKeys } from "../config/Constants";
import { AudioManager } from "../utils/AudioManager";

/**
 * MenuScene class - the main menu interface for the game
 * 
 * This scene provides:
 * - Game logo with floating animation
 * - Start game button to begin gameplay
 * - Controls button to show game instructions
 * - Background music with user interaction handling
 * - Credit information about the game's creation
 * - Modal dialog for displaying controls
 * 
 * **Scene Flow:**
 * BootScene → LoadingScene → **MenuScene** → GameScene → GameOverScene
 */
export class MenuScene extends Phaser.Scene {
  /** Background music for the menu */
  private music!: Phaser.Sound.BaseSound;
  /** Audio manager for handling sound effects and music */
  private audioManager!: AudioManager;

  /**
   * Create a new MenuScene instance
   * Initializes the scene with the MENU key for scene management
   */
  constructor() {
    super({ key: SceneKeys.MENU });
  }

  /**
   * Create phase - set up the menu interface and interactions
   * Called after the scene is started, creates all UI elements and sets up event handlers
   */
  create(): void {
    this.initializeAudio();
    this.createBackground();
    this.createLogo();
    this.createButtons();
    this.createCredits();
    this.setupMusic();
  }

  /**
   * Initialize audio systems and stop any existing sounds
   * Ensures clean audio state when entering the menu
   */
  private initializeAudio(): void {
    // Stop any existing audio from previous scenes
    this.sound.stopAll();
    
    // Initialize audio manager for sound effects
    this.audioManager = new AudioManager(this);
  }

  /**
   * Create the background image for the menu
   * Scales the background to fit the entire screen
   */
  private createBackground(): void {
    this.add.image(0, 0, ImageKeys.BACKGROUND)
      .setOrigin(0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  /**
   * Create and animate the game logo
   * Adds a floating animation to make the logo more visually appealing
   */
  private createLogo(): void {
    const logo = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 4,
      ImageKeys.LOGO
    ).setOrigin(0.5)
     .setDisplaySize(120, 120);
    
    // Add floating animation to the logo
    this.tweens.add({
      targets: logo,
      y: logo.y - 10,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Create all menu buttons with interactions
   * Includes start game and controls buttons with hover effects
   */
  private createButtons(): void {
    this.createStartButton();
    this.createControlsButton();
  }

  /**
   * Create the start game button with interactions
   * Handles button styling, hover effects, and click functionality
   */
  private createStartButton(): void {
    const startButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    // Add button text
    this.add.text(
      startButton.x,
      startButton.y,
      'START GAME',
      {
        font: '18px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    this.setupButtonInteractions(startButton, () => this.startGame());
  }

  /**
   * Create the controls button with interactions
   * Handles button styling, hover effects, and click functionality
   */
  private createControlsButton(): void {
    const controlsButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    // Add button text
    this.add.text(
      controlsButton.x,
      controlsButton.y,
      'CONTROLS',
      {
        font: '18px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    this.setupButtonInteractions(controlsButton, () => this.showControls());
  }

  /**
   * Set up button interaction handlers for hover and click effects
   * @param button - The button game object to add interactions to
   * @param clickHandler - Function to call when the button is clicked
   */
  private setupButtonInteractions(
    button: Phaser.GameObjects.Image, 
    clickHandler: () => void
  ): void {
    // Hover effects
    button.on('pointerover', () => {
      button.setTint(0xcccccc);
    });
    
    button.on('pointerout', () => {
      button.clearTint();
    });
    
    // Click handler with sound effect
    button.on('pointerdown', () => {
      this.sound.play(AudioKeys.SFX_BUTTON);
      clickHandler();
    });
  }

  /**
   * Create credit text at the bottom of the screen
   * Displays information about the game's creation and the AWS Build Games Challenge
   */
  private createCredits(): void {
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
  }

  /**
   * Set up background music with user interaction handling
   * Modern browsers require user interaction before playing audio
   */
  private setupMusic(): void {
    this.music = this.audioManager.add(AudioKeys.MUSIC_MENU, { 
      loop: true, 
      volume: 0.4 
    });
    
    this.startMenuMusicOnInteraction();
  }

  /**
   * Start background music after user interaction
   * Required by modern browser audio policies - music can only start after user interaction
   */
  private startMenuMusicOnInteraction(): void {
    const startMusic = () => {
      if (!this.music.isPlaying) {
        try {
          this.music.play();
        } catch (error) {
          // Music failed to start - continue silently for better user experience
        }
      }
      // Remove listeners after first interaction to prevent multiple calls
      this.input.keyboard?.off('keydown', startMusic);
      this.input.off('pointerdown', startMusic);
    };

    // Listen for any user interaction
    this.input.keyboard?.on('keydown', startMusic);
    this.input.on('pointerdown', startMusic);
    
    // Try to start immediately (might work if audio context is already unlocked)
    try {
      this.music.play();
    } catch (error) {
      // Will start on user interaction instead
    }
  }

  /**
   * Start the game and transition to the game scene
   * Stops menu music and switches to the main game scene
   */
  private startGame(): void {
    if (this.music) {
      this.music.stop();
    }
    this.scene.start(SceneKeys.GAME);
  }

  /**
   * Show the controls modal dialog
   * Creates a modal overlay with game control instructions for desktop and mobile
   */
  private showControls(): void {
    const modalContainer = this.createControlsModal();
    this.populateControlsModal(modalContainer);
    this.setupControlsModalClose(modalContainer);
  }

  /**
   * Create the base modal container and background
   * @returns The modal container for adding content
   */
  private createControlsModal(): Phaser.GameObjects.Container {
    const modalContainer = this.add.container(0, 0);
    
    // Create semi-transparent modal background
    const modal = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      500,
      400,
      0x000000,
      0.8
    ).setOrigin(0.5);
    
    modalContainer.add(modal);
    return modalContainer;
  }

  /**
   * Populate the controls modal with content
   * @param modalContainer - The container to add content to
   */
  private populateControlsModal(modalContainer: Phaser.GameObjects.Container): void {
    // Modal title
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
    
    // Controls image
    const controlsImage = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      ImageKeys.CONTROLS
    ).setOrigin(0.5)
     .setDisplaySize(200, 150);
    modalContainer.add(controlsImage);
    
    // Controls description
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
  }

  /**
   * Set up the close button for the controls modal
   * @param modalContainer - The modal container to close when button is clicked
   */
  private setupControlsModalClose(modalContainer: Phaser.GameObjects.Container): void {
    // Close button
    const closeButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    modalContainer.add(closeButton);
    
    // Close button text
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
      modalContainer.destroy(); // Destroys all children in the container
    });
  }
}