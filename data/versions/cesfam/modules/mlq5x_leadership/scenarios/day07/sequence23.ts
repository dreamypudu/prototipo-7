import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D5S23_N28_RIOS_TENS_PROTOCOL',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    dialogue:
      'Jefe, le traigo un borrador del protocolo de urgencias TENS-sin-médico dada la situación que mencione el miércoles sobre como actuar, paso a paso, cuando no haya médico presente.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Enviar a superiores',
        cardEmoji: '📤',
        text:
          'Muchas gracias, Ríos. Lo haré llegar a mis superiores para que lo revisen y opinen si vale o no la pena agregarlo. Si más CESFAM han pasado por esto, seguro no habrá problema.',
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
              text: 'Gracias jefe, esto sería la solución formal a muchos inconvenientes.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Revisar y avisar',
        cardEmoji: '📄',
        text:
          'Que bien por tu iniciativa, gracias. Mis superiores lo revisarán y te informaré cualquier situación o si es necesario una modificacion.',
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
              text: 'Gracias jefe, esto sería la solución formal a muchos inconvenientes.',
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
              text: 'Gracias jefe, esto sería la solución formal a muchos inconvenientes.',
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
    initialDialogue: '(En el bloque PM, Daniel Ríos llega a tu oficina con un documento.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D5S23_N28_RIOS_TENS_PROTOCOL'],
    finalDialogue: 'Ríos deja el borrador del protocolo sobre tu escritorio.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 6, slot: 'tarde' },
    isInevitable: true,
  },
];
