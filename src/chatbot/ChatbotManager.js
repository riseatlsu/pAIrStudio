/**
 * @fileoverview ChatbotManager - Controls AI chatbot behavior and experimental modes.
 * Manages chatbot visibility, message handling, and mode-specific behaviors.
 * @module chatbot/ChatbotManager
 */

/**
 * ChatbotManager.js
 * Manages chatbot visibility, initialization, and message handling based on experimental groups
 * Modular design for easy adaptation to future studies
 */

import { CHATBOT_PROMPTS } from './PromptConfig.js';
import { ChatbotUI } from './ChatbotUI.js';
import * as BlocklyActions from './BlocklyActions.js';
import { directionToString } from '../game/iso/DirectionConstants.js';

const CHAT_FUNCTION_URL = "https://us-central1-pair-studio-v1.cloudfunctions.net/getChatResponse";

/**
 * ChatbotManager - Manages AI chatbot functionality and experimental modes.
 * 
 * Modes:
 * - **Standard**: Passive AI assistant (for 'standard_ai' group)
 * - **Pair Programming**: Driver/Navigator mode with role switching
 * 
 * Features:
 * - Automatic initialization based on experimental group
 * - Context-aware AI responses with game state
 * - Message history management per level
 * - Integration with RoleManager for pair programming
 * - Workspace locking based on current role
 * - Firebase logging of all interactions
 * 
 * @class ChatbotManager
 */
class ChatbotManager {
    constructor() {
        this.experimentManager = null;
        this.roleManager = null;
        this.ui = null;
        this.chatHistory = [];
        this.isInitialized = false;
        this.currentMode = null; // 'standard' or 'pairProgramming'
    }

    /**
     * Initialize the chatbot manager
     * @param {Object} experimentManager - Reference to ExperimentManager
     * @param {Object} roleManager - Reference to RoleManager (for pair programming)
     */
    initialize(experimentManager, roleManager = null) {
        this.experimentManager = experimentManager;
        this.roleManager = roleManager;

        // Determine if chatbot should be available based on experimental group
        const hasChatbot = this.experimentManager.hasFeature('chatbot');
        
        if (!hasChatbot) {
            console.log('ChatbotManager: Chatbot disabled for control group');
            this.isInitialized = true;
            return;
        }

        // Initialize UI (always create it if group has chatbot support)
        this.ui = new ChatbotUI();
        this.ui.initialize();

        // Determine chatbot mode
        const chatbotMode = this.experimentManager.getFeature('chatbotMode');
        this.currentMode = (chatbotMode === 'driver_navigator') ? 'pairProgramming' : 'standard';
        
        console.log(`ChatbotManager: Mode set to '${this.currentMode}' (chatbotMode: ${chatbotMode})`);

        // Set up event listeners
        this.setupEventListeners();

        // Check if current level has chatbot disabled
        const currentLevel = window.LevelManager ? window.LevelManager.levels[window.LevelManager.currentLevelId] : null;
        const isChatbotDisabledForLevel = currentLevel?.chatbotEnabled === false;
        const isTutorialChatbotTraining = currentLevel?.id === 'tutorial_C';
        const shouldShowNow = !isChatbotDisabledForLevel;
        
        // Handle workspace blocking for Pair Programming mode
        if (this.currentMode === 'pairProgramming' && this.roleManager) {
            if (isTutorialChatbotTraining) {
                BlocklyActions.enableWorkspace();
                console.log('ChatbotManager: Workspace enabled - Tutorial C chatbot training');
            } else if (isChatbotDisabledForLevel) {
                // Tutorials/Baseline: chatbot disabled means user must drive
                BlocklyActions.enableWorkspace();
                console.log('ChatbotManager: Workspace enabled - Chatbot disabled for this level');
            } else {
                const userRole = this.roleManager.getCurrentRole();
                if (userRole === 'navigator') {
                    // User is navigator - AI is driver - disable user's workspace interaction
                    BlocklyActions.disableWorkspace();
                    console.log('ChatbotManager: Workspace disabled - User is navigator, AI is the driver');
                } else {
                    // User is driver - AI is navigator - enable workspace for user
                    BlocklyActions.enableWorkspace();
                    console.log('ChatbotManager: Workspace enabled - User is the driver, AI is navigator');
                }
            }
        } else {
            // Standard mode - workspace always enabled
            BlocklyActions.enableWorkspace();
        }
        
        if (shouldShowNow) {
            // Load conversation history for current level
            this.loadHistory();

            // If no history, send initial greeting
            if (this.chatHistory.length === 0) {
                this.sendInitialGreeting();
            }

            // Show the chatbot
            this.show();
        } else {
            // Hide initially if current level has it disabled
            this.hide();
            console.log('ChatbotManager: Chatbot hidden for current level (will show on enabled levels)');
        }

        this.isInitialized = true;
        console.log(`ChatbotManager: Initialized in ${this.currentMode} mode`);
    }

