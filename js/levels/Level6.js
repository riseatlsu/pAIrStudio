/**
 * Level 6 - Placeholder
 */

import { BaseLevel } from '../core/BaseLevel.js';

export class Level6 extends BaseLevel {
  constructor() {
    super('6');
    this.init();
  }
  
  init() {
    this.title = "Level 6: Coming Soon";
    this.instructions = "This level is under construction. Check back later!";
    this.mapFile = "lvl1_v2.json";
    this.playerStart = { x: 1, y: 6, direction: 0 };
    this.itemSpawns = [];
    this.goalConveyors = [];
    this.allowedBlocks = ['custom_start', 'move_forward'];
  }
}
