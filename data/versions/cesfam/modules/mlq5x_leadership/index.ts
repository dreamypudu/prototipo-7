import type { VersionContentPack } from '../../../types';
import { scenarios } from './scenarios';
import { CESFAM_MLQ5X_STAKEHOLDERS } from './stakeholders';
import { CESFAM_MLQ5X_QUESTIONS } from './questions';
import { CESFAM_MLQ5X_EMAILS } from './emails';
import { CESFAM_MLQ5X_DOCUMENTS } from './documents';
import {
  buildInitialGameState,
  CESFAM_ROOMS,
  DIRECTOR_OBJECTIVES,
  SECRETARY_ROLE,
  TIME_SLOTS,
} from './defaults';

export const CESFAM_MLQ5X_CONTENT: VersionContentPack = {
  version: 'CESFAM',
  stakeholders: CESFAM_MLQ5X_STAKEHOLDERS,
  scenarios,
  questions: CESFAM_MLQ5X_QUESTIONS,
  emails: CESFAM_MLQ5X_EMAILS,
  documents: CESFAM_MLQ5X_DOCUMENTS,
  defaults: {
    timeSlots: TIME_SLOTS,
    secretaryRole: SECRETARY_ROLE,
    directorObjectives: DIRECTOR_OBJECTIVES,
    roomDefinitions: CESFAM_ROOMS,
    buildInitialGameState,
  },
  narrativeClosure: {
    message:
      'La simulacion termino.\n\nHas completado todas las situaciones de este modulo.\n\nGracias por participar.',
  },
  hiddenMechanicTabs: ['documents'],
};
