/**
 * RoleManager.js
 * Manages driver/navigator role switching for pair programming experimental groups
 * Handles role badge UI and blockly workspace locking based on role
 */

class RoleManager {
    constructor() {
        this.experimentManager = null;
        this.currentRole = null; // 'driver' or 'navigator'
        this.initialRole = null; // Starting role (doesn't change)
        this.currentLevel = 1; // Track level number for role switching
        this.isPairProgrammingMode = false;
        this.onRoleChangeCallback = null;
    }

    /**
     * Initialize the role manager
     * @param {Object} experimentManager - Reference to ExperimentManager
     */
    initialize(experimentManager) {
        this.experimentManager = experimentManager;

        // Check if in pair programming mode
        const hasRoleSwitching = this.experimentManager.hasFeature('roleSwitching');
        
        if (!hasRoleSwitching) {
            this.isPairProgrammingMode = false;
            this.hideRoleBadge();
            this.unlockBlockly();
            console.log('RoleManager: Not in pair programming mode');
            return;
        }

        this.isPairProgrammingMode = true;

        // Determine initial role based on experimental group
        const group = this.experimentManager.getCurrentGroup();
        
        // Group names from cookies are lowercase (pair_driver, pair_navigator)
        const normalizedGroup = group.toUpperCase();
        
        if (normalizedGroup === 'PAIR_DRIVER') {
            this.initialRole = 'driver';
        } else if (normalizedGroup === 'PAIR_NAVIGATOR') {
            this.initialRole = 'navigator';
        } else {
            console.warn('RoleManager: Unknown pair programming group', group);
            this.initialRole = 'driver'; // Default
        }

        this.currentRole = this.initialRole;
        this.currentLevel = 1;

        // Initialize UI
        this.updateRoleBadge();
        this.updateBlocklyLock();

        console.log(`RoleManager: Initialized with role ${this.currentRole} (group: ${group})`);
    }

    /**
     * Get current role
     * @returns {string} 'driver' or 'navigator'
     */
    getCurrentRole() {
        return this.currentRole;
    }

    /**
     * Check if user is currently the driver
     * @returns {boolean}
     */
    isDriver() {
        return this.currentRole === 'driver';
    }

    /**
     * Check if user is currently the navigator
     * @returns {boolean}
     */
    isNavigator() {
        return this.currentRole === 'navigator';
    }

    /**
     * Switch roles (called when advancing to next level)
     */
    switchRole() {
        if (!this.isPairProgrammingMode) return;

        // Toggle role
        this.currentRole = this.currentRole === 'driver' ? 'navigator' : 'driver';
        
        console.log(`RoleManager: Switched role to ${this.currentRole}`);

        // Update UI
        this.updateRoleBadge();
        this.updateBlocklyLock();

        // Notify callback (e.g., ChatbotManager)
        if (this.onRoleChangeCallback) {
            this.onRoleChangeCallback(this.currentRole);
        }

        // Log role switch
        if (typeof window.logRoleSwitch === 'function') {
            window.logRoleSwitch(this.currentRole, this.currentLevel);
        }
    }

    /**
     * Advance to next level and update role based on odd/even
     * @param {string} levelId - New level ID (e.g., 'level_001', 'tutorial_A')
     */
    advanceToLevel(levelId) {
        if (!this.isPairProgrammingMode) return;

        this.currentLevel = 0; // Default if not numbered

        // Extract level number from ID (only for numbered levels)
        const numberMatch = levelId.match(/\d+/);
        
        if (numberMatch) {
            const levelNumber = parseInt(numberMatch[0], 10);
            this.currentLevel = levelNumber;

            // Determine role based on odd/even and initial role
            // If started as driver: drive on odd (1,3,5), navigate on even (2,4,6)
            // If started as navigator: navigate on odd (1,3,5), drive on even (2,4,6)
            const shouldBeDriver = (this.initialRole === 'driver') ? (levelNumber % 2 === 1) : (levelNumber % 2 === 0);
            const targetRole = shouldBeDriver ? 'driver' : 'navigator';

            // Switch role if needed
            if (this.currentRole !== targetRole) {
                this.currentRole = targetRole;
                this.updateRoleBadge();
                console.log(`RoleManager: Level ${levelNumber} - Role is now ${this.currentRole}`);
                
                // Notify callback (e.g., ChatbotManager)
                if (this.onRoleChangeCallback) {
                    this.onRoleChangeCallback(this.currentRole);
                }
            }
        } else {
            console.log('RoleManager: Non-numbered level, keeping current role');
        }

        // ALWAYS update the lock state when entering a new level
        // This is critical because some levels (like tutorials) might disable the chatbot
        // and force an unlock, regardless of the role
        this.updateBlocklyLock();
    }

