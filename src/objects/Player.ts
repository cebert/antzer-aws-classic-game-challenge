import Phaser from 'phaser';
import { AnimationKeys, AudioKeys, ImageKeys, GRID_SIZE } from '../config/constants';
import { AudioManager } from '../utils/audio-manager';

/**
 * Player class representing the ant character that the user controls
 * Uses grid-based movement system for precise, Frogger-style gameplay
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly audioManager: AudioManager;
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly gridHeight: number;
  private readonly gridWidth: number;
  private readonly jumpSound: Phaser.Sound.BaseSound;

  private gridCol: number = 0;
  private gridRow: number = 0;
  private isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ImageKeys.ANT);
    
    // Get dynamic grid dimensions from the scene's grid system
    const gridSystem = (scene as any).gridSystem;
    this.gridHeight = gridSystem ? gridSystem.getGridHeight() : 48; // fallback to 48
    this.gridWidth = gridSystem ? gridSystem.getGridWidth() : 16;   // fallback to 16
    
    this.audioManager = new AudioManager(scene);
    this.cursors = scene.input.keyboard?.createCursorKeys() || {} as Phaser.Types.Input.Keyboard.CursorKeys;
    this.jumpSound = this.audioManager.add(AudioKeys.SFX_JUMP, { volume: 0.5 });
    
    this.initializeSprite(scene);
    this.setupPhysics();
    this.setupRendering();
    this.calculateInitialGridPosition(x, y);
    this.snapToGrid();
  }

  /**
   * Update player state and handle input
   */
  update(): void {
    if (this.isDead) return;
    
    this.handleInput();
    this.checkBoundaries();
  }

  /**
   * Move player left by one grid cell
   */
  public moveLeft(): void {
    if (this.gridCol > 0) {
      this.gridCol--;
      this.setFlipX(true);
      this.snapToGrid();
      this.playMoveAnimation();
    }
  }

  /**
   * Move player right by one grid cell
   */
  public moveRight(): void {
    if (this.gridCol < this.gridWidth - 1) {
      this.gridCol++;
      this.setFlipX(false);
      this.snapToGrid();
      this.playMoveAnimation();
    }
  }

  /**
   * Move player up by one grid cell
   */
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

  /**
   * Move player down by one grid cell
   */
  public moveDown(): void {
    if (this.gridRow < this.gridHeight - 1) {
      this.gridRow++;
      this.snapToGrid();
      this.playMoveAnimation();
    }
  }

  /**
   * Get the current grid row position
   * @returns The current row (0-based index from top)
   */
  getGridRow(): number {
    return this.gridRow;
  }

  /**
   * Get the current grid column position
   * @returns The current column (0-based index from left)
   */
  getGridCol(): number {
    return this.gridCol;
  }

  /**
   * Set the player's grid position directly
   * @param row - The target row (will be clamped to valid range)
   * @param col - The target column (will be clamped to valid range)
   */
  setGridPosition(row: number, col: number): void {
    this.gridRow = Phaser.Math.Clamp(row, 0, this.gridHeight - 1);
    this.gridCol = Phaser.Math.Clamp(col, 0, this.gridWidth - 1);
    this.snapToGrid();
  }

  /**
   * Move the player horizontally with a platform (for riding logs/leaves)
   * @param deltaX - The horizontal distance to move in pixels
   */
  moveWithPlatform(deltaX: number): void {
    if (this.isDead) return;
    
    // Move the player horizontally
    this.x += deltaX;
    
    // Update grid position based on new world position
    const newGridCol = Math.round((this.x - GRID_SIZE / 2) / GRID_SIZE);
    
    // Update grid column if it changed due to platform movement
    if (newGridCol !== this.gridCol) {
      this.gridCol = newGridCol;
    }
    
    // Don't snap to grid here - let the platform movement be smooth
  }

  /**
   * Kill the player and trigger death animation
   */
  die(): void {
    if (this.isDead) return;
    
    this.isDead = true;
    this.play(AnimationKeys.ANT_DEATH);
    this.audioManager.play(AudioKeys.SFX_DEATH);
  }

  /**
   * Check if the player is currently dead
   * @returns True if the player is dead, false otherwise
   */
  isPlayerDead(): boolean {
    return this.isDead;
  }

  /**
   * Initialize the sprite in the scene
   * @param scene - The Phaser scene to add this player to
   */
  private initializeSprite(scene: Phaser.Scene): void {
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set display properties
    const antSize = GRID_SIZE * 1.5; // 72px - larger but not too big
    this.setDisplaySize(antSize, antSize);
    this.setOrigin(0.5, 0.5);
    this.setDepth(100);
    
    // Start with idle frame
    this.setFrame(0);
  }

  /**
   * Setup physics body properties
   */
  private setupPhysics(): void {
    // Disable physics for grid-based movement
    this.body!.enable = false;
  }

  /**
   * Setup rendering properties for crisp sprite display
   */
  private setupRendering(): void {
    this.setTexture(ImageKeys.ANT, 0);
    
    // Use nearest neighbor filtering for crisp pixel art
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  /**
   * Calculate initial grid position from world coordinates
   * @param x - The world x coordinate
   * @param y - The world y coordinate
   */
  private calculateInitialGridPosition(x: number, y: number): void {
    this.gridCol = Math.round((x - GRID_SIZE / 2) / GRID_SIZE);
    this.gridRow = Math.round((y - GRID_SIZE / 2) / GRID_SIZE);
  }

  /**
   * Snap player position to the current grid cell
   */
  private snapToGrid(): void {
    // Convert grid position to world position (center of grid cell)
    // Adjust positioning slightly left to better center the ant visually
    this.x = Math.round(this.gridCol * GRID_SIZE + GRID_SIZE / 2 - 2);
    this.y = Math.round(this.gridRow * GRID_SIZE + GRID_SIZE / 2);
  }

  /**
   * Handle keyboard input for player movement
   */
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

  /**
   * Play the walking animation briefly, then return to idle
   */
  private playMoveAnimation(): void {
    this.play(AnimationKeys.ANT_WALK);
    
    // Stop animation after a short time and return to idle frame
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) {
        this.anims.stop();
        this.setFrame(0);
      }
    });
  }

  /**
   * Check if player has moved outside game boundaries
   */
  private checkBoundaries(): void {
    const gameWidth = this.scene.game.config.width as number;
    
    if (this.x < -GRID_SIZE || this.x > gameWidth + GRID_SIZE) {
      // Player has been carried off screen by a platform
      this.die();
    }
  }
}