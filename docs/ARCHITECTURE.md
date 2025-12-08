# MikeStudio Architecture Documentation

## Overview

MikeStudio is an educational programming platform built with Phaser 3, Blockly, and a modular level system. This document explains the architecture and how components interact.

## Directory Structure

```
MikeStudio/
├── js/
│   ├── core/                    # Core system files
│   │   ├── BaseLevel.js         # Abstract level class
│   │   ├── BlockRegistry.js     # Block definitions
│   │   ├── ToolboxBuilder.js    # Toolbox generation
│   │   └── LevelLoader.js       # Dynamic level loading
│   ├── levels/                  # Individual level files
│   │   ├── TutorialA.js         # Tutorial level A
│   │   ├── TutorialB.js         # Tutorial level B
│   │   ├── TutorialC.js         # Tutorial level C
│   │   ├── Level1.js            # Main level 1
│   │   ├── Level2.js            # Main level 2
│   │   └── ...                  # Levels 3-8, etc.
│   ├── level_manager.js         # Level progression management
│   ├── new_blockly_setup.js     # Blockly workspace setup
│   ├── isoMoveExample2.js       # Phaser game scene
│   ├── initial_setup.js         # Initial UI setup
│   ├── bootstrap_setup.js       # Bootstrap components
│   └── consent.js               # Cookie consent
├── assets/                      # Game assets
├── blockly/                     # Blockly library
├── phaser/                      # Phaser library
├── index.html                   # Main HTML file
├── LEVEL_CREATION_GUIDE.md      # Guide for creating levels
└── ARCHITECTURE.md              # This file
```

## Core Components

### 1. BaseLevel (js/core/BaseLevel.js)

**Purpose:** Abstract base class that all levels extend from.

**Key Features:**
- Defines common level properties (title, instructions, map, spawns)
- Provides lifecycle hooks (init, onComplete, onReset)
- Supports victory conditions (position, conveyor, custom)
- Enables advanced features (inspection, branching, variables, functions)

**Usage:**
```javascript
import { BaseLevel } from '../core/BaseLevel.js';

export class Level1 extends BaseLevel {
  constructor() {
    super('1');
    this.init();
  }
  
  init() {
    this.title = "Level 1";
    // ... configuration
  }
}
```

### 2. BlockRegistry (js/core/BlockRegistry.js)

**Purpose:** Centralized registry for all Blockly block definitions and code generators.

**Key Features:**
- Defines blocks by category (movement, items, control, inspection, logic)
- Provides code generators for JavaScript execution
- Helper functions to get blocks by category or ID
- Supports custom block registration

**Available Blocks:**
- **Movement:** move_forward, rotate_left, rotate_right
- **Items:** pick_object, release_object
- **Control:** controls_repeat, controls_if
- **Inspection:** inspect_object, check_object_type
- **Custom:** custom_start (required)

**Usage:**
```javascript
import { BlockRegistry } from './core/BlockRegistry.js';

// Get specific blocks
const blocks = BlockRegistry.getBlockDefinitions(['move_forward', 'rotate_left']);

// Get blocks by category
const movementBlocks = BlockRegistry.getBlocksByCategory('movement');
```

### 3. ToolboxBuilder (js/core/ToolboxBuilder.js)

**Purpose:** Dynamically builds Blockly toolboxes based on level requirements.

**Key Features:**
- Flyout toolbox for simple levels (< 6 blocks)
- Category toolbox for complex levels (≥ 6 blocks)
- Smart categorization by block type
- Tutorial-specific toolboxes

**Usage:**
```javascript
import { ToolboxBuilder } from './core/ToolboxBuilder.js';

const toolbox = ToolboxBuilder.buildDefaultToolbox(allowedBlocks);
```

### 4. LevelLoader (js/core/LevelLoader.js)

**Purpose:** Dynamically loads and caches level classes.

**Key Features:**
- Dynamic ES6 module imports
- Level instance caching
- Lazy loading (only loads when needed)
- Error handling for missing levels

**Usage:**
```javascript
import { levelLoader } from './core/LevelLoader.js';

await levelLoader.registerLevels();
const level = await levelLoader.loadLevel('1');
const config = level.getConfig();
```

### 5. LevelManager (js/level_manager.js)

