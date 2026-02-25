# Chatbot Infrastructure

This directory contains the modular chatbot system for pAIrStudio experiments. The architecture is designed to be easily adaptable for different experimental conditions and future studies.

## Architecture Overview

```
chatbot/
├── ChatbotManager.js    # Main controller for chatbot functionality
├── ChatbotUI.js         # UI rendering and DOM manipulation
├── PromptConfig.js      # System prompts for AI assistant
└── README.md           # This file
```

## Components

### ChatbotManager.js
**Purpose**: Main controller for chatbot visibility, message handling, and experimental group integration.

**Key Methods**:
- `initialize(experimentManager)` - Initialize chatbot based on experimental group
- `handleUserMessage(message)` - Process user input
- `show()` / `hide()` - Control visibility
- `clearHistory()` - Reset conversation

**Example Usage**:
```javascript
import { chatbotManager } from './chatbot/ChatbotManager.js';

// Initialize with experiment manager
chatbotManager.initialize(experimentManager);

// Manually show/hide
chatbotManager.show();
chatbotManager.hide();
```

### ChatbotUI.js
**Purpose**: Handles all DOM manipulation, dragging functionality, and message rendering.

**Key Methods**:
- `initialize()` - Set up DOM elements and event listeners
- `addUserMessage(message)` - Add user message to chat
- `addBotMessage(message)` - Add bot message to chat (supports **bold** markdown)
- `clearMessages()` - Clear all messages
- `toggleMinimize()` - Minimize/maximize chatbot
- `updateTitle(title)` - Change chatbot title

**Features**:
- Draggable chatbot window
- Auto-scroll to latest message
- Loading state for send button
- Touch support for mobile

### PromptConfig.js
**Purpose**: Configuration file for all chatbot system prompts and behaviors.

**Mode**:
- **Standard Mode**: 
  - For `STANDARD_AI` experimental group
  - General programming assistant
  - Provides hints without giving direct solutions

**Note**: Pair programming modes have been removed from the current experimental design.

**Example Usage**:
```javascript
import { getSystemPrompt, getInitialGreeting } from './chatbot/PromptConfig.js';

// Get system prompt for API calls
const systemPrompt = getSystemPrompt();

// Get initial greeting
const greeting = getInitialGreeting();
```

## Experimental Group Integration

The chatbot automatically adapts to experimental groups:

| Group | Chatbot Visible? | Mode |
|-------|-----------------|------|
| `CONTROL` | ❌ No | N/A |
| `STANDARD_AI` | ✅ Yes | Standard |

**Note**: Pair programming groups (PAIR_DRIVER, PAIR_NAVIGATOR) have been removed from the current experimental design.

## Adding New Experimental Groups

To add a new group with chatbot support:

1. **Update GroupConfig.js**:
```javascript
export const GROUP_FEATURES = {
    YOUR_NEW_GROUP: {
        chatbot: true,
        chatbotMode: 'standard',
        roleSwitching: false,
        // ... other features
    }
};
```

2. **Update PromptConfig.js** (if custom prompt needed):
```javascript
// Modify getSystemPrompt() or getInitialGreeting() to return custom prompts
// based on additional parameters as needed
```

3. **Update ChatbotManager.js** (if special logic needed):
```javascript
// In initialize() method
if (chatbotMode === 'yourMode') {
    // Your custom initialization
}
```

## Role Badge UI (Deprecated)

**Note**: Role badge and Blockly lock overlay features were part of the pair programming modes, which have been removed from the current experimental design.

## API Integration (Future)

Currently using mock responses for development. To connect to real AI backend:

1. **Update ChatbotManager.js**:
```javascript
async handleUserMessage(message) {
    // Replace getMockResponse with actual API call
    const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: message,
            systemPrompt: this.getSystemPrompt(),
            gameState: this.getGameStateContext(),
            history: this.chatHistory
        })
    });
    
    const data = await response.json();
    // Process response...
}
```

2. **Backend should return**:
```json
{
    "type": "text",
    "message": "AI response here..."
}
```

Or for code generation:
```json
{
    "type": "code",
    "blocks": [
        { "type": "move_forward", "params": { "steps": 2 } },
        { "type": "turn_clockwise", "params": {} }
    ],
    "explanation": "I've created blocks to move forward 2 steps and turn right."
}
```

## Testing Different Experimental Groups

Use browser console to test different groups:

```javascript
// Force assign to specific group
ExperimentManager.groupId = 'STANDARD_AI';
ChatbotManager.initialize(ExperimentManager);

// Test control group (no chatbot)
ExperimentManager.groupId = 'CONTROL';
ChatbotManager.initialize(ExperimentManager);
```

## Styling Customization

All chatbot styles are in `src/styles.css`:

- `.chatbot-container` - Main chatbot window
- `.chatbot-header` - Draggable header
- `.chatbot-messages` - Message container
- `.bot-message` / `.user-message` - Message styling
- `#role-badge` - Role indicator
- `.blockly-lock-overlay` - Workspace lock overlay

## Event Logging

The chatbot system logs events for research data collection:

- `logChatMessage(sender, message, level, type)` - All chat messages
- `logRoleSwitch(newRole, levelNumber)` - Role changes
- Events are logged if logging functions exist in global scope

## Best Practices

1. **Keep prompts in PromptConfig.js** - Don't hardcode prompts
2. **Use feature flags** - Check `experimentManager.hasFeature()` before showing features
3. **Log all interactions** - Use logging functions for research data
4. **Test all groups** - Verify chatbot behavior for each experimental condition
5. **Mobile responsive** - Chatbot adapts to small screens automatically

## Troubleshooting

**Chatbot not showing**:
- Check experimental group: `console.log(ExperimentManager.getCurrentGroup())`
- Check feature flag: `console.log(ExperimentManager.hasFeature('chatbot'))`
- Verify initialization: `console.log(ChatbotManager.isInitialized)`

**Experimental group issues**:
- Check group: `console.log(ExperimentManager.getCurrentGroup())`
- Verify features: `console.log(ExperimentManager.hasFeature('chatbot'))`

**Dragging not working**:
- Check if clicking on interactive elements (input, buttons)
- Verify `chatbot-header` element exists

## Future Enhancements

- [ ] Add voice input/output
- [ ] Support for multi-modal AI (code + diagrams)
- [ ] Conversation export for analysis
- [ ] A/B testing different prompts
- [ ] Real-time collaboration features
- [ ] Chatbot personality customization
