/**
 * Level 1 - Getting Started
 * First real challenge after tutorials
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class Level1 extends BaseLevel {
  constructor() {
    super(1);
    this.init();
  }
  
  init() {
    // Level metadata
    this.title = "Level 1: Getting Started";
    this.instructions = "Welcome to your first challenge! Move the box from the starting conveyor belt to the goal position. Use the blocks on the right to program the robot's movements.";
    
    // Map configuration
    this.mapFile = "lvl1_v2.json";
    this.playerStart = { x: 0, y: 1, direction: 0 };
    
    // Box to move (single item, doesn't need specific conveyor targeting)
    this.itemSpawns = [
      { 
        spriteKey: 'boxes', 
        x: 0, y: 0, 
        frame: 0, 
        scale: 1.5,
        id: 'box1',
        damaged: false,
        itemType: 'box'
      }
    ];
    
    // Goal conveyor (single goal, no ID needed for simple levels)
    this.goalConveyors = [{ x: 7, y: 0 }];
    
    // Allowed blocks - basic movement and item interaction (no loops yet)
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
