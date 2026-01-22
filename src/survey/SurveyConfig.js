/**
 * SurveyConfig.js
 * Centralized configuration for survey questions
 * Easy to modify and extend for future studies
 */

export const SURVEY_QUESTIONS = [
    {
        id: 'q1',
        type: 'multiple-choice',
        question: 'How would you rate your overall experience with the programming environment?',
        options: [
            'Excellent',
            'Good',
            'Fair',
            'Poor'
        ],
        required: true,
        groups: ['all'] // 'all' or specific groups like ['STANDARD_AI', 'PAIR_DRIVER']
    },
    {
        id: 'q2',
        type: 'likert',
        question: 'The visual programming interface was easy to use.',
        scale: 5, // 1-5 scale
        labels: {
            1: 'Strongly Disagree',
            5: 'Strongly Agree'
        },
        required: true,
        groups: ['all']
    },
    {
        id: 'q3',
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
        id: 'q4',
        type: 'long-answer',
        question: 'What did you find most challenging about programming the robot?',
        placeholder: 'Please describe any challenges you faced...',
        maxLength: 1000,
        required: false,
        groups: ['all']
    },
    {
        id: 'q5',
        type: 'multiple-choice',
        question: 'How effective was the pair programming experience?',
        options: [
            'Very Effective',
            'Somewhat Effective',
            'Neutral',
            'Somewhat Ineffective',
            'Very Ineffective'
        ],
        required: true,
        groups: ['PAIR_DRIVER', 'PAIR_NAVIGATOR'] // Only for pair programming groups
    },
    {
        id: 'q6',
        type: 'long-answer',
        question: 'Do you have any suggestions for improving this learning environment?',
        placeholder: 'Please share your suggestions...',
        maxLength: 1000,
        required: false,
        groups: ['all']
    },
    {
        id: 'q7',
        type: 'likert',
        question: 'I feel confident in my ability to program the robot after this session.',
        scale: 5,
        labels: {
            1: 'Strongly Disagree',
            5: 'Strongly Agree'
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
