import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'SCHEDULE_WAR_INTRO',
        stakeholderRole: 'Jefe Sector Azul',
        stakeholderId: 'andres-guzman',
        dialogue: 'Director, traigo la propuesta del Sector Azul. Reservamos bloques criticos para sostener calidad técnica y un espacio protegido para docencia. Si eso se cae, se cae algo mas que una agenda.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'SCHEDULE_WAR_SOTO',
        stakeholderRole: 'Jefa Sector Rojo',
        stakeholderId: 'marcela-soto',
        dialogue: 'Un momento. En el Sector Rojo ya no tenemos margen para improvisar. Si alguien bloquea el box critico o vuelve a mover personal sin acuerdo, el lunes parte con problemas serios para mi sector.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'SCHEDULE_WAR_RIOS',
        stakeholderRole: 'Jefe Sector Amarillo',
        stakeholderId: 'daniel-rios',
        dialogue: 'Mientras ustedes discuten criterios, en el Sector Amarillo estamos llegando con gente que no aguanta otra reagendacion. Si el lunes no aparece una salida real, me revienta la sala de espera.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'SCHEDULE_WAR_GUZMAN_RETORT',
        stakeholderRole: 'Jefe Sector Azul',
        stakeholderId: 'andres-guzman',
        dialogue: 'Daniel, esto no se sostiene solo apagando incendios. Si el Centro de Salud no protege sus espacios estrategicos, despues todos pagan el costo de la mediocridad.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'SCHEDULE_WAR_SOTO_FINAL',
        stakeholderRole: 'Jefa Sector Rojo',
        stakeholderId: 'marcela-soto',
        dialogue: 'Y si la planificacion sigue resolviendose a costa del mismo funcionario, despues no me pidan que mire para el lado. Eso no va a pasar.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'SCHEDULE_WAR_SOFIA_CHOICE',
        stakeholderRole: 'Asistente Administrativa',
        stakeholderId: 'sofia-castro',
        dialogue: 'Ya escucho a las tres jefaturas. Dejeme anotado con quien le conviene profundizar primero mañana, cuando empecemos a cerrar el conflicto del borrador.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Priorizar Azul',
            cardEmoji: '🔵',
            text: 'Quiero partir con Andres Guzman. Necesito entender primero la presion técnica y politica del Sector Azul.',
            tags: { focus: 'azul' },
            consequences: {
              trustChange: 5,
              reputationChange: 5,
              bridgeResponse: 'Bien. Le avisaré que irá en la tarde.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:andres-guzman',
                  constraints: { day: 'Wednesday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'visit_priority_rule_v1',
                  ui: {
                    title: 'Priorizar reunion con Dr. Andres Guzman - Miercoles PM',
                    description: 'Miercoles PM - primera visita',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 5, support: 5 } },
                    FALSE: { stakeholder: { trust: -5, support: -5 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Priorizar Amarillo',
            cardEmoji: '🟡',
            text: 'Quiero partir con Daniel Rios. Necesito entender primero la presion asistencial y comunitaria del Sector Amarillo.',
            tags: { focus: 'amarillo' },
            consequences: {
              trustChange: 5,
              reputationChange: 5,
              bridgeResponse: 'Bien. Le avisaré que irá en la tarde.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:daniel-rios',
                  constraints: { day: 'Wednesday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'visit_priority_rule_v1',
                  ui: {
                    title: 'Priorizar reunion con Sr. Daniel Rios - Miercoles PM',
                    description: 'Miercoles PM - primera visita',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 5, support: 5 } },
                    FALSE: { stakeholder: { trust: -5, support: -5 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Priorizar Rojo',
            cardEmoji: '🔴',
            text: 'Quiero partir con Marcela Soto. Necesito aclarar primero el frente normativo y laboral del Sector Rojo.',
            tags: { focus: 'rojo' },
            consequences: {
              trustChange: 5,
              reputationChange: 5,
              bridgeResponse: 'Bien. Le avisaré que irá en la tarde.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:marcela-soto',
                  constraints: { day: 'Wednesday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'visit_priority_rule_v1',
                  ui: {
                    title: 'Priorizar reunion con Enf. Marcela Soto - Miercoles PM',
                    description: 'Miercoles PM - primera visita',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 5, support: 5 } },
                    FALSE: { stakeholder: { trust: -5, support: -5 } },
                  },
                },
              ],
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'SCHEDULE_WAR_SEQ',
        stakeholderRole: 'Jefe Sector Azul',
        stakeholderId: 'andres-guzman',
        initialDialogue: '(Las tres jefaturas entran con sus planificaciones.)',
        nodes: ['SCHEDULE_WAR_INTRO', 'SCHEDULE_WAR_SOTO', 'SCHEDULE_WAR_RIOS', 'SCHEDULE_WAR_GUZMAN_RETORT', 'SCHEDULE_WAR_SOTO_FINAL', 'SCHEDULE_WAR_SOFIA_CHOICE'],
        finalDialogue: 'Muy bien. Gracias por su tiempo, director',
        consumesTime: false,
        triggerMap: { day: 3, slot: 'mañana' },
        isInevitable: true,
      },
];
