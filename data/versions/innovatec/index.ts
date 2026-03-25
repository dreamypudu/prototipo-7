import { scenarios } from './scenarios';
import { INNOVATEC_STAKEHOLDERS } from './stakeholders';
import { INNOVATEC_QUESTIONS } from './questions';
import { EMAIL_TEMPLATES } from './emails';
import { INNOVATEC_DOCUMENTS } from './documents';
import {
  buildInitialGameState,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import { INNOVATEC_CASES } from './cases';
import type { VersionContentPack } from '../types';

export const INNOVATEC_CONTENT: VersionContentPack = {
  version: 'INNOVATEC',
  stakeholders: INNOVATEC_STAKEHOLDERS,
  scenarios,
  questions: INNOVATEC_QUESTIONS,
  emails: EMAIL_TEMPLATES,
  documents: INNOVATEC_DOCUMENTS,
  cases: INNOVATEC_CASES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    buildInitialGameState,
  },
};
