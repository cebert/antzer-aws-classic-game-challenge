# Antzer

## Overview 
Antzer is a retro arcade game inspired by Frogger, created for the [July 2025 AWS Build Games Challenge](https://community.aws/content/2y6egGcPAGQs8EwtQUM9KAONojz/build-games-challenge-build-classics-with-amazon-q-developer-cli?lang=en). In this game, you control an ant trying to reach its ant hill while avoiding obstacles and collecting treats for points. This gameplay idea was suggested by my eight-year-old son, Ryan, who thought it would be a fun and interesting submission for the challenge. I couldn't agree more! [Play Antzer here!](https://cebert.github.io/antzer-aws-classic-game-challenge/).

Antzer is an HTML5-based game with minimal dependencies. You can play this game on a desktop, mobile device, or tablet. However, currently the desktop experience is best (this game could use a few mobile improvements).

## Implementation 
This game was created almost entirely "vibe coded" using AI, using the Amazon Q Developer CLI as an expirment. Antzer is a fun, non-serious project. Q was used to generate code, design elements, and even suggest gameplay mechanics. While **this project does not represent my best work** or what I would consider production code, it was a fun opportunity to gain more exposure to the Amazon Q Developer CLI. Most of my professional work is with Claude Code or GitHub Copilot. I was excited to give Q a try for this challenge.

Amazon Q Developer CLI did a reasonable job of building this game. I only needed to make a few minor code tweaks and perform some cleanup tasks to have a basic, working game. I don't see this game becoming a top hit, but it was a fun project and a great way to spend some time discussing software and AI with my son.

As of July 2025, Q's multimodal support was unable to generate images or sound files. To work around this, I used ChatGPT to create the game images. I would write instructions for an image that was needed, and copied the generated image into the repository. Similarly, for sound files, I download royalty-free sound files from [FreeSound.org](https://freesound.org) and converted them to .mp3 files.

### Initial Prompt

When generating code using agentic software, its crucial to invest considerable upfront time on creating a detailed initial prompt. [InitialPrompt](docs/InitialPrompt.md) is a link to the initial prompt I used to create this game. 

If I could start over, this prompt could have been improved by stating my preferred file structure, TypeScript file naming conventions, graphical details, and success criteria more explicitly. My initial prompt worked reasonably well, but I had to work through these details with the LLM. I think being more explicit up front could have saved time. It also took some time to sort out the grid-based gameplay mechanics; possibly spending more time defining them in my initial prompt would have been helpful.

### Amazon Q Developer CLI

As part of this project, I learned that Q's CLI has undergone significant improvements. If you haven't tried Q recently, it may be worth reevaluating it and giving it a second try. Amazon Q is a brand offering a range of products and experiences. The Amazon Q Developer CLI is related to, but different from, the Amazon Q Developer extension. Similarly, Amazon Q in the AWS Console is not the same as the CLI. If you have tried any other Q variants, the CLI is a different product.

Amazon provides instructions for installing the Amazon Q Developer CLI ([Product Page](https://aws.amazon.com/q/developer/build/) | [Installation](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-installing.html?b=cli&p=overview&s=tiles) | [Guide](https://github.com/094459/aqd-cli-workshop/blob/main/workshop/01a-setup.md)). The CLI experience is more comparable to using Claude Code than the experience I had with the Q extension about a year ago, in 2024, which I didn't like at the time.

Installing Q CLI is straightforward, and Amazon has instructions on how to install it on all major OS platforms. If you're on a Mac, using the [brew](https://brew.sh/) command `brew install amazon-q` as documented in the [Getting Started with Amazon Q CLI](https://github.com/094459/aqd-cli-workshop/blob/main/workshop/01a-setup.md) guide is an easy way to get started. After installing `amazon-q`, I had to open the Amazon Q app on my Mac once and allow shell access and accessibility integrations.

The Q Developer CLI allows you to select which model you would like to use during an agent chat session. For this project, I exclusively used the Claude Sonnet 4 model exclusively.

## Play the Game

🎮 **[Play Antzer Online](https://cebert.github.io/antzer-aws-classic-game-challenge/)**

The game is deployed and ready to play! Use arrow keys to move your ant and try to reach the ant hill while avoiding obstacles and collecting treats.

## Game Concept

-  **Objective**: The primary objective of Anzter is the ant to reach the ant hill at the top of the screen while avoiding death from harmful objects such as nails, bug spray, poison, and water. If you manage to survive, you can compare your completion time with others for bragging rights.
-  **Perspective**: Direct top-down view (bird's eye view) of a flat playing field
-  **Gameplay**: Classic Frogger-style grid-based movement and collision detection
-  **Scoring**: Collect cherries (10 points) and cookies (20 points) for bonus points
-  **Challenge**: Navigate through hazardous terrain using timing and strategy
  
Players use up/down/left/right arrow keys to move their ant through the game in a style similar to Frogger.

## Game Layout

The game uses two systems: a level definition grid for static elements and dynamic spawning for moving objects. This game currently only has a single level. However, levels are loaded from configuration. It should be easy to add additional levels to this game in the future. Here's an example a simple level definition:  

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

### Visual Style

-  **Perspective**: Direct top-down view where players look straight down at the game world, as if looking at a flat surface from above
-  **Characters**: All characters and objects are viewed from above - the ant is brown/reddish with visible antennae and six legs
-  **Movement**: The ant moves from the bottom of the screen toward the ant hill at the top
-  **Art Assets**: All game images were generated using ChatGPT to create consistent visual elements including sprite sheets, backgrounds, and UI components
  
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

The compiled files will be in the `dist` directory. This game can be hosted statically on any CDN or on GitHub Pages.

## Game Status

The game is fully playable with all core mechanics implemented:
- ✅ Grid-based movement and collision detection
- ✅ Water sections with continuously spawning platforms (logs and leaves)
- ✅ Obstacles (poison, spray, nails)
- ✅ Collectible items with enhanced visual feedback
- ✅ Audio system with music and sound effects
- ✅ Win/lose conditions and score tracking
- ✅ Menu system with controls display

## TODO

- [ ] Improve graphic quality
- [ ] Improve mobile device experience (currently playable, but the experience could be better)
- [ ] Add frogs that extend their tongue and attempt to eat the ant
- [ ] Add spiders that move across the screen, which the ant must dodge to avoid
- [ ] Add additional levels with different layouts
- [ ] Add a leaderboard (potentially using [Momento](https://https://www.gomomento.com) or other service for storing top scores)

## Credits

- [Frogger](https://en.wikipedia.org/wiki/Frogger), which is one of the best classic arcade games ever created
- Created for the [AWS Build Games Challenge](https://community.aws/content/2y6egGcPAGQs8EwtQUM9KAONojz/build-games-challenge-build-classics-with-amazon-q-developer-cli?lang=en)
- Ryan Ebert for game suggestion and gameplay ideas
- Developed with assistance from [Amazon Q Developer CLI](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line.html)
- All visual assets (sprites, backgrounds, UI elements) generated using ChatGPT because as of 7/2025 Q CLI does not support this
- [Phaser 3](https://phaser.io/) and [TypeScript](https://www.typescriptlang.org/)
- [FreeSound.org](https://freesound.org) for all sound files
- [ChatGPT](https://chatgpt.com/) for generated images 

## License
MIT
