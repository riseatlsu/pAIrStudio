import { TutorialA } from './data/tutorial_A';
import { TutorialB } from './data/tutorial_B';
import { Level1 } from './data/level_001';
import { Level2 } from './data/level_002';
import { Level3 } from './data/level_003';
import { Level4 } from './data/level_004';
import { Level5 } from './data/level_005';
import { Level6 } from './data/level_006';
import SurveyFinal from './data/survey_final';

export const LEVELS = {
    [TutorialA.id]: TutorialA,
    [TutorialB.id]: TutorialB,
    [Level1.id]: Level1,
    [Level2.id]: Level2,
    [Level3.id]: Level3,
    [Level4.id]: Level4,
    [Level5.id]: Level5,
    [Level6.id]: Level6,
    [SurveyFinal.id]: SurveyFinal
};

export function getLevel(id) {
    return LEVELS[id];
}
