/**
 * SurveyConfig.js
 * Centralized configuration for survey questions
 * Easy to modify and extend for future studies
 */

export const SURVEY_QUESTIONS = [
    {
        id: 'q1',
        type: 'multiple-choice',
        question: 'How much experience do you have with programming in any capacity?',
        options: [
            'Less than 1 year',
            '1-3 years',
            '3-5 years',
            'More than 5 years'
        ],
        required: true,
        groups: ['all'] // 'all' or specific groups like ['STANDARD_AI', 'PAIR_DRIVER']
    },
    {
        id: 'q2',
        type: 'likert',
        question: 'I found the chatbot helpful in completing the tasks.',
        scale: 5,
        labels: {
            1: 'Strongly Disagree',
            5: 'Strongly Agree'
        },
        required: true,
        groups: ['STANDARD_AI', 'PAIR_DRIVER', 'PAIR_NAVIGATOR'] // Only show to groups with chatbot
    },
    {
        id: 'q3',
        type: 'likert',
        question: 'How difficult was the last level you completed (level 5)?',
        scale: 5, // 1-5 scale
        labels: {
            1: 'Very easy',
            5: 'Very difficult'
        },
        required: true,
        groups: ['all']
    },

    {
        id: 'q4',
        type: 'long-answer',
        question: 'Explain your answer to the previous question.',
        placeholder: 'Please give more details...',
        maxLength: 1000,
        required: true,
        groups: ['all']
    },
    {
        id: 'q5',
        type: 'long-answer',
        question: 'Please describe your experience serving as a DRIVER in the pair programming setup.',
        placeholder: 'Please share your thoughts...',
        maxLength: 1000,
        required: true,
        groups: ['PAIR_DRIVER', 'PAIR_NAVIGATOR'] // Only for pair programming groups
    },
        {
        id: 'q6',
        type: 'long-answer',
        question: 'Please describe your experience serving as a NAVIGATOR in the pair programming setup.',
        placeholder: 'Please share your thoughts...',
        maxLength: 1000,
        required: true,
        groups: ['PAIR_DRIVER', 'PAIR_NAVIGATOR'] // Only for pair programming groups
    },
    {
        id: 'q7',
        type: 'likert',
        question: 'If you were to do another programming task, would you feel confident using the skills you learned here?',
        scale: 5,
        labels: {
            1: 'Not at all confident',
            5: 'Very confident'
        },
        required: true,
        groups: ['all']
    }
];

/**
 * Get questions filtered by experimental group
 * @param {string} groupId - The experimental group ID (e.g., 'STANDARD_AI', 'PAIR_DRIVER')
 * @returns {Array} Filtered array of questions
 */
export function getQuestionsForGroup(groupId) {
    console.log(`SurveyConfig: Filtering questions for group: ${groupId}`);
    
    // Normalize groupId to uppercase for case-insensitive comparison
    const normalizedGroupId = groupId ? groupId.toUpperCase() : '';
    
    const filtered = SURVEY_QUESTIONS.filter(question => {
        const showToAll = question.groups.includes('all');
        // Check if any of the question's groups match (case-insensitive)
        const showToGroup = question.groups.some(g => g.toUpperCase() === normalizedGroupId);
        const shouldShow = showToAll || showToGroup;
        
        console.log(`Question ${question.id}: showToAll=${showToAll}, showToGroup=${showToGroup}, shouldShow=${shouldShow}`);
        
        return shouldShow;
    });
    
    console.log(`SurveyConfig: Returning ${filtered.length} questions`);
    return filtered;
}
