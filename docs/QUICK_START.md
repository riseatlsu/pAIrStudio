# Quick Start Guide for Developers

## 🚀 Getting Started in 5 Minutes

This guide will help you quickly understand and start working with the MikeStudio codebase.

## 📁 What You Need to Know

### The System Has 3 Main Parts:

1. **Level System** (js/core/ & js/levels/)
   - Defines what challenges players face
   - Each level = one file

2. **Block System** (js/core/BlockRegistry.js)
   - Defines what programming blocks are available
   - Like Scratch/Code.org blocks

3. **Game Engine** (js/isoMoveExample2.js)
   - Phaser 3 game that renders the world
   - Executes player's code

## 🎯 Common Tasks

### Task 1: Add a New Level

**Time: 5 minutes**

1. Copy an existing level:
```bash
cp js/levels/Level1.js js/levels/Level9.js
```

2. Edit `js/levels/Level9.js`:
```javascript
export class Level9 extends BaseLevel {
  constructor() {
    super('9');  // Change this
    this.init();
  }
  
  init() {
    this.title = "Level 9: My New Challenge";
    this.instructions = "Do something awesome!";
    
    // Your level config here
    this.mapFile = "lvl1_v2.json";  // Reuse existing map or create new
    this.playerStart = { x: 1, y: 6, direction: 0 };
    
    this.itemSpawns = [
      { spriteKey: 'boxes', x: 2, y: 5, frame: 0, scale: 1.5 }
    ];
    
    this.goalConveyors = [{ x: 7, y: 0 }];
    
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

3. Register in `js/core/LevelLoader.js`:
```javascript
const levelModules = {
  // ... existing levels ...
  '9': () => import('./levels/Level9.js')  // Add this line
};
```

4. Done! Test by navigating to level 9 in the UI.

### Task 2: Change What Blocks a Level Has

**Time: 1 minute**

Edit the level file (e.g., `js/levels/Level1.js`):

```javascript
init() {
  // ... other config ...
  
  // Add or remove blocks from this array
  this.allowedBlocks = [
    'custom_start',      // Required
    'move_forward',      // Movement
    'rotate_left',       // Movement
    'rotate_right',      // Movement
    'pick_object',       // Items
    'release_object',    // Items
    'controls_repeat',   // Add loops! 🎉
    'controls_if'        // Add conditionals! 🎉
  ];
}
```

Available blocks:
- `move_forward`, `rotate_left`, `rotate_right` - Movement
- `pick_object`, `release_object` - Item manipulation
- `controls_repeat` - Loops
- `controls_if` - Conditionals
- `inspect_object`, `check_object_type` - Advanced inspection

### Task 3: Add a New Block Type

**Time: 10 minutes**

1. Define block in `js/core/BlockRegistry.js`:

```javascript
// In the BlockRegistry.blocks object, add:
JUMP: {
  init: function() {
    this.appendDummyInput()
        .appendField("jump");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Make the robot jump");
  }
},
```

2. Add generator in `BlockRegistry.generators`:

```javascript
JUMP: function(block) {
  return 'jump();\n';
},
```

3. Implement in game (js/isoMoveExample2.js):

```javascript
window.jump = () => {
  // Your jump logic here
  this.isoPlayer.playJumpAnimation();
};
```

4. Add to level's allowedBlocks:

```javascript
this.allowedBlocks = [..., 'jump'];
```

### Task 4: Change Level Instructions

**Time: 30 seconds**

Edit the level file:

```javascript
init() {
  this.title = "Level 1: New Title";
  this.instructions = "New instructions that explain what to do!";
  // ...
}
```

Changes appear immediately when level loads.

### Task 5: Create an Advanced Level (Inspection)

**Time: 5 minutes**

See `js/levels/Level5.js` for a complete example. Key parts:

```javascript
init() {
  // Enable inspection
  this.hasInspection = true;
  this.hasBranching = true;
  
  // Multiple item types
  this.itemSpawns = [
    { spriteKey: 'boxes', x: 3, y: 6, itemType: 'box' },
    { spriteKey: 'crates', x: 4, y: 6, itemType: 'crate' }
  ];
  
  // Type-specific goals
  this.goalConveyors = [
    { x: 1, y: 2, itemType: 'box' },
    { x: 7, y: 2, itemType: 'crate' }
  ];
  
  // Inspection blocks
  this.allowedBlocks = [
    'custom_start',
    'move_forward',
    'rotate_left',
    'rotate_right',
    'pick_object',
    'release_object',
    'controls_if',
    'inspect_object',      // Returns item type
    'check_object_type'    // Checks if item matches type
  ];
}
```

## 🧭 Where Is Everything?

### Core Files (Don't need to touch often)
- `js/core/BaseLevel.js` - Base class for levels
- `js/core/BlockRegistry.js` - All block definitions
- `js/core/ToolboxBuilder.js` - Builds block toolboxes
- `js/core/LevelLoader.js` - Loads levels dynamically

### Level Files (Edit these frequently)
- `js/levels/TutorialA.js` - Tutorial A
- `js/levels/Level1.js` - Main level 1
- `js/levels/Level5.js` - Advanced example
- etc.

### Main Application Files
- `js/level_manager.js` - Level progression/state
- `js/isoMoveExample2.js` - Phaser game scene
- `js/new_blockly_setup.js` - Blockly workspace setup
- `index.html` - Main HTML file

### Documentation
- `ARCHITECTURE.md` - Full architecture docs
- `LEVEL_CREATION_GUIDE.md` - Detailed level creation
- `ARCHITECTURE_DIAGRAM.md` - Visual diagrams
- `CODE_REORGANIZATION_SUMMARY.md` - What changed
- `QUICK_START.md` - This file

## 🔍 Understanding a Level File

Here's an annotated level file:

```javascript
import { BaseLevel } from '../core/BaseLevel.js';

