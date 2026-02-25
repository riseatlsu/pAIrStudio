import { experimentManager } from '../experiment/ExperimentManager.js';
import { GROUPS, GROUP_FEATURES } from '../experiment/GroupConfig.js';
import { chatbotManager } from '../chatbot/ChatbotManager.js';
import { LEVELS } from '../game/levels/index.js';

const DEFAULT_MODE = GROUPS.CONTROL;

const MODE_ORDER = [
    GROUPS.CONTROL,
    GROUPS.STANDARD_AI,
    GROUPS.PAIR_DRIVER,
    GROUPS.PAIR_NAVIGATOR
];

const levelEntries = Object.values(LEVELS);
const orderedLevels = buildOrderedLevelList(levelEntries);
const allLevelIds = orderedLevels.map((entry) => entry.id);

let selectedMode = null;
let isInitialized = false;

function buildOrderedLevelList(levels) {
    const tutorials = levels
        .filter((level) => level.id.startsWith('tutorial_'))
        .sort((a, b) => a.id.localeCompare(b.id));

    const experiments = levels
        .filter((level) => /^level_\d+$/i.test(level.id))
        .sort((a, b) => a.id.localeCompare(b.id));

    const surveys = levels
        .filter((level) => level.id.includes('survey'))
        .sort((a, b) => a.id.localeCompare(b.id));

    const remainingIds = new Set([...tutorials, ...experiments, ...surveys].map((level) => level.id));
    const extras = levels
        .filter((level) => !remainingIds.has(level.id))
        .sort((a, b) => a.id.localeCompare(b.id));

    return [...tutorials, ...experiments, ...surveys, ...extras];
}

function updateModeBadge(mode) {
    const badgeText = document.querySelector('.sandbox-header-pill span');
    if (!badgeText) {
        return;
    }
    const name = GROUP_FEATURES[mode]?.name || 'Sandbox Mode';
    badgeText.textContent = name;
}

function createModeCards() {
    const container = document.getElementById('sandbox-mode-options');
    if (!container) return;

    container.innerHTML = '';

    MODE_ORDER.forEach((modeId) => {
        const config = GROUP_FEATURES[modeId];
        if (!config) return;

        const card = document.createElement('div');
        card.className = 'sandbox-mode-card';
        card.dataset.mode = modeId;

        const icon = getModeIcon(modeId);
        const description = getModeDescription(modeId);

        card.innerHTML = `
            <div class="mode-card-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h4 class="mode-card-title">${config.name}</h4>
            <p class="mode-card-description">${description}</p>
        `;

        card.addEventListener('click', () => selectMode(modeId));
        container.appendChild(card);
    });
}

function getModeIcon(modeId) {
    const icons = {
        [GROUPS.CONTROL]: 'fa-user',
        [GROUPS.STANDARD_AI]: 'fa-robot',
        [GROUPS.PAIR_DRIVER]: 'fa-car',
        [GROUPS.PAIR_NAVIGATOR]: 'fa-compass'
    };
    return icons[modeId] || 'fa-cube';
}

function getModeDescription(modeId) {
    const descriptions = {
        [GROUPS.CONTROL]: 'No AI assistance. Code independently using visual blocks.',
        [GROUPS.STANDARD_AI]: 'AI chatbot available for help and guidance.',
        [GROUPS.PAIR_DRIVER]: 'Pair programming: You write code, AI guides strategy.',
        [GROUPS.PAIR_NAVIGATOR]: 'Pair programming: AI writes code, you guide strategy.'
    };
    return descriptions[modeId] || 'Experimental mode';
}

function showModeOverlay() {
    const overlay = document.getElementById('sandbox-mode-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideModeOverlay() {
    const overlay = document.getElementById('sandbox-mode-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

async function selectMode(mode) {
    selectedMode = mode;
    hideModeOverlay();
    
    if (!isInitialized) {
        await initializeSandbox();
    } else {
        // Reload page with new mode
        window.location.href = `?mode=${mode}`;
    }
}

function waitForLevelManager(timeoutMs = 10000, intervalMs = 100) {
    return new Promise((resolve, reject) => {
        const maxAttempts = Math.ceil(timeoutMs / intervalMs);
        let attempts = 0;

        const timer = setInterval(() => {
            attempts += 1;
            if (window.LevelManager) {
                clearInterval(timer);
                resolve(window.LevelManager);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(timer);
                reject(new Error('Sandbox: LevelManager not available'));
            }
        }, intervalMs);
    });
}

function waitForBlockly(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.blocklyWorkspace) {
                clearInterval(checkInterval);
                resolve(window.blocklyWorkspace);
            } else if (Date.now() - startTime > timeoutMs) {
                clearInterval(checkInterval);
                reject(new Error('Blockly workspace not ready'));
            }
        }, 100);
    });
}

let phaserBooted = false;
function bootPhaser() {
    if (phaserBooted) return;
    phaserBooted = true;
    import('../main.js');
}

async function initializeSandbox() {
    try {
        document.body.classList.add('sandbox-page');
        
        experimentManager.enableSandboxMode(true);
        experimentManager.initialize();
        experimentManager.setGroup(selectedMode, { persist: false });

        updateModeBadge(selectedMode);

        // Boot Phaser
        bootPhaser();
        
        // Wait for managers to be ready
        const levelManager = await waitForLevelManager();
        await waitForBlockly();
        
        levelManager.setSandboxMode(true);
        levelManager.setCustomProgression(allLevelIds);

        if (experimentManager.hasFeature('chatbot')) {
            chatbotManager.initialize(experimentManager, null);
        } else if (chatbotManager.isInitialized) {
            chatbotManager.hide();
        }

        document.title = `pAIrStudio Sandbox • ${GROUP_FEATURES[selectedMode]?.name || selectedMode}`;

        // Load first level
        levelManager.loadLevelById(allLevelIds[0]);
        
        isInitialized = true;
        console.log('✅ Sandbox initialized successfully');
    } catch (error) {
        console.error('Sandbox initialization error:', error);
        const textElement = document.getElementById('instructions-text');
        if (textElement) {
            textElement.textContent = `Setup failed: ${error.message}. Please refresh the page.`;
        }
    }
}

function resetSandbox() {
    window.location.href = window.location.pathname;
}

document.addEventListener('DOMContentLoaded', () => {
    createModeCards();
    
    // Check URL for mode parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    
    if (urlMode && MODE_ORDER.includes(urlMode)) {
        // Mode specified in URL, skip overlay and boot directly
        selectMode(urlMode);
    } else {
        // Show mode selection overlay
        showModeOverlay();
    }
    
    // Bind change mode button
    const changeModeBtn = document.getElementById('sandbox-change-mode-btn');
    if (changeModeBtn) {
        changeModeBtn.addEventListener('click', resetSandbox);
    }
});