    /**
     * Set up event listeners for chatbot interactions
     */
    setupEventListeners() {
        // Listen for user messages
        this.ui.onSendMessage((message) => {
            this.handleUserMessage(message);
        });
    }

    /**
     * Send initial greeting based on mode
     */
    sendInitialGreeting() {
        let greeting = '';
        
        // Check if current level is a tutorial - always use standard mode for tutorials
        const currentLevel = window.LevelManager?.currentLevelId || '';
        const isTutorial = currentLevel.startsWith('tutorial_');
        
        console.log(`ChatbotManager: sendInitialGreeting - Level: ${currentLevel}, IsTutorial: ${isTutorial}, Mode: ${this.currentMode}`);
        
        if (this.currentMode === 'pairProgramming' && !isTutorial) {
            const userRole = this.roleManager ? this.roleManager.getCurrentRole() : 'driver';
            // AI role is OPPOSITE of user role
            const aiRole = userRole === 'driver' ? 'navigator' : 'driver';
            console.log(`ChatbotManager: Pair programming - UserRole: ${userRole}, AIRole: ${aiRole}`);
            greeting = CHATBOT_PROMPTS.pairProgramming.initialGreeting[aiRole];
        } else {
            console.log(`ChatbotManager: Using standard greeting`);
            greeting = CHATBOT_PROMPTS.standard.initialGreeting;
        }

        // Add to history
        this.chatHistory.push({
            role: 'assistant',
            content: greeting
        });
        
        // Save to localStorage
        this.saveHistory();

        if (this.ui) {
            this.ui.addBotMessage(greeting);
        }
    }

    /**
     * Handle user message
     * @param {string} message - User's message
     */
    async handleUserMessage(message) {
        // Add to chat history
        this.chatHistory.push({
            role: 'user',
            content: message
        });

        // Save history to localStorage
        this.saveHistory();

        // Log message if logging is available
        const currentLevel = window.LevelManager?.currentLevelId || 'unknown';
        if (window.dataLogger) {
            window.dataLogger.logChatMessage('user', message, currentLevel);
        }

        // Get system prompt based on mode and role
        const systemPrompt = this.getSystemPrompt();

        // Get game state for context
        const gameState = this.getGameStateContext();

        try {
            // Call the backend API
            const aiResponse = await this.getAIResponse(message);
            
            // Add AI response to history
            this.chatHistory.push({
                role: 'assistant',
                content: aiResponse.message
            });

            // Save history to localStorage
            this.saveHistory();

            // Display message in UI
            this.ui.addBotMessage(aiResponse.message);
            
            // Handle code blocks if present
            if (aiResponse.blocks && aiResponse.blocks.length > 0) {
                this.handleCodeGeneration(aiResponse.blocks);
            }

            // Log bot response with full context
            const currentLevel = window.LevelManager?.currentLevelId || 'unknown';
            if (window.dataLogger) {
                // Log the message
                window.dataLogger.logChatMessage('assistant', aiResponse.message, currentLevel);
                
                // Log the full AI interaction context (system prompt + level context) for analysis
                window.dataLogger.logEvent('ai_interaction_context', {
                    levelId: currentLevel,
                    systemPrompt: systemPrompt,
                    levelContext: this.getLevelContext(),
                    userMessage: message,
                    aiResponse: aiResponse.message,
                    hadCodeBlocks: (aiResponse.blocks && aiResponse.blocks.length > 0)
                });
            }
        } catch (error) {
            console.error('ChatbotManager: Error handling message', error);
            this.ui.addBotMessage('❌ Sorry, I encountered an error. Please try again.');
        }
    }

