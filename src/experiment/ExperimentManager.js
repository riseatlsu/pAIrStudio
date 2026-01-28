import { GROUPS, GROUP_FEATURES, ASSIGNMENT_WEIGHTS } from './GroupConfig.js';

/**
 * Manages experimental group assignment, persistence, and feature flags.
 */
export class ExperimentManager {
    constructor() {
        this.groupId = null;
        this.participantId = null;
        this.features = null;
        this.sandboxMode = false;
    }

    /**
     * Initialize the manager. Checks for existing cookies.
     * Does NOT assign a group if one doesn't exist (use assignGroup() for that).
     */
    initialize() {
        this.groupId = this.getCookie('pair_group');
        this.participantId = this.getCookie('pair_participant_id');
        
        if (this.groupId) {
            this.features = GROUP_FEATURES[this.groupId];
            console.log(`ExperimentManager: Loaded existing group '${this.groupId}'`);
        } else {
            console.log('ExperimentManager: No group assigned yet.');
        }

        if (this.participantId) {
            console.log(`ExperimentManager: Participant ID '${this.participantId}'`);
        }
    }

    /**
     * Randomly assigns a group based on configured weights.
     * Saves the result to a cookie (expiry: 30 days).
     * @returns {string} The assigned group ID
     */
    assignGroup() {
        if (this.groupId) {
            console.warn('ExperimentManager: Group already assigned:', this.groupId);
            return this.groupId;
        }

        // Weighted Random Selection
        const totalWeight = ASSIGNMENT_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        let selectedGroupId = GROUPS.CONTROL; // Default fallback

        for (const item of ASSIGNMENT_WEIGHTS) {
            if (random < item.weight) {
                selectedGroupId = item.id;
                break;
            }
            random -= item.weight;
        }

        this.setGroup(selectedGroupId);
        
        // Generate Participant ID if missing
        if (!this.participantId) {
            this.participantId = 'cnt_' + Math.random().toString(36).substr(2, 9);
            this.setCookie('pair_participant_id', this.participantId);
        }
        
        // Initialize DataLogger NOW (after consent) and register participant
        if (window.dataLogger) {
            // Initialize Firebase auth and create participant record atomically
            window.dataLogger.initExperiment().then(() => {
                window.dataLogger.setParticipantId(this.participantId, this.groupId);
                console.log('DataLogger: Initialized after consent with participant ID:', this.participantId);
            }).catch(err => {
                console.error('DataLogger: Initialization failed:', err);
            });
        }

        return this.groupId;
    }

    /**
     * Manually set the group (e.g., for debugging or specific assignment overrides)
     */
    setGroup(groupId, options = {}) {
        if (!GROUP_FEATURES[groupId]) {
            console.error(`ExperimentManager: Invalid group ID '${groupId}'`);
            return;
        }
        
        this.groupId = groupId;
        this.features = GROUP_FEATURES[groupId];
        const shouldPersist = options.persist !== false && !this.sandboxMode;
        if (shouldPersist) {
            this.setCookie('pair_group', groupId, 30); // 30 days
        }
        console.log(`ExperimentManager: Assigned to '${groupId}'`);
    }

    /**
     * Check if a specific feature is enabled for the current group.
     * @param {string} featureName 
     * @returns {any} Feature value or undefined
     */
    getFeature(featureName) {
        if (!this.features) return undefined;
        return this.features[featureName];
    }
    
    /**
     * Check if the current user has a specific experimental capability
     */
    hasFeature(featureName) {
        return !!this.getFeature(featureName);
    }

    getCurrentGroup() {
        return this.groupId;
    }

    // --- Cookie Helpers ---

    setCookie(name, value, days = 365) {
        if (this.sandboxMode) {
            return;
        }
        let expires = "";
        if (days) {
            const date = new Promise((resolve) => resolve(new Date())); // Simplify
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + d.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
    }

    getCookie(name) {
        if (this.sandboxMode) {
            return null;
        }
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    clearCookies() {
        this.setCookie('pair_group', '', -1);
        this.setCookie('pair_participant_id', '', -1);
        this.groupId = null;
        this.features = null;
    }

    enableSandboxMode(enable = true) {
        this.sandboxMode = enable;
        if (enable) {
            this.groupId = null;
            this.features = null;
            this.participantId = null;
        }
    }
}

// Singleton Instance
export const experimentManager = new ExperimentManager();
window.ExperimentManager = experimentManager; // Expose globally for convenience
