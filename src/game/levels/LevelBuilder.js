// Level Builder - Constructs the IsoBoard from a Level Config

export class LevelBuilder {
    constructor(scene, board, textureMap) {
        this.scene = scene;
        this.board = board;
        // Map logical strings ('floor', 'conveyor') to asset keys & frame indices
        this.textureMap = textureMap || {
            floor: { key: 'tiles', frame: 0 },
            conveyor: { key: 'tiles', frame: 1 },
            robot: { key: 'robot', frameOffset: 0 }, // robot_type_1 (Row 0)
            box: { key: 'box', frame: 0 }
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
                    const conv = this.board.addStationaryObject(obj.row, obj.col, this.textureMap.conveyor.key, {
                        frame: this.textureMap.conveyor.frame,
                        collidable: true, // Cannot walk on conveyor
                        attributes: { 
                            allowDrop: true,
                            id: obj.id, // e.g., 'input_1', 'output_1'
                            ...obj.attributes 
                        }
                    });
                    conv.isoType = 'conveyor'; // Explicit Type for Blockly
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
