# Chatbot Infrastructure

This directory contains the modular chatbot system for pAIrStudio experiments. The architecture is designed to be easily adaptable for different experimental conditions and future studies.

## Architecture Overview

```
chatbot/
├── ChatbotManager.js    # Main controller for chatbot functionality
├── ChatbotUI.js         # UI rendering and DOM manipulation
├── RoleManager.js       # Pair programming role switching
├── PromptConfig.js      # System prompts for different modes
└── README.md           # This file
```

## Components

### ChatbotManager.js
**Purpose**: Main controller for chatbot visibility, message handling, and experimental group integration.

**Key Methods**:
- `initialize(experimentManager, roleManager)` - Initialize chatbot based on experimental group
- `handleUserMessage(message)` - Process user input
- `onRoleChange(newRole)` - Handle role switching in pair programming mode
- `show()` / `hide()` - Control visibility
- `clearHistory()` - Reset conversation

**Example Usage**:
```javascript
import { chatbotManager } from './chatbot/ChatbotManager.js';

// Initialize with experiment manager
chatbotManager.initialize(experimentManager, roleManager);

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

### RoleManager.js
**Purpose**: Manages driver/navigator role switching for pair programming experiments.

**Key Methods**:
- `initialize(experimentManager)` - Set up based on group (PAIR_DRIVER or PAIR_NAVIGATOR)
- `getCurrentRole()` - Returns 'driver' or 'navigator'
- `switchRole()` - Toggle between driver and navigator
- `advanceToLevel(levelNumber)` - Switch roles when advancing levels
- `isDriver()` / `isNavigator()` - Check current role

**Role Switching Logic**:
- **PAIR_DRIVER group**: Starts as driver → Level 1: driver, Level 2: navigator, Level 3: driver...
- **PAIR_NAVIGATOR group**: Starts as navigator → Level 1: navigator, Level 2: driver, Level 3: navigator...

**Example Usage**:
```javascript
import { roleManager } from './chatbot/RoleManager.js';

// Initialize
roleManager.initialize(experimentManager);

// Check current role
if (roleManager.isDriver()) {
    console.log('User is driving - can write code');
} else {
    console.log('AI is driving - workspace locked');
}

// Switch role when advancing level
roleManager.advanceToLevel(2); // Automatically switches role
```

### PromptConfig.js
**Purpose**: Configuration file for all chatbot system prompts and behaviors.

**Modes**:
1. **Standard Mode** (`CHATBOT_PROMPTS.standard`): 
   - For `STANDARD_AI` experimental group
   - General programming assistant
   - Provides hints without giving direct solutions

2. **Pair Programming Mode** (`CHATBOT_PROMPTS.pairProgramming`):
   - For `PAIR_DRIVER` and `PAIR_NAVIGATOR` groups
   - Separate prompts for driver vs navigator roles
   - Driver: Implements code based on navigator's guidance
   - Navigator: Provides strategic direction and code suggestions

**Example Usage**:
```javascript
import { getSystemPrompt, getInitialGreeting } from './chatbot/PromptConfig.js';

// Get system prompt for API calls
const systemPrompt = getSystemPrompt('pairProgramming', 'driver');

// Get initial greeting
const greeting = getInitialGreeting('standard');
```

## Experimental Group Integration

The chatbot automatically adapts to experimental groups:

| Group | Chatbot Visible? | Mode | Role |
|-------|-----------------|------|------|
| `CONTROL` | ❌ No | N/A | N/A |
| `STANDARD_AI` | ✅ Yes | Standard | N/A |
| `PAIR_DRIVER` | ✅ Yes | Pair Programming | Driver → Navigator → ... |
| `PAIR_NAVIGATOR` | ✅ Yes | Pair Programming | Navigator → Driver → ... |

## Adding New Experimental Groups

To add a new group with chatbot support:

1. **Update GroupConfig.js**:
```javascript
export const GROUP_FEATURES = {
    YOUR_NEW_GROUP: {
        chatbot: true,
        chatbotMode: 'yourMode', // or 'standard'
        roleSwitching: false,
        // ... other features
    }
};
```

2. **Add prompts to PromptConfig.js** (if using new mode):
```javascript
export const CHATBOT_PROMPTS = {
    yourMode: {
        systemPrompt: `Your system prompt here...`,
        initialGreeting: `Your greeting here...`
    }
};
```

3. **Update ChatbotManager.js** (if special logic needed):
```javascript
// In initialize() method
if (chatbotMode === 'yourMode') {
    // Your custom initialization
}
```

## Role Badge UI

The role badge appears in the top-right when in pair programming mode:

**Driver Badge**: 🚗 Blue
- "You are the Driver"
- "You write the code. The AI will guide you."

**Navigator Badge**: 🧭 Orange
- "You are the Navigator"
- "You guide the strategy. The AI will write the code."

## Blockly Lock Overlay

When the AI is the driver (user is navigator), the Blockly workspace is locked with an overlay:

```
┌─────────────────────────┐
│    🔒 AI is Driving     │
│                         │
│ The AI will write the   │
│ code. You can chat to   │
│ provide guidance.       │
└─────────────────────────┘
```

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
ChatbotManager.initialize(ExperimentManager, RoleManager);

// Test pair programming
ExperimentManager.groupId = 'PAIR_DRIVER';
RoleManager.initialize(ExperimentManager);
ChatbotManager.initialize(ExperimentManager, RoleManager);

// Switch role manually
RoleManager.switchRole();
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

**Role not switching**:
- Check group: `console.log(RoleManager.isPairProgrammingMode)`
- Verify role: `console.log(RoleManager.getCurrentRole())`
- Call `advanceToLevel()` when changing levels

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
