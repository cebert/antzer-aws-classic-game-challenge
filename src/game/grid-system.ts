/**
 * @fileoverview Grid system for managing the game's grid-based collision and positioning system
 * Handles grid initialization, coordinate conversion, and cell state management
 */

import { GRID_SIZE } from '../config/constants';
import { LEVEL_1, LEVEL_1_CONFIG } from '../config/level1';

// Constants for collectible placement
const CHERRY_COUNT = 8;
const COOKIE_COUNT = 3;
const BOTTOM_GRASS_ROWS = 3;
const TOP_GRASS_ROWS = 2;

/**
 * Enumeration of different terrain types that can exist in grid cells
 */
export enum CellType {
  /** Safe grass terrain where the player can walk freely */
  SAFE_GRASS = 'safe_grass',
  /** Water terrain that requires platforms for safety */
  WATER = 'water', 
  /** Road terrain that may contain obstacles */
  ROAD = 'road'
}

/**
 * Enumeration of objects that can occupy grid cells
 */
export enum GridObjectType {
  /** Empty cell with no objects */
  NONE = 'none',
  /** Log platform for crossing water */
  LOG = 'log',
  /** Leaf platform for crossing water */
  LEAF = 'leaf', 
  /** Poison obstacle (deadly) */
  POISON = 'poison',
  /** Spray obstacle (deadly) */
  SPRAY = 'spray',
  /** Nail obstacle (deadly) */
  NAIL = 'nail',
  /** Cherry collectible (10 points) */
  CHERRY = 'cherry',
  /** Cookie collectible (20 points) */
  COOKIE = 'cookie',
  /** Ant hill goal object */
  ANT_HILL = 'ant_hill'
}

/**
 * Interface representing a single cell in the game grid
 */
export interface GridCell {
  /** The terrain type of this cell */
  type: CellType;
  /** The object occupying this cell (if any) */
  object: GridObjectType;
  /** Whether the player can safely occupy this cell */
  safe: boolean;
}

/**
 * Grid system class that manages the game's grid-based collision and positioning system.
 * 
 * This class provides:
 * - Grid initialization from level definitions
 * - Coordinate conversion between world and grid positions
 * - Cell state management and safety calculations
 * - Collectible placement algorithms
 * 
 * The grid system forms the foundation for collision detection, object placement,
 * and game logic in the Frogger-style gameplay.
 */
export class GridSystem {
  /** 2D array representing the game grid */
  private gameGrid: GridCell[][] = [];
  /** Width of the grid in cells */
  private gridWidth: number = 0;
  /** Height of the grid in cells */
  private gridHeight: number = 0;

  /**
   * Creates a new GridSystem instance and initializes the grid from level data
   */
  constructor() {
    this.initializeGrid();
  }

  /**
   * Gets the width of the grid in cells
   * @returns The grid width
   */
  public getGridWidth(): number {
    return this.gridWidth;
  }

  /**
   * Gets the height of the grid in cells
   * @returns The grid height
   */
  public getGridHeight(): number {
    return this.gridHeight;
  }

  /**
   * Gets the cell information at the specified grid coordinates
   * @param row - The row index (0-based)
   * @param col - The column index (0-based)
   * @returns The cell information, or null if coordinates are out of bounds
   */
  public getCell(row: number, col: number): GridCell | null {
    if (row >= 0 && row < this.gridHeight && col >= 0 && col < this.gridWidth) {
      return this.gameGrid[row][col];
    }
    return null;
  }

  /**
   * Updates the object type in the specified cell and recalculates safety
   * @param row - The row index (0-based)
   * @param col - The column index (0-based)
   * @param objectType - The new object type to place in the cell
   */
  public setCell(row: number, col: number, objectType: GridObjectType): void {
    if (row >= 0 && row < this.gridHeight && col >= 0 && col < this.gridWidth) {
      this.gameGrid[row][col].object = objectType;
      this.gameGrid[row][col].safe = this.isCellSafe(this.gameGrid[row][col].type, objectType);
    }
  }

  /**
   * Converts world coordinates to grid coordinates
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @returns Object containing row and column indices
   */
  public getPlayerGridPosition(x: number, y: number): { row: number, col: number } {
    return {
      row: Math.floor(y / GRID_SIZE),
      col: Math.floor(x / GRID_SIZE)
    };
  }

  /**
   * Converts grid coordinates to world coordinates (center of cell)
   * @param row - The row index
   * @param col - The column index
   * @returns Object containing world X and Y coordinates
   */
  public getWorldPosition(row: number, col: number): { x: number, y: number } {
    return {
      x: col * GRID_SIZE + GRID_SIZE / 2,
      y: row * GRID_SIZE + GRID_SIZE / 2
    };
  }

  /**
   * Clears all objects of specified types from a row
   * @param row - The row to clear
   * @param objectTypes - Array of object types to remove
   */
  public clearObjectsInRow(row: number, objectTypes: GridObjectType[]): void {
    for (let col = 0; col < this.gridWidth; col++) {
      const cell = this.gameGrid[row][col];
      if (objectTypes.includes(cell.object)) {
        this.setCell(row, col, GridObjectType.NONE);
      }
    }
  }

  /**
   * Randomly places collectible items in appropriate areas of the grid.
   * Places cherries in bottom grass area and cookies in top grass area.
   */
  public placeRandomCollectibles(): void {
    // Place cherries in bottom grass area
    for (let i = 0; i < CHERRY_COUNT; i++) {
      const col = Math.floor(Math.random() * this.gridWidth);
      const row = Math.floor(Math.random() * BOTTOM_GRASS_ROWS) + (this.gridHeight - BOTTOM_GRASS_ROWS);
      if (this.gameGrid[row][col].object === GridObjectType.NONE) {
        this.setCell(row, col, GridObjectType.CHERRY);
      }
    }
    
    // Place cookies in top grass area
    for (let i = 0; i < COOKIE_COUNT; i++) {
      const col = Math.floor(Math.random() * this.gridWidth);
      const row = Math.floor(Math.random() * TOP_GRASS_ROWS);
      if (this.gameGrid[row][col].object === GridObjectType.NONE) { // Don't overwrite ant hill
        this.setCell(row, col, GridObjectType.COOKIE);
      }
    }
  }

  /**
   * Finds all cells containing objects of the specified type
   * @param objectType - The object type to search for
   * @returns Array of objects containing row and column coordinates
   */
  public getAllCellsOfType(objectType: GridObjectType): Array<{ row: number, col: number }> {
    const cells: Array<{ row: number, col: number }> = [];
    
    for (let row = 0; row < this.gridHeight; row++) {
      for (let col = 0; col < this.gridWidth; col++) {
        if (this.gameGrid[row][col].object === objectType) {
          cells.push({ row, col });
        }
      }
    }
    
    return cells;
  }

  /**
   * Initializes the game grid from the level definition.
   * Parses the level character array and creates the 2D grid structure.
   * @private
   */
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

  /**
   * Parses a single character from the level definition into cell type and object type
   * @param char - The character from the level definition
   * @returns Object containing the parsed cell type and object type
   * @private
   */
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

  /**
   * Determines if a cell is safe for the player based on terrain type and object
   * @param cellType - The terrain type of the cell
   * @param objectType - The object type in the cell
   * @returns True if the cell is safe for the player
   * @private
   */
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
}
