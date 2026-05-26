import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'AMARILLO_NEGOTIATION_1',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['francisca-solis', 'ricardo-meza'],
        dialogue: 'Director, menos mal que vino a ver la trinchera. Ya debe saber que la agenda esta ardiendo, pero aqui estamos peleando por el bienestar de las personas.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'AMARILLO_NEGOTIATION_2',
        stakeholderId: 'francisca-solis',
        stakeholderRole: 'Enfermera Sector Amarillo',
        participantIds: ['daniel-rios'],
        dialogue: '(Francisca da un paso adelante, claramente angustiada). Director, el cruce del Box 6 el miércoles en la tarde no es un capricho. Yo necesito ese box para triaje respiratorio y Marcela Soto lo quiere cerrar para su auditoria. No puedo seguir atendiendo niños complicados en el pasillo.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Asegurar Box 6',
            cardEmoji: '🤒',
            text: 'Tranquila, Francisca. La urgencia respiratoria pesa mas. Voy a asegurarles el Box 6 para su triaje el miércoles en la tarde.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 10,
              supportChange: 5,
              reputationChange: 5,
              bridgeResponse: 'Gracias, Director. Al menos alguien esta mirando lo que pasa con los pacientes y no solo los formularios.',
              expected_actions: [
                {
                  mechanic_id: 'scheduler',
                  action_type: 'execute_week',
                  target_ref: 'global',
                  constraints: { staff_id: 'francisca-solis', room_id: 'BOX_6', activity: 'CLINICAL', day_name: 'Miércoles', time_window: 'PM' },
                  rule_id: 'research_hours_rule_v1',
                  ui: {
                    title: 'Planificacion: asignar a Enf. Francisca Solis en Box 6 para triaje respiratorio - Miercoles PM',
                    description: 'En la grilla semanal, ubicar a Francisca Solis en el Box 6 el Miercoles PM para cubrir la urgencia respiratoria del Sector Amarillo.',
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
            cardTitle: 'Respetar Auditoría',
            cardEmoji: '⚖️',
            text: 'La auditoria sanitaria también es un requisito formal. Si Box 6 ya esta comprometido para eso, el Sector Amarillo va a tener que reordenar su triaje.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: -10,
              supportChange: -10,
              reputationChange: -5,
              bridgeResponse: 'Claro. Otra vez los papeles pesan mas que los ninos con dificultad respiratoria. Quedo clarisimo.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Seguir evaluando',
            cardEmoji: '⏳',
            text: 'Todavia no puedo confirmarles ese box. Primero quiero revisar si existe algun otro espacio que no haga colisionar toda la grilla.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: 0,
              reputationChange: -10,
              bridgeResponse: 'No se demore mucho, Director. Los virus no esperan a que uno termine de ordenar planillas.',
            },
          },
        ],
      },
  {
        node_id: 'AMARILLO_NEGOTIATION_3',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['francisca-solis', 'ricardo-meza'],
        dialogue: 'La otra pelea es el lunes en la mañana. Tenemos operativo en terreno con postrados y vacunación, y nos faltan manos. Si Javier Castro no sale con nosotros, el despliegue queda cojo desde la primera visita.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'AMARILLO_NEGOTIATION_4',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['francisca-solis', 'ricardo-meza'],
        dialogue: 'El Sector Azul ya empezo a decir que Paz Herrera se quedaria sola con sus curaciones. Yo entiendo su problema, pero si no saco a Javier a terreno el lunes, los pacientes postrados se quedan esperando una semana mas. Digame que nos respalda.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Llevar a Javier',
            cardEmoji: '🚶‍♂️',
            text: 'Lo respaldo, Daniel. El lunes en la mañana Javier Castro quedara asignado a terreno con el Sector Amarillo.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 10,
              supportChange: 5,
              reputationChange: 5,
              bridgeResponse: 'Esa es la actitud, Director. Si vamos completos, el operativo realmente puede mover la aguja en terreno.',
              expected_actions: [
                {
                  mechanic_id: 'scheduler',
                  action_type: 'execute_week',
                  target_ref: 'global',
                  constraints: { staff_id: 'javier-castro', room_id: 'TERRENO', activity: 'TERRAIN', day_name: 'Lunes', time_window: 'AM' },
                  rule_id: 'research_hours_rule_v1',
                  ui: {
                    title: 'Planificacion: asignar a Javier Castro a terreno con Sector Amarillo - Lunes AM',
                    description: 'En la grilla semanal, poner a Javier Castro en Terreno el Lunes AM para reforzar el operativo comunitario del Sector Amarillo.',
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
            cardTitle: 'Proteger a Azul',
            cardEmoji: '🏥',
            text: 'No puede llevarse personal sin dejar descubierto al resto. Javier se queda en el Centro de Salud apoyando las curaciones del Sector Azul.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: -10,
              supportChange: -10,
              reputationChange: -10,
              bridgeResponse: 'Entonces cuando el operativo fracase y los vecinos pregunten por que no llegamos, espero que usted también de la cara.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Buscar alternativas',
            cardEmoji: '🔄',
            text: 'Voy a revisar si puedo reasignar a otra persona o rearmar parte del operativo, pero no voy a prometerle a Javier hasta ver toda la carga del lunes.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: -5,
              reputationChange: -5,
              bridgeResponse: 'Dele todas las vueltas que quiera, Director. Pero el lunes necesitamos manos en la calle, no otra reunion para mirar el problema.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'AMARILLO_NEGOTIATION_PROACTIVE',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        initialDialogue: '(Entra a la oficina del Sector Amarillo. Hay cajas de insumos abiertas, listas de pacientes sobre la mesa y el equipo trabajando contra el tiempo).',
        nodes: [
          'AMARILLO_NEGOTIATION_1',
          'AMARILLO_NEGOTIATION_2',
          'AMARILLO_NEGOTIATION_3',
          'AMARILLO_NEGOTIATION_4',
        ],
        finalDialogue: 'Nosotros vamos a seguir saliendo a terreno, Director. Ojala la planificacion final se parezca mas a la realidad que a una planilla bonita.',
        consumesTime: false,
        triggerMap: { day: 4, slot: 'mañana' },
        isInevitable: false,
      },
];
