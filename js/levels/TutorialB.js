/**
 * Tutorial Level B - Turning & Picking Up
 * Teaches rotation and item interaction
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class TutorialB extends BaseLevel {
  constructor() {
    super('B');
    this.init();
  }
  
  init() {
    // Level metadata
    this.title = "Tutorial B: Turning & Picking Up";
    this.instructions = "Great! Now let's learn to turn and pick up objects. Pick up the box from the upper conveyor belt and place it on the lower conveyor belt. Use movement, turning, and item blocks.";
    this.hints = [
      "Navigate to the upper conveyor to pick up the box",
      "Use 'Turn clockwise' or 'Turn counter-clockwise' to rotate",
      "Use 'Pick up object' when next to the box",
      "Navigate to the lower conveyor and 'Release object'"
    ];
    
    // Map configuration
    this.mapFile = "lvlB.json";
    this.playerStart = { x: 4, y: 1, direction: 0 };
    
    // One box on upper conveyor
    this.itemSpawns = [
      { spriteKey: 'boxes', x: 5, y: 0, frame: 0, scale: 1.5 }
    ];
    
    // Goal: lower conveyor
    this.goalConveyors = [{ x: 7, y: 0 }];
    
    // Allowed blocks - movement + items
    this.allowedBlocks = [
      'custom_start',
      'move_forward',
      'rotate_left',
      'rotate_right',
      'pick_object',
      'release_object'
    ];
    
    // Victory condition
    this.victoryConditions = {
      type: 'conveyor'
    };
  }
}
