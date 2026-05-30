import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D5S21_N26_SOFIA_MINOR_RECORD_ERROR',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'El viernes hubo un pequeno error en el registro de un procedimiento del Sector Amarillo. Es menor, pero existe.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Avisar a Ríos',
        cardEmoji: '📞',
        text:
          'Le avisaré directamente a Ríos para que lo corrija. Al ser menor, debería tomarle muy poco tiempo.',
        tags: mlqTags({ 'DPE-A': 4 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Como diga, director.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Delegar aviso',
        cardEmoji: '📝',
        text: 'Sofía, avisale a Ríos para que lo corrija.',
        tags: mlqTags({ 'DPE-A': 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Como diga, director.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'No actuar',
        cardEmoji: '⏳',
        text: 'Está bien, es menor así que no pasa nada.',
        tags: mlqTags({ LF: 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Como diga, director.',
            },
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D5_SEQUENCE_21',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    initialDialogue: '(Sofía Castro detecta un error menor en el registro de un procedimiento del Sector Amarillo.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D5S21_N26_SOFIA_MINOR_RECORD_ERROR'],
    finalDialogue: 'Sofía toma nota de la instruccion y vuelve a revisar los registros pendientes.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 6, slot: 'mañana' },
    isInevitable: true,
  },
];
