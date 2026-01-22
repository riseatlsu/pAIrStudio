// Level 1 Definition
// Objective: Move the box from the input conveyor (Left) to the output conveyor (Right).

export const Level1 = {
    id: "level_001",
    title: "First Steps",
    description: "Program the robot to pick up the package from the input belt and place it on the output belt.",
    instructions: "Welcome to your first challenge! Move the robot to pick up the box from the input conveyor belt on the left, then deliver it to the output conveyor belt on the right. Use the movement, turn, and pickup/drop blocks to program the robot.",
    
    // Experimental level settings
    isExperiment: true,      // This level is part of the experiment
    chatbotEnabled: true,    // Chatbot available based on group assignment
    
    // 8x8 Grid
    // 1 = Floor, 0 = Empty (if any)
    map: {
        width: 8,
        height: 8,
        data: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    objects: {
        stationary: [
            // Input Conveyor (Where box starts) - Top-Left ish (0,2)
            { type: "conveyor", row: 0, col: 2, id: "input_belt", attributes: { allowDrop: true } },
            
            // Output Conveyor (Goal) - Bottom-Right ish (7,2)
            { type: "conveyor", row: 7, col: 2, id: "output_belt_1", attributes: { allowDrop: true } }
        ],
        moveable: [
            // The Box - Starts on Input Conveyor
            { type: "box", id: "package_001", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 2,
        startCol: 2,
        startDir: 3, // Facing North (NE)
        scale: 1.5 // Slightly smaller than 2.1
    },

    winConditions: [
         { type: "itemAtPos", itemId: "package_001", row: 7, col: 2 }
    ],

    maxSteps: 20,
    
    // Available blocks for this level - teaching basics
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,  // No sensing blocks in first level
        logic: false,    // No logic blocks yet
        math: false,     // No math blocks yet
        text: false,     // No text blocks
        loops: true     // No loops in first level - teach sequential thinking
    }
};
