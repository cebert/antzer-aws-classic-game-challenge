import Phaser from 'phaser';
import { AudioKeys, GRID_SIZE, ImageKeys, SceneKeys } from '../config/Constants';
import { LEVEL_1, LEVEL_1_CONFIG, validateLevel } from '../config/Level1';
import { Collectible, CollectibleType } from '../objects/Collectible';
import { Obstacle, ObstacleType } from '../objects/Obstacle';
import { Platform, PlatformType } from '../objects/Platform';
import { Player } from '../objects/Player';
import { AudioManager } from '../utils/AudioManager';

// Grid cell types
enum CellType {
  SAFE_GRASS = 'safe_grass',
  WATER = 'water', 
  ROAD = 'road'
}

// Grid object types that can occupy cells
enum GridObjectType {
  NONE = 'none',
  LOG = 'log',
  LEAF = 'leaf', 
  POISON = 'poison',
  SPRAY = 'spray',
  NAIL = 'nail',
  CHERRY = 'cherry',
  COOKIE = 'cookie',
  ANT_HILL = 'ant_hill'
}

interface GridCell {
  type: CellType;
  object: GridObjectType;
  safe: boolean; // true if player can survive on this cell
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private antHill!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.Group;
  private waterZones: Phaser.GameObjects.Rectangle[] = [];
  
  // Grid system
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private gameGrid: GridCell[][] = [];
  
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private startTime: number = 0;
  private gameMusic!: Phaser.Sound.BaseSound;
  private audioManager!: AudioManager;
  
  private gameOver: boolean = false;
  private gameWon: boolean = false;
  
  // Mobile controls
  private mobileControls: {
    upButton?: Phaser.GameObjects.Container;
    downButton?: Phaser.GameObjects.Container;
    leftButton?: Phaser.GameObjects.Container;
    rightButton?: Phaser.GameObjects.Container;
  } = {};

  constructor() {
    super({ key: SceneKeys.GAME });
  }

  create(): void {
    // Stop any existing audio from previous scenes
    this.sound.stopAll();
    
    // Validate level configuration
    const levelErrors = validateLevel();
    if (levelErrors.length > 0) {
      console.error('❌ Level validation errors:', levelErrors);
      levelErrors.forEach(error => console.error(`  - ${error}`));
    }
    
    // Initialize audio manager
    this.audioManager = new AudioManager(this);
    
    // Reset game state
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.startTime = this.time.now;
    
    // Initialize grid system
    this.initializeGrid();
    
    // Create groups first (needed for createGridBackground)
    this.obstacles = this.physics.add.group();
    this.collectibles = this.physics.add.group();
    this.platforms = this.physics.add.group();
    this.waterZones = [];
    
    // Create background based on grid (after groups are created)
    this.createGridBackground();
    
    // Create platforms and obstacles for the level
    this.createLevel();
    
    // Create player at the defined starting position
    this.player = new Player(
      this,
      LEVEL_1_CONFIG.antStartCol * GRID_SIZE + GRID_SIZE / 2,
      LEVEL_1_CONFIG.antStartRow * GRID_SIZE + GRID_SIZE / 2
    );
    
    // Create ant hill (goal) at defined position
    this.antHill = this.physics.add.sprite(
      LEVEL_1_CONFIG.antHillCol * GRID_SIZE + GRID_SIZE / 2,
      LEVEL_1_CONFIG.antHillRow * GRID_SIZE + GRID_SIZE / 2,
      ImageKeys.ANT_HILL
    );
    this.antHill.setImmovable(true);
    this.antHill.setDisplaySize(64, 64);
    
    // All collision detection is now grid-based in checkGridCollision()
    // No physics-based collision needed
    
    this.physics.add.overlap(
      this.player,
      this.antHill,
      this.handleWin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
    
    // No collider needed - player should ride on platforms, not collide with them
    
    // Create UI
    this.createUI();
    
    // Show instructions at the start
    const instructions = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 100,
      'Use ARROW KEYS to move the ant\nReach the ant hill at the top!',
      {
        font: '18px Arial',
        color: '#ffffff',
        align: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 15, y: 10 }
      }
    ).setOrigin(0.5)
     .setScrollFactor(0)
     .setDepth(2000);
     
