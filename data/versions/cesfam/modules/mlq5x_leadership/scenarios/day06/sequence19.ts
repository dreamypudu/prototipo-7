import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D4S19_N24_GUZMAN_BOX1_BROKEN_PROMISE',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      'Director, buenos días. Estoy aquí por un motivo, y es que usted me aseguro que el Box 1 del martes en el bloque AM quedaría para la supervisión con los internos, por lo que confirme los horarios con la universidad y reorganice mis consultas de esa mañana. Hoy el Box 1 aparece asignado a Soto sin que nadie me avisará ni me explicara el cambio antes de que el documento quedara firmado. Claramente exijo una explicación, no puede modificar la asignación de boxes tan deliberadamente siendo que algunos ya tenemos todo organizado. ¿Qué le digo ahora a la universidad?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Asumir responsabilidad',
        cardEmoji: '🤝',
        text:
          'Tienes toda la razón en estar molesto y asumo la responsabilidad por este error en la comunicación. Nuestro objetivo es que tanto la docencia como la atención clínica funcionen con excelencia. Suspende la docencia esta semana y desde la próxima tienes vía libre.',
        tags: mlqTags(),
        consequences: {
          trustChange: -5,
          supportChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'No es la situación ideal, director. Esto deja muy mal parado al CESFAM frente a la universidad.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Postergar revisión',
        cardEmoji: '⏳',
        text:
          'Dejame el tema sobre la mesa y cuando tenga menos carga veré que puedo hacer con esos horarios. Por ahora, vas a tener que arreglartelas con los boxes que queden libres.',
        tags: mlqTags(),
        consequences: {
          trustChange: -15,
          supportChange: -15,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'No es la situación ideal, director. Esto deja muy mal parado al CESFAM frente a la universidad.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Justificar auditoría',
        cardEmoji: '📋',
        text:
          'La reasignación se hizo porque la auditoría interna del Sector Rojo es crítica para sus estandares y el protocolo exige priorizar dichas auditorias sobre lo docente. Si el martes logras acomodar a los internos, me comprometo a que el Box 1 quede para ti.',
        tags: mlqTags(),
        consequences: {
          trustChange: -10,
          supportChange: -10,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'No es la situación ideal, director. Esto deja muy mal parado al CESFAM frente a la universidad.',
            },
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D4_SEQUENCE_19',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    initialDialogue: '(Aparece Andrés Guzmán visiblemente molesto.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D4S19_N24_GUZMAN_BOX1_BROKEN_PROMISE'],
    finalDialogue: 'Guzmán sale de la oficina con la molestia todavia visible.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 6, slot: 'mañana' },
    isContingent: true,
    contingentConditions: {
      all: [
        {
          kind: 'promise_outcome',
          sourceNodeId: 'MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
          ruleId: 'reserve_room_for_sector_rule_v1',
          stakeholderId: 'andres-guzman',
          outcomeIn: [false],
        },
      ],
    },
  },
];
