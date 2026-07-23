import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createHorizontalConveyor,
    createVerticalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4, 6], [1, 3, 5, 7]);

export const Level3 = {
    id: "level_003",
    title: "Level 3: Hard Code Development",
    description: "Navigate around two obstacle walls to carry the box across the warehouse.",
    instructions: `Two obstacle walls block the direct path — you'll need to plan a route that works around both of them. Stand on the <span class="ui-ref">green pickup zone</span>, face the input conveyor, and use the <span class="ui-ref">Pick Up Object</span> block. Then navigate to the <span class="ui-ref">red dropoff zone</span>, face the output conveyor, and use the <span class="ui-ref">Drop Object</span> block. Use the <span class="ui-ref">Loops</span> category to repeat movements and keep your block code concise.`,
    isExperiment: true,
    chatbotEnabled: true,

    dialogue: [
        "Careful with this one — two obstacle walls between the pickup and the dropoff. Trace the path in your head first, then write it."
    ],

    map: {
        width: 8,
        height: 8,
        data: createFullFloor(8)
    },

    objects: {
        stationary: [
            ...createHorizontalConveyor(0, 1, "level3_input"),
            { type: "pickup_zone", row: 1, col: 2, id: "level3_input_zone", attributes: { allowDrop: true, frame: 1 } },

            ...createVerticalConveyor(5, 7, "level3_output"),
            { type: "dropoff_zone", row: 6, col: 6, id: "level3_output_zone", attributes: { allowDrop: true, frame: 0 } },

            ...walls,

            // Upper obstacle wall (rows 1-2, cols 3-5) — blocks east traversal after pickup
            { type: "pillars", row: 1, col: 4, id: "level3_pillar_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 1, col: 5, id: "level3_pillar_b", attributes: { allowDrop: false, frame: 0 } },
            { type: "pillars", row: 1, col: 6, id: "level3_pillar_c", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 2, col: 3, id: "level3_drum_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 2, col: 4, id: "level3_drum_b", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 0, col: 4, id: "level3_drum_c", attributes: { allowDrop: false, frame: 0 } },

            // Lower obstacle wall (rows 4-5, cols 1-4) — blocks direct south path through center
            { type: "OilDrums", row: 3, col: 0, id: "level3_drum_d", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 3, col: 2, id: "level3_drum_e", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 1, col: 1, id: "level3_drum_f", attributes: { allowDrop: false, frame: 0 } },
            { type: "OilDrums", row: 6, col: 5, id: "level3_drum_g", attributes: { allowDrop: false, frame: 2 } },
            { type: "shelves", row: 5, col: 1, id: "level3_shelf_a", attributes: { allowDrop: false, frame: 0 } },
            { type: "shelves", row: 5, col: 2, id: "level3_shelf_b", attributes: { allowDrop: false, frame: 5 } },
            { type: "shelves", row: 5, col: 3, id: "level3_shelf_c", attributes: { allowDrop: false, frame: 7 } },
            { type: "shelves", row: 5, col: 4, id: "level3_shelf_d", attributes: { allowDrop: false, frame: 3 } },

            // Decorative clutter in dead zones
            { type: "shelves", row: 7, col: 2, id: "level3_shelf_e", attributes: { allowDrop: false, frame: 5 } },
            { type: "shelves", row: 7, col: 3, id: "level3_shelf_f", attributes: { allowDrop: false, frame: 7 } }
        ],
        moveable: [
            { type: "box", id: "level3_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 7,
        startCol: 1,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "level3_box", row: 6, col: 7 }
    ],

    maxSteps: 45,

    allowedBlocks: {
        actions: ['move_forward', 'turn_clockwise', 'turn_counter_clockwise', 'pick_object', 'drop_object'],
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
