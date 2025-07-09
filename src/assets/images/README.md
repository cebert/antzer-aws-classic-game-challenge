# Image Assets

This directory contains placeholder files for the game’s visual elements. Before running the game, replace these with actual image assets.

## Game Perspective

The game uses a **direct top-down perspective**—as if the player is looking straight down at a flat surface. The ant is viewed from above, moving upward on the screen toward the ant hill.

---

## Required Files

Place all of the following files in the `/src/assets/images/` directory. Use **exact filenames** as listed:

### Core Assets (Alphabetical)

* `ant-hill.png`
  *The goal the ant must reach.*

* `ant-spritesheet.png`
  *1536×1024 pixel sprite sheet for the ant (8 frames total).*

* `background-tiles.png`
  *256×256 pixel tile set for the game’s background.*

* `button.png`
  *Button graphic used throughout the UI (250×60 pixels).*

  * Rectangular with rounded corners
  * Slight 3D or beveled appearance
  * Neutral color suitable for overlaying text
  * Supports labels like “START GAME”, “CONTROLS”, etc.

* `cherry.png`
  *Collectible item worth 10 points.*

* `controls.png`
  *300×200 image illustrating game controls.*

  * Includes arrow keys (↑ ← ↓ →)
  * Visual for mobile touch buttons
  * Jump action via up arrow or touch button
  * High-contrast graphics with simple labels
  * Text: “Desktop: Arrow Keys, Mobile: On-screen Buttons”

* `cookie.png`
  *Collectible item worth 20 points.*

* `frog-spritesheet.png`
  *512×64 pixel sprite sheet for frog enemies.*
  **Note:** Frogs are loaded but not actively used in gameplay. Future enhancement idea.

* `leaf.png`
  *Floating platform used in water areas.*

* `log.png`
  *Another floating platform for water sections.*

* `logo.png`
  *Game logo used on the menu screen (400×200 pixels).*

  * Title: “Antzer” (or your game name)
  * Include small ant illustration
  * Bold, readable typography
  * Animates up and down on the menu screen

* `nail.png`
  *Hazard that causes the ant to die.*

* `poison.png`
  *Another obstacle that kills the ant.*

* `spider-spritesheet.png`
  *Sprite sheet for spider enemies.*
  **Note:** Spiders are currently disabled due to animation/sprite sheet issues. Future enhancement.

* `spray.png`
  *Additional obstacle lethal to the ant.*

---

## Background Tileset

### `background-tiles.png` (256×256)

* **Tile Size**: 64×64 pixels
* **Grid Layout**: 4×4 (16 tiles total)

#### Tile Index Layout

```text
 0  1  2  3
 4  5  6  7
 8  9 10 11
12 13 14 15
```

#### Tile Descriptions

| Tile | Description                                      |
|------|--------------------------------------------------|
| 0    | Basic grass tile (green grass texture)          |
| 1    | Road/asphalt tile (dark gray/black road)        |
| 2    | Water tile (blue water with ripple effect)      |
| 3    | Decorative grass tile (grass with flowers)      |
| 4    | Road tile (dark gray road variant)              |
| 5    | Road tile (dark gray road variant)              |
| 6    | Grass tile (green grass variant)                |
| 7    | Grass tile (green grass variant)                |
| 8    | Grass tile (green grass variant)                |
| 9    | Water tile (blue water - USED FOR WATER AREAS)  |
| 10   | Road with lane marking (dark road with stripe)  |
| 11   | Grass tile (green grass variant)                |
| 12   | Grass tile (green grass variant)                |
| 13   | Water tile (blue water variant)                 |
| 14   | Road tile (dark gray road variant)              |
| 15   | Grass tile (green grass variant)                |

#### Usage Recommendations

* **Water areas**: Use Tile 9
* **Roads**: Use Tile 1
* **Grass**: Use Tile 0

---

## Spritesheets

### `ant-spritesheet.png` (1536×1024)

* **Frame Size**: 192×1024 pixels
* **Layout**: 8 horizontal frames (1 row)
* **Perspective**: Top-down (ant's head faces upward)

#### Frame Descriptions

| Frame Index | Action                       |
|-------------|------------------------------|
| 0           | Idle (antennae movement)     |
| 1           | Idle (leg twitching)         |
| 2           | Walk cycle - step 1          |
| 3           | Walk cycle - step 2          |
| 4           | Walk cycle - step 3          |
| 5           | Walk cycle - step 4          |
| 6           | Jump/special action - pose 1 |
| 7           | Jump/special action - pose 2 |

* Ant should be brown/reddish
* Clearly visible antennae and six legs
* No transparency—sprites must fill each 192×1024 frame
* Consistent size across all frames

---

### `frog-spritesheet.png` (512×64)

*Note: Loaded in game but not actively used in gameplay yet.*

* **Frame Size**: 64×64 pixels
* **Layout**: 8 frames (1 horizontal row)
* **Perspective**: Top-down view

#### Frog Frame Descriptions

| Frame Index | Action                   |
|-------------|--------------------------|
| 0           | Idle (breathing)         |
| 1           | Idle (breathing)         |
| 2           | Idle (breathing)         |
| 3           | Idle (breathing)         |
| 4           | Jump - compress          |
| 5           | Jump - extend            |
| 6           | Jump - mid-air           |
| 7           | Jump - landing           |

---

## Style Guidelines

* Use a consistent, complementary color palette
* All files must be **PNG** with transparency where appropriate
* Ensure objects are clearly visible from a **top-down** viewpoint
* Ant design: Brown/reddish with six visible legs and antennae
* Maintain uniform visual language across assets
