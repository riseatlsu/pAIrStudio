/**
 * Level Manager
 * Handles level progression, state management, and level configuration
 * Refactored to use modular level system
 */

import { levelLoader } from './core/LevelLoader.js';

class LevelManager {
  constructor() {
    // Restore saved progress or start at tutorial level A
    const progress = this.getProgress();
    this.currentLevel = progress.currentLevel || 'A';
    this.tutorialLevels = ['A', 'B', 'C'];
    /// Set your amount of levels here
    this.maxLevels = 2;
    this.allLevels = [
      ...this.tutorialLevels, 
      ...Array.from({length: this.maxLevels}, (_, i) => (i + 1).toString()),
      'S' // Survey
    ];
    
    // Initialize level loader
    this.levelLoader = levelLoader;
    this.levelLoader.registerLevels();
    
    // Cache for current level instance
    this.currentLevelInstance = null;
  }

  /**
   * Get current level configuration
   * @returns {Promise<Object>} Level configuration
   */
  async getCurrentLevel() {
    // Survey is not a game level
    if (this.currentLevel === 'S') {
      return null;
    }
    if (!this.currentLevelInstance || this.currentLevelInstance.id !== this.currentLevel) {
      this.currentLevelInstance = await this.levelLoader.loadLevel(this.currentLevel);
    }
    return this.currentLevelInstance.getConfig();
  }

  /**
   * Get current level instance
   * @returns {Promise<BaseLevel>} Level instance
   */
  async getCurrentLevelInstance() {
    // Survey is not a game level
    if (this.currentLevel === 'S') {
      return null;
    }
    if (!this.currentLevelInstance || this.currentLevelInstance.id !== this.currentLevel) {
      this.currentLevelInstance = await this.levelLoader.loadLevel(this.currentLevel);
    }
    return this.currentLevelInstance;
  }

  /**
   * Get level configuration by ID
   * @param {string} levelId - Level identifier
   * @returns {Promise<Object>} Level configuration
   */
  async getLevel(levelId) {
    return await this.levelLoader.getLevelConfig(levelId);
  }

  /**
   * Get level instance by ID
   * @param {string} levelId - Level identifier
   * @returns {Promise<BaseLevel>} Level instance
   */
  async getLevelInstance(levelId) {
    return await this.levelLoader.loadLevel(levelId);
  }

  /**
   * Advance to next level
   */
  nextLevel() {
    const currentIndex = this.allLevels.indexOf(this.currentLevel);
    if (currentIndex < this.allLevels.length - 1) {
      this.currentLevel = this.allLevels[currentIndex + 1];
      this.saveProgress();
      return true;
    }
    return false;
  }

  /**
   * Go to specific level
   */
  goToLevel(level) {
    if (this.allLevels.includes(level)) {
      this.currentLevel = level;
      this.saveProgress();
      return true;
    }
    return false;
  }

  /**
   * Mark level as completed
   */
  completeLevel(levelNumber) {
    const progress = this.getProgress();
    if (!progress.completed.includes(levelNumber)) {
      progress.completed.push(levelNumber);
      progress.completed.sort((a, b) => a - b);
      this.saveProgressData(progress);
    }
  }

  /**
   * Get progress data
   */
  getProgress() {
    try {
      const saved = localStorage.getItem('level_progress');
      return saved ? JSON.parse(saved) : { currentLevel: 'A', completed: [] };
    } catch (e) {
      return { currentLevel: 'A', completed: [] };
    }
  }

  /**
   * Save progress
   */
  saveProgress() {
    const progress = this.getProgress();
    progress.currentLevel = this.currentLevel;
    this.saveProgressData(progress);
  }

