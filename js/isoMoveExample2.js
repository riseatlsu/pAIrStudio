// Use global Phaser that's loaded via script tag
const { Game, Scene } = window.Phaser;

// Import isometric handling classes
import { IsometricTilemap, IsometricPlayer } from './iso_handler.js';

class IsoMoveExample extends Scene {
  constructor() {
    const sceneConfig = {
      key: 'IsoMoveExample'
    };

    super(sceneConfig);
    
    // Grid properties (will be set from tilemap data)
    this.gridWidth = null;
    this.gridHeight = null;
    
    // Player reference (will be IsometricPlayer instance)
    this.isoPlayer = null;
    
    // Camera zoom state
    this.defaultZoom = 1.5;  // Increased from 1 to better fit the map in view
    this.followZoom = 2;     // Increased proportionally
    this.isZoomedIn = false;
    this.isMoving = false; // Track if moves are being executed
    
    // Level configuration (will be loaded from LevelManager)
    this.levelConfig = null;
  }

  preload() {
    // Load level configuration from LevelManager
    // Note: getCurrentLevel is now async, so we'll handle it in create()
    // For now, set a flag
    this.levelConfigLoaded = false;
    
    // Load default assets that all levels need
    this.load.spritesheet('tiles', 'assets/images/fixes_factory.png', {
      frameWidth: 64,
      frameHeight: 32
    });
    
    this.load.spritesheet('robot', 'assets/images/Robot_TileSet.png', {
      frameWidth: 24,
      frameHeight: 16
    });
    
    this.load.spritesheet('boxes', 'assets/images/box.png', {
      frameWidth: 22,
      frameHeight: 21
    });
  }

  async create() {
    console.log('Scene create() called');

    // Load level configuration asynchronously
    if (window.LevelManager) {
      // Survey level doesn't need game initialization
      if (window.LevelManager.currentLevel === 'S') {
        console.log('Survey level - skipping game initialization');
        return;
      }
      
      this.levelConfig = await window.LevelManager.getCurrentLevel();
      console.log('Level config loaded:', this.levelConfig);
    }
    
    // Fallback if LevelManager not available or no config
    if (!this.levelConfig) {
      console.warn('LevelManager not available, using fallback config');
      this.levelConfig = {
        playerStart: { x: 2, y: 2, direction: 0 },
        itemSpawns: [{ spriteKey: 'boxes', x: 0, y: 7, frame: 0, scale: 1.5 }],
        goalConveyors: [{ x: 7, y: 0 }],
        conveyorLayer: 'Tile Layer 2',
        mapFile: 'lvl1_v2.json'
      };
    }
    
    // Now load the tilemap based on level config
    const mapFile = this.levelConfig.mapFile || 'lvl1_v2.json';
    console.log('Loading tilemap for level:', mapFile);
    
    // Load tilemap dynamically
    this.load.tilemapTiledJSON('warehouse', `assets/maps/${mapFile}`);
    
    this.load.once('complete', () => {
      console.log('Tilemap loaded, initializing level');
      this.initLevel();
    });
    
    this.load.start();
    
    // Set up click handler for zoom in/out
    this.input.on('pointerdown', (pointer) => {
      if (this.isMoving) return; // Disable zoom control during moves
      
      if (!this.isZoomedIn) {
        // Zoom in to clicked location
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.cameras.main.stopFollow();
        this.cameras.main.pan(worldPoint.x, worldPoint.y, 300, 'Power2');
        this.cameras.main.zoomTo(this.followZoom, 300, 'Power2');
        this.isZoomedIn = true;
      } else {
        // Zoom back out to default view using helper method
        this.resetCameraToDefault(true); // true for animated transition
        this.isZoomedIn = false;
      }
    });
    
    // Store scene reference for API
    this.registry.set('isoScene', this);
    
    // Signal API is ready
    console.log('About to resolve ready promise, _readyResolve exists?', typeof _readyResolve !== 'undefined');
    if (_readyResolve) {
      console.log('Resolving ready promise!');
      _readyResolve();
    } else {
      console.error('_readyResolve is not defined!');
    }
  }
  
  update() {
    // Update loop - no keyboard input, controlled by API only
  }
  
