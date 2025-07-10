/**
 * @fileoverview Collision detection and response system for the game
 * Handles grid-based collision detection, platform interactions, and collectible collection
 */

import Phaser from 'phaser';
import { GRID_SIZE } from '../config/constants';
import { GridSystem, GridObjectType, CellType } from './grid-system';
import { Player } from '../objects/player';

// Constants for collision detection
const ROAD_START_ROW = 6;
const ROAD_END_ROW = 8;
const WATER_START_ROW = 2;
const WATER_END_ROW = 4;
const FRAME_RATE = 60;

// Point values for collectibles
const CHERRY_POINTS = 10;
const COOKIE_POINTS = 20;

/**
 * Interface representing the result of a collision check
 */
export interface CollisionResult {
  /** Whether the collision resulted in player death */
  isDead: boolean;
  /** Whether the collision resulted in a win condition */
  isWin: boolean;
  /** Information about collected items (if any) */
  collectible?: {
    /** Type of collectible that was collected */
    type: GridObjectType.CHERRY | GridObjectType.COOKIE;
    /** Points awarded for the collectible */
    points: number;
    /** Grid row where collectible was located */
    row: number;
    /** Grid column where collectible was located */
    col: number;
  };
  /** Platform movement information (if player is on a platform) */
  platformMovement?: {
    /** Horizontal movement delta from platform */
    deltaX: number;
  };
}

/**
 * Collision manager class that handles all collision detection and response logic.
 * 
 * This class provides:
 * - Grid-based collision detection for player safety
 * - Platform collision detection for water traversal
 * - Collectible collection handling
 * - Win/death condition detection
 * - Dynamic object position updates in the grid system
 * 
 * The collision manager works closely with the GridSystem to provide
 * accurate, frame-by-frame collision detection for the Frogger-style gameplay.
 */
export class CollisionManager {
  /** Reference to the game's grid system */
  private gridSystem: GridSystem;
  /** Reference to the platforms physics group */
  private platforms: Phaser.Physics.Arcade.Group;

  /**
   * Creates a new CollisionManager instance
   * @param gridSystem - The grid system to use for collision detection
   * @param platforms - The physics group containing platform objects
   */
  constructor(gridSystem: GridSystem, platforms: Phaser.Physics.Arcade.Group) {
    this.gridSystem = gridSystem;
    this.platforms = platforms;
  }

  /**
   * Performs comprehensive collision detection for the player
   * @param player - The player object to check collisions for
   * @returns CollisionResult containing information about any collisions detected
   */
  public checkPlayerCollision(player: Player): CollisionResult {
    if (player.isPlayerDead()) {
      return { isDead: false, isWin: false };
    }

    const { row, col } = this.gridSystem.getPlayerGridPosition(player.x, player.y);
    const cell = this.gridSystem.getCell(row, col);

    if (!cell) {
      return { isDead: true, isWin: false };
    }

    // Handle collectibles
    if (cell.object === GridObjectType.CHERRY || cell.object === GridObjectType.COOKIE) {
      const points = cell.object === GridObjectType.CHERRY ? CHERRY_POINTS : COOKIE_POINTS;
      this.gridSystem.setCell(row, col, GridObjectType.NONE); // Remove collectible
      
      return {
        isDead: false,
        isWin: false,
        collectible: {
          type: cell.object,
          points,
          row,
          col
        }
      };
    }

    // Handle ant hill (win condition)
    if (cell.object === GridObjectType.ANT_HILL) {
      return { isDead: false, isWin: true };
    }

    // Special handling for water - check if player is on a platform
    if (cell.type === CellType.WATER) {
      const platformResult = this.checkPlatformCollision(row, col);
      if (platformResult.isOnPlatform) {
        return {
          isDead: false,
          isWin: false,
          platformMovement: { deltaX: platformResult.deltaX }
        };
      } else {
        return { isDead: true, isWin: false };
      }
    } else if (!cell.safe) {
      // Handle other unsafe cells (roads with obstacles, etc.)
      return { isDead: true, isWin: false };
    }

    return { isDead: false, isWin: false };
  }

