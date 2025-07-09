
# Antzer

Antzer is retro arcade game inspired by Frogger, created for the [AWS Build Games Challenge July 2025](https://community.aws/content/2y6egGcPAGQs8EwtQUM9KAONojz/build-games-challenge-build-classics-with-amazon-q-developer-cli?lang=en). In this game, you control an ant trying to reach an ant hill while avoiding obstacles and collecting treats for points. This gameplay idea was suggested by my eight-year-old son, Ryan. Ryan thought this would be a fun and interesting submission for the challenge, and I couldn't agree more.

This game was created almost entirely using AI, using the Amazon Q Developer CLI. Antzer is a fun, non-serious experimentation project. Q was used to generate code, design elements, and even suggest gameplay mechanics. While **this project does not represent my best work** or what I would consider production code, it was a fun opportunity to gain more exposure to the Amazon Q Developer CLI. Most of my professional work is with Claude Code or GitHub Copilot. I was excited to give Q a try for this challenge. Q did a reasonable job building this game. I only needed to make a few minor code tweaks and perform some cleanup tasks to have a basic, working game. I don't see this game becoming a top hit, but it was a fun project and a great way to spend some time discussing software and AI with my son.

### Amazon Q Developer CLI 

The Amazon Q Developer CLI is related to, but different from, the Amazon Q Developer extension. Amazon provides instructions for installing the Amazon Q Developer CLI ([Product Page](https://aws.amazon.com/q/developer/build/) | [Installation](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html?b=cli&p=overview&s=tiles) | [Guide](https://github.com/094459/aqd-cli-workshop/blob/main/workshop/01a-setup.md)). The CLI experience is more comparable to using Claude Code than the experience I had with the Q extension about a year ago, in 2024, which I didn't like at the time. As part of this project, I learned that Q's CLI has been significantly improved. If you haven't tried Q recently, it may be worth reevaluating it and giving it a second try.

Installing Q CLI is straightforward, and Amazon has instructions on how to install it on all major OS platforms. If you're on a Mac, using the [brew](https://brew.sh/) command `brew install amazon-q` as documented in the [Getting Started with Amazon Q CLI](https://github.com/094459/aqd-cli-workshop/blob/main/workshop/01a-setup.md) guide is an easy way to get started. After installing `amazon-q`, I had to open the Amazon Q app on my Mac once and allow shell access an accessability integrations.
  

## Game Concept

-  **Objective**: The primary objective of Anzter is the ant to reach the ant hill at the top of the screen while avoiding death from harmful objects such as nails, bug spary, poison, and water. If you manage to survive, you can compare your completion time with others for bragging rights. 
-  **Perspective**: Direct top-down view (bird's eye view) of a flat playing field
-  **Gameplay**: Classic Frogger-style grid-based movement and collision detection
-  **Scoring**: Collect cherries (10 points) and cookies (20 points) for bonus points
-  **Challenge**: Navigate through hazardous terrain using timing and strategy

Players use up/down/left/right arrow keys to move their ant through the game in a style similar to Frogger.

## Game Layout

The game uses two systems: a level definition grid for static elements and dynamic spawning for moving objects. Here's an example level definition:

```text
GGGGGGHHGGGGGGGG ← Row 0: Goal area with ant Hill
GGGGGCGGGGGGGGGG ← Row 1: Goal area with cherry
WWWWWWWWWWWWWWWW ← Row 2: Water (logs spawn dynamically moving right)
WWWWWWWWWWWWWWWW ← Row 3: Water (leaves spawn dynamically moving left)
WWWWWWWWWWWWWWWW ← Row 4: Water (logs spawn dynamically moving right)
GGGGGGGGGGGGGGGG ← Row 5: Safe middle zone
RPPRPPRPPRPPRPPR ← Row 6: Road with Poison
RRYRRYRRYRRYRRYR ← Row 7: Road with spray
RNNRNNRNNRNNRNNR ← Row 8: Road with Nail
GGGGGGGGGGGGGGGG ← Row 9: Safe area
GGCGGGAGGGGGKCGG ← Row 10: Starting area (A = ant start)
GGGGGGGGGGGGGGGG ← Row 11: Safe area
```

**Legend:**
-  `G` = Safe grass
-  `A` = Ant starting position
-  `H` = Ant hill (goal)
-  `C` = Cherry (10 points)
-  `R` = Safe road
-  `P` = Poison (deadly)
-  `Y` = Spray (deadly)
-  `N` = Nail (deadly)
-  `W` = Water (deadly unless on platform)

### Grid-Based Gameplay

-  **Grid Movement**: The ant moves on a discrete grid system for precise, predictable gameplay
-  **Cell Types**: Each grid cell is either safe (grass), conditionally safe (water with platform), or dangerous (water without platform, road with obstacle)
-  **Collision Detection**: Simple and reliable - if you're on an unsafe cell, you die
-  **Moving Objects**: Platforms and obstacles update their grid positions in real-time
-  **Consistent Patterns**: All obstacle and platform positions are currently static, though future gameplay could add moving spiders and frogs that attack the ant.

### Visual Style

-  **Perspective**: Direct top-down view where players look straight down at the game world
-  **Characters**: All characters and objects are viewed from above
-  **Movement**: The ant moves from the bottom of the screen toward the ant hill at the top
  
## Features

-  **Grid-Based Architecture**: Clean, extensible collision system that supports future level designs
-  **Classic Frogger Mechanics**: Avoid obstacles, ride logs across water
-  **Real-time Grid Updates**: Moving platforms and obstacles seamlessly integrate with grid system
-  **Keyboard Controls**: Arrow keys for gme movement (desktop only)
-  **Sound Effects and Music**: Audio feedback for actions and atmosphere with user interaction-based audio start
-  **Score System**: Collect cherries (10 points) and cookies (20 points) for bonus points while reaching the goal with in the lowest total time.

## Technical Architecture

### Grid System

The game uses a hybrid grid-based collision system:

-  **2D Grid Array**: Each cell contains type (grass/water/road) and object (none/obstacle/collectible)
-  **Static Elements**: Defined in level configuration (obstacles, collectibles, terrain)
-  **Dynamic Elements**: Logs and leaves spawn continuously using separate spawning system
-  **Real-time Updates**: Moving objects update their grid positions each frame
-  **Safety Calculation**: Each cell's safety is computed based on type + object combination
-  **Extensible Design**: Easy to add new cell types, objects, and level layouts

## Development

### Prerequisites
- Node.js (v22 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm  install
```

### Development Server

Run the development server:
```bash
npm  start
```

Then open your browser and navigate to `http://localhost:8081`.

### Building for Production

To create a production build:

```bash
npm  run  build
```

The built files will be in the `dist` directory. This game can be hosted statically on any CDN or on GitHub Pages.

## Game Status
 
The game is fully playable with all core mechanics implemented:

- ✅ Grid-based movement and collision detection
- ✅ Water sections with continuously spawning platforms (logs and leaves)
- ✅ Obstacles (poison, spray, nails)
- ✅ Collectible items with enhanced visual feedback
- ✅ Audio system with music and sound effects
- ✅ Win/lose conditions and score tracking
- ✅ Menu system with controls display
- ✅ Continuous platform spawning prevents gaps in water coverage

## TODO

- [ ] Add mobile touch controls for better mobile experience
- [ ] Fix spider obstacle implementation - currently disabled due to animation/sprite sheet issues
- [ ] Add additional levels with different layouts
- [ ] Add a leaderboard (potentially using [Momento](https://https://www.gomomento.com) or other service for storing top scores)
- [ ] Add more obstacle types (frogs are defined but not used, Ryan wanted flying spiders that you needed to avoid when playing the game)

## Credits
- [Frogger](https://en.wikipedia.org/wiki/Frogger), which is one of the best classic arcade games ever created
- Created for the [AWS Build Games Challenge](https://community.aws/content/2y6egGcPAGQs8EwtQUM9KAONojz/build-games-challenge-build-classics-with-amazon-q-developer-cli?lang=en)
- Ryan Ebert for game suggestion
- Developed with assistance from Amazon Q Developer CLI  
- Powered by [Phaser 3](https://phaser.io/) and [TypeScript](https://www.typescriptlang.org/)

## License

MIT

