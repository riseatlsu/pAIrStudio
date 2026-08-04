export class GameAPI {
    static getScene() {
        if (!window.game) return null;
        return window.game.scene.getScene('MainScene');
    }

    static async ready() {
        const scene = GameAPI.getScene();
        if (!scene) return false;
        // Wait until player exists
        if (!scene.player) {
            return new Promise(resolve => {
                const i = setInterval(() => {
                    if (GameAPI.getScene().player) {
                        clearInterval(i);
                        resolve(true);
                    }
                }, 100);
            });
        }
        return true;
    }

    static async moveForward(steps = 1) {
        const scene = GameAPI.getScene();
        if (!scene || !scene.player) return;

        console.log(`API: Moving Forward ${steps}`);
        for (let i = 0; i < steps; i++) {
            // player.moveForward() already awaits exactly one GameClock tick,
            // so no extra inter-step delay is needed here.
            const success = await scene.player.moveForward();
            if (!success) {
                console.warn("Move failed (collision or bound)");
                break;
            }
        }
    }

    static async rotateCounterClockwise() {
        const scene = GameAPI.getScene();
        if (scene && scene.player) {
            console.log("API: Rotate Counter Clockwise");
            await scene.player.turnCounterClockwise();
        }
    }

    static async rotateClockwise() {
        const scene = GameAPI.getScene();
        if (scene && scene.player) {
            console.log("API: Rotate Clockwise");
            await scene.player.turnClockwise();
        }
    }

    static async pickupItem() {
        const scene = GameAPI.getScene();
        if (!scene || !scene.player) return false;
        console.log("API: Picking Up");
        return await scene.player.pickUp();
    }

    static async dropItem() {
        const scene = GameAPI.getScene();
        if (!scene || !scene.player) return false;
        console.log("API: Dropping");
        return await scene.player.drop();
    }

    /**
     * Survey the tile in front of the player.
     * Returns an object description: { type: 'nothing'|'wall'|'box'|'conveyor', id: string, attributes: {} }
     */
    static async survey() {
        const scene = GameAPI.getScene();
        if (!scene || !scene.player) return { type: 'error' };

        const start = { row: scene.player.gridRow, col: scene.player.gridCol };
        const front = scene.player.getFrontCoordinates(); // Helper in IsoPlayer? Ensure it exists.
        
        // Wait, I saw getFrontCoordinates in IsoPlayer.
        
        // Check Moveable
        const mov = scene.isoBoard.getMoveableAt(front.row, front.col);
        if (mov) {
            return {
                type: mov.isoType || 'object', // 'box'
                id: mov.attributes ? mov.attributes.id : null,
                attributes: mov.attributes || {}
            };
        }

        // Check Stationary
        const stat = scene.isoBoard.getStationaryAt(front.row, front.col);
        if (stat) {
             return {
                type: stat.isoType || 'stationary', // 'conveyor'
                id: stat.attributes ? stat.attributes.id : null,
                attributes: stat.attributes || {}
            };           
        }
        
        // Check Floor (isWalkable check implicitly?)
        // If nothing checking boundaries?
        if (!scene.isoBoard.isWalkable(front.row, front.col)) {
             return { type: 'wall' }; // Or 'void'
        }

        return { type: 'floor' }; // Empty floor
    }

    /**
     * Print a message to the on-screen terminal panel and log it for research analysis.
     * @param {*} message - Value to print (coerced to a string).
     */
    static async printMessage(message) {
        const text = String(message);
        console.log(`API: Print -> ${text}`);

        if (window.terminalUI) {
            window.terminalUI.print(text);
        }

        const scene = GameAPI.getScene();
        const levelId = scene?.levelManager?.currentLevelId;
        if (window.dataLogger && levelId) {
            window.dataLogger.logEvent('print_message', { levelId, message: text });
        }
    }

    /**
     * Pause program execution for a number of game-loop ticks. Used to poll
     * sensing results (e.g. waiting for an NPC robot to clear a tile) without
     * a busy loop. Ticks, not real seconds, so this stays perfectly in sync
     * with player/NPC movement on the shared GameClock.
     * @param {number} loopCount
     */
    static async waitLoops(loopCount) {
        const scene = GameAPI.getScene();
        if (!scene || !scene.gameClock) return;
        const n = Math.max(1, Math.floor(Number(loopCount)) || 1);
        await scene.gameClock.waitTicks(n);
    }

    static async resetLevel() {
        const scene = GameAPI.getScene();
        if (scene) {
            // Check if restartLevel exists, if not use scene.loadLevel
            if (scene.levelManager.restartLevel) {
                 scene.levelManager.restartLevel(scene);
            } else {
                 // Fallback: Manually reload the current level from the Scene
                 scene.loadLevel(scene.levelManager.currentLevelId);
            }
            // Wait for restart
            await new Promise(r => setTimeout(r, 500));
        }
    }

    /**
     * Load a new level (called when switching levels from UI)
     */
    static async loadLevel(levelConfig) {
        const scene = GameAPI.getScene();
        if (scene && levelConfig) {
            scene.loadLevel(levelConfig.id);
            await new Promise(r => setTimeout(r, 500));
        }
    }

    /**
     * Mark current level as complete
     */
    static completeCurrentLevel() {
        const scene = GameAPI.getScene();
        if (scene && scene.levelManager) {
            scene.levelManager.completeLevel(scene.levelManager.currentLevelId);
        }
    }

    /**
     * Go to next level
     */
    static async nextLevel() {
        const scene = GameAPI.getScene();
        if (scene && scene.levelManager) {
            const nextLevelId = scene.levelManager.nextLevel();
            if (nextLevelId) {
                await new Promise(r => setTimeout(r, 500));
            }
        }
    }
}

// Expose global for evaluating generated code
window.GameAPI = GameAPI;