  /**
   * Reset camera to default view (centered on map)
   * @param {boolean} animated - Whether to animate the transition
   */
  resetCameraToDefault(animated = false) {
    if (!this.isoMap) return;
    
    const centerPos = this.isoMap.gridToScreen(this.isoMap.mapWidth / 2, this.isoMap.mapHeight / 2);
    const yOffset = -25; // Offset upward to show more of the top
    
    if (animated) {
      this.cameras.main.pan(centerPos.x, centerPos.y + yOffset, 300, 'Power2');
      this.cameras.main.zoomTo(this.defaultZoom, 300, 'Power2');
    } else {
      this.cameras.main.centerOn(centerPos.x, centerPos.y + yOffset);
      this.cameras.main.setZoom(this.defaultZoom);
    }
  }
  
  /**
   * Initialize the level with configured settings
   */
  initLevel() {
    // Verify tilemap is loaded
    if (!this.cache.tilemap.exists('warehouse')) {
      console.error('Tilemap not found in cache! Cannot initialize level.');
      return;
    }
    
    const tilemapData = this.cache.tilemap.get('warehouse').data;
    if (!tilemapData) {
      console.error('Tilemap data is null! Cannot initialize level.');
      return;
    }
    
    console.log('Initializing level with tilemap:', tilemapData);
    
    // Create isometric tilemap renderer
    this.isoMap = new IsometricTilemap(this, tilemapData, 'tiles');
    this.isoMap.build();
    
    // Auto-detect grid dimensions from tilemap
    this.gridWidth = this.isoMap.mapWidth;
    this.gridHeight = this.isoMap.mapHeight;
    console.log(`Grid dimensions: ${this.gridWidth}x${this.gridHeight}`);
    
    // Debug: Log all available layers
    console.log('Available layers:', this.isoMap.getLayerNames());
    
    // Debug: Check conveyor layer tiles
    console.log(`Checking for conveyor belts on "${this.levelConfig.conveyorLayer}" layer...`);
    for (let y = 0; y < this.isoMap.mapHeight; y++) {
      for (let x = 0; x < this.isoMap.mapWidth; x++) {
        if (this.isoMap.hasTileAt(x, y, this.levelConfig.conveyorLayer)) {
          console.log(`Found conveyor tile at (${x}, ${y})`);
        }
      }
    }
    
    // Create the player at starting position
    const start = this.levelConfig.playerStart;
    this.isoPlayer = new IsometricPlayer(this, this.isoMap, 'robot', start.x, start.y, {
      scale: 2,
      zHeight: 8,
      highlightTile: true,
      highlightColor: 0x000080,
      moveDuration: 300,      // Animation speed (ms) - lower = faster movement
      moveDelay: 200,           // Delay between moves (ms) - higher = slower gameplay
      depth: 10000,
      frameOffset: 4,
      startDirection: start.direction
    });
    
    console.log(`Player created at (${start.x}, ${start.y}), direction: ${start.direction}`);
    console.log(`Player sprite frame: ${this.isoPlayer.sprite.frame.name}`);
    
    // Set up camera - use the same logic as zoom out for consistency
    this.resetCameraToDefault();
    
    // Spawn items at configured positions
    this.levelConfig.itemSpawns.forEach(spawn => {
      console.log(`Spawning ${spawn.spriteKey} at grid position (${spawn.x}, ${spawn.y})`);
      const screenPos = this.isoMap.gridToScreen(spawn.x, spawn.y, 20);
      console.log(`Screen position: (${screenPos.x}, ${screenPos.y})`);
      
      this.isoMap.spawnItem(spawn.spriteKey, spawn.x, spawn.y, {
        frame: spawn.frame,
        scale: spawn.scale,
        zHeight: 20,
        visualOffsetX: 0,
        visualOffsetY: 0,
        // Pass item attributes
        id: spawn.id,
        targetConveyorId: spawn.targetConveyorId,
        damaged: spawn.damaged,
        itemType: spawn.itemType
      });
    });
  }
  
