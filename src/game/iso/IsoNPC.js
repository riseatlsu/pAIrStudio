/**
 * @fileoverview IsoNPC - A scripted, patrolling non-player robot.
 * Walks a fixed grid path on a timer, independent of the player's own
 * Blockly-driven movement, blocking movement into its current tile and
 * reporting as 'robot' to the player's sensing blocks.
 * @module game/iso/IsoNPC
 */
import { MoveableObject } from './IsoObjects';
import { gridToScreen } from './IsoUtils';

export class IsoNPC extends MoveableObject {
    /**
     * @param {Phaser.Scene} scene
     * @param {IsoBoard} board
     * @param {number} gridRow - Starting row (should match path[0].row)
     * @param {number} gridCol - Starting col (should match path[0].col)
     * @param {string} texture - Texture key (reuses the player's 'robot' spritesheet)
     * @param {Object} config
     * @param {string} config.id
     * @param {Array<{row:number,col:number}>} config.path - Ordered, adjacent grid tiles to patrol
     * @param {number} [config.stepIntervalMs=750] - Time between the start of each step
     * @param {number} [config.stepDurationMs=400] - Tween duration of each step (matches IsoPlayer)
     * @param {number} [config.tint=0xffa500] - Sprite tint so it reads as distinct from the player
     */
    constructor(scene, board, gridRow, gridCol, texture, config = {}) {
        super(scene, board, gridRow, gridCol, texture, {
            ...config,
            zHeight: config.zHeight ?? 10,
            collidable: true,
            pickupable: false, // Can't be picked up like a box
            visualOffsetX: -2,
            visualOffsetY: 4
        });

        this.type = 'npc';
        this.id = config.id || null;

        // Distinct isoType so GameAPI.survey()/getCollisionInfo() report 'robot'
        this.isoType = 'robot';
        this.sprite.isoType = 'robot';
        this.sprite.setTint(config.tint ?? 0xffa500);

        this.path = Array.isArray(config.path) && config.path.length > 0
            ? config.path
            : [{ row: gridRow, col: gridCol }];
        this.pathIndex = 0;     // caller spawns the NPC at path[0]
        this.pathDirection = 1; // +1 forward, -1 backward (ping-pong)
        this.stepIntervalMs = config.stepIntervalMs ?? 750;
        this.stepDurationMs = config.stepDurationMs ?? 400;
        this.isStepping = false;
        this.timerEvent = null;
    }

    /** Start the patrol timer. Safe to call once per spawn. */
    startPatrol() {
        if (this.timerEvent || this.path.length < 2) return;
        this.timerEvent = this.scene.time.addEvent({
            delay: this.stepIntervalMs,
            loop: true,
            callback: () => this.tryStep()
        });
    }

    /**
     * Stop the patrol timer AND cancel any in-flight step tween. Must be
     * called before the level tears down (isoBoard.clear() nulls sprites but
     * has no awareness of timers/tweens) - without killing the tween too, an
     * NPC that's mid-step when "Run Code" is clicked (which is effectively
     * always, since NPCs move independently of the player's program) would
     * have its tween's onComplete fire after the sprite is already null.
     */
    stopPatrol() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
        if (this.sprite) {
            this.scene.tweens.killTweensOf(this.sprite);
        }
        this.isStepping = false;
    }

    _computeNextIndex() {
        let next = this.pathIndex + this.pathDirection;
        if (next < 0 || next >= this.path.length) {
            this.pathDirection *= -1;
            next = this.pathIndex + this.pathDirection;
        }
        return next;
    }

    tryStep() {
        if (this.isStepping) return;

        const nextIndex = this._computeNextIndex();
        const target = this.path[nextIndex];

        // If blocked (e.g. by the player), stall this tick and retry later.
        // No pathfinding - this is a fixed patrol route, not a smart agent.
        if (!this.board.isWalkable(target.row, target.col)) return;

        this.pathIndex = nextIndex;
        this.stepTo(target.row, target.col, this.stepDurationMs);
    }

    stepTo(row, col, durationMs) {
        this.isStepping = true;

        const dRow = row - this.gridRow;
        const dCol = col - this.gridCol;
        let dirFrame = 0;                  // SOUTH default
        if (dCol > 0) dirFrame = 1;        // EAST
        else if (dCol < 0) dirFrame = 2;   // WEST
        else if (dRow < 0) dirFrame = 3;   // NORTH
        else if (dRow > 0) dirFrame = 0;   // SOUTH
        this.sprite.setFrame(dirFrame);

        const pos = gridToScreen(row, col, this.board.tileWidth, this.board.tileHeight, this.zHeight);
        this.scene.tweens.add({
            targets: this.sprite,
            x: pos.x + this.visualOffsetX,
            y: pos.y + this.board.tileHeight / 2 + this.visualOffsetY,
            duration: durationMs,
            ease: 'Power1',
            onComplete: () => {
                this.gridRow = row;
                this.gridCol = col;
                this.sprite.isoRow = row;
                this.sprite.isoCol = col;
                this.isStepping = false;
            }
        });
    }
}
