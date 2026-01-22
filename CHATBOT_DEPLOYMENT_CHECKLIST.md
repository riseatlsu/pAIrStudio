# Chatbot Deployment Checklist

## ⚠️ CRITICAL: Firebase Backend Must Be Redeployed

The errors you're seeing are because the **AI is still using old block names and fields**. This means the Firebase backend needs to be redeployed with the updated prompts from the frontend.

### Current Errors:
1. ❌ AI trying to use `STEPS` field on `move_forward` (doesn't exist)
2. ❌ AI trying to use `rotate_clockwise` instead of `turn_clockwise`
3. ❌ AI trying to use `rotate_counter_clockwise` instead of `turn_counter_clockwise`

### Why This Is Happening:
The **systemPrompt** is sent from the **frontend** to the **Firebase backend**, but the backend is currently running with an old deployment. The frontend has been updated with correct block types, but the backend needs to process the new prompts.

---

## 🔧 Changes Made to Frontend

### 1. **Correct Block Types** ([src/chatbot/PromptConfig.js](src/chatbot/PromptConfig.js))
✅ Updated all prompts to use correct Blockly block types:
- `turn_clockwise` (not `rotate_clockwise`)
- `turn_counter_clockwise` (not `rotate_counter_clockwise`)
- `drop_object` (not `release_object`)
- `pick_object` ✓
- `move_forward` ✓ (no fields - always moves 1 tile)

### 2. **Workspace Clearing** ([src/chatbot/ChatbotManager.js](src/chatbot/ChatbotManager.js))
✅ Added ability for AI to clear workspace:
- AI can now send `{"type": "clear_workspace"}` in blocks array
- This removes all blocks except the start block
- Updated prompts to tell AI about this feature

### 3. **Enhanced Level Context** ([src/chatbot/ChatbotManager.js](src/chatbot/ChatbotManager.js#L358-L395))
✅ AI now receives:
- Level configuration (id, title, description, instructions)
- Allowed blocks for current level
- Win conditions
- Map size
- Objects and their positions
- Player start position
- **Current workspace state** (what blocks user has already placed)
- **Game state** (if GameAPI provides it - robot position, objects, etc.)

**Location in code:**
```javascript
// File: src/chatbot/ChatbotManager.js
// Function: getLevelContext() - line ~358

getLevelContext() {
    // ... returns full level + game state + workspace state
    return {
        id: currentLevel.id,
        title: currentLevel.title,
        description: currentLevel.description,
        instructions: currentLevel.instructions,
        allowedBlocks: currentLevel.allowedBlocks,
        winConditions: currentLevel.winConditions,
        mapSize: currentLevel.map ? { width, height } : null,
        objects: currentLevel.objects,  // Conveyor belts, boxes, etc.
        playerStart: currentLevel.player,  // Robot starting position
        currentWorkspace: BlocklyActions.getWorkspaceState(),  // Blocks user placed
        gameState: window.GameAPI.getGameState()  // Current Phaser scene state
    };
}
```

### 4. **Can AI See Current Code?**
✅ **YES** - The AI receives the current workspace state in `levelContext.currentWorkspace`

This is an array of block objects like:
```json
[
  {"type": "move_forward"},
  {"type": "turn_clockwise"},
  {"type": "pick_object"}
]
```

The AI can use this to:
- Understand what the user has already written
- Suggest modifications
- Debug issues
- Decide whether to add more blocks or clear and start over

---

## 📦 How Data Flows to the AI

### Request to Firebase Backend:
```javascript
// File: src/chatbot/ChatbotManager.js
// Function: getAIResponse() - line ~277

fetch(CHAT_FUNCTION_URL, {
    method: 'POST',
    body: JSON.stringify({
        messages: [...chatHistory, {role: 'user', content: userText}],
        systemPrompt: getSystemPrompt(),  // Role-specific instructions
        levelContext: {
            // Level config
            id: "level_002",
            title: "Sorting Challenge",
            instructions: "Move two boxes...",
            allowedBlocks: {...},
            winConditions: [...],
            
            // Map and objects
            mapSize: {width: 8, height: 8},
            objects: {
                stationary: [{type: "conveyor", row: 3, col: 1}, ...],
                moveable: [{type: "box", id: "box_alpha", row: 3, col: 1}, ...]
            },
            playerStart: {startRow: 3, startCol: 3, startDir: 2},
            
            // Current code and game state
            currentWorkspace: [{type: "move_forward"}, ...],
            gameState: {...}  // From Phaser scene
        }
    })
});
```

### Backend Processing:
```javascript
// File: functions/index.js

exports.getChatResponse = onRequest({ cors: true }, async (req, res) => {
    const { messages, systemPrompt, levelContext } = req.body;
    
    // Build system message with context
    let systemMessage = systemPrompt;
    if (levelContext) {
        systemMessage += `\n\nCurrent Level Context:\n${JSON.stringify(levelContext, null, 2)}`;
    }
    
    // Send to OpenAI
    const apiMessages = [
        { role: "system", content: systemMessage },
        ...messages
    ];
    
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.7
    });
    
    res.json({ response: completion.choices[0].message.content });
});
```

---

## 🚀 What You Need To Do

### **OPTION 1: Redeploy Firebase Functions (REQUIRED)**
The backend Firebase function needs to be redeployed to pick up the new prompts:

```bash
# Navigate to your project directory
cd c:\Users\student\pAIrStudio

# Deploy functions
firebase deploy --only functions
```

This will update the Firebase backend with the correct system prompts that include the right block types.

### **OPTION 2: Verify Frontend is Loading Updated Prompts**
Check browser console to ensure updated prompts are being sent:
```javascript
// In browser console:
console.log(window.chatbotManager.getSystemPrompt());
```

Should show prompts with:
- `turn_clockwise` (not `rotate_clockwise`)
- `move_forward (no fields - always moves 1 tile)`

---

## 🐛 Debugging

### Check What AI Receives:
Add logging to see what context is sent to backend:
```javascript
// In ChatbotManager.js, getAIResponse() function, add:
console.log('Sending to AI:', { systemPrompt, levelContext });
```

### Check What AI Returns:
```javascript
// In ChatbotManager.js, parseAIResponse() function, add:
console.log('AI Response:', response);
```

### Verify GameAPI State:
```javascript
// In browser console:
if (window.GameAPI && window.GameAPI.getGameState) {
    console.log(window.GameAPI.getGameState());
} else {
    console.log('GameAPI.getGameState not available');
}
```

---

## ✅ Expected Behavior After Fix

Once Firebase is redeployed:
1. ✅ AI will use correct block types (`turn_clockwise`, not `rotate_clockwise`)
2. ✅ AI will NOT try to set `STEPS` field on `move_forward`
3. ✅ AI can see current workspace and suggest modifications
4. ✅ AI can clear workspace with `{"type": "clear_workspace"}`
5. ✅ AI receives full level context including Phaser scene state
6. ✅ Blocks will be created successfully without errors
