/**
 * @fileoverview LevelBuilder - Constructs game levels from configuration objects.
 * Translates level definitions into IsoBoard entities (floor, objects, player).
 * @module game/levels/LevelBuilder
 */

/**
 * LevelBuilder - Instantiates levels from configuration data.
 * 
 * Responsible for:
 * - Creating floor tiles from 2D map data
 * - Placing stationary objects (conveyors, stations)
 * - Placing moveable objects (boxes)
 * - Validating win conditions
 * - Checking level completion criteria
 * 
 * @class LevelBuilder
 */
export class LevelBuilder {
    /**
     * Create a LevelBuilder instance.
     * 
     * @param {Phaser.Scene} scene - The Phaser scene
     * @param {IsoBoard} board - The isometric board to build on
     * @param {Object} [textureMap] - Mapping of logical names to texture keys
     * @param {Object} textureMap.floor - Floor tile config {key, frame}
     * @param {Object} textureMap.conveyor - Conveyor config {key, frame}
     * @param {Object} textureMap.robot - Robot config {key, frameOffset}
     * @param {Object} textureMap.box - Box config {key, frame}
     */
    constructor(scene, board, textureMap) {
        this.scene = scene;
        this.board = board;
        // Map logical strings ('floor', 'conveyor') to asset keys & frame indices
        this.textureMap = textureMap || {
            floor: { key: 'tiles', frame: 0 },
            conveyor: [0, 1, 2].map(frame => ({ key: 'conveyor', frame })),
            zone: { key: 'zone', frame: 0 },
            robot: { key: 'robot', frameOffset: 0 }, // robot_type_1 (Row 0)
            box: { key: 'box', frame: 0 },
            pillars: [0, 1, 2, 3].map(frame => ({ key: 'pillars', frame })),
            walls: [0, 1].map(frame => ({ key: 'walls', frame })),
            shelves: Array.from({ length: 8 }, (_, frame) => ({ key: 'shelves', frame })),
        };
    }

    build(levelConfig) {
        // 1. Build Floor
        // The map data in config might be simplified (0 for empty, 1 for floor). 
        // We need to map that to actual texture frames.
        const floorData = levelConfig.map.data.map(row => 
            row.map(cellId => {
                // Assuming 1 = basic floor, 0 = empty hole
                return cellId === 1 ? this.textureMap.floor.frame : -1;
            })
        );
        
        this.board.createFloor(floorData, this.textureMap.floor.key);

        // 2. Place Stationary Objects
        if (levelConfig.objects && levelConfig.objects.stationary) {
            levelConfig.objects.stationary.forEach(obj => {
                if (obj.type === 'conveyor') {
                    // Conveyors are special Stationary Objects
                    // Use object's frame if specified, otherwise use default from textureMap
                    // Support conveyor as array
                    let conveyorKey, conveyorFrame;
                    if (Array.isArray(this.textureMap.conveyor)) {
                        conveyorKey = this.textureMap.conveyor[0].key;
                        conveyorFrame = obj.attributes?.frame !== undefined ? obj.attributes.frame : this.textureMap.conveyor[0].frame;
                    } else {
                        conveyorKey = this.textureMap.conveyor.key;
                        conveyorFrame = obj.attributes?.frame !== undefined ? obj.attributes.frame : this.textureMap.conveyor.frame;
                    }
                    const conv = this.board.addStationaryObject(obj.row, obj.col, conveyorKey, {
                        frame: conveyorFrame,
                        collidable: true, // Cannot walk on conveyor
                        isConveyor: true, // Mark as conveyor for game logic (for IsoBoard and win conditions)
                        attributes: { 
                            allowDrop: false,
                            id: obj.id, // e.g., 'input_1', 'output_1'
                            ...obj.attributes 
                        }
                    });
                } 
                else if (obj.type === 'zone') {
                    // Zones are special Stationary Objects
                    const zone = this.board.addStationaryObject(obj.row, obj.col, this.textureMap.zone.key, {
                        frame: this.textureMap.zone.frame,
                        collidable: false, // Can walk on zone
                        isZone: true, // Mark as zone for depth sorting (for IsoBoard) and for game logic (for win conditions)
                        attributes: { 
                            allowDrop: true,
                            id: obj.id,
                            ...obj.attributes 
                        }
                    });
                }
                else if (obj.type === 'pillars') {
                    const pillarConfig = this.textureMap.pillars[obj.attributes.frame % this.textureMap.pillars.length]; // Support pillars as array with frame selection
                    this.board.addStationaryObject(obj.row, obj.col, pillarConfig.key, {
                        frame: pillarConfig.frame,
                        collidable: true,
                        isPillar: true,
                        attributes: {
                            allowDrop: false,
                            id: obj.id,
                            ...obj.attributes
                        }
                    });
                }
                else if (obj.type === 'walls') {
                    const wallConfig = this.textureMap.walls[obj.attributes.frame % this.textureMap.walls.length];
                    this.board.addStationaryObject(obj.row, obj.col, wallConfig.key, {
                        frame: wallConfig.frame,
                        collidable: false,
                        isWall: true,
                        visualOffsetX: -15, // Center the wider wall sprite horizontally
                        visualOffsetY: 18, // Offset tall wall sprite upward (base class adds tileHeight/2)
                        attributes: {
                            allowDrop: false,
                            id: obj.id,
                            ...obj.attributes
                        }
                    });
                }
                else if (obj.type === 'shelves') {
                    const shelfConfig = this.textureMap.shelves[obj.attributes.frame % this.textureMap.shelves.length];
                    this.board.addStationaryObject(obj.row, obj.col, shelfConfig.key, {
                        frame: shelfConfig.frame,
                        collidable: true,
                        isShelf: true,
                        attributes: {
                            allowDrop: false,
                            id: obj.id,
                            ...obj.attributes
                        }
                    });
                }
                else if (obj.type === 'drums') {
                    const drumConfig = this.textureMap.drums[obj.attributes.frame % this.textureMap.drums.length];
                    this.board.addStationaryObject(obj.row, obj.col, drumConfig.key, {
                        frame: drumConfig.frame,
                        collidable: true,
                        isDrum: true,
                        attributes: {
                            allowDrop: false,
                            id: obj.id,
                            ...obj.attributes
                        }
                    });
                }
            });
        }

        // 3. Place Moveable Objects (Boxes)
        if (levelConfig.objects && levelConfig.objects.moveable) {
            levelConfig.objects.moveable.forEach(obj => {
                if (obj.type === 'box') {
                    // Box Fixes: Bigger (scale 1.5) and Nudge NE (x+3, y-4)
                    const box = this.board.addMoveableObject(obj.row, obj.col, this.textureMap.box.key, {
                        frame: this.textureMap.box.frame,
                        scale: 1.25,
                        visualOffsetX: 3,
                        visualOffsetY: -4,
                        zHeight: 12, // Ensure it clears the conveyor
                        pickupable: true, // Explicitly mark as pickupable
                        attributes: { 
                            id: obj.id,
                            ...obj.attributes 
                        }
                    });
                    // Important: Link the ID to the object for win condition checking
                    box.id = obj.id; 
                    box.isoType = 'box'; // Explicit Type for Blockly
                }
            });
        }
        
        // 4. Return Player Config (Scene will instantiate Player to keep control separate)
        return levelConfig.player;
    }
}
