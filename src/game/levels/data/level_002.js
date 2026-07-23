import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createHorizontalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level2 = {
    id: "level_002",
    title: "Level 2: Medium Code Development",
    description: "Navigate around warehouse obstacles to deliver the box from one side of the map to the other.",
    instructions: `Navigate the robot across the warehouse to pick up the box and deliver it to the output conveyor. Obstacles in the center of the map will force you to plan your route carefully. Stand on the <span class="ui-ref">green pickup zone</span>, face the input conveyor, and use the <span class="ui-ref">Pick Up Object</span> block. Then navigate to the <span class="ui-ref">red dropoff zone</span>, face the output conveyor, and use the <span class="ui-ref">Drop Object</span> block.`,
    isExperiment: true,
    chatbotEnabled: true,

    dialogue: [
        "This work order's got some clutter in the middle of the floor. Route's not a straight line — you'll want to plan it before you start dragging blocks."
    ],

    map: {
        width: 8,
        height: 8,
        data: createFullFloor(8)
    },

    objects: {
        stationary: [
            ...createHorizontalConveyor(0, 2, "level2_input"),
            { type: "pickup_zone", row: 1, col: 3, id: "level2_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createHorizontalConveyor(7, 5, "level2_output"),
            { type: "dropoff_zone", row: 6, col: 6, id: "level2_output_zone", attributes: { allowDrop: true, frame: 1 } },

            ...walls,

            // Central shelf wall — blocks direct south path from pickup
            { type: "shelves", row: 2, col: 6, id: "level2_shelf_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 2, col: 7, id: "level2_shelf_b", attributes: { allowDrop: false, frame: 3 } },
            { type: "shelves", row: 3, col: 4, id: "level2_shelf_c", attributes: { allowDrop: false, frame: 4 } },
            { type: "shelves", row: 3, col: 5, id: "level2_shelf_d", attributes: { allowDrop: false, frame: 7 } },

            // Drum cluster — blocks center lower, forces path along col 6
            { type: "OilDrums", row: 5, col: 2, id: "level2_drum_a", attributes: { allowDrop: false, frame: 1 } },
            { type: "OilDrums", row: 4, col: 4, id: "level2_drum_b", attributes: { allowDrop: false, frame: 3 } },
            { type: "OilDrums", row: 5, col: 3, id: "level2_drum_c", attributes: { allowDrop: false, frame: 1 } },
            { type: "OilDrums", row: 5, col: 4, id: "level2_drum_d", attributes: { allowDrop: false, frame: 2 } },

            // Left side obstacles — discourage going around the long way
            { type: "pillars", row: 3, col: 1, id: "level2_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 5, col: 1, id: "level2_shelf_e", attributes: { allowDrop: false, frame: 5 } }
        ],
        moveable: [
            { type: "box", id: "level2_box", row: 0, col: 3, attributes: {} }
        ]
    },

    player: {
        startRow: 6,
        startCol: 7,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "level2_box", row: 7, col: 6 }
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
