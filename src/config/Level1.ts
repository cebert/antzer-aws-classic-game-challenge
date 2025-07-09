// Level 1 Definition
// Each character represents one grid cell
// 
// Legend:
// G = Safe grass
// A = Ant starting position (on grass)
// H = Ant hill (goal)
// C = Cherry (10 points, on grass)
// K = Cookie (20 points, on grass) 
// R = Road (safe unless obstacle)
// P = Poison (deadly, on road)
// Y = Spray (deadly, on road)
// N = Nail (deadly, on road)
// W = Water (deadly unless platform)
// L = Log (safe platform on water)
// F = Leaf (safe platform on water)

export const LEVEL_1 = [
  // Row 0 (top - goal area)
  'GGGGGGHGGGKGGGGG',
  // Row 1 (safe grass)
  'GGGGGGGGCGGGGGGG',
  // Row 2 (water with logs - moving right)
  'WWWWWWWWWWWWWWWW',
  // Row 3 (water with leaves - moving left)
  'WWWWWWWWWWWWWWWW',
  // Row 4 (water with logs - moving right)
  'WWWWWWWWWWWWWWWW',
  // Row 5 (safe middle zone)
  'GGGGGGGGGGGGGGGG',
  // Row 6 (road with obstacles - moving right)
  'RPRRRRPRRRRRPRR',
  // Row 7 (road with obstacles - moving left)  
  'RRYRRRYRRRYRRYR',
  // Row 8 (road with obstacles - moving right)
  'RNRRRRRRNRRRRRN',
  // Row 9 (safe grass)
  'GGGGGGGGGCGGGGGG',
  // Row 10 (starting area)
  'GGGCGGAGGGGGGGKG',
  // Row 11 (starting area)
  'GGGGGGGGGGGGGGGG'
];

// Function to find positions of special characters in the level
export function findLevelPositions() {
  const positions = {
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

// Level metadata - positions are automatically found from level definition
const levelPositions = findLevelPositions();

export const LEVEL_1_CONFIG = {
  antStartRow: levelPositions.antStart.row,
  antStartCol: levelPositions.antStart.col,
  antHillRow: levelPositions.antHill.row,
  antHillCol: levelPositions.antHill.col,
  width: LEVEL_1[0]?.length || 16,
  height: LEVEL_1.length
};

// Validation function to ensure level is correctly formed
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