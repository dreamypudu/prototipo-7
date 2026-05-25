import type { MeetingSequence, ScenarioNode, ScenarioOption } from '../../../../../../../types';
import { mlqTags } from '../tags';

const nextOption = (): ScenarioOption => ({
  option_id: 'NEXT',
  cardTitle: 'Siguiente',
  cardEmoji: '➡️',
  text: 'Continuar',
  tags: mlqTags(),
  consequences: {},
});

const sectorHeads = ['andres-guzman', 'marcela-soto', 'daniel-rios'];

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D2S10_FORMAL_MEETING_CONTEXT',
    participantIds: sectorHeads,
    dialogue:
      '(En la tarde es la primera reunion formal de jefes de sector. Guzman llega cinco minutos tarde. Soto se percata. El ambiente se tensa.)',
    dialogueIsNarration: true,
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D2S10_N13_LATE_ARRIVAL_RESPONSE',
    participantIds: sectorHeads,
    dialogue: '(Todos te miran para que digas algo.)',
    dialogueIsNarration: true,
    options: [
      {
        option_id: 'A',
        cardTitle: 'Abrir espacio',
        cardEmoji: '🤝',
        text: 'Me gustaria darles la oportunidad de hablar: alguna necesidad o inconveniente que hayan tenido hasta ahora.',
        tags: mlqTags({ "MI": 2, "CI": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Yo quiero mencionar algo.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Reconocer labor',
        cardEmoji: '📊',
        text: 'Este dia ha sido complicado, sin embargo quiero felicitarlos por la buena labor realizada hasta ahora.',
        tags: mlqTags({ "CI": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Yo quiero mencionar algo.',
            },
          ],
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
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Entiendo, director. Venia saliendo de una atención que se extendió mas de lo esperado, el Director anterior lo entendía.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Yo quiero mencionar algo.',
            },
          ],
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
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Eso es lo que necesitaba escuchar. Si hay una respuesta concreta, puedo sostener al equipo un poco mas.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Tambien quiero decir otra cosa.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Anotar para viernes',
        cardEmoji: '📋',
        text: 'Lo tendre en cuenta para la propuesta de horario del viernes.',
        tags: mlqTags({ "DPE-P": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Tomarlo en cuenta no alcanza mucho cuando la gente ya viene doblando turnos.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Tambien quiero decir otra cosa.',
            },
          ],
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
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Si todo queda esperando presupuesto, el equipo va a seguir pagando el costo en la sala de espera.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Tambien quiero decir otra cosa.',
            },
          ],
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
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Eso ayudaria. Necesito que el equipo vea que la direccion entendio que esto no es sostenible.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Comprendido, jefe.',
            },
          ],
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
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Puedo levantar una propuesta, pero si esto queda solo en mis manos no cambia la sobrecarga de fondo.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Comprendido, jefe.',
            },
          ],
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
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Con esa respuesta es dificil pedirle al equipo que espere algo distinto de esta direccion.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Comprendido, jefe.',
            },
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D2_SEQUENCE_10',
    initialDialogue: '(Comienza la primera reunion formal de jefes de sector del jueves.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D2S10_FORMAL_MEETING_CONTEXT',
      'MLQ5X_D2S10_N13_LATE_ARRIVAL_RESPONSE',
      'MLQ5X_D2S10_N14_RIOS_EXTENDED_SHIFTS',
      'MLQ5X_D2S10_N15_RIOS_RESIGNATION_RISK',
    ],
    finalDialogue:
      'La reunion deja sobre la mesa la tension por atrasos, turnos extendidos y riesgo de renuncias en el Sector Amarillo.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 4, slot: 'tarde' },
    isInevitable: true,
  },
];
