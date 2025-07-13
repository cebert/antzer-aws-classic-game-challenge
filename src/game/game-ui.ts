/**
 * @fileoverview User interface management system for the game
 * Handles score display, timer, mobile controls, and UI interactions
 */

import Phaser from 'phaser';
import { SceneKeys, AudioKeys, GRID_SIZE } from '../config/constants';
import { AudioManager } from '../utils/audio-manager';

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
const MOBILE_BUTTON_COLOR = 0xFFFFFF; // White background for contrast
const MOBILE_BUTTON_ALPHA = 0.9; // Higher alpha for better visibility
const MOBILE_BUTTON_STROKE_COLOR = 0x888888; // Gray border
const MOBILE_BUTTON_STROKE_WIDTH = 3; // Thicker border
const MOBILE_BUTTON_ACTIVE_COLOR = 0xCCCCCC; // Light gray when pressed
const MOBILE_BUTTON_ACTIVE_ALPHA = 1.0; // Full opacity when pressed
const MOBILE_BUTTON_FONT_SIZE = '28px'; // Larger font for better visibility
const MOBILE_BUTTON_TEXT_COLOR = '#000000'; // Black text on white background

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

  /** HTML mobile control container */
  private mobileControlsContainer?: HTMLElement;

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
   * Mobile controls are now handled internally via HTML elements
   * This method is kept for compatibility but does nothing
   */
  public setMobileControlCallbacks(callbacks: {
    up: () => void;
    down: () => void;
    left: () => void;
    right: () => void;
  }): void {
    // HTML mobile controls handle callbacks internally
    // This method is kept for compatibility with existing code
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
    // Detect mobile devices and touch capability
    const isMobile = this.detectMobileDevice();
    
    if (!isMobile) return;

    // Create HTML-based mobile controls in the letterbox area
    this.createHTMLMobileControls();
  }

  /**
   * Creates HTML-based mobile controls positioned in the letterbox area
   */
  private createHTMLMobileControls(): void {
    // Create container for mobile controls
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'mobile-controls-container';
    controlsContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 200px;
      z-index: 1000;
      pointer-events: none;
    `;

    // Create individual control buttons
    const buttons = [
      { id: 'up', symbol: '↑', x: 70, y: 0, callback: () => this.scene.registry.get('player')?.moveUp() },
      { id: 'down', symbol: '↓', x: 70, y: 140, callback: () => this.scene.registry.get('player')?.moveDown() },
      { id: 'left', symbol: '←', x: 0, y: 70, callback: () => this.scene.registry.get('player')?.moveLeft() },
      { id: 'right', symbol: '→', x: 140, y: 70, callback: () => this.scene.registry.get('player')?.moveRight() }
    ];

    buttons.forEach(button => {
      const buttonElement = document.createElement('div');
      buttonElement.id = `mobile-${button.id}-button`;
      buttonElement.textContent = button.symbol;
      buttonElement.style.cssText = `
        position: absolute;
        left: ${button.x}px;
        top: ${button.y}px;
        width: 60px;
        height: 60px;
        background-color: rgba(255, 255, 255, 0.9);
        border: 3px solid #888888;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: bold;
        color: #000000;
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        pointer-events: auto;
        cursor: pointer;
        text-shadow: 1px 1px 2px rgba(136, 136, 136, 0.5);
        transition: all 0.1s ease;
      `;

      // Add touch event handlers
      const handlePress = () => {
        buttonElement.style.backgroundColor = 'rgba(204, 204, 204, 1.0)';
        buttonElement.style.transform = 'scale(0.95)';
        button.callback();
      };

      const handleRelease = () => {
        buttonElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        buttonElement.style.transform = 'scale(1.0)';
      };

      buttonElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePress();
      });

      buttonElement.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleRelease();
      });

      buttonElement.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        handleRelease();
      });

      // Also support mouse events for testing
      buttonElement.addEventListener('mousedown', handlePress);
      buttonElement.addEventListener('mouseup', handleRelease);
      buttonElement.addEventListener('mouseleave', handleRelease);

      controlsContainer.appendChild(buttonElement);
    });

    // Add to page
    document.body.appendChild(controlsContainer);

    // Store reference for cleanup
    this.mobileControlsContainer = controlsContainer;
  }

  /**
   * Creates a single mobile control button
   * @param x - X position for the button
   * @param y - Y position for the button
   * @param symbol - Symbol to display on the button
  /**
   * Detects if the device is mobile or has touch capability
   */
  private detectMobileDevice(): boolean {
    // Testing override: add ?mobile=true to URL to force mobile controls on desktop
    if (window.location.search.includes('mobile=true')) return true;
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check for mobile OS
    const isMobileOS = this.scene.sys.game.device.os.android || 
                      this.scene.sys.game.device.os.iOS || 
                      this.scene.sys.game.device.os.windowsPhone;
    
    // Check for small screen size
    const isSmallScreen = this.scene.cameras.main.width < MOBILE_DETECTION_WIDTH_THRESHOLD;
    
    // Check user agent for mobile indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUserAgent = /mobile|android|iphone|ipad|phone|tablet|touch/i.test(userAgent);
    
    // Return true if any mobile indicator is present
    return hasTouch || isMobileOS || isSmallScreen || isMobileUserAgent;
  }

  /**
   * Cleanup method to remove HTML mobile controls
   */
  public destroy(): void {
    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.remove();
      this.mobileControlsContainer = undefined;
    }
  }
}
