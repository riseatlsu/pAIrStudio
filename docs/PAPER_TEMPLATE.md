# pAIrStudio Study — Paper Template

This is a working template for writing up the pAIrStudio pilot study. The
sections below are pre-filled with what's fixed by the platform's
implementation (tasks, conditions, measured variables, level categories) so
that writing the paper is a matter of filling in participant numbers,
results, and discussion rather than re-deriving the design from the code.
Update this file as the design changes — it should always match what's
actually implemented in `src/`.

## 1. Study Overview

**Title (working):** Effects of AI Pair-Programming Assistance on Novice
Programming Task Performance in a Visual, Robot-Control Environment

**Platform:** pAIrStudio — a browser-based experimental platform in which
participants control a warehouse robot using Blockly-style visual
programming to move boxes between conveyor belts, under varying levels of
AI assistance.

**Research question (working):** Does access to a passive AI chatbot
assistant change task completion time, success rate, iteration count, and
navigation-error rate on code *development* vs. code *maintenance* tasks of
increasing difficulty, relative to a no-assistance control condition?

## 2. Experimental Design

**Design type:** Mixed. Experimental Group is between-subjects;
Task Type × Difficulty is within-subjects (every participant completes all
six experimental levels); Presentation Order is a counterbalancing control
variable, not a variable of interest.

### 2.1 Between-subjects factor: Experimental Group

Defined in `src/experiment/GroupConfig.js`.

| Group ID | Name | AI Assistance | Assignment |
|---|---|---|---|
| `control` | Control Group | None | Random, 50% |
| `standard_ai` | Standard AI Support | Passive chatbot assistant (`assistant` mode) | Random, 50% |
| `human_human` | Human-Human Collaboration | None (two participants collaborate) | Researcher-controlled only (`?hh=1` URL param); excluded from random assignment |

Group assignment happens once, at consent, and persists for the session via
cookie (30 days).

### 2.2 Within-subjects factors: Task Type × Difficulty

All participants complete six experimental levels (`level_001`–`level_006`),
which form a 2 (Task Type) × 3 (Difficulty) design:

| Level | Task Type | Difficulty | Title |
|---|---|---|---|
| `level_001` | Development | Easy | Easy Code Development |
| `level_002` | Development | Medium | Medium Code Development |
| `level_003` | Development | Hard | Hard Code Development |
| `level_004` | Maintenance | Easy | Easy Code Maintenance |
| `level_005` | Maintenance | Medium | Medium Code Maintenance |
| `level_006` | Maintenance | Hard | Hard Code Maintenance |

**Task Type definitions:**
- **Development** — participant starts from an empty Blockly workspace (just
  the `custom_start` block) and must write a complete program that picks up
  a box from an input conveyor and delivers it to an output conveyor.
  Difficulty scales with warehouse layout complexity (open floor → single
  obstacle wall → multiple obstacle walls requiring a longer planned route).
- **Maintenance** — participant is given a starter program (`starterBlocks`
  in the level config) that is either buggy or incomplete, and must read,
  debug, and/or extend it rather than write it from scratch. Difficulty
  scales with the size/subtlety of the required fix:
  - Easy (`level_004`): one required block is missing entirely (a
    `pick_object` step) — participant must locate and add it.
  - Medium (`level_005`): the program's structure is correct but two
    `controls_repeat_ext` blocks have the wrong repeat count — participant
    must find and correct both.
  - Hard (`level_006`): the starter program only implements the first half
    of the task (pickup) — participant must write the second half
    (delivery) themselves, working around a layout obstacle.

### 2.3 Counterbalancing: presentation order

The order in which the six experimental levels are presented is
counterbalanced using a Williams balanced Latin square (`LATIN_SQUARE` in
`GroupConfig.js`), so every level appears at every position across
participants and every level precedes every other level exactly once
(first-order carry-over balanced). The assigned row (0–5) is a nuisance
variable to control for, not a variable of theoretical interest — include it
as a covariate or check for order effects, don't report it as a primary
result.

### 2.4 Tutorial (non-experimental) phase

Before the six experimental levels, all participants complete three
tutorial levels, in this fixed order (`TUTORIAL_PROGRESSION`):

| Level | Purpose |
|---|---|
| `tutorial_A` | Basic movement: pick up and drop a box on a short, unobstructed route. No chatbot, regardless of group. |
| `tutorial_B` | Longer route planning; introduces the `Loops` (repeat) category. No chatbot. |
| `tutorial_D` | Introduces sensing (`Identify Object Ahead`), conditional logic (`If`/`Else`), and the `Print` block, via a "sense an obstacle and decide" exercise combined with a repeat loop. No chatbot. |

Tutorial levels are marked `isExperiment: false` in their level config and
are tagged `levelPhase: 'tutorial'` on every logged event (see §3), so they
can be excluded from primary analyses — they exist to bring every
participant to the same baseline skill level, not to measure it.

## 3. Variables Measured

