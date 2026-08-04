import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createHorizontalConveyor,
    createVerticalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level5 = {
    id: "level_005",
    title: "Level 5: Medium Code Maintenance",
    description: "Find and fix two wrong repeat counts hidden in the starter code.",
    instructions: `The starter code has two bugs — both are wrong repeat counts. Press <span class="ui-ref">Run Code</span> and watch carefully: the robot takes the right general route but stops in the wrong place twice — once on the way to the <span class="ui-ref">green pickup zone</span> and again on the way to the <span class="ui-ref">red dropoff zone</span>. Find both <span class="ui-ref">Loops</span> repeat blocks with incorrect numbers and fix them so the robot completes the full delivery.`,
    isExperiment: true,
    chatbotEnabled: true,

    dialogue: [
        "Another one of the previous tech's half-finished jobs. This program actually runs the whole route — it just stops short in two places.",
        "My money's on the Repeat blocks. Count carefully."
    ],

    map: {
        width: 8,
        height: 8,
        data: createFullFloor(8)
    },

    objects: {
        stationary: [
            ...createHorizontalConveyor(0, 2, "level5_input"),
            { type: "pickup_zone", row: 1, col: 3, id: "level5_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createVerticalConveyor(5, 6, "level5_output"),
            { type: "dropoff_zone", row: 5, col: 5, id: "level5_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            // Left side warehouse racking
            { type: "shelves", row: 2, col: 1, id: "level5_shelf_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 2, col: 2, id: "level5_shelf_b", attributes: { allowDrop: false, frame: 3 } },
            { type: "OilDrums", row: 3, col: 1, id: "level5_drum_a", attributes: { allowDrop: false, frame: 2 } },
            { type: "pillars", row: 4, col: 1, id: "level5_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 4, col: 2, id: "level5_pillar_b", attributes: { allowDrop: false, frame: 1 } },
            { type: "OilDrums", row: 6, col: 1, id: "level5_drum_b", attributes: { allowDrop: false, frame: 1 } },
            { type: "shelves", row: 6, col: 2, id: "level5_shelf_c", attributes: { allowDrop: false, frame: 5 } },

            // Top-right storage area
            { type: "shelves", row: 1, col: 5, id: "level5_shelf_d", attributes: { allowDrop: false, frame: 4 } },
            { type: "shelves", row: 1, col: 6, id: "level5_shelf_e", attributes: { allowDrop: false, frame: 7 } },
            { type: "pillars", row: 2, col: 5, id: "level5_pillar_c", attributes: { allowDrop: false, frame: 2 } },
            { type: "pillars", row: 2, col: 6, id: "level5_pillar_d", attributes: { allowDrop: false, frame: 1 } },

            // Obstacle wall flanking the main corridor — player squeezes through col 3 past these
            { type: "shelves", row: 3, col: 4, id: "level5_shelf_h", attributes: { allowDrop: false, frame: 2 } },
            { type: "OilDrums", row: 2, col: 4, id: "level5_drum_f", attributes: { allowDrop: false, frame: 0 } },

            // Center-right drums flanking the south corridor
            { type: "OilDrums", row: 3, col: 5, id: "level5_drum_c", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 4, col: 5, id: "level5_drum_d", attributes: { allowDrop: false, frame: 3 } },

            // Bottom clutter
            { type: "shelves", row: 7, col: 1, id: "level5_shelf_f", attributes: { allowDrop: false, frame: 6 } },
            { type: "shelves", row: 7, col: 2, id: "level5_shelf_g", attributes: { allowDrop: false, frame: 5 } },
            { type: "OilDrums", row: 7, col: 5, id: "level5_drum_e", attributes: { allowDrop: false, frame: 1 } }
        ],
        moveable: [
            { type: "box", id: "level5_box", row: 0, col: 3, attributes: {} }
        ]
    },

    player: {
        startRow: 5,
        startCol: 3,
        startDir: NORTH,
        scale: 1.5
    },

    // Bug 1: north repeat says 3 but needs 4 — robot stops at (2,3), pick fails
    // Bug 2: east repeat says 1 but needs 2 — robot stops at (5,4), drop fails
    starterBlocks: [
        { type: "controls_repeat_ext", inputs: {
            TIMES: { type: "math_number", fields: { NUM: 3 } },
            DO: [{ type: "move_forward" }]
        }},
        { type: "pick_object" },
        { type: "turn_clockwise" },
        { type: "turn_clockwise" },
        { type: "controls_repeat_ext", inputs: {
            TIMES: { type: "math_number", fields: { NUM: 4 } },
            DO: [{ type: "move_forward" }]
        }},
        { type: "turn_counter_clockwise" },
        { type: "controls_repeat_ext", inputs: {
            TIMES: { type: "math_number", fields: { NUM: 1 } },
            DO: [{ type: "move_forward" }]
        }},
        { type: "drop_object" }
    ],

    winConditions: [
        { type: "itemAtPos", itemId: "level5_box", row: 5, col: 6 }
    ],

    maxSteps: 20,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
