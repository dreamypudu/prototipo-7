import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D5S23_N28_RIOS_TENS_PROTOCOL',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    dialogue:
      'Jefe, le traigo un borrador del protocolo de urgencias TENS-sin-medico dada la situacion que mencione el miercoles sobre como actuar, paso a paso, cuando no haya medico presente.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Enviar a superiores',
        cardEmoji: '📤',
        text:
          'Muchas gracias, Rios. Lo hare llegar a mis superiores para que lo revisen y opinen si vale o no la pena agregarlo. Si mas CESFAM han pasado por esto, seguro no habra problema.',
        tags: mlqTags({ RC: 4, IIA: 2 }),
        consequences: {
          trustChange: 5,
          supportChange: 5,
          expected_actions: [
            {
              mechanic_id: 'delegation',
              action_type: 'delegate_task',
              target_ref: 'task:protocolo_tens',
              rule_id: 'delegate_task_rule_v1',
              stakeholder_id: 'daniel-rios',
              ui: {
                title: 'Delegar: tramitación del protocolo TENS-sin-médico',
                description: 'Te comprometiste a tramitar el protocolo TENS de Ríos. Llama a Sofía Castro (teléfono) para delegar su gestión.',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Gracias jefe, esto seria la solucion formal a muchos inconvenientes.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Revisar y avisar',
        cardEmoji: '📄',
        text:
          'Que bien por tu iniciativa, gracias. Mis superiores lo revisaran y te informare cualquier situacion o si es necesario una modificacion.',
        tags: mlqTags({ RC: 2 }),
        consequences: {
          supportChange: 5,
          expected_actions: [
            {
              mechanic_id: 'delegation',
              action_type: 'delegate_task',
              target_ref: 'task:protocolo_tens',
              rule_id: 'delegate_task_rule_v1',
              stakeholder_id: 'daniel-rios',
              ui: {
                title: 'Delegar: tramitación del protocolo TENS-sin-médico',
                description: 'Te comprometiste a tramitar el protocolo TENS de Ríos. Llama a Sofía Castro (teléfono) para delegar su gestión.',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Gracias jefe, esto seria la solucion formal a muchos inconvenientes.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Derivar a Soto',
        cardEmoji: '⚖️',
        text:
          'Se lo entregare a Soto para que lo revise antes de enviarlo a los superiores para que lo aprueben.',
        tags: mlqTags({ 'DPE-A': 2 }),
        consequences: {
          expected_actions: [
            {
              mechanic_id: 'delegation',
              action_type: 'delegate_task',
              target_ref: 'task:protocolo_tens',
              rule_id: 'delegate_task_rule_v1',
              stakeholder_id: 'daniel-rios',
              ui: {
                title: 'Delegar: tramitación del protocolo TENS-sin-médico',
                description: 'Te comprometiste a tramitar el protocolo TENS de Ríos. Llama a Sofía Castro (teléfono) para delegar su gestión.',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Gracias jefe, esto seria la solucion formal a muchos inconvenientes.',
            },
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D5_SEQUENCE_23',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    initialDialogue: '(En el bloque PM, Daniel Rios llega a tu oficina con un documento.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D5S23_N28_RIOS_TENS_PROTOCOL'],
    finalDialogue: 'Rios deja el borrador del protocolo sobre tu escritorio.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 7, slot: 'tarde' },
    isInevitable: true,
  },
];
