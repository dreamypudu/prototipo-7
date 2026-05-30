import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D1S5_N10_SOTO_PROTOCOLS',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    dialogue:
      'Gracias por venir, director. Quiero recalcar la importancia de cumplir los protocolos del CESFAM, ya que principalmente Ríos en su sector no lo ha estado haciendo últimamente. El director anterior nunca tomó cartas en el asunto, por lo que el Sector Amarillo ya se acostumbró a saltarse procesos. ¿Cómo planea enfrentarse a eso?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'No corregir ahora',
        cardEmoji: '⏳',
        text:
          'No puedo cambiarlo de un día para otro. Lo del Sector Amarillo viene de mucho antes que yo asumiera, por lo que no lo puedo corregir ahora.',
        tags: mlqTags(),
        consequences: {
          trustChange: -5,
          supportChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Eso es justamente lo que me preocupa: que la antigüedad del problema termine siendo una excusa para no corregirlo.',
            },
            {stakeholder_id: 'marcela-soto',
              text: 'Está bien, director.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Cortar incumplimiento',
        cardEmoji: '📋',
        text: 'Quiero terminar ese problema de raiz; el Sector Amarillo no puede seguir actuando de esa manera.',
        tags: mlqTags(),
        consequences: {
          trustChange: 5,
          supportChange: 10,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Bien. Si dirección marca ese limite, el resto del CESFAM va a entender que las reglas son comunes.',
            },
            {stakeholder_id: 'marcela-soto',
              text: 'Está bien, director.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Prometer gestión gradual',
        cardEmoji: '⚖️',
        text: 'Intentaré solucionarlo por el bien del CESFAM, pero no le prometo cambios inmediatos.',
        tags: mlqTags(),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Aprecio que lo intente, pero necesito ver plazos y decisiones, no solo buena voluntad.',
            },
            {stakeholder_id: 'marcela-soto',
              text: 'Está bien, director.',
            }
          ]},
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D1_SEQUENCE_5',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    initialDialogue: '(Llegas a la oficina del Sector Rojo para escuchar la preocupacion formal de Marcela Soto.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D1S5_N10_SOTO_PROTOCOLS'],
    finalDialogue: 'Soto deja instalada su expectativa: la dirección debe ordenar el cumplimiento de protocolos entre sectores.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 3, slot: 'tarde' },
  },
];
