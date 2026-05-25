import type { MeetingSequence, ScenarioNode, ScenarioOption } from '../../../../../../../types';
import { mlqTags } from '../tags';

const nextOption = (dialogueResponse = ''): ScenarioOption => ({
  option_id: 'NEXT',
  cardTitle: 'Siguiente',
  cardEmoji: '➡️',
  text: 'Continuar',
  tags: mlqTags(),
  consequences: { dialogueResponse },
});

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D1S1_ARRIVAL',
    dialogue:
      '(Son las 7:55 AM. Llegas al CESFAM con una carpeta del SEREMI bajo el brazo. El edificio huele a cafe y antiseptico; pacientes esperan en los pasillos desde antes de las 8.)',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_SOFIA_WELCOME',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Buenos dias, director. Bienvenido. Soy Sofia Castro, su asistente administrativa. Vengo con informacion importante para dejarlo orientado en su primer dia.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_SOFIA_SECTORS',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Hoy el Centro de Salud trabaja en tres sectores: Sector Azul, Sector Rojo y Sector Amarillo. Cada uno tiene su propia jefatura, su equipo clinico y su forma de defender prioridades.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_SOFIA_PLANNING',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Este viernes tiene que quedar lista la planificacion que se va a usar el lunes. Siempre chocamos con pocos boxes, horas clinicas y administrativas, capacitaciones y salidas a terreno compitiendo por el mismo espacio.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_SOFIA_TASK',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Su trabajo es revisar propuestas, detectar topes y decidir que costo esta dispuesto a repartir. Si algo queda mal armado hoy, el lunes lo pagaremos en atencion, reclamos o conflicto interno. Los tres jefes de sector lo esperan en la sala de reuniones.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_ROOM_TONE',
    dialogue: '(El ambiente de la sala es relajado, pero serio. Las tres jefaturas traen carpetas abiertas y miradas atentas.)',
    participantIds: ['andres-guzman', 'marcela-soto', 'daniel-rios'],
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_N1_GUZMAN',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    participantIds: ['andres-guzman', 'marcela-soto', 'daniel-rios'],
    dialogue:
      'Director, traigo la propuesta del Sector Azul. Reservamos bloques criticos para sostener calidad tecnica y un espacio protegido para docencia. Si eso se cae, se cae algo mas que una agenda.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_N1_SOTO',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    participantIds: ['andres-guzman', 'marcela-soto', 'daniel-rios'],
    dialogue:
      'Un momento. En el Sector Rojo ya no tenemos margen para improvisar. Si alguien bloquea el box critico o vuelve a mover personal sin acuerdo, el lunes parte con problemas serios para mi sector.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S1_N1_RIOS_CHOICE',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: ['andres-guzman', 'marcela-soto', 'daniel-rios'],
    dialogue:
      'Mientras ustedes discuten criterios, en el Sector Amarillo estamos llegando con gente que no aguanta otra reagendacion. Si el lunes no aparece una salida real, me revienta la sala de espera.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Declarar principios',
        cardEmoji: '🤝',
        text:
          'Buen dia. Para comenzar, quiero recalcar que para que el CESFAM vaya por buen camino debemos mantener una atencion centrada en las personas, transparencia y trabajo en equipo.',
        tags: mlqTags({ "IIA": 4, "IIC": 4 }),
        consequences: {
          dialogueResponse: 'Me alegra escuchar eso.',
          response_stakeholder_id: 'andres-guzman',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Aprender primero',
        cardEmoji: '📘',
        text: 'Gracias por la bienvenida. Tengo muchas ganas de aprender y en los proximos dias ire conociendolo todo.',
        tags: mlqTags({ "MI": 2 }),
        consequences: {
          dialogueResponse: 'Me alegra escuchar eso.',
          response_stakeholder_id: 'andres-guzman',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Enfocar objetivos',
        cardEmoji: '🎯',
        text: 'Buenos dias a todos. Sofia Castro me comento los objetivos que tiene el CESFAM. Hay trabajo que hacer.',
        tags: mlqTags({ "RC": 2 }),
        consequences: {
          dialogueResponse: 'Me alegra escuchar eso.',
          response_stakeholder_id: 'andres-guzman',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D1S1_N2_GUZMAN_DOCENCIA',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    participantIds: ['andres-guzman', 'marcela-soto', 'daniel-rios'],
    dialogue:
      'Como dije, la docencia igual es importante. Tengo un proyecto docente con una universidad que ya lleva dos anos y que el director anterior apoyo a medias. Necesita respaldo real de direccion.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Vincular mision',
        cardEmoji: '🩺',
        text:
          'La docencia es parte de la mision del CESFAM. Considerare el proyecto para entender el impacto en la carga del equipo antes de decidir.',
        tags: mlqTags({ "IIC": 4, "MI": 2 }),
        consequences: {
          trustChange: 10,
          supportChange: 10,
          stakeholder_effects: {
            'marcela-soto': { supportChange: -5 },
          },
          dialogueResponse:
            'Con todo respeto, Andres, eso tambien consume horas de los medicos de turno. Debe tener eso en cuenta, director.',
          response_stakeholder_id: 'marcela-soto',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Postergar revision',
        cardEmoji: '⏳',
        text: 'Lo revisare, pero acabo de asumir el puesto. Tengo muchas prioridades que atender primero.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          dialogueResponse:
            'Con todo respeto, Andres, eso tambien consume horas de los medicos de turno. Debe tener eso en cuenta, director.',
          response_stakeholder_id: 'marcela-soto',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Exigir justificacion',
        cardEmoji: '📊',
        text:
          'Cualquier actividad extra necesita justificarse en carga asistencial antes de aceptarla. No podemos comprometer la atencion al publico.',
        tags: mlqTags({ "RC": 2 }),
        consequences: {
          supportChange: -5,
          stakeholder_effects: {
            'marcela-soto': { supportChange: 5 },
          },
          dialogueResponse:
            'Con todo respeto, Andres, eso tambien consume horas de los medicos de turno. Debe tener eso en cuenta, director.',
          response_stakeholder_id: 'marcela-soto',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D1S1_N3_RIOS_PROTOCOLS',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: ['andres-guzman', 'marcela-soto', 'daniel-rios'],
    dialogue:
      'Como va a manejar el tema de los protocolos? Porque aqui Soto los aplica al pie de la letra aunque eso signifique dejar a un paciente esperando.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Revisar formalmente',
        cardEmoji: '📘',
        text: 'Los protocolos son lo minimo, no el techo. Cuando no benefician al paciente hay que revisarlos formalmente, no ignorarlos.',
        tags: mlqTags({ "IIC": 2, "EI": 2 }),
        consequences: {
          trustChange: 5,
          supportChange: 5,
          dialogueResponse: 'Es algo que ha perjudicado principalmente al Sector Amarillo. Espero que lo pueda resolver.',
          response_stakeholder_id: 'daniel-rios',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Esperar contexto',
        cardEmoji: '⏳',
        text: 'Es un tema que ire conociendo. No quiero opinar al respecto sin tener mas contexto.',
        tags: mlqTags({ "LF": 4 }),
        consequences: {
          stakeholder_effects: {
            'marcela-soto': { trustChange: -5 },
          },
          dialogueResponse: 'Es algo que ha perjudicado principalmente al Sector Amarillo. Espero que lo pueda resolver.',
          response_stakeholder_id: 'daniel-rios',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Resguardar norma',
        cardEmoji: '📋',
        text: 'Los protocolos existen por alguna razon. Espero que se respeten en todos los sectores.',
        tags: mlqTags({ "DPE-A": 2 }),
        consequences: {
          stakeholder_effects: {
            'marcela-soto': { supportChange: 5 },
          },
          dialogueResponse: 'Es algo que ha perjudicado principalmente al Sector Amarillo. Espero que lo pueda resolver.',
          response_stakeholder_id: 'daniel-rios',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D1S1_N4_SOTO_INDICATORS',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    participantIds: ['andres-guzman', 'marcela-soto', 'daniel-rios'],
    dialogue: 'Me parece importante mencionar que el Sector Rojo tiene 100% de cumplimiento. Podemos empezar por ahi si quiere datos reales.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Conocer primero',
        cardEmoji: '📊',
        text:
          'Los indicadores son importantes, pero antes de sacar conclusiones me interesa conocer bien el funcionamiento del CESFAM.',
        tags: mlqTags({ "CI": 2, "EI": 2 }),
        consequences: {
          dialogueResponse: 'No hay problema, director.',
          response_stakeholder_id: 'marcela-soto',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Pedir resumen',
        cardEmoji: '📈',
        text: 'Eso es excelente. Por favor prepara un resumen del Sector Rojo para la tarde.',
        tags: mlqTags({ "RC": 2 }),
        consequences: {
          trustChange: 5,
          supportChange: 5,
          unlocks: {
            emails: ['mlq5x-d1-sequence-6-red-indicators-summary'],
          },
          dialogueResponse: 'No hay problema, director.',
          response_stakeholder_id: 'marcela-soto',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Extender estandar',
        cardEmoji: '🎯',
        text: 'Es algo que espero podamos lograr con todos los sectores.',
        tags: mlqTags({ "RC": 2 }),
        consequences: {
          supportChange: 5,
          dialogueResponse: 'No hay problema, director.',
          response_stakeholder_id: 'marcela-soto',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D1S1_N5_SOFIA_PRIORITY',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue: 'Director, con que jefe de sector prefiere reunirse primero en su oficina?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Primero Azul',
        cardEmoji: '🔵',
        text:
          'Me reunire primero con Guzman del Sector Azul. No quiero tener problemas con temas docentes por el beneficio que tienen para el CESFAM.',
        tags: mlqTags(),
        consequences: {
          dialogueResponse: 'Yo le avisare que va para su oficina, director.',
          expected_actions: [
            {
              mechanic_id: 'map',
              action_type: 'visit_stakeholder',
              target_ref: 'stakeholder:andres-guzman',
              constraints: { day: 'Wednesday', time_window: 'PM', grace_days: 0 },
              rule_id: 'visit_priority_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Priorizar reunion con Dr. Andres Guzman',
                description: 'Miercoles PM - primera visita de seguimiento',
              },
              effects: {
                TRUE: { stakeholder: { trust: 5, support: 5 } },
                FALSE: {
                  stakeholder: { trust: -10, support: -10 },
                  scheduled_email_events: [
                    { event_id: 'mlq5x-d2-sequence-7-guzman-broken-priority', day: 4, slot: 'mañana' },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Primero Rojo',
        cardEmoji: '🔴',
        text:
          'Avisele a Soto del Sector Rojo que ire a su oficina primero. Revisaremos lo asociado a los protocolos para que todo vaya en regla en el CESFAM.',
        tags: mlqTags(),
        consequences: {
          dialogueResponse: 'Yo le avisare que va para su oficina, director.',
          expected_actions: [
            {
              mechanic_id: 'map',
              action_type: 'visit_stakeholder',
              target_ref: 'stakeholder:marcela-soto',
              constraints: { day: 'Wednesday', time_window: 'PM', grace_days: 0 },
              rule_id: 'visit_priority_rule_v1',
              stakeholder_id: 'marcela-soto',
              ui: {
                title: 'Priorizar reunion con Enf. Marcela Soto',
                description: 'Miercoles PM - primera visita de seguimiento',
              },
              effects: {
                TRUE: { stakeholder: { trust: 5, support: 5 } },
                FALSE: {
                  stakeholder: { trust: -10, support: -10 },
                  scheduled_email_events: [
                    { event_id: 'mlq5x-d2-sequence-7-soto-broken-priority', day: 4, slot: 'mañana' },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Primero Amarillo',
        cardEmoji: '🟡',
        text:
          'Primero ire a la oficina de Rios del Sector Amarillo. Quiero revisar todo lo asociado a los pacientes antes de tomar cualquier decision.',
        tags: mlqTags(),
        consequences: {
          dialogueResponse: 'Yo le avisare que va para su oficina, director.',
          expected_actions: [
            {
              mechanic_id: 'map',
              action_type: 'visit_stakeholder',
              target_ref: 'stakeholder:daniel-rios',
              constraints: { day: 'Wednesday', time_window: 'PM', grace_days: 0 },
              rule_id: 'visit_priority_rule_v1',
              stakeholder_id: 'daniel-rios',
              ui: {
                title: 'Priorizar reunion con Daniel Rios',
                description: 'Miercoles PM - primera visita de seguimiento',
              },
              effects: {
                TRUE: { stakeholder: { trust: 5, support: 5 } },
                FALSE: {
                  stakeholder: { trust: -10, support: -10 },
                  scheduled_email_events: [
                    { event_id: 'mlq5x-d2-sequence-7-rios-broken-priority', day: 4, slot: 'mañana' },
                  ],
                },
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
    sequence_id: 'MLQ5X_D1_SEQUENCE_1',
    initialDialogue: '(Comienza tu primer dia como director del CESFAM. Sofia Castro te conduce hacia la sala donde esperan los tres jefes de sector.)',
    nodes: [
      'MLQ5X_D1S1_ARRIVAL',
      'MLQ5X_D1S1_SOFIA_WELCOME',
      'MLQ5X_D1S1_SOFIA_SECTORS',
      'MLQ5X_D1S1_SOFIA_PLANNING',
      'MLQ5X_D1S1_SOFIA_TASK',
      'MLQ5X_D1S1_ROOM_TONE',
      'MLQ5X_D1S1_N1_GUZMAN',
      'MLQ5X_D1S1_N1_SOTO',
      'MLQ5X_D1S1_N1_RIOS_CHOICE',
      'MLQ5X_D1S1_N2_GUZMAN_DOCENCIA',
      'MLQ5X_D1S1_N3_RIOS_PROTOCOLS',
      'MLQ5X_D1S1_N4_SOTO_INDICATORS',
      'MLQ5X_D1S1_N5_SOFIA_PRIORITY',
    ],
    finalDialogue: 'Queda definida la primera visita de seguimiento. Revise tambien su correo: hay una solicitud de reserva de box del Sector Azul.',
    consumesTime: false,
    triggerMap: { day: 3, slot: 'mañana' },
    isInevitable: true,
  },
];
