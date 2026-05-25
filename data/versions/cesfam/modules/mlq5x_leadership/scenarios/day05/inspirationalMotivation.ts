import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D5_MOTIVATION_1',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    dialogue: 'El equipo de terreno esta cansado. Si solo hablamos de metas, se desconectan. Necesitan entender que esto vale la pena.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Conectar con proposito',
        text: 'Vincular la planificacion con impacto directo en usuarios y comunidad.',
        tags: { instrument: 'MLQ-5X', dimension: 'inspirational_motivation', behavior: 'shared_purpose' },
        consequences: {
          dialogueResponse: 'Eso puede levantar energia. El equipo necesita ver que su trabajo tiene sentido.',
          trustChange: 3,
          supportChange: 4,
          reputationChange: 2,
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Exigir cumplimiento',
        text: 'Recordar que el deber profesional exige cumplir aunque no haya motivacion.',
        tags: { instrument: 'MLQ-5X', dimension: 'transactional_leadership', behavior: 'compliance_emphasis' },
        consequences: {
          dialogueResponse: 'Cumpliran, pero no necesariamente se comprometeran con la direccion.',
          trustChange: -1,
          supportChange: -2,
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D5_MOTIVATION_SEQ',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    initialDialogue: '(Daniel llega con preocupacion por el animo del equipo territorial.)',
    nodes: ['MLQ5X_D5_MOTIVATION_1'],
    finalDialogue: 'La respuesta del equipo dependera de si perciben una meta comun o solo una orden mas.',
    consumesTime: false,
    triggerMap: { day: 5, slot: 'mañana' },
  },
];
