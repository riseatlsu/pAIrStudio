/**
 * Tutorial Level C - Using Loops
 * Teaches loop/repeat blocks
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class TutorialC extends BaseLevel {
  constructor() {
    super('C');
    this.init();
  }
  
  init() {
    // Level metadata
    this.title = "Tutorial C: Using the AI Assistant";
    this.instructions = "Excellent! Now learn to use the AI Assistant. Ask Mike (the chatbot) to help you pick up the box from one conveyor and place it on the other. Try saying: 'Move forward, pick up the box from the conveyor, and place it on the other conveyor.'";
    this.hints = [
      "Click on the Mike AI Assistant chatbot",
      "Ask Mike to help you move the box",
      "Mike will generate the blocks for you automatically",
      "Click 'Run Code' to execute the generated program"
    ];
    
    // Map configuration
    this.mapFile = "lvlC.json";
    this.playerStart = { x: 4, y: 1, direction: 0 };
    
    // Box on upper conveyor
    this.itemSpawns = [
      { spriteKey: 'boxes', x: 4, y: 0, frame: 0, scale: 1.5 }
    ];
    
    // Goal: lower conveyor
    this.goalConveyors = [{ x: 7, y: 0 }];
    
    // Allowed blocks - movement, turning, and item interaction for AI to use
    this.allowedBlocks = [
      'custom_start',
      'move_forward',
      'rotate_left',
      'rotate_right',
      'pick_object',
      'release_object'
    ];
    
    // Victory condition - box on conveyor
    this.victoryConditions = {
      type: 'conveyor'
    };
  }
}
