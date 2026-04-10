import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createVerticalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level2 = {
    id: "level_002",
    title: "Level 2: Medium Code Development",
    description: "Write a longer route from scratch around warehouse obstacles.",
    instructions: "This Code Development level still starts with an empty Blockly workspace. Pick up the box from the left conveyor, navigate around the center obstacles, and place it on the right conveyor.",
    isExperiment: true,
    chatbotEnabled: true,

    map: {
        width: 8,
        height: 8,
        data: createFullFloor(8)
    },

    objects: {
        stationary: [
            ...createVerticalConveyor(2, 1, "level2_input"),
            { type: "zone", row: 3, col: 2, id: "level2_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createVerticalConveyor(1, 6, "level2_output"),
            { type: "zone", row: 2, col: 5, id: "level2_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            { type: "pillars", row: 1, col: 4, id: "level2_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 4, col: 4, id: "level2_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 2, col: 4, id: "level2_pillar_b", attributes: { allowDrop: false, frame: 1 } },
            { type: "pillars", row: 3, col: 4, id: "level2_pillar_c", attributes: { allowDrop: false, frame: 2 } },
            { type: "OilDrums", row: 5, col: 3, id: "level2_drum_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 5, col: 5, id: "level2_drum_b", attributes: { allowDrop: false, frame: 3 } },
            { type: "shelves", row: 6, col: 6, id: "level2_shelf_a", attributes: { allowDrop: false, frame: 4 } },
            { type: "shelves", row: 6, col: 7, id: "level2_shelf_b", attributes: { allowDrop: false, frame: 7 } }
        ],
        moveable: [
            { type: "box", id: "level2_box", row: 3, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 5,
        startCol: 2,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "level2_box", row: 2, col: 6 }
    ],

    maxSteps: 28,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
