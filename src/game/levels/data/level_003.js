// Level 3 Definition
// Objective: Navigate around obstacles to deliver boxes
// AI DISABLED for all groups - spatial reasoning challenge

export const Level3 = {
    id: "level_003",
    title: "Obstacle Course",
    description: "Navigate around obstacles to deliver packages to the correct locations.",
    instructions: "The warehouse floor has obstacles blocking direct paths. You must navigate around them to pick up boxes and deliver them to their destinations. Think about the most efficient route!",
    
    // Experimental level settings
    isExperiment: true,
    chatbotEnabled: false,  // NO AI for any group on this level
    
    // 9x9 Grid with obstacles (0 = empty/obstacle)
    map: {
        width: 9,
        height: 9,
        data: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 0, 0, 1, 1, 1, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    objects: {
        stationary: [
            // Input conveyors
            { type: "conveyor", row: 0, col: 4, id: "input_north", attributes: { allowDrop: true } },
            { type: "conveyor", row: 8, col: 4, id: "input_south", attributes: { allowDrop: true } },
            
            // Output conveyor (center)
            { type: "conveyor", row: 4, col: 4, id: "output_center", attributes: { allowDrop: true } }
        ],
        moveable: [
            // Box from north
            { type: "box", id: "box_north", row: 0, col: 4, attributes: {} },
            
            // Box from south
            { type: "box", id: "box_south", row: 8, col: 4, attributes: {} }
        ]
    },

    player: {
        startRow: 4,
        startCol: 0,
        startDir: 1, // Facing East
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "box_north", row: 4, col: 4 },
        { type: "itemAtPos", itemId: "box_south", row: 4, col: 4 }
    ],

    maxSteps: 60,
    
    // Available blocks - full movement and loop support
    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
