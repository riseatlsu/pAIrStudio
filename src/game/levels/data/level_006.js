import { WEST } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createHorizontalConveyor,
    createVerticalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level6 = {
    id: "level_006",
    title: "Level 6: Hard Code Maintenance / Completion",
    description: "Debug and finish a more advanced partial program through a constrained map.",
    instructions: "This hard Maintenance / Completion level begins with buggy partial Blockly. The map includes floor gaps, so fix the route carefully, continue the program, and deliver the box to the lower conveyor without turning the starter into a full solved program for the player.",
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
            [1, 0, 0, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    objects: {
        stationary: [
            ...createVerticalConveyor(1, 1, "level6_input"),
            { type: "zone", row: 2, col: 2, id: "level6_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createHorizontalConveyor(7, 4, "level6_output"),
            { type: "zone", row: 7, col: 7, id: "level6_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            { type: "pillars", row: 4, col: 4, id: "level6_pillar_a", attributes: { allowDrop: false, frame: 1 } },
            { type: "pillars", row: 3, col: 6, id: "level6_pillar_b", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 6, col: 5, id: "level6_pillar_c", attributes: { allowDrop: false, frame: 2 } },
            
            { type: "OilDrums", row: 6, col: 2, id: "level6_drum_a", attributes: { allowDrop: false, frame: 2 } },
            { type: "OilDrums", row: 6, col: 6, id: "level6_drum_b", attributes: { allowDrop: false, frame: 1 } },
            { type: "OilDrums", row: 3, col: 2, id: "level6_drum_c", attributes: { allowDrop: false, frame: 0 } },
            
            { type: "shelves", row: 1, col: 6, id: "level6_shelf_a", attributes: { allowDrop: false, frame: 4 } },
            { type: "shelves", row: 1, col: 7, id: "level6_shelf_b", attributes: { allowDrop: false, frame: 7 } },
            { type: "shelves", row: 4, col: 6, id: "level6_shelf_c", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 5, col: 6, id: "level6_shelf_d", attributes: { allowDrop: false, frame: 5 } }
        ],
        moveable: [
            { type: "box", id: "level6_box", row: 2, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 2,
        startCol: 2,
        startDir: WEST,
        scale: 1.5
    },

    starterBlocks: [
        { type: "pick_object" },
        { type: "turn_counter_clockwise" },
        { type: "move_forward" },
        { type: "turn_counter_clockwise" },
        { type: "move_forward" },
        { type: "move_forward" }
    ],

    winConditions: [
        { type: "itemAtPos", itemId: "level6_box", row: 7, col: 6 }
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
