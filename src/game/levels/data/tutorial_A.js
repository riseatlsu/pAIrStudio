// Tutorial Level A - Introduction
// Non-experimental tutorial level with no chatbot assistance

import { NORTH, SOUTH, EAST, WEST } from '../../iso/DirectionConstants';

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
            // Input conveyor with box
            // { type: "conveyor", row: 0, col: 0, id: "input_conveyor", attributes: { allowDrop: false, frame: 0 } },
            // { type: "conveyor", row: 0, col: 1, id: "input_conveyor", attributes: { allowDrop: false, frame: 1 } },
            // { type: "conveyor", row: 0, col: 2, id: "input_conveyor", attributes: { allowDrop: false, frame: 2 } },
            ...[0, 1, 2].map(frame => ({ type: "conveyor", row: 0, col: frame, id: "input_conveyor", attributes: { allowDrop: false, frame } })), // shorten the code from above
            { type: "zone", row: 0, col: 3, id: "input_zone", attributes: { allowDrop: true } },
            ...[0, 2, 3].map(row => ({ type: "walls", row, col: 0, id: "walls", attributes: { allowDrop: false, frame: 0 } })), // testing 
            ...[1, 3, 4].map(col => ({ type: "walls", row: 0, col, id: "walls", attributes: { allowDrop: false, frame: 1 } })), // testing 
            { type: "shelves", row: 2, col: 3, id: "shelf", attributes: { allowDrop: false, frame: 0 } }, // testing shelf
            { type: "pillars", row: 0, col: 4, id: "pillar", attributes: { allowDrop: false, frame: 0 } }, // testing pillar
            { type: "OilDrums", row: 2, col: 0, id: "oilDrum", attributes: { allowDrop: false, frame: 0 } }, // testing oil drum
            // Output conveyor
            ...[0, 1, 2].map(frame => ({ type: "conveyor", row: 4, col: frame, id: "output_conveyor", attributes: { allowDrop: false, frame } })), // shorten the code from above
            { type: "zone", row: 4, col: 3, id: "output_zone", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Box on the input conveyor
            { type: "box", id: "tutorial_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 1, // Row 1
        startCol: 2,  // Column 2
        startDir: NORTH, // Facing North (towards row 0)
        scale: 1.5
    },

    winConditions: [
        // Win when box is on the output conveyor
        { type: "itemAtPos", itemId: "tutorial_box", row: 4, col: 2 }
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
