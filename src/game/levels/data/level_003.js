// Level 3 Definition
// Objective: Deliver boxes to different destinations based on pattern
// Introduces basic spatial reasoning with multiple destinations

import { NORTH, SOUTH, EAST, WEST } from '../../iso/DirectionConstants';

export const Level3 = {
    id: "level_003",
    title: "Multi-Destination Delivery",
    description: "Deliver boxes to different output conveyors efficiently.",
    instructions: "You have two boxes to deliver to different output conveyors. Plan your route carefully to minimize the number of steps. Think about which box to deliver first to avoid backtracking.",
    
    // Experimental level settings
    isExperiment: true,
    chatbotEnabled: true,
    
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
            // Input area (left side, center)
            { type: "conveyor", row: 3, col: 1, id: "input_area_1", attributes: { allowDrop: true } },
            { type: "conveyor", row: 4, col: 1, id: "input_area_2", attributes: { allowDrop: true } },
            
            // Output conveyor 1 (top-right)
            { type: "conveyor", row: 1, col: 6, id: "output_belt_1", attributes: { allowDrop: true } },
            
            // Output conveyor 2 (bottom-right)
            { type: "conveyor", row: 6, col: 6, id: "output_belt_2", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Box 1 - should go to output_belt_1 (top)
            { type: "box", id: "box_alpha", row: 3, col: 1, attributes: {} },
            
            // Box 2 - should go to output_belt_2 (bottom)
            { type: "box", id: "box_beta", row: 4, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 4,
        startCol: 3,
        startDir: WEST, // Facing West
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "box_alpha", row: 1, col: 6 },
        { type: "itemAtPos", itemId: "box_beta", row: 6, col: 6 }
    ],

    maxSteps: 50,
    
    // Available blocks - movement and loops
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
