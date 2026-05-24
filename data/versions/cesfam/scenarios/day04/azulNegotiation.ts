import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'AZUL_NEGOTIATION_1',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        participantIds: ['paz-herrera'],
        dialogue: 'Director, lo estabamos esperando. Supongo que ya vio el desastre logistico que intentan armar los otros sectores en la planificacion.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'AZUL_NEGOTIATION_2',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        participantIds: ['paz-herrera'],
        dialogue: 'Ire directo al grano. El Box 5 del viernes en la mañana es innegociable. Tenemos el convenio con la Universidad y pacientes complejos citados. No voy a mandar alumnos ni pacientes al pasillo porque Eduardo Naranjo quiera ese mismo box para el Sector Rojo.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Asegurar Box 5',
            cardEmoji: '✅',
            text: 'Tiene razon, doctor. El convenio universitario es estrategico para el Centro de Salud. Les garantizo el Box 5 el viernes en la mañana.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 10,
              supportChange: 5,
              reputationChange: 10,
              dialogueResponse: 'Una decision sensata, Director. Sabia que podiamos entendernos en terminos de calidad.',
              expected_actions: [
                {
                  mechanic_id: 'scheduler',
                  action_type: 'execute_week',
                  target_ref: 'global',
                  constraints: { room_id: 'BOX_5', target_sector_id: 'AZUL', day_name: 'Viernes', time_window: 'AM' },
                  rule_id: 'reserve_room_for_sector_rule_v1',
                  ui: {
                    title: 'Resguardar Box 5 para Dr. Andres Guzman - Viernes AM',
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
            cardTitle: 'Priorizar a Naranjo',
            cardEmoji: '⚖️',
            text: 'La salud ocupacional de Eduardo Naranjo también pesa. Si necesita ese box por prescripcion, el Sector Azul va a tener que adaptarse.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: -10,
              supportChange: -10,
              reputationChange: -10,
              dialogueResponse: 'Me esta diciendo que va a sacrificar una alianza institucional por darle el gusto al Sector Rojo. Tomo nota.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Seguir evaluando',
            cardEmoji: '⏳',
            text: 'Todavia no voy a garantizarles nada. Necesito revisar toda la carga del viernes antes de cerrar los boxes definitivos.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: 0,
              reputationChange: -5,
              dialogueResponse: 'No hay mucho que evaluar. Si nos quita el box, yo mismo llamare a la Universidad para explicarles su decision.',
            },
          },
        ],
      },
  {
        node_id: 'AZUL_NEGOTIATION_3',
        stakeholderId: 'paz-herrera',
        stakeholderRole: 'Enfermera Sector Azul',
        participantIds: ['andres-guzman'],
        dialogue: 'Ese no es nuestro unico problema. El lunes en la mañana tengo curaciones avanzadas de pie diabético. Pero Daniel Rios ya dejo entrever que quiere llevarse a Javier Castro para reforzar terreno.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'AZUL_NEGOTIATION_4',
        stakeholderId: 'paz-herrera',
        stakeholderRole: 'Enfermera Sector Azul',
        participantIds: ['andres-guzman'],
        dialogue: 'Yo no puedo hacer procedimientos de alta complejidad sola, Director. Exijo que el lunes en la mañana Javier Castro se quede con el Sector Azul en el Centro de Salud. El Sector Amarillo tendra que arreglarse sin el.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Retener a Javier',
            cardEmoji: '🏥',
            text: 'De acuerdo, Paz. Las curaciones complejas son prioridad clinica. El lunes en la mañana Javier Castro se queda con el Sector Azul.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 10,
              supportChange: 5,
              reputationChange: 5,
              dialogueResponse: 'Perfecto. Le avisare a Javier que el lunes se queda con nosotros.',
              expected_actions: [
                {
                  mechanic_id: 'scheduler',
                  action_type: 'execute_week',
                  target_ref: 'global',
                  constraints: { staff_id: 'javier-castro', day_name: 'Lunes', time_window: 'AM' },
                  rule_id: 'keep_staff_in_sector_rule_v1',
                  ui: {
                    title: 'Mantener a Javier Castro dentro del Centro - Lunes AM',
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
            cardTitle: 'Apoyar operativo',
            cardEmoji: '🚶‍♂️',
            text: 'El operativo comunitario del Sector Amarillo también es una urgencia sanitaria. Si hace falta, tendra que resolver esas curaciones con menos apoyo.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: -10,
              supportChange: -10,
              reputationChange: -15,
              dialogueResponse: 'Eso es una negligencia administrativa. Si un paciente se complica por falta de manos, lo voy a dejar por escrito.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Buscar alternativas',
            cardEmoji: '🔄',
            text: 'Voy a intentar cuadrar los horarios, pero no prometo nada. Quizas tenga que mover parte de sus curaciones.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: -5,
              reputationChange: -5,
              dialogueResponse: 'Mis curaciones no se mueven, Director. Le sugiero que lo resuelva antes de que llegue el lunes.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'AZUL_NEGOTIATION_PROACTIVE',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        initialDialogue: '(Entra a la oficina del Sector Azul. Guzman revisa expedientes mientras Paz Herrera cruza los brazos, visiblemente molesta).',
        nodes: [
          'AZUL_NEGOTIATION_1',
          'AZUL_NEGOTIATION_2',
          'AZUL_NEGOTIATION_3',
          'AZUL_NEGOTIATION_4',
        ],
        finalDialogue: 'El prestigio del centro también se juega en estas decisiones, Director. Piense bien antes de cerrar esa agenda.',
        consumesTime: false,
        triggerMap: { day: 4, slot: 'mañana' },
        isInevitable: false,
      },
];
