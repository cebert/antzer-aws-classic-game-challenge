import Phaser from 'phaser';
import { GameConfig } from './config/game-config';

// Start the game
window.addEventListener('load', () => {
  const game = new Phaser.Game(GameConfig);

  // Handle responsive resizing
  const resize = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const windowRatio = windowWidth / windowHeight;
    const gameRatio = Number(game.config.width) / Number(game.config.height);
    
    // Limit maximum size to prevent elements from being too large
    const maxWidth = Math.min(windowWidth, 1200);
    const maxHeight = Math.min(windowHeight, 900);
    
    if (windowRatio < gameRatio) {
      canvas.style.width = maxWidth + 'px';
      canvas.style.height = (maxWidth / gameRatio) + 'px';
    } else {
      canvas.style.width = (maxHeight * gameRatio) + 'px';
      canvas.style.height = maxHeight + 'px';
    }
    
    // Ensure the canvas doesn't exceed the viewport
    if (parseInt(canvas.style.width) > windowWidth) {
      canvas.style.width = windowWidth + 'px';
      canvas.style.height = (windowWidth / gameRatio) + 'px';
    }
    
    if (parseInt(canvas.style.height) > windowHeight) {
      canvas.style.height = windowHeight + 'px';
      canvas.style.width = (windowHeight * gameRatio) + 'px';
    }
  };

  window.addEventListener('resize', resize);
  resize();
});