import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'INTRO_GUZMAN_NODE_1',
        stakeholderRole: 'Jefe Sector Azul',
        stakeholderId: 'andres-guzman',
        dialogue: 'Director, bienvenido. Soy el Dr. Andres Guzman, jefe del Sector Azul. Llevo ocho años en este Centro de Salud y conozco exactamente que sostiene a este sector. Se lo digo desde el principio: esto funciona porque nosotros lo hacemos funcionar.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }]
      },
  {
        node_id: 'INTRO_GUZMAN_NODE_2',
        stakeholderRole: 'Enfermera Sector Azul',
        stakeholderId: 'andres-guzman',
        participantIds: ['andres-guzman', 'paz-herrera'],
        dialogue: 'Director, ella es Paz Herrera. Es la enfermera que mantiene este sector en orden.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Saludar a Paz',
            cardEmoji: '🤝',
            text: 'Buenas tardes, enfermera Herrera. Espero que podamos trabajar bien juntos.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 5,
              reputationChange: 5,
              dialogueResponse: 'Mientras las prioridades queden claras, no deberiamos tener problemas.',
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Asentir',
            cardEmoji: '🙂',
            text: '(Asentir con un gesto cordial y dejar que Guzman siga marcando el ritmo de la reunion.)',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              dialogueResponse: 'Perfecto. Entonces sigamos.',
            },
          },
        ],
      },
  {
        node_id: 'INTRO_GUZMAN_NODE_3',
        stakeholderRole: 'TENS Sector Azul',
        stakeholderId: 'andres-guzman',
        participantIds: ['andres-guzman', 'paz-herrera', 'javier-castro'],
        dialogue: 'Y el es Javier Castro, nuestro TENS. Siempre disponible, incluso cuando el resto del Centro de Salud se acuerda tarde del Sector Azul.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {node_id: 'INTRO_GUZMAN_NODE_4',
        stakeholderRole: 'TENS Sector Azul',
        stakeholderId: 'javier-castro',
        participantIds: ['andres-guzman', 'paz-herrera', 'javier-castro'],
        dialogue: '(Javier baja la mirada antes de hablar). Hola, Director. Bienvenido.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'INTRO_GUZMAN_NODE_5',
        stakeholderRole: 'Jefe Sector Azul',
        stakeholderId: 'andres-guzman',
        participantIds: ['andres-guzman', 'paz-herrera', 'javier-castro'],
        dialogue: 'Hay algo que necesito dejar instalado desde su primer día. Los viernes en la mañana usamos el Box 5 para el convenio con la Facultad de Medicina. No es un capricho: trae internos, prestigio y una relacion que la direccion anterior cuido bastante.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Reconocer convenio',
            cardEmoji: '📋',
            text: 'Entendido, doctor. Tomo nota del convenio y de la prioridad que hoy tiene para el Sector Azul.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 5,
              reputationChange: 10,
              dialogueResponse: 'Me alegra que lo entienda desde el principio. Es algo que no conviene interrumpir a la ligera.',
              expected_actions: [
                {
                  mechanic_id: 'scheduler',
                  action_type: 'execute_week',
                  target_ref: 'global',
                  constraints: { room_id: 'BOX_5', target_sector_id: 'AZUL', day_name: 'Viernes', time_window: 'AM' },
                  rule_id: 'reserve_room_for_sector_rule_v1',
                  ui: {
                    title: 'Resguardar Box 5 para el Sector Azul - Viernes AM',
                    description: 'Viernes AM - convenio con Facultad',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 5, support: 5 } },
                    FALSE: { global: { reputation: -10 }, stakeholder: { trust: -15, support: -10 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Preguntar impacto',
            cardEmoji: '❓',
            text: 'Antes de comprometer nada, necesito saber como impacta ese uso del Box 5 en los otros sectores.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: -5,
              reputationChange: 5,
              dialogueResponse: 'Los otros sectores se adaptan. Asi ha funcionado siempre. Si alguien sale perjudicado, no ha sido el Sector Azul.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'No comprometerse',
            cardEmoji: '🤐',
            text: 'Lo tendre en cuenta. Primero necesito ver el panorama completo antes de fijar una postura.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              dialogueResponse: 'Prudente. Aunque en este caso no hay tanto que analizar como parece.',
            },
          },
        ],
      },
  {
        node_id: 'INTRO_GUZMAN_NODE_6',
        stakeholderRole: 'Jefe Sector Azul',
        stakeholderId: 'andres-guzman',
        dialogue: 'Mañana jueves en la tarde pase por mi oficina. Quiero mostrarle con calma como opera realmente el Sector Azul y por que el Box 5 no es una pelea menor. Hay cosas que no aparecen en ningun informe.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Confirmar visita',
            cardEmoji: '📅',
            text: 'De acuerdo. Mañana jueves en la tarde paso por su oficina.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 5,
              reputationChange: 5,
              dialogueResponse: 'Excelente. Lo espero en la tarde. Prefiero hablar esto antes de que la semana se cierre mal.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:andres-guzman',
                  constraints: { day: 'Thursday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Visitar a Dr. Andres Guzman - Jueves PM',
                    description: 'Jueves PM - oficina Sector Azul',
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
            cardTitle: 'Pedir otro horario',
            cardEmoji: '🗓️',
            text: 'Jueves en la tarde me complica. Si es importante, podria ser el viernes en la mañana.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: -5,
              reputationChange: -5,
              dialogueResponse: 'No es lo ideal, pero peor seria dejarlo para la proxima semana. Si va a ser, que sea el viernes temprano.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:andres-guzman',
                  constraints: { day: 'Friday', time_window: 'AM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Visitar a Dr. Andres Guzman - Viernes AM',
                    description: 'Viernes AM - oficina Sector Azul',
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
            cardTitle: 'Responder evasivo',
            cardEmoji: '⏳',
            text: 'Lo tendre presente, doctor. Esta semana aun estoy ordenando demasiadas cosas como para comprometer otra visita.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: -5,
              reputationChange: -5,
              dialogueResponse: 'Entiendo. Pero cuando uno posterga este tipo de conversaciones, despues el costo lo paga otro.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'AZUL_MEETING_1',
        stakeholderRole: 'Jefe Sector Azul',
        stakeholderId: 'andres-guzman',
        initialDialogue: 'Director, antes de entrar al detalle del conflicto, quiero que conozca como se sostiene nuestro equipo.',
        nodes: ['INTRO_GUZMAN_NODE_1', 'INTRO_GUZMAN_NODE_2', 'INTRO_GUZMAN_NODE_3', 'INTRO_GUZMAN_NODE_4', 'INTRO_GUZMAN_NODE_5', 'INTRO_GUZMAN_NODE_6'],
        finalDialogue: 'Bien. Ya sabe con quien esta tratando y por que nuestro equipo no se va a mover sin pelear su espacio.',
        consumesTime: false,
        triggerMap: { day: 3, slot: 'tarde' },
      },
];