    // Remove instructions immediately on any key press
    this.input.keyboard?.on('keydown', () => {
      if (instructions && instructions.active) {
        instructions.destroy();
      }
    });
    
    // Also fade out after 2 seconds
    this.time.delayedCall(2000, () => {
      if (instructions && instructions.active) {
        instructions.destroy();
      }
    });
    
    // Set up sounds
    this.gameMusic = this.audioManager.add(AudioKeys.MUSIC_GAME, { loop: true, volume: 0.4 });
    this.audioManager.add(AudioKeys.SFX_COLLECT, { volume: 0.5 });
    this.audioManager.add(AudioKeys.SFX_WIN, { volume: 0.6 });
    
    // Start music after user interaction (required by modern browsers)
    this.startGameMusicOnInteraction();
    
    // Create mobile controls if on mobile device
    this.createMobileControls();
  }

  update(): void {
    if (this.gameOver || this.gameWon) return;
    
    // Update player
    this.player.update();
    
    // Update obstacles
    this.obstacles.getChildren().forEach((obstacle) => {
      (obstacle as Obstacle).update();
    });
    
    // Update platforms (they now reset their own positions)
    this.platforms.getChildren().forEach((platform) => {
      (platform as Platform).update();
    });
    
    // Update obstacle positions in grid
    this.updateObstacleGrid();
    
    // Check grid-based collision
    this.checkGridCollision();
    
    // Update timer
    this.updateTimer();
  }
  
  private updateObstacleGrid(): void {
    // Clear all obstacles from grid
    for (let row = 6; row <= 8; row++) { // Road rows
      for (let col = 0; col < this.gridWidth; col++) {
        const cell = this.gameGrid[row][col];
        if (cell.object === GridObjectType.POISON || cell.object === GridObjectType.SPRAY || cell.object === GridObjectType.NAIL) {
          this.setGridCell(row, col, GridObjectType.NONE);
        }
      }
    }
    
    // Re-add obstacles based on current sprite positions
    this.obstacles.getChildren().forEach((obstacle) => {
      const obstacleSprite = obstacle as any;
      const row = Math.floor(obstacleSprite.y / GRID_SIZE);
      const col = Math.floor(obstacleSprite.x / GRID_SIZE);
      
      if (row >= 6 && row <= 8 && col >= 0 && col < this.gridWidth) {
        // Determine actual obstacle type based on texture
        let objectType = GridObjectType.POISON; // Default
        
        if (obstacleSprite.texture && obstacleSprite.texture.key) {
          switch (obstacleSprite.texture.key) {
            case 'poison': objectType = GridObjectType.POISON; break;
            case 'spray': objectType = GridObjectType.SPRAY; break;
            default: objectType = GridObjectType.POISON; break;
          }
        }
        
        this.setGridCell(row, col, objectType);
        
        // Debug log only once per obstacle (remove spam)
        // Removed debug logging
      }
    });
  }

  private createGridBackground(): void {
    // Render background based on our grid definition
    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        const cell = this.gameGrid[row][col];
        const x = col * GRID_SIZE;
        const y = row * GRID_SIZE;
        
        
        // Choose background tile based on cell type
        let tileIndex = 0;
        switch (cell.type) {
          case CellType.SAFE_GRASS:
            tileIndex = 0; // Grass tile
            break;
          case CellType.WATER:
            tileIndex = 9; // Try tile 9 - you suggested this might be water
            break;
          case CellType.ROAD:
            tileIndex = 4; // Try tile 4 - should be a dark road tile
            break;
        }
        
        // Create background tile - position at center of grid cell
        this.add.image(x + GRID_SIZE / 2, y + GRID_SIZE / 2, ImageKeys.BACKGROUND_TILES, tileIndex)
          .setOrigin(0.5, 0.5)
          .setDisplaySize(GRID_SIZE, GRID_SIZE)
          .setDepth(-1);
        
        // Add objects on top of background
        this.createGridObject(row, col, cell.object);
      }
    }
  }
  
  private createGridObject(row: number, col: number, objectType: GridObjectType): void {
    const x = col * GRID_SIZE + GRID_SIZE / 2;
    const y = row * GRID_SIZE + GRID_SIZE / 2;
    
    switch (objectType) {
      case GridObjectType.CHERRY:
        const cherry = new Collectible(this, x, y, CollectibleType.CHERRY);
        this.collectibles.add(cherry);
        break;
      case GridObjectType.COOKIE:
        const cookie = new Collectible(this, x, y, CollectibleType.COOKIE);
        this.collectibles.add(cookie);
        break;
      case GridObjectType.LOG:
        const log = new Platform(this, x, y, PlatformType.LOG, 25, 'right');
        this.platforms.add(log);
        break;
      case GridObjectType.LEAF:
        const leaf = new Platform(this, x, y, PlatformType.LEAF, 35, 'left');
        this.platforms.add(leaf);
        break;
      case GridObjectType.POISON:
        const poisonSpeed = 60;
        const poisonDirection = row % 2 === 0 ? 'right' : 'left'; // Row 6 = right
        const poison = new Obstacle(this, x, y, ObstacleType.POISON, poisonSpeed, poisonDirection);
        this.obstacles.add(poison);
        break;
      case GridObjectType.NAIL:
        const nailSpeed = 40;
        const nailDirection = row % 2 === 0 ? 'right' : 'left'; // Row 8 = right
        const nail = new Obstacle(this, x, y, ObstacleType.NAIL, nailSpeed, nailDirection);
        this.obstacles.add(nail);
        break;
      case GridObjectType.SPRAY:
        const spraySpeed = 80;
        const sprayDirection = row % 2 === 0 ? 'right' : 'left'; // Row 7 = left
        const spray = new Obstacle(this, x, y, ObstacleType.SPRAY, spraySpeed, sprayDirection);
        this.obstacles.add(spray);
        break;
      case GridObjectType.ANT_HILL:
        // Ant hill is already created separately in the create() method
        // We don't need to create it again here
        break;
      case GridObjectType.NONE:
        // Nothing to create
        break;
    }
  }


  private createLevel(): void {
    const width = this.cameras.main.width;
    
    // Create water zones - 3 water rows: LOG, LEAF, LOG (rows 2-4)
    for (let i = 0; i < 3; i++) {
      const waterRow = 2 + i; // Rows 2, 3, 4
      const y = waterRow * GRID_SIZE;
      
      // Create water zone for this row
      const waterZone = this.add.rectangle(
        0,
        y,
        width,
        GRID_SIZE, // Each water row is 1 row high
        0x000000,
        0.0
      ).setOrigin(0)
       .setVisible(false);
      
      this.waterZones.push(waterZone);
      
      // Alternate platform types: LOG, LEAF, LOG, LEAF, LOG, LEAF
      const platformType = i % 2 === 0 ? PlatformType.LOG : PlatformType.LEAF;
      const direction = i % 2 === 0 ? 'right' : 'left'; // Logs go right, leaves go left
      
      // Fixed speeds for each water row for consistent timing
      const speeds = [25, 35, 30]; // Different speed per row (3 water rows)
      const speed = speeds[i];
      
      // Add initial platforms with spacing that ensures continuous coverage
      // We need enough platforms to cover the screen width plus some buffer
      const platformWidth = platformType === PlatformType.LOG ? 150 : 120;
      const platformSpacing = platformWidth + 50; // Small gap between platforms
      const platformCount = Math.ceil((width + 400) / platformSpacing); // Cover screen + buffer
      
      for (let j = 0; j < platformCount; j++) {
        let platformX;
        
        if (direction === 'right') {
          // For right-moving platforms, spread them from left side
          platformX = -200 + (j * platformSpacing);
        } else {
          // For left-moving platforms, spread them from right side  
          platformX = width + 200 - (j * platformSpacing);
        }
        
        const platform = new Platform(
          this,
          platformX,
          y + GRID_SIZE / 2, // Center in the water row
          platformType,
          speed,
          direction
        );
        
        this.platforms.add(platform);
        
        // Backup velocity setting to ensure platforms move
        this.time.delayedCall(10, () => {
          if (direction === 'left') {
            platform.setVelocityX(-speed);
          } else {
            platform.setVelocityX(speed);
          }
        });
      }
    }
    
    // Obstacles are now created from the level definition via createGridObject
    
    // Place collectibles in grid system and create visual sprites
    this.placeCollectibles();
    this.createCollectibleSprites();
  }

  private checkGridCollision(): void {
    if (this.player.isPlayerDead()) return;
    
    // Update moving objects in grid
    this.updateMovingObjects();
    
    // Simple grid-based collision detection
    const playerRow = Math.floor(this.player.y / GRID_SIZE);
    const playerCol = Math.floor(this.player.x / GRID_SIZE);
    
    // Get the cell the player is on
    const cell = this.getGridCell(playerRow, playerCol);
    
    if (!cell) {
      this.playerDie();
      return;
    }
    
    // Handle collectibles
    if (cell.object === GridObjectType.CHERRY || cell.object === GridObjectType.COOKIE) {
      const points = cell.object === GridObjectType.CHERRY ? 10 : 20;
      this.score += points;
      this.scoreText.setText(`Score: ${this.score}`);
      this.audioManager.play(AudioKeys.SFX_COLLECT);
      this.setGridCell(playerRow, playerCol, GridObjectType.NONE); // Remove collectible
      
      // Also remove the visual sprite
      this.removeCollectibleSprite(playerRow, playerCol);
    }
    
    // Handle ant hill (win condition)
    if (cell.object === GridObjectType.ANT_HILL) {
      this.handleWin(null as any, null as any);
      return;
    }
    
    // Special handling for water - check if player is on a platform
    if (cell.type === CellType.WATER) {
      const isOnPlatform = this.isOnPlatform(playerRow, playerCol);
      if (isOnPlatform) {
        // Player is safe on a platform, move with it
        this.movePlayerWithPlatform(playerRow);
      } else {
        // Player is in water without a platform - die
        this.playerDie();
        return;
      }
    } else if (!cell.safe) {
      // Handle other unsafe cells (roads with obstacles, etc.)
      this.playerDie();
      return;
    }
  }
  
  private removeCollectibleSprite(row: number, col: number): void {
    // Remove the visual collectible sprite at this grid position
    this.collectibles.getChildren().forEach((collectible) => {
      const sprite = collectible as any;
      const spriteRow = Math.floor(sprite.y / GRID_SIZE);
      const spriteCol = Math.floor(sprite.x / GRID_SIZE);
      
      if (spriteRow === row && spriteCol === col) {
        sprite.destroy();
      }
    });
  }
  
  private isOnPlatform(row: number, col: number): boolean {
    // Check if there's a platform in this grid square
    let onPlatform = false;
    
    this.platforms.getChildren().forEach((platform) => {
      const platformSprite = platform as Phaser.Physics.Arcade.Sprite;
      const platformRow = Math.floor(platformSprite.y / GRID_SIZE);
      
      // Check if platform overlaps with player's grid position
      if (platformRow === row) {
        // Platform spans multiple columns, check if player is within platform width
        const platformLeftCol = Math.floor((platformSprite.x - platformSprite.displayWidth / 2) / GRID_SIZE);
        const platformRightCol = Math.floor((platformSprite.x + platformSprite.displayWidth / 2) / GRID_SIZE);
        
        if (col >= platformLeftCol && col <= platformRightCol) {
          onPlatform = true;
        }
      }
    });
    
    return onPlatform;
  }
  
  private movePlayerWithPlatform(row: number): void {
    // Find the platform the player is on and move with it
    this.platforms.getChildren().forEach((platform) => {
      const platformSprite = platform as Phaser.Physics.Arcade.Sprite;
      const platformRow = Math.floor(platformSprite.y / GRID_SIZE);
      
      if (platformRow === row) {
        // Check if player overlaps with this platform
        const platformLeft = platformSprite.x - platformSprite.displayWidth / 2;
        const platformRight = platformSprite.x + platformSprite.displayWidth / 2;
        const playerLeft = this.player.x - GRID_SIZE / 2;
        const playerRight = this.player.x + GRID_SIZE / 2;
        
        // Check for overlap
        if (playerRight > platformLeft && playerLeft < platformRight) {
          // Player is on this platform - move with it
          if (platformSprite.body && platformSprite.body.velocity) {
            const deltaX = platformSprite.body.velocity.x / 60;
            this.player.moveWithPlatform(deltaX);
          }
          return; // Found the platform, no need to check others
        }
      }
    });
  }
  
  private playerDie(): void {
    this.player.die();
    this.gameOver = true;
    
    this.time.delayedCall(1500, () => {
      this.audioManager.stop(AudioKeys.MUSIC_GAME);
      this.scene.start(SceneKeys.GAME_OVER, {
        score: this.score,
        time: this.getElapsedTime(),
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
        score: this.score,
        time: this.getElapsedTime(),
        won: true
      });
    });
  }

  private createUI(): void {
    // Score text
    this.scoreText = this.add.text(
      20,
      20,
      `Score: ${this.score}`,
      {
        font: '24px Arial',
        color: '#ffffff'
      }
    ).setScrollFactor(0)
      .setShadow(2, 2, '#000000', 2);
    
    // Time text
    this.timeText = this.add.text(
      this.cameras.main.width - 150,
      20,
      'Time: 0:00',
      {
        font: '24px Arial',
        color: '#ffffff'
      }
    ).setScrollFactor(0)
      .setShadow(2, 2, '#000000', 2);
      
    // Exit button
    const backButton = this.add.text(
      this.cameras.main.width - 80,
      this.cameras.main.height - 30,
      'EXIT',
      {
        font: '18px Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setScrollFactor(0)
      .setShadow(1, 1, '#000000', 1)
      .setInteractive({ useHandCursor: true });
      
    // Add click handler for back button
    backButton.on('pointerdown', () => {
      this.audioManager.stop(AudioKeys.MUSIC_GAME);
      this.scene.start(SceneKeys.MENU);
    });
  }

  private updateTimer(): void {
    const elapsed = this.getElapsedTime();
    this.timeText.setText(`Time: ${elapsed}`);
  }

  private getElapsedTime(): string {
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Grid system methods
  private initializeGrid(): void {
    this.gridWidth = LEVEL_1_CONFIG.width;
    this.gridHeight = LEVEL_1_CONFIG.height;
    
    // Initialize grid from level definition
    this.gameGrid = [];
    for (let row = 0; row < this.gridHeight; row++) {
      this.gameGrid[row] = [];
      const levelRow = LEVEL_1[row];
      
      for (let col = 0; col < this.gridWidth; col++) {
        const cellChar = levelRow[col];
        const cellInfo = this.parseCellCharacter(cellChar);
        
        this.gameGrid[row][col] = {
          type: cellInfo.type,
          object: cellInfo.object,
          safe: this.isCellSafe(cellInfo.type, cellInfo.object)
        };
      }
    }
  }
  
  private parseCellCharacter(char: string): { type: CellType, object: GridObjectType } {
    switch (char) {
      case 'G': return { type: CellType.SAFE_GRASS, object: GridObjectType.NONE };
      case 'A': return { type: CellType.SAFE_GRASS, object: GridObjectType.NONE }; // Ant start (just grass)
      case 'H': return { type: CellType.SAFE_GRASS, object: GridObjectType.ANT_HILL };
      case 'C': return { type: CellType.SAFE_GRASS, object: GridObjectType.CHERRY };
      case 'K': return { type: CellType.SAFE_GRASS, object: GridObjectType.COOKIE };
      case 'R': return { type: CellType.ROAD, object: GridObjectType.NONE };
      case 'P': return { type: CellType.ROAD, object: GridObjectType.POISON };
      case 'N': return { type: CellType.ROAD, object: GridObjectType.NAIL };
      case 'Y': return { type: CellType.ROAD, object: GridObjectType.SPRAY };
      case 'W': return { type: CellType.WATER, object: GridObjectType.NONE };
      case 'L': return { type: CellType.WATER, object: GridObjectType.LOG };
      case 'F': return { type: CellType.WATER, object: GridObjectType.LEAF };
      default: return { type: CellType.SAFE_GRASS, object: GridObjectType.NONE };
    }
  }
  
  private isCellSafe(cellType: CellType, objectType: GridObjectType): boolean {
    switch (cellType) {
      case CellType.SAFE_GRASS:
        return true; // Grass is always safe
      case CellType.ROAD:
        return objectType === GridObjectType.NONE; // Road is safe unless it has an obstacle
      case CellType.WATER:
        return objectType === GridObjectType.LOG || objectType === GridObjectType.LEAF; // Water is safe only with platforms
      default:
        return true;
    }
  }
  
  private setGridCell(row: number, col: number, objectType: GridObjectType): void {
    if (row >= 0 && row < this.gridHeight && col >= 0 && col < this.gridWidth) {
      this.gameGrid[row][col].object = objectType;
      this.gameGrid[row][col].safe = this.isCellSafe(this.gameGrid[row][col].type, objectType);
    }
  }
  
  private getGridCell(row: number, col: number): GridCell | null {
    if (row >= 0 && row < this.gridHeight && col >= 0 && col < this.gridWidth) {
      return this.gameGrid[row][col];
    }
    return null;
  }
  
  private placeCollectibles(): void {
    // Place cherries in bottom grass area
    for (let i = 0; i < 8; i++) {
      const col = Math.floor(Math.random() * this.gridWidth);
      const row = Math.floor(Math.random() * 3) + (this.gridHeight - 3); // Bottom 3 rows
      if (this.gameGrid[row][col].object === GridObjectType.NONE) {
        this.setGridCell(row, col, GridObjectType.CHERRY);
      }
    }
    
    // Place cookies in top grass area
    for (let i = 0; i < 3; i++) {
      const col = Math.floor(Math.random() * this.gridWidth);
      const row = Math.floor(Math.random() * 2); // Top 2 rows
      if (this.gameGrid[row][col].object === GridObjectType.NONE) { // Don't overwrite ant hill
        this.setGridCell(row, col, GridObjectType.COOKIE);
      }
    }
  }
  
  private createCollectibleSprites(): void {
    // Create visual sprites for all collectibles placed in the grid
    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        const cell = this.gameGrid[row][col];
        
        if (cell.object === GridObjectType.CHERRY || cell.object === GridObjectType.COOKIE) {
          const x = col * GRID_SIZE + GRID_SIZE / 2;
          const y = row * GRID_SIZE + GRID_SIZE / 2;
          
          const collectibleType = cell.object === GridObjectType.CHERRY 
            ? CollectibleType.CHERRY 
            : CollectibleType.COOKIE;
          
          const collectible = new Collectible(
            this,
            x,
            y,
            collectibleType
          );
          
          this.collectibles.add(collectible);
        }
      }
    }
  }
  
  private startGameMusicOnInteraction(): void {
    // Start music on first user interaction (keyboard or click)
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
    
    // Also try to start immediately (might work if audio context is already unlocked)
    try {
      this.gameMusic.play();
    } catch (error) {
      // Ignore - will start on user interaction
    }
  }

  private updateMovingObjects(): void {
    // This will be called each frame to update positions of moving objects like platforms and obstacles
    // For now, we'll integrate with the existing Phaser sprite system
    
    // Update platform positions in grid
    this.platforms.getChildren().forEach((platform) => {
      const platformSprite = platform as Phaser.Physics.Arcade.Sprite;
      const row = Math.floor(platformSprite.y / GRID_SIZE);
      
      // Clear old position and set new position
      // This is simplified - in a full implementation you'd track which cells each platform occupies
      if (row >= 2 && row <= 4) { // Water rows
        const platformType = row % 2 === 0 ? GridObjectType.LOG : GridObjectType.LEAF;
        
        // Clear the row and re-add platforms
        for (let c = 0; c < this.gridWidth; c++) {
          if (this.gameGrid[row][c].object === GridObjectType.LOG || this.gameGrid[row][c].object === GridObjectType.LEAF) {
            this.setGridCell(row, c, GridObjectType.NONE);
          }
        }
        
        // Add platforms based on current sprite positions
        this.platforms.getChildren().forEach((p) => {
          const pSprite = p as Phaser.Physics.Arcade.Sprite;
          const pRow = Math.floor(pSprite.y / GRID_SIZE);
          const pCol = Math.floor(pSprite.x / GRID_SIZE);
          
          if (pRow === row && pCol >= 0 && pCol < this.gridWidth) {
            // Platform spans multiple columns
            const leftCol = Math.max(0, Math.floor((pSprite.x - pSprite.displayWidth / 2) / GRID_SIZE));
            const rightCol = Math.min(this.gridWidth - 1, Math.floor((pSprite.x + pSprite.displayWidth / 2) / GRID_SIZE));
            
            for (let c = leftCol; c <= rightCol; c++) {
              this.setGridCell(pRow, c, platformType);
            }
          }
        });
      }
    });
  }

  private createMobileControls(): void {
    // Check if we're on a mobile device or small screen
    const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS || 
                     this.sys.game.device.os.windowsPhone || this.cameras.main.width < 800;
    
    if (!isMobile) return;

    const buttonSize = 60;
    const buttonMargin = 20;
    
    // Create directional pad on the left side
    const leftPadX = buttonMargin + buttonSize;
    const leftPadY = this.cameras.main.height - buttonMargin - buttonSize;
    
    // Create action buttons on the right side (if needed in future)
    // const rightPadX = this.cameras.main.width - buttonMargin - buttonSize;
    // const rightPadY = this.cameras.main.height - buttonMargin - buttonSize;

    // UP button
    this.mobileControls.upButton = this.createControlButton(
      leftPadX, leftPadY - buttonSize - 10, '↑', () => this.player.moveUp()
    );

    // DOWN button  
    this.mobileControls.downButton = this.createControlButton(
      leftPadX, leftPadY + buttonSize + 10, '↓', () => this.player.moveDown()
    );

    // LEFT button
    this.mobileControls.leftButton = this.createControlButton(
      leftPadX - buttonSize - 10, leftPadY, '←', () => this.player.moveLeft()
    );

    // RIGHT button
    this.mobileControls.rightButton = this.createControlButton(
      leftPadX + buttonSize + 10, leftPadY, '→', () => this.player.moveRight()
    );
  }

  private createControlButton(x: number, y: number, symbol: string, callback: () => void): Phaser.GameObjects.Container {
    const buttonSize = 60;
    const container = this.add.container(x, y);

    // Create button background
    const background = this.add.circle(0, 0, buttonSize / 2, 0x333333, 0.7);
    background.setStrokeStyle(2, 0x666666);
    
    // Create button text
    const text = this.add.text(0, 0, symbol, {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Add to container
    container.add([background, text]);
    
    // Make it fixed to camera
    container.setScrollFactor(0);
    
    // Add interactivity
    background.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        background.setFillStyle(0x555555, 0.8);
        callback();
      })
      .on('pointerup', () => {
        background.setFillStyle(0x333333, 0.7);
      })
      .on('pointerout', () => {
        background.setFillStyle(0x333333, 0.7);
      });

    return container;
  }
}