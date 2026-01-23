// Tutorial Level C - Chatbot Practice
// Tutorial level for groups with chatbot support
// Teaches participants how to interact with the AI assistant

import { NORTH, SOUTH, EAST, WEST } from '../../iso/DirectionConstants';

export const TutorialC = {
    id: "tutorial_C",
    title: "Tutorial: Working with AI",
    description: "Learn to use the chatbot for programming assistance.",
    instructions: "This level introduces you to the AI chatbot assistant. Try asking the chatbot questions like 'How do I pick up a box?' or 'What blocks should I use?'. Complete the challenge by moving the box to the output conveyor while practicing chatbot interaction.",
    
    // Mark as non-experimental (won't be included in study data)
    isExperiment: false,
    
    // ENABLE chatbot for this tutorial (only shown to groups that have chatbot)
    chatbotEnabled: true,
    
    // Simple 5x5 Grid similar to tutorial_A
    map: {
        width: 5,
        height: 5,
        data: [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ]
    },

    objects: {
        stationary: [
            // Input conveyor with box
            { type: "conveyor", row: 0, col: 2, id: "input_conveyor", attributes: { allowDrop: true } },
            // Output conveyor
            { type: "conveyor", row: 4, col: 2, id: "output_conveyor", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Single box
            { type: "box", id: "chatbot_practice_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 2,
        startCol: 2,
        startDir: NORTH,  // Facing North
        scale: 1.5
    },

    winConditions: [
        // Win when box is on the output conveyor
        { type: "itemAtPos", itemId: "chatbot_practice_box", row: 4, col: 2 }
    ],

    failConditions: [
        {
            type: "object_wrong_location",
            description: "The box was placed in the wrong location"
        }
    ],

    // Toolbox configuration - similar to tutorial_A
    allowedBlocks: {
        actions: true,
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true  // Allow loops like tutorial_B
    },
    
    // Custom chatbot prompt for this tutorial level
    chatbotPrompt: {
        systemMessage: "You are a friendly programming tutor helping a student learn to use visual block-based programming. This is a tutorial level designed to help them practice asking questions and using AI assistance. Be encouraging and guide them step-by-step. Remind them they can ask you questions anytime during their programming tasks.",
        initialGreeting: "Hi! 👋 I'm your AI programming assistant. I'm here to help you learn! Try asking me questions like:\n• 'How do I pick up a box?'\n• 'What should I do first?'\n• 'Can you explain the move forward block?'\n\nWhat would you like to know?"
    }
};
