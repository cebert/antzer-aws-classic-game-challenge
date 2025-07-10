/**
 * @fileoverview Level building and rendering system for the game
 * Handles creation of backgrounds, static objects, platforms, and level layout
 */

import Phaser from 'phaser';
import { GRID_SIZE, ImageKeys, Direction } from '../config/constants';
import { LEVEL_1_CONFIG } from '../config/level1';
import { GridSystem, GridObjectType, CellType } from './grid-system';
import { Collectible, CollectibleType } from '../objects/collectible';
import { Obstacle, ObstacleType } from '../objects/obstacle';
import { Platform, PlatformType } from '../objects/platform';

// Constants for level building
const WATER_ROW_START = 2;
const WATER_ROW_COUNT = 3;
const PLATFORM_BUFFER = 400;
const PLATFORM_GAP = 50;
const PLATFORM_SPAWN_DELAY = 10;

// Platform dimensions
const LOG_WIDTH = 150;
const LEAF_WIDTH = 120;

// Platform speeds for each water row
const PLATFORM_SPEEDS = [25, 35, 30];

// Background tile indices
const TILE_INDICES = {
  GRASS: 0,
  WATER: 9,
  ROAD: 4
};

// Obstacle speeds
const OBSTACLE_SPEEDS = {
  POISON: 60,
  NAIL: 40,
  SPRAY: 80
} as const;

// Ant hill display size
const ANT_HILL_SIZE = 64;

/**
 * Level builder class responsible for creating and rendering game levels.
 * 
 * This class provides:
 * - Background tile rendering based on grid system
 * - Static object creation (obstacles, collectibles)
 * - Dynamic platform generation for water areas
 * - Ant hill (goal) creation
 * - Level layout management
 * 
 * The level builder works with the GridSystem to create visually consistent
 * levels that match the underlying game logic grid.
 */
export class LevelBuilder {
  /** Reference to the Phaser scene */
  private scene: Phaser.Scene;
  /** Reference to the grid system */
  private gridSystem: GridSystem;

  /**
   * Creates a new LevelBuilder instance
   * @param scene - The Phaser scene to build the level in
   * @param gridSystem - The grid system to use for positioning
   */
  constructor(scene: Phaser.Scene, gridSystem: GridSystem) {
    this.scene = scene;
    this.gridSystem = gridSystem;
  }

  /**
   * Creates the background tiles for the entire level based on the grid system.
   * Renders appropriate tiles for grass, water, and road areas.
   */
  public createBackground(): void {
    // Render background based on grid definition
    for (let row = 0; row < this.gridSystem.getGridHeight(); row++) {
      for (let col = 0; col < this.gridSystem.getGridWidth(); col++) {
        const cell = this.gridSystem.getCell(row, col);
        if (!cell) continue;

        const { x, y } = this.gridSystem.getWorldPosition(row, col);
        
        // Choose background tile based on cell type
        let tileIndex = TILE_INDICES.GRASS;
        switch (cell.type) {
          case CellType.SAFE_GRASS:
            tileIndex = TILE_INDICES.GRASS;
            break;
          case CellType.WATER:
            tileIndex = TILE_INDICES.WATER;
            break;
          case CellType.ROAD:
            tileIndex = TILE_INDICES.ROAD;
            break;
        }
        
        // Create background tile
        this.scene.add.image(x, y, ImageKeys.BACKGROUND_TILES, tileIndex)
          .setOrigin(0.5, 0.5)
          .setDisplaySize(GRID_SIZE, GRID_SIZE)
          .setDepth(-1);
      }
    }
  }

  /**
   * Creates static objects (obstacles and collectibles) based on the grid definition
   * @param obstacles - Physics group to add obstacle objects to
   * @param collectibles - Physics group to add collectible objects to
   */
  public createStaticObjects(
    obstacles: Phaser.Physics.Arcade.Group,
    collectibles: Phaser.Physics.Arcade.Group
  ): void {
    for (let row = 0; row < this.gridSystem.getGridHeight(); row++) {
      for (let col = 0; col < this.gridSystem.getGridWidth(); col++) {
        const cell = this.gridSystem.getCell(row, col);
        if (!cell) continue;

        this.createGridObject(row, col, cell.object, obstacles, collectibles);
      }
    }
  }

