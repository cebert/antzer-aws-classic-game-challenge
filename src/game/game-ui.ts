/**
 * @fileoverview User interface management system for the game
 * Handles score display, timer, mobile controls, and UI interactions
 */

import Phaser from 'phaser';
import { SceneKeys, AudioKeys, GRID_SIZE } from '../config/constants';
import { AudioManager } from '../utils/audio-manager';

// Constants for UI layout and behavior
const UI_MARGIN = 20;
const UI_FONT_SIZE = '24px';
const UI_FONT_FAMILY = 'Arial';
const UI_TEXT_COLOR = '#ffffff';
const UI_SHADOW_OFFSET = 2;
const UI_SHADOW_COLOR = '#000000';

const BUTTON_FONT_SIZE = '18px';
const BUTTON_BACKGROUND_COLOR = '#000000';
const BUTTON_PADDING = { x: 10, y: 5 };

const INSTRUCTIONS_FONT_SIZE = '18px';
const INSTRUCTIONS_BACKGROUND = 'rgba(0,0,0,0.5)';
const INSTRUCTIONS_PADDING = { x: 15, y: 10 };
const INSTRUCTIONS_DISPLAY_TIME = 2000;
const INSTRUCTIONS_DEPTH = 2000;

const MOBILE_BUTTON_SIZE = 60;
const MOBILE_BUTTON_MARGIN = 20;
const MOBILE_BUTTON_SPACING = 10;
const MOBILE_BUTTON_COLOR = 0x333333;
const MOBILE_BUTTON_ALPHA = 0.7;
const MOBILE_BUTTON_STROKE_COLOR = 0x666666;
const MOBILE_BUTTON_STROKE_WIDTH = 2;
const MOBILE_BUTTON_ACTIVE_COLOR = 0x555555;
const MOBILE_BUTTON_ACTIVE_ALPHA = 0.8;
const MOBILE_BUTTON_FONT_SIZE = '24px';

const MOBILE_DETECTION_WIDTH_THRESHOLD = 800;

/**
 * Game UI class responsible for managing all user interface elements.
 * 
 * This class provides:
 * - Score and timer display with real-time updates
 * - Mobile control buttons for touch devices
 * - Game instructions and help text
 * - Exit button functionality
 * - Collectible sprite management
 * 
 * The UI system automatically detects mobile devices and shows appropriate
 * controls while maintaining consistent styling across all elements.
 */
export class GameUI {
  /** Reference to the Phaser scene */
  private scene: Phaser.Scene;
  /** Reference to the audio manager */
  private audioManager: AudioManager;
  /** Text object displaying the current score */
  private scoreText!: Phaser.GameObjects.Text;
  /** Text object displaying the elapsed time */
  private timeText!: Phaser.GameObjects.Text;
  /** Timestamp when the game started */
  private startTime: number;
  /** Current game score */
  private score: number = 0;

  /** Mobile control button containers */
  private mobileControls: {
    upButton?: Phaser.GameObjects.Container;
    downButton?: Phaser.GameObjects.Container;
    leftButton?: Phaser.GameObjects.Container;
    rightButton?: Phaser.GameObjects.Container;
  } = {};

  /**
   * Creates a new GameUI instance
   * @param scene - The Phaser scene to create UI elements in
   * @param audioManager - The audio manager for sound effects
   */
  constructor(scene: Phaser.Scene, audioManager: AudioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.startTime = scene.time.now;
  }

  /**
   * Creates all UI elements including score, timer, buttons, and mobile controls
   */
  public create(): void {
    this.createScoreAndTimer();
    this.createExitButton();
    this.createInstructions();
    this.createMobileControls();
  }

