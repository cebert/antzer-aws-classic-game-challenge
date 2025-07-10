import Phaser from "phaser";
import { AudioKeys, SceneKeys } from "../config/constants";
import { LEVEL_1_CONFIG, validateLevel } from "../config/level1";
import { CollisionManager } from "../game/collision-manager";
import { GameUI } from "../game/game-ui";
import { GridSystem } from "../game/grid-system";
import { LevelBuilder } from "../game/level-builder";
import { Obstacle } from "../objects/obstacle";
import { Platform } from "../objects/platform";
import { Player } from "../objects/player";
import { AudioManager } from "../utils/audio-manager";

export class GameScene extends Phaser.Scene {
  // Core game objects
  private player!: Player;
  private antHill!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.Group;
  
  // Game systems
  private gridSystem!: GridSystem;
  private collisionManager!: CollisionManager;
  private levelBuilder!: LevelBuilder;
  private gameUI!: GameUI;
  private audioManager!: AudioManager;
  
  // Game state
  private gameOver: boolean = false;
  private gameWon: boolean = false;
  private gameMusic!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: SceneKeys.GAME });
  }

  create(): void {
    this.initializeGame();
    this.createLevel();
    this.createPlayer();
    this.setupAudio();
    this.setupCollisions();
  }

  update(): void {
    if (this.gameOver || this.gameWon) return;
    
    this.updateGameObjects();
    this.updateCollisions();
    this.gameUI.updateTimer();
  }

  private initializeGame(): void {
    // Stop any existing audio
    this.sound.stopAll();
    
    // Validate level configuration
    const levelErrors = validateLevel();
    if (levelErrors.length > 0) {
      console.error('❌ Level validation errors:', levelErrors);
      levelErrors.forEach(error => console.error(`  - ${error}`));
    }
    
    // Initialize systems
    this.audioManager = new AudioManager(this);
    this.gridSystem = new GridSystem();
    this.levelBuilder = new LevelBuilder(this, this.gridSystem);
    this.gameUI = new GameUI(this, this.audioManager);
    
    // Reset game state
    this.gameOver = false;
    this.gameWon = false;
    
    // Create physics groups
    this.obstacles = this.physics.add.group();
    this.collectibles = this.physics.add.group();
    this.platforms = this.physics.add.group();
    
    // Initialize collision manager
    this.collisionManager = new CollisionManager(this.gridSystem, this.platforms);
  }

  private createLevel(): void {
    // Create background tiles
    this.levelBuilder.createBackground();
    
    // Create static objects (obstacles, initial collectibles)
    this.levelBuilder.createStaticObjects(this.obstacles, this.collectibles);
    
    // Create water platforms
    this.levelBuilder.createWaterPlatforms(this.platforms);
    
    // Create ant hill
    this.antHill = this.levelBuilder.createAntHill();
    
    // Create additional collectibles
    this.levelBuilder.createCollectibleSprites(this.collectibles);
    
    // Create UI
    this.gameUI.create();
  }

  private createPlayer(): void {
    const startPosition = this.gridSystem.getWorldPosition(
      LEVEL_1_CONFIG.antStartRow,
      LEVEL_1_CONFIG.antStartCol
    );
    
    this.player = new Player(this, startPosition.x, startPosition.y);
    
    // Set up mobile control callbacks
    this.gameUI.setMobileControlCallbacks({
      up: () => this.player.moveUp(),
      down: () => this.player.moveDown(),
      left: () => this.player.moveLeft(),
      right: () => this.player.moveRight()
    });
  }

  private setupAudio(): void {
    this.gameMusic = this.audioManager.add(AudioKeys.MUSIC_GAME, { 
      loop: true, 
      volume: 0.4 
    });
    
    this.audioManager.add(AudioKeys.SFX_COLLECT, { volume: 0.5 });
    this.audioManager.add(AudioKeys.SFX_WIN, { volume: 0.6 });
    
    this.startGameMusicOnInteraction();
  }

  private setupCollisions(): void {
    // Set up physics collision for win condition
    this.physics.add.overlap(
      this.player,
      this.antHill,
      this.handleWin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  private updateGameObjects(): void {
    // Update player
    this.player.update();
    
    // Update obstacles
    this.obstacles.getChildren().forEach((obstacle) => {
      (obstacle as Obstacle).update();
    });
    
    // Update platforms
    this.platforms.getChildren().forEach((platform) => {
      (platform as Platform).update();
    });
  }

  private updateCollisions(): void {
    // Update object positions in grid
    this.collisionManager.updateObstaclePositions(this.obstacles);
    this.collisionManager.updatePlatformPositions();
    
    // Check player collision
    const collisionResult = this.collisionManager.checkPlayerCollision(this.player);
    
    if (collisionResult.isDead) {
      this.handlePlayerDeath();
    } else if (collisionResult.isWin) {
      this.handleWin(null as any, null as any);
    } else if (collisionResult.collectible) {
      this.handleCollectible(collisionResult.collectible);
    } else if (collisionResult.platformMovement) {
      this.player.moveWithPlatform(collisionResult.platformMovement.deltaX);
    }
  }

  private handleCollectible(collectible: {
    type: any;
    points: number;
    row: number;
    col: number;
  }): void {
    this.gameUI.updateScore(collectible.points);
    this.audioManager.play(AudioKeys.SFX_COLLECT);
    this.gameUI.removeCollectibleSprite(collectible.row, collectible.col, this.collectibles);
  }

  private handlePlayerDeath(): void {
    this.player.die();
    this.gameOver = true;
    
    this.time.delayedCall(1500, () => {
      this.audioManager.stop(AudioKeys.MUSIC_GAME);
      this.scene.start(SceneKeys.GAME_OVER, {
        score: this.gameUI.getScore(),
        time: this.gameUI.getElapsedTime(),
        won: false
      });
    });
  }

  private handleWin(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _antHill: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    if (this.gameWon) return;
    
    this.gameWon = true;
    this.audioManager.play(AudioKeys.SFX_WIN);
    
    // Show winning animation
    this.tweens.add({
      targets: this.player,
      y: this.antHill.y,
      scale: 0.5,
      duration: 1000,
      onComplete: () => {
        this.player.setVisible(false);
      }
    });
    
    // Show game over (win) after a delay
    this.time.delayedCall(2000, () => {
      this.audioManager.stop(AudioKeys.MUSIC_GAME);
      this.scene.start(SceneKeys.GAME_OVER, {
        score: this.gameUI.getScore(),
        time: this.gameUI.getElapsedTime(),
        won: true
      });
    });
  }

  private startGameMusicOnInteraction(): void {
    const startMusic = () => {
      if (!this.gameMusic.isPlaying) {
        try {
          this.gameMusic.play();
        } catch (error) {
          console.warn('Could not start game music:', error);
        }
      }
      // Remove listeners after first interaction
      this.input.keyboard?.off('keydown', startMusic);
      this.input.off('pointerdown', startMusic);
    };

    // Listen for keyboard or pointer interaction
    this.input.keyboard?.on('keydown', startMusic);
    this.input.on('pointerdown', startMusic);
    
    // Also try to start immediately
    try {
      this.gameMusic.play();
    } catch (error) {
      // Ignore - will start on user interaction
    }
  }
}
