import { scenarios } from './scenarios';
import { INNOVATEC_STAKEHOLDERS } from './stakeholders';
import { INNOVATEC_QUESTIONS } from './questions';
import { EMAIL_TEMPLATES } from './emails';
import {
  buildInitialGameState,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import {
  INNOVATEC_GLOBAL_OBJECTIVES,
  INNOVATEC_NPC_OBJECTIVES,
} from './objectives';
import type { VersionContentPack } from '../types';

export const INNOVATEC_CONTENT: VersionContentPack = {
  version: 'INNOVATEC',
  stakeholders: INNOVATEC_STAKEHOLDERS,
  scenarios,
  questions: INNOVATEC_QUESTIONS,
  emails: EMAIL_TEMPLATES,
  globalObjectives: INNOVATEC_GLOBAL_OBJECTIVES,
  npcObjectives: INNOVATEC_NPC_OBJECTIVES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    buildInitialGameState,
  },
};