    /**
     * Update role badge UI
     */
    updateRoleBadge() {
        // Role is now integrated into instructions, so hide the floating badge
        this.hideRoleBadge();
        
        // Update instructions UI if LevelManager is available
        if (window.LevelManager && window.LevelManager.currentLevelId) {
            window.LevelManager.updateInstructionsUI(window.LevelManager.currentLevelId);
        }
    }

    /**
     * Hide role badge
     */
    hideRoleBadge() {
        const badge = document.getElementById('role-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }

    /**
     * Update blockly workspace lock state based on role
     */
    updateBlocklyLock() {
        if (!this.isPairProgrammingMode) {
            this.unlockBlockly();
            return;
        }

        // CRITICAL CHECK: If chatbot is disabled for this level (e.g. Tutorial A/B or Baseline),
        // we MUST unlock the workspace regardless of role so the user can complete the level.
        if (window.LevelManager && window.LevelManager.currentLevelId) {
            const levelId = window.LevelManager.currentLevelId;
            const levelConfig = window.LevelManager.levels[levelId];
            
            // Tutorial C teaches chatbot usage; always allow workspace interaction
            if (levelId === 'tutorial_C') {
                console.log('RoleManager: Tutorial C - Forcing unlock');
                this.unlockBlockly();
                return;
            }
            
            // If explicit false, unlock it. (undefined usually implies true/default)
            if (levelConfig && levelConfig.chatbotEnabled === false) {
                console.log('RoleManager: Level has chatbot disabled - Forcing unlock');
                this.unlockBlockly();
                return;
            }
        }

        // If User is Driver -> Unlocked (User writes code)
        // If User is Navigator -> Locked (AI writes code)
        if (this.currentRole === 'driver') {
            this.unlockBlockly();
        } else {
            this.lockBlockly();
        }
    }

    /**
     * Lock blockly workspace (when AI is driver)
     */
    lockBlockly() {
        const overlay = document.getElementById('blockly-lock-overlay');
        if (overlay) {
            // Keep workspace visible; do not occlude when AI is driver
            overlay.style.display = 'none';
        }

        // Disable workspace interaction
        if (window.blocklyWorkspace) {
            // Note: Blockly doesn't have a built-in disable, but we use the overlay to prevent interaction
            console.log('RoleManager: Blockly locked (AI is driver)');
        }
    }

    /**
     * Unlock blockly workspace (when user is driver)
     */
    unlockBlockly() {
        const overlay = document.getElementById('blockly-lock-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }

        console.log('RoleManager: Blockly unlocked (user is driver)');
    }

    /**
     * Get role prompt context for chatbot
     * @returns {Object} Role context
     */
    getRolePromptContext() {
        if (!this.isPairProgrammingMode) return null;

        return {
            currentRole: this.currentRole,
            initialRole: this.initialRole,
            levelNumber: this.currentLevel,
            isDriver: this.isDriver(),
            isNavigator: this.isNavigator()
        };
    }

    /**
     * Set callback for role change events
     * @param {Function} callback - Callback function (receives new role as parameter)
     */
    onRoleChange(callback) {
        this.onRoleChangeCallback = callback;
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.currentRole = this.initialRole;
        this.currentLevel = 1;
        this.updateRoleBadge();
        this.updateBlocklyLock();
    }
}

// Create singleton instance
const roleManager = new RoleManager();

// Export singleton
export default roleManager;
export { roleManager };

// Make available globally for non-module scripts
window.RoleManager = roleManager;
