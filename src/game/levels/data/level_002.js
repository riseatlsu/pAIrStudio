// Level 2 Definition
// Objective: Sort boxes to different conveyor belts based on a simple pattern
// AI DISABLED for all groups - independent problem solving

import { NORTH, SOUTH, EAST, WEST } from '../../iso/DirectionConstants';

export const Level2 = {
    id: "level_002",
    title: "Sorting Challenge",
    description: "Move two boxes from the input area to their designated output conveyors.",
    instructions: "You have two boxes to deliver. Pick up each box from the input area and place them on their respective output conveyors. Plan your route carefully to avoid unnecessary movements.",
    
    // Experimental level settings
    isExperiment: true,
    chatbotEnabled: true,  // NO AI for any group on this level
    
    // 8x8 Grid
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
            // Input area (center-left)
            { type: "conveyor", row: 3, col: 1, id: "input_area", attributes: { allowDrop: true } },
            
            // { type: "conveyor", row: 1, col: 1, id: "input_area", attributes: { allowDrop: true } },
            
            // Output conveyor 1 (top-right)
            { type: "conveyor", row: 1, col: 6, id: "output_belt_1", attributes: { allowDrop: true } },
            
            // Output conveyor 2 (bottom-right)
            // { type: "conveyor", row: 6, col: 6, id: "output_belt_2", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Box 1 - should go to output_belt_1
            { type: "box", id: "box_alpha", row: 3, col: 1, attributes: {} },
            
            // Box 2 - should go to output_belt_2
            // { type: "box", id: "box_beta", row: 1, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 3,
        startCol: 3,
        startDir: WEST, // Facing West
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "box_alpha", row: 1, col: 6 }
        // { type: "itemAtPos", itemId: "box_beta", row: 6, col: 6 }
    ],

    maxSteps: 40,
    
    // Available blocks - introduce loops for efficiency
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true  // Students can use loops to optimize their solution
    }
};