// Export the class so LevelLoader can import it
export class Level1 extends BaseLevel {
  constructor() {
    super('1');  // Level ID (can be '1', '2', 'A', 'B', etc.)
    this.init(); // Initialize level config
  }
  
  init() {
    // === METADATA ===
    this.title = "Level 1: First Challenge";
    this.instructions = "Move the box to the conveyor!";
    
    // === MAP ===
    this.mapFile = "lvl1_v2.json";  // Tiled map file in assets/
    this.playerStart = { 
      x: 1,           // Grid X position
      y: 6,           // Grid Y position
      direction: 0    // 0=right, 1=down, 2=left, 3=up
    };
    
    // === ITEMS TO SPAWN ===
    this.itemSpawns = [
      {
        spriteKey: 'boxes',  // Which sprite sheet
        x: 0,                // Grid X
        y: 7,                // Grid Y
        frame: 0,            // Sprite frame
        scale: 1.5,          // Size
        itemType: 'box'      // Type (for inspection)
      }
    ];
    
    // === VICTORY CONDITION ===
    // Option 1: Conveyor-based (main levels)
    this.goalConveyors = [
      { x: 7, y: 0 }  // Item must be on this conveyor
    ];
    
    // Option 2: Position-based (tutorials)
    // this.goalPosition = { x: 4, y: 6 };
    
    // Option 3: Custom logic
    // this.victoryConditions = {
    //   type: 'custom',
    //   customCheck: (scene, position) => {
    //     return scene.myCustomCheck();
    //   }
    // };
    
    // === ALLOWED BLOCKS ===
    this.allowedBlocks = [
      'custom_start',      // Always required
      'move_forward',      
      'rotate_left',
      'rotate_right',
      'pick_object',
      'release_object'
    ];
    
    // === ADVANCED FEATURES ===
    // this.hasInspection = true;  // Enable inspection blocks
    // this.hasBranching = true;   // Enable if/else
    // this.hasVariables = true;   // Enable variables (future)
    // this.hasFunctions = true;   // Enable functions (future)
  }
  
  // === LIFECYCLE HOOKS ===
  // Called when level completes
  onComplete(scene) {
    console.log('Level 1 complete!');
  }
  
  // Called when level resets
  onReset(scene) {
    console.log('Level 1 reset');
  }
}
```

## 🐛 Common Issues

### "Level not loading"
- Check if level is registered in LevelLoader.js
- Verify file path matches
- Check browser console for errors

### "Blocks not showing in toolbox"
- Check `allowedBlocks` array in level
- Verify block names match BlockRegistry
- Try adding `custom_start` (required)

### "Victory condition not working"
- For tutorials: Use `goalPosition`
- For main levels: Use `goalConveyors`
- Check coordinates match map

### "Changes not showing"
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Check if file saved
- Clear browser cache

## 🎨 Block Colors

When creating blocks, use these standard colors:
- **160** (teal) - Movement
- **210** (blue) - Logic/Control
- **290** (purple) - Items
- **230** (orange) - Inspection
- **330** (red) - Custom/Special

## 📊 Data Flow Cheat Sheet

```
User clicks level
    ↓
LevelManager.goToLevel('1')
    ↓
LevelLoader.loadLevel('1')
    ↓
import('./levels/Level1.js')
    ↓
new Level1() → extends BaseLevel → this.init()
    ↓
level.getConfig() returns { title, map, spawns, etc. }
    ↓
Phaser scene loads map & spawns items
    ↓
ToolboxBuilder creates blocks from level.allowedBlocks
    ↓
User builds program in Blockly
    ↓
User clicks "Run Code"
    ↓
Blockly generates JavaScript
    ↓
eval() executes code (calls moveForward(), etc.)
    ↓
Scene checks level.checkVictory()
    ↓
If victory → level.onComplete() → next level
```

## ✅ Testing Checklist

Before committing changes:
- [ ] Level loads without errors
- [ ] Blocks appear in toolbox
- [ ] Code executes correctly
- [ ] Victory condition works
- [ ] Instructions are clear
- [ ] No console errors

## 🚀 Next Steps

1. **Read** `ARCHITECTURE.md` for deep dive
2. **Try** creating a simple level (copy Level1.js)
3. **Experiment** with different blocks
4. **Review** Level5.js for advanced features
5. **Ask** questions if stuck!

## 💡 Pro Tips

- **Use existing maps** - `lvl1_v2.json` and `lvl2.json` work for most levels
- **Start simple** - Add complexity gradually
- **Copy working levels** - Modify instead of creating from scratch
- **Test frequently** - Load level after each change
- **Console.log is your friend** - Debug with `console.log()` everywhere
- **Check examples** - Level5.js shows advanced features

## 🆘 Need Help?

1. Check console for errors (F12 in browser)
2. Read error messages carefully
3. Compare your code to working examples
4. Review documentation in this repository

## 🎓 Learning Path

**Beginner:**
1. Modify existing level instructions
2. Change allowed blocks
3. Create new level from template

**Intermediate:**
4. Add custom victory conditions
5. Create multi-step levels
6. Use lifecycle hooks

**Advanced:**
7. Add new block types
8. Implement inspection system
9. Create custom features

Happy coding! 🎉