  /**
   * DEBUG: Visualize specific grid positions with colored markers
   */
  debugVisualizePositions() {
    const positions = [
      { x: 0, y: 0, color: 0x00ff00, label: '(0,0) GREEN' },
      { x: 7, y: 7, color: 0xff0000, label: '(7,7) RED' },
      { x: 7, y: 0, color: 0x800080, label: '(7,0) PURPLE' }
    ];
    
    positions.forEach(pos => {
      const screenPos = this.isoMap.gridToScreen(pos.x, pos.y, 10);
      
      // Create a circle marker
      const circle = this.add.circle(screenPos.x, screenPos.y, 15, pos.color, 0.7);
      circle.setDepth(20000);
      
      // Add text label
      const text = this.add.text(screenPos.x, screenPos.y - 30, pos.label, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      });
      text.setOrigin(0.5);
      text.setDepth(20001);
      
      console.log(`Debug marker at grid (${pos.x}, ${pos.y}) -> screen (${screenPos.x}, ${screenPos.y})`);
    });
  }
  
  /**
   * Reset the level to initial state
   */
  async resetLevel() {
    // Reload level config from LevelManager in case it changed
    if (window.LevelManager) {
      this.levelConfig = await window.LevelManager.getCurrentLevel();
    }
    
    // Destroy existing entities
    if (this.isoPlayer) {
      this.isoPlayer.destroy();
      this.isoPlayer = null;
    }
    if (this.isoMap) {
      this.isoMap.destroy();
      this.isoMap = null;
    }
    
    // Reinitialize level
    this.initLevel();
  }
  
  /**
   * Load a new level (requires scene restart for new tilemap)
   */
  async loadNewLevel() {
    // Don't load game level for survey
    if (window.LevelManager && window.LevelManager.currentLevel === 'S') {
      console.log('Survey level - skipping game load');
      return;
    }
    
    // Reload level config from LevelManager
    if (window.LevelManager) {
      this.levelConfig = await window.LevelManager.getCurrentLevel();
      if (this.levelConfig) {
        console.log('Loading new level:', this.levelConfig.title);
      }
    }
    
    // Clear the cached tilemap to force reload
    if (this.cache.tilemap.exists('warehouse')) {
      this.cache.tilemap.remove('warehouse');
    }
    
    // Clear any existing map and player
    if (this.isoPlayer) {
      this.isoPlayer.destroy();
      this.isoPlayer = null;
    }
    if (this.isoMap) {
      this.isoMap.destroy();
      this.isoMap = null;
    }
    
    // Restart the scene to reload assets with new config
    this.scene.restart();
  }
  
  /**
   * Check if a position is a goal conveyor
   */
  isGoalConveyor(x, y) {
    return this.levelConfig.goalConveyors.some(goal => goal.x === x && goal.y === y);
  }
  
  /**
   * Get goal conveyor at position
   */
  getGoalConveyorAt(x, y) {
    return this.levelConfig.goalConveyors.find(goal => goal.x === x && goal.y === y);
  }
  
  /**
   * Check if all items are correctly placed on their target conveyors
   */
  checkAllItemsPlaced() {
    // Get all items that should be on conveyors
    const itemsOnConveyors = this.isoMap.items.filter(item => !item.isCarried);
    
    // If using target conveyors (items have targetConveyorId)
    const hasTargetedItems = this.levelConfig.itemSpawns.some(spawn => spawn.targetConveyorId);
    
    if (hasTargetedItems) {
      // Check if each item with a targetConveyorId is on its correct conveyor
      for (const item of itemsOnConveyors) {
        if (!item.targetConveyorId) continue;
        
        const goalConveyor = this.getGoalConveyorAt(item.gridX, item.gridY);
        if (!goalConveyor || goalConveyor.id !== item.targetConveyorId) {
          return false; // Item not on correct conveyor
        }
      }
      
      // Check that all goal conveyors have their items
      for (const goalConveyor of this.levelConfig.goalConveyors) {
        const itemOnConveyor = itemsOnConveyors.find(item => 
          item.gridX === goalConveyor.x && 
          item.gridY === goalConveyor.y &&
          item.targetConveyorId === goalConveyor.id
        );
        
        if (!itemOnConveyor) {
          return false; // Goal conveyor missing its item
        }
      }
      
      return true; // All items correctly placed
    } else {
      // Simple check: all items on goal conveyors
      return itemsOnConveyors.every(item => this.isGoalConveyor(item.gridX, item.gridY));
    }
  }
  
  /**
   * Check if a position is a conveyor belt
   */
  isConveyor(x, y) {
    return this.isoMap.hasTileAt(x, y, this.levelConfig.conveyorLayer);
  }
  
  /**
   * Check win/lose condition after dropping an item
   */
  checkDropCondition(x, y) {
    const currentLevel = window.LevelManager ? window.LevelManager.currentLevel : 1;
    
    // Check if this position is any conveyor belt
    if (!this.isConveyor(x, y)) {
      this.showMessage('❌ Game Over! You dropped the box in the wrong place.', 'fail');
      
      // Show lose modal after a short delay
      this.time.delayedCall(1000, () => {
        if (window.showResultModal) {
          window.showResultModal(false, currentLevel, 0);
        }
      });
      
      return 'lose';
    }
    return 'continue';
  }
  
  /**
   * Check if player reached the goal position (for tutorial levels without boxes)
   */
  checkGoalPosition() {
    if (!this.levelConfig.goalPosition || !this.isoPlayer) return;
    
    const goal = this.levelConfig.goalPosition;
    
    console.log(`Checking goal position - Player: (${this.isoPlayer.gridX}, ${this.isoPlayer.gridY}), Goal: (${goal.x}, ${goal.y})`);
    
    if (this.isoPlayer.gridX === goal.x && this.isoPlayer.gridY === goal.y) {
      const currentLevel = window.LevelManager ? window.LevelManager.currentLevel : 1;
      this.showMessage('🎉 Excellent! You reached the goal!', 'success');
      
      // Show win modal after a short delay
      this.time.delayedCall(1000, () => {
        if (window.showResultModal) {
          window.showResultModal(true, currentLevel, 0);
        }
      });
    }
  }
  
  /**
   * Show a message to the player
   */
  showMessage(text, type = 'info') {
    // Remove existing message if any
    if (this.messageText) {
      this.messageText.destroy();
    }
    
    // Create message text
    const color = type === 'success' ? '#00ff00' : type === 'fail' ? '#ff0000' : '#ffffff';
    this.messageText = this.add.text(400, 50, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: color,
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center'
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setDepth(100000);
    this.messageText.setScrollFactor(0); // Fixed to camera
    
    // Auto-remove after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this.messageText) {
        this.messageText.destroy();
        this.messageText = null;
      }
    });
  }
}

// ------------------ ACTION QUEUE + PUBLIC API ------------------
let game = null; // Will be set after game is created
const _queue = [];
let _running = false;
let _readyResolve;
const _ready = new Promise(res => {
  _readyResolve = res;
});

function _enqueue(label, fn) {
  return new Promise((resolve, reject) => {
    _queue.push({ label, fn, resolve, reject });
    _drain();
  });
}

async function _drain() {
  if (_running) return;
  _running = true;
  
  const scene = _getScene();
  if (scene) {
    scene.isMoving = true;
  }
  
  while (_queue.length) {
    const { label, fn, resolve, reject } = _queue.shift();
    try {
      const v = await fn();
      resolve(v);
    } catch (e) {
      console.error(`[GameAPI] Action failed: ${label}`, e);
      reject(e);
    }
  }
  
  _running = false;
  
  if (scene) {
    scene.isMoving = false;
  }
}

// Helper to get scene
function _getScene() {
  if (!game) return null;
  return game.scene.getScene('IsoMoveExample');
}

// ------------------ API Implementation ------------------

function _rotate(delta) {
  const scene = _getScene();
  if (!scene || !scene.isoPlayer) return Promise.resolve(false);
  return scene.isoPlayer.rotate(delta);
}

function _face(dirName) {
  return new Promise((resolve) => {
    const scene = _getScene();
    if (!scene || !scene.isoPlayer) return resolve(false);
    const result = scene.isoPlayer.face(dirName);
    scene.time.delayedCall(100, () => resolve(result));
  });
}

function _getForwardPosition(scene) {
  const player = scene.isoPlayer;
  let newX = player.gridX;
  let newY = player.gridY;
  
  switch (player.direction) {
    case 0: newX += 1; break; // South - toward increasing row (bottom-right)
    case 1: newY += 1; break; // East - toward increasing column (bottom-left)
    case 2: newY -= 1; break; // West - toward decreasing column (top-right)
    case 3: newX -= 1; break; // North - toward decreasing row (top-left)
  }
  
  return { x: newX, y: newY };
}

function _getBackwardPosition(scene) {
  const player = scene.isoPlayer;
  let newX = player.gridX;
  let newY = player.gridY;
  
  switch (player.direction) {
    case 0: newX -= 1; break; // South (go North) - toward decreasing row
    case 1: newY -= 1; break; // East (go West) - toward decreasing column
    case 2: newY += 1; break; // West (go East) - toward increasing column
    case 3: newX += 1; break; // North (go South) - toward increasing row
  }
  
  return { x: newX, y: newY };
}

