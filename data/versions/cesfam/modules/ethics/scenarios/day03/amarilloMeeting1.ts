import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'AMARILLO_MEETING_1_INTRO',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['ricardo-meza', 'francisca-solis'],
        dialogue: 'Jefe. Digo... Director. Bienvenido. Soy Daniel Rios, encargado del Sector Amarillo. Pasabamos a saludarlo rapidito con los chiquillos aprovechando un huequito, que la sala de espera esta que revienta.',
        options: [
          {
            option_id: 'NEXT',
            cardTitle: 'Siguiente',
            cardEmoji: '➡️',
            text: 'Hola Daniel. Pasen, por favor, me alegra conocerlos aunque sea un momento.',
            tags: {},
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              dialogueResponse: 'Buena onda, jefe. Seremos super concretos.',
            },
          },
        ],
      },
  {
        node_id: 'AMARILLO_MEETING_1_TEAM',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['ricardo-meza', 'francisca-solis'],
        dialogue: 'Mire, le presento al Dr. Ricardo Meza y a la enfermera Francisca Solis. Nosotros somos de acción, director. Aqui la necesidad sobra y la burocracia asfixia. A veces hay que saltarse un poco los protocolos para que la gente no sufra esperando.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Apoyar la acción',
            cardEmoji: '❤️',
            text: 'Lo entiendo, Daniel. La prioridad siempre debe ser el bienestar de la comunidad. Buscaremos la forma de agilizar los procesos para que puedan trabajar mejor.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 5,
              supportChange: 5,
              reputationChange: 10,
              dialogueResponse: 'Eso queriamos escuchar. Alguien que tenga calle y entienda la urgencia real.',
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Exigir protocolos',
            cardEmoji: '📘',
            text: 'Valoro su vocacion, Daniel, pero no podemos saltarnos las normativas. Un error por improvisar nos costaria un sumario a todos.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: -5,
              supportChange: -10,
              reputationChange: -10,
              dialogueResponse: 'Pucha, jefe... Si nos ponemos a llenar papeles por cada gasa, la mitad del barrio se nos queda sin atencion.',
            },
          },
        ],
      },
  {
        node_id: 'AMARILLO_MEETING_1_REQUEST',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['ricardo-meza', 'francisca-solis'],
        dialogue: 'Justo por esa urgencia queriamos hablarle. Tenemos un operativo en terreno y nos faltan insumos criticos. Necesito que vaya a nuestro sector mañana jueves en la mañana para mostrarle la realidad en vivo. Contamos con usted?',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Iré mañana',
            cardEmoji: '✅',
            text: 'Agendado, Daniel. Mañana jueves durante la mañana estare en su sector para revisar esos insumos.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 0,
              reputationChange: 5,
              dialogueResponse: 'Excelente. Vaya con zapatos comodos, que le vamos a mostrar todo el despliegue.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:daniel-rios',
                  constraints: { day: 'Thursday', time_window: 'AM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Visitar a Sr. Daniel Rios - Jueves AM',
                    description: 'Revision de operativo e insumos del Sector Amarillo',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 5 } },
                    FALSE: { stakeholder: { trust: -15, support: -10 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'No puedo prometerlo',
            cardEmoji: '⛔',
            text: 'No puedo asegurar mi presencia, Daniel. Hay otras urgencias administrativas que debo resolver primero antes de bloquear mi mañana.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -10,
              supportChange: -5,
              reputationChange: -5,
              dialogueResponse: 'Ya veo... urgencias administrativas. Bueno, nosotros seguiremos atajando los problemas solos entonces.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'AMARILLO_MEETING_1_PROACTIVE',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        initialDialogue: '(Daniel Rios entra a tu oficina a paso rapido, seguido por dos profesionales de su equipo. Se ven agotados pero con mucha energia).',
        nodes: ['AMARILLO_MEETING_1_INTRO', 'AMARILLO_MEETING_1_TEAM', 'AMARILLO_MEETING_1_REQUEST'],
        finalDialogue: 'Vale jefe, lo dejamos trabajar. Cualquier cosa me manda un WhatsApp y lo resolvemos.',
        consumesTime: false,
        triggerMap: { day: 3, slot: 'tarde' },
        isInevitable: false,
      },
];
