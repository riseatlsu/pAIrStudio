# Blockly Blocks Configuration Guide

## Overview
Each level can specify which Blockly blocks are available to students. This allows for progressive difficulty and teaching concepts incrementally.

## Configuration Format

Add an `allowedBlocks` property to your level configuration:

```javascript
{
    id: "level_001",
    title: "First Steps",
    // ... other level properties ...
    
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise'],  // Array of specific blocks
        sensing: false,      // false = category disabled
        logic: true,         // true = all blocks in category
        math: ['math_number'],  // Only specific blocks
        text: false,
        loops: false
    }
}
```

## Configuration Options

Each category can be configured in three ways:

1. **`true`** - All blocks in the category are available
2. **`false`** - No blocks from this category are available (category hidden)
3. **Array of block types** - Only specified blocks are available

## Available Block Types

### Actions Category
- `move_forward` - Move robot one tile forward
- `turn_clockwise` - Turn robot 45° clockwise
- `turn_counter_clockwise` - Turn robot 45° counter-clockwise
- `pick_object` - Pick up object in front of robot
- `drop_object` - Drop carried object

### Sensing Category
- `survey_front` - Get type of object in front
- `check_attribute` - Check boolean attribute of surveyed object

### Logic Category
- `controls_if` - If statement (simple)
- `controls_if` (with else) - If/else statement
- `logic_compare` - Comparison operators (=, ≠, <, >, ≤, ≥)
- `logic_operation` - Boolean operators (AND, OR)
- `logic_boolean` - Boolean values (true/false)
- `logic_negate` - NOT operator

### Math Category
- `math_number` - Number constant
- `math_arithmetic` - Arithmetic operators (+, -, ×, ÷)

### Text Category
- `text` - Text string

### Loops Category
- `controls_repeat_ext` - Repeat N times
- `controls_whileUntil` - While/until loops

## Example Configurations

### Level 1 - Sequential Programming (No Loops, No Logic)
```javascript
allowedBlocks: {
    actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
    sensing: false,
    logic: false,
    math: false,
    text: false,
    loops: false
}
```

### Level 2 - Introduce Loops
```javascript
allowedBlocks: {
    actions: true,  // All action blocks
    sensing: false,
    logic: false,
    math: ['math_number'],  // Only numbers (for loop count)
    text: false,
    loops: ['controls_repeat_ext']  // Only repeat, not while/until
}
```

### Level 3 - Add Sensing and Basic Logic
```javascript
allowedBlocks: {
    actions: true,
    sensing: ['survey_front'],  // Only survey, not check_attribute yet
    logic: ['controls_if', 'logic_compare', 'logic_boolean'],  // If + comparisons
    math: ['math_number'],
    text: false,
    loops: ['controls_repeat_ext']
}
```

### Level 4 - Advanced Logic
```javascript
allowedBlocks: {
    actions: true,
    sensing: true,  // All sensing blocks
    logic: true,    // All logic blocks
    math: true,     // All math blocks
    text: false,
    loops: true     // All loop types including while/until
}
```

### All Blocks Available (Default)
```javascript
// Option 1: Don't include allowedBlocks property at all
// Option 2: Set all to true
allowedBlocks: {
    actions: true,
    sensing: true,
    logic: true,
    math: true,
    text: true,
    loops: true
}
```

## How It Works

1. **Level Definition**: Add `allowedBlocks` to your level config in `src/game/levels/data/level_XXX.js`
2. **Auto-Update**: When a level loads, `LevelManager` calls `BlocklyManager.updateToolboxForLevel(config)`
3. **Toolbox Filtering**: BlocklyManager filters the toolbox categories and blocks based on the config
4. **Student View**: Students only see the blocks you've enabled for that level

## Adding New Levels

When creating a new level file:

1. Copy an existing level as a template
2. Update the level properties (id, title, description, map, objects, etc.)
3. Add an `allowedBlocks` configuration appropriate for the level's difficulty
4. Register the level in `src/game/levels/index.js`
5. Add the level ID to `LevelManager.allLevelIds` array

## Best Practices

- **Progressive Difficulty**: Introduce one new concept per level
- **Start Simple**: Level 1 should only have basic movement blocks
- **Gradual Introduction**: Add sensing before logic, logic before complex loops
- **Teaching Order**:
  1. Sequential commands (move, turn, pick, drop)
  2. Loops (repeat N times)
  3. Sensing (survey environment)
  4. Conditional logic (if statements)
  5. Advanced loops (while/until)
  6. Complex combinations

## Validation

The system validates that:
- Block types in arrays are valid
- Categories use proper format (true/false/array)
- At least some blocks are available (warns if all categories disabled)

If a level has invalid `allowedBlocks` config or omits it entirely, all blocks will be available by default.