  /**
   * Creates moving platforms for water areas with proper spacing and speeds.
   * Generates logs and leaves that move in alternating directions.
   * @param platforms - Physics group to add platform objects to
   */
  public createWaterPlatforms(platforms: Phaser.Physics.Arcade.Group): void {
    const width = this.scene.cameras.main.width;
    
    // Create water zones - 3 water rows: LOG, LEAF, LOG (rows 2-4)
    for (let i = 0; i < WATER_ROW_COUNT; i++) {
      const waterRow = WATER_ROW_START + i;
      const y = waterRow * GRID_SIZE;
      
      // Alternate platform types: LOG, LEAF, LOG
      const platformType = i % 2 === 0 ? PlatformType.LOG : PlatformType.LEAF;
      const direction = i % 2 === 0 ? Direction.RIGHT : Direction.LEFT;
      
      // Get speed for this row
      const speed = PLATFORM_SPEEDS[i];
      
      // Calculate platform spacing
      const platformWidth = platformType === PlatformType.LOG ? LOG_WIDTH : LEAF_WIDTH;
      const platformSpacing = platformWidth + PLATFORM_GAP;
      const platformCount = Math.ceil((width + PLATFORM_BUFFER) / platformSpacing);
      
      for (let j = 0; j < platformCount; j++) {
        let platformX;
        
        if (direction === Direction.RIGHT) {
          platformX = -200 + (j * platformSpacing);
        } else {
          platformX = width + 200 - (j * platformSpacing);
        }
        
        const platform = new Platform(
          this.scene,
          platformX,
          y + GRID_SIZE / 2,
          platformType,
          speed,
          direction
        );
        
        platforms.add(platform);
        
        // Ensure platforms move
        this.scene.time.delayedCall(PLATFORM_SPAWN_DELAY, () => {
          if (direction === Direction.LEFT) {
            platform.setVelocityX(-speed);
          } else {
            platform.setVelocityX(speed);
          }
        });
      }
    }
  }

  /**
   * Creates the ant hill (goal object) at the specified location
   * @returns The created ant hill sprite
   */
  public createAntHill(): Phaser.Physics.Arcade.Sprite {
    const { x, y } = this.gridSystem.getWorldPosition(
      LEVEL_1_CONFIG.antHillRow,
      LEVEL_1_CONFIG.antHillCol
    );

    const antHill = this.scene.physics.add.sprite(x, y, ImageKeys.ANT_HILL);
    antHill.setImmovable(true);
    antHill.setDisplaySize(ANT_HILL_SIZE, ANT_HILL_SIZE);
    
    return antHill;
  }

  /**
   * Creates visual sprites for collectible items after placing them randomly
   * @param collectibles - Physics group to add collectible sprites to
   */
  public createCollectibleSprites(collectibles: Phaser.Physics.Arcade.Group): void {
    // Place random collectibles first
    this.gridSystem.placeRandomCollectibles();

    // Create visual sprites for all collectibles
    const cherries = this.gridSystem.getAllCellsOfType(GridObjectType.CHERRY);
    const cookies = this.gridSystem.getAllCellsOfType(GridObjectType.COOKIE);

    [...cherries, ...cookies].forEach(({ row, col }) => {
      const { x, y } = this.gridSystem.getWorldPosition(row, col);
      const cell = this.gridSystem.getCell(row, col);
      
      if (cell) {
        const collectibleType = cell.object === GridObjectType.CHERRY 
          ? CollectibleType.CHERRY 
          : CollectibleType.COOKIE;
        
        const collectible = new Collectible(this.scene, x, y, collectibleType);
        collectibles.add(collectible);
      }
    });
  }

  /**
   * Creates a specific grid object at the given coordinates
   * @param row - Grid row position
   * @param col - Grid column position
   * @param objectType - Type of object to create
   * @param obstacles - Physics group for obstacles
   * @param collectibles - Physics group for collectibles
   * @private
   */
  private createGridObject(
    row: number,
    col: number,
    objectType: GridObjectType,
    obstacles: Phaser.Physics.Arcade.Group,
    collectibles: Phaser.Physics.Arcade.Group
  ): void {
    const { x, y } = this.gridSystem.getWorldPosition(row, col);
    
    switch (objectType) {
      case GridObjectType.CHERRY:
        const cherry = new Collectible(this.scene, x, y, CollectibleType.CHERRY);
        collectibles.add(cherry);
        break;
      case GridObjectType.COOKIE:
        const cookie = new Collectible(this.scene, x, y, CollectibleType.COOKIE);
        collectibles.add(cookie);
        break;
      case GridObjectType.POISON:
        const poisonDirection = row % 2 === 0 ? Direction.RIGHT : Direction.LEFT;
        const poison = new Obstacle(this.scene, x, y, ObstacleType.POISON, OBSTACLE_SPEEDS.POISON, poisonDirection);
        obstacles.add(poison);
        break;
      case GridObjectType.NAIL:
        const nailDirection = row % 2 === 0 ? Direction.RIGHT : Direction.LEFT;
        const nail = new Obstacle(this.scene, x, y, ObstacleType.NAIL, OBSTACLE_SPEEDS.NAIL, nailDirection);
        obstacles.add(nail);
        break;
      case GridObjectType.SPRAY:
        const sprayDirection = row % 2 === 0 ? Direction.RIGHT : Direction.LEFT;
        const spray = new Obstacle(this.scene, x, y, ObstacleType.SPRAY, OBSTACLE_SPEEDS.SPRAY, sprayDirection);
        obstacles.add(spray);
        break;
      case GridObjectType.ANT_HILL:
      case GridObjectType.LOG:
      case GridObjectType.LEAF:
      case GridObjectType.NONE:
        // These are handled elsewhere or don't need objects
        break;
    }
  }
}
