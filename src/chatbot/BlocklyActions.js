/**
 * BlocklyActions.js
 * Utility module for manipulating Blockly workspace based on AI responses
 * Provides functions to add, delete, and manage code blocks programmatically
 */

/**
 * Get the Blockly workspace instance
 * @returns {Blockly.Workspace|null}
 */
function getWorkspace() {
    if (window.blocklyWorkspace) {
        return window.blocklyWorkspace;
    }
    if (window.Blockly && typeof window.Blockly.getMainWorkspace === 'function') {
        return window.Blockly.getMainWorkspace();
    }
    return null;
}

/**
 * Get the custom_start block (entry point for all programs)
 * @returns {Blockly.Block|null}
 */
function getStartBlock() {
    const workspace = getWorkspace();
    if (!workspace) return null;
    
    const startBlocks = workspace.getBlocksByType("custom_start");
    return startBlocks.length > 0 ? startBlocks[0] : null;
}

/**
 * Find the last block in the current program chain
 * @returns {Blockly.Block|null}
 */
function getLastBlock() {
    const startBlock = getStartBlock();
    if (!startBlock) return null;
    
    let lastBlock = startBlock;
    while (lastBlock.nextConnection && lastBlock.nextConnection.targetBlock()) {
        lastBlock = lastBlock.nextConnection.targetBlock();
    }
    
    return lastBlock;
}

/**
 * Clear all blocks except the start block
 */
export function clearWorkspace() {
    const workspace = getWorkspace();
    if (!workspace) {
        console.error('BlocklyActions: Workspace not found');
        return;
    }
    
    console.log('BlocklyActions: Starting workspace clear...');
    
    // CRITICAL: Disable ALL events FIRST before doing anything
    const Blockly = window.Blockly;
    let eventsWereEnabled = false;
    
    if (Blockly && Blockly.Events) {
        eventsWereEnabled = Blockly.Events.isEnabled ? Blockly.Events.isEnabled() : false;
        Blockly.Events.disable();
    }
    
    try {
        // Clear the entire workspace
        workspace.clear();
        
        // Re-create the start block
        const startBlock = workspace.newBlock('custom_start');
        startBlock.initSvg();
        startBlock.render();
        startBlock.setDeletable(false);
        startBlock.moveBy(20, 20);
        
        console.log('BlocklyActions: Workspace cleared and start block re-created');
    } catch (e) {
        console.error('BlocklyActions: Error clearing workspace:', e);
    } finally {
        // Re-enable events if they were enabled
        if (eventsWereEnabled && Blockly && Blockly.Events) {
            Blockly.Events.enable();
        }
    }
}

/**
 * Delete the last N blocks from the program
 * @param {number} count - Number of blocks to delete
 */
export function deleteLastBlocks(count = 1) {
    const workspace = getWorkspace();
    if (!workspace) {
        console.error('BlocklyActions: Workspace not found');
        return;
    }
    
    let lastBlock = getLastBlock();
    let deleted = 0;
    
    while (lastBlock && lastBlock.type !== 'custom_start' && deleted < count) {
        const previousBlock = lastBlock.previousConnection?.targetBlock();
        lastBlock.dispose();
        lastBlock = previousBlock;
        deleted++;
    }
    
    console.log(`BlocklyActions: Deleted ${deleted} block(s)`);
    return deleted;
}

/**
 * Create a single block and add it to the workspace
 * @param {Object} blockSpec - Block specification {type, fields, children}
 * @returns {Blockly.Block|null} Created block
 */
function createBlock(blockSpec) {
    const workspace = getWorkspace();
    if (!workspace) {
        console.error('BlocklyActions: Workspace not found');
        return null;
    }
    
    try {
        const block = workspace.newBlock(blockSpec.type);
        
        // CRITICAL: Initialize block BEFORE setting field values
        block.initSvg();
        block.render();
        
        // Now set field values (after init)
        if (blockSpec.fields) {
            for (const [fieldName, value] of Object.entries(blockSpec.fields)) {
                try {
                    block.setFieldValue(value, fieldName);
                } catch (fieldError) {
                    console.warn(`BlocklyActions: Failed to set field '${fieldName}' on block '${blockSpec.type}':`, fieldError);
                }
            }
        }
        
        // Handle nested children (for control blocks like repeat)
        if (blockSpec.children && blockSpec.children.length > 0) {
            let firstChild = null;
            let currentChild = null;
            
            for (let i = 0; i < blockSpec.children.length; i++) {
                const childBlock = createBlock(blockSpec.children[i]);
                if (!childBlock) continue;
                
                if (i === 0) {
                    // First child connects to the DO input
                    firstChild = childBlock;
                    if (block.getInput('DO')) {
                        block.getInput('DO').connection.connect(childBlock.previousConnection);
                    }
                    currentChild = childBlock;
                } else {
                    // Subsequent children chain together
                    if (currentChild && currentChild.nextConnection && childBlock.previousConnection) {
                        currentChild.nextConnection.connect(childBlock.previousConnection);
                    }
                    currentChild = childBlock;
                }
            }
        }
        
        return block;
    } catch (error) {
        console.error(`BlocklyActions: Failed to create block type '${blockSpec.type}':`, error);
        return null;
    }
}

