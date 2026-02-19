import type {
  GlobalObjectiveDefinition,
  NpcObjectiveDefinition,
} from '../../../types';

export const CESFAM_GLOBAL_OBJECTIVES: GlobalObjectiveDefinition[] = [
  {
    objective_id: 'GOAL_GOBERNANZA_MINIMA',
    title: 'Alinear jefaturas clave',
    description: 'Completar reuniones iniciales de Azul, Rojo y Amarillo.',
    revealedBySequenceIds: ['SCHEDULE_WAR_SEQ'],
    success: {
      all: [
        { kind: 'completed_sequence', sequenceId: 'AZUL_MEETING_1' },
        { kind: 'completed_sequence', sequenceId: 'ROJO_MEETING_1' },
        { kind: 'completed_sequence', sequenceId: 'AMARILLO_MEETING_1' },
      ],
    },
    failure: {
      any: [{ kind: 'global_metric', metric: 'day', op: '>', value: 12 }],
    },
    weight: 1,
  },
  {
    objective_id: 'GOAL_SOSTENER_INDICADORES',
    title: 'Sostener reputacion y caja operativa',
    description: 'Evitar colapso de reputacion o presupuesto durante la gestion.',
    revealedBySequenceIds: ['SCHEDULE_WAR_SEQ'],
    success: {
      all: [
        { kind: 'global_metric', metric: 'reputation', op: '>=', value: 55 },
        { kind: 'global_metric', metric: 'budget', op: '>=', value: 200000 },
      ],
    },
    failure: {
      any: [
        { kind: 'global_metric', metric: 'reputation', op: '<=', value: 30 },
        { kind: 'global_metric', metric: 'budget', op: '<=', value: 0 },
      ],
    },
    weight: 2,
  },
];

export const CESFAM_NPC_OBJECTIVES: NpcObjectiveDefinition[] = [
  {
    objective_id: 'NPC_OBJ_MARCELA_CONFIANZA',
    stakeholderId: 'marcela-soto',
    title: 'Recuperar confianza de Marcela Soto',
    description: 'Elevar su confianza para reducir riesgo de escalamiento normativo.',
    revealedBySequenceIds: ['ROJO_MEETING_1'],
    success: {
      all: [{ kind: 'stakeholder_metric', stakeholderId: 'marcela-soto', metric: 'trust', op: '>=', value: 60 }],
    },
    failure: {
      any: [{ kind: 'stakeholder_metric', stakeholderId: 'marcela-soto', metric: 'trust', op: '<=', value: 35 }],
    },
    weight: 1,
  },
  {
    objective_id: 'NPC_OBJ_RIOS_COORDINACION',
    stakeholderId: 'daniel-rios',
    title: 'Asegurar coordinacion con Daniel Rios',
    description: 'Mantener apoyo operativo del sector territorial.',
    revealedBySequenceIds: ['AMARILLO_MEETING_1'],
    success: {
      all: [{ kind: 'stakeholder_metric', stakeholderId: 'daniel-rios', metric: 'support', op: '>=', value: 65 }],
    },
    failure: {
      any: [{ kind: 'stakeholder_metric', stakeholderId: 'daniel-rios', metric: 'support', op: '<=', value: 35 }],
    },
    weight: 1,
  },
];

export const CESFAM_OBJECTIVES = {
  global: CESFAM_GLOBAL_OBJECTIVES,
  npc: CESFAM_NPC_OBJECTIVES,
};
