/**
 * @fileoverview DialogueUI - Pokemon-style NPC dialogue box. Shows a
 * character portrait and click-through text before a level loads, telling
 * the "new hire at Ironhaul Logistics" training story. Blocking (dims and
 * covers the rest of the page until dismissed) and shown once per
 * participant per level via localStorage, mirroring the participant-scoped
 * key pattern already used by BlocklyManager's workspace storage.
 * @module game/dialogue/DialogueUI
 */

const SPEAKER_NAME = 'Mack';
const TYPEWRITER_MS_PER_CHAR = 18;
// talking_sound.wav is a short blip - retrigger it every few characters
// (skipping spaces) while text types out, Animal Crossing-style, rather than
// on every single character (which would just be a wall of overlapping noise).
const TALK_SOUND_CHAR_INTERVAL = 4;
const TALK_SOUND_VOLUME = 0.3;

export class DialogueUI {
    constructor() {
        this.overlayEl = null;
        this.speakerEl = null;
        this.textEl = null;
        this.continueEl = null;
        this.skipBtn = null;
        this.portraitEl = null;

        this.lines = [];
        this.lineIndex = 0;
        this.typewriterTimer = null;
        this.isTyping = false;
        this.resolvePromise = null;
        this.sandboxMode = false;
    }

    setSandboxMode(enable = true) {
        this.sandboxMode = enable;
    }

    init() {
        this.overlayEl = document.getElementById('dialogue-overlay');
        this.speakerEl = document.getElementById('dialogue-speaker');
        this.textEl = document.getElementById('dialogue-text');
        this.continueEl = document.getElementById('dialogue-continue');
        this.skipBtn = document.getElementById('dialogue-skip-btn');
        this.portraitEl = document.getElementById('dialogue-portrait');

        // Portrait src is left as whatever each HTML page already sets (root
        // vs sandbox pages are at different directory depths, so they need
        // different relative paths - don't stomp on it from this shared module).
        if (this.speakerEl) this.speakerEl.textContent = SPEAKER_NAME;

        const box = this.overlayEl?.querySelector('.dialogue-box');
        if (box) {
            box.addEventListener('click', (e) => {
                if (e.target === this.skipBtn) return;
                this._advance();
            });
        }
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._dismiss();
            });
        }
    }

    /** Storage key mirrors BlocklyManager.getWorkspaceStorageKey()'s convention. */
    getStorageKey(levelId) {
        const prefix = this.sandboxMode ? 'sandbox' : this.getParticipantId();
        return `dialogueSeen_${prefix}_${levelId}`;
    }

    getParticipantId() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'pair_participant_id') return value;
        }
        return 'default';
    }

    hasSeen(levelId) {
        if (this.sandboxMode) return false;
        try {
            return localStorage.getItem(this.getStorageKey(levelId)) === 'true';
        } catch (e) {
            return false;
        }
    }

    markSeen(levelId) {
        if (this.sandboxMode) return;
        try {
            localStorage.setItem(this.getStorageKey(levelId), 'true');
        } catch (e) {
            // localStorage unavailable - fine to just skip persisting
        }
    }

    /**
     * Show a sequence of dialogue lines. Resolves once the player has
     * clicked through (or skipped) all of them.
     * @param {string[]} lines
     * @param {string} levelId - Logged explicitly (not relying on
     *   DataLogger's auto-tagged currentLevel) since this fires BEFORE
     *   LevelManager calls logLevelStart() for the level the dialogue belongs to.
     * @returns {Promise<void>}
     */
    show(lines, levelId) {
        return new Promise((resolve) => {
            if (!this.overlayEl || !Array.isArray(lines) || lines.length === 0) {
                resolve();
                return;
            }

            this.lines = lines;
            this.lineIndex = 0;
            this.resolvePromise = resolve;
            this._levelId = levelId;

            if (window.dataLogger) {
                window.dataLogger.logEvent('dialogue_shown', { levelId, lineCount: lines.length });
            }
            this._dialogueStartTime = Date.now();

            this.overlayEl.classList.add('show');
            this._renderCurrentLine();
        });
    }

    _renderCurrentLine() {
        const line = this.lines[this.lineIndex];
        if (this.continueEl) this.continueEl.classList.remove('show');
        this._typeLine(line);
    }

    _typeLine(line) {
        clearInterval(this.typewriterTimer);
        this.isTyping = true;
        this.textEl.textContent = '';

        let charIndex = 0;
        this.typewriterTimer = setInterval(() => {
            charIndex++;
            this.textEl.textContent = line.slice(0, charIndex);

            const revealedChar = line[charIndex - 1];
            if (revealedChar && revealedChar !== ' ' && charIndex % TALK_SOUND_CHAR_INTERVAL === 0) {
                this._playTalkSound();
            }

            if (charIndex >= line.length) {
                clearInterval(this.typewriterTimer);
                this.isTyping = false;
                if (this.continueEl) this.continueEl.classList.add('show');
            }
        }, TYPEWRITER_MS_PER_CHAR);
    }

    /** Plays via the shared Phaser sound manager (window.game.sound) since
     * this module lives outside any Phaser scene. */
    _playTalkSound() {
        try {
            window.game?.sound?.play('talking_sound', { volume: TALK_SOUND_VOLUME });
        } catch (e) {
            // Audio playback failing (e.g. browser autoplay policy) shouldn't
            // break the dialogue itself.
        }
    }

    _advance() {
        // First click while typing: fast-forward to the full line (classic
        // Pokemon behavior). Second click: move to the next line.
        if (this.isTyping) {
            clearInterval(this.typewriterTimer);
            this.isTyping = false;
            this.textEl.textContent = this.lines[this.lineIndex];
            if (this.continueEl) this.continueEl.classList.add('show');
            return;
        }

        this.lineIndex++;
        if (this.lineIndex >= this.lines.length) {
            this._dismiss();
            return;
        }
        this._renderCurrentLine();
    }

    _dismiss() {
        clearInterval(this.typewriterTimer);
        this.overlayEl.classList.remove('show');

        if (window.dataLogger) {
            const readTimeMs = this._dialogueStartTime ? Date.now() - this._dialogueStartTime : null;
            window.dataLogger.logEvent('dialogue_dismissed', { levelId: this._levelId, readTimeMs });
        }

        if (this.resolvePromise) {
            const resolve = this.resolvePromise;
            this.resolvePromise = null;
            resolve();
        }
    }
}

export const dialogueUI = new DialogueUI();
