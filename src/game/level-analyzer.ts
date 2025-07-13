/**
 * @fileoverview Level analysis system for dynamically determining row types and properties
 * Analyzes level configuration to identify water rows, road rows, and grass rows
 */

import { LEVEL_1, LEVEL_1_CONFIG } from '../config/level1';
import { CellType } from './grid-system';

/**
 * Interface representing analyzed information about a specific row
 */
export interface RowInfo {
  index: number;
  type: CellType;
  needsPlatforms: boolean;
  hasMovingObstacles: boolean;
  obstacleDirection: 'LEFT' | 'RIGHT';
  platformDirection: 'LEFT' | 'RIGHT';
}

/**
 * Interface representing the complete analysis of a level
 */
export interface LevelAnalysis {
  waterRows: RowInfo[];
  roadRows: RowInfo[];
  grassRows: RowInfo[];
  totalRows: number;
  totalCols: number;
}

/**
 * Level analyzer class that dynamically determines row types and properties from level configuration.
 * 
 * This class provides:
 * - Dynamic analysis of level terrain types
 * - Identification of water, road, and grass rows
 * - Automatic platform and obstacle direction assignment
 * - Support for variable level sizes and layouts
 * 
 * The analyzer eliminates hardcoded assumptions about specific row numbers,
 * making the system flexible for different level configurations.
 */
export class LevelAnalyzer {
  /** Cached analysis result to avoid recomputation */
  private analysis: LevelAnalysis | null = null;

  /**
   * Analyzes the current level configuration and returns detailed information about each row type
   * @returns Complete analysis of the level including row types and properties
   */
  public analyzeLevelLayout(): LevelAnalysis {
    if (this.analysis) {
      return this.analysis;
    }

    const waterRows: RowInfo[] = [];
    const roadRows: RowInfo[] = [];
    const grassRows: RowInfo[] = [];

    // Analyze each row to determine its primary terrain type
    for (let rowIndex = 0; rowIndex < LEVEL_1_CONFIG.height; rowIndex++) {
      const rowData = LEVEL_1[rowIndex];
      const rowInfo = this.analyzeRow(rowIndex, rowData);

      switch (rowInfo.type) {
        case CellType.WATER:
          waterRows.push(rowInfo);
          break;
        case CellType.ROAD:
          roadRows.push(rowInfo);
          break;
        case CellType.SAFE_GRASS:
          grassRows.push(rowInfo);
          break;
      }
    }

    this.analysis = {
      waterRows,
      roadRows,
      grassRows,
      totalRows: LEVEL_1_CONFIG.height,
      totalCols: LEVEL_1_CONFIG.width
    };

    return this.analysis;
  }

  /**
   * Gets all water rows that need platform generation
   * @returns Array of water row information
   */
  public getWaterRows(): RowInfo[] {
    return this.analyzeLevelLayout().waterRows;
  }

  /**
   * Gets all road rows that may contain obstacles
   * @returns Array of road row information
   */
  public getRoadRows(): RowInfo[] {
    return this.analyzeLevelLayout().roadRows;
  }

  /**
   * Gets all grass rows (safe areas)
   * @returns Array of grass row information
   */
  public getGrassRows(): RowInfo[] {
    return this.analyzeLevelLayout().grassRows;
  }

  /**
   * Checks if a specific row is a water row
   * @param rowIndex - The row index to check
   * @returns True if the row is primarily water terrain
   */
  public isWaterRow(rowIndex: number): boolean {
    return this.getWaterRows().some(row => row.index === rowIndex);
  }

  /**
   * Checks if a specific row is a road row
   * @param rowIndex - The row index to check
   * @returns True if the row is primarily road terrain
   */
  public isRoadRow(rowIndex: number): boolean {
    return this.getRoadRows().some(row => row.index === rowIndex);
  }

  /**
   * Gets the movement direction for obstacles in a specific row
   * @param rowIndex - The row index
   * @returns The direction obstacles should move in this row
   */
  public getObstacleDirection(rowIndex: number): 'LEFT' | 'RIGHT' {
    const roadRow = this.getRoadRows().find(row => row.index === rowIndex);
    return roadRow?.obstacleDirection || 'RIGHT';
  }

  /**
   * Gets the movement direction for platforms in a specific row
   * @param rowIndex - The row index
   * @returns The direction platforms should move in this row
   */
  public getPlatformDirection(rowIndex: number): 'LEFT' | 'RIGHT' {
    const waterRow = this.getWaterRows().find(row => row.index === rowIndex);
    return waterRow?.platformDirection || 'RIGHT';
  }

  /**
   * Analyzes a single row to determine its properties
   * @param rowIndex - The index of the row being analyzed
   * @param rowData - The character data for the row
   * @returns Information about the row's properties
   * @private
   */
  private analyzeRow(rowIndex: number, rowData: string): RowInfo {
    // Count terrain types in this row
    const terrainCounts = {
      water: 0,
      road: 0,
      grass: 0
    };

    for (const char of rowData) {
      switch (char) {
        case 'W': // Water
        case 'L': // Log (in water)
        case 'F': // Leaf (in water)
          terrainCounts.water++;
          break;
        case 'R': // Road
        case 'P': // Poison (on road)
        case 'Y': // Spray (on road)
        case 'N': // Nail (on road)
          terrainCounts.road++;
          break;
        case 'G': // Grass
        case 'A': // Ant start (on grass)
        case 'H': // Ant hill (on grass)
        case 'C': // Cherry (on grass)
        case 'K': // Cookie (on grass)
          terrainCounts.grass++;
          break;
      }
    }

    // Determine primary terrain type
    let primaryType = CellType.SAFE_GRASS;
    if (terrainCounts.water > terrainCounts.road && terrainCounts.water > terrainCounts.grass) {
      primaryType = CellType.WATER;
    } else if (terrainCounts.road > terrainCounts.grass) {
      primaryType = CellType.ROAD;
    }

    // Determine movement directions (alternating pattern)
    const obstacleDirection = rowIndex % 2 === 0 ? 'RIGHT' : 'LEFT';
    const platformDirection = rowIndex % 2 === 0 ? 'RIGHT' : 'LEFT';

    return {
      index: rowIndex,
      type: primaryType,
      needsPlatforms: primaryType === CellType.WATER,
      hasMovingObstacles: primaryType === CellType.ROAD,
      obstacleDirection,
      platformDirection
    };
  }
}
