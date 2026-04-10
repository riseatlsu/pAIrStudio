import { WEST } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createVerticalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level5 = {
    id: "level_005",
    title: "Level 5: Medium Code Maintenance / Completion",
    description: "Repair and extend a partially implemented program through a longer route.",
    instructions: "This level starts with partial Blockly that makes some progress but does not finish the delivery. Debug the route from the left conveyor to the right conveyor and complete only the missing behavior you need.",
    isExperiment: true,
    chatbotEnabled: true,

    map: {
        width: 8,
        height: 8,
        data: createFullFloor(8)
    },

    objects: {
        stationary: [
            ...createVerticalConveyor(2, 1, "level5_input"),
            { type: "zone", row: 3, col: 2, id: "level5_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createVerticalConveyor(1, 6, "level5_output"),
            { type: "zone", row: 1, col: 7, id: "level5_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            { type: "pillars", row: 2, col: 4, id: "level5_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 3, col: 4, id: "level5_pillar_b", attributes: { allowDrop: false, frame: 1 } },
            { type: "pillars", row: 4, col: 4, id: "level5_pillar_c", attributes: { allowDrop: false, frame: 2 } },
            { type: "pillars", row: 5, col: 2, id: "level5_pillar_d", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 6, col: 3, id: "level5_pillar_e", attributes: { allowDrop: false, frame: 1 } },
            
            { type: "OilDrums", row: 5, col: 5, id: "level5_drum_a", attributes: { allowDrop: false, frame: 3 } },
            { type: "OilDrums", row: 2, col: 2, id: "level5_drum_b", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 4, col: 7, id: "level5_drum_c", attributes: { allowDrop: false, frame: 2 } },
            { type: "OilDrums", row: 7, col: 4, id: "level5_drum_d", attributes: { allowDrop: false, frame: 1 } },
            
            { type: "shelves", row: 6, col: 6, id: "level5_shelf_a", attributes: { allowDrop: false, frame: 4 } },
            { type: "shelves", row: 6, col: 7, id: "level5_shelf_b", attributes: { allowDrop: false, frame: 7 } },
            { type: "shelves", row: 1, col: 4, id: "level5_shelf_c", attributes: { allowDrop: false, frame: 2 } },
            { type: "shelves", row: 1, col: 5, id: "level5_shelf_d", attributes: { allowDrop: false, frame: 5 } }
        ],
        moveable: [
            { type: "box", id: "level5_box", row: 3, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 3,
        startCol: 2,
        startDir: WEST,
        scale: 1.5
    },

    starterBlocks: [
        { type: "pick_object" },
        { type: "turn_clockwise" },
        { type: "move_forward" },
        { type: "move_forward" },
        { type: "turn_clockwise" },
        { type: "move_forward" },
        { type: "move_forward" }
    ],

    winConditions: [
        { type: "itemAtPos", itemId: "level5_box", row: 1, col: 6 }
    ],

    maxSteps: 30,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
