# Data Logging System

## Overview

The pAIrStudio data logging system is a modular, extensible framework for tracking participant behavior during experimental trials. It uses Firebase Firestore to store all events and participant data for later analysis.

**Privacy-First Design**: Firebase authentication and database access are only initialized **after the user accepts the consent form**. This ensures no user records are created for visitors who decline to participate.

**Offline Support**: The system automatically handles network disconnections by queueing events locally. When the connection is restored, all queued data is automatically uploaded to Firebase.

## Architecture

### Core Components

1. **DataLogger** (`DataLogger.js`) - Singleton service that handles all logging operations
2. **Firebase Firestore** - Cloud database for storing participant data and events
3. **Event Queue** - Buffering system for events that occur before Firebase is ready or when offline
4. **Network Monitoring** - Automatic detection of connection loss/restoration with retry logic

### Offline Resilience

The system includes comprehensive offline support:

- **Automatic Queueing**: Events are queued in memory when Firebase is unavailable
- **localStorage Backup**: Queue is persisted to browser storage to survive page reloads
- **Network Detection**: Monitors online/offline status and retries automatically
- **Exponential Backoff**: Retries failed connections with increasing delays (1s, 2s, 4s, 8s, 16s, max 30s)
- **Participant Data Caching**: Critical data (participant ID, group) stored locally
- **User Notifications**: Red banner displays when offline, hides when connection restored
- **Graceful Degradation**: App continues functioning even when offline

### User Experience During Offline

When internet connection is lost:
1. **Visual Notification**: A red banner appears at the top: "No Internet Connection - Please connect to the internet..."
2. **Data Protection**: All interactions are queued locally
3. **Automatic Recovery**: When connection returns, the banner disappears and data syncs automatically
4. **Consent Disclaimer**: Users are informed during consent that internet connection is required

### Data Structure

```
Firestore Collection: participants/{userId}
├── Document Fields:
│   ├── participantId (string) - User-facing ID
│   ├── firebaseUserId (string) - Firebase auth UID
│   ├── experimentalGroup (string) - Assigned group (e.g., 'standard_ai', 'pp_driver')
│   ├── startTime (timestamp)
│   ├── status (string) - 'in_progress' or 'completed'
│   └── surveys (map) - Survey responses by survey ID
│
└── Subcollection: events/{eventId}
    ├── eventType (string) - Type of event
    ├── timestamp (server timestamp)
    ├── localTime (ISO string)
    ├── currentLevel (string)
    ├── experimentalGroup (string)
    └── ...custom event data
```

## Logged Data Points

### Participant Metadata
- **Participant ID**: Auto-generated unique identifier
- **Experimental Group**: Randomly assigned condition
- **User Agent**: Browser and OS information
- **Screen Resolution**: Display dimensions
- **Start Time**: Session start timestamp

### Level Interaction
- **Level Start**: When user begins a level
  - `levelId`
  - Timestamp
  
- **Level Complete**: When user successfully completes a level
  - `levelId`
  - `success` (boolean)
  - `timeSpentMs` (duration)
  - `runCount` (number of run attempts)
  
### Code Execution
- **Run Simulation**: Every time "Run Code" button is clicked
  - `levelId`
  - `runNumber` (incremental count per level)
  - `codeSnapshot` (complete workspace state)
  - Timestamp

### Chat Interaction
- **Chat Message**: Every message sent/received in chatbot
  - `role` ('user' or 'assistant')
  - `content` (message text)
  - `levelId`
  - Timestamp

### Survey Data
- **Survey Submission**: Final survey responses
  - `surveyId`
  - `responses` (complete answer set)
  - Timestamp

## Usage

### Basic Logging

```javascript
// Log a simple event
window.dataLogger.logEvent('custom_event', {
    customField: 'value',
    anotherField: 123
});
```

### Pre-built Logging Functions

```javascript
// Log level start
window.dataLogger.logLevelStart('level_001');

// Log level completion
window.dataLogger.logLevelComplete('level_001', true, {
    completedLevels: 5
});

// Log code run
window.dataLogger.logRun('level_001', workspaceState);

// Log chat message
window.dataLogger.logChatMessage('user', 'How do I move forward?', 'level_001');

// Log survey
window.dataLogger.logSurvey('final_survey', answersObject);
```

## Integration Points

### Current Integrations

1. **main.js** - Initializes DataLogger on app startup
2. **ExperimentManager.js** - Logs participant ID and group assignment
3. **LevelManager.js** - Logs level start and completion
4. **BlocklyManager.js** - Logs code execution (run button clicks)
5. **ChatbotManager.js** - Logs all chat messages
6. **SurveyManager.js** - Logs survey submissions

### Adding New Logging

To log a new event type:

1. **Simple approach**: Use `logEvent()` directly
```javascript
window.dataLogger.logEvent('button_click', {
    buttonId: 'help-button',
    context: 'level_002'
});
```

2. **Dedicated method** (for frequently used events):
```javascript
// In DataLogger.js, add:
async logButtonClick(buttonId, context) {
    await this.logEvent('button_click', {
        buttonId,
        context
    });
}

// Use it:
window.dataLogger.logButtonClick('help-button', 'level_002');
```

## Event Queue System

The DataLogger includes an event queue that buffers events when Firebase is not ready (e.g., during initialization). Once Firebase connects, all queued events are automatically flushed.

This ensures **zero data loss** even if events occur during app startup.

## Firebase Configuration

Located in `DataLogger.js`:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyB_dE4Vc6aUi4BNTClGfYtaDR73LHb4otc",
    authDomain: "pair-studio-v1.firebaseapp.com",
    projectId: "pair-studio-v1",
    // ...
};
```

## Research Data Analysis

### Queries You Can Run

1. **Participant summary**:
```javascript
// Get all participants
db.collection('participants').get()
```

2. **Events for a participant**:
```javascript
// Get all events for a specific user
db.collection('participants/{userId}/events')
  .orderBy('timestamp')
  .get()
```

3. **Filter by event type**:
```javascript
// Get all chat messages
db.collection('participants/{userId}/events')
  .where('eventType', '==', 'chat_message')
  .get()
```

4. **Time-based queries**:
```javascript
// Get events in a time range
db.collection('participants/{userId}/events')
  .where('timestamp', '>=', startDate)
  .where('timestamp', '<=', endDate)
  .get()
```

### Key Metrics for Analysis

- **Time on task**: `level_complete.timeSpentMs` per level
- **Code attempts**: Count of `run_simulation` events per level
- **Chat usage**: Count of `chat_message` events per level
- **Success rate**: Ratio of successful `level_complete` events
- **Self-efficacy**: Survey responses from final survey
- **AI interaction patterns**: `chat_message` content analysis

## Best Practices

1. **Always log with context**: Include `levelId` or other context
2. **Use timestamps**: DataLogger adds timestamps automatically
3. **Log user actions, not system state**: Focus on what users *do*
4. **Be consistent**: Use the same event types across the codebase
5. **Document new event types**: Update this file when adding new events

## Future Enhancements

- [ ] Offline support with IndexedDB backup
- [ ] Real-time analytics dashboard
- [ ] Data export utility
- [ ] Privacy-compliant data anonymization
- [ ] Session replay capability
- [ ] A/B test result automation

## Privacy & Ethics

All data collection is:
- Disclosed in the consent form
- Anonymous (no PII collected)
- Stored securely in Firebase
- Used solely for research purposes
- IRB approved (add IRB protocol number here)

Participants can request data deletion by contacting: [add contact email]
