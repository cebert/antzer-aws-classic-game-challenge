import Phaser from 'phaser';

export enum PlatformType {
  LEAF,
  LOG
}

export class Platform extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: PlatformType,
    speed: number,
    direction: 'left' | 'right' = 'right'
  ) {
    // Set texture based on type
    const texture = type === PlatformType.LEAF ? 'leaf' : 'log';
    
    super(scene, x, y, texture);
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Make platform immovable so it won't be affected by player physics
    this.setImmovable(true);
    
    // Set up physics body
    this.setSize(this.width - 10, 20);
    this.setOffset(5, 5);
    
    // Set larger display size for easier landing
    if (type === PlatformType.LEAF) {
      this.setDisplaySize(120, 40); // Much wider leaves
    } else {
      this.setDisplaySize(150, 40); // Much wider logs
    }
    
    // Adjust physics body to match larger display size
    if (type === PlatformType.LEAF) {
      this.setSize(115, 30);
      this.setOffset(2, 5);
    } else {
      this.setSize(145, 30);
      this.setOffset(2, 5);
    }
    
    // Set velocity based on direction
    // Ensure physics body is created and ready
    if (this.body) {
      if (direction === 'left') {
        this.setVelocityX(-speed);
      } else {
        this.setVelocityX(speed);
      }
      console.log(`✅ Platform velocity set to: ${this.body.velocity.x} (${direction})`);
    } else {
      // If body isn't ready, set it on the next frame
      scene.time.delayedCall(1, () => {
        if (direction === 'left') {
          this.setVelocityX(-speed);
        } else {
          this.setVelocityX(speed);
        }
        console.log(`⏰ Platform velocity set (delayed) to: ${this.body?.velocity?.x} (${direction})`);
      });
    }
  }

  update(): void {
    // Instead of destroying platforms, reset their position when they go off-screen
    const width = this.scene.game.config.width as number;
    
    if (this.body && this.body.velocity) {
      if (this.body.velocity.x > 0) {
        // Moving right - reset to left side when off right edge
        if (this.x > width + this.displayWidth) {
          this.x = -this.displayWidth;
          console.log(`🔄 Reset right-moving platform to x=${this.x}`);
        }
      } else if (this.body.velocity.x < 0) {
        // Moving left - reset to right side when off left edge
        if (this.x < -this.displayWidth) {
          this.x = width + this.displayWidth;
          console.log(`🔄 Reset left-moving platform to x=${this.x}`);
        }
      }
    }
  }
}