/**
 * @fileoverview IsoObjects - Base classes for interactive isometric objects.
 * Defines IsoObject, StationaryObject, and MoveableObject hierarchies.
 * @module game/iso/IsoObjects
 */

import { gridToScreen } from './IsoUtils';

/**
 * IsoObject - Base class for all non-floor objects on the isometric board.
 * 
 * Provides:
 * - Grid position tracking
 * - Phaser sprite management
 * - Collision detection flags
 * - Attribute system for custom properties
 * - Visual offset support
 * - Z-height for depth sorting
 * 
 * @class IsoObject
 */
export class IsoObject {
  /**
   * Create an IsoObject instance.
   * 
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {IsoBoard} board - The isometric board this object belongs to
   * @param {number} gridRow - Grid row position
   * @param {number} gridCol - Grid column position
   * @param {string} texture - Phaser texture key
   * @param {Object} [config={}] - Object configuration
   * @param {Object} [config.attributes={}] - Custom attributes for game logic
   * @param {boolean} [config.collidable=true] - Whether object blocks movement
   * @param {number} [config.zHeight=0] - Vertical offset for depth sorting
   * @param {number} [config.visualOffsetX=0] - Horizontal sprite offset
   * @param {number} [config.visualOffsetY=0] - Vertical sprite offset
   * @param {number} [config.frame=0] - Initial sprite frame
   * @param {number} [config.scale] - Sprite scale multiplier
   */
  constructor(scene, board, gridRow, gridCol, texture, config = {}) {
    this.scene = scene;
    this.board = board;
    this.gridRow = gridRow;
    this.gridCol = gridCol;
    
    // Attributes system
    this.attributes = config.attributes || {};
    
    // Collision system
    this.collidable = config.collidable !== undefined ? config.collidable : true;
    
    // Rendering
    this.zHeight = config.zHeight || 0;
    this.visualOffsetX = config.visualOffsetX || 0;
    this.visualOffsetY = config.visualOffsetY || 0;
    
    const pos = gridToScreen(gridRow, gridCol, board.tileWidth, board.tileHeight, this.zHeight);
    
    this.sprite = scene.add.sprite(
      pos.x + this.visualOffsetX, 
      pos.y + this.visualOffsetY, 
      texture,
      config.frame
    );
    
    this.sprite.setOrigin(0.5, 0.5); // Standard efficient handling
    
    // Scaling support
    if (config.scale) {
      this.sprite.setScale(config.scale);
    }
    
    // Link back to this logic object
    this.sprite.data = this; 
  }

  updateScreenPosition() {
    const pos = gridToScreen(this.gridRow, this.gridCol, this.board.tileWidth, this.board.tileHeight, this.zHeight);
    this.sprite.setPosition(
        pos.x + this.visualOffsetX, 
        pos.y + this.visualOffsetY
    );
  }

  setAttribute(key, value) {
    this.attributes[key] = value;
  }

  getAttribute(key) {
    return this.attributes[key];
  }

  destroy() {
    if (this.sprite && this.sprite.scene) {
      this.sprite.destroy();
    }
    this.sprite = null;
  }
}

/**
 * Stationary objects (Conveyors, Obstacles).
 * These typically stay in one place but might have animated states or interactions.
 */
export class StationaryObject extends IsoObject {
  constructor(scene, board, gridRow, gridCol, texture, config = {}) {
    super(scene, board, gridRow, gridCol, texture, {
      ...config,
      zHeight: config.zHeight || 0 // Usually sitting on the floor
    });
    this.type = 'stationary';
  }
}

/**
 * Moveable objects (Boxes, NPCs).
 * These can move between grid cells and be carried.
 */
export class MoveableObject extends IsoObject {
  constructor(scene, board, gridRow, gridCol, texture, config = {}) {
    super(scene, board, gridRow, gridCol, texture, {
      ...config,
      zHeight: config.zHeight || 10 // Usually slightly taller or on top of things
    });
    this.type = 'moveable';
    this.isCarried = false;
    this.carrier = null;
    this.carriedZOffset = config.carriedZOffset || 20;
    this.pickupable = config.pickupable !== undefined ? config.pickupable : true;
  }

  /**
   * Move to a specific grid coordinate immediately (teleport).
   */
  moveTo(gridRow, gridCol) {
    this.gridRow = gridRow;
    this.gridCol = gridCol;
    this.updateScreenPosition();
  }

  /**
   * Logic to be picked up by a carrier (like the robot).
   */
  pickUp(carrier) {
    this.isCarried = true;
    this.carrier = carrier;
    // Visually it will now be updated by the carrier's movement loop or update logic
    // We bump the zHeight so it renders above the carrier
  }

  drop(gridRow, gridCol) {
    this.isCarried = false;
    this.carrier = null;
    this.gridRow = gridRow;
    this.gridCol = gridCol;
    this.updateScreenPosition();
  }
}
