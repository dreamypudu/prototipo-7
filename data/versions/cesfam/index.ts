import { scenarios } from './scenarios';
import { CESFAM_STAKEHOLDERS } from './stakeholders';
import { CESFAM_QUESTIONS } from './questions';
import { EMAIL_TEMPLATES } from './emails';
import {
  buildInitialGameState,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import {
  CESFAM_GLOBAL_OBJECTIVES,
  CESFAM_NPC_OBJECTIVES,
} from './objectives';
import type { VersionContentPack } from '../types';

export const CESFAM_CONTENT: VersionContentPack = {
  version: 'CESFAM',
  stakeholders: CESFAM_STAKEHOLDERS,
  scenarios,
  questions: CESFAM_QUESTIONS,
  emails: EMAIL_TEMPLATES,
  globalObjectives: CESFAM_GLOBAL_OBJECTIVES,
  npcObjectives: CESFAM_NPC_OBJECTIVES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    buildInitialGameState,
  },
};
