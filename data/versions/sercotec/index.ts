import { scenarios } from './scenarios';
import { SERCOTEC_STAKEHOLDERS } from './stakeholders';
import { SERCOTEC_QUESTIONS } from './questions';
import { SERCOTEC_EMAIL_TEMPLATES } from './emails';
import {
  buildInitialGameState,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import {
  SERCOTEC_GLOBAL_OBJECTIVES,
  SERCOTEC_NPC_OBJECTIVES,
} from './objectives';
import type { VersionContentPack } from '../types';

export const SERCOTEC_CONTENT: VersionContentPack = {
  version: 'SERCOTEC',
  stakeholders: SERCOTEC_STAKEHOLDERS,
  scenarios,
  questions: SERCOTEC_QUESTIONS,
  emails: SERCOTEC_EMAIL_TEMPLATES,
  globalObjectives: SERCOTEC_GLOBAL_OBJECTIVES,
  npcObjectives: SERCOTEC_NPC_OBJECTIVES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    buildInitialGameState,
  },
};
