import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'AGENDA_CRISIS_THURS_1',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Director, buen día. Revise las propuestas que le dejaron ayer las jefaturas. Si usted aprueba todo tal como esta, la planificacion de la proxima semana entra en choque desde el primer bloque.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_THURS_2',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Primer tope critico: Viernes AM en el Box 5. Andres Guzman lo exige para su bloque docente, pero Eduardo Naranjo sigue agendado en ese mismo box para el Sector Rojo. Si no lo corrige, el viernes va a terminar incumpliendole a uno de los dos.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_THURS_3',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Segundo: Miercoles PM en el Box 6. Marcela Soto lo deja tomado para el Sector Rojo, pero Francisca Solis también quedo puesta ahi desde el Sector Amarillo. Ese cruce no se va a resolver solo.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_THURS_4',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Y tercero: Lunes AM. Paz Herrera da por hecho que Javier Castro se queda apoyando sus curaciones, pero Daniel Rios sigue contando con llevarselo a terreno para el operativo del Sector Amarillo. Ese cruce no aparece en rojo, pero igual le va a explotar si no toma partido.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_THURS_5',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Tiene hasta mañana viernes en la tarde para corregir esto manualmente en la Planificacion. Si llega la hora de enviar el borrador con estos choques adentro, yo igual tendre que mandarlo.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_THURS_6',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Le sugiero usar esta misma mañana para empezar a negociar en terreno. A quien le doy el aviso de que usted va en camino ahora mismo?',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Ir al Sector Azul',
            cardEmoji: '🔵',
            text: 'Ire a ver al Dr. Guzman. Entre el Box 5 del viernes y el conflicto por Javier Castro del lunes, el Sector Azul ya tiene dos frentes abiertos.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 5,
              bridgeResponse: 'Avisare al Dr. Guzman que va para alla. Suerte intentando moverle prioridades al Sector Azul.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:andres-guzman',
                  constraints: { day: 'Thursday', time_window: 'AM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Mapa: negociar agenda con Dr. Andres Guzman en Sector Azul - Jueves AM',
                    description: 'Visitar al Dr. Andres Guzman para abordar los cruces de Box 5 Viernes AM y Javier Castro Lunes AM.',
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
            cardTitle: 'Ir al Sector Rojo',
            cardEmoji: '🔴',
            text: 'Ire con Marcela Soto. Necesito dimensionar cuanto margen real tiene el Sector Rojo para mover auditorias y box clinicos.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 5,
              bridgeResponse: 'Buena idea. Le dire a Marcela Soto que la visita ahora.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:marcela-soto',
                  constraints: { day: 'Thursday', time_window: 'AM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Mapa: negociar agenda con Enf. Marcela Soto en Sector Rojo - Jueves AM',
                    description: 'Visitar a Marcela Soto para abordar el cruce del Box 6 Miercoles PM y las auditorias del Sector Rojo.',
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
            option_id: 'C',
            cardTitle: 'Ir al Sector Amarillo',
            cardEmoji: '🟡',
            text: 'Ire con Daniel Rios. Entre el Box 6 del miercoles y la pelea por Javier Castro el lunes, el Sector Amarillo puede desordenar toda la semana si no aclara sus prioridades.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 5,
              bridgeResponse: 'Entendido. Rios va a notar que priorizo el frente mas expuesto hacia comunidad. Le aviso que va para alla.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:daniel-rios',
                  constraints: { day: 'Thursday', time_window: 'AM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Mapa: negociar agenda con Sr. Daniel Rios en Sector Amarillo - Jueves AM',
                    description: 'Visitar a Daniel Rios para abordar el cruce del Box 6 Miercoles PM y la disputa por Javier Castro Lunes AM.',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 5 } },
                    FALSE: { stakeholder: { trust: -15, support: -10 } },
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
        sequence_id: 'AGENDA_CRISIS_DETONATOR_SEQ',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        initialDialogue: '(Sofia la espera en la oficina a primera hora. Tiene la planificacion abierta y varios cruces marcados en pantalla).',
        nodes: [
          'AGENDA_CRISIS_THURS_1',
          'AGENDA_CRISIS_THURS_2',
          'AGENDA_CRISIS_THURS_3',
          'AGENDA_CRISIS_THURS_4',
          'AGENDA_CRISIS_THURS_5',
          'AGENDA_CRISIS_THURS_6',
        ],
        finalDialogue: 'Le dejo la agenda en sus manos, Director. Estare en recepcion si necesita que llame a alguien.',
        consumesTime: false,
        triggerMap: { day: 4, slot: 'mañana' },
        isInevitable: true,
      },
];