  /**
   * Updates the score display and adds points to the current score
   * @param points - Number of points to add to the score
   */
  public updateScore(points: number): void {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  /**
   * Gets the current game score
   * @returns The current score value
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * Updates the timer display with the current elapsed time
   */
  public updateTimer(): void {
    const elapsed = this.getElapsedTime();
    this.timeText.setText(`Time: ${elapsed}`);
  }

  /**
   * Gets the formatted elapsed time string
   * @returns Formatted time string in MM:SS format
   */
  public getElapsedTime(): string {
    const elapsed = Math.floor((this.scene.time.now - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Removes a collectible sprite from the game at the specified grid position
   * @param row - Grid row where the collectible was located
   * @param col - Grid column where the collectible was located
   * @param collectibles - Physics group containing collectible sprites
   */
  public removeCollectibleSprite(
    row: number, 
    col: number, 
    collectibles: Phaser.Physics.Arcade.Group
  ): void {
    collectibles.getChildren().forEach((collectible) => {
      const sprite = collectible as any;
      const spriteRow = Math.floor(sprite.y / GRID_SIZE);
      const spriteCol = Math.floor(sprite.x / GRID_SIZE);
      
      if (spriteRow === row && spriteCol === col) {
        sprite.destroy();
      }
    });
  }

  /**
   * Sets callback functions for mobile control buttons
   * @param callbacks - Object containing callback functions for each direction
   */
  public setMobileControlCallbacks(callbacks: {
    up: () => void;
    down: () => void;
    left: () => void;
    right: () => void;
  }): void {
    if (this.mobileControls.upButton) {
      this.setButtonCallback(this.mobileControls.upButton, callbacks.up);
    }
    if (this.mobileControls.downButton) {
      this.setButtonCallback(this.mobileControls.downButton, callbacks.down);
    }
    if (this.mobileControls.leftButton) {
      this.setButtonCallback(this.mobileControls.leftButton, callbacks.left);
    }
    if (this.mobileControls.rightButton) {
      this.setButtonCallback(this.mobileControls.rightButton, callbacks.right);
    }
  }

  /**
   * Creates the score and timer display elements
   * @private
   */
  private createScoreAndTimer(): void {
    // Score text
    this.scoreText = this.scene.add.text(
      UI_MARGIN,
      UI_MARGIN,
      `Score: ${this.score}`,
      {
        font: `${UI_FONT_SIZE} ${UI_FONT_FAMILY}`,
        color: UI_TEXT_COLOR
      }
    ).setScrollFactor(0)
      .setShadow(UI_SHADOW_OFFSET, UI_SHADOW_OFFSET, UI_SHADOW_COLOR, UI_SHADOW_OFFSET);
    
    // Time text
    this.timeText = this.scene.add.text(
      this.scene.cameras.main.width - 150,
      UI_MARGIN,
      'Time: 0:00',
      {
        font: `${UI_FONT_SIZE} ${UI_FONT_FAMILY}`,
        color: UI_TEXT_COLOR
      }
    ).setScrollFactor(0)
      .setShadow(UI_SHADOW_OFFSET, UI_SHADOW_OFFSET, UI_SHADOW_COLOR, UI_SHADOW_OFFSET);
  }

  /**
   * Creates the exit button that returns to the main menu
   * @private
   */
  private createExitButton(): void {
    const backButton = this.scene.add.text(
      this.scene.cameras.main.width - 80,
      this.scene.cameras.main.height - 30,
      'EXIT',
      {
        font: `${BUTTON_FONT_SIZE} ${UI_FONT_FAMILY}`,
        color: UI_TEXT_COLOR,
        backgroundColor: BUTTON_BACKGROUND_COLOR,
        padding: BUTTON_PADDING
      }
    ).setScrollFactor(0)
      .setShadow(1, 1, UI_SHADOW_COLOR, 1)
      .setInteractive({ useHandCursor: true });
      
    backButton.on('pointerdown', () => {
      this.audioManager.stop(AudioKeys.MUSIC_GAME);
      this.scene.scene.start(SceneKeys.MENU);
    });
  }

  /**
   * Creates the instruction text that appears at game start
   * @private
   */
  private createInstructions(): void {
    const instructions = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height - 100,
      'Use ARROW KEYS to move the ant\nReach the ant hill at the top!',
      {
        font: `${INSTRUCTIONS_FONT_SIZE} ${UI_FONT_FAMILY}`,
        color: UI_TEXT_COLOR,
        align: 'center',
        backgroundColor: INSTRUCTIONS_BACKGROUND,
        padding: INSTRUCTIONS_PADDING
      }
    ).setOrigin(0.5)
     .setScrollFactor(0)
     .setDepth(INSTRUCTIONS_DEPTH);
     
    // Remove instructions on any key press
    this.scene.input.keyboard?.on('keydown', () => {
      if (instructions && instructions.active) {
        instructions.destroy();
      }
    });
    
    // Also fade out after specified time
    this.scene.time.delayedCall(INSTRUCTIONS_DISPLAY_TIME, () => {
      if (instructions && instructions.active) {
        instructions.destroy();
      }
    });
  }

  /**
   * Creates mobile control buttons if on a mobile device
   * @private
   */
  private createMobileControls(): void {
    // Check if we're on a mobile device or small screen
    const isMobile = this.scene.sys.game.device.os.android || 
                     this.scene.sys.game.device.os.iOS || 
                     this.scene.sys.game.device.os.windowsPhone || 
                     this.scene.cameras.main.width < MOBILE_DETECTION_WIDTH_THRESHOLD;
    
    if (!isMobile) return;

    const leftPadX = MOBILE_BUTTON_MARGIN + MOBILE_BUTTON_SIZE;
    const leftPadY = this.scene.cameras.main.height - MOBILE_BUTTON_MARGIN - MOBILE_BUTTON_SIZE;

    // Create control buttons (callbacks will be set externally)
    this.mobileControls.upButton = this.createControlButton(
      leftPadX, leftPadY - MOBILE_BUTTON_SIZE - MOBILE_BUTTON_SPACING, '↑'
    );

    this.mobileControls.downButton = this.createControlButton(
      leftPadX, leftPadY + MOBILE_BUTTON_SIZE + MOBILE_BUTTON_SPACING, '↓'
    );

    this.mobileControls.leftButton = this.createControlButton(
      leftPadX - MOBILE_BUTTON_SIZE - MOBILE_BUTTON_SPACING, leftPadY, '←'
    );

    this.mobileControls.rightButton = this.createControlButton(
      leftPadX + MOBILE_BUTTON_SIZE + MOBILE_BUTTON_SPACING, leftPadY, '→'
    );
  }

  /**
   * Creates a single mobile control button
   * @param x - X position for the button
   * @param y - Y position for the button
   * @param symbol - Symbol to display on the button
   * @returns The created button container
   * @private
   */
  private createControlButton(x: number, y: number, symbol: string): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Create button background
    const background = this.scene.add.circle(0, 0, MOBILE_BUTTON_SIZE / 2, MOBILE_BUTTON_COLOR, MOBILE_BUTTON_ALPHA);
    background.setStrokeStyle(MOBILE_BUTTON_STROKE_WIDTH, MOBILE_BUTTON_STROKE_COLOR);
    
    // Create button text
    const text = this.scene.add.text(0, 0, symbol, {
      fontSize: MOBILE_BUTTON_FONT_SIZE,
      color: UI_TEXT_COLOR,
      align: 'center'
    }).setOrigin(0.5);

    // Add to container
    container.add([background, text]);
    container.setScrollFactor(0);

    return container;
  }

  /**
   * Sets a callback function for a mobile control button
   * @param container - The button container
   * @param callback - The callback function to execute on button press
   * @private
   */
  private setButtonCallback(container: Phaser.GameObjects.Container, callback: () => void): void {
    const background = container.list[0] as Phaser.GameObjects.Arc;
    
    background.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        background.setFillStyle(MOBILE_BUTTON_ACTIVE_COLOR, MOBILE_BUTTON_ACTIVE_ALPHA);
        callback();
      })
      .on('pointerup', () => {
        background.setFillStyle(MOBILE_BUTTON_COLOR, MOBILE_BUTTON_ALPHA);
      })
      .on('pointerout', () => {
        background.setFillStyle(MOBILE_BUTTON_COLOR, MOBILE_BUTTON_ALPHA);
      });
  }
}
