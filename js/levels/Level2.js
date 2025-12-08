/**
 * Level 2 - Move Two
 * Multiple boxes challenge
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class Level2 extends BaseLevel {
  constructor() {
    super(2);
    this.init();
  }
  
  init() {
    // Level metadata
    this.title = "Level 2: Move Two";
    this.instructions = "In this level, you will be tasked to move each box from one conveyor belt to the conveyor belt right across from it.";
    
    // Map configuration
    this.mapFile = "lvl2.json";
    this.playerStart = { x: 5, y: 1, direction: 0 };
    
    // Two boxes to move - each has an ID and target conveyor
    this.itemSpawns = [
      { 
        spriteKey: 'boxes', 
        x: 7, y: 0, 
        frame: 0, 
        scale: 1.5,
        id: 'box1',
        targetConveyorId: 'conveyor1',
        damaged: false,
        itemType: 'box'
      },
      { 
        spriteKey: 'boxes', 
        x: 5, y: 0, 
        frame: 0, 
        scale: 1.5,
        id: 'box2',
        targetConveyorId: 'conveyor2',
        damaged: false,
        itemType: 'box'
      }
    ];
    
    // Two goal conveyors with IDs
    this.goalConveyors = [
      { x: 7, y: 7, id: 'conveyor1' },
      { x: 5, y: 7, id: 'conveyor2' }
    ];
    
    // Allowed blocks - all basic blocks
    this.allowedBlocks = [
      'custom_start',
      'move_forward',
      'rotate_left',
      'rotate_right',
      'pick_object',
      'release_object',
      'controls_repeat'
    ];
    
    // Victory condition
    this.victoryConditions = {
      type: 'conveyor'
    };
  }
}
