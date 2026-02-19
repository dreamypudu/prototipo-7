import { scenarios } from './scenarios';
import { LEYKARIN_STAKEHOLDERS } from './stakeholders';
import { LEYKARIN_QUESTIONS } from './questions';
import { LEYKARIN_EMAIL_TEMPLATES } from './emails';
import {
  buildInitialGameState,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import {
  LEYKARIN_GLOBAL_OBJECTIVES,
  LEYKARIN_NPC_OBJECTIVES,
} from './objectives';
import type { VersionContentPack } from '../types';

export const LEYKARIN_CONTENT: VersionContentPack = {
  version: 'LEY_KARIN',
  stakeholders: LEYKARIN_STAKEHOLDERS,
  scenarios,
  questions: LEYKARIN_QUESTIONS,
  emails: LEYKARIN_EMAIL_TEMPLATES,
  globalObjectives: LEYKARIN_GLOBAL_OBJECTIVES,
  npcObjectives: LEYKARIN_NPC_OBJECTIVES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    buildInitialGameState,
  },
};
