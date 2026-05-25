import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D4_IDEALIZED_1',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    dialogue: 'Necesito saber si sus criterios se mantendran cuando el acuerdo sea incomodo. El equipo mira lo que usted sostiene, no solo lo que declara.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Actuar con coherencia',
        text: 'Mantener el criterio acordado y explicar publicamente la razon.',
        tags: { instrument: 'MLQ-5X', dimension: 'idealized_influence', behavior: 'values_consistency' },
        consequences: {
          dialogueResponse: 'Eso da una senal clara. Puede que incomode, pero muestra consistencia.',
          trustChange: 4,
          supportChange: 2,
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Evitar tension',
        text: 'Ajustar el criterio en privado para no abrir conflicto.',
        tags: { instrument: 'MLQ-5X', dimension: 'laissez_faire', behavior: 'conflict_avoidance' },
        consequences: {
          dialogueResponse: 'Eso reduce ruido inmediato, pero deja dudas sobre que principios guian la direccion.',
          trustChange: -3,
          supportChange: -2,
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D4_IDEALIZED_SEQ',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    initialDialogue: '(Marcela pide una definicion sobre coherencia y criterios directivos.)',
    nodes: ['MLQ5X_D4_IDEALIZED_1'],
    finalDialogue: 'El equipo observara si esta definicion se mantiene durante la semana.',
    consumesTime: false,
    triggerMap: { day: 4, slot: 'mañana' },
  },
];
