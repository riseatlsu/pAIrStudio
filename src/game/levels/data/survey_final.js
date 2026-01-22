/**
 * survey_final.js
 * Survey "level" configuration
 * Uses 'S' as level type indicator
 */

import { surveyManager } from '../../../survey/SurveyManager.js';
import { SurveyUI } from '../../../survey/SurveyUI.js';

export default {
    id: 'survey_final',
    type: 'survey', // Special level type for surveys
    name: 'Survey',
    displayName: 'Post-Study Survey',
    description: 'Please complete this survey about your experience.',
    
    /**
     * Initialize the survey level
     * This is called when the survey level is loaded
     */
    onLoad: function(scene, experimentManager) {
        console.log('Survey Level: Loading survey');
        
        // Initialize survey manager
        surveyManager.initialize(experimentManager);
        
        // Create survey UI
        const surveyUI = new SurveyUI(surveyManager);
        
        // Hide game-related UI elements
        const gameCanvas = document.getElementById('game-container');
        const blocklyContainer = document.getElementById('blockly-container');
        const controlPanel = document.getElementById('control-panel');
        
        if (gameCanvas) gameCanvas.style.display = 'none';
        if (blocklyContainer) blocklyContainer.style.display = 'none';
        if (controlPanel) controlPanel.style.display = 'none';
        
        // Show survey container
        let surveyContainer = document.getElementById('survey-container');
        if (!surveyContainer) {
            surveyContainer = document.createElement('div');
            surveyContainer.id = 'survey-container';
            surveyContainer.className = 'survey-container';
            document.body.appendChild(surveyContainer);
        }
        surveyContainer.style.display = 'block';
        
        // Render the survey
        surveyUI.render('survey-container');
    },
    
    /**
     * Cleanup when leaving the survey level
     */
    onUnload: function() {
        console.log('Survey Level: Unloading survey');
        
        // Show game-related UI elements again if needed
        const gameCanvas = document.getElementById('game-container');
        const blocklyContainer = document.getElementById('blockly-container');
        const controlPanel = document.getElementById('control-panel');
        const surveyContainer = document.getElementById('survey-container');
        
        if (gameCanvas) gameCanvas.style.display = 'block';
        if (blocklyContainer) blocklyContainer.style.display = 'block';
        if (controlPanel) controlPanel.style.display = 'block';
        if (surveyContainer) surveyContainer.style.display = 'none';
    }
};
