import { scenarios } from './scenarios';
import { MUNICIPAL_STAKEHOLDERS } from './stakeholders';
import { MUNICIPAL_QUESTIONS } from './questions';
import { MUNICIPAL_EMAIL_TEMPLATES } from './emails';
import {
  buildInitialGameState,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import {
  MUNICIPAL_GLOBAL_OBJECTIVES,
  MUNICIPAL_NPC_OBJECTIVES,
} from './objectives';
import type { VersionContentPack } from '../types';

export const MUNICIPAL_CONTENT: VersionContentPack = {
  version: 'MUNICIPAL',
  stakeholders: MUNICIPAL_STAKEHOLDERS,
  scenarios,
  questions: MUNICIPAL_QUESTIONS,
  emails: MUNICIPAL_EMAIL_TEMPLATES,
  globalObjectives: MUNICIPAL_GLOBAL_OBJECTIVES,
  npcObjectives: MUNICIPAL_NPC_OBJECTIVES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    buildInitialGameState,
  },
};