    /**
     * Get storage key for conversation history
     * @returns {string} Storage key
     */
    getStorageKey() {
        const participantId = this.experimentManager?.participantId || 'anonymous';
        const levelId = window.LevelManager?.currentLevelId || 'level_001';
        const key = `chatHistory_${participantId}_${levelId}`;
        console.log('ChatbotManager: Storage key:', key);
        return key;
    }

    /**
     * Save conversation history to localStorage
     */
    saveHistory() {
        try {
            const key = this.getStorageKey();
            console.log('ChatbotManager: Saving history with key:', key, 'Messages:', this.chatHistory.length);
            localStorage.setItem(key, JSON.stringify(this.chatHistory));
            console.log('ChatbotManager: History saved successfully');
        } catch (error) {
            console.error('ChatbotManager: Error saving history', error);
        }
    }

    /**
     * Load conversation history from localStorage
     */
    loadHistory() {
        try {
            const key = this.getStorageKey();
            console.log('ChatbotManager: Loading history with key:', key);
            const savedHistory = localStorage.getItem(key);
            console.log('ChatbotManager: Raw saved data:', savedHistory);
            
            if (savedHistory) {
                this.chatHistory = JSON.parse(savedHistory);
                console.log(`ChatbotManager: Loaded ${this.chatHistory.length} messages from history`);
                
                // Restore messages in UI (only if UI exists)
                if (this.ui) {
                    this.chatHistory.forEach(msg => {
                        if (msg.role === 'user') {
                            this.ui.addUserMessage(msg.content);
                        } else if (msg.role === 'assistant') {
                            this.ui.addBotMessage(msg.content);
                        }
                    });
                }
            } else {
                console.log('ChatbotManager: No saved history found');
                this.chatHistory = [];
            }
        } catch (error) {
            console.error('ChatbotManager: Error loading history', error);
            this.chatHistory = [];
        }
    }

    /**
     * Get system prompt based on current mode and role
     * @returns {string} System prompt
     */
    getSystemPrompt() {
        // Check if current level is a tutorial - always use standard mode for tutorials
        const currentLevel = window.LevelManager?.currentLevelId || '';
        const isTutorial = currentLevel.startsWith('tutorial_');
        
        if (this.currentMode === 'pairProgramming' && !isTutorial) {
            const userRole = this.roleManager ? this.roleManager.getCurrentRole() : 'driver';
            // AI role is OPPOSITE of user role
            const aiRole = userRole === 'driver' ? 'navigator' : 'driver';
            return CHATBOT_PROMPTS.pairProgramming.systemPrompt[aiRole];
        } else {
            return CHATBOT_PROMPTS.standard.systemPrompt;
        }
    }

    /**
     * Get game state context for the chatbot
     * @returns {Object|null} Game state summary
     */
    getGameStateContext() {
        if (window.GameStateSerializer) {
            return window.GameStateSerializer.getInitialGameStateSummary();
        }
        return null;
    }

