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

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D3S18_JAVIER_ENTERS',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue: '(En la tarde Javier Castro entra a tu oficina. Hay una breve pausa.)',
    dialogueIsNarration: true,
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S18_N23_JAVIER_WORKLOAD',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue:
      'Llevo mucho tiempo trabajando largas jornadas, director. Nadie lo ha visto nunca como un problema. Yo... ya no puedo dar lo mejor de mi asi. Lo siento.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Considerar carga',
        cardEmoji: '🎯',
        text:
          'Considerare especificamente tu carga horaria para la propuesta de la proxima semana. Esto afecta tanto a ti personalmente como tu rendimiento en el CESFAM.',
        tags: mlqTags({ "CI": 4 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'javier-castro',
              text: 'Gracias, director. Necesitaba que esto se mirara como algo concreto, no solo como cansancio personal.',
            },
            {
              stakeholder_id: 'javier-castro',
              text: 'Espero que esta situacion cambie en el futuro.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Tomarlo para hoy',
        cardEmoji: '📋',
        text: 'Lo tendre en cuenta para la propuesta de hoy. No puedes seguir manteniendo estos niveles de carga horaria.',
        tags: mlqTags({ "CI": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'javier-castro',
              text: 'Se lo agradezco. Me preocupa que quede solo como una nota mas dentro de la agenda.',
            },
            {
              stakeholder_id: 'javier-castro',
              text: 'Espero que esta situacion cambie en el futuro.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Postergar carga',
        cardEmoji: '⏳',
        text:
          'Lamentablemente todos estan con carga. Vere que se puede hacer a futuro, ya que muchos estan en tu situacion y no hay presupuesto para mas personal.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'javier-castro',
              text: 'Entiendo que no soy el unico, pero eso no hace que la carga sea sostenible.',
            },
            {
              stakeholder_id: 'javier-castro',
              text: 'Espero que esta situacion cambie en el futuro.',
            },
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D3_SEQUENCE_18',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    initialDialogue: '(Javier Castro llega a tu oficina para hablar de su carga asistencial.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D3S18_JAVIER_ENTERS',
      'MLQ5X_D3S18_N23_JAVIER_WORKLOAD',
    ],
    finalDialogue: 'Javier sale de la oficina esperando que la propuesta de horarios refleje el desgaste que acaba de plantear.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 5, slot: 'tarde' },
    isInevitable: true,
  },
];
