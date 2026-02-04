// Level 3 Definition
// Objective: Use loops to efficiently deliver multiple boxes
// Introduces loops for optimization

import { NORTH, SOUTH, EAST, WEST } from '../../iso/DirectionConstants';

export const Level4 = {
    id: "level_004",
    title: "Efficient Delivery",
    description: "Deliver multiple boxes using loops to optimize your solution.",
    instructions: "You have three boxes to deliver to the same output conveyor. Instead of repeating the same actions, try using loops to make your program more efficient. Pick up each box from the input area and place each of them on the adjacent output conveyors.",
    
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
            // Input area (left side)
            { type: "conveyor", row: 2, col: 1, id: "input_area_1", attributes: { allowDrop: true } },
            { type: "conveyor", row: 4, col: 1, id: "input_area_2", attributes: { allowDrop: true } },
            { type: "conveyor", row: 6, col: 1, id: "input_area_3", attributes: { allowDrop: true } },
            
            // Output conveyor (right side)
            { type: "conveyor", row: 2, col: 6, id: "output_belt_1", attributes: { allowDrop: true } },
            { type: "conveyor", row: 4, col: 6, id: "output_belt_2", attributes: { allowDrop: true } },
            { type: "conveyor", row: 6, col: 6, id: "output_belt_3", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Three boxes to deliver
            { type: "box", id: "box_1", row: 2, col: 1, attributes: {} },
            { type: "box", id: "box_2", row: 4, col: 1, attributes: {} },
            { type: "box", id: "box_3", row: 6, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 1,
        startCol: 2,
        startDir: SOUTH, // Facing South
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "box_1", row: 2, col: 6 },
        { type: "itemAtPos", itemId: "box_2", row: 4, col: 6 },
        { type: "itemAtPos", itemId: "box_3", row: 6, col: 6 }
    ],

    maxSteps: 70,
    
    // Available blocks - emphasize loops
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true  // Students should use loops to optimize
    }
};
