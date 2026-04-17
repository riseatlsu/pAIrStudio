import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createHorizontalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level4 = {
    id: "level_004",
    title: "Level 4: Easy Code Maintenance / Completion",
    description: "Fix or extend a partial Blockly program for a simple delivery route.",
    instructions: "This merged Maintenance / Completion level starts with partial Blockly. The starter code helps the robot reach and pick up the box, but it does not finish the task correctly. Debug or extend it without completing the whole program for the player.",
    isExperiment: true,
    chatbotEnabled: true,

    map: {
        width: 8,
        height: 8,
        data: createFullFloor(8)
    },

    objects: {
        stationary: [
            ...createHorizontalConveyor(0, 1, "level4_input"),
            { type: "zone", row: 1, col: 2, id: "level4_input_zone", attributes: { allowDrop: true, frame: 2 } },

            ...createHorizontalConveyor(7, 4, "level4_output"),
            { type: "zone", row: 6, col: 5, id: "level4_output_zone", attributes: { allowDrop: true, frame: 1 } },

            ...walls,

            { type: "shelves", row: 2, col: 6, id: "level4_shelf_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 2, col: 7, id: "level4_shelf_b", attributes: { allowDrop: false, frame: 3 } },
            { type: "OilDrums", row: 5, col: 1, id: "level4_drum_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 5, col: 6, id: "level4_pillar_a", attributes: { allowDrop: false, frame: 1 } }
        ],
        moveable: [
            { type: "box", id: "level4_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 3,
        startCol: 2,
        startDir: NORTH,
        scale: 1.5
    },

    starterBlocks: [
        { type: "move_forward" },
        { type: "move_forward" },
        { type: "pick_object" },
        { type: "turn_clockwise" },
        { type: "move_forward" }
    ],

    winConditions: [
        { type: "itemAtPos", itemId: "level4_box", row: 7, col: 5 }
    ],

    maxSteps: 18,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: false
    }
};
