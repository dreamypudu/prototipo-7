import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D6_STIMULATION_1',
    stakeholderId: 'francisca-solis',
    stakeholderRole: 'Enfermera Sector Amarillo',
    dialogue: 'Tenemos una forma distinta de resolver la saturacion, pero no es la practica habitual. Si la direccion no abre espacio, nadie se atrevera a probarla.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Estimular solucion nueva',
        text: 'Pedir un piloto acotado, criterios de aprendizaje y revision al cierre del bloque.',
        tags: { instrument: 'MLQ-5X', dimension: 'intellectual_stimulation', behavior: 'safe_experimentation' },
        consequences: {
          dialogueResponse: 'Eso abre espacio para pensar distinto sin perder control operativo.',
          trustChange: 3,
          supportChange: 3,
          reputationChange: 1,
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Rechazar variacion',
        text: 'Indicar que el equipo debe seguir el procedimiento habitual hasta nuevo aviso.',
        tags: { instrument: 'MLQ-5X', dimension: 'management_by_exception', behavior: 'procedure_fixation' },
        consequences: {
          dialogueResponse: 'El procedimiento queda protegido, pero el equipo recibe la senal de no innovar.',
          trustChange: -2,
          supportChange: -3,
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D6_STIMULATION_SEQ',
    stakeholderId: 'francisca-solis',
    stakeholderRole: 'Enfermera Sector Amarillo',
    initialDialogue: '(Francisca trae una propuesta no convencional para enfrentar saturacion.)',
    nodes: ['MLQ5X_D6_STIMULATION_1'],
    finalDialogue: 'La decision queda como senal de cuanta iniciativa tolera realmente la direccion.',
    consumesTime: false,
    triggerMap: { day: 6, slot: 'mañana' },
  },
];
