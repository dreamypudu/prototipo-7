import type { VersionContentPack } from '../../../types';
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

export const CESFAM_ETHICS_CONTENT: VersionContentPack = {
  version: 'CESFAM',
  stakeholders: CESFAM_STAKEHOLDERS,
  scenarios,
  questions: CESFAM_QUESTIONS,
  emails: EMAIL_TEMPLATES,
  documents: CESFAM_DOCUMENTS,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    roomDefinitions: CESFAM_ROOMS,
    buildInitialGameState,
  },
};
