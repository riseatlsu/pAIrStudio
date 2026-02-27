# Survey System

The survey system provides a modular, maintainable way to collect participant feedback at the end of the experiment.

## Structure

- **SurveyConfig.js**: Question definitions with support for different question types and group filtering
- **SurveyManager.js**: Business logic for survey state, persistence, and submission
- **SurveyUI.js**: Rendering and user interaction
- **survey_final.js**: Survey level configuration (uses 'S' as level indicator)

## Question Types

### 1. Multiple Choice
```javascript
{
    id: 'q1',
    type: 'multiple-choice',
    question: 'How would you rate...?',
    options: ['Excellent', 'Good', 'Fair', 'Poor'],
    required: true,
    groups: ['all']
}
```

### 2. Likert Scale
```javascript
{
    id: 'q2',
    type: 'likert',
    question: 'The interface was easy to use.',
    scale: 5,
    labels: {
        1: 'Strongly Disagree',
        5: 'Strongly Agree'
    },
    required: true,
    groups: ['all']
}
```

### 3. Long Answer
```javascript
{
    id: 'q3',
    type: 'long-answer',
    question: 'What challenges did you face?',
    placeholder: 'Please describe...',
    maxLength: 1000,
    required: false,
    groups: ['all']
}
```

## Group Filtering

Questions can be shown to specific experimental groups:

- `groups: ['all']` - Show to all participants
- `groups: ['STANDARD_AI']` - Show only to this group
- Useful for asking about chatbot effectiveness only to groups that had chatbots

## Adding Questions

Edit `src/survey/SurveyConfig.js` and add to the `SURVEY_QUESTIONS` array:

```javascript
{
    id: 'q_new',
    type: 'multiple-choice', // or 'likert' or 'long-answer'
    question: 'Your question here?',
    options: ['Option 1', 'Option 2'], // for multiple-choice
    required: true,
    groups: ['all']
}
```

## Persistence

- Answers are saved to localStorage as they're entered
- Storage key: `surveyAnswers_{participantId}`
- Completion status: `surveyComplete_{participantId}`
- If page reloads, answers are restored
- Future: Will submit to Firestore (placeholder included)

## Data Structure

Submission data includes:
```javascript
{
    participantId: string,
    groupId: string,
    answers: {
        questionId: {
            value: any,
            timestamp: ISO string
        }
    },
    submittedAt: ISO string
}
```

## Future Integration

The `SurveyManager.submitToFirestore()` method is a placeholder. To integrate with Firestore:

1. Initialize Firebase in your app
2. Implement the method:
```javascript
async submitToFirestore(data) {
    const db = firebase.firestore();
    await db.collection('survey_responses').add(data);
}
```

## Usage

The survey level is automatically loaded when reaching `survey_final` in the level progression. It:
- Hides the game canvas and Blockly workspace
- Shows the survey container
- Loads questions filtered by participant's experimental group
- Restores any previously entered answers
- Validates required fields before submission
