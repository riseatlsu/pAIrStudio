// Level Configuration JSON Structure Definitions and Validation

export class LevelConfigValidator {
    static validate(config) {
        if (!config.id) throw new Error("Level ID is required");
        if (!config.map || !config.map.data) throw new Error("Map data is required");
        if (!config.winConditions) throw new Error("Win conditions are required");
        return true;
    }
}

/*
    Level Config Schema Example:
    {
        id: "level_001",  // Can be numbered (level_001) or lettered (level_A, tutorial_intro)
        title: "Hello World",
        description: "Move the box from input to output.",
        isExperiment: true,  // Optional: true = experimental level (default), false = tutorial/practice
        chatbotEnabled: true,  // Optional: false = disable chatbot for ALL groups on this level (default: true)
        
        map: {
            width: 10,
            height: 10,
            data: [[]] // 2D array of tile indices
        },

        objects: {
            stationary: [
                { type: "conveyor", x: 0, y: 0, attributes: { allowDrop: true, direction: "south" } }
            ],
            moveable: [
                { type: "box", id: "box_1", x: 2, y: 2, attributes: { targetId: "output_1" } } // box_1 needs to go to output_1
            ]
        },

        player: {
            startX: 5,
            startY: 5,
            startDir: 0
        },

        winConditions: [
             // Definition: Verify that Box X is at Location Y (or on Conveyor Z)
             // Simplified: Check if item with 'id' is at grid location (x,y)
             { type: "itemAtPos", itemId: "box_1", x: 8, y: 8 }
        ],

        maxSteps: 50,
        medals: { gold: 10, silver: 20, bronze: 50 }, // Step counts (optional)
        
        // Available blocks for this level (optional - if not specified, all blocks available)
        allowedBlocks: {
            actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
            sensing: ['survey_front', 'check_attribute'],
            logic: true,  // true = all blocks in category, false = none, or array of specific blocks
            math: true,
            text: false,
            loops: ['controls_repeat_ext']  // Only repeat block, not while/until
        }
    }
    
    Example Tutorial Level:
    {
        id: "tutorial_A",
        title: "Getting Started",
        isExperiment: false,  // Not part of experiment data
        chatbotEnabled: false,  // No chatbot help on tutorial
        // ... rest of config
    }
*/