All interaction data is logged event-by-event to Firestore by
`utils/DataLogger.js`; the authoritative field-by-field mapping (which file
logs what, and where it lands in Firestore) lives in
[`src/README.md`](../src/README.md#data-logging-system) — link that section
in the paper's supplementary materials instead of duplicating the table
here. What follows is the same data reframed as IVs/DVs for analysis.

### 3.1 Independent variables

| Variable | Levels / range | Source |
|---|---|---|
| Experimental Group | control, standard_ai, (human_human) | `participants/{uid}.experimentalGroup` |
| Task Type | development, maintenance | derived from `levelId` (see §2.2 table) |
| Difficulty | easy, medium, hard | derived from `levelId` (see §2.2 table) |
| Presentation order (Latin square row) | 0–5 | recorded at group assignment; not yet logged as its own field — currently must be re-derived from the order `level_start` events appear in for each participant |

### 3.2 Dependent variables (per experimental level, unless noted)

| Variable | Description | Event / field |
|---|---|---|
| Success | Whether the level was completed | `level_complete.success` |
| Time on task | Wall-clock time from level start to completion, ms and seconds | `level_complete.timeSpentMs` / `.timeSpentSeconds` |
| Run count | Number of times the participant clicked "Run Code" before success | `level_complete.runCount`, also incremented per-run in `run_simulation.runNumber` |
| Code snapshot per run | Full Blockly workspace state (block types, fields, disabled state) at each run, enabling post-hoc code-quality / strategy coding | `run_simulation.codeSnapshot` |
| Collisions | Count and type (boundary/conveyor/box/wall/object) of failed movement attempts — a navigation-error proxy | `collision` events (`collisionType`, position, target position) |
| Drop actions | Where objects were dropped and whether it was a valid location (conveyor vs. floor) — a task-completion-quality proxy | `drop_action` events (`onConveyor`, position) |
| Print/terminal usage | Messages printed via the `Print` block during a run — a proxy for self-directed debugging/probing behavior, relevant especially to `tutorial_D` and any experimental levels that enable `print_message` | `print_message` events (`message`, `levelId`) |
| Chat interaction (Standard AI group only) | Message role/content/timestamp, full per-level conversation history, AI context sent, model used | `chat_message`, `ai_interaction_context` events; `participants/{uid}.chatConversations.{levelId}` |
| Survey responses | Post-study self-report (administered via Qualtrics; response ID linked back via `qualtricsResponseId`) | `survey_submission` event; `participants/{uid}.surveys.{surveyId}` |
| Total session metrics | Total time and levels completed across the whole session | `experiment_complete` event; `participants/{uid}.totalTimeMs/.totalTimeSeconds/.totalTimeMinutes` |

### 3.3 Metadata attached to every event

Every logged event automatically carries the participant's group, the
current level, and (as of this revision) an explicit tutorial/experimental
tag, so any of the above can be filtered by phase without a separate
level-ID lookup table:

| Field | Values | Purpose |
|---|---|---|
| `isExperiment` | `true` / `false` | `true` for `level_001`–`level_006`; `false` for `tutorial_A`, `tutorial_B`, `tutorial_D` |
| `levelPhase` | `'experimental'` / `'tutorial'` | Human-readable mirror of `isExperiment`, for quick filtering in the Firestore console or export scripts |

## 4. Materials / Apparatus

- **Visual programming language:** Blockly, with a custom block set
  (`Actions`, `Sensing`, `Logic`, `Math`, `Text`, `Loops`) restricted
  per-level via each level's `allowedBlocks` config
  (`src/game/levels/BLOCKS_CONFIG_GUIDE.md`).
- **Simulation environment:** Phaser 3 isometric warehouse grid
  (`src/game/iso/`), rendering conveyors, pickup/dropoff zones, and
  obstacles (pillars, shelves, oil drums).
- **AI assistant (Standard AI group only):** Context-aware chatbot
  (`src/chatbot/`), backed by a Firebase Cloud Function proxy to an LLM.
- **Data collection:** Firebase Firestore, via the `DataLogger` singleton
  (`src/utils/DataLogger.js`); offline-first with local queueing.

## 5. Procedure

1. Participant reads and accepts the consent form (`index.html`).
2. Random assignment to Control or Standard AI group (or manual
   Human-Human via researcher URL parameter); Latin-square row assigned for
   experimental level order.
3. Tutorial phase: `tutorial_A` → `tutorial_B` → `tutorial_D` (no chatbot).
4. Experimental phase: six levels (`level_001`–`level_006`) in the
   participant's assigned counterbalanced order; chatbot shown or hidden
   per group (and per-level `chatbotEnabled` override, if set).
5. Post-study survey (`survey_final`, redirects to Qualtrics).

## 6. Open items to fill in before submission

- [ ] Sample size, recruitment method (e.g. Prolific), exclusion criteria
- [ ] Explicit hypotheses per DV
- [ ] Planned statistical tests (mixed ANOVA / mixed-effects model given the
      2×3 within-subjects × between-subjects design)
- [ ] Survey instrument details (Qualtrics questions, constructs measured)
- [ ] Results and discussion
- [ ] IRB protocol number / approval details
