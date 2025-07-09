import Phaser from "phaser";

export enum CollectibleType {
  CHERRY,
  COOKIE
}

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  private collectibleType: CollectibleType;
  private pointValue: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CollectibleType
  ) {
    const texture = type === CollectibleType.CHERRY ? 'cherry' : 'cookie';
    
    super(scene, x, y, texture);
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.collectibleType = type;
    this.pointValue = this.getPointValueForType(type);
    
    // Set up physics body
    this.setSize(32, 32);
    this.setOffset(16, 16);
    
    // Set proper display size - bigger for better visibility
    this.setDisplaySize(48, 48);
    
    // Add a small bounce animation
    scene.tweens.add({
      targets: this,
      y: y - 5,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  getPointValue(): number {
    return this.pointValue;
  }

  getType(): CollectibleType {
    return this.collectibleType;
  }

  private getPointValueForType(type: CollectibleType): number {
    switch (type) {
      case CollectibleType.CHERRY:
        return 10;
      case CollectibleType.COOKIE:
        return 20;
      default:
        return 10;
    }
  }

  collect(): void {
    // Stop the bounce animation first
    this.scene.tweens.killTweensOf(this);
    
    // Create dramatic fly-off animation
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Choose random direction to fly off (up-left, up-right, or straight up)
    const directions = [
      { x: -screenWidth * 0.3, y: -screenHeight * 0.8 }, // Up-left
      { x: screenWidth * 0.3, y: -screenHeight * 0.8 },  // Up-right
      { x: 0, y: -screenHeight * 1.2 }                   // Straight up
    ];
    const targetDirection = Phaser.Utils.Array.GetRandom(directions);
    
    // Scale up briefly then fly away
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 100,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Now fly off screen
        this.scene.tweens.add({
          targets: this,
          x: this.x + targetDirection.x,
          y: this.y + targetDirection.y,
          scaleX: 0.3,
          scaleY: 0.3,
          alpha: 0,
          rotation: Phaser.Math.Between(-3, 3), // Random spin
          duration: 800,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            this.destroy();
          }
        });
      }
    });
    
    // Add sparkle effect - create small particles
    for (let i = 0; i < 5; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-10, 10),
        this.y + Phaser.Math.Between(-10, 10),
        Phaser.Math.Between(2, 4),
        0xFFD700 // Gold color
      ).setDepth(150);
      
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-30, 30),
        y: particle.y + Phaser.Math.Between(-40, -10),
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
}