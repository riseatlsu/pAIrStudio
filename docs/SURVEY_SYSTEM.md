# Survey System Documentation

## Overview
The MikeStudio survey system is a modular, extensible framework for collecting user feedback after experiment completion. It supports multiple question types and dynamically generates forms based on configuration.

## Features
- ✅ Multiple question types (multiple-choice, checkboxes, text, textarea, scale)
- ✅ Required/optional question support
- ✅ Automatic validation
- ✅ Progress tracking and persistence
- ✅ Dynamic question generation
- ✅ Research data logging integration
- ✅ Accessible only after completing all levels

## Question Types

### 1. Multiple Choice
Single selection from a list of options.
```javascript
{
  id: 'q1_example',
  number: 1,
  type: 'multiple-choice',
  text: 'Select one option',
  options: ['Option A', 'Option B', 'Option C'],
  required: true
}
```

### 2. Checkboxes
Multiple selections from a list of options.
```javascript
{
  id: 'q2_example',
  number: 2,
  type: 'checkboxes',
  text: 'Select all that apply',
  options: ['Choice 1', 'Choice 2', 'Choice 3'],
  required: false
}
```

### 3. Text Input
Single-line text response.
```javascript
{
  id: 'q3_example',
  number: 3,
  type: 'text',
  text: 'Enter your name',
  placeholder: 'John Doe',
  required: true
}
```

### 4. Textarea
Multi-line text response.
```javascript
{
  id: 'q4_example',
  number: 4,
  type: 'textarea',
  text: 'Provide detailed feedback',
  placeholder: 'Enter your feedback here...',
  rows: 5,
  required: false
}
```

### 5. Scale
Numeric rating scale with labels.
```javascript
{
  id: 'q5_example',
  number: 5,
  type: 'scale',
  text: 'Rate your experience',
  min: 1,
  max: 5,
  minLabel: 'Poor',
  maxLabel: 'Excellent',
  required: true
}
```

## Adding/Modifying Questions

Edit `/js/config/surveyQuestions.js` to customize survey content:

```javascript
export const surveyQuestions = [
  {
    id: 'unique_id',           // Unique identifier
    number: 1,                  // Question number (for display)
    type: 'scale',             // Question type
    text: 'Your question?',    // Question text
    description: 'Optional',   // Optional description
    required: true,            // Is answer required?
    // Type-specific options...
  },
  // Add more questions...
];
```

## Question Configuration Options

### Common Options (all types)
- `id` (string, required): Unique identifier for the question
- `number` (number, optional): Display number
- `type` (string, required): Question type
- `text` (string, required): Question text
- `description` (string, optional): Additional context
- `required` (boolean, optional): Whether answer is required (default: false)

### Type-Specific Options

**multiple-choice & checkboxes:**
- `options` (array, required): List of choices

**text:**
- `placeholder` (string, optional): Placeholder text

**textarea:**
- `placeholder` (string, optional): Placeholder text
- `rows` (number, optional): Number of rows (default: 5)

**scale:**
- `min` (number, optional): Minimum value (default: 1)
- `max` (number, optional): Maximum value (default: 5)
- `minLabel` (string, optional): Label for minimum
- `maxLabel` (string, optional): Label for maximum

## Survey Access Rules

The survey (marked as 'S' in the progress bar):
1. Only appears after all tutorial and regular levels
2. Only becomes accessible when ALL levels are completed
3. Cannot be accessed until all required levels are finished
4. Appears with a purple gradient in the progress bar
5. Shows gold when active, green when completed

## Data Collection

Survey responses are:
1. Saved to `localStorage` automatically as user answers
2. Logged to research data when submitted (via ConsentManager)
3. Marked as completed in level progress
4. Persisted across page reloads

Access survey data:
```javascript
// Get all responses
const responses = window.SurveyManager.getAllResponses();

// Get specific response
const response = window.SurveyManager.getResponse('q1_example');

// Check if completed
const isComplete = window.SurveyManager.hasCompleted();
```

## Customization

### Styling
Survey styles are in `index.html` under the `/* ===== SURVEY MODAL ===== */` section. Customize:
- Colors (`.survey-modal-header` background)
- Layout (`.survey-modal` dimensions)
- Question spacing (`.survey-question` padding)
- Button styles (`.survey-btn-submit`)

### Validation
Modify validation in `SurveyManager.isValid()`:
```javascript
isValid() {
  return this.questions.every(q => {
    if (!q.required) return true;
    const response = this.responses[q.id];
    // Add custom validation logic here
    return response !== undefined && response !== null && response !== '';
  });
}
```

### Progress Bar Position
The survey position in the progress bar is determined by the level order in `LevelManager`:
```javascript
this.allLevels = [
  ...this.tutorialLevels,  // A, B, C
  ...Array.from({length: this.maxLevels}, (_, i) => (i + 1).toString()), // 1, 2, ...
  'S' // Survey - always last
];
```

## Testing

### Reset Survey (for development)
```javascript
// In browser console:
window.SurveyManager.reset();
```

### Test Survey Access
```javascript
// Complete all levels
window.LevelManager.allLevels.forEach(level => {
  if (level !== 'S') window.LevelManager.completeLevel(level);
});
window.LevelManager.updateProgressUI();
```

### View Survey Data
```javascript
// Check responses
console.log(window.SurveyManager.getAllResponses());

// Check completion status
console.log(window.SurveyManager.hasCompleted());
```

## Files Structure

```
js/
├── core/
│   └── SurveyManager.js       # Core survey functionality
├── config/
│   └── surveyQuestions.js     # Question definitions
└── level_manager.js           # Integration with levels
```

## API Reference

### SurveyManager Methods

- `defineQuestions(questions)` - Set all survey questions
- `addQuestion(question)` - Add a single question
- `getQuestions()` - Get all questions
- `saveResponse(questionId, response)` - Save user response
- `getResponse(questionId)` - Get specific response
- `getAllResponses()` - Get all responses
- `isValid()` - Check if all required questions answered
- `complete()` - Mark survey as completed
- `hasCompleted()` - Check completion status
- `reset()` - Reset survey (testing only)
- `generateQuestionHTML(question)` - Generate HTML for question

## Best Practices

1. **Unique IDs**: Always use unique, descriptive IDs for questions
2. **Question Numbers**: Keep sequential for better UX
3. **Required Fields**: Only mark essential questions as required
4. **Scale Questions**: Use consistent scales (e.g., all 1-5)
5. **Text Fields**: Provide clear placeholders
6. **Testing**: Always test survey before deployment
7. **Data Privacy**: Ensure compliance with research ethics
