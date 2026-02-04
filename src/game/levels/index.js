// Import tutorial levels (non-experimental)
import { TutorialA } from './data/tutorial_A';
import { TutorialB } from './data/tutorial_B';
import { TutorialC } from './data/tutorial_C';

// Import experimental levels (numbered)
import { Level1 } from './data/level_001';
import { Level2 } from './data/level_002';
import { Level3 } from './data/level_003';
import { Level4 } from './data/level_004';
import { Level5 } from './data/level_005';

// Import survey levels
import SurveyFinal from './data/survey_final';

// Register all levels
export const LEVELS = {
    // Tutorial levels (lettered IDs, isExperiment: false, chatbotEnabled varies)
    [TutorialA.id]: TutorialA,
    [TutorialB.id]: TutorialB,
    [TutorialC.id]: TutorialC,
    
    // Experimental levels (numbered IDs, isExperiment: true by default)
    [Level1.id]: Level1,
    [Level2.id]: Level2,
    [Level3.id]: Level3,
    [Level4.id]: Level4,
    [Level5.id]: Level5,
    
    // Survey levels (special level type)
    [SurveyFinal.id]: SurveyFinal
};

export function getLevel(id) {
    return LEVELS[id];
}