**Purpose:** Manages level progression, state persistence, and UI updates.

**Key Features:**
- Progress tracking (current level, completed levels)
- LocalStorage persistence
- Level navigation (next, previous, go to specific)
- UI synchronization
- Integration with LevelLoader

**API:**
```javascript
// Get current level
const config = await LevelManager.getCurrentLevel();

// Navigate levels
LevelManager.nextLevel();
LevelManager.goToLevel('5');

// Mark completion
LevelManager.completeLevel('1');

// Update UI
await LevelManager.updateProgressUI();
```

## Data Flow

### Level Loading Sequence

1. **User Selects Level**
   ```
   UI Click → LevelManager.goToLevel('1')
   ```

2. **Level Manager Requests Level**
   ```
   LevelManager → LevelLoader.loadLevel('1')
   ```

3. **Level Loader Imports Module**
   ```
   LevelLoader → import('./levels/Level1.js')
   ```

4. **Level Class Instantiated**
   ```
   Level1.constructor() → super('1') → this.init()
   ```

5. **Configuration Returned**
   ```
   Level1.getConfig() → { title, instructions, mapFile, ... }
   ```

6. **Game Scene Loads Level**
   ```
   Phaser Scene → createMap(), spawnItems(), setVictoryConditions()
   ```

### Block Execution Flow

1. **User Builds Program**
   ```
   Blockly Workspace → Drag/Drop Blocks
   ```

2. **Code Generation**
   ```
   Blockly → JavaScript Generator → Generated Code
   ```

3. **Code Execution**
   ```
   eval(code) → Calls Phaser Scene Methods
   ```

4. **Victory Check**
   ```
   Scene.checkVictory() → BaseLevel.checkVictory()
   ```

5. **Level Completion**
   ```
   LevelManager.completeLevel() → Update Progress → Next Level
   ```

## Module System

The project uses **ES6 Modules** for modern JavaScript organization:

### Import/Export Pattern

```javascript
// Exporting
export class MyClass { ... }
export const myFunction = () => { ... };
export default MyClass;

// Importing
import { MyClass } from './MyClass.js';
import { myFunction } from './utils.js';
import DefaultClass from './DefaultClass.js';
```

### Module Loading in HTML

```html
<script type="module" src="js/level_manager.js"></script>
<script type="module" src="js/isoMoveExample2.js"></script>
```

**Note:** Scripts without `type="module"` are loaded as classic scripts and cannot use import/export.

## Integration Points

### Blockly → Phaser Integration

**new_blockly_setup.js** creates blocks that call Phaser scene methods:

```javascript
// Block generator
Blockly.JavaScript['move_forward'] = function(block) {
  var steps = block.getFieldValue('STEPS');
  return `moveForward(${steps});\n`;
};

// Phaser scene method
class IsoMoveExample2 extends Phaser.Scene {
  moveForward(steps) {
    // Move player in isometric grid
  }
}
```

### Level System → Game Scene

**isoMoveExample2.js** receives level config and sets up the game:

```javascript
async create() {
  // Get level config
  const config = await LevelManager.getCurrentLevel();
  
  // Create map
  this.createMap(config.mapFile);
  
  // Spawn player
  this.createPlayer(config.playerStart);
  
  // Spawn items
  config.itemSpawns.forEach(spawn => {
    this.spawnItem(spawn);
  });
  
  // Set victory conditions
  this.goalConveyors = config.goalConveyors;
}
```

### UI → Level Manager

**index.html** event handlers call LevelManager methods:

```javascript
// Level navigation
document.querySelector('.level-circle').addEventListener('click', function() {
  const level = this.dataset.level;
  LevelManager.goToLevel(level);
  await LevelManager.updateProgressUI();
});

// Run code button
document.getElementById('run-code').addEventListener('click', function() {
  const code = Blockly.JavaScript.workspaceToCode(workspace);
  eval(code);
});
```

## Advanced Features

### Inspection System

Levels can enable object inspection:

```javascript
this.hasInspection = true;
this.allowedBlocks = [..., 'inspect_object', 'check_object_type'];
```

Blocks:
- **inspect_object**: Returns object type at position
- **check_object_type**: Conditional check for type

### Branching Logic

Conditional execution based on inspection:

```javascript
this.hasBranching = true;
this.allowedBlocks = [..., 'controls_if', 'check_object_type'];
```

### Custom Victory Conditions

Complex victory logic beyond simple position/conveyor:

```javascript
this.victoryConditions = {
  type: 'custom',
  customCheck: (scene, position) => {
    return scene.allBoxesSorted() && scene.noItemsOnFloor();
  }
};
```

## Extending the System

### Adding New Block Types

1. **Define in BlockRegistry:**
```javascript
MY_NEW_BLOCK: {
  init: function() {
    this.appendDummyInput()
        .appendField("my new action");
    this.setColour(160);
  }
}
```

2. **Add Generator:**
```javascript
MY_NEW_BLOCK: function(block) {
  return 'myNewAction();\n';
}
```

3. **Implement in Scene:**
```javascript
myNewAction() {
  // Game logic
}
```

### Adding New Level Features

1. **Extend BaseLevel:**
```javascript
export class AdvancedLevel extends BaseLevel {
  init() {
    super.init();
    this.customFeature = true;
  }
  
  customMethod() {
    // Custom logic
  }
}
```

2. **Override Hooks:**
```javascript
onComplete(scene) {
  // Custom completion logic
}

onReset(scene) {
  // Custom reset logic
}
```

## Performance Considerations

- **Lazy Loading:** Levels loaded on-demand via dynamic imports
- **Caching:** Level instances cached after first load
- **Module Splitting:** Code split by feature (core, levels, UI)
- **Async Operations:** Level loading is asynchronous to avoid blocking

## Error Handling

### Level Loading Errors

```javascript
try {
  const level = await levelLoader.loadLevel('999');
} catch (error) {
  console.error('Level not found:', error);
  // Fallback to default level
}
```

### Victory Condition Errors

```javascript
checkVictory(scene, position) {
  try {
    return this.victoryConditions.customCheck(scene, position);
  } catch (error) {
    console.error('Victory check failed:', error);
    return false;
  }
}
```

## Best Practices

1. **Always extend BaseLevel** - Don't create levels from scratch
2. **Use BlockRegistry** - Don't define blocks inline
3. **Leverage ToolboxBuilder** - Don't manually create toolboxes
4. **Test victory conditions** - Ensure levels can be completed
5. **Provide clear instructions** - Help players understand goals
6. **Use lifecycle hooks** - Override onComplete, onReset when needed
7. **Cache when possible** - Reuse level instances
8. **Handle errors gracefully** - Don't let missing levels crash the app

## Testing

### Manual Testing Checklist

- [ ] Level loads correctly
- [ ] Map displays properly
- [ ] Items spawn at correct positions
- [ ] Player starts at correct position
- [ ] Blocks are available in toolbox
- [ ] Code executes correctly
- [ ] Victory condition works
- [ ] Level completion saves progress
- [ ] Next level unlocks
- [ ] UI updates correctly

### Debugging Tools

```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Inspect level config
const config = await LevelManager.getCurrentLevel();
console.log(config);

// Check loaded levels
console.log(levelLoader.getAvailableLevels());

// View progress
console.log(LevelManager.getProgress());
```

## Future Enhancements

Potential additions to the system:

- **Variables System:** Let players create/use variables
- **Functions System:** Custom procedures
- **Achievements:** Track player accomplishments
- **Hints System:** Progressive hints for stuck players
- **Replay System:** View solution replay
- **Level Editor:** In-app level creation tool
- **Multiplayer:** Collaborative coding
- **Analytics:** Track player behavior

## Troubleshooting

### Common Issues

**Problem:** Level not loading
- Check LevelLoader registration
- Verify file path in import
- Check browser console for errors

**Problem:** Blocks not showing
- Verify allowedBlocks array
- Check BlockRegistry definitions
- Ensure ToolboxBuilder is used

**Problem:** Victory condition not working
- Check goalPosition vs goalConveyors
- Verify checkVictory() logic
- Test position matching

**Problem:** Progress not saving
- Check localStorage permissions
- Verify completeLevel() is called
- Check browser privacy settings

## Resources

- [Blockly Documentation](https://developers.google.com/blockly)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [ES6 Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Level Creation Guide](./LEVEL_CREATION_GUIDE.md)

## Contact

For questions or contributions, please refer to the project repository.