    /**
     * Get response from backend API
     * @param {string} userText - User message
     * @returns {Promise<Object>} Response object with message and optional blocks
     */
    async getAIResponse(userText) {
        try {
            // Get system prompt based on mode and role
            const systemPrompt = this.getSystemPrompt();
            
            // Get level context
            const levelContext = this.getLevelContext();
            
            // Build messages array (last 10 messages to keep context manageable)
            const recentHistory = this.chatHistory.slice(-10);
            const messages = [
                ...recentHistory,
                { role: 'user', content: userText }
            ];
            
            const response = await fetch(CHAT_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    messages,
                    systemPrompt,
                    levelContext
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Get AI role for parse-time filtering
            let aiRole = null;
            if (this.currentMode === 'pairProgramming' && this.roleManager) {
                const userRole = this.roleManager.getCurrentRole();
                // AI role is opposite of user role
                aiRole = userRole === 'driver' ? 'navigator' : 'driver';
            }
            
            // Try to parse JSON code blocks from response
            return this.parseAIResponse(data.response, aiRole);
        } catch (error) {
            console.error("ChatbotManager: Error calling the chatbot:", error);
            return { message: "Sorry, I'm having trouble connecting to the brain right now." };
        }
    }

    /**
     * Parse AI response for JSON code blocks
     * @param {string} response - Raw response from AI
     * @param {string|null} aiRole - Current AI role (for permission filtering)
     * @returns {Object} Parsed response with message and optional blocks
     */
    parseAIResponse(response, aiRole = null) {
        // Check if response contains a JSON code block
        const jsonMatch = response.match(/```json\s*([\s\S]*?)```/);
        
        if (jsonMatch) {
            try {
                // Remove comments from JSON (AI sometimes adds them despite instructions)
                let jsonString = jsonMatch[1];
                
                // Remove single-line comments (// ...)
                jsonString = jsonString.replace(/\/\/.*$/gm, '');
                
                // Remove multi-line comments (/* ... */)
                jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
                
                // Parse the cleaned JSON
                const parsed = JSON.parse(jsonString);
                
                // HARD AFFORDANCE RESTRICTION: Strip blocks if AI is navigator
                if (aiRole === 'navigator' && parsed.blocks) {
                    console.warn('ChatbotManager: AI Navigator attempted to send blocks - BLOCKED at parse level');
                    delete parsed.blocks;
                }
                
                return {
                    message: parsed.message || response,
                    blocks: parsed.blocks || null
                };
            } catch (error) {
                console.error('ChatbotManager: Failed to parse JSON code block:', error);
                console.error('Raw JSON:', jsonMatch[1]);
                return { message: response };
            }
        }
        
        return { message: response };
    }

    /**
     * Get level context for AI
     * @returns {Object|null} Level configuration and state
     */
    getLevelContext() {
        if (!window.LevelManager) return null;
        
        try {
            const currentLevel = window.LevelManager.levels[window.LevelManager.currentLevelId];
            if (!currentLevel) return null;
            
            // Get current workspace state (what blocks are already placed)
            const currentWorkspace = BlocklyActions.getWorkspaceState();
            
            // Get player start info and convert direction to string
            const playerStart = currentLevel.player ? { ...currentLevel.player } : null;
            if (playerStart && playerStart.startDir !== undefined) {
                // Convert direction to string for chatbot
                playerStart.startDirection = directionToString(playerStart.startDir);
                // Keep numeric startDir for backward compatibility if needed
            }
            
            // Return ONLY initial level configuration (not dynamic game state)
            // This ensures the chatbot works from the starting conditions only
            return {
                id: currentLevel.id,
                title: currentLevel.title,
                description: currentLevel.description,
                instructions: currentLevel.instructions,
                allowedBlocks: currentLevel.allowedBlocks,
                winConditions: currentLevel.winConditions,
                mapSize: currentLevel.map ? { width: currentLevel.map.width, height: currentLevel.map.height } : null,
                objects: currentLevel.objects,
                playerStart: playerStart,
                currentWorkspace: currentWorkspace
            };
        } catch (error) {
            console.error('ChatbotManager: Error getting level context:', error);
            return null;
        }
    }

    /**
     * Handle code generation from AI
     * @param {Array<Object>} blocks - Block specifications from AI
     */
    handleCodeGeneration(blocks) {
        try {
            // In Pair Programming mode, check if AI is navigator (user is driver)
            if (this.currentMode === 'pairProgramming') {
                const userRole = this.roleManager ? this.roleManager.getCurrentRole() : 'driver';
                const aiRole = userRole === 'driver' ? 'navigator' : 'driver';
                
                if (aiRole === 'navigator') {
                    // AI is navigator, user is driver - bot should NEVER modify code
                    console.log('ChatbotManager: Navigator mode - bot cannot modify code (user is driver)');
                    this.ui.addBotMessage('💡 As your navigator, I can only guide you - you have control of the code!');
                    return;
                }
            }
            
            // Check if AI wants to clear workspace only (look for special 'clear' command)
            const shouldClear = blocks.some(b => b.type === 'clear_workspace');
            if (shouldClear) {
                BlocklyActions.clearWorkspace();
                // Filter out the clear command
                blocks = blocks.filter(b => b.type !== 'clear_workspace');
                
                // If only clearing (no blocks to add after), we're done
                if (blocks.length === 0) {
                    console.log('ChatbotManager: Workspace cleared successfully');
                    return;
                }
            }
            
            // ALWAYS clear workspace before adding blocks to REPLACE code, not append
            // This ensures the bot sends complete solutions, not incremental additions
            if (blocks.length > 0) {
                console.log('ChatbotManager: Clearing workspace before adding complete solution');
                BlocklyActions.clearWorkspace();
            }
            
            // For standard AI mode, add complete solution
            if (this.currentMode === 'standard') {
                const count = BlocklyActions.addBlocks(blocks, false);
                if (count === 0 && blocks.length > 0) {
                    this.ui.addBotMessage('⚠️ I tried to add blocks but encountered errors. Please check the console.');
                }
                console.log(`ChatbotManager: Added ${count} blocks from AI (complete solution)`);
                return;
            }
            
            // For pair programming Driver mode, AI writes all code
            if (this.currentMode === 'pairProgramming') {
                const userRole = this.roleManager ? this.roleManager.getCurrentRole() : 'driver';
                const aiRole = userRole === 'driver' ? 'navigator' : 'driver';
                
                if (aiRole === 'driver') {
                    // AI is driver - add blocks and keep workspace disabled
                    const count = BlocklyActions.addBlocks(blocks, false);
                    if (count === 0 && blocks.length > 0) {
                        this.ui.addBotMessage('⚠️ I tried to add blocks but encountered errors. Please check the console.');
                    }
                    console.log(`ChatbotManager: Driver AI added ${count} blocks (complete solution)`);
                }
            }
        } catch (error) {
            console.error('ChatbotManager: Error handling code generation:', error);
            this.ui.addBotMessage('❌ Sorry, I encountered an error while adding blocks.');
        }
    }

    /**
     * Show the chatbot
     */
    show() {
        if (this.ui) {
            this.ui.show();
        }
    }

    /**
     * Hide the chatbot
     */
    hide() {
        if (this.ui) {
            this.ui.hide();
        } else {
            // Hide directly via DOM if UI not initialized
            const chatbotElement = document.getElementById('chatbot');
            if (chatbotElement) {
                chatbotElement.style.display = 'none';
            }
        }
    }

    /**
     * Clear chat history
     */
    clearHistory() {
        this.chatHistory = [];
        
        // Clear from localStorage
        try {
            const key = this.getStorageKey();
            localStorage.removeItem(key);
        } catch (error) {
            console.error('ChatbotManager: Error clearing history from storage', error);
        }
        
        if (this.ui) {
            this.ui.clearMessages();
            this.sendInitialGreeting();
        }
    }

    /**
     * Switch to a new level (reload history for that level)
     * @param {string} levelId - New level ID
     * @param {Object} levelConfig - Level configuration object
     */
    switchLevel(levelId, levelConfig = null) {
        console.log(`ChatbotManager: Switching to level ${levelId}`);
        
        // Check if chatbot should be disabled for this level
        if (levelConfig && levelConfig.chatbotEnabled === false) {
            console.log(`ChatbotManager: Chatbot disabled for level ${levelId}`);
            // Ensure Blockly toolbox/workspace is enabled in tutorials/baseline
            BlocklyActions.enableWorkspace();
            this.hide();
            return;
        }
        
        // Check if chatbot is enabled for user's experimental group
        const hasChatbot = this.experimentManager.hasFeature('chatbot');
        if (!hasChatbot) {
            this.hide();
            return;
        }
        
        // Show chatbot if it was hidden
        this.show();

        // Ensure workspace permissions match current role in pair programming
        if (this.currentMode === 'pairProgramming' && this.roleManager) {
            if (levelId === 'tutorial_C') {
                BlocklyActions.enableWorkspace();
                console.log('ChatbotManager: Workspace enabled - Tutorial C chatbot training');
            } else {
                const userRole = this.roleManager.getCurrentRole();
                if (userRole === 'navigator') {
                    BlocklyActions.disableWorkspace();
                    console.log('ChatbotManager: Workspace disabled - User is navigator, AI is the driver');
                } else {
                    BlocklyActions.enableWorkspace();
                    console.log('ChatbotManager: Workspace enabled - User is the driver, AI is navigator');
                }
            }
        }
        
        // Clear UI
        if (this.ui) {
            this.ui.clearMessages();
        }
        
        // Load history for new level
        this.loadHistory();
        
        // For pair programming mode, ALWAYS send a fresh greeting when switching levels
        // because the role may have changed (don't rely on cached history)
        const isPairProgramming = this.currentMode === 'pairProgramming';
        const isTutorial = levelId.startsWith('tutorial_');
        
        if (isPairProgramming && !isTutorial) {
            // Clear history and send fresh greeting based on current role
            this.chatHistory = [];
            this.sendInitialGreeting();
        } else if (this.chatHistory.length === 0) {
            // Standard mode or tutorials: only send greeting if no history
            this.sendInitialGreeting();
        }
    }

    /**
     * Update chatbot when role changes (for pair programming)
     * @param {string} newRole - New role ('driver' or 'navigator')
     */
    onRoleChange(newRole) {
        if (this.currentMode !== 'pairProgramming') return;

        console.log(`ChatbotManager: User role changed to ${newRole}`);
        
        // Update workspace permissions based on USER's role
        if (newRole === 'navigator') {
            // User is navigator - AI is driver - disable user's workspace
            BlocklyActions.disableWorkspace();
            console.log('ChatbotManager: Workspace disabled - User is navigator, AI is driver');
        } else {
            // User is driver - AI is navigator - enable user's workspace
            BlocklyActions.enableWorkspace();
            console.log('ChatbotManager: Workspace enabled - User is driver, AI is navigator');
        }
        
        // Update chatbot title based on AI's role (opposite of user's role)
        // newRole is the USER's role, so AI role is the opposite
        const aiRole = newRole === 'driver' ? 'navigator' : 'driver';
        const title = aiRole === 'driver' 
            ? '🚗 Mike AI - Driver'
            : '🧭 Mike AI - Navigator';
        
        if (this.ui) {
            this.ui.updateTitle(title);
        }

        // Send role change notification based on AI's role
        const roleChangeMessage = aiRole === 'driver'
            ? "🔄 Role switched! I'm now the **driver** - I'll write the code based on your navigation guidance."
            : "🔄 Role switched! I'm now the **navigator** - I'll guide you on what code to write.";
        
        this.ui.addBotMessage(roleChangeMessage);
    }

    /**
     * Get conversation history
     * @returns {Array} Chat history
     */
    getHistory() {
        return this.chatHistory;
    }
}

// Create singleton instance
const chatbotManager = new ChatbotManager();

// Export singleton
export default chatbotManager;
export { chatbotManager };
