/**
 * @fileoverview TerminalUI - Simulated terminal panel that displays messages
 * printed by student programs (via the "Print" block) alongside run
 * start/completion/error markers, so output is visible in the UI rather
 * than only in the browser console.
 * @module game/terminal/TerminalUI
 */
export class TerminalUI {
    constructor() {
        this.bodyEl = null;
        this.maxLines = 200;
    }

    /**
     * Attach to the terminal DOM elements and wire up the clear/collapse controls.
     * @param {string} [bodyId] - Element ID of the scrollable terminal body.
     */
    init(bodyId = 'terminal-body') {
        this.bodyEl = document.getElementById(bodyId);
        this.bindControls();
    }

    bindControls() {
        const clearBtn = document.getElementById('terminal-clear-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clear());

        const toggleBtn = document.getElementById('terminal-toggle-btn');
        if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleCollapse());
    }

    toggleCollapse() {
        const panel = document.getElementById('terminal-panel');
        const icon = document.getElementById('terminal-toggle-icon');
        if (!panel) return;
        panel.classList.toggle('collapsed');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    }

    /** Print a student-authored message (from the Print block). */
    print(text) {
        this._appendLine(text, 'output');
    }

    /** Mark the start of a run. */
    runStart(levelId) {
        this._appendLine(`$ Running ${levelId || 'program'}...`, 'system');
    }

    /** Mark the end of a run, success or failure. */
    runEnd(success, errorMessage) {
        if (success) {
            this._appendLine('✓ Program completed', 'system-success');
        } else {
            this._appendLine(`✗ Runtime error: ${errorMessage}`, 'error');
        }
    }

    clear() {
        if (this.bodyEl) this.bodyEl.innerHTML = '';
    }

    _appendLine(text, variant) {
        if (!this.bodyEl) return;

        const line = document.createElement('div');
        line.className = `terminal-line terminal-line-${variant}`;
        line.textContent = text;
        this.bodyEl.appendChild(line);

        while (this.bodyEl.children.length > this.maxLines) {
            this.bodyEl.removeChild(this.bodyEl.firstChild);
        }

        this.bodyEl.scrollTop = this.bodyEl.scrollHeight;
    }
}

const terminalUI = new TerminalUI();
export default terminalUI;