/**
 * Add blocks to the workspace based on AI response
 * @param {Array<Object>} blockSpecs - Array of block specifications
 * @param {boolean} clearFirst - Whether to clear existing blocks first
 * @returns {number} Number of blocks created
 */
export function addBlocks(blockSpecs, clearFirst = false) {
    if (!blockSpecs || blockSpecs.length === 0) {
        console.warn('BlocklyActions: No blocks to add');
        return 0;
    }
    
    const workspace = getWorkspace();
    if (!workspace) {
        console.error('BlocklyActions: Workspace not found');
        return 0;
    }
    
    // Clear workspace if requested
    if (clearFirst) {
        clearWorkspace();
    }
    
    // Get the last block in the current chain
    let lastBlock = getLastBlock();
    if (!lastBlock) {
        console.error('BlocklyActions: Start block not found');
        return 0;
    }
    
    let created = 0;
    
    // Create each block in sequence
    for (const blockSpec of blockSpecs) {
        if (blockSpec.type === 'custom_start') {
            continue; // Skip start block (already exists)
        }
        
        const newBlock = createBlock(blockSpec);
        if (newBlock) {
            // Connect to the chain
            if (lastBlock.nextConnection && newBlock.previousConnection) {
                try {
                    lastBlock.nextConnection.connect(newBlock.previousConnection);
                    lastBlock = newBlock;
                    created++;
                } catch (connError) {
                    console.error('BlocklyActions: Failed to connect blocks:', connError);
                    // Still count as created even if connection failed
                    created++;
                }
            } else {
                console.warn('BlocklyActions: Could not connect block - missing connections');
                created++;
            }
        }
    }
    
    // Center view on the start block
    const startBlock = getStartBlock();
    if (startBlock) {
        workspace.centerOnBlock(startBlock.id);
    }
    
    console.log(`BlocklyActions: Created ${created} block(s)`);
    return created;
}

/**
 * Get current workspace state as an array of block specifications
 * @returns {Array<Object>} Array of block specs
 */
export function getWorkspaceState() {
    const workspace = getWorkspace();
    if (!workspace) {
        console.error('BlocklyActions: Workspace not found');
        return [];
    }
    
    const blocks = [];
    const startBlock = getStartBlock();
    
    if (!startBlock) {
        return blocks;
    }
    
    let currentBlock = startBlock.nextConnection?.targetBlock();
    
    while (currentBlock) {
        const blockSpec = {
            type: currentBlock.type
        };
        
        // Extract field values
        const fields = {};
        currentBlock.inputList.forEach(input => {
            input.fieldRow.forEach(field => {
                if (field.name && field.getValue) {
                    fields[field.name] = field.getValue();
                }
            });
        });
        
        if (Object.keys(fields).length > 0) {
            blockSpec.fields = fields;
        }
        
        blocks.push(blockSpec);
        currentBlock = currentBlock.nextConnection?.targetBlock();
    }
    
    return blocks;
}

/**
 * Disable workspace interaction (for Pair Programming Driver mode)
 * When AI is the driver, user shouldn't modify the workspace
 */
export function disableWorkspace() {
    const workspace = getWorkspace();
    if (!workspace) {
        console.error('BlocklyActions: Workspace not found');
        return;
    }
    
    // Make all blocks non-editable and non-deletable
    workspace.getAllBlocks(false).forEach(block => {
        block.setEditable(false);
        block.setMovable(false);
        block.setDeletable(false);
    });
    
    // Keep toolbox visible but disable interactions
    const toolbox = workspace.getToolbox();
    if (toolbox) {
        toolbox.setVisible(true);
    }
    const container = document.getElementById('blockly-workspace');
    if (container) {
        container.classList.add('blockly-disabled');
    }
    
    console.log('BlocklyActions: Workspace interaction disabled');
}

/**
 * Enable workspace interaction (normal mode)
 */
export function enableWorkspace() {
    const workspace = getWorkspace();
    if (!workspace) {
        console.error('BlocklyActions: Workspace not found');
        return;
    }
    
    // Make blocks editable again (except start block)
    workspace.getAllBlocks(false).forEach(block => {
        block.setEditable(true);
        block.setMovable(true);
        block.setDeletable(block.type !== 'custom_start');
    });
    
    // Enable toolbox
    const toolbox = workspace.getToolbox();
    if (toolbox) {
        toolbox.setVisible(true);
    }
    const container = document.getElementById('blockly-workspace');
    if (container) {
        container.classList.remove('blockly-disabled');
    }
    
    console.log('BlocklyActions: Workspace interaction enabled');
}

/**
 * Check if workspace is currently disabled
 * @returns {boolean}
 */
export function isWorkspaceDisabled() {
    const workspace = getWorkspace();
    if (!workspace) return false;
    
    const blocks = workspace.getAllBlocks(false);
    if (blocks.length === 0) return false;
    
    // Check if any non-start block is editable
    return !blocks.some(block => block.type !== 'custom_start' && block.isEditable());
}
