/**
 * Survey Questions Configuration
 * Define all survey questions here
 */

export const surveyQuestions = [
  {
    id: 'q1_experience',
    number: 1,
    type: 'scale',
    text: 'How would you rate your overall experience with MikeStudio?',
    min: 1,
    max: 5,
    minLabel: 'Poor',
    maxLabel: 'Excellent',
    required: true
  },
  {
    id: 'q2_difficulty',
    number: 2,
    type: 'scale',
    text: 'How difficult did you find the programming tasks?',
    min: 1,
    max: 5,
    minLabel: 'Very Easy',
    maxLabel: 'Very Difficult',
    required: true
  },
  {
    id: 'q3_ai_helpful',
    number: 3,
    type: 'scale',
    text: 'How helpful was the AI assistant (Mike) in completing the tasks?',
    min: 1,
    max: 5,
    minLabel: 'Not Helpful',
    maxLabel: 'Very Helpful',
    required: true
  },
  {
    id: 'q4_interface',
    number: 4,
    type: 'multiple-choice',
    text: 'Which aspect of the interface did you find most useful?',
    options: [
      'Visual block programming',
      'AI assistant chatbot',
      'Game visualization',
      'Instructions and hints',
      'All equally useful'
    ],
    required: true
  },
  {
    id: 'q5_prior_experience',
    number: 5,
    type: 'multiple-choice',
    text: 'What is your prior programming experience?',
    options: [
      'No experience',
      'Beginner (less than 1 year)',
      'Intermediate (1-3 years)',
      'Advanced (3+ years)',
      'Professional programmer'
    ],
    required: true
  },
  {
    id: 'q6_age_group',
    number: 6,
    type: 'multiple-choice',
    text: 'What is your age group?',
    options: [
      'Under 18',
      '18-24',
      '25-34',
      '35-44',
      '45-54',
      '55 or older'
    ],
    required: false
  },
  {
    id: 'q7_improvements',
    number: 7,
    type: 'textarea',
    text: 'What improvements or features would you suggest for MikeStudio?',
    placeholder: 'Please share your suggestions...',
    rows: 4,
    required: false
  },
  {
    id: 'q8_challenges',
    number: 8,
    type: 'textarea',
    text: 'What challenges did you face while using the system?',
    placeholder: 'Describe any difficulties you encountered...',
    rows: 4,
    required: false
  },
  {
    id: 'q9_learning',
    number: 9,
    type: 'scale',
    text: 'Do you feel you learned programming concepts through this experience?',
    min: 1,
    max: 5,
    minLabel: 'Not at all',
    maxLabel: 'Very much',
    required: true
  },
  {
    id: 'q10_recommend',
    number: 10,
    type: 'scale',
    text: 'How likely are you to recommend MikeStudio to others?',
    min: 1,
    max: 5,
    minLabel: 'Not likely',
    maxLabel: 'Very likely',
    required: true
  },
  {
    id: 'q11_additional',
    number: 11,
    type: 'textarea',
    text: 'Any additional comments or feedback?',
    placeholder: 'Share any other thoughts...',
    rows: 4,
    required: false
  }
];
