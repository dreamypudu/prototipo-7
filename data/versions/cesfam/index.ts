import { scenarios } from './scenarios';
import { CESFAM_STAKEHOLDERS } from './stakeholders';
import { CESFAM_QUESTIONS } from './questions';
import { EMAIL_TEMPLATES } from './emails';
import { CESFAM_DOCUMENTS } from './documents';
import {
  buildInitialGameState,
  CESFAM_ROOMS,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import { CESFAM_CASES } from './cases';
import type { VersionContentPack } from '../types';

export const CESFAM_CONTENT: VersionContentPack = {
  version: 'CESFAM',
  stakeholders: CESFAM_STAKEHOLDERS,
  scenarios,
  questions: CESFAM_QUESTIONS,
  emails: EMAIL_TEMPLATES,
  documents: CESFAM_DOCUMENTS,
  cases: CESFAM_CASES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    roomDefinitions: CESFAM_ROOMS,
    buildInitialGameState,
  },
};
