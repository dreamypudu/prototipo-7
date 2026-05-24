import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'ROJO_NEGOTIATION_1',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        participantIds: ['eduardo-naranjo', 'claudia-morales'],
        dialogue: 'Director. Que bueno que vino. Supongo que Sofia ya le informo que nuestra planificacion esta siendo vulnerada por la improvisacion de los otros sectores.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'ROJO_NEGOTIATION_2',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        participantIds: ['eduardo-naranjo', 'claudia-morales'],
        dialogue: 'El Box 6 debe quedar reservado para la auditoria IAAS del proximo miércoles en la tarde. Pero Francisca Solis aparece puesta en ese mismo box desde el Sector Amarillo. Si esa auditoria no queda bien agendada, la observacion sanitaria cae sobre todo el Centro de Salud.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Asegurar Auditoría',
            cardEmoji: '📋',
            text: 'La norma es clara, Marcela. El Box 6 se usara para la auditoria IAAS el miércoles en la tarde como corresponde.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 10,
              supportChange: 5,
              reputationChange: 10,
              dialogueResponse: 'Me tranquiliza ver que la direccion respeta los protocolos sanitarios. Entonces daremos por resguardado ese box.',
              expected_actions: [
                {
                  mechanic_id: 'scheduler',
                  action_type: 'execute_week',
                  target_ref: 'global',
                  constraints: { room_id: 'BOX_6', target_sector_id: 'ROJO', day_name: 'Miércoles', time_window: 'PM' },
                  rule_id: 'reserve_room_for_sector_rule_v1',
                  ui: {
                    title: 'Asegurar Box 6 para Enf. Marcela Soto - Miércoles PM',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 5 } },
                    FALSE: { global: { reputation: -10 }, stakeholder: { trust: -15, support: -10 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Priorizar Triaje',
            cardEmoji: '🤒',
            text: 'Si el Sector Amarillo necesita ese box para triaje respiratorio, la auditoria tendra que desplazarse. No voy a dejar a los niños esperando por una inspeccion.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: -10,
              supportChange: -10,
              reputationChange: -15,
              dialogueResponse: 'Entonces queda bajo su responsabilidad directa que el Sector Rojo llegue sin auditoria a una revision sanitaria. Voy a dejar constancia.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Buscar alternativas',
            cardEmoji: '🔄',
            text: 'Dejeme revisar si puedo mover parte del operativo del Sector Amarillo a otro espacio antes de tocar la auditoria.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: 0,
              reputationChange: -5,
              dialogueResponse: 'El margen es minimo, Director. Y las auditorias no se negocian como si fueran favores.',
            },
          },
        ],
      },
  {
        node_id: 'ROJO_NEGOTIATION_3',
        stakeholderId: 'eduardo-naranjo',
        stakeholderRole: 'Médico Sector Rojo',
        participantIds: ['marcela-soto', 'claudia-morales'],
        dialogue: '(El Dr. Naranjo se acomoda en su silla con gesto de dolor). Director... también esta el viernes. Si me sacan del Box 5, pierdo la unica silla ergonomica que tengo autorizada por mi discopatia.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'ROJO_NEGOTIATION_4',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        participantIds: ['eduardo-naranjo', 'claudia-morales'],
        dialogue: 'Exactamente. Si usted saca al Dr. Naranjo del Box 5 el viernes en la mañana para dejar docencia del Sector Azul, mi medico se va con licencia y el Sector Rojo queda sin horas medicas. No estoy dramatizando: estoy anticipando el problema.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Proteger a Naranjo',
            cardEmoji: '🛡️',
            text: 'No voy a exponer la salud ocupacional del Dr. Naranjo. El viernes en la mañana el Box 5 quedara para Rojo.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 10,
              supportChange: 5,
              reputationChange: 5,
              dialogueResponse: 'Es lo minimo que corresponde. Revisaremos que la asignacion quede bien registrada antes de cerrar el borrador.',
              expected_actions: [
                {
                  mechanic_id: 'scheduler',
                  action_type: 'execute_week',
                  target_ref: 'global',
                  constraints: { room_id: 'BOX_5', target_sector_id: 'ROJO', day_name: 'Viernes', time_window: 'AM' },
                  rule_id: 'reserve_room_for_sector_rule_v1',
                  ui: {
                    title: 'Asegurar Box 5 para Dr. Eduardo Naranjo - Viernes AM',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 10 } },
                    FALSE: { global: { reputation: -10 }, stakeholder: { trust: -15, support: -10 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Priorizar Docencia',
            cardEmoji: '🎓',
            text: 'El convenio docente sigue pesando mas para la institucion. Naranjo tendra que adaptarse a otro box aunque sea menos comodo.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -10,
              supportChange: -10,
              reputationChange: -15,
              dialogueResponse: 'Entonces despues no se sorprenda cuando aparezca una licencia medica y una denuncia por ergonomia laboral. Tambien voy a dejar eso por escrito.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'No prometer nada',
            cardEmoji: '⏳',
            text: 'Todavia estoy revisando cuan critico es ese choque. No voy a prometer el Box 5 antes de mirar toda la planilla.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: -5,
              reputationChange: -5,
              dialogueResponse: 'La salud del trabajador no se deja para el final de la planilla, Director. Es una obligacion basica.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'ROJO_NEGOTIATION_PROACTIVE',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        initialDialogue: '(Entra a la oficina del Sector Rojo. Marcela Soto tiene una ruma de carpetas de auditoria sobre el escritorio y lo mira con severidad).',
        nodes: [
          'ROJO_NEGOTIATION_1',
          'ROJO_NEGOTIATION_2',
          'ROJO_NEGOTIATION_3',
          'ROJO_NEGOTIATION_4',
        ],
        finalDialogue: 'Nosotros trabajamos apegados al reglamento, Director. Espero que la planificacion final no nos obligue a demostrarlo por la via formal.',
        consumesTime: false,
        triggerMap: { day: 4, slot: 'mañana' },
        isInevitable: false,
      },
];
