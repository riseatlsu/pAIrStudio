// Tutorial Level B - Advanced Blocks
// Non-experimental tutorial level teaching loops and logic

export const TutorialB = {
    id: "tutorial_B",
    title: "Tutorial: Loops & Logic",
    description: "Learn to use repeat blocks and conditionals.",
    instructions: "Use a 'repeat' block to efficiently move the robot and handle multiple boxes. Pick up all three boxes from the input conveyor and place them on the output conveyor. Try using 'repeat 3 times' to avoid repeating code!",
    
    // Mark as non-experimental (won't be included in study data)
    isExperiment: false,
    
    // Disable chatbot for ALL groups on this level
    chatbotEnabled: false,
    
    // 6x6 Grid with multiple boxes
    map: {
        width: 6,
        height: 6,
        data: [
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1]
        ]
    },

    objects: {
        stationary: [
            // Input conveyor
            { type: "conveyor", row: 1, col: 1, id: "input_conveyor", attributes: { allowDrop: true } },
            // Output conveyor
            { type: "conveyor", row: 4, col: 4, id: "output_conveyor", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Three boxes on the input conveyor
            { type: "box", id: "box_1", row: 1, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 2,  
        startCol: 1,  
        startDir: 3,  // Facing North
        scale: 1.5
    },

    winConditions: [
        // Win when box is on the output conveyor
        { type: "itemAtPos", itemId: "box_1", row: 4, col: 4 }
    ],

    failConditions: [
        {
            type: "object_wrong_location",
            description: "A box was placed in the wrong location"
        }
    ],

    // Toolbox configuration - introduce loops
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counterclockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true  // Enable loops for this tutorial
    }
};
