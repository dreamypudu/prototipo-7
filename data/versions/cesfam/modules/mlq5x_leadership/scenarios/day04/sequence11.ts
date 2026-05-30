import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D2S11_N16_GUZMAN_VISION',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      '¿Director, quería hacerle una pregunta: tiene una visión para este CESFAM? El anterior nunca tuvo una. Solo apagaba incendios.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Construir visión',
        cardEmoji: '🤝',
        text: 'Tengo una visión en construccion, pero necesito a todos como equipo para darle forma real.',
        tags: mlqTags({ "MI": 4, "IIC": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Esa es una base sería. Si hay visión, puedo aportar desde lo técnico y la docencia.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Solo espero que esta dirección sea mejor que la anterior.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Pedir semanas',
        cardEmoji: '⏳',
        text: 'Aun estoy conociendo al equipo; necesito unas semanas para formularla.',
        tags: mlqTags(),
        consequences: {
          trustChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Comprendo que este conociendo el lugar, pero el CESFAM ya lleva demasiado tiempo sin rumbo claro.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Solo espero que esta dirección sea mejor que la anterior.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Guiarse por indicadores',
        cardEmoji: '📊',
        text: 'Mi visión es hacer bien lo que hay que hacer y los indicadores son la guia.',
        tags: mlqTags({ "RC": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Los indicadores sirven, pero no reemplazan una dirección que inspire hacia donde vamos.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Solo espero que esta dirección sea mejor que la anterior.',
            }
          ]},
      },
    ],
  },
  {
    node_id: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      'Ademas, esta mañana me escribio la coordinadora de prácticas de la universidad preguntando si se mantendran los cupos de práctica clínica. Me solicito una respuesta para antes del viernes.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Confirmar cupos',
        cardEmoji: '📘',
        text:
          'Guzmán, por favor confirme el interés del CESFAM y la mantención de los cupos. Estas prácticas son una enorme oportunidad.',
        tags: mlqTags({ "IIA": 4, "IIC": 2 }),
        consequences: {
          trustChange: 10,
          expected_actions: [
            {
              mechanic_id: 'office',
              action_type: 'choose_future_option',
              target_ref: 'scenario_node:MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
              constraints: {
                target_node_id: 'MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
                accepted_option_ids: ['A', 'B'],
              },
              rule_id: 'future_decision_consistency_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Consistencia: mantener respuesta sobre cupos clínicos con Dr. Andrés Guzmán - Viernes',
                description:
                  'Como se pidió confirmar la mantención de cupos a la universidad, la decisión futura con Guzmán debe sostener esa continuidad y no derivar completamente el convenio.',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Perfecto. Con esa señal puedo responderle a la universidad con respaldo institucional.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Gracias, director.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Gestionar docencia',
        cardEmoji: '🎯',
        text:
          'Me encargare de gestionar la labor docente ya que los box son escasos; le avisaré en cuanto tenga respuesta.',
        tags: mlqTags({ "MI": 2 }),
        consequences: {
          trustChange: 5,
          expected_actions: [
            {
              mechanic_id: 'delegation',
              action_type: 'delegate_task',
              target_ref: 'task:gestion_docencia',
              rule_id: 'delegate_task_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Delegar: gestión de la labor docente',
                description: 'Te comprometiste a gestionar la labor docente. Llama a Sofía Castro (teléfono) para delegar su gestión.',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Me sirve que se haga cargo, aunque necesito una respuesta antes de que la universidad cierre la ventana.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Gracias, director.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'No responder aun',
        cardEmoji: '⏳',
        text:
          'Todavia estoy en proceso de revisión interna y verificando box disponibles; no puedo darle una respuesta aun.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Entiendo la revisión, pero la universidad necesita una posicion. La ambiguedad también tiene costo.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Gracias, director.',
            }
          ]},
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D2_SEQUENCE_11',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    initialDialogue: '(Te reunes con Andrés Guzmán en el Sector Azul durante la tarde del jueves.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D2S11_N16_GUZMAN_VISION',
      'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
    ],
    finalDialogue: 'Guzmán queda esperando una señal clara sobre la continuidad de la docencia clínica del CESFAM.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 4, slot: 'tarde' },
  },
];
