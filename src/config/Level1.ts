/**
 * @fileoverview Level 1 configuration for the Antzer game
 * Contains the level layout, character mappings, and validation functions
 * Uses a grid-based system where each character represents one game cell
 */

/**
 * Level 1 grid definition using character-based mapping
 * Each character represents one grid cell in the game world
 * 
 * **Character Legend:**
 * - `G` = Safe grass terrain
 * - `A` = Ant starting position (placed on grass)
 * - `H` = Ant hill goal (player must reach this)
 * - `C` = Cherry collectible (10 points, on grass)
 * - `K` = Cookie collectible (20 points, on grass)
 * - `R` = Road terrain (safe unless obstacle present)
 * - `P` = Poison obstacle (deadly, appears on road)
 * - `Y` = Spray obstacle (deadly, appears on road)
 * - `N` = Nail obstacle (deadly, appears on road)
 * - `W` = Water terrain (deadly unless player is on platform)
 * - `L` = Log platform (safe to ride on water) - *Note: Currently unused, platforms spawn dynamically*
 * - `F` = Leaf platform (safe to ride on water) - *Note: Currently unused, platforms spawn dynamically*
 * 
 * **Level Layout:**
 * - Rows 0-1: Goal area with ant hill and collectibles
 * - Rows 2-4: Water sections with dynamically spawning platforms
 * - Row 5: Safe middle zone
 * - Rows 6-8: Road sections with moving obstacles
 * - Rows 9-11: Starting area with collectibles
 */
export const LEVEL_1 = [
  // Row 0 (top - goal area with ant hill and cookie)
  'GGGGGGHGGGKGGGGG',
  // Row 1 (safe grass with cherries)
  'GGCGGGGGCGGGCGGG',
  // Row 2 (water - logs spawn dynamically moving right)
  'WWWWWWWWWWWWWWWW',
  // Row 3 (water - leaves spawn dynamically moving left)
  'WWWWWWWWWWWWWWWW',
  // Row 4 (water - logs spawn dynamically moving right)
  'WWWWWWWWWWWWWWWW',
  // Row 5 (safe middle zone with strategic collectibles)
  'GCGGGGGGGGGGGGCG',
  // Row 6 (road with poison obstacles - moving right)
  'RPRRRRPRRRRRPRR',
  // Row 7 (road with spray obstacles - moving left)  
  'RRYRRRYRRRYRRYR',
  // Row 8 (road with nail obstacles - moving right)
  'RNRRRRRRNRRRRRN',
  // Row 9 (safe grass with cherries)
  'GGGCGGGGGGCGGGGG',
  // Row 10 (starting area with ant, cherry, and cookie)
  'GGGCGGAGGGGGGGKG',
  // Row 11 (starting area - safe grass with collectibles)
  'GCGGGGGGGGGGGGCG'
];

/**
 * Position information for special level elements
 */
interface LevelPositions {
  /** Ant starting position */
  antStart: { row: number; col: number };
  /** Ant hill goal position */
  antHill: { row: number; col: number };
}

/**
 * Find positions of special characters in the level grid
 * Scans the entire level to locate the ant starting position and ant hill
 * 
 * @returns Object containing the row and column positions of special elements
 */
export function findLevelPositions(): LevelPositions {
  const positions: LevelPositions = {
    antStart: { row: -1, col: -1 },
    antHill: { row: -1, col: -1 }
  };
  
  for (let row = 0; row < LEVEL_1.length; row++) {
    for (let col = 0; col < LEVEL_1[row].length; col++) {
      const char = LEVEL_1[row][col];
      if (char === 'A') {
        positions.antStart = { row, col };
      } else if (char === 'H') {
        positions.antHill = { row, col };
      }
    }
  }
  
  return positions;
}

/**
 * Level configuration object containing computed positions and dimensions
 * Automatically calculated from the level grid definition
 */
const levelPositions = findLevelPositions();

/**
 * Complete level 1 configuration with all necessary game data
 * Contains positions, dimensions, and metadata for level initialization
 */
export const LEVEL_1_CONFIG = {
  /** Row index of ant starting position (0-based from top) */
  antStartRow: levelPositions.antStart.row,
  /** Column index of ant starting position (0-based from left) */
  antStartCol: levelPositions.antStart.col,
  /** Row index of ant hill goal position (0-based from top) */
  antHillRow: levelPositions.antHill.row,
  /** Column index of ant hill goal position (0-based from left) */
  antHillCol: levelPositions.antHill.col,
  /** Level width in grid cells */
  width: LEVEL_1[0]?.length || 16,
  /** Level height in grid cells */
  height: LEVEL_1.length
};

/**
 * Validate the level configuration for consistency and required elements
 * Checks for missing required elements and dimension consistency
 * 
 * @returns Array of error messages, empty if validation passes
 */
export function validateLevel(): string[] {
  const errors: string[] = [];
  
  // Check that ant start position was found
  if (LEVEL_1_CONFIG.antStartRow === -1 || LEVEL_1_CONFIG.antStartCol === -1) {
    errors.push("Ant start position 'A' not found in level definition");
  }
  
  // Check that ant hill position was found
  if (LEVEL_1_CONFIG.antHillRow === -1 || LEVEL_1_CONFIG.antHillCol === -1) {
    errors.push("Ant hill position 'H' not found in level definition");
  }
  
  // Check level dimensions consistency
  for (let i = 0; i < LEVEL_1.length; i++) {
    if (LEVEL_1[i].length !== LEVEL_1_CONFIG.width) {
      errors.push(`Row ${i} has ${LEVEL_1[i].length} characters, expected ${LEVEL_1_CONFIG.width}`);
    }
  }
  
  return errors;
}