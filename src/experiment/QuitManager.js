/**
 * @fileoverview QuitManager - Lets a participant voluntarily withdraw from the
 * study mid-session. Requires explicit, deliberate confirmation (they must
 * check a box acknowledging they will not be paid), then records the quit
 * event/level/elapsed time to Firebase, best-effort flushes any queued
 * offline events, and clears local session state so the browser can't be
 * used to silently resume the same session afterward.
 * @module experiment/QuitManager
 */

// Keys/prefixes for all client-side state this app persists, so quitting
// leaves nothing behind that could be used to resume the session.
const STORAGE_PREFIXES = ['pair_studio_', 'blocklyWorkspace_', 'chatHistory_', 'surveyAnswers_', 'surveyComplete_'];
const STORAGE_EXACT_KEYS = ['dataLogger_userId', 'dataLogger_participantId', 'dataLogger_group', 'prolific_pid', 'qualtrics_uid'];

/**
 * Remove all pAIrStudio localStorage keys.
 * @param {boolean} preserveEventQueue - Keep `dataLogger_eventQueue` if there
 *   are still unsynced events queued (e.g. participant is offline) so they
 *   aren't lost — DataLogger will retry sending them if it gets a connection.
 */
function clearAppLocalStorage(preserveEventQueue) {
    const exactKeys = [...STORAGE_EXACT_KEYS];
    if (!preserveEventQueue) exactKeys.push('dataLogger_eventQueue');

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (exactKeys.includes(key) || STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export class QuitManager {
    constructor() {
        this.isQuitting = false;
    }

    init() {
        const quitBtn = document.getElementById('quit-study-btn');
        const cancelBtn = document.getElementById('quit-cancel-btn');
        const confirmBtn = document.getElementById('quit-confirm-btn');
        const checkbox = document.getElementById('quit-confirm-checkbox');
        const modal = document.getElementById('quit-modal-overlay');

        if (quitBtn) quitBtn.addEventListener('click', () => this.openModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());

        if (checkbox && confirmBtn) {
            checkbox.addEventListener('change', () => {
                confirmBtn.disabled = !checkbox.checked;
            });
        }

        if (confirmBtn) confirmBtn.addEventListener('click', () => this.confirmQuit());

        // Clicking the dimmed backdrop cancels, same as the Cancel button.
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
    }

    openModal() {
        const modal = document.getElementById('quit-modal-overlay');
        const checkbox = document.getElementById('quit-confirm-checkbox');
        const confirmBtn = document.getElementById('quit-confirm-btn');

        if (checkbox) checkbox.checked = false;
        if (confirmBtn) confirmBtn.disabled = true;
        if (modal) modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('quit-modal-overlay');
        if (modal) modal.classList.remove('show');
    }

    async confirmQuit() {
        if (this.isQuitting) return;
        this.isQuitting = true;

        const confirmBtn = document.getElementById('quit-confirm-btn');
        const cancelBtn = document.getElementById('quit-cancel-btn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Quitting...';
        }
        if (cancelBtn) cancelBtn.disabled = true;

        const levelId = window.LevelManager?.currentLevelId || null;

        try {
            if (window.dataLogger) {
                // Best-effort reconnect so any events queued while offline get
                // one more chance to sync before we log the quit itself.
                if (!window.dataLogger.isFirebaseReady) {
                    try {
                        await window.dataLogger.initExperiment();
                    } catch (e) {
                        console.warn('QuitManager: Could not reconnect before quitting:', e);
                    }
                }
                await window.dataLogger.logQuit(levelId);
            }
        } catch (e) {
            console.error('QuitManager: Error logging quit:', e);
        }

        // Don't destroy not-yet-synced events if we're still offline.
        const queueStillPending = Boolean(window.dataLogger?.eventQueue?.length);

        if (window.experimentManager) {
            window.experimentManager.clearCookies();
        }
        clearAppLocalStorage(queueStillPending);

        this.closeModal();
        this.showCompleteScreen();
    }

    showCompleteScreen() {
        const overlay = document.getElementById('quit-complete-overlay');
        if (overlay) overlay.classList.add('show');

        if (window.chatbotManager?.hide) {
            window.chatbotManager.hide();
        }
    }
}

export const quitManager = new QuitManager();
window.quitManager = quitManager;
