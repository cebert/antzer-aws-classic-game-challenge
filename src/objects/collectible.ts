import Phaser from "phaser";
import { GRID_SIZE, SPARKLE_PARTICLE_DEPTH, GOLD_COLOR } from "../config/constants";

/**
 * Enum defining the different types of collectible items in the game
 */
export enum CollectibleType {
  CHERRY,
  COOKIE
}

// Collectible-specific constants
const COLLECTIBLE_POINT_VALUES = {
  [CollectibleType.CHERRY]: 10,
  [CollectibleType.COOKIE]: 20
} as const;

const COLLECTIBLE_TEXTURES = {
  [CollectibleType.CHERRY]: 'cherry',
  [CollectibleType.COOKIE]: 'cookie'
} as const;

// Animation and effect constants
const BOUNCE_ANIMATION = {
  DURATION: 1000,
  OFFSET: 5
} as const;

const COLLECTION_ANIMATION = {
  SCALE_DURATION: 100,
  SCALE_SIZE: 1.5,
  FLY_DURATION: 800,
  FLY_SCALE: 0.3,
  MAX_ROTATION: 3
} as const;

const FLY_DIRECTIONS = {
  UP_LEFT: { x: -0.3, y: -0.8 },
  UP_RIGHT: { x: 0.3, y: -0.8 },
  STRAIGHT_UP: { x: 0, y: -1.2 }
} as const;

const SPARKLE_EFFECT = {
  PARTICLE_COUNT: 5,
  SPAWN_RANGE: 10,
  SIZE_MIN: 2,
  SIZE_MAX: 4,
  DURATION: 500,
  MOVEMENT_RANGE_X: 30,
  MOVEMENT_RANGE_Y_MIN: -40,
  MOVEMENT_RANGE_Y_MAX: -10
} as const;

// Physics constants
const PHYSICS_BODY = {
  SIZE: GRID_SIZE * 0.67, // 32px when GRID_SIZE is 48
  OFFSET: GRID_SIZE * 0.33 // 16px when GRID_SIZE is 48
} as const;

const DISPLAY_SIZE = GRID_SIZE; // Same as grid size for proper alignment

/**
 * Collectible class representing items that the player can collect for points
 * Each collectible has a point value and animated collection effects
 */
export class Collectible extends Phaser.Physics.Arcade.Sprite {
  private readonly collectibleType: CollectibleType;
  private readonly pointValue: number;

  /**
   * Create a new Collectible instance
   * @param scene - The Phaser scene this collectible belongs to
   * @param x - The initial x position
   * @param y - The initial y position
   * @param type - The type of collectible (CHERRY or COOKIE)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CollectibleType
  ) {
    const texture = Collectible.getTextureForType(type);
    super(scene, x, y, texture);
    
    this.collectibleType = type;
    this.pointValue = Collectible.getPointValueForType(type);
    
    this.initializeSprite(scene);
    this.setupPhysics();
    this.setupBounceAnimation(scene, y);
  }

  /**
   * Get the point value of this collectible
   */
  getPointValue(): number {
    return this.pointValue;
  }

  /**
   * Get the type of this collectible
   */
  getType(): CollectibleType {
    return this.collectibleType;
  }

  /**
   * Animate the collection of this item with visual effects
   */
  collect(): void {
    this.scene.tweens.killTweensOf(this);
    this.createCollectionAnimation();
    this.createSparkleEffect();
  }

  /**
   * Get the texture key for a given collectible type
   * @param type - The collectible type to get texture for
   * @returns The texture key string
   */
  private static getTextureForType(type: CollectibleType): string {
    return COLLECTIBLE_TEXTURES[type] || COLLECTIBLE_TEXTURES[CollectibleType.CHERRY];
  }

  /**
   * Get the point value for a given collectible type
   * @param type - The collectible type to get point value for
   * @returns The point value for the collectible type
   */
  private static getPointValueForType(type: CollectibleType): number {
    return COLLECTIBLE_POINT_VALUES[type] || COLLECTIBLE_POINT_VALUES[CollectibleType.CHERRY];
  }

  /**
   * Initialize the sprite in the scene
   * @param scene - The Phaser scene to add this collectible to
   */
  private initializeSprite(scene: Phaser.Scene): void {
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set proper display size for better visibility
    this.setDisplaySize(DISPLAY_SIZE, DISPLAY_SIZE);
  }

