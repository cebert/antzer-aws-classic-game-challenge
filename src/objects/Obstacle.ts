import Phaser from "phaser";
import { AnimationKeys, Direction } from "../config/constants";

/**
 * Enum defining the different types of obstacles in the game
 */
export enum ObstacleType {
  FROG,
  NAIL,
  POISON,
  SPRAY
}

/**
 * Obstacle class representing deadly objects that the player must avoid
 * Obstacles can be static or moving, and some have special behaviors (like frogs jumping)
 */
export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private readonly obstacleType: ObstacleType;

  /**
   * Create a new Obstacle instance
   * @param scene - The Phaser scene this obstacle belongs to
   * @param x - The initial x position
   * @param y - The initial y position
   * @param type - The type of obstacle
   * @param speed - The movement speed in pixels per second
   * @param direction - The movement direction (LEFT or RIGHT)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: ObstacleType,
    speed: number,
    direction: Direction = Direction.RIGHT
  ) {
    const texture = Obstacle.getTextureForType(type);
    super(scene, x, y, texture);
    
    this.obstacleType = type;
    
    this.initializeSprite(scene);
    this.setupPhysics();
    this.setupMovement(speed, direction);
    this.setupAnimations(scene);
  }

  /**
   * Update obstacle position and handle screen wrapping
   */
  update(): void {
    this.handleScreenWrapping();
  }

  /**
   * Get the texture key for a given obstacle type
   */
  private static getTextureForType(type: ObstacleType): string {
    switch (type) {
      case ObstacleType.FROG:
        return 'frog';
      case ObstacleType.NAIL:
        return 'nail';
      case ObstacleType.POISON:
        return 'poison';
      case ObstacleType.SPRAY:
        return 'spray';
      default:
        return 'poison'; // fallback
    }
  }

  /**
   * Initialize the sprite in the scene
   */
  private initializeSprite(scene: Phaser.Scene): void {
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set depth to ensure obstacles are visible above background
    this.setDepth(200);
    
    // Set proper display size for visibility
    this.setDisplaySize(60, 60);
  }

  /**
   * Setup physics body properties
   */
  private setupPhysics(): void {
    this.setSize(36, 36);
    this.setOffset(14, 14);
  }

  /**
   * Setup movement velocity and direction
   * @param speed - The movement speed in pixels per second
   * @param direction - The movement direction (LEFT or RIGHT)
   */
  private setupMovement(speed: number, direction: Direction): void {
    if (direction === Direction.LEFT) {
      this.setFlipX(true);
      this.setVelocityX(-speed);
    } else {
      this.setFlipX(false);
      this.setVelocityX(speed);
    }
  }

  /**
   * Setup animations and special behaviors for specific obstacle types
   */
  private setupAnimations(scene: Phaser.Scene): void {
    if (this.obstacleType === ObstacleType.FROG) {
      this.play(AnimationKeys.FROG_IDLE);
      this.setupFrogJumpBehavior(scene);
    }
  }

  /**
   * Setup jumping behavior for frog obstacles
   * @param scene - The Phaser scene for creating timed events
   */
  private setupFrogJumpBehavior(scene: Phaser.Scene): void {
    scene.time.addEvent({
      callback: this.jump,
      callbackScope: this,
      delay: Phaser.Math.Between(2000, 5000),
      loop: true
    });
  }

  /**
   * Handle screen wrapping when obstacles move off-screen
   */
  private handleScreenWrapping(): void {
    const width = this.scene.game.config.width as number;
    const buffer = 50;
    
    if (this.x < -buffer) {
      this.x = width + buffer;
    } else if (this.x > width + buffer) {
      this.x = -buffer;
    }
  }

  /**
   * Make frog obstacles jump with animation
   */
  private jump(): void {
    if (this.obstacleType !== ObstacleType.FROG) {
      return;
    }

    this.play(AnimationKeys.FROG_JUMP);
    this.setVelocityY(-200);
    
    // Reset after animation completes
    this.once('animationcomplete', () => {
      this.play(AnimationKeys.FROG_IDLE);
      this.setVelocityY(0);
    });
  }
}