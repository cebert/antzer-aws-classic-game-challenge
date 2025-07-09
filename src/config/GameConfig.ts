import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { GameScene } from "../scenes/GameScene";
import { LoadingScene } from "../scenes/LoadingScene";
import { MenuScene } from "../scenes/MenuScene";

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  antialias: true, // Disable for crisp pixel art
  roundPixels: true, // Enable for pixel-perfect positioning
  render: {
    pixelArt: true, // Optimize for pixel art
    antialias: false,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    min: {
      width: 400,
      height: 300
    },
    max: {
      width: 1600,
      height: 1200
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, LoadingScene, MenuScene, GameScene, GameOverScene]
};