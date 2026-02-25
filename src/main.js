/**
 * @fileoverview main.js - Application entry point for pAIrStudio.
 * Initializes Phaser game engine, Blockly workspace, and global managers.
 * @module main
 */

import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { BlocklyManager } from './game/blockly/BlocklyManager';
import { experimentManager } from './experiment/ExperimentManager.js';
import { chatbotManager } from './chatbot/ChatbotManager.js';
import { roleManager } from './chatbot/RoleManager.js';
import dataLogger from './utils/DataLogger.js';

const config = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  parent: 'game-canvas',
  transparent: true,
  pixelArt: true, // Fixes blurry scaling
  scale: {
    mode: Phaser.Scale.RESIZE, // Fill the container
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MainScene],
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 }
      }
  }
};

const game = new Phaser.Game(config);
window.game = game; // Expose for GameAPI

// Initialize Blockly
const blocklyManager = new BlocklyManager();

function initializeUI() {
    console.log('🚀 Initializing pAIrStudio...');
    
    // Expose DataLogger globally (but don't initialize until consent)
    window.dataLogger = dataLogger;
    
    // Note: DataLogger, Chatbot, and RoleManager are initialized in index.html after consent
    // to ensure they initialize after group assignment and user has accepted terms
    
    // Init Blockly Workspace
    blocklyManager.init('blockly-workspace');

    // Bind Buttons
    const runBtn = document.getElementById('run-code-btn');
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            blocklyManager.runCode();
        });
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
             // Reset Level via GameAPI helper or Scene logic
             import('./game/blockly/GameAPI').then(m => m.GameAPI.resetLevel());
        });
    }
    
    console.log('✅ pAIrStudio initialization complete');
}

// Initialize immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUI);
} else {
    // DOM already loaded (e.g., when dynamically imported in sandbox mode)
    initializeUI();
}

// Export managers for global access
window.ChatbotManager = chatbotManager;
window.RoleManager = roleManager;
window.ExperimentManager = experimentManager;
window.blocklyManager = blocklyManager;

// Also export lowercase for consistency
window.chatbotManager = chatbotManager;
window.roleManager = roleManager;
window.experimentManager = experimentManager;
