# Level Creation Guide

## Overview

This guide explains how to create new levels for MikeStudio using the modular level system. The architecture is designed to make adding new levels easy and intuitive.

## Architecture Overview

The system consists of:
- **BaseLevel**: Abstract class all levels inherit from
- **BlockRegistry**: Centralized block definitions
- **ToolboxBuilder**: Dynamic toolbox generation
- **LevelLoader**: Dynamic level loading system
- **Individual Level Files**: Each level in its own file

## Creating a New Level

### Step 1: Create Level File

Create a new file in `js/levels/` (e.g., `Level9.js`):

```javascript
import { BaseLevel } from '../core/BaseLevel.js';

export class Level9 extends BaseLevel {
  constructor() {
    super('9'); // Level ID
    this.init();
  }
  
  init() {
    // Level metadata
    this.title = "Level 9: My Custom Level";
    this.instructions = "Detailed instructions for the player...";
    
    // Map configuration
    this.mapFile = "lvl9.json"; // Your Tiled map file
    this.playerStart = { x: 1, y: 6, direction: 0 };
    
    // Items to spawn
    this.itemSpawns = [
      { spriteKey: 'boxes', x: 2, y: 5, frame: 0, scale: 1.5 }
    ];
    
    // Goal conveyors
    this.goalConveyors = [{ x: 7, y: 0 }];
    
    // Allowed blocks
    this.allowedBlocks = [
      'custom_start',
      'move_forward',
      'rotate_left',
      'rotate_right',
      'pick_object',
      'release_object'
    ];
  }
}
```

### Step 2: Register Level in LevelLoader

Add to `js/core/LevelLoader.js`:

```javascript
const levelModules = {
  // ... existing levels
  '9': () => import('./levels/Level9.js')
};
```

### Step 3: Test Your Level

Load your level by calling:
```javascript
await levelLoader.loadLevel('9');
```

## Level Configuration Options

### Basic Properties

```javascript
this.title = "Level Title";           // Shown in UI
this.instructions = "Instructions";    // Shown to player
this.mapFile = "map.json";            // Tiled map file
this.playerStart = { x: 1, y: 6, direction: 0 };
```

### Item Spawns

```javascript
this.itemSpawns = [
  {
    spriteKey: 'boxes',  // Sprite sheet key
    x: 2,                // Grid X position
    y: 5,                // Grid Y position
    frame: 0,            // Sprite frame
    scale: 1.5,          // Sprite scale
    itemType: 'box'      // Optional: for inspection
  }
];
```

### Victory Conditions

**Position-based (for tutorials):**
```javascript
this.goalPosition = { x: 4, y: 6 };
```

**Conveyor-based (for main levels):**
```javascript
this.goalConveyors = [
  { x: 7, y: 0 },           // Simple conveyor
  { x: 1, y: 2, itemType: 'box' }  // Type-specific
];
```

**Custom victory logic:**
```javascript
this.victoryConditions = {
  type: 'custom',
  customCheck: (scene, position) => {
    // Your custom logic
    return scene.checkCustomCondition();
  }
};
```

### Allowed Blocks

Choose from available blocks:

**Movement:**
- `move_forward`
- `rotate_left`
- `rotate_right`

**Items:**
- `pick_object`
- `release_object`

**Control Flow:**
- `controls_repeat`
- `controls_if`

**Inspection (Advanced):**
- `inspect_object`
- `check_object_type`

**Always include:**
- `custom_start` (required for all levels)

Example:
```javascript
this.allowedBlocks = [
  'custom_start',
  'move_forward',
  'rotate_left',
  'rotate_right',
  'controls_repeat'
];
```

## Advanced Features

### Inspection Blocks

Enable item inspection in your level:

```javascript
this.hasInspection = true;
this.allowedBlocks = [
  'custom_start',
  'move_forward',
  'pick_object',
  'release_object',
  'inspect_object',      // Inspect nearby objects
  'check_object_type'    // Check object type
];
```

### Branching Logic

Enable conditional logic:

