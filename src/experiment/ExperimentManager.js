/**
 * @fileoverview ExperimentManager - Manages experimental group assignment and feature flags.
 * Handles random group assignment, cookie persistence, and feature queries.
 * @module experiment/ExperimentManager
 */

import { GROUPS, GROUP_FEATURES, ASSIGNMENT_WEIGHTS, LATIN_SQUARE } from './GroupConfig.js';

/**
 * ExperimentManager - Singleton for experimental group management.
 * 
 * Features:
 * - Weighted random group assignment
 * - Cookie-based persistence (30-day expiry)
 * - Feature flag system for conditional functionality
 * - Participant ID generation and tracking
 * - Integration with DataLogger for consent-first initialization
 * 
 * Usage:
 * ```javascript
 * import { experimentManager } from './experiment/ExperimentManager.js';
 * 
 * // Initialize (loads cookies)
 * experimentManager.initialize();
 * 
 * // Assign group after consent
 * const group = experimentManager.assignGroup();
 * 
 * // Query features
 * if (experimentManager.hasFeature('chatbot')) {
 *   // Enable chatbot UI
 * }
 * ```
 * 
 * @class ExperimentManager
 */
export class ExperimentManager {
    constructor() {
        this.groupId = null;
        this.participantId = null;
        this.participantIdB = null; // Second participant for human-human condition
        this.features = null;
        this.sandboxMode = false;
        this.latinSquareRow = null;
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

        const savedRow = this.getCookie('pair_latin_row');
        if (savedRow !== null) {
            const parsed = parseInt(savedRow, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed < LATIN_SQUARE.length) {
                this.latinSquareRow = parsed;
                console.log(`ExperimentManager: Loaded Latin square row ${this.latinSquareRow}`);
            }
        }

        if (this.participantId) {
            console.log(`ExperimentManager: Participant ID '${this.participantId}'`);
        }

        // Load second participant ID for human-human condition
        const savedIdB = this.getCookie('pair_participant_id_b');
        if (savedIdB) {
            this.participantIdB = savedIdB;
            console.log(`ExperimentManager: Participant ID B '${this.participantIdB}'`);
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

        // Check for researcher-controlled session type (hidden from regular participants).
        // Researchers schedule human-human sessions by sending participants a link with ?hh=1.
        const urlParams = new URLSearchParams(window.location.search);
        let selectedGroupId = null;

        if (urlParams.get('hh') === '1') {
            selectedGroupId = GROUPS.HUMAN_HUMAN;
            console.log('ExperimentManager: Human-human session activated via URL param');
        }

        // Fall through to weighted random selection for all other sessions
        if (!selectedGroupId) {
            const totalWeight = ASSIGNMENT_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            selectedGroupId = GROUPS.CONTROL; // Default fallback

            for (const item of ASSIGNMENT_WEIGHTS) {
                if (random < item.weight) {
                    selectedGroupId = item.id;
                    break;
                }
                random -= item.weight;
            }
        }

        this.setGroup(selectedGroupId);

        // Assign a Latin square row for counter-balanced level ordering
        this.latinSquareRow = Math.floor(Math.random() * LATIN_SQUARE.length);
        this.setCookie('pair_latin_row', String(this.latinSquareRow), 30);
        console.log(`ExperimentManager: Assigned Latin square row ${this.latinSquareRow}`);

        // Generate participant ID(s)
        if (!this.participantId) {
            if (selectedGroupId === GROUPS.HUMAN_HUMAN) {
                // Shared session code so paired IDs are visually linked
                const sessionCode = Math.random().toString(36).substr(2, 7);
                this.participantId  = `hh_${sessionCode}_a`;
                this.participantIdB = `hh_${sessionCode}_b`;
                this.setCookie('pair_participant_id',   this.participantId,  30);
                this.setCookie('pair_participant_id_b', this.participantIdB, 30);
                console.log(`ExperimentManager: Human-human pair — A: ${this.participantId}, B: ${this.participantIdB}`);
            } else {
                this.participantId = 'cnt_' + Math.random().toString(36).substr(2, 9);
                this.setCookie('pair_participant_id', this.participantId, 30);
            }
        }

        // Initialize DataLogger NOW (after consent) and register participant
        if (window.dataLogger) {
            window.dataLogger.initExperiment().then(() => {
                window.dataLogger.setParticipantId(
                    this.participantId,
                    this.groupId,
                    { participantIdB: this.participantIdB }
                );
                const pid = localStorage.getItem('prolific_pid');
                const uid = localStorage.getItem('qualtrics_uid');
                if (pid || uid) {
                    window.dataLogger.setProlificData(pid, uid);
                }
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

    getLatinSquareRow() {
        return this.latinSquareRow;
    }

    getParticipantIdB() {
        return this.participantIdB;
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
        this.setCookie('pair_participant_id_b', '', -1);
        this.setCookie('pair_latin_row', '', -1);
        this.setCookie('pair_consented', '', -1);
        this.groupId = null;
        this.features = null;
        this.participantId = null;
        this.participantIdB = null;
        this.latinSquareRow = null;
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
