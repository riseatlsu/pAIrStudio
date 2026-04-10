import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createHorizontalConveyor,
    createVerticalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4], [1, 3, 5]);

export const TutorialB = {
    id: "tutorial_B",
    title: "Tutorial B: Route Practice",
    description: "Practice reading the map, using the dropoff floor, and planning a slightly longer route.",
    instructions: "This tutorial gives you a slightly longer warehouse route. Pick up the box from the left conveyor while standing on the nearby dropoff floor, then deliver it to the bottom conveyor. Use this map to get comfortable with reading the layout before the six main levels.",
    isExperiment: false,
    chatbotEnabled: false,

    map: {
        width: 6,
        height: 6,
        data: [
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1],
            [1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1]
        ]
    },

    objects: {
        stationary: [
            ...createVerticalConveyor(1, 1, "tutorial_b_input"),
            { type: "zone", row: 2, col: 2, id: "tutorial_b_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createHorizontalConveyor(5, 2, "tutorial_b_output"),
            { type: "zone", row: 5, col: 5, id: "tutorial_b_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            { type: "shelves", row: 1, col: 4, id: "tutorial_b_shelf_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 1, col: 5, id: "tutorial_b_shelf_b", attributes: { allowDrop: false, frame: 3 } },
            { type: "pillars", row: 3, col: 4, id: "tutorial_b_pillar", attributes: { allowDrop: false, frame: 1 } },
            { type: "OilDrums", row: 5, col: 1, id: "tutorial_b_drum", attributes: { allowDrop: false, frame: 2 } }
        ],
        moveable: [
            { type: "box", id: "tutorial_b_box", row: 2, col: 1, attributes: {} }
        ]
    },

    player: {
        startRow: 4,
        startCol: 1,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "tutorial_b_box", row: 5, col: 4 }
    ],

    maxSteps: 18,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
