import type { VersionContentPack } from '../../../types';
import { scenarios } from './scenarios';
import { CESFAM_STAKEHOLDERS } from '../ethics/stakeholders';
import { CESFAM_QUESTIONS } from '../ethics/questions';
import { EMAIL_TEMPLATES } from '../ethics/emails';
import { CESFAM_DOCUMENTS } from '../ethics/documents';
import {
  buildInitialGameState,
  CESFAM_ROOMS,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from '../ethics/defaults';

export const CESFAM_TUTORIAL_CONTENT: VersionContentPack = {
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
