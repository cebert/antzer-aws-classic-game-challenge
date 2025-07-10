/**
 * @fileoverview Boot scene for the Antzer game
 * Initial scene that immediately transitions to the loading scene
 * Part of the Phaser scene lifecycle for proper game initialization
 */

import Phaser from 'phaser';
import { SceneKeys } from '../config/Constants';

/**
 * BootScene class - the first scene in the game lifecycle
 * 
 * This scene serves as the entry point for the game and immediately
 * transitions to the loading scene. It's part of the standard Phaser
 * pattern for game initialization and ensures proper scene management.
 * 
 * **Scene Flow:**
 * BootScene → LoadingScene → MenuScene → GameScene → GameOverScene
 */
export class BootScene extends Phaser.Scene {
  /**
   * Create a new BootScene instance
   * Initializes the scene with the BOOT key for scene management
   */
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  /**
   * Preload phase - no assets needed for boot scene
   * The boot scene doesn't require any assets as it immediately
   * transitions to the loading scene where all assets are loaded
   */
  preload(): void {
    // No assets needed - boot scene transitions immediately to loading
  }

  /**
   * Create phase - immediately start the loading scene
   * Transitions the game to the loading scene where all game assets
   * will be loaded and the game will be properly initialized
   */
  create(): void {
    this.scene.start(SceneKeys.LOADING);
  }
}