# Level Configuration Guide: Tutorial vs Experimental Levels

## Overview
The pAIrStudio platform supports two types of levels:
1. **Tutorial Levels** - Non-experimental practice levels (no chatbot, no data collection)
2. **Experimental Levels** - Research study levels (chatbot based on group, data collected)

## Level Properties

### `isExperiment` (Optional)
- **Type**: Boolean
- **Default**: `true`
- **Purpose**: Mark whether level is part of experimental data collection
- **Values**:
  - `true` - Experimental level (performance data is logged)
  - `false` - Tutorial/practice level (data not included in study)

### `chatbotEnabled` (Optional)
- **Type**: Boolean  
- **Default**: `true`
- **Purpose**: Override chatbot visibility for specific levels
- **Behavior**:
  - `true` - Chatbot visibility follows experimental group assignment
  - `false` - Chatbot is **hidden for ALL groups** on this level (overrides group settings)

## Naming Conventions

### Tutorial Levels
- **ID Format**: `tutorial_A`, `tutorial_B`, `practice_intro`, etc.
- **Title**: Descriptive name (e.g., "Tutorial: Basic Movement")
- **Properties**: 
  - `isExperiment: false`
  - `chatbotEnabled: false` (usually)

### Experimental Levels
- **ID Format**: `level_001`, `level_002`, `level_003`, etc.
- **Title**: Short descriptive name (e.g., "First Steps", "Loop Challenge")
- **Properties**:
  - `isExperiment: true` (or omit - default)
  - `chatbotEnabled: true` (or omit - default)

## Example Configurations

### Tutorial Level (No Chatbot, No Experiment)
```javascript
export const TutorialA = {
    id: "tutorial_A",
    title: "Tutorial: Basic Movement",
    description: "Learn how to move the robot.",
    instructions: "Move forward 3 times. No chatbot help - learn by doing!",
    
    isExperiment: false,      // Don't collect data
    chatbotEnabled: false,    // Hide chatbot for everyone
    
    map: { /* ... */ },
    objects: { /* ... */ },
    player: { /* ... */ },
    winConditions: [ /* ... */ ],
    
    allowedBlocks: {
        actions: ['move_forward'],  // Very limited
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: false
    }
};
```

### Experimental Level with Chatbot
```javascript
export const Level1 = {
    id: "level_001",
    title: "First Steps",
    description: "Pick up and deliver the package.",
    instructions: "Move the robot to pick up the box...",
    
    // isExperiment: true,     // Can omit (default)
    // chatbotEnabled: true,   // Can omit (default)
    
    map: { /* ... */ },
    objects: { /* ... */ },
    player: { /* ... */ },
    winConditions: [ /* ... */ ],
    
    allowedBlocks: {
        actions: true,  // All action blocks
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: false
    }
};
```

### Experimental Level WITHOUT Chatbot (Special Case)
```javascript
export const Level5 = {
    id: "level_005",
    title: "Final Challenge",
    description: "Complete this level without AI assistance.",
    instructions: "This is the final test - no chatbot help!",
    
    isExperiment: true,       // Still collect data
    chatbotEnabled: false,    // But disable chatbot for everyone
    
    // ... rest of config
};
```

## Level Progression Setup

### 1. Create Level Files
Place level definitions in `src/game/levels/data/`:
- `tutorial_A.js` - First tutorial
- `tutorial_B.js` - Second tutorial
- `level_001.js` - First experimental level
- `level_002.js` - Second experimental level
- etc.

### 2. Register Levels in `index.js`
```javascript
// Import tutorial levels
import { TutorialA } from './data/tutorial_A';
import { TutorialB } from './data/tutorial_B';

// Import experimental levels
import { Level1 } from './data/level_001';
import { Level2 } from './data/level_002';

export const LEVELS = {
    // Tutorials first
    [TutorialA.id]: TutorialA,
    [TutorialB.id]: TutorialB,
    
    // Then experimental levels
    [Level1.id]: Level1,
    [Level2.id]: Level2
};
```

### 3. Set Progression Order in `LevelManager.js`
```javascript
constructor() {
    // ...
    this.allLevelIds = [
        'tutorial_A',   // Tutorial 1
        'tutorial_B',   // Tutorial 2
        'level_001',    // Experiment level 1
        'level_002',    // Experiment level 2
        'level_003'     // Experiment level 3
    ];
}
```

### 4. Set Starting Level in `MainScene.js`
```javascript
create() {
    // ...
    this.loadLevel('tutorial_A');  // Start with first tutorial
}
```

## How It Works

### Chatbot Visibility Logic
```
For each level:
  1. Check if level.chatbotEnabled === false
     → If yes: HIDE chatbot (overrides everything)
     → If no: Continue to step 2
  
  2. Check user's experimental group
     → CONTROL group: HIDE chatbot
     → STANDARD_AI group: SHOW chatbot (standard mode)
     → PAIR_DRIVER/PAIR_NAVIGATOR: SHOW chatbot (pair programming mode)
```

### Data Collection
- Only levels with `isExperiment: true` (or undefined) are included in analytics
- Tutorial levels (`isExperiment: false`) don't affect experimental results
- Useful for practice levels, onboarding, or post-experiment challenges

## Use Cases

### 1. Onboarding Flow
```
tutorial_A → tutorial_B → tutorial_C → level_001 → level_002 → ...
(no chatbot, no data)    (experiment starts, chatbot per group)
```

### 2. Baseline Measurement
```
level_001 (chatbotEnabled: false) → level_002 → level_003 → ...
(measure without AI)                (measure with AI per group)
```

### 3. Mixed Approach
```
tutorial_A → level_001 → level_002 → practice_X → level_003
(tutorial)   (experiment with chatbot)  (practice)  (experiment)
```

## Best Practices

1. **Start with Tutorials**: Use 1-2 tutorial levels to familiarize users
2. **Clear Instructions**: Tutorial levels should have detailed instructions since there's no chatbot
3. **Progressive Difficulty**: Tutorial → Easy Experimental → Medium → Hard
4. **Consistent Naming**: Use consistent prefixes (`tutorial_`, `level_`, `practice_`)
5. **Document Purpose**: Add comments explaining why chatbot is disabled if using `chatbotEnabled: false`

## Modifying for Future Studies

### To Add New Tutorial Level:
1. Create `src/game/levels/data/tutorial_X.js`
2. Set `isExperiment: false` and `chatbotEnabled: false`
3. Import in `index.js`
4. Add ID to `allLevelIds` array in `LevelManager.js`

### To Add Experimental Level:
1. Create `src/game/levels/data/level_00X.js`
2. Omit `isExperiment` and `chatbotEnabled` (defaults are correct)
3. Import in `index.js`
4. Add ID to `allLevelIds` array in `LevelManager.js`

### To Disable Chatbot for Specific Experimental Level:
1. Open the level file (e.g., `level_005.js`)
2. Add `chatbotEnabled: false`
3. No other changes needed - system handles rest automatically

This modular design allows easy reconfiguration for different study designs without touching core system code!
