import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createHorizontalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level1 = {
    id: "level_001",
    title: "Level 1: Easy Code Development",
    description: "Build a simple robot program from scratch.",
    instructions: "This is the first Code Development level. Start with an empty Blockly workspace, pick up the box from the top conveyor while standing on the dropoff floor, then deliver it to the bottom conveyor.",
    isExperiment: true,
    chatbotEnabled: true,

    map: {
        width: 8,
        height: 8,
        data: createFullFloor(8)
    },

    objects: {
        stationary: [
            ...createHorizontalConveyor(0, 2, "level1_input"),
            { type: "zone", row: 0 , col: 1, id: "level1_input_zone", attributes: { allowDrop: true, frame: 2 } },

            ...createHorizontalConveyor(7, 3, "level1_output"),
            { type: "zone", row: 7, col: 6, id: "level1_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            { type: "shelves", row: 2, col: 6, id: "level1_shelf_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 2, col: 7, id: "level1_shelf_b", attributes: { allowDrop: false, frame: 3 } },
            { type: "shelves", row: 5, col: 6, id: "level1_shelf_c", attributes: { allowDrop: false, frame: 5 } },
            { type: "shelves", row: 5, col: 7, id: "level1_shelf_d", attributes: { allowDrop: false, frame: 7 } },
            
            { type: "OilDrums", row: 1, col: 6, id: "level1_drum_a", attributes: { allowDrop: false, frame: 1 } },
            { type: "OilDrums", row: 6, col: 3, id: "level1_drum_b", attributes: { allowDrop: false, frame: 2 } },
            { type: "OilDrums", row: 2, col: 1, id: "level1_drum_c", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 5, col: 1, id: "level1_drum_d", attributes: { allowDrop: false, frame: 3 } },
            { type: "OilDrums", row: 1, col: 7, id: "level1_drum_e", attributes: { allowDrop: false, frame: 1 } },
            
            { type: "pillars", row: 4, col: 3, id: "level1_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 3, col: 1, id: "level1_pillar_b", attributes: { allowDrop: false, frame: 1 } },
            { type: "pillars", row: 1, col: 3, id: "level1_pillar_c", attributes: { allowDrop: false, frame: 2 } }
        ],
        moveable: [
            { type: "box", id: "level1_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 3,
        startCol: 3,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
         { type: "itemAtPos", itemId: "level1_box", row: 7, col: 5 }
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
