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

        // Extract level number from ID (only for numbered levels)
        const numberMatch = levelId.match(/\d+/);
        if (!numberMatch) {
            // Not a numbered level (e.g., tutorial_A) - don't change role
            console.log('RoleManager: Non-numbered level, keeping current role');
            return;
        }

        const levelNumber = parseInt(numberMatch[0], 10);
        this.currentLevel = levelNumber;

        // Determine role based on odd/even and initial role
        // If started as driver: drive on odd (1,3,5), navigate on even (2,4,6)
        // If started as navigator: navigate on odd (1,3,5), drive on even (2,4,6)
        const shouldBeDriver = (this.initialRole === 'driver') ? (levelNumber % 2 === 1) : (levelNumber % 2 === 0);
        const targetRole = shouldBeDriver ? 'driver' : 'navigator';

        // Only switch if role needs to change
        if (this.currentRole !== targetRole) {
            this.currentRole = targetRole;
            this.updateRoleBadge();
            this.updateBlocklyLock();
            console.log(`RoleManager: Level ${levelNumber} - Role is now ${this.currentRole}`);
            
            // Notify callback (e.g., ChatbotManager)
            if (this.onRoleChangeCallback) {
                this.onRoleChangeCallback(this.currentRole);
            }
        }
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

        // Navigator can code (unlocked), AI is driver (locked)
        if (this.currentRole === 'navigator') {
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
            overlay.style.display = 'flex';
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
