import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';

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

  // Setup mobile controls
  const setupMobileControls = () => {
    const upButton = document.getElementById('up-button');
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    const downButton = document.getElementById('down-button');
    
    // Helper function to dispatch keyboard events
    const dispatchKeyEvent = (key: string, type: string) => {
      window.dispatchEvent(new KeyboardEvent(type, { key }));
    };
    
    // Up button
    if (upButton) {
      upButton.addEventListener('touchstart', () => dispatchKeyEvent('ArrowUp', 'keydown'));
      upButton.addEventListener('touchend', () => dispatchKeyEvent('ArrowUp', 'keyup'));
    }
    
    // Left button
    if (leftButton) {
      leftButton.addEventListener('touchstart', () => dispatchKeyEvent('ArrowLeft', 'keydown'));
      leftButton.addEventListener('touchend', () => dispatchKeyEvent('ArrowLeft', 'keyup'));
    }
    
    // Right button
    if (rightButton) {
      rightButton.addEventListener('touchstart', () => dispatchKeyEvent('ArrowRight', 'keydown'));
      rightButton.addEventListener('touchend', () => dispatchKeyEvent('ArrowRight', 'keyup'));
    }
    
    // Down button
    if (downButton) {
      downButton.addEventListener('touchstart', () => dispatchKeyEvent('ArrowDown', 'keydown'));
      downButton.addEventListener('touchend', () => dispatchKeyEvent('ArrowDown', 'keyup'));
    }
  };
  
  setupMobileControls();
});