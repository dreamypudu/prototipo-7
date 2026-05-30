import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D5S22_N27_SOTO_MINOR_RISK_REPORT',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    dialogue:
      'Director, el Sector Azul no reporto una situación de riesgo menor la semana pasada. Solicito que se registre formalmente y se notifique al Dr. Guzmán.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Notificar después',
        cardEmoji: '📋',
        text:
          'La situación fue omision y no ocultacion. Hoy estoy con muchas cosas, notificare a Guzmán la próxima semana para que regularice el reporte.',
        tags: mlqTags({ 'DPE-A': 4, EI: 2 }),
        consequences: {
          trustChange: -10,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'No quiero que el CESFAM se pueda involucrar en un problema por algo tan leve.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Revisar con Guzmán',
        cardEmoji: '🔎',
        text:
          'Lo revisaré con Guzmán el lunes de la próxima semana. No te preocupes, solo fue una omision, no es grave.',
        tags: mlqTags({ 'DPE-P': 2 }),
        consequences: {
          trustChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'No quiero que el CESFAM se pueda involucrar en un problema por algo tan leve.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Cerrar el tema',
        cardEmoji: '🚫',
        text:
          'La situación fue una omision. No te preocupes. Ya paso y no ocurrira nada mayor.',
        tags: mlqTags({ LF: 2 }),
        consequences: {
          trustChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'No quiero que el CESFAM se pueda involucrar en un problema por algo tan leve.',
            },
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D5_SEQUENCE_22',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    initialDialogue: '(Durante la tarde, Marcela Soto llega a tu oficina con documentación.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D5S22_N27_SOTO_MINOR_RISK_REPORT'],
    finalDialogue: 'Soto se retira dejando la documentación sobre el escritorio.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 6, slot: 'tarde' },
    isInevitable: true,
  },
];
