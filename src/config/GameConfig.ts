/**
 * @fileoverview Phaser game configuration for the Antzer game
 * Contains all game initialization settings including rendering, physics, scaling, and scene management
 */

import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { GameScene } from "../scenes/GameScene";
import { LoadingScene } from "../scenes/LoadingScene";
import { MenuScene } from "../scenes/MenuScene";

/**
 * Main Phaser game configuration object
 * Defines all settings for game initialization including:
 * - Rendering options optimized for high-resolution sprites
 * - Physics configuration for arcade physics
 * - Scaling settings for responsive design
 * - FPS management for smooth gameplay
 * - Scene order and management
 */
export const GameConfig: Phaser.Types.Core.GameConfig = {
  /** Background color of the game canvas (black) */
  backgroundColor: '#000000',
  
  /** Frame rate configuration for smooth gameplay */
  fps: {
    /** Number of delta values to average for smooth frame timing */
    deltaHistory: 10,
    /** Whether to force setTimeout instead of requestAnimationFrame */
    forceSetTimeOut: false,
    /** Maximum number of consecutive slow frames before panic mode */
    panicMax: 120,
    /** Enable smooth frame rate stepping to reduce jitter */
    smoothStep: true,
    /** Target frame rate (60 FPS) */
    target: 60
  },
  
  /** Game canvas height in pixels */
  height: 600,
  
  /** DOM element ID where the game canvas will be inserted */
  parent: 'game',
  
  /** Physics engine configuration */
  physics: {
    /** Arcade physics settings for simple 2D physics */
    arcade: {
      /** Disable physics debug visualization in production */
      debug: false,
      /** No gravity for top-down gameplay */
      gravity: { x: 0, y: 0 }
    },
    /** Use arcade physics as the default physics system */
    default: 'arcade'
  },
  
  /** Rendering configuration optimized for high-quality sprites */
  render: {
    /** Enable antialiasing for smooth sprite scaling */
    antialias: true,
    /** Disable pixel art mode for high-resolution sprites */
    pixelArt: false,
    /** Use high-performance GPU for better scaling performance */
    powerPreference: 'high-performance',
    /** Allow sub-pixel positioning for smoother movement */
    roundPixels: false
  },
  
  /** Scaling configuration for responsive design */
  scale: {
    /** Center the game both horizontally and vertically */
    autoCenter: Phaser.Scale.CENTER_BOTH,
    /** Scaled canvas height */
    height: 600,
    /** Maximum allowed dimensions */
    max: {
      /** Maximum canvas height */
      height: 1200,
      /** Maximum canvas width */
      width: 1600
    },
    /** Minimum allowed dimensions */
    min: {
      /** Minimum canvas height */
      height: 300,
      /** Minimum canvas width */
      width: 400
    },
    /** Scale mode: fit game within available space while maintaining aspect ratio */
    mode: Phaser.Scale.FIT,
    /** Scaled canvas width */
    width: 800
  },
  
  /** Scene configuration in order of execution */
  scene: [BootScene, LoadingScene, MenuScene, GameScene, GameOverScene],
  
  /** Renderer type: AUTO lets Phaser choose WebGL or Canvas automatically */
  type: Phaser.AUTO,
  
  /** Game canvas width in pixels */
  width: 800
};