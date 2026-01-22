/**
 * ChatbotUI.js
 * Handles chatbot DOM manipulation, message rendering, and draggable functionality
 * Separated from ChatbotManager for modularity
 */

export class ChatbotUI {
    constructor() {
        this.chatbotElement = null;
        this.headerElement = null;
        this.messagesContainer = null;
        this.inputElement = null;
        this.sendButton = null;
        this.toggleButton = null;
        this.titleElement = null;
        
        // Dragging state
        this.isDragging = false;
        this.wasDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;

        // Message callback
        this.onSendCallback = null;
    }

    /**
     * Initialize the chatbot UI
     */
    initialize() {
        // Get DOM elements
        this.chatbotElement = document.getElementById('chatbot');
        this.headerElement = document.getElementById('chatbot-header');
        this.messagesContainer = document.getElementById('chat-messages');
        this.inputElement = document.getElementById('chat-input');
        this.sendButton = document.getElementById('chat-send-btn');
        this.toggleButton = document.getElementById('toggle-chat-btn');
        this.titleElement = this.chatbotElement?.querySelector('.chatbot-title span');

        if (!this.chatbotElement) {
            console.error('ChatbotUI: Chatbot container not found');
            return;
        }

        // Set up draggable functionality
        this.setupDraggable();

        // Set up message input
        this.setupMessageInput();

        // Set up toggle button
        this.setupToggle();

        console.log('ChatbotUI: Initialized');
    }

    /**
     * Set up draggable functionality
     */
    setupDraggable() {
        if (!this.headerElement) return;

        this.headerElement.addEventListener('mousedown', (e) => this.dragStart(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.dragEnd());

        // Touch support for mobile
        this.headerElement.addEventListener('touchstart', (e) => this.dragStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('touchend', () => this.dragEnd());
        
        // Click to expand when minimized
        this.headerElement.addEventListener('click', (e) => {
            // Don't expand if clicking the toggle button
            if (e.target.closest('.chatbot-btn')) {
                return;
            }
            
            // Only expand if minimized and not dragging
            if (this.chatbotElement.classList.contains('minimized') && !this.wasDragging) {
                this.toggleMinimize();
            }
        });
    }

    /**
     * Start dragging
     */
    dragStart(e) {
        // Disable dragging when minimized
        if (this.chatbotElement.classList.contains('minimized')) {
            return;
        }
        
        // Don't drag if clicking on interactive elements
        if (e.target.closest('.chatbot-btn') || 
            e.target.closest('.chatbot-input') || 
            e.target.closest('.chatbot-send') || 
            e.target.closest('.chatbot-messages')) {
            return;
        }

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        this.initialX = clientX - this.xOffset;
        this.initialY = clientY - this.yOffset;
        this.isDragging = true;
        this.wasDragging = false;

        // Disable transitions during drag
        this.chatbotElement.classList.add('dragging');
        this.headerElement.style.cursor = 'grabbing';
    }

    /**
     * Drag
     */
    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        this.wasDragging = true;

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        let newX = clientX - this.initialX;
        let newY = clientY - this.initialY;
        
        // Get chatbot dimensions
        const chatbotRect = this.chatbotElement.getBoundingClientRect();
        const chatbotWidth = chatbotRect.width;
        const chatbotHeight = chatbotRect.height;
        
        // Calculate the chatbot's position without transform
        const baseLeft = chatbotRect.left - this.xOffset;
        const baseTop = chatbotRect.top - this.yOffset;
        
        // Calculate boundaries (chatbot must stay fully within window)
        const minX = -baseLeft;
        const maxX = window.innerWidth - baseLeft - chatbotWidth;
        const minY = -baseTop;
        const maxY = window.innerHeight - baseTop - chatbotHeight;
        
        // Clamp the position to stay within bounds
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
        
        this.currentX = newX;
        this.currentY = newY;
        this.xOffset = this.currentX;
        this.yOffset = this.currentY;

        this.setTranslate(this.currentX, this.currentY);
    }

    /**
     * End dragging
     */
    dragEnd() {
        this.initialX = this.currentX;
        this.initialY = this.currentY;
        this.isDragging = false;

        // Re-enable transitions
        this.chatbotElement.classList.remove('dragging');

        if (this.headerElement) {
            this.headerElement.style.cursor = this.chatbotElement.classList.contains('minimized') ? 'pointer' : 'move';
        }
        
        // Reset wasDragging after a short delay to prevent click event
        setTimeout(() => {
            this.wasDragging = false;
        }, 100);
    }

    /**
     * Set transform position
     */
    setTranslate(xPos, yPos) {
        if (this.chatbotElement) {
            this.chatbotElement.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
    }

    /**
     * Set up message input and send button
     */
    setupMessageInput() {
        if (!this.inputElement || !this.sendButton) return;

        // Send on Enter key
        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
    }

    /**
     * Send message
     */
    sendMessage() {
        const message = this.inputElement.value.trim();
        if (!message) return;

        // Add user message to UI
        this.addUserMessage(message);

        // Clear input
        this.inputElement.value = '';

        // Disable send button
        this.setSendingState(true);

        // Call callback
        if (this.onSendCallback) {
            this.onSendCallback(message);
        }
    }

    /**
     * Set sending state (disable/enable input)
     */
    setSendingState(isSending) {
        if (this.sendButton) {
            this.sendButton.disabled = isSending;
            this.sendButton.innerHTML = isSending 
                ? '<i class="fas fa-spinner fa-spin"></i>'
                : '<i class="fas fa-paper-plane"></i>';
        }

        if (this.inputElement) {
            this.inputElement.disabled = isSending;
        }
    }

    /**
     * Set up toggle (minimize/maximize) button
     */
    setupToggle() {
        if (!this.toggleButton) return;

        this.toggleButton.addEventListener('click', () => {
            this.toggleMinimize();
        });
    }

    /**
     * Toggle minimize/maximize
     */
    toggleMinimize() {
        if (!this.chatbotElement) return;

        const isMinimized = this.chatbotElement.classList.toggle('minimized');
        
        const icon = this.toggleButton.querySelector('i');
        if (icon) {
            icon.className = isMinimized ? 'fas fa-plus' : 'fas fa-minus';
        }

        this.toggleButton.title = isMinimized ? 'Maximize' : 'Minimize';
        
        // Update cursor
        if (this.headerElement) {
            this.headerElement.style.cursor = isMinimized ? 'pointer' : 'move';
        }
    }

    /**
     * Add user message to chat
     */
    addUserMessage(message) {
        if (!this.messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message user-message';
        messageDiv.textContent = message;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Add bot message to chat
     */
    addBotMessage(message) {
        if (!this.messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot-message';
        
        // Support markdown-style bold
        const formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        messageDiv.innerHTML = formattedMessage;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Re-enable send button after bot responds
        this.setSendingState(false);
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    /**
     * Update chatbot title
     */
    updateTitle(title) {
        if (this.titleElement) {
            this.titleElement.textContent = title;
        }
    }

    /**
     * Show chatbot
     */
    show() {
        if (this.chatbotElement) {
            this.chatbotElement.style.display = 'flex';
        }
    }

    /**
     * Hide chatbot
     */
    hide() {
        if (this.chatbotElement) {
            this.chatbotElement.style.display = 'none';
        }
    }

    /**
     * Set callback for when user sends a message
     */
    onSendMessage(callback) {
        this.onSendCallback = callback;
    }
}
