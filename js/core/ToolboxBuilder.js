/**
 * Toolbox Builder - Creates custom Blockly toolboxes based on level configuration
 */

import { BlockRegistry } from './BlockRegistry.js';

export class ToolboxBuilder {
  /**
   * Build a toolbox from a list of block IDs
   */
  static buildFlyoutToolbox(blockIds) {
    return {
      "kind": "flyoutToolbox",
      "contents": blockIds.map(id => ({
        "kind": "block",
        "type": id
      }))
    };
  }
  
  /**
   * Build a categorized toolbox
   */
  static buildCategoryToolbox(categories) {
    return {
      "kind": "categoryToolbox",
      "contents": categories.map(cat => ({
        "kind": "category",
        "name": cat.name,
        "colour": cat.colour || 210,
        "contents": cat.blocks.map(id => ({
          "kind": "block",
          "type": id
        }))
      }))
    };
  }
  
  /**
   * Build a default toolbox for a level based on its allowed blocks
   */
  static buildDefaultToolbox(allowedBlocks) {
    // Group blocks by category
    const categories = {
      movement: { name: "Movement", colour: 160, blocks: [] },
      items: { name: "Items", colour: 42, blocks: [] },
      control: { name: "Control", colour: 120, blocks: [] },
      inspection: { name: "Inspection", colour: 65, blocks: [] },
      logic: { name: "Logic", colour: 210, blocks: [] }
    };
    
    allowedBlocks.forEach(blockId => {
      const block = Object.values(BlockRegistry).find(b => b.id === blockId);
      if (block && categories[block.category]) {
        categories[block.category].blocks.push(blockId);
      }
    });
    
    // Filter out empty categories and build toolbox
    const nonEmptyCategories = Object.values(categories)
      .filter(cat => cat.blocks.length > 0);
    
    // If only one category, use flyout; otherwise use categories
    if (nonEmptyCategories.length === 1) {
      return this.buildFlyoutToolbox(allowedBlocks);
    } else if (nonEmptyCategories.length > 1) {
      return this.buildCategoryToolbox(nonEmptyCategories);
    }
    
    // Fallback to flyout with all blocks
    return this.buildFlyoutToolbox(allowedBlocks);
  }
  
  /**
   * Build a simple toolbox with just basic blocks (for tutorials)
   */
  static buildTutorialToolbox(blockIds) {
    return {
      "kind": "flyoutToolbox",
      "contents": [
        { "kind": "label", "text": "Blocks" },
        ...blockIds.map(id => ({
          "kind": "block",
          "type": id
        }))
      ]
    };
  }
}
