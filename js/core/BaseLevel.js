/**
 * BaseLevel - Abstract base class for all levels
 * Provides common functionality and structure for level definitions
 */

export class BaseLevel {
  constructor(levelId) {
    this.levelId = levelId;
    
    // Level metadata (to be overridden)
    this.title = "Untitled Level";
    this.instructions = "No instructions provided.";
    this.hints = [];
    
    // Map configuration
    this.mapFile = null;
    this.conveyorLayer = 'Tile Layer 2';
    
    // Game state
    this.playerStart = { x: 0, y: 0, direction: 0 };
    this.itemSpawns = [];
    this.goalConveyors = [];
    this.goalPosition = null; // For tutorial levels without conveyors
    
    // Blockly configuration
    this.allowedBlocks = []; // Which blocks are available in this level
    this.customBlocks = []; // Custom blocks specific to this level
    this.toolboxCategories = null; // Custom toolbox structure (null = use default)
    
    // Victory conditions
    this.victoryConditions = {
      type: 'conveyor', // 'conveyor', 'position', 'custom'
      customCheck: null // Custom victory check function
    };
    
    // Advanced features
    this.hasInspection = false; // Can inspect items
    this.hasBranching = false; // Has conditional logic
    this.hasVariables = false; // Can use variables
    this.hasFunctions = false; // Can define functions
  }
  
  /**
   * Initialize the level - called when level loads
   * Override this to set up level-specific configuration
   */
  init() {
    // To be overridden by subclasses
  }
  
  /**
   * Get the complete level configuration
   */
  getConfig() {
    return {
      title: this.title,
      instructions: this.instructions,
      hints: this.hints,
      mapFile: this.mapFile,
      playerStart: this.playerStart,
      itemSpawns: this.itemSpawns,
      goalConveyors: this.goalConveyors,
      goalPosition: this.goalPosition,
      conveyorLayer: this.conveyorLayer,
      allowedBlocks: this.allowedBlocks,
      customBlocks: this.customBlocks,
      toolboxCategories: this.toolboxCategories,
      victoryConditions: this.victoryConditions,
      hasInspection: this.hasInspection,
      hasBranching: this.hasBranching,
      hasVariables: this.hasVariables,
      hasFunctions: this.hasFunctions
    };
  }
  
  /**
   * Check if victory condition is met
   * Can be overridden for custom victory logic
   */
  checkVictory(scene, position) {
    if (this.victoryConditions.customCheck) {
      return this.victoryConditions.customCheck(scene, position);
    }
    
    // Default checks
    if (this.victoryConditions.type === 'position' && this.goalPosition) {
      return position.x === this.goalPosition.x && position.y === this.goalPosition.y;
    }
    
    return false; // Default to false, conveyor check handled by scene
  }
  
  /**
   * Called when level is completed
   * Override for level-specific completion logic
   */
  onComplete(scene) {
    // To be overridden by subclasses
  }
  
  /**
   * Called when level is reset
   * Override for level-specific reset logic
   */
  onReset(scene) {
    // To be overridden by subclasses
  }
  
  /**
   * Get custom blocks for this level
   * Override to add level-specific blocks
   */
  getCustomBlockDefinitions() {
    return this.customBlocks;
  }
  
  /**
   * Get custom block generators for this level
   * Override to add level-specific code generators
   */
  getCustomBlockGenerators() {
    return {};
  }
}
