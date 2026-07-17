import { NORTH } from '../../iso/DirectionConstants';
import {
    createEdgeWalls,
    createFullFloor,
    createHorizontalConveyor
} from './layoutHelpers';

const walls = createEdgeWalls([0, 2, 4], [1, 3, 5]);

export const TutorialC = {
    id: "tutorial_C",
    title: "Tutorial C: Working with Your AI Assistant",
    description: "Meet Aura, your AI assistant, and practice asking for help while completing a familiar delivery.",
    instructions: `You've got a new coworker on this shift: an AI assistant named Aura who can answer questions while you work. Try asking things like "How do I pick up a box?" or "What does the Repeat block do?" in the chat panel. While you chat, complete the same kind of delivery you've already practiced: stand on the <span class="ui-ref">green pickup zone</span>, face the input conveyor, and use the <span class="ui-ref">Pick Up Object</span> block. Then navigate to the <span class="ui-ref">red dropoff zone</span>, face the output conveyor, and use the <span class="ui-ref">Drop Object</span> block.`,
    isExperiment: false,
    chatbotEnabled: true,

    map: {
        width: 6,
        height: 6,
        data: createFullFloor(6)
    },

    objects: {
        stationary: [
            ...createHorizontalConveyor(0, 1, "tutorial_c_input"),
            { type: "pickup_zone", row: 1, col: 2, id: "tutorial_c_input_zone", attributes: { allowDrop: true, frame: 0 } },

            ...createHorizontalConveyor(5, 2, "tutorial_c_output"),
            { type: "dropoff_zone", row: 4, col: 3, id: "tutorial_c_output_zone", attributes: { allowDrop: true, frame: 1 } },

            ...walls,

            { type: "pillars", row: 2, col: 5, id: "tutorial_c_pillar", attributes: { allowDrop: false, frame: 2 } },
            { type: "shelves", row: 5, col: 0, id: "tutorial_c_shelf", attributes: { allowDrop: false, frame: 6 } }
        ],
        moveable: [
            { type: "box", id: "tutorial_c_box", row: 0, col: 2, attributes: {} }
        ]
    },

    player: {
        startRow: 3,
        startCol: 2,
        startDir: NORTH,
        scale: 1.5
    },

    winConditions: [
        { type: "itemAtPos", itemId: "tutorial_c_box", row: 5, col: 3 }
    ],

    maxSteps: 14,

    allowedBlocks: {
        actions: true,
        sensing: false,
        logic: false,
        math: false,
        text: false,
        loops: true
    }
};