  /**
   * Save progress data to localStorage
   */
  saveProgressData(progress) {
    try {
      localStorage.setItem('level_progress', JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }

  /**
   * Update UI with level progress
   */
  async updateProgressUI() {
    const progress = this.getProgress();
    const currentIndex = this.allLevels.indexOf(this.currentLevel);
    
    console.log('Updating UI - Current:', this.currentLevel, 'Completed:', progress.completed);
    
    // Hide game interface if we're on the survey level
    if (this.currentLevel === 'S') {
      this.hideGameInterface();
      // Show survey modal if we're on the survey level
      if (window.showSurveyModal) {
        // Delay slightly to ensure DOM is ready
        setTimeout(() => window.showSurveyModal(), 100);
      }
    } else {
      this.showGameInterface();
    }
    
    // Get or create level progress container
    const container = document.getElementById('level-progress-container');
    if (!container) {
      console.warn('Level progress container not found');
      return;
    }
    
    // Clear existing indicators
    container.innerHTML = '';
    
    // Generate level indicators dynamically
    this.allLevels.forEach((level, index) => {
      // Add divider after tutorial levels
      if (index === this.tutorialLevels.length) {
        const divider = document.createElement('div');
        divider.className = 'level-divider';
        container.appendChild(divider);
      }
      
      // Add divider before survey
      if (level === 'S' && index > 0) {
        const divider = document.createElement('div');
        divider.className = 'level-divider';
        container.appendChild(divider);
      }
      
      // Create level circle
      const circle = document.createElement('div');
      circle.className = 'level-circle';
      circle.textContent = level;
      
      // Add tutorial class for tutorial levels
      if (this.tutorialLevels.includes(level)) {
        circle.classList.add('tutorial');
      }
      
      // Add survey class for survey
      if (level === 'S') {
        circle.classList.add('survey');
      }
      
      // Set state classes
      if (level === this.currentLevel) {
        circle.classList.add('active');
      } else if (progress.completed.includes(level)) {
        circle.classList.add('completed');
      } else if (level === 'S') {
        // Survey is only accessible if all other levels are completed
        const requiredLevels = this.allLevels.filter(l => l !== 'S');
        const allCompleted = requiredLevels.every(l => progress.completed.includes(l));
        if (!allCompleted) {
          circle.classList.add('locked');
        }
      } else if (index > currentIndex + 1 || (currentIndex >= 0 && index > currentIndex && !progress.completed.includes(this.allLevels[currentIndex]))) {
        // Lock levels beyond the next available level
        circle.classList.add('locked');
      }
      
      // Add click handler for level navigation
      circle.addEventListener('click', () => {
        let canAccess = false;
        
        if (level === 'S') {
          // Survey requires all other levels to be completed
          const requiredLevels = this.allLevels.filter(l => l !== 'S');
          canAccess = requiredLevels.every(l => progress.completed.includes(l));
          
          if (canAccess && level !== this.currentLevel) {
            this.goToLevel(level);
            this.showSurvey();
          } else if (!canAccess) {
            alert('Complete all levels before accessing the survey!');
          }
        } else {
          canAccess = level === this.tutorialLevels[0] || 
                      progress.completed.includes(level) ||
                      (index <= currentIndex + 1 && progress.completed.includes(this.currentLevel));
          
          if (canAccess && level !== this.currentLevel) {
            console.log(`Switching from level ${this.currentLevel} to level ${level}`);
            
            // Show game interface if coming from survey
            if (this.currentLevel === 'S') {
              this.showGameInterface();
            }
            
            this.goToLevel(level);
            this.updateProgressUI();
            
            // Update Blockly toolbox for new level
            if (window.updateBlocklyToolbox) {
              window.updateBlocklyToolbox();
            }
            
            // Reload the game scene with the new level
            if (window.GameAPI) {
              window.GameAPI.loadNewLevel();
            }
          } else if (!canAccess) {
            alert('Complete the previous levels first to unlock this level!');
          }
        }
      });
      
      container.appendChild(circle);
    });

    // Update instructions - now async
    try {
      if (this.currentLevel === 'S') {
        // Survey instructions
        const titleEl = document.querySelector('.instructions-title');
        const textEl = document.querySelector('.instructions-text');
        
        if (titleEl) {
          titleEl.innerHTML = '<i class="fas fa-clipboard-list"></i> Post-Experiment Survey';
        }
        if (textEl) {
          textEl.textContent = 'Thank you for completing all levels! Please take a moment to complete this survey about your experience.';
        }
      } else {
        const levelConfig = await this.getCurrentLevel();
        const titleEl = document.querySelector('.instructions-title');
        const textEl = document.querySelector('.instructions-text');
        
        if (titleEl && levelConfig) {
          titleEl.innerHTML = `<i class="fas fa-info-circle"></i> ${levelConfig.title}`;
        }
        if (textEl && levelConfig) {
          textEl.textContent = levelConfig.instructions;
        }
      }
    } catch (error) {
      console.error('Error updating instructions UI:', error);
    }
  }
  
  /**
   * Show survey modal
   */
  showSurvey() {
    // Hide game interface elements
    this.hideGameInterface();
    
    if (window.showSurveyModal) {
      window.showSurveyModal();
    } else {
      console.error('Survey modal function not found');
    }
  }
  
  /**
   * Hide game interface when showing survey
   */
  hideGameInterface() {
    const gamePanel = document.querySelector('.game-panel');
    const blocklyPanel = document.querySelector('.blockly-panel');
    const chatbot = document.getElementById('chatbot');
    
    if (gamePanel) gamePanel.style.display = 'none';
    if (blocklyPanel) blocklyPanel.style.display = 'none';
    if (chatbot) chatbot.style.display = 'none';
  }
  
  /**
   * Show game interface when leaving survey
   */
  showGameInterface() {
    const gamePanel = document.querySelector('.game-panel');
    const blocklyPanel = document.querySelector('.blockly-panel');
    const chatbot = document.getElementById('chatbot');
    
    if (gamePanel) gamePanel.style.display = '';
    if (blocklyPanel) blocklyPanel.style.display = '';
    if (chatbot) chatbot.style.display = '';
  }
}

// Initialize level manager
window.LevelManager = new LevelManager();
