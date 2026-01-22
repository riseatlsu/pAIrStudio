// Tutorial Level A - Introduction
// Non-experimental tutorial level with no chatbot assistance

export const TutorialA = {
    id: "tutorial_A",
    title: "Tutorial: Basic Movement",
    description: "Learn how to move the robot and handle objects.",
    instructions: "Welcome to pAIrStudio! Pick up the box from the input conveyor (in front of you), turn, move forward one space, then drop it on the output conveyor. Use 'pick object', 'turn clockwise', 'move forward', and 'drop object' blocks. Click 'Run Code' when ready!",
    
    // Mark as non-experimental (won't be included in study data)
    isExperiment: false,
    
    // Disable chatbot for ALL groups on this level
    chatbotEnabled: false,
    
    // Simple 5x5 Grid
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
            // Input conveyor with box (directly in front of robot)
            // Note: coordinates are (row, col) where row increases South, col increases East
            { type: "conveyor", row: 0, col: 2, id: "input_conveyor", attributes: { allowDrop: true } },
            // Output conveyor one space further south
            { type: "conveyor", row: 3, col: 2, id: "output_conveyor", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Box on the input conveyor
            { type: "box", id: "tutorial_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 1,  // Row 1
        startCol: 2,  // Column 2
        startDir: 3, // Facing North (towards row 0)
        scale: 1.5
    },

    winConditions: [
        // Win when box is on the output conveyor
        { type: "itemAtPos", itemId: "tutorial_box", row: 3, col: 2 }
    ],

    maxSteps: 10,
    
    // Very limited blocks - pick, move, and drop
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'pick_object', 'drop_object'],  // Only essential blocks for tutorial
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: false  // No loops yet - teach sequential thinking first
    }
};
