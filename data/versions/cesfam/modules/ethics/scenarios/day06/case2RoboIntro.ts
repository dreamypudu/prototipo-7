import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'CASO2_ROBO_INTRO_1',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Director, disculpe que lo interrumpa de nuevo. Con la agenda ya publicada, ahora tenemos un quiebre grave de convivencia entre dos sectores y esta a punto de escalar al Servicio de Salud.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_INTRO_2',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Se trata de insumos. Marcela Soto tiene la llave subrogante de la bodega central y acusa a Daniel Rios de haber entrado a escondidas con una copia antigua para sacar antibioticos pediatricos.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_INTRO_3',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Marcela exige que usted abra hoy mismo un sumario administrativo por sustracción de bienes fiscales. Daniel no niega haber sacado las cajas, pero insiste en que Marcela las tenia retenidas por un error de firma mientras los pacientes seguian esperando.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_INTRO_4',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Le advierto algo importante: la pestaña de Planificacion de Horarios sigue bloqueada por mantencion externa del Servicio. No volvera a estar operativa hasta el miercoles.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_INTRO_5',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Eso significa que no puede comprar paz con mejores turnos ni compensaciones en la agenda. Tendra que ir personalmente a las oficinas, escuchar versiones y tomar una decision politica pura. Por donde va a empezar la investigacion esta tarde?',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Hablar con Marcela',
            cardEmoji: '🔴',
            text: 'Ire al Sector Rojo. Si hubo una sustracción de bienes fiscales, Marcela tiene derecho a estar furiosa. Necesito medir la gravedad del quiebre normativo.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 0,
              reputationChange: 0,
              bridgeResponse: 'Le avisare que va en camino. Sigue atrincherada en su oficina redactando la denuncia, asi que vaya preparado.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:marcela-soto',
                  constraints: { day: 'Monday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Investigar denuncia con Enf. Marcela Soto - Lunes PM',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 0 } },
                    FALSE: { stakeholder: { trust: -15, support: -10 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Hablar con Daniel',
            cardEmoji: '🟡',
            text: 'Ire al Sector Amarillo. Necesito escuchar de Daniel Rios por que llevo el conflicto al extremo de forzar un protocolo para conseguir esos antibioticos.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 5,
              supportChange: 0,
              reputationChange: 0,
              bridgeResponse: 'Bien. Daniel esta repartiendo los medicamentos en el patio del Sector Amarillo. Le envio un mensaje para que lo espere.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:daniel-rios',
                  constraints: { day: 'Monday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Interrogar a Sr. Daniel Rios - Lunes PM',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 0 } },
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
        sequence_id: 'CASO2_ROBO_DETONATOR_SEQ',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        initialDialogue: '(Sofia entra a su oficina y cierra la puerta con seguro para que nadie escuche desde el pasillo.)',
        nodes: [
          'CASO2_ROBO_INTRO_1',
          'CASO2_ROBO_INTRO_2',
          'CASO2_ROBO_INTRO_3',
          'CASO2_ROBO_INTRO_4',
          'CASO2_ROBO_INTRO_5',
        ],
        finalDialogue: 'Tenga cuidado, Director. Esta pelea puede partir al Centro de Salud completo si no la contiene rapido.',
        consumesTime: false,
        triggerMap: { day: 6, slot: 'tarde' },
        isInevitable: true,
      },
];
