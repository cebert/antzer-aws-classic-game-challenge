import Phaser from 'phaser';
import { SceneKeys } from '../config/Constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT });
  }

  preload(): void {
    // No need to load any assets for the loading screen
    // We'll create everything programmatically
  }

  create(): void {
    this.scene.start(SceneKeys.LOADING);
  }
}