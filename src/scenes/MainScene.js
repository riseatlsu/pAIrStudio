import Phaser from 'phaser';

import { IsoBoard } from '../game/iso/IsoBoard';
import { IsoPlayer } from '../game/iso/IsoPlayer';
import { LevelBuilder } from '../game/levels/LevelBuilder';
import { LevelManager } from '../game/levels/LevelManager';
import { getLevel } from '../game/levels/index';
import { gridToScreen } from '../game/iso/IsoUtils';

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.levelManager = new LevelManager();
  }

  preload() {
    // Load Assets - resolve base path for GitHub Pages compatibility
    const basePath = import.meta.env?.BASE_URL || '/';
    const sanitizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    this.load.setPath(`${sanitizedBase}/assets`);
    
    // 1. Isometric Tiles (Floor=0, Conveyor=1)
    this.load.spritesheet('tiles', 'fixes_factory.png', { 
        frameWidth: 64, 
        frameHeight: 32 
    });

    // 2. Robot (Rows for different types, Cols for direction)
    // Frame Width: 24, Height: 16
    this.load.spritesheet('robot', 'Robot_TileSet.png', { 
        frameWidth: 24, 
        frameHeight: 16 
    });

    // 3. Boxes
    // Frame Width: 22, Height: 21
    this.load.spritesheet('box', 'box.png', { 
        frameWidth: 22, 
        frameHeight: 21 
    });
  }

  create() {
    // Initialize Board System
    this.isoBoard = new IsoBoard(this, {
        tileWidth: 64,
        tileHeight: 32,
        width: 10,
        height: 10
    });

    // Initialize Level Builder
    this.levelBuilder = new LevelBuilder(this, this.isoBoard, {
        floor: { key: 'tiles', frame: 0 },
        conveyor: { key: 'tiles', frame: 1 },
        robot: { key: 'robot', frameOffset: 0 }, 
        box: { key: 'box', frame: 0 }
    });

    // Make LevelManager globally available
    window.LevelManager = this.levelManager;
    
    // Make scene available globally for survey access
    window.phaser_scene = this;
    
    // Set level progression based on assigned group (if already assigned)
    if (window.experimentManager && window.experimentManager.groupId) {
        this.levelManager.setLevelProgression(window.experimentManager.groupId);
    }

    // Load the saved current level (or first level in progression if first time)
    const savedLevel = this.levelManager.getCurrentLevel();
    
    // Use loadLevelById to ensure chatbot initialization happens if needed
    this.levelManager.loadLevelById(savedLevel);

    // Handle Resize Events to keep board centered
    this.scale.on('resize', (gameSize) => {
        this.cameras.resize(gameSize.width, gameSize.height);
        this.centerCamera();
    });

    // Camera Controls - Pan & Zoom
    this.input.on('pointermove', (pointer) => {
        if (!pointer.isDown) return;

        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
    });

    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        const newZoom = this.cameras.main.zoom - deltaY * 0.001;
        this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.5, 3.0));
    });
  }

  loadLevel(levelId) {
      // 1. Clear existing board state
      if (this.isoBoard) {
          this.isoBoard.clear();
      }
      
      // 2. Clear existing player
      if (this.player) {
          // IsoPlayer.destroy() might not exist or might just destroy sprite. 
          // Since board.clear() destroyed the sprite, we just null the ref.
          this.player = null; 
      }
      
      const config = getLevel(levelId);
      if (!config) {
          console.error(`Level ${levelId} not found!`);
          return;
      }

      console.log(`Loading Level: ${config.title}`);

      // Set current level FIRST
      this.levelManager.currentLevelId = levelId;
      
      // Register level with LevelManager
      this.levelManager.registerLevel(config);

      // Build the level
      const playerConfig = this.levelBuilder.build(config);

      // Spawn Player
      this.player = new IsoPlayer(this, this.isoBoard, playerConfig.startRow, playerConfig.startCol, 'robot', {
          direction: playerConfig.startDir,
          scale: playerConfig.scale // Apply scale from config
      });

      // Add player to the board's sprite list so updateDepth() sees it
      this.isoBoard.allSprites.push(this.player.sprite);
      this.isoBoard.moveableObjects.push(this.player);

      // Register level as current
      this.levelManager.currentLevelId = levelId;

      // Center Camera on the Board
      this.centerCamera();
  }

  centerCamera() {
      if (!this.isoBoard) return;

      // Calculate geometric center of the specific board dimensions
      const midGridX = (this.isoBoard.mapWidth - 1) / 2;
      const midGridY = (this.isoBoard.mapHeight - 1) / 2;
      const centerPos = gridToScreen(midGridX, midGridY, this.isoBoard.tileWidth, this.isoBoard.tileHeight, 0);

      // Calculate Board Dimensions in Screen Space
      // Projection Width = (Rows + Cols) * (TileWidth / 2)
      const isoWidth = (this.isoBoard.mapWidth + this.isoBoard.mapHeight) * (this.isoBoard.tileWidth / 2);
      const isoHeight = (this.isoBoard.mapWidth + this.isoBoard.mapHeight) * (this.isoBoard.tileHeight / 2);

      // Get Viewport Dimensions
      const screenWidth = this.cameras.main.width;
      const screenHeight = this.cameras.main.height;

      // Calculate optimal zoom to fit ~95% of the screen (corners touch edges)
      const zoomX = screenWidth / isoWidth;
      const zoomY = screenHeight / isoHeight;
      const zoom = Math.min(zoomX, zoomY) * 0.95;

      // Clamp Zoom to reasonable values
      const finalZoom = Phaser.Math.Clamp(zoom, 0.5, 3.0);

      // Apply
      this.cameras.main.centerOn(centerPos.x, centerPos.y);
      this.cameras.main.setZoom(finalZoom);
  }

  update() {
    if (this.isoBoard) {
        this.isoBoard.updateDepth();
    }
  }
}
