import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D1S5_N10_SOTO_PROTOCOLS',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    dialogue:
      'Gracias por venir, director. Quiero recalcar la importancia de cumplir los protocolos del CESFAM, ya que principalmente Rios en su sector no lo ha estado haciendo ultimamente. El director anterior nunca tomo cartas en el asunto, por lo que el Sector Amarillo ya se acostumbro a saltarse procesos. Como planea enfrentarse a eso?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'No corregir ahora',
        cardEmoji: '⏳',
        text:
          'No puedo cambiarlo de un dia para otro. Lo del Sector Amarillo viene de mucho antes que yo asumiera, por lo que no lo puedo corregir ahora.',
        tags: mlqTags(),
        consequences: {
          trustChange: -5,
          supportChange: -5,
          dialogueResponse: 'Esta bien, director.',
        },
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
          dialogueResponse: 'Esta bien, director.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Prometer gestion gradual',
        cardEmoji: '⚖️',
        text: 'Intentare solucionarlo por el bien del CESFAM, pero no le prometo cambios inmediatos.',
        tags: mlqTags(),
        consequences: {
          dialogueResponse: 'Esta bien, director.',
        },
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
    nodes: ['MLQ5X_D1S5_N10_SOTO_PROTOCOLS'],
    finalDialogue: 'Soto deja instalada su expectativa: la direccion debe ordenar el cumplimiento de protocolos entre sectores.',
    consumesTime: false,
    triggerMap: { day: 3, slot: 'tarde' },
  },
];