function _isValidPosition(scene, x, y) {
  return x >= 0 && x < scene.gridWidth && y >= 0 && y < scene.gridHeight;
}

function _moveToPosition(scene, gridX, gridY) {
  if (!scene.isoPlayer) return Promise.resolve(false);
  return scene.isoPlayer.moveTo(gridX, gridY);
}

async function _multiStep(sign, steps) {
  const scene = _getScene();
  if (!scene || !scene.isoPlayer) return false;
  
  for (let i = 0; i < steps; i++) {
    const newPos = sign > 0 ? _getForwardPosition(scene) : _getBackwardPosition(scene);
    const ok = await _moveToPosition(scene, newPos.x, newPos.y);
    if (!ok) return false; // stop early if blocked
  }
  
  // After movement, check if we reached the goal (for tutorial levels)
  scene.checkGoalPosition();
  
  return true;
}

function _setPosition(tx, ty) {
  const scene = _getScene();
  if (!scene || !scene.isoPlayer) return Promise.resolve(false);
  return scene.isoPlayer.moveTo(tx, ty);
}

// Expose the API
window.GameAPI = {
  /** await GameAPI.ready() before issuing actions */
  ready: () => _ready,

  /** Movement & rotation (Promise-based) */
  rotateLeft: () => _enqueue('rotateLeft', async () => _rotate(-1)),  // Turn counterclockwise
  rotateRight: () => _enqueue('rotateRight', async () => _rotate(+1)), // Turn clockwise
  moveForward: (steps = 1) => _enqueue('moveForward', async () => _multiStep(+1, steps)),
  moveBackward: (steps = 1) => _enqueue('moveBackward', async () => _multiStep(-1, steps)),

  /** Item interaction */
  spawnItem: (spriteKey, gridX, gridY, config = {}) => {
    const scene = _getScene();
    if (!scene || !scene.isoMap) return null;
    return scene.isoMap.spawnItem(spriteKey, gridX, gridY, config);
  },
  
  pickupItem: () => _enqueue('pickupItem', async () => {
    const scene = _getScene();
    if (!scene || !scene.isoPlayer) return false;
    return scene.isoPlayer.pickupItem();
  }),
  
  dropItem: () => _enqueue('dropItem', async () => {
    const scene = _getScene();
    if (!scene || !scene.isoPlayer) return false;
    
    // Get the position where item will be dropped
    const pos = scene.isoPlayer.getPositionInFront();
    const result = scene.isoPlayer.dropItem();
    
    if (result) {
      // Check if dropped on wrong location (not a conveyor)
      const dropResult = scene.checkDropCondition(pos.x, pos.y);
      
      if (dropResult === 'lose') {
        return result; // Game over
      }
      
      // Check if all items are correctly placed
      if (scene.checkAllItemsPlaced()) {
        const currentLevel = window.LevelManager ? window.LevelManager.currentLevel : 1;
        scene.showMessage('🎉 Congratulations! All boxes delivered correctly!', 'success');
        
        // Show win modal after a short delay
        scene.time.delayedCall(1000, () => {
          if (window.showResultModal) {
            window.showResultModal(true, currentLevel, 0);
          }
        });
      }
    }
    
    return result;
  }),
  
  isCarryingItem: () => {
    const scene = _getScene();
    if (!scene || !scene.isoPlayer) return false;
    return scene.isoPlayer.isCarryingItem();
  },

  /** Utilities */
  face: (dirName) => _enqueue('face', async () => _face(dirName)),
  setPosition: (tx, ty) => _enqueue('setPosition', async () => _setPosition(tx, ty)),
  
  /** Level management */
  resetLevel: () => {
    const scene = _getScene();
    if (!scene) return;
    scene.resetLevel();
  },
  
  loadNewLevel: () => {
    const scene = _getScene();
    if (!scene) return;
    scene.loadNewLevel();
  },

  /** Read-only state (no promises needed) */
  getState: () => {
    const scene = _getScene();
    if (!scene || !scene.isoPlayer) return null;
    return scene.isoPlayer.getState();
  }
};

// Create the game after API is defined
let config = {
  type: window.Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  parent: 'game-canvas',
  scene: IsoMoveExample,
  physics: {
    default: 'arcade'
  }
};

game = new window.Phaser.Game(config);