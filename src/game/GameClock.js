/**
 * @fileoverview GameClock - Single shared discrete tick source for the whole
 * simulation. Player actions, NPC patrol steps, and the Blockly "Wait" block
 * all advance on this one clock instead of independent wall-clock timers, so
 * there's never a window where one entity's logical position lags what's
 * visually on screen relative to another entity's collision check.
 * @module game/GameClock
 */
export class GameClock {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} [tickMs=500] - Real-world milliseconds per tick.
     */
    constructor(scene, tickMs = 500) {
        this.scene = scene;
        this.tickMs = tickMs;
        this.tickCount = 0;
        this.listeners = [];
        this.timerEvent = null;
        this.stopRequested = false;
    }

    start() {
        this.stop();
        this.tickCount = 0;
        this.stopRequested = false;
        this.timerEvent = this.scene.time.addEvent({
            delay: this.tickMs,
            loop: true,
            callback: () => this._tick()
        });
    }

    /**
     * Request that any pending waitTicks() calls reject on the next tick,
     * so a running Blockly program can be cleanly aborted (e.g. the user hit
     * "Stop" on an accidental infinite loop). Every player action and the
     * "Wait" block funnel through waitTicks(), so this is a single choke
     * point that covers all of them without needing to instrument each one.
     */
    requestStop() {
        this.stopRequested = true;
    }

    stop() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
        this.listeners = [];
    }

    /**
     * Subscribe to every tick. Returns an unsubscribe function.
     * @param {(tickCount: number) => void} callback
     * @returns {() => void}
     */
    onTick(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Resolve after N ticks elapse (minimum 1), or reject immediately if a
     * stop was requested (see requestStop()).
     * @param {number} [n=1]
     * @returns {Promise<void>}
     */
    waitTicks(n = 1) {
        return new Promise((resolve, reject) => {
            if (this.stopRequested) {
                reject(new Error('Stopped by user'));
                return;
            }
            let remaining = Math.max(1, Math.floor(n) || 1);
            const unsubscribe = this.onTick(() => {
                if (this.stopRequested) {
                    unsubscribe();
                    reject(new Error('Stopped by user'));
                    return;
                }
                remaining--;
                if (remaining <= 0) {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }

    _tick() {
        this.tickCount++;
        // Snapshot so a listener subscribing/unsubscribing mid-tick (e.g. an
        // NPC's onTick handler triggering another action) doesn't skip/duplicate.
        const current = [...this.listeners];
        current.forEach((fn) => fn(this.tickCount));
    }
}
