import { gridToScreen } from './IsoUtils';
import { StationaryObject, MoveableObject } from './IsoObjects';

export class IsoBoard {
  constructor(scene, config) {
    this.scene = scene;
    this.tileWidth = config.tileWidth || 64;
    this.tileHeight = config.tileHeight || 32;
    this.mapWidth = config.width || 10;
    this.mapHeight = config.height || 10;
    
    // Layers
    this.floorLayer = []; // 2D array of sprites
    this.stationaryObjects = []; // Array of StationaryObject
    this.moveableObjects = []; // Array of MoveableObject
    this.allSprites = []; // Flat list for depth sorting
  }

  /**
   * Create the floor from a 2D array of frame indices.
   * @param {number[][]} mapData - 2D array [row][col] of frame indices
   * @param {string} textureKey - The tileset texture key
   */
  createFloor(mapData, textureKey) {
    this.mapHeight = mapData.length;
    this.mapWidth = mapData[0].length;

    for (let row = 0; row < this.mapHeight; row++) {
      this.floorLayer[row] = [];
      for (let col = 0; col < this.mapWidth; col++) {
        const frameIndex = mapData[row][col];
        
        // Skip empty tiles if frame is -1 or 0 (depending on convention, assuming > -1 is valid)
        if (frameIndex >= 0) {
          const pos = gridToScreen(row, col, this.tileWidth, this.tileHeight, 0);
          
          const tile = this.scene.add.sprite(pos.x, pos.y, textureKey, frameIndex);
          tile.setOrigin(0.5, 0.5);
          
          // Store metadata for sorting
          tile.isoRow = row;
          tile.isoCol = col;
          tile.isoZ = 0;
          tile.isoType = 'floor';
          
          this.floorLayer[row][col] = tile;
          this.allSprites.push(tile);

          // Draw Diamond Outline
          // Top: (0, -h/2), Right: (w/2, 0), Bottom: (0, h/2), Left: (-w/2, 0)
          const graphics = this.scene.add.graphics({ x: pos.x, y: pos.y });
          graphics.lineStyle(2, 0x000000, 0.3); // Black, 30% alpha
          graphics.beginPath();
          graphics.moveTo(0, -this.tileHeight / 2);
          graphics.lineTo(this.tileWidth / 2, 0);
          graphics.lineTo(0, this.tileHeight / 2);
          graphics.lineTo(-this.tileWidth / 2, 0);
          graphics.closePath();
          graphics.strokePath();

          // Link graphics for sorting (same pos as tile)
          graphics.isoRow = row;
          graphics.isoCol = col;
          graphics.isoZ = 0;
          graphics.isoType = 'floor_border';
          
          this.allSprites.push(graphics);
        }
      }
    }
  }

  /**
   * Add a stationary object (e.g. Conveyor).
   */
  addStationaryObject(row, col, texture, config = {}) {
    const obj = new StationaryObject(this.scene, this, row, col, texture, config);
    // Link generic sprite props for sorting
    obj.sprite.isoRow = row;
    obj.sprite.isoCol = col;
    obj.sprite.isoZ = config.zHeight || 0; // Usually 0 or low
    obj.sprite.isoType = 'stationary';
    
    this.stationaryObjects.push(obj);
    this.allSprites.push(obj.sprite);
    return obj;
  }

  /**
   * Add a moveable object (e.g. Box, NPC).
   */
  addMoveableObject(row, col, texture, config = {}) {
    const obj = new MoveableObject(this.scene, this, row, col, texture, config);
    // Link generic sprite props
    obj.sprite.isoRow = row;
    obj.sprite.isoCol = col;
    obj.sprite.isoZ = config.zHeight || 10;
    obj.sprite.isoType = 'moveable';

    this.moveableObjects.push(obj);
    this.allSprites.push(obj.sprite);
    return obj;
  }

  /**
   * Get object at specific grid coordinates.
   * @param {number} row 
   * @param {number} col 
   * @returns {IsoObject|null}
   */
  getStationaryAt(row, col) {
    return this.stationaryObjects.find(o => o.gridRow === row && o.gridCol === col) || null;
  }

  getMoveableAt(row, col) {
    return this.moveableObjects.find(o => o.gridRow === row && o.gridCol === col && !o.isCarried) || null;
  }

  /**
   * Check if a tile is walkable (no colliders).
   */
  isWalkable(row, col) {
    // 1. Check bounds
    if (row < 0 || row >= this.mapWidth || col < 0 || col >= this.mapHeight) return false;

    // 2. Check Stationary Collisions
    const stat = this.getStationaryAt(row, col);
    if (stat && stat.collidable) return false;

    // 3. Check Moveable Collisions (that are not carried)
    const mov = this.getMoveableAt(row, col);
    if (mov && mov.collidable) return false;

    return true;
  }

  /**
   * Simple depth sorting algorithm.
   * Run this in the Scene update loop or after movements.
   */
  updateDepth() {
    this.allSprites.sort((a, b) => {
        // 1. Z layer priority (Strong Separation between Floors and Objects)
        // Floors must ALWAYS render before objects to prevent clipping when objects overlap tiles
        const typePriority = { 'floor': 0, 'floor_border': 0, 'stationary': 1, 'moveable': 1, 'player': 1 };
        const typeA = typePriority[a.isoType] !== undefined ? typePriority[a.isoType] : 1;
        const typeB = typePriority[b.isoType] !== undefined ? typePriority[b.isoType] : 1;
        
        if (typeA !== typeB) {
            return typeA - typeB;
        }

        // 2. Depth Sort (within same layer type)
        // Render order: (row + col) determines the "diagonal" row.
        const depthA = (a.isoRow || 0) + (a.isoCol || 0);
        const depthB = (b.isoRow || 0) + (b.isoCol || 0);

        if (depthA !== depthB) {
            return depthA - depthB;
        }

        // If on same diagonal, usually check row or Z.
        // Z (height) check:
        const zA = a.isoZ || 0;
        const zB = b.isoZ || 0;
        if (zA !== zB) return zA - zB;

        return typeA - typeB; 
    });

    this.allSprites.forEach((s, i) => {
        s.setDepth(i);
        // Sync iso coordinates from logic objects if they moved
        if (s.data && s.data.gridRow !== undefined) {
             s.isoRow = s.data.gridRow;
             s.isoCol = s.data.gridCol;
             // Carrier logic for Z? simpler to just keep it high.
        }
    });
  }

  /**
   * Clear the board of all sprites and objects.
   * Essential for level reloading.
   */
  clear() {
      // 1. Destroy Floor Tiles and Graphics (borders) FIRST
      // These are pure sprites with no wrapper objects
      this.allSprites.forEach(s => {
          try {
              if (s && s.scene && typeof s.destroy === 'function') {
                  s.destroy();
              }
          } catch (e) {
              // Silently ignore already-destroyed sprites
          }
      });
      this.allSprites = [];
      this.floorLayer = [];

      // 2. Clear Stationary Objects (don't call destroy, just null the sprite ref)
      this.stationaryObjects.forEach(obj => {
          if (obj) obj.sprite = null;
      });
      this.stationaryObjects = [];

      // 3. Clear Moveable Objects (don't call destroy, just null the sprite ref)
      this.moveableObjects.forEach(obj => {
          if (obj) obj.sprite = null;
      });
      this.moveableObjects = [];
  }
}
