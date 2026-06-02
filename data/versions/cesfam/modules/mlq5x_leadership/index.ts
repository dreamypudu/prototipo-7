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
  delegationTasks: {
    'task:protocolo_urgencias': {
      monologue:
        'Entendido, director. Yo coordino con enfermería la redacción del protocolo de actuación para urgencias sin médico presente y le dejo un borrador formal para su revisión. Me pongo en ello de inmediato.',
      confirmationEmailEventId: 'delegation-confirm-protocolo-urgencias',
    },
    'task:gestion_docencia': {
      monologue:
        'Muy bien, director. Me encargo de la gestión de la labor docente: contacto a la coordinadora de la universidad y reúno los antecedentes de los cupos. Le informo apenas tenga respuesta.',
      confirmationEmailEventId: 'delegation-confirm-gestion-docencia',
    },
    'task:formalizar_internos': {
      monologue:
        'Perfecto, director. Inicio el trámite para formalizar a los internos no registrados: reúno la documentación y la elevo para regularizar su situación. Le aviso cuando quede ingresado.',
      confirmationEmailEventId: 'delegation-confirm-formalizar-internos',
    },
    'task:protocolo_tens': {
      monologue:
        'Entendido, director. Tramito el protocolo TENS-sin-médico que dejó el Sr. Ríos: lo ordeno y lo derivo según corresponda. Le confirmaré el avance.',
      confirmationEmailEventId: 'delegation-confirm-protocolo-tens',
    },
  },
};
