import { MoveableObject } from './IsoObjects';
import { gridToScreen } from './IsoUtils';
import { directionToNumber, directionToString } from './DirectionConstants';

export class IsoPlayer extends MoveableObject {
  constructor(scene, board, gridRow, gridCol, texture, config = {}) {
    super(scene, board, gridRow, gridCol, texture, {
        ...config,
        zHeight: config.zHeight || 10,
        collidable: true, // Player is collidable by default
        visualOffsetX: -2, // Move visual offsets here so they apply during sprite creation
        visualOffsetY: 8
    });
    
    // Explicitly set these on the instance too in case super doesn't assign 
    // them to this (MoveableObject usually does if it puts them in config, but IsoObject reads from config)
    this.visualOffsetX = -2;
    this.visualOffsetY = 8;
    
    this.type = 'player';
    this.sprite.isoType = 'player';
    
    // Direction: 0=South(SW), 1=East(SE), 2=West(NW), 3=North(NE)
    // Based on user sprite sheet: 0=South, 1=East, 2=West, 3=North
    // Geometric mapping for Isometric (Grid Row/Col):
    // NE (North) = Grid Row-
    // SE (East)  = Grid Col+
    // SW (South) = Grid Row+
    // NW (West)  = Grid Col-
    // Accepts both string directions ('NORTH', 'SOUTH', etc.) and numeric (0-3)
    this.direction = directionToNumber(config.direction !== undefined ? config.direction : 0);
    
    // Fix initial facing
    this.sprite.setFrame(this.direction);
    
    this.isMoving = false;
    
    // Carried item visual offset (adjust this single value to move carried items)
    this.carriedItemYOffset = 7;
  }

  /**
   * Helper to get target coordinates from direction.
   */
  getFrontCoordinates() {
    let dRow = 0;
    let dCol = 0;
    switch(this.direction) {
        case 0: dRow = 1; break;  // South (SW) => Grid Row+
        case 1: dCol = 1; break;  // East (SE)  => Grid Col+
        case 2: dCol = -1; break; // West (NW)  => Grid Col-
        case 3: dRow = -1; break; // North (NE) => Grid Row-
    }
    return { row: this.gridRow + dRow, col: this.gridCol + dCol };
  }

  /**
   * Get the current direction as a string name
   * @returns {string} Cardinal direction ('NORTH', 'SOUTH', 'EAST', 'WEST')
   */
  getDirectionName() {
    return directionToString(this.direction);
  }

  // --- API for Blockly / Executor ---

  async moveForward() {
    if (this.isMoving) return false;
    
    const target = this.getFrontCoordinates();
    
    if (this.board.isWalkable(target.row, target.col)) {
        this.isMoving = true;
        
        return new Promise(resolve => {
            // Calculate target screen position
            const pos = gridToScreen(target.row, target.col, this.board.tileWidth, this.board.tileHeight, this.zHeight);
            
            // Smooth tween animation for player
            this.scene.tweens.add({
                targets: this.sprite,
                x: pos.x + this.visualOffsetX,
                y: pos.y + this.visualOffsetY,
                duration: 400,
                ease: 'Power1',
                onComplete: () => {
                    // Update grid position AFTER animation completes
                    this.gridRow = target.row;
                    this.gridCol = target.col;
                    
                    // Update sprite metadata for depth sorting
                    this.sprite.isoRow = this.gridRow;
                    this.sprite.isoCol = this.gridCol;
                    
                    this.isMoving = false;
                    resolve(true); 
                }
            });
            
            // Tween carried item too
            if (this.carriedItem) {
               const itemPos = gridToScreen(target.row, target.col, this.board.tileWidth, this.board.tileHeight, this.zHeight + this.carriedItem.carriedZOffset);
               this.scene.tweens.add({
                   targets: this.carriedItem.sprite,
                   x: itemPos.x + this.visualOffsetX,
                   y: itemPos.y + this.visualOffsetY + this.carriedItemYOffset,
                   duration: 400,
                   ease: 'Power1',
                   onComplete: () => {
                       // Update carried item grid position
                       this.carriedItem.gridRow = target.row;
                       this.carriedItem.gridCol = target.col;
                       this.carriedItem.sprite.isoRow = target.row;
                       this.carriedItem.sprite.isoCol = target.col;
                   }
               });
            }
        });
    } else {
        return false; // Collision or OOB
    }
  }

  async turnCounterClockwise() {
      // CCW: North(3)->West(2)->South(0)->East(1)->North(3)
      const map = { 3: 2, 2: 0, 0: 1, 1: 3 };
      const oldDirection = this.direction;
      this.direction = map[this.direction];
      
      return new Promise(resolve => {
          // Create a subtle rotation tween effect by scaling/flashing
          this.scene.tweens.add({
              targets: this.sprite,
              scaleX: this.sprite.scaleX * 0.9,
              scaleY: this.sprite.scaleY * 0.9,
              duration: 100,
              yoyo: true,
              onStart: () => {
                  // Change frame at the start of the animation
                  this.sprite.setFrame(this.direction);
              },
              onComplete: () => {
                  resolve(true);
              }
          });
      });
  }

