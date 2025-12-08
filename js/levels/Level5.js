/**
 * Level 5 - Sorting Items (Example of advanced level with inspection)
 * Demonstrates how to use inspection and branching logic
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class Level5 extends BaseLevel {
  constructor() {
    super(5);
    this.init();
  }
  
  init() {
    // Level metadata
    this.title = "Level 5: Sorting Items";
    this.instructions = "Sort the items! Boxes go to the left conveyor, crates go to the right. Use the 'inspect object' block to check item types and 'if' blocks to make decisions.";
    this.hints = [
      "Inspect the object before picking it up",
      "Use an 'if' block to check the object type",
      "Send boxes left and crates right"
    ];
    
    // Map configuration
    this.mapFile = "lvl5_sorting.json"; // Would need to create this
    this.playerStart = { x: 4, y: 4, direction: 0 };
    
    // Multiple items of different types
    this.itemSpawns = [
      { spriteKey: 'boxes', x: 3, y: 6, frame: 0, scale: 1.5, itemType: 'box' },
      { spriteKey: 'crates', x: 4, y: 6, frame: 0, scale: 1.5, itemType: 'crate' },
      { spriteKey: 'boxes', x: 5, y: 6, frame: 0, scale: 1.5, itemType: 'box' }
    ];
    
    // Two goal conveyors for different item types
    this.goalConveyors = [
      { x: 1, y: 2, itemType: 'box' },    // Left conveyor for boxes
      { x: 7, y: 2, itemType: 'crate' }   // Right conveyor for crates
    ];
    
    // Allowed blocks - include inspection and branching
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
    
    // Enable advanced features
    this.hasInspection = true;
    this.hasBranching = true;
    
    // Custom victory condition
    this.victoryConditions = {
      type: 'custom',
      customCheck: (scene, position) => {
        // Check if all items are on correct conveyors
        // This would be implemented in the scene
        return false; // Placeholder
      }
    };
  }
  
  /**
   * Custom completion check for sorting
   */
  onComplete(scene) {
    console.log('Level 5 completed! All items sorted correctly.');
  }
}
