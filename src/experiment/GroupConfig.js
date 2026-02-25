// Configuration for Experimental Groups

export const GROUPS = {
    CONTROL: 'control',         // No AI
    STANDARD_AI: 'standard_ai'  // AI Chatbot available (passive)
};

// Features enabled for each group
export const GROUP_FEATURES = {
    [GROUPS.CONTROL]: {
        id: GROUPS.CONTROL,
        name: 'Control Group',
        chatbot: false,
        roleSwitching: false
    },
    [GROUPS.STANDARD_AI]: {
        id: GROUPS.STANDARD_AI,
        name: 'Standard AI Support',
        chatbot: true,
        chatbotMode: 'assistant', // "Help me" mode
        roleSwitching: false
    }
};

// Probability Weights (Sum does not need to be 1, but easier if normalized mentally)
export const ASSIGNMENT_WEIGHTS = [
    { id: GROUPS.CONTROL, weight: 1 },
    { id: GROUPS.STANDARD_AI, weight: 1 }
];

/**
 * Tutorial Level Progression Configuration
 * Defines which tutorial levels each group should complete
 * 
 * Tutorial Types:
 * - tutorial_A: Basic movement and object manipulation (all groups)
 * - tutorial_B: Advanced block usage and logic (all groups)
 * - tutorial_C: Chatbot interaction and assistance (only groups with chatbot)
 */
export const TUTORIAL_PROGRESSION = {
    [GROUPS.CONTROL]: [
        'tutorial_A',    // Basic movement
        'tutorial_B'     // Advanced blocks
    ],
    [GROUPS.STANDARD_AI]: [
        'tutorial_A',    // Basic movement
        'tutorial_B',    // Advanced blocks
        'tutorial_C'     // Chatbot practice (for groups with AI support)
    ]
};

/**
 * Experimental Level Progression
 * Levels that all groups will complete (after tutorials)
 */
export const EXPERIMENTAL_LEVELS = [
    'level_001',  // AI support varies by group
    'level_002',  // No AI for any group
    'level_003',  // Loop optimization (3 boxes)
    'level_004',  // Multi-destination delivery (2 boxes, different locations)
    'level_005'   // Obstacle navigation (2 boxes with obstacles)
    // Add more levels here as needed
];

/**
 * Get the complete level progression for a specific group
 * @param {string} groupId - The group ID
 * @returns {Array<string>} Array of level IDs in order
 */
export function getLevelProgression(groupId) {
    const tutorials = TUTORIAL_PROGRESSION[groupId] || TUTORIAL_PROGRESSION[GROUPS.CONTROL];
    return [
        ...tutorials,
        ...EXPERIMENTAL_LEVELS,
        'survey_final'  // Always end with survey
    ];
}
