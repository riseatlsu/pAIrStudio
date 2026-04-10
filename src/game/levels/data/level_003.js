import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createVerticalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level3 = {
    id: "level_003",
    title: "Level 3: Hard Code Development",
    description: "Build a full solution from scratch through a tighter warehouse layout.",
    instructions: "This hard Code Development level uses floor gaps and decorations to shape the route. Start with an empty Blockly workspace, pick up the box from the left conveyor, and carry it through the open path to the right conveyor.",
    isExperiment: true,
    chatbotEnabled: true,

    map: {
        width: 8,
        height: 8,
        data: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    objects: {
        stationary: [
            ...createVerticalConveyor(1, 1, "level3_input"),
            { type: "zone", row: 2, col: 2, id: "level3_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createVerticalConveyor(4, 6, "level3_output"),
            { type: "zone", row: 5, col: 5, id: "level3_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            { type: "pillars", row: 1, col: 6, id: "level3_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 6, col: 3, id: "level3_pillar_b", attributes: { allowDrop: false, frame: 2 } },
            { type: "OilDrums", row: 3, col: 3, id: "level3_drum_a", attributes: { allowDrop: false, frame: 3 } },
            { type: "OilDrums", row: 6, col: 1, id: "level3_drum_a", attributes: { allowDrop: false, frame: 2 } },
            { type: "OilDrums", row: 6, col: 6, id: "level3_drum_b", attributes: { allowDrop: false, frame: 1 } },
            { type: "shelves", row: 0, col: 6, id: "level3_shelf_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 0, col: 7, id: "level3_shelf_b", attributes: { allowDrop: false, frame: 3 } }
        ],
        moveable: [
            { type: "box", id: "level3_box", row: 2, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 6,
        startCol: 2,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "level3_box", row: 5, col: 6 }
    ],

    maxSteps: 40,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
