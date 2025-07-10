import Phaser from 'phaser';
import { Direction, GRID_SIZE } from '../config/constants';

/**
 * Enum defining the different types of platforms in the game
 */
export enum PlatformType {
  LEAF,
  LOG
}

// Platform-specific constants
const PLATFORM_TEXTURES = {
  [PlatformType.LEAF]: 'leaf',
  [PlatformType.LOG]: 'log'
} as const;

const PLATFORM_DIMENSIONS = {
  [PlatformType.LEAF]: {
    DISPLAY_WIDTH: GRID_SIZE * 2.5,  // 120px when GRID_SIZE is 48
    DISPLAY_HEIGHT: GRID_SIZE * 0.83, // 40px when GRID_SIZE is 48
    BODY_WIDTH: GRID_SIZE * 2.4,     // 115px when GRID_SIZE is 48
    BODY_HEIGHT: GRID_SIZE * 0.625   // 30px when GRID_SIZE is 48
  },
  [PlatformType.LOG]: {
    DISPLAY_WIDTH: GRID_SIZE * 3.125, // 150px when GRID_SIZE is 48
    DISPLAY_HEIGHT: GRID_SIZE * 0.83, // 40px when GRID_SIZE is 48
    BODY_WIDTH: GRID_SIZE * 3.02,    // 145px when GRID_SIZE is 48
    BODY_HEIGHT: GRID_SIZE * 0.625   // 30px when GRID_SIZE is 48
  }
} as const;

const PHYSICS_DEFAULTS = {
  INITIAL_BODY_WIDTH_REDUCTION: 10,
  INITIAL_BODY_HEIGHT: 20,
  INITIAL_OFFSET: 5,
  REFINED_OFFSET_X: 2,
  REFINED_OFFSET_Y: 5
} as const;

const MOVEMENT = {
  VELOCITY_DELAY: 1 // milliseconds to wait if body isn't ready
} as const;

/**
 * Platform class representing floating objects that the player can ride across water
 * Platforms move horizontally and wrap around the screen edges
 */
export class Platform extends Phaser.Physics.Arcade.Sprite {
  /**
   * Create a new Platform instance
   * @param scene - The Phaser scene this platform belongs to
   * @param x - The initial x position
   * @param y - The initial y position
   * @param type - The type of platform (LEAF or LOG)
   * @param speed - The movement speed in pixels per second
   * @param direction - The movement direction (LEFT or RIGHT)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: PlatformType,
    speed: number,
    direction: Direction = Direction.RIGHT
  ) {
    const texture = Platform.getTextureForType(type);
    super(scene, x, y, texture);
    
    this.initializeSprite(scene);
    this.setupPhysics(type);
    this.setupMovement(speed, direction, scene);
  }

  /**
   * Update platform position and handle screen wrapping
   */
  update(): void {
    this.handleScreenWrapping();
  }

  /**
   * Get the texture key for a given platform type
   * @param type - The platform type to get texture for
   * @returns The texture key string
   */
  private static getTextureForType(type: PlatformType): string {
    return PLATFORM_TEXTURES[type] || PLATFORM_TEXTURES[PlatformType.LOG];
  }

  /**
   * Initialize the sprite in the scene
   * @param scene - The Phaser scene to add this platform to
   */
  private initializeSprite(scene: Phaser.Scene): void {
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Make platform immovable so it won't be affected by player physics
    this.setImmovable(true);
  }

  /**
   * Setup physics body properties based on platform type
   * @param type - The platform type to configure physics for
   */
  private setupPhysics(type: PlatformType): void {
    // Set initial physics body
    this.setSize(
      this.width - PHYSICS_DEFAULTS.INITIAL_BODY_WIDTH_REDUCTION, 
      PHYSICS_DEFAULTS.INITIAL_BODY_HEIGHT
    );
    this.setOffset(PHYSICS_DEFAULTS.INITIAL_OFFSET, PHYSICS_DEFAULTS.INITIAL_OFFSET);
    
    // Configure size and physics based on platform type
    const dimensions = PLATFORM_DIMENSIONS[type];
    
    this.setDisplaySize(dimensions.DISPLAY_WIDTH, dimensions.DISPLAY_HEIGHT);
    this.setSize(dimensions.BODY_WIDTH, dimensions.BODY_HEIGHT);
    this.setOffset(PHYSICS_DEFAULTS.REFINED_OFFSET_X, PHYSICS_DEFAULTS.REFINED_OFFSET_Y);
  }

  /**
   * Setup movement velocity and direction
   * @param speed - The movement speed in pixels per second
   * @param direction - The movement direction (LEFT or RIGHT)
   * @param scene - The Phaser scene for delayed calls if needed
   */
  private setupMovement(
    speed: number, 
    direction: Direction, 
    scene: Phaser.Scene
  ): void {
    const velocity = direction === Direction.LEFT ? -speed : speed;
    
    if (this.body) {
      this.setVelocityX(velocity);
    } else {
      // If body isn't ready, set it on the next frame
      scene.time.delayedCall(MOVEMENT.VELOCITY_DELAY, () => {
        this.setVelocityX(velocity);
      });
    }
  }

  /**
   * Handle screen wrapping when platforms move off-screen
   */
  private handleScreenWrapping(): void {
    if (!this.body || !this.body.velocity) {
      return;
    }

    const width = this.scene.game.config.width as number;
    
    if (this.body.velocity.x > 0) {
      // Moving right - reset to left side when off right edge
      if (this.x > width + this.displayWidth) {
        this.x = -this.displayWidth;
      }
    } else if (this.body.velocity.x < 0) {
      // Moving left - reset to right side when off left edge
      if (this.x < -this.displayWidth) {
        this.x = width + this.displayWidth;
      }
    }
  }
}