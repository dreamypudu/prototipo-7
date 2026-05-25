import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D3_OPENING_1',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue: 'Director/a, hoy no evaluaremos solo resultados. Observaremos como su forma de dirigir cambia la energia, claridad y compromiso del equipo.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Dar sentido al proceso',
        text: 'Explicar que cada decision deberia conectar tareas diarias con un proposito comun.',
        tags: { instrument: 'MLQ-5X', dimension: 'inspirational_motivation', behavior: 'purpose_framing' },
        consequences: {
          dialogueResponse: 'Eso ayudara a que el equipo entienda por que esta semana sera distinta.',
          reputationChange: 2,
          supportChange: 3,
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Mantener control operativo',
        text: 'Indicar que lo importante sera cumplir instrucciones y reportar avances sin desviarse.',
        tags: { instrument: 'MLQ-5X', dimension: 'management_by_exception', behavior: 'control_focus' },
        consequences: {
          dialogueResponse: 'Entendido. Tendremos orden, aunque quizas el equipo espere una orientacion mas movilizadora.',
          reputationChange: 0,
          supportChange: -1,
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D3_OPENING_SEQ',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    initialDialogue: '(Sofia abre la reunion inicial con una carpeta breve de observacion de liderazgo.)',
    nodes: ['MLQ5X_D3_OPENING_1'],
    finalDialogue: 'Queda instalado el foco de observacion. El equipo empezara a reaccionar a su estilo de direccion desde hoy.',
    consumesTime: false,
    triggerMap: { day: 3, slot: 'mañana' },
    isInevitable: true,
  },
];
