/**
 * SurveyManager.js
 * Manages survey state, persistence, and submission
 * Modular design for easy adaptation
 */

import { getQuestionsForGroup } from './SurveyConfig.js';

class SurveyManager {
    constructor() {
        this.experimentManager = null;
        this.questions = [];
        this.answers = {};
        this.isComplete = false;
    }

    /**
     * Initialize the survey manager
     * @param {Object} experimentManager - Reference to ExperimentManager
     */
    initialize(experimentManager) {
        this.experimentManager = experimentManager;
        
        // Get questions filtered by group
        const groupId = experimentManager.groupId || 'CONTROL';
        this.questions = getQuestionsForGroup(groupId);
        
        // Load saved answers from localStorage
        this.loadAnswers();
        
        console.log(`SurveyManager: Initialized with ${this.questions.length} questions for group ${groupId}`);
    }

    /**
     * Get storage key for survey answers
     */
    getStorageKey() {
        const participantId = this.experimentManager?.participantId || 'anonymous';
        return `surveyAnswers_${participantId}`;
    }

    /**
     * Load saved answers from localStorage
     */
    loadAnswers() {
        try {
            const key = this.getStorageKey();
            const saved = localStorage.getItem(key);
            
            if (saved) {
                this.answers = JSON.parse(saved);
                console.log(`SurveyManager: Loaded ${Object.keys(this.answers).length} saved answers`);
            } else {
                this.answers = {};
            }
        } catch (e) {
            console.error('SurveyManager: Error loading answers', e);
            this.answers = {};
        }
    }

    /**
     * Save answers to localStorage
     */
    saveAnswers() {
        try {
            const key = this.getStorageKey();
            localStorage.setItem(key, JSON.stringify(this.answers));
            console.log('SurveyManager: Answers saved');
        } catch (e) {
            console.error('SurveyManager: Error saving answers', e);
        }
    }

    /**
     * Set answer for a question
     * @param {string} questionId - The question ID
     * @param {*} answer - The answer (string, number, or array)
     */
    setAnswer(questionId, answer) {
        this.answers[questionId] = {
            value: answer,
            timestamp: new Date().toISOString()
        };
        this.saveAnswers();
    }

    /**
     * Get answer for a question
     * @param {string} questionId - The question ID
     * @returns {*} The answer value or null
     */
    getAnswer(questionId) {
        return this.answers[questionId]?.value || null;
    }

    /**
     * Check if all required questions are answered
     * @returns {boolean}
     */
    isValid() {
        const requiredQuestions = this.questions.filter(q => q.required);
        return requiredQuestions.every(q => {
            const answer = this.getAnswer(q.id);
            return answer !== null && answer !== undefined && answer !== '';
        });
    }

    /**
     * Submit the survey
     * Logs to DataLogger
     */
    async submitSurvey() {
        if (!this.isValid()) {
            throw new Error('Please answer all required questions');
        }

        // Prepare submission data
        const submissionData = {
            participantId: this.experimentManager?.participantId || 'anonymous',
            groupId: this.experimentManager?.groupId || 'CONTROL',
            answers: this.answers,
            submittedAt: new Date().toISOString(),
            sessionData: {
                // Could include session metadata
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`
            }
        };

        console.log('SurveyManager: Survey submitted', submissionData);

        // Mark as complete
        this.isComplete = true;
        localStorage.setItem(`surveyComplete_${this.experimentManager?.participantId}`, 'true');

        // Log survey submission
        if (window.dataLogger) {
            await window.dataLogger.logSurvey('final_survey', this.answers);
        }

        return submissionData;
    }

    /**
     * Check if survey is already completed
     * @returns {boolean}
     */
    isAlreadyCompleted() {
        const participantId = this.experimentManager?.participantId || 'anonymous';
        return localStorage.getItem(`surveyComplete_${participantId}`) === 'true';
    }

    /**
     * Future: Submit to Firestore
     * @param {Object} data - The submission data
     */
    async submitToFirestore(data) {
        // Placeholder for future Firestore integration
        // Example:
        // const db = firebase.firestore();
        // await db.collection('survey_responses').add(data);
        console.log('SurveyManager: Firestore submission not yet implemented');
    }
}

// Export singleton instance
export const surveyManager = new SurveyManager();

// Also export class for potential multiple instances
export { SurveyManager };
