import type { MeetingSequence, ScenarioNode, ScenarioOption } from '../../../../../../../types';
import { mlqTags } from '../tags';

const nextOption = (dialogueResponse = ''): ScenarioOption => ({
  option_id: 'NEXT',
  cardTitle: 'Siguiente',
  cardEmoji: '➡️',
  text: 'Continuar',
  tags: mlqTags(),
  consequences: { dialogueResponse },
});

const sectorHeads = ['andres-guzman', 'marcela-soto', 'daniel-rios'];

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D2S10_FORMAL_MEETING_CONTEXT',
    participantIds: sectorHeads,
    dialogue:
      '(En la tarde es la primera reunion formal de jefes de sector. Guzman llega cinco minutos tarde. Soto se percata. El ambiente se tensa.)',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D2S10_N13_LATE_ARRIVAL_RESPONSE',
    participantIds: sectorHeads,
    dialogue: '(Todos te miran para que digas algo.)',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Abrir espacio',
        cardEmoji: '🤝',
        text: 'Me gustaria darles la oportunidad de hablar: alguna necesidad o inconveniente que hayan tenido hasta ahora.',
        tags: mlqTags({ "MI": 2, "CI": 2 }),
        consequences: {
          dialogueResponse: 'Yo quiero mencionar algo.',
          response_stakeholder_id: 'daniel-rios',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Reconocer labor',
        cardEmoji: '📊',
        text: 'Este dia ha sido complicado, sin embargo quiero felicitarlos por la buena labor realizada hasta ahora.',
        tags: mlqTags({ "CI": 2 }),
        consequences: {
          dialogueResponse: 'Yo quiero mencionar algo.',
          response_stakeholder_id: 'daniel-rios',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Corregir atraso',
        cardEmoji: '📋',
        text: 'Guzman, es importante que llegues a la hora para las proximas reuniones; tiempo no nos sobra.',
        tags: mlqTags({ "DPE-A": 2 }),
        consequences: {
          stakeholder_effects: {
            'andres-guzman': { supportChange: -10 },
          },
          reactions: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Entiendo, director. Venia saliendo de una atencion que se extendio mas de lo esperado, pero tomare el punto.',
            },
          ],
          dialogueResponse: 'Yo quiero mencionar algo.',
          response_stakeholder_id: 'daniel-rios',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D2S10_N14_RIOS_EXTENDED_SHIFTS',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: sectorHeads,
    dialogue:
      'En el Sector Amarillo llevamos mucho tiempo haciendo varios turnos encadenados, porque no hay mas personal. Esto sin descanso compensatorio. No aguantaremos mucho tiempo mas asi.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Reconocer urgencia',
        cardEmoji: '🩺',
        text:
          'Reconozco la urgencia, eso impacta en la calidad de atencion. Me comprometo a dar una respuesta concreta lo antes posible.',
        tags: mlqTags({ "CI": 4, "MI": 2 }),
        consequences: {
          supportChange: 5,
          dialogueResponse: 'Tambien quiero decir otra cosa.',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Anotar para viernes',
        cardEmoji: '📋',
        text: 'Lo tendre en cuenta para la propuesta de horario del viernes.',
        tags: mlqTags({ "DPE-P": 2 }),
        consequences: {
          dialogueResponse: 'Tambien quiero decir otra cosa.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Derivar a presupuesto',
        cardEmoji: '⏳',
        text: 'Eso depende del presupuesto disponible, no puedo verlo sin el visto del area correspondiente.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          supportChange: -5,
          dialogueResponse: 'Tambien quiero decir otra cosa.',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D2S10_N15_RIOS_RESIGNATION_RISK',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: sectorHeads,
    dialogue:
      'He escuchado que companeros tienen intenciones de renunciar si el tema de los turnos no cambia. No es amenaza, tal como dije; solo es lo que he escuchado.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Revisar turnos',
        cardEmoji: '🎯',
        text:
          'Comprendo que sea una situacion no sostenible. Vere si puedo revisar los turnos para la proxima semana, independiente del presupuesto.',
        tags: mlqTags({ "CI": 2 }),
        consequences: {
          dialogueResponse: 'Comprendido, jefe.',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Pedir propuesta',
        cardEmoji: '📋',
        text:
          'Como jefe del Sector Amarillo, gestiona los horarios correspondientes. Podemos revisarlos en conjunto si tienes una propuesta.',
        tags: mlqTags({ "LF": 4 }),
        consequences: {
          trustChange: -5,
          dialogueResponse: 'Comprendido, jefe.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Externalizar renuncias',
        cardEmoji: '⏳',
        text:
          'Las renuncias son una decision personal de cada funcionario. Contra eso no puedo hacer mucho, sobre todo si tener mas personal no depende de mi.',
        tags: mlqTags({ "LF": 4 }),
        consequences: {
          trustChange: -10,
          dialogueResponse: 'Comprendido, jefe.',
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D2_SEQUENCE_10',
    initialDialogue: '(Comienza la primera reunion formal de jefes de sector del jueves.)',
    nodes: [
      'MLQ5X_D2S10_FORMAL_MEETING_CONTEXT',
      'MLQ5X_D2S10_N13_LATE_ARRIVAL_RESPONSE',
      'MLQ5X_D2S10_N14_RIOS_EXTENDED_SHIFTS',
      'MLQ5X_D2S10_N15_RIOS_RESIGNATION_RISK',
    ],
    finalDialogue:
      'La reunion deja sobre la mesa la tension por atrasos, turnos extendidos y riesgo de renuncias en el Sector Amarillo.',
    consumesTime: false,
    triggerMap: { day: 4, slot: 'tarde' },
    isInevitable: true,
  },
];
