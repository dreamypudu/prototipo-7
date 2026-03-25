import { scenarios } from './scenarios';
import { MUNICIPAL_STAKEHOLDERS } from './stakeholders';
import { MUNICIPAL_QUESTIONS } from './questions';
import { MUNICIPAL_EMAIL_TEMPLATES } from './emails';
import { MUNICIPAL_DOCUMENTS } from './documents';
import {
  buildInitialGameState,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';
import { MUNICIPAL_CASES } from './cases';
import type { VersionContentPack } from '../types';

export const MUNICIPAL_CONTENT: VersionContentPack = {
  version: 'MUNICIPAL',
  stakeholders: MUNICIPAL_STAKEHOLDERS,
  scenarios,
  questions: MUNICIPAL_QUESTIONS,
  emails: MUNICIPAL_EMAIL_TEMPLATES,
  documents: MUNICIPAL_DOCUMENTS,
  cases: MUNICIPAL_CASES,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    buildInitialGameState,
  },
};
