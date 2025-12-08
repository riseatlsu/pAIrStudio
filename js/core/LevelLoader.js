/**
 * LevelLoader - Dynamic level loading system
 * Handles importing and instantiating level classes
 */

export class LevelLoader {
  constructor() {
    this.levels = new Map();
    this.levelClasses = new Map();
  }
  
  /**
   * Register all available levels
   */
  async registerLevels() {
    // Import level classes dynamically
    const levelModules = {
      'A': () => import('../levels/TutorialA.js'),
      'B': () => import('../levels/TutorialB.js'),
      'C': () => import('../levels/TutorialC.js'),
      '1': () => import('../levels/Level1.js'),
      '2': () => import('../levels/Level2.js'),
      '3': () => import('../levels/Level3.js'),
      '4': () => import('../levels/Level4.js'),
      '5': () => import('../levels/Level5.js'),
      '6': () => import('../levels/Level6.js'),
      '7': () => import('../levels/Level7.js'),
      '8': () => import('../levels/Level8.js')
    };
    
    // Store module loaders
    for (const [levelId, loader] of Object.entries(levelModules)) {
      this.levelClasses.set(levelId, loader);
    }
  }
  
  /**
   * Load a specific level
   * @param {string} levelId - Level identifier ('A', 'B', 'C', '1'-'8')
   * @returns {Promise<BaseLevel>} Level instance
   */
  async loadLevel(levelId) {
    // Return cached instance if exists
    if (this.levels.has(levelId)) {
      return this.levels.get(levelId);
    }
    
    // Check if level exists
    if (!this.levelClasses.has(levelId)) {
      throw new Error(`Level ${levelId} not found`);
    }
    
    try {
      // Dynamically import the level module
      const loader = this.levelClasses.get(levelId);
      const module = await loader();
      
      // Get the class name (TutorialA, TutorialB, Level1, etc.)
      const className = this.getLevelClassName(levelId);
      const LevelClass = module[className];
      
      if (!LevelClass) {
        throw new Error(`Level class ${className} not found in module`);
      }
      
      // Instantiate the level
      const level = new LevelClass();
      
      // Cache the instance
      this.levels.set(levelId, level);
      
      return level;
    } catch (error) {
      console.error(`Failed to load level ${levelId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get level class name from ID
   * @param {string} levelId
   * @returns {string} Class name
   */
  getLevelClassName(levelId) {
    const tutorials = { 'A': 'TutorialA', 'B': 'TutorialB', 'C': 'TutorialC' };
    
    if (tutorials[levelId]) {
      return tutorials[levelId];
    }
    
    return `Level${levelId}`;
  }
  
  /**
   * Get level config without full instantiation
   * @param {string} levelId
   * @returns {Promise<Object>} Level configuration
   */
  async getLevelConfig(levelId) {
    const level = await this.loadLevel(levelId);
    return level.getConfig();
  }
  
  /**
   * Clear cached level instances
   */
  clearCache() {
    this.levels.clear();
  }
  
  /**
   * Get all available level IDs
   * @returns {Array<string>}
   */
  getAvailableLevels() {
    return Array.from(this.levelClasses.keys());
  }
  
  /**
   * Check if a level exists
   * @param {string} levelId
   * @returns {boolean}
   */
  hasLevel(levelId) {
    return this.levelClasses.has(levelId);
  }
}

// Create singleton instance
export const levelLoader = new LevelLoader();
