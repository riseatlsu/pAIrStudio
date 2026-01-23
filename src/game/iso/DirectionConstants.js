/**
 * DirectionConstants.js
 * Cardinal direction constants and conversion utilities for the isometric game
 */

// Cardinal direction constants (strings)
export const NORTH = 'NORTH';
export const SOUTH = 'SOUTH';
export const EAST = 'EAST';
export const WEST = 'WEST';

// Internal numeric direction mapping
// Used internally by IsoPlayer for sprite frames and movement calculations
export const DIRECTION_MAP = {
    [SOUTH]: 0,
    [EAST]: 1,
    [WEST]: 2,
    [NORTH]: 3
};

// Reverse mapping: number to string
export const DIRECTION_NAMES = {
    0: SOUTH,
    1: EAST,
    2: WEST,
    3: NORTH
};

/**
 * Convert a direction string to its numeric value
 * @param {string|number} direction - Cardinal direction string or number
 * @returns {number} Numeric direction (0-3)
 */
export function directionToNumber(direction) {
    // If already a number, return it
    if (typeof direction === 'number') {
        return direction;
    }
    
    // Convert string to uppercase and lookup
    const upper = direction.toUpperCase();
    if (DIRECTION_MAP.hasOwnProperty(upper)) {
        return DIRECTION_MAP[upper];
    }
    
    console.warn(`Unknown direction: ${direction}, defaulting to SOUTH`);
    return 0; // Default to SOUTH
}

/**
 * Convert a numeric direction to its string name
 * @param {number|string} direction - Numeric direction (0-3) or string direction
 * @returns {string} Cardinal direction string
 */
export function directionToString(direction) {
    // If already a string, validate and return it
    if (typeof direction === 'string') {
        const upper = direction.toUpperCase();
        if ([NORTH, SOUTH, EAST, WEST].includes(upper)) {
            return upper;
        }
        console.warn(`Unknown direction string: ${direction}, defaulting to SOUTH`);
        return SOUTH;
    }
    
    // If number, convert to string
    if (DIRECTION_NAMES.hasOwnProperty(direction)) {
        return DIRECTION_NAMES[direction];
    }
    
    console.warn(`Unknown direction number: ${direction}, defaulting to SOUTH`);
    return SOUTH;
}

/**
 * Get all valid direction strings
 * @returns {Array<string>} Array of valid direction names
 */
export function getValidDirections() {
    return [NORTH, SOUTH, EAST, WEST];
}
