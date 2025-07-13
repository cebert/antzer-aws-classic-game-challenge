import Phaser from "phaser";
import { BootScene } from "../scenes/boot-scene";
import { GameOverScene } from "../scenes/game-over-scene";
import { GameScene } from "../scenes/game-scene";
import { LoadingScene } from "../scenes/loading-scene";
import { MenuScene } from "../scenes/menu-scene";

/**
 * @fileoverview Phaser game configuration for the Antzer game
 * Contains all game initialization settings including rendering, physics, scaling, and scene management
 */


/**
 * Main Phaser game configuration object
 */
export const GameConfig: Phaser.Types.Core.GameConfig = {
  backgroundColor: '#000000',
  
  fps: {
    deltaHistory: 10,
    forceSetTimeOut: false,
    panicMax: 120,
    smoothStep: true,
    target: 60
  },
  parent: 'game',
  physics: {
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    },
    default: 'arcade'
  },
  render: {
    antialias: true,
    pixelArt: false,
    powerPreference: 'high-performance',
    roundPixels: false
  },
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    max: {
      height: 1200,
      width: 1600
    },
    min: {
      height: 300,
      width: 400
    },
    mode: Phaser.Scale.FIT,
    height: 600,
    width: 800
  },
  scene: [BootScene, LoadingScene, MenuScene, GameScene, GameOverScene],
  type: Phaser.AUTO,
  height: 600,
  width: 800
};