import type { ExpectedAction, MeetingSequence, ScenarioNode, ScenarioOption } from '../../../../../../../types';
import { mlqTags } from '../tags';

const nextOption = (): ScenarioOption => ({
  option_id: 'NEXT',
  cardTitle: 'Siguiente',
  cardEmoji: '➡️',
  text: 'Continuar',
  tags: mlqTags(),
  consequences: {},
});

// Accion esperada de bienestar: la carga clinica (CLINICAL + TERRAIN) de Javier no debe superar
// el 60% de su jornada. Se evalua en execute_week con clinical_load_limit_rule_v1 y su resultado
// (true/false) dispara los contingentes del lunes (sequenceJavierBienestar*). Se registra en las
// tres opciones de N23: la conversacion en si crea la expectativa, sin importar la respuesta.
const clinicalLoadExpectedAction: Partial<ExpectedAction> = {
  mechanic_id: 'scheduler',
  action_type: 'execute_week',
  target_ref: 'global',
  constraints: { staff_id: 'javier-castro', max_clinical_pct: 60 },
  rule_id: 'clinical_load_limit_rule_v1',
  stakeholder_id: 'javier-castro',
  ui: {
    title: 'Equilibrar la carga de TENS Javier Castro.',
    description:
      'En la grilla semanal, dejar la jornada de Javier con a lo más 60% de horas clínicas (box y terreno) y el resto administrativas, para sostener su bienestar.',
  },
};

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
      'Llevo mucho tiempo trabajando largas jornadas, director. Nadie lo ha visto nunca como un problema. Yo... ya no puedo dar lo mejor de mi así. Lo siento.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Considerar carga',
        cardEmoji: '🎯',
        text:
          'Consideraré especificamente tu carga horaria para la propuesta de la próxima semana. Esto afecta tanto a ti personalmente como tu rendimiento en el CESFAM.',
        tags: mlqTags({ "CI": 4 }),
        consequences: {
          expected_actions: [clinicalLoadExpectedAction],
          bridgeResponse: [
            {
              stakeholder_id: 'javier-castro',
              text: 'Gracias, director. Necesitaba que esto se mirara como algo concreto, no solo como cansancio personal.',
            },
            {
              stakeholder_id: 'javier-castro',
              text: 'Espero que esta situación cambie en el futuro.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Tomarlo para hoy',
        cardEmoji: '📋',
        text: 'Lo tendré en cuenta para la propuesta de hoy. No puedes seguir manteniendo estos niveles de carga horaria.',
        tags: mlqTags({ "CI": 2 }),
        consequences: {
          expected_actions: [clinicalLoadExpectedAction],
          bridgeResponse: [
            {
              stakeholder_id: 'javier-castro',
              text: 'Se lo agradezco. Me preocupa que quede solo como una nota más dentro de la agenda.',
            },
            {
              stakeholder_id: 'javier-castro',
              text: 'Espero que esta situación cambie en el futuro.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Postergar carga',
        cardEmoji: '⏳',
        text:
          'Lamentablemente todos están con carga. Veré que se puede hacer a futuro, ya que muchos están en tu situación y no hay presupuesto para más personal.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          expected_actions: [clinicalLoadExpectedAction],
          bridgeResponse: [
            {
              stakeholder_id: 'javier-castro',
              text: 'Entiendo que no soy el unico, pero eso no hace que la carga sea sostenible.',
            },
            {
              stakeholder_id: 'javier-castro',
              text: 'Espero que esta situación cambie en el futuro.',
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
