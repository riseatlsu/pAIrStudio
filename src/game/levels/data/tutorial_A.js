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
    description: "Your robot's first shift: pick up a box from the green pickup zone and carry it to the red dropoff zone.",
    instructions: `Welcome to your first shift on the warehouse floor. Your robot just came online, and its first job is simple: fetch the box waiting on the input conveyor and carry it to the loading dock. To pick up the box, stand on the <span class="ui-ref">green pickup zone</span>, face the conveyor belt, and use the <span class="ui-ref">Pick Up Object</span> block. To drop off the box, stand on the <span class="ui-ref">red dropoff zone</span>, face the output conveyor belt, and use the <span class="ui-ref">Drop Object</span> block. To program the robot, click the <span class="ui-ref">Actions</span> tab in the visual programming window and drag blocks onto the canvas. Connect them top to bottom starting from the <span class="ui-ref">When Program Starts</span> block in the order you want the commands to run, then press <span class="ui-ref">Run Code</span> to see your program execute.`,
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
            { type: "pickup_zone", row: 1, col: 2, id: "tutorial_a_input_zone", attributes: { allowDrop: true, frame: 2 } },

            ...createHorizontalConveyor(5, 2, "tutorial_a_output"),
            { type: "dropoff_zone", row: 4, col: 3, id: "tutorial_a_output_zone", attributes: { allowDrop: true, frame: 2 } },

            ...walls,

            //{ type: "pillars", row: 2, col: 4, id: "tutorial_a_pillar", attributes: { allowDrop: false, frame: 0 } },
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
