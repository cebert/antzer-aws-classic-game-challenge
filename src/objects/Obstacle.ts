import Phaser from "phaser";
import { AnimationKeys } from "../config/Constants";

export enum ObstacleType {
  POISON,
  SPRAY,
  NAIL,
  FROG
}

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private obstacleType: ObstacleType;
  private moveSpeed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: ObstacleType,
    speed: number,
    direction: 'left' | 'right' = 'right'
  ) {
    let texture: string;
    switch (type) {
      case ObstacleType.POISON:
        texture = 'poison';
        break;
      case ObstacleType.SPRAY:
        texture = 'spray';
        break;
      case ObstacleType.NAIL:
        texture = 'nail';
        break;
      case ObstacleType.FROG:
        texture = 'frog';
        break;
    }
    
    super(scene, x, y, texture);
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.obstacleType = type;
    this.moveSpeed = speed;
    
    // Set up physics body
    this.setSize(36, 36);
    this.setOffset(14, 14);
    
    // Set proper display size - make larger for visibility
    this.setDisplaySize(60, 60);
    
    // Set depth to ensure obstacles are visible above everything
    this.setDepth(200);
    
    // Set velocity based on direction
    if (direction === 'left') {
      this.setVelocityX(-speed);
      this.setFlipX(true);
    } else {
      this.setVelocityX(speed);
      this.setFlipX(false);
    }
    
    // Play animation if applicable
    if (type === ObstacleType.FROG) {
      this.play(AnimationKeys.FROG_IDLE);
      
      // Add jumping behavior for frogs
      scene.time.addEvent({
        delay: Phaser.Math.Between(2000, 5000),
        callback: this.jump,
        callbackScope: this,
        loop: true
      });
    }
  }

  update(): void {
    // Check if obstacle is out of bounds and wrap around
    const width = this.scene.game.config.width as number;
    
    if (this.x < -50) {
      this.x = width + 50;
    } else if (this.x > width + 50) {
      this.x = -50;
    }
  }

  private jump(): void {
    if (this.obstacleType === ObstacleType.FROG) {
      this.play(AnimationKeys.FROG_JUMP);
      
      // Add a small vertical jump
      this.setVelocityY(-200);
      
      // Reset after animation completes
      this.once('animationcomplete', () => {
        this.play(AnimationKeys.FROG_IDLE);
        this.setVelocityY(0);
      });
    }
  }
}