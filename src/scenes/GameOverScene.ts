import Phaser from "phaser";
import { AudioKeys, ImageKeys, SceneKeys } from "../config/Constants";
import { AudioManager } from "../utils/AudioManager";

interface GameOverData {
  score: number;
  time: string;
  won: boolean;
}

export class GameOverScene extends Phaser.Scene {
  private gameData: GameOverData = { score: 0, time: '0:00', won: false };
  private audioManager!: AudioManager;

  constructor() {
    super({ key: SceneKeys.GAME_OVER });
  }

  init(data: GameOverData): void {
    this.gameData = data;
  }

  create(): void {
    // Initialize audio manager
    this.audioManager = new AudioManager(this);
    
    // Add background
    this.add.image(0, 0, ImageKeys.BACKGROUND)
      .setOrigin(0)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
      .setTint(this.gameData.won ? 0xffffcc : 0xffcccc);
    
    // Add title
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
    
    // Add score and time
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
    
    // Add message
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
    
    // Add buttons
    const playAgainButton = this.add.image(
      this.cameras.main.width / 2 - 125,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(
      playAgainButton.x,
      playAgainButton.y,
      'PLAY AGAIN',
      {
        font: '20px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    const menuButton = this.add.image(
      this.cameras.main.width / 2 + 125,
      this.cameras.main.height / 2 + 150,
      ImageKeys.BUTTON
    ).setOrigin(0.5)
      .setDisplaySize(250, 60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(
      menuButton.x,
      menuButton.y,
      'MENU',
      {
        font: '20px Arial',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    // Button interactions
    playAgainButton.on('pointerdown', () => {
      this.audioManager.play(AudioKeys.SFX_BUTTON);
      // Stop all music before starting new scene
      this.sound.stopAll();
      this.scene.start(SceneKeys.GAME);
    });
    
    menuButton.on('pointerdown', () => {
      this.audioManager.play(AudioKeys.SFX_BUTTON);
      // Stop all music before starting new scene
      this.sound.stopAll();
      this.scene.start(SceneKeys.MENU);
    });
    
    // Add credits
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      'Created for the AWS Build Games Challenge\nGenerated with Amazon Q Developer',
      {
        font: '16px Arial',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);
  }
}