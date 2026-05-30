import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D4S20_N25_RIOS_FLEXIBILITY_REQUEST',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    dialogue:
      'Gracias por venir, director. Tengo una solicitud en particular. Necesito que me de flexibilidad en las mananas. Si me la da, yo le garantizo que el equipo del Amarillo cubre los turnos de noche. Lo pongo por escrito si quiere.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Condicionar a indicadores',
        cardEmoji: '📊',
        text:
          'Aceptare tu peticion condicionado al cumplimiento de indicadores del Sector Amarillo.',
        tags: mlqTags({ RC: 4, CI: 2 }),
        consequences: {
          trustChange: 5,
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'No hay problema jefe, gracias.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Revisar operativamente',
        cardEmoji: '🗂️',
        text:
          'Lo consideraré pero necesito verlo operativamente antes de comprometerme. Ademas, el Sector Amarillo tiene problemas con las cargas horarias, por lo que su jefe no debería estar ausente.',
        tags: mlqTags({ 'DPE-P': 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'No hay problema jefe, gracias.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Rechazar flexibilidad',
        cardEmoji: '⚖️',
        text:
          'Lamentablemente la flexibilidad de horarios no esta contemplada en el reglamento. No puedo brindarte esa solicitud.',
        tags: mlqTags({ 'DPE-A': 2 }),
        consequences: {
          trustChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'No hay problema jefe, gracias.',
            },
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D4_SEQUENCE_20',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    initialDialogue: '(Llegas al Sector Amarillo para conversar con Daniel Ríos durante el lunes.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D4S20_N25_RIOS_FLEXIBILITY_REQUEST'],
    finalDialogue: 'Ríos queda esperando que la dirección considere su solicitud de flexibilidad.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 6, slot: 'mañana' },
  },
];
