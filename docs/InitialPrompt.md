# Overview

Create a retro arcade game called "Antzer" inspired by Frogger for the [AWS Build Games Challenge](https://community.aws/content/2y6egGcPAGQs8EwtQUM9KAONojz/build-games-challenge-build-classics-with-amazon-q-developer-cli). The game features a muscular, athletic ant navigating obstacles to reach its ant hill while collecting treats for points.


## Technical Architecture Requirements

### Core Technology Stack

-  **Language**: TypeScript with strict mode enabled
-  **Game Engine**: Phaser.js 3.x for 2D game development
-  **Build System**: Webpack for bundling and development server
-  **Deployment**: Static hosting using GitHub Actions to publish static files to GitHub Pages. It is important to use the latest version of any GitHub Action.

Please use the latest LTS version of Node

### Design

- HTML5-based game that is playable on desktop, tablet, and mobile devices
- Use a grid-based system
- Support static grid-based level definitions
- Create separate configuration files for each level (level1.ts, level2.ts, etc.)
- Use TypeScript interfaces for type safety (GridCell, GameObject, LevelConfig)
- Implement a scene-based game flow: Boot → Loading → Menu → Game → GameOver
- Use Phaser's built-in physics system for collision detection
- Create reusable game object classes (Player, Obstacle, Collectible, Platform)

## Game Mechanics Specifications

### Core Gameplay

The goal is for the ant to reach the anthill at the top of the screen/level. The ant starts at the bottom of the screen and can move up/down/left/right using the arrow keys to move to the next adjacent square, like in the game Frogger. The ant gets points when it lands on a square with a collectible. The ant dies if it lands on a deadly square.

- Grid-based movement: player moves one cell at a time using arrow keys (up/down/left/right)
- Collision system: check grid position safety before allowing movement
- Water mechanics: deadly unless player is on a moving platform (log/leaf)
- Platform spawning: continuous spawning with configurable gaps and speeds
- Scoring system: time-based completion + collectible bonuses (cherries=10pts, cookies=20pts)
- Win condition: reach ant hill at top of screen
- Lose condition: collision with an obstacle or falling into water without a platform


### Level Design System

-  **Grid Layout**: This game is a grid of tiles (columns and rows)
-  **Terrain Types**: Grass (safe), Road (with obstacles), water (with platforms)
-  **Static Elements**: Defined in level configuration files
-  **Dynamic Elements**: Moving obstacles and platforms spawn continuously
-  **Collectibles**: Strategically placed for risk/reward gameplay

### Development Requirements

- Use TypeScript strict mode with comprehensive type checking
- Add JSDoc comments for all public methods and interfaces
- Implement proper error handling for asset loading and game states
- Use consistent naming conventions
- Create TypeScript interfaces for all data structures
- Follow SOLID principles for maintainable, extensible code
- Add validation for level configurations and user inputs