  /**
   * Updates the positions of obstacle objects in the grid system.
   * Clears old positions and sets new positions based on current sprite locations.
   * @param obstacles - The physics group containing obstacle objects
   */
  public updateObstaclePositions(obstacles: Phaser.Physics.Arcade.Group): void {
    // Clear all obstacles from road rows
    for (let row = ROAD_START_ROW; row <= ROAD_END_ROW; row++) {
      this.gridSystem.clearObjectsInRow(row, [
        GridObjectType.POISON,
        GridObjectType.SPRAY,
        GridObjectType.NAIL
      ]);
    }

    // Re-add obstacles based on current sprite positions
    obstacles.getChildren().forEach((obstacle) => {
      const obstacleSprite = obstacle as any;
      const row = Math.floor(obstacleSprite.y / GRID_SIZE);
      const col = Math.floor(obstacleSprite.x / GRID_SIZE);

      if (row >= ROAD_START_ROW && row <= ROAD_END_ROW && col >= 0 && col < this.gridSystem.getGridWidth()) {
        // Determine actual obstacle type based on texture
        let objectType = GridObjectType.POISON; // Default

        if (obstacleSprite.texture && obstacleSprite.texture.key) {
          switch (obstacleSprite.texture.key) {
            case 'poison': objectType = GridObjectType.POISON; break;
            case 'spray': objectType = GridObjectType.SPRAY; break;
            case 'nail': objectType = GridObjectType.NAIL; break;
            default: objectType = GridObjectType.POISON; break;
          }
        }

        this.gridSystem.setCell(row, col, objectType);
      }
    });
  }

  /**
   * Updates the positions of platform objects in the grid system.
   * Handles the dynamic positioning of logs and leaves in water areas.
   */
  public updatePlatformPositions(): void {
    // Update platform positions in grid for water rows
    for (let row = WATER_START_ROW; row <= WATER_END_ROW; row++) {
      // Clear old platform positions
      this.gridSystem.clearObjectsInRow(row, [GridObjectType.LOG, GridObjectType.LEAF]);

      // Add platforms based on current sprite positions
      this.platforms.getChildren().forEach((platform) => {
        const platformSprite = platform as Phaser.Physics.Arcade.Sprite;
        const platformRow = Math.floor(platformSprite.y / GRID_SIZE);

        if (platformRow === row) {
          const platformType = row % 2 === 0 ? GridObjectType.LOG : GridObjectType.LEAF;
          
          // Platform spans multiple columns
          const leftCol = Math.max(0, Math.floor((platformSprite.x - platformSprite.displayWidth / 2) / GRID_SIZE));
          const rightCol = Math.min(this.gridSystem.getGridWidth() - 1, Math.floor((platformSprite.x + platformSprite.displayWidth / 2) / GRID_SIZE));

          for (let col = leftCol; col <= rightCol; col++) {
            this.gridSystem.setCell(platformRow, col, platformType);
          }
        }
      });
    }
  }

  /**
   * Checks if the player is currently on a platform and calculates movement
   * @param row - The grid row to check
   * @param col - The grid column to check
   * @returns Object containing platform collision information
   * @private
   */
  private checkPlatformCollision(row: number, col: number): { isOnPlatform: boolean; deltaX: number } {
    let isOnPlatform = false;
    let deltaX = 0;

    this.platforms.getChildren().forEach((platform) => {
      const platformSprite = platform as Phaser.Physics.Arcade.Sprite;
      const platformRow = Math.floor(platformSprite.y / GRID_SIZE);

      // Check if platform overlaps with player's grid position
      if (platformRow === row) {
        // Platform spans multiple columns, check if player is within platform width
        const platformLeftCol = Math.floor((platformSprite.x - platformSprite.displayWidth / 2) / GRID_SIZE);
        const platformRightCol = Math.floor((platformSprite.x + platformSprite.displayWidth / 2) / GRID_SIZE);

        if (col >= platformLeftCol && col <= platformRightCol) {
          isOnPlatform = true;
          // Calculate platform movement
          if (platformSprite.body && platformSprite.body.velocity) {
            deltaX = platformSprite.body.velocity.x / FRAME_RATE;
          }
        }
      }
    });

    return { isOnPlatform, deltaX };
  }
}
