import Phaser from 'phaser';
import { GameConfig } from './config/game-config';

// Start the game
window.addEventListener('load', () => {
  const game = new Phaser.Game(GameConfig);

  // Smart resize handling for better wide screen support
  const resize = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const gameRatio = Number(game.config.width) / Number(game.config.height); // 800/600 = 1.33
    
    // Calculate optimal size while maintaining aspect ratio
    let targetWidth, targetHeight;
    
    if (windowRatio > gameRatio) {
      // Window is wider than game - fit to height and center horizontally
      targetHeight = Math.min(windowHeight * 0.95, 1200);
      targetWidth = targetHeight * gameRatio;
    } else {
      // Window is taller than game - fit to width and center vertically
      targetWidth = Math.min(windowWidth * 0.95, 1600);
      targetHeight = targetWidth / gameRatio;
    }
    
    // Ensure we don't exceed viewport bounds
    if (targetWidth > windowWidth * 0.95) {
      targetWidth = windowWidth * 0.95;
      targetHeight = targetWidth / gameRatio;
    }
    
    if (targetHeight > windowHeight * 0.95) {
      targetHeight = windowHeight * 0.95;
      targetWidth = targetHeight * gameRatio;
    }
    
    canvas.style.width = Math.round(targetWidth) + 'px';
    canvas.style.height = Math.round(targetHeight) + 'px';
  };

  window.addEventListener('resize', resize);
  resize();
});