/**
 * @fileoverview Game over scene for the Antzer game
 * Displays final game results, score, and provides options to replay or return to menu
 * Handles both win and lose conditions with appropriate visual feedback
 */

import Phaser from "phaser";
import { AudioKeys, ImageKeys, SceneKeys } from "../config/constants";
import { AudioManager } from "../utils/audio-manager";

/**
 * Game over data interface containing final game statistics
 * Passed from the game scene when the game ends
 */
interface GameOverData {
  /** Final score achieved by the player */
  score: number;
  /** Formatted completion time string (e.g., "2:34") */
  time: string;
  /** Whether the player won (reached the goal) or lost */
  won: boolean;
}

/**
 * GameOverScene class - displays game results and navigation options
 * 
 * This scene provides:
 * - Win/lose status display with appropriate colors and messages
 * - Final score and completion time statistics
 * - Play again button to restart the game
 * - Menu button to return to the main menu
 * - Visual feedback based on game outcome (win/lose)
 * - Credit information about the game's creation
 * 
 * **Scene Flow:**
 * BootScene → LoadingScene → MenuScene → GameScene → **GameOverScene**
 */
export class GameOverScene extends Phaser.Scene {
  /** Game statistics passed from the previous scene */
  private gameData: GameOverData = { score: 0, time: '0:00', won: false };
  /** Audio manager for handling sound effects */
  private audioManager!: AudioManager;

  /**
   * Create a new GameOverScene instance
   * Initializes the scene with the GAME_OVER key for scene management
   */
  constructor() {
    super({ key: SceneKeys.GAME_OVER });
  }

  /**
   * Initialize phase - receive game data from the previous scene
   * @param data - Game statistics including score, time, and win status
   */
  init(data: GameOverData): void {
    this.gameData = data;
  }

  /**
   * Create phase - set up the game over interface
   * Called after the scene is started, creates all UI elements based on game outcome
   */
  create(): void {
    this.initializeAudio();
    this.createBackground();
    this.createTitle();
    this.createGameStats();
    this.createMessage();
    this.createButtons();
    this.createCredits();
  }

  /**
   * Initialize audio systems for sound effects
   * Sets up the audio manager for button click sounds
   */
  private initializeAudio(): void {
    this.audioManager = new AudioManager(this);
  }

  /**
   * Create the background with appropriate tinting based on game outcome
   * Uses different tints for win (yellowish) vs lose (reddish) conditions
   */
  private createBackground(): void {
    const backgroundTint = this.gameData.won ? 0xffffcc : 0xffcccc;
    
    this.add.image(0, 0, ImageKeys.BACKGROUND)
      .setOrigin(0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setTint(backgroundTint);
  }

  /**
   * Create the main title text based on game outcome
   * Displays "YOU WIN!" in green for victory or "GAME OVER" in red for defeat
   */
  private createTitle(): void {
    const titleText = this.gameData.won ? 'YOU WIN!' : 'GAME OVER';
    const titleColor = this.gameData.won ? '#00ff00' : '#ff0000';
    
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 4,
      titleText,
      {
        font: '64px Arial',
        color: titleColor
      }
    ).setOrigin(0.5)
      .setShadow(3, 3, '#000000', 5);
  }

  /**
   * Create game statistics display showing score and completion time
   * Shows the final score and formatted completion time
   */
  private createGameStats(): void {
    // Final score display
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      `Final Score: ${this.gameData.score}`,
      {
        font: '32px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5)
      .setShadow(2, 2, '#000000', 3);
    
    // Completion time display
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      `Completion Time: ${this.gameData.time}`,
      {
        font: '32px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5)
      .setShadow(2, 2, '#000000', 3);
  }

  /**
   * Create contextual message based on game outcome
   * Shows congratulations for victory or encouragement for defeat
   */
  private createMessage(): void {
    const message = this.gameData.won
      ? 'Congratulations! You reached the ant hill safely!'
      : 'Oh no! Your ant didn\'t make it!';
    
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50,
      message,
      {
        font: '24px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5)
      .setShadow(2, 2, '#000000', 2);
  }

  /**
   * Create navigation buttons for player actions
   * Includes play again and return to menu options
   */
  private createButtons(): void {
    this.createPlayAgainButton();
    this.createMenuButton();
  }

  /**
   * Create the play again button with interactions
   * Allows the player to immediately restart the game
   */
  private createPlayAgainButton(): void {
    const playAgainButton = this.add.image(
      this.cameras.main.width / 2 - 125,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    // Button text
    this.add.text(
      playAgainButton.x,
      playAgainButton.y,
      'PLAY AGAIN',
      {
        font: '20px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Button functionality
    playAgainButton.on('pointerdown', () => {
      this.audioManager.play(AudioKeys.SFX_BUTTON);
      this.sound.stopAll(); // Clean up audio before scene transition
      this.scene.start(SceneKeys.GAME);
    });
  }

  /**
   * Create the menu button with interactions
   * Allows the player to return to the main menu
   */
  private createMenuButton(): void {
    const menuButton = this.add.image(
      this.cameras.main.width / 2 + 125,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    // Button text
    this.add.text(
      menuButton.x,
      menuButton.y,
      'MENU',
      {
        font: '20px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Button functionality
    menuButton.on('pointerdown', () => {
      this.audioManager.play(AudioKeys.SFX_BUTTON);
      this.sound.stopAll(); // Clean up audio before scene transition
      this.scene.start(SceneKeys.MENU);
    });
  }

  /**
   * Create credit information at the bottom of the screen
   * Displays information about the game's creation and inspiration
   */
  private createCredits(): void {
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      'Created for the AWS Build Games Challenge\nGenerated with Amazon Q Developer\nGame inspired by Ryan',
      {
        font: '16px Arial',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
  }
}