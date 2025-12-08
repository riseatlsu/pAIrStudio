/**
 * Level 4 - Placeholder
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class Level4 extends BaseLevel {
  constructor() {
    super('4');
    this.init();
  }
  
  init() {
    this.title = "Level 4: Coming Soon";
    this.instructions = "This level is under construction. Check back later!";
    this.mapFile = "lvl1_v2.json";
    this.playerStart = { x: 1, y: 6, direction: 0 };
    this.itemSpawns = [];
    this.goalConveyors = [];
    this.allowedBlocks = ['custom_start', 'move_forward'];
  }
}
