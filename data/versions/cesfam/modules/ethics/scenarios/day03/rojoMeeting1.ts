import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'ROJO_MEETING_1_INTRO',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        participantIds: ['eduardo-naranjo', 'claudia-morales'],
        dialogue: 'Director, bienvenido. Soy Marcela Soto, enfermera y jefa del Sector Rojo. Queria aprovechar que asumio hoy para presentarle formalmente a mi equipo clinico.',
        options: [
          {
            option_id: 'NEXT',
            cardTitle: 'Siguiente',
            cardEmoji: '➡️',
            text: 'Mucho gusto. Tomen asiento, por favor.',
            tags: {},
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              dialogueResponse: 'Gracias. Seremos breves.',
            },
          },
        ],
      },
  {
        node_id: 'ROJO_MEETING_1_TEAM',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        participantIds: ['eduardo-naranjo', 'claudia-morales'],
        dialogue: 'El es el Dr. Eduardo Naranjo, nuestro medico. Y ella es Claudía Morales, nuestra TENS. Como vera, somos un equipo unido. Nuestro pilar es el apego estricto a la normativa y la proteccion de los derechos laborales. No toleramos improvisaciones que pongan en riesgo al personal.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Respeto las normas',
            cardEmoji: '⚖️',
            text: 'Me parece excelente, Marcela. El respeto a la normativa es fundamental para una buena gestion y cuidare de sus derechos laborales.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 5,
              reputationChange: 5,
              dialogueResponse: 'Me alivia escuchar eso de la nueva jefatura. Ya hemos tenido malas experiencias antes.',
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Cuidado con la rigidez',
            cardEmoji: '⚠️',
            text: 'Entiendo, pero espero que ese apego a la norma no se convierta en una excusa para no cumplir las metas asistenciales que nos exige el Ministerio.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: -10,
              reputationChange: -5,
              dialogueResponse: 'Nosotros no ponemos excusas, Director. Protegemos la salud mental de los funcionarios para poder atender de forma segura.',
            },
          },
        ],
      },
  {
        node_id: 'ROJO_MEETING_1_REQUEST',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        participantIds: ['eduardo-naranjo', 'claudia-morales'],
        dialogue: 'Precisamente sobre las metas y la carga laboral queria hablarle. Tenemos un tema delicado con las auditorias que prefiero tratar con los documentos en mano. Necesito que vaya a nuestro sector mañana jueves por la tarde para una reunion formal. Puede comprometerse a iré',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Me comprometo',
            cardEmoji: '✅',
            text: 'De acuerdo. Agendare la visita a su sector para mañana jueves en la tarde.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 0,
              reputationChange: 5,
              dialogueResponse: 'Perfecto. Lo estaremos esperando con los registros listos.',
              expected_actions: [
                {
                  mechanic_id: 'map',
                  action_type: 'visit_stakeholder',
                  target_ref: 'stakeholder:marcela-soto',
                  constraints: { day: 'Thursday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'visit_stakeholder_rule_v1',
                  ui: {
                    title: 'Visitar a Enf. Marcela Soto - Jueves PM',
                    description: 'Revision formal de auditorias en Sector Rojo',
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
            text: 'No puedo comprometerme a un día y hora exactos todavía. Tengo que revisar mi agenda completa y las urgencias de los otros sectores primero.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: 0,
              reputationChange: -5,
              dialogueResponse: 'Entiendo. Quedaremos a la espera entonces, aunque el tema es urgente y no seremos responsables por los atrasos.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'ROJO_MEETING_1_PROACTIVE',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        initialDialogue: '(Marcela Soto está acompañada de dos funcionarios de su sector. Su postura es formal y algo a la defensiva).',
        nodes: ['ROJO_MEETING_1_INTRO', 'ROJO_MEETING_1_TEAM', 'ROJO_MEETING_1_REQUEST'],
        finalDialogue: 'Bien, Director. Dejaremos que continue con su instalacion. Que tenga un buen día.',
        consumesTime: false,
        triggerMap: { day: 3, slot: 'tarde' },
        isInevitable: false,
      },
];