```javascript
this.hasBranching = true;
this.allowedBlocks = [
  'custom_start',
  'move_forward',
  'controls_if',         // If/else blocks
  'check_object_type'    // Conditions
];
```

### Custom Blocks

Add level-specific blocks:

```javascript
this.customBlocks = [
  {
    type: 'scan_area',
    message: 'scan area',
    colour: 230,
    tooltip: 'Scan the surrounding area'
  }
];
```

Implement generators:
```javascript
getCustomBlockGenerators() {
  return {
    'scan_area': function(block) {
      return 'scanArea();\n';
    }
  };
}
```

### Lifecycle Hooks

Override lifecycle methods:

```javascript
onComplete(scene) {
  console.log('Level completed!');
  // Custom completion logic
}

onReset(scene) {
  console.log('Level reset!');
  // Custom reset logic
}
```

## Example: Advanced Level with Inspection

```javascript
import { BaseLevel } from '../core/BaseLevel.js';

export class Level10 extends BaseLevel {
  constructor() {
    super('10');
    this.init();
  }
  
  init() {
    this.title = "Level 10: Sort the Items";
    this.instructions = "Inspect each item and sort them correctly!";
    
    this.mapFile = "lvl10_sorting.json";
    this.playerStart = { x: 4, y: 4, direction: 0 };
    
    // Multiple item types
    this.itemSpawns = [
      { spriteKey: 'boxes', x: 3, y: 6, frame: 0, scale: 1.5, itemType: 'box' },
      { spriteKey: 'crates', x: 4, y: 6, frame: 0, scale: 1.5, itemType: 'crate' },
      { spriteKey: 'boxes', x: 5, y: 6, frame: 0, scale: 1.5, itemType: 'box' }
    ];
    
    // Type-specific conveyors
    this.goalConveyors = [
      { x: 1, y: 2, itemType: 'box' },
      { x: 7, y: 2, itemType: 'crate' }
    ];
    
    // Enable advanced features
    this.hasInspection = true;
    this.hasBranching = true;
    
    this.allowedBlocks = [
      'custom_start',
      'move_forward',
      'rotate_left',
      'rotate_right',
      'pick_object',
      'release_object',
      'controls_repeat',
      'controls_if',
      'inspect_object',
      'check_object_type'
    ];
  }
  
  onComplete(scene) {
    console.log('All items sorted correctly!');
  }
}
```

## Block Categories

Blocks are organized by category in `BlockRegistry`:

- **movement**: move_forward, rotate_left, rotate_right
- **items**: pick_object, release_object
- **control**: controls_repeat, controls_if
- **inspection**: inspect_object, check_object_type
- **logic**: check_object_type, custom conditions

## Testing Your Level

1. Create your level file in `js/levels/`
2. Register it in `LevelLoader.js`
3. Load the level: `levelManager.goToLevel('9')`
4. Test victory conditions
5. Verify block availability
6. Check UI updates

## Tips

- Start with a simple level and add complexity gradually
- Test victory conditions thoroughly
- Use `console.log` in lifecycle hooks for debugging
- Keep instructions clear and concise
- Provide helpful hints for difficult levels
- Consider the learning curve (tutorials → simple → complex)

## Common Patterns

### Tutorial Level
```javascript
this.allowedBlocks = ['custom_start', 'move_forward'];
this.goalPosition = { x: 4, y: 6 };
```

### Simple Challenge
```javascript
this.allowedBlocks = ['custom_start', 'move_forward', 'rotate_left', 'rotate_right', 'pick_object', 'release_object'];
this.goalConveyors = [{ x: 7, y: 0 }];
```

### Advanced Challenge
```javascript
this.hasInspection = true;
this.hasBranching = true;
this.allowedBlocks = [/* full set */];
this.goalConveyors = [
  { x: 1, y: 2, itemType: 'box' },
  { x: 7, y: 2, itemType: 'crate' }
];
```

## Next Steps

- Create your map in Tiled
- Design the challenge
- Implement the level class
- Test and refine
- Add hints for players
- Consider adding custom blocks for unique mechanics