  /**
   * Setup physics body properties
   */
  private setupPhysics(): void {
    this.setSize(PHYSICS_BODY.SIZE, PHYSICS_BODY.SIZE);
    this.setOffset(PHYSICS_BODY.OFFSET, PHYSICS_BODY.OFFSET);
  }

  /**
   * Setup the idle bounce animation
   * @param scene - The Phaser scene for creating tweens
   * @param originalY - The original Y position to bounce around
   */
  private setupBounceAnimation(scene: Phaser.Scene, originalY: number): void {
    scene.tweens.add({
      duration: BOUNCE_ANIMATION.DURATION,
      ease: 'Sine.easeInOut',
      repeat: -1,
      targets: this,
      y: originalY - BOUNCE_ANIMATION.OFFSET,
      yoyo: true
    });
  }

  /**
   * Create the dramatic collection animation
   */
  private createCollectionAnimation(): void {
    const flyDirection = this.getRandomFlyDirection();
    
    // Scale up briefly then fly away
    this.scene.tweens.add({
      duration: COLLECTION_ANIMATION.SCALE_DURATION,
      ease: 'Back.easeOut',
      onComplete: () => this.createFlyAwayAnimation(flyDirection),
      scaleX: COLLECTION_ANIMATION.SCALE_SIZE,
      scaleY: COLLECTION_ANIMATION.SCALE_SIZE,
      targets: this
    });
  }

  /**
   * Get a random direction for the fly-away animation
   */
  private getRandomFlyDirection(): { x: number; y: number } {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    const directions = [
      { 
        x: screenWidth * FLY_DIRECTIONS.UP_LEFT.x, 
        y: screenHeight * FLY_DIRECTIONS.UP_LEFT.y 
      },
      { 
        x: screenWidth * FLY_DIRECTIONS.UP_RIGHT.x, 
        y: screenHeight * FLY_DIRECTIONS.UP_RIGHT.y 
      },
      { 
        x: screenWidth * FLY_DIRECTIONS.STRAIGHT_UP.x, 
        y: screenHeight * FLY_DIRECTIONS.STRAIGHT_UP.y 
      }
    ];
    
    return Phaser.Utils.Array.GetRandom(directions);
  }

  /**
   * Create the fly-away animation after scaling
   * @param direction - The direction vector containing x and y offsets for the animation
   */
  private createFlyAwayAnimation(direction: { x: number; y: number }): void {
    this.scene.tweens.add({
      alpha: 0,
      duration: COLLECTION_ANIMATION.FLY_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => this.destroy(),
      rotation: Phaser.Math.Between(-COLLECTION_ANIMATION.MAX_ROTATION, COLLECTION_ANIMATION.MAX_ROTATION),
      scaleX: COLLECTION_ANIMATION.FLY_SCALE,
      scaleY: COLLECTION_ANIMATION.FLY_SCALE,
      targets: this,
      x: this.x + direction.x,
      y: this.y + direction.y
    });
  }

  /**
   * Create sparkle particle effects when collected
   */
  private createSparkleEffect(): void {
    for (let i = 0; i < SPARKLE_EFFECT.PARTICLE_COUNT; i++) {
      this.createSparkleParticle(GOLD_COLOR);
    }
  }

  /**
   * Create a single sparkle particle
   * @param color - The hexadecimal color value for the particle
   */
  private createSparkleParticle(color: number): void {
    const particle = this.scene.add.circle(
      this.x + Phaser.Math.Between(-SPARKLE_EFFECT.SPAWN_RANGE, SPARKLE_EFFECT.SPAWN_RANGE),
      this.y + Phaser.Math.Between(-SPARKLE_EFFECT.SPAWN_RANGE, SPARKLE_EFFECT.SPAWN_RANGE),
      Phaser.Math.Between(SPARKLE_EFFECT.SIZE_MIN, SPARKLE_EFFECT.SIZE_MAX),
      color
    ).setDepth(SPARKLE_PARTICLE_DEPTH);
    
    this.scene.tweens.add({
      alpha: 0,
      duration: SPARKLE_EFFECT.DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => particle.destroy(),
      scale: 0,
      targets: particle,
      x: particle.x + Phaser.Math.Between(-SPARKLE_EFFECT.MOVEMENT_RANGE_X, SPARKLE_EFFECT.MOVEMENT_RANGE_X),
      y: particle.y + Phaser.Math.Between(SPARKLE_EFFECT.MOVEMENT_RANGE_Y_MIN, SPARKLE_EFFECT.MOVEMENT_RANGE_Y_MAX)
    });
  }
}