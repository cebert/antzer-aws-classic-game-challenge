import Phaser from 'phaser';
import { AnimationKeys, AudioKeys, ImageKeys, GRID_SIZE } from '../config/Constants';
import { AudioManager } from '../utils/AudioManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpSound: Phaser.Sound.BaseSound;
  private isDead: boolean = false;
  private audioManager: AudioManager;
  
  // Grid-based position tracking
  private gridRow: number = 0;
  private gridCol: number = 0;
  private readonly gridWidth: number = 16; // Level width in grid cells
  private readonly gridHeight: number = 12; // Level height in grid cells

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ImageKeys.ANT);
    
    // Initialize audio manager
    this.audioManager = new AudioManager(scene);
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics body - disable physics for grid-based movement
    this.body!.enable = false;
    
    // Set display size - use exactly grid size for perfect alignment
    const antSize = GRID_SIZE * 1.5; // 72px - larger but not too big
    this.setDisplaySize(antSize, antSize);
    // Set origin to exactly center
    this.setOrigin(0.5, 0.5);
    this.setDepth(100);
    
    // Improve sprite rendering quality
    this.setTexture(ImageKeys.ANT, 0);
    
    // Use nearest neighbor filtering for crisp pixel art
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    
    // Calculate initial grid position
    this.gridCol = Math.round((x - GRID_SIZE / 2) / GRID_SIZE);
    this.gridRow = Math.round((y - GRID_SIZE / 2) / GRID_SIZE);
    
    // Snap to exact grid position
    this.snapToGrid();
    
    
    // Set up controls
    this.cursors = scene.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;
    
    // Set up sounds
    this.jumpSound = this.audioManager.add(AudioKeys.SFX_JUMP, { volume: 0.5 });
    
    // Start with idle frame
    this.setFrame(0);
  }

  update(): void {
    if (this.isDead) return;
    
    this.handleInput();
    this.checkBoundaries();
  }
  
  private handleInput(): void {
    // Check for key presses (only accept one input per frame)
    const leftPressed = Phaser.Input.Keyboard.JustDown(this.cursors.left!);
    const rightPressed = Phaser.Input.Keyboard.JustDown(this.cursors.right!);
    const upPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up!);
    const downPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down!);
    
    if (leftPressed) {
      this.moveLeft();
    } else if (rightPressed) {
      this.moveRight();
    } else if (upPressed) {
      this.moveUp();
    } else if (downPressed) {
      this.moveDown();
    }
  }
  
  public moveLeft(): void {
    if (this.gridCol > 0) {
      this.gridCol--;
      this.setFlipX(true);
      this.snapToGrid();
      this.playMoveAnimation();
    }
  }
  
  public moveRight(): void {
    if (this.gridCol < this.gridWidth - 1) {
      this.gridCol++;
      this.setFlipX(false);
      this.snapToGrid();
      this.playMoveAnimation();
    }
  }
  
  public moveUp(): void {
    if (this.gridRow > 0) {
      this.gridRow--;
      this.snapToGrid();
      this.playMoveAnimation();
      
      // Play jump sound for upward movement
      if (!this.jumpSound.isPlaying) {
        this.jumpSound.play();
      }
    }
  }
  
  public moveDown(): void {
    if (this.gridRow < this.gridHeight - 1) {
      this.gridRow++;
      this.snapToGrid();
      this.playMoveAnimation();
    }
  }
  
  private snapToGrid(): void {
    // Convert grid position to world position (center of grid cell)
    // Round to ensure pixel-perfect positioning
    // Add small offset to better center the ant visually
    this.x = Math.round(this.gridCol * GRID_SIZE + GRID_SIZE / 2);
    this.y = Math.round(this.gridRow * GRID_SIZE + GRID_SIZE / 2);
  }
  
  private playMoveAnimation(): void {
    // Play a brief walking animation, then return to idle
    this.play(AnimationKeys.ANT_WALK);
    
    // Stop animation after a short time and return to idle frame
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) {
        this.anims.stop();
        this.setFrame(0);
      }
    });
  }
  
  // Public methods for game logic
  getGridRow(): number {
    return this.gridRow;
  }
  
  getGridCol(): number {
    return this.gridCol;
  }
  
  setGridPosition(row: number, col: number): void {
    this.gridRow = Phaser.Math.Clamp(row, 0, this.gridHeight - 1);
    this.gridCol = Phaser.Math.Clamp(col, 0, this.gridWidth - 1);
    this.snapToGrid();
  }
  
  // Method to move the player with a platform (called by GameScene)
  moveWithPlatform(deltaX: number): void {
    if (this.isDead) return;
    
    // Move the player horizontally
    this.x += deltaX;
    
    // Update grid position based on new world position
    const newGridCol = Math.round((this.x - GRID_SIZE / 2) / GRID_SIZE);
    
    // Log if grid position changed due to platform movement
    if (newGridCol !== this.gridCol) {
      this.gridCol = newGridCol;
    }
    
    // Don't snap to grid here - let the platform movement be smooth
  }
  
  private checkBoundaries(): void {
    // Check if player has been moved off screen by platform
    const gameWidth = this.scene.game.config.width as number;
    
    if (this.x < -GRID_SIZE || this.x > gameWidth + GRID_SIZE) {
      // Player has been carried off screen by a platform
      this.die();
    }
  }

  die(): void {
    if (this.isDead) return;
    
    this.isDead = true;
    this.play(AnimationKeys.ANT_DEATH);
    this.audioManager.play(AudioKeys.SFX_DEATH);
  }

  isPlayerDead(): boolean {
    return this.isDead;
  }
}