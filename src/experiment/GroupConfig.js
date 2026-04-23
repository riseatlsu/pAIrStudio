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
 */
export const TUTORIAL_PROGRESSION = {
    [GROUPS.CONTROL]: [
        'tutorial_A',
        'tutorial_B'
    ],
    [GROUPS.STANDARD_AI]: [
        'tutorial_A',
        'tutorial_B'
    ]
};

/**
 * Experimental levels in their canonical order (index 0 = level_001, etc.)
 */
export const EXPERIMENTAL_LEVELS = [
    'level_001',
    'level_002',
    'level_003',
    'level_004',
    'level_005',
    'level_006',
];

/**
 * Williams balanced Latin square for 6 conditions.
 * Each row is a permutation of indices 0–5 into EXPERIMENTAL_LEVELS.
 * Properties: every level appears once per position; every level precedes
 * every other level exactly once (first-order carry-over balanced).
 */
export const LATIN_SQUARE = [
    [0, 1, 5, 2, 4, 3],
    [1, 2, 0, 3, 5, 4],
    [2, 3, 1, 4, 0, 5],
    [3, 4, 2, 5, 1, 0],
    [4, 5, 3, 0, 2, 1],
    [5, 0, 4, 1, 3, 2],
];

/**
 * Get the complete level progression for a specific group.
 * @param {string} groupId - The group ID
 * @param {number|null} latinSquareRow - Row index (0–5) for counter-balanced
 *   experimental level order. Null/undefined = canonical order (sandbox / fallback).
 * @returns {Array<string>} Array of level IDs in order
 */
export function getLevelProgression(groupId, latinSquareRow = null) {
    const tutorials = TUTORIAL_PROGRESSION[groupId] || TUTORIAL_PROGRESSION[GROUPS.CONTROL];

    let experimentalOrder;
    if (latinSquareRow !== null && latinSquareRow !== undefined && LATIN_SQUARE[latinSquareRow]) {
        experimentalOrder = LATIN_SQUARE[latinSquareRow].map(i => EXPERIMENTAL_LEVELS[i]);
    } else {
        experimentalOrder = [...EXPERIMENTAL_LEVELS];
    }

    return [
        ...tutorials,
        ...experimentalOrder,
        'survey_final',
    ];
}
