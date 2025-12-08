/**
 * Tutorial Level A - Moving Forward
 * Teaches basic movement
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class TutorialA extends BaseLevel {
  constructor() {
    super('A');
    this.init();
  }
  
  init() {
    // Level metadata
    this.title = "Tutorial A: Moving Forward";
    this.instructions = "Welcome! Let's learn the basics. Use the 'Move forward' block twice to move the robot 2 steps forward. Drag blocks from the right panel and connect them to the 'When program starts' block, then click 'Run Code'.";
    this.hints = [
      "Drag the 'Move forward' block to the workspace",
      "Connect it below 'When program starts'",
      "You need to move forward 2 times total",
      "Click 'Run Code' to execute"
    ];
    
    // Map configuration
    this.mapFile = "lvlA.json";
    this.playerStart = { x: 4, y: 1, direction: 0 };
    
    // No items in this tutorial
    this.itemSpawns = [];
    this.goalConveyors = [];
    
    // Goal is to reach a specific position (2 steps forward from start)
    // Direction 0 moves along increasing gridX: (4,1) → (5,1) → (6,1)
    this.goalPosition = { x: 6, y: 1 };
    
    // Allowed blocks - only movement
    this.allowedBlocks = [
      'custom_start',
      'move_forward'
    ];
    
    // Victory condition
    this.victoryConditions = {
      type: 'position'
    };
  }
}