  async turnClockwise() {
      // CW: North(3)->East(1)->South(0)->West(2)->North(3)
      const map = { 3: 1, 1: 0, 0: 2, 2: 3 };
      const oldDirection = this.direction;
      this.direction = map[this.direction];
      
      return new Promise(resolve => {
          // Create a subtle rotation tween effect by scaling/flashing
          this.scene.tweens.add({
              targets: this.sprite,
              scaleX: this.sprite.scaleX * 0.9,
              scaleY: this.sprite.scaleY * 0.9,
              duration: 100,
              yoyo: true,
              onStart: () => {
                  // Change frame at the start of the animation
                  this.sprite.setFrame(this.direction);
              },
              onComplete: () => {
                  resolve(true);
              }
          });
      });
  }

  // Interactions
  pickUp() {
      if (this.carriedItem) return false;
      
      const front = this.getFrontCoordinates();
      const obj = this.board.getMoveableAt(front.row, front.col);
      
      // Check if object exists, is not already carried, and is pickupable
      if (obj && !obj.isCarried) { 
          // Check pickupable flag (default to true if not set)
          const canPickup = obj.pickupable !== undefined ? obj.pickupable : true;
          if (canPickup) {
              obj.pickUp(this);
              this.carriedItem = obj;
              
              // Update grid position to be on top of player
              obj.gridRow = this.gridRow;
              obj.gridCol = this.gridCol;
              
              // Calculate position on top of robot with z-offset
              const itemPos = gridToScreen(this.gridRow, this.gridCol, this.board.tileWidth, this.board.tileHeight, this.zHeight + obj.carriedZOffset);
              
              // Animate the pickup: lift the item up and onto the robot
              // Adjust offsets so box sits visually on top of robot sprite (more south)
              this.scene.tweens.add({
                  targets: obj.sprite,
                  x: itemPos.x + this.visualOffsetX, // Use robot's X offset
                  y: itemPos.y + this.visualOffsetY + this.carriedItemYOffset, // Use robot's Y offset + extra south adjustment
                  duration: 300,
                  ease: 'Back.easeOut',
                  onComplete: () => {
                      // Update sprite metadata for depth sorting
                      obj.sprite.isoRow = this.gridRow;
                      obj.sprite.isoCol = this.gridCol;
                      obj.sprite.isoZ = this.zHeight + obj.carriedZOffset; // Higher z = render on top
                  }
              });
              
              console.log(`Picked up object at (${front.row}, ${front.col})`);
              return true;
          }
      }
      
      console.log(`No pickupable object at (${front.row}, ${front.col})`);
      return false;
  }

  drop() {
      if (!this.carriedItem) return false;
      const front = this.getFrontCoordinates();
      
      // 1. Cannot drop if another moveable object is already there
      if (this.board.getMoveableAt(front.row, front.col)) return false; 
      
      // 2. Check Stationary Objects (like conveyors or walls)
      const stationary = this.board.getStationaryAt(front.row, front.col);
      if (stationary) {
          // Check if this stationary object explicitly allows dropping items on it
          // (e.g. Conveyor Belts)
          const allowsDrop = stationary.getAttribute('allowDrop');
          
          if (!allowsDrop) {
               // If it doesn't explicitly allow drop, checking if it's a solid obstacle
               if (stationary.collidable) return false;
          }
          // If allowsDrop is true, we proceed regardless of collidable status
      }
      
      this.carriedItem.drop(front.row, front.col);
      this.carriedItem = null;
      
      // Check win/fail conditions after dropping
      this.checkLevelConditions();
      
      return true;
  }

  checkLevelConditions() {
      // Delay check slightly to allow animations to complete
      this.scene.time.delayedCall(300, () => {
          const levelManager = this.scene.levelManager;
          if (!levelManager || !levelManager.currentLevelId) return;
          
          // Check fail conditions first
          const failResult = levelManager.checkFailConditions(
              levelManager.currentLevelId, 
              this.board, 
              this
          );
          
          if (failResult.failed) {
              console.log('Level Failed:', failResult.reason);
              // Show fail modal/notification
              if (window.showResultModal) {
                  window.showResultModal(false, levelManager.currentLevelId);
              }
              return;
          }
          
          // Check win conditions
          const won = levelManager.checkWinConditions(
              levelManager.currentLevelId,
              this.board
          );
          
          if (won) {
              console.log('Level Complete!');
              // Mark level as complete
              levelManager.completeLevel(levelManager.currentLevelId);
              // Show win modal/notification
              if (window.showResultModal) {
                  window.showResultModal(true, levelManager.currentLevelId);
              }
          }
      });
  }

}
