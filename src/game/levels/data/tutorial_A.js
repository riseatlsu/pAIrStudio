import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createHorizontalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4], [1, 3, 5]);

export const TutorialA = {
    id: "tutorial_A",
    title: "Tutorial A: Pick Up and Drop",
    description: "Learn how the robot uses dropoff floors to pick up from one conveyor and place onto another.",
    instructions: "Stand on the green dropoff floor to pick up the box from the top conveyor, then carry it to the lower dropoff floor and place it on the output conveyor. This map is meant to help you get familiar with movement, turning, picking up, and dropping.",
    isExperiment: false,
    chatbotEnabled: false,

    map: {
        width: 6,
        height: 6,
        data: createFullFloor(6)
    },

    objects: {
        stationary: [
            ...createHorizontalConveyor(0, 1, "tutorial_a_input"),
            { type: "zone", row: 1, col: 2, id: "tutorial_a_input_zone", attributes: { allowDrop: true, frame: 2 } },

            ...createHorizontalConveyor(5, 2, "tutorial_a_output"),
            { type: "zone", row: 4, col: 3, id: "tutorial_a_output_zone", attributes: { allowDrop: true, frame: 2 } },

            ...walls,

            { type: "pillars", row: 2, col: 4, id: "tutorial_a_pillar", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 5, col: 5, id: "tutorial_a_drum", attributes: { allowDrop: false, frame: 1 } }
        ],
        moveable: [
            { type: "box", id: "tutorial_a_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 3,
        startCol: 2,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "tutorial_a_box", row: 5, col: 3 }
    ],

    maxSteps: 12,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: false
    }
};
