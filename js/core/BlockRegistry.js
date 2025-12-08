/**
 * Block Registry - Centralized registry of all available Blockly blocks
 * Levels can reference blocks from this registry
 */

export const BlockRegistry = {
  // Movement blocks
  MOVE_FORWARD: {
    id: 'move_forward',
    category: 'movement',
    definition: {
      "type": "move_forward",
      "message0": "Move forward %1 steps",
      "args0": [{ "type": "field_number", "name": "STEPS", "value": 1, "min": 1 }],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Move the robot forward by specified steps",
      "helpUrl": ""
    },
    generator: (block) => {
      const steps = block.getFieldValue('STEPS');
      return `await GameAPI.moveForward(${steps});\n`;
    }
  },
  
  ROTATE_LEFT: {
    id: 'rotate_left',
    category: 'movement',
    definition: {
      "type": "rotate_left",
      "message0": "Turn counter-clockwise",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 210,
      "tooltip": "Rotate the robot 90° counter-clockwise",
      "helpUrl": ""
    },
    generator: () => `await GameAPI.rotateLeft();\n`
  },
  
  ROTATE_RIGHT: {
    id: 'rotate_right',
    category: 'movement',
    definition: {
      "type": "rotate_right",
      "message0": "Turn clockwise",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 210,
      "tooltip": "Rotate the robot 90° clockwise",
      "helpUrl": ""
    },
    generator: () => `await GameAPI.rotateRight();\n`
  },
  
  // Item interaction blocks
  PICK_OBJECT: {
    id: 'pick_object',
    category: 'items',
    definition: {
      "type": "pick_object",
      "message0": "Pick up object",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 42,
      "tooltip": "Pick up an object in front of the robot",
      "helpUrl": ""
    },
    generator: () => `await GameAPI.pickupItem();\n`
  },
  
  RELEASE_OBJECT: {
    id: 'release_object',
    category: 'items',
    definition: {
      "type": "release_object",
      "message0": "Release object",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 120,
      "tooltip": "Release the carried object",
      "helpUrl": ""
    },
    generator: () => `await GameAPI.dropItem();\n`
  },
  
  // Control flow blocks
  CONTROLS_REPEAT: {
    id: 'controls_repeat',
    category: 'control',
    definition: {
      "type": "controls_repeat",
      "message0": "Repeat %1 times",
      "args0": [
        { "type": "field_number", "name": "TIMES", "value": 2, "min": 1, "max": 100 }
      ],
      "message1": "do %1",
      "args1": [
        { "type": "input_statement", "name": "DO" }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 120,
      "tooltip": "Repeat actions multiple times",
      "helpUrl": ""
    },
    generator: (block) => {
      const times = block.getFieldValue('TIMES');
      const branch = Blockly.JavaScript.statementToCode(block, 'DO');
      return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
    }
  },
  
  CONTROLS_IF: {
    id: 'controls_if',
    category: 'control',
    definition: {
      "type": "controls_if",
      "message0": "if %1",
      "args0": [
        { "type": "input_value", "name": "IF0", "check": "Boolean" }
      ],
      "message1": "do %1",
      "args1": [
        { "type": "input_statement", "name": "DO0" }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 210,
      "tooltip": "Execute code if condition is true",
      "helpUrl": "",
      "mutator": "controls_if_mutator"
    },
    generator: (block) => {
      const condition = Blockly.JavaScript.valueToCode(block, 'IF0', Blockly.JavaScript.ORDER_NONE) || 'false';
      const branch = Blockly.JavaScript.statementToCode(block, 'DO0');
      return `if (${condition}) {\n${branch}}\n`;
    }
  },
  
  // Inspection blocks (for advanced levels)
  INSPECT_OBJECT: {
    id: 'inspect_object',
    category: 'inspection',
    definition: {
      "type": "inspect_object",
      "message0": "inspect object in front",
      "output": "Object",
      "colour": 65,
      "tooltip": "Get information about the object in front",
      "helpUrl": ""
    },
    generator: () => `GameAPI.inspectObject()`
  },
  
  CHECK_OBJECT_TYPE: {
    id: 'check_object_type',
    category: 'inspection',
    definition: {
      "type": "check_object_type",
      "message0": "object %1 is type %2",
      "args0": [
        { "type": "input_value", "name": "OBJECT", "check": "Object" },
        { "type": "field_dropdown", "name": "TYPE", "options": [
          ["box", "box"],
          ["crate", "crate"],
          ["barrel", "barrel"]
        ]}
      ],
      "output": "Boolean",
      "colour": 65,
      "tooltip": "Check if object matches a specific type",
      "helpUrl": ""
    },
    generator: (block) => {
      const object = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_NONE);
      const type = block.getFieldValue('TYPE');
      return [`(${object} && ${object}.type === '${type}')`, Blockly.JavaScript.ORDER_EQUALITY];
    }
  },
  
  // Starting block (required for all levels)
  CUSTOM_START: {
    id: 'custom_start',
    category: 'events',
    definition: {
      "type": "custom_start",
      "message0": "When program starts:",
      "nextStatement": null,
      "colour": 210,
      "tooltip": "The starting point of your program",
      "helpUrl": ""
    },
    generator: () => '' // Hat block, generates no code
  }
};

/**
 * Get block definitions for specified block IDs
 */
export function getBlockDefinitions(blockIds) {
  return blockIds
    .map(id => {
      const block = Object.values(BlockRegistry).find(b => b.id === id);
      return block ? block.definition : null;
    })
    .filter(def => def !== null);
}

/**
 * Get block generators for specified block IDs
 */
export function getBlockGenerators(blockIds) {
  const generators = {};
  blockIds.forEach(id => {
    const block = Object.values(BlockRegistry).find(b => b.id === id);
    if (block && block.generator) {
      generators[id] = block.generator;
    }
  });
  return generators;
}

/**
 * Register all blocks from the registry with Blockly
 */
export function registerAllBlocks(blockIds) {
  const definitions = getBlockDefinitions(blockIds);
  if (definitions.length > 0) {
    Blockly.defineBlocksWithJsonArray(definitions);
  }
  
  const generators = getBlockGenerators(blockIds);
  Object.entries(generators).forEach(([type, generator]) => {
    Blockly.JavaScript[type] = generator;
  });
}

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category) {
  return Object.values(BlockRegistry)
    .filter(block => block.category === category)
    .map(block => block.id);
}
