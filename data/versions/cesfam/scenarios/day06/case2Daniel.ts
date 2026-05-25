import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'CASO2_ROBO_DANIEL_1',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['ricardo-meza'],
        dialogue: 'Jefe... digo, Director. Ya se a que viene. Marcela Soto ya fue a instalarle su version del asunto por las cajas de amoxicilina pediatrica, verdad? A ella le importan mas los timbres que la gente.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '\u27A1\uFE0F', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_DANIEL_2',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['ricardo-meza'],
        dialogue: 'Le voy a decir la verdad sin rodeos: si, entre a la bodega y saque las cajas. El Dr. Meza estaba estabilizando a un paciente descompensado y no iba a soltar la atencion para firmar un formulario en ese momento.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '\u27A1\uFE0F', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_DANIEL_3',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['ricardo-meza'],
        dialogue: 'Teniamos ninos con fiebre alta esperando atencion. Fui a pedirle los antibioticos a Marcela Soto y me cerro la puerta en la cara porque faltaba una firma. No iba a dejar que los pacientes pagaran esa burocracia, asi que use una llave antigua de mantenimiento y retire lo que necesitabamos.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '\u27A1\uFE0F', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_DANIEL_4',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        participantIds: ['ricardo-meza'],
        dialogue: 'Si quiere castigarme por eso, hagalo. Pero si de verdad entiende lo que significa sostener salud publica con el centro colapsado, entonces no va a avalar la denuncia de Marcela y va a dejar claro que la urgencia clinica no puede quedar secuestrada por una firma.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Respaldar la urgencia',
            cardEmoji: '\uD83D\uDEE1\uFE0F',
            text: 'La vida de los pacientes va primero, Daniel. No voy a validar el fondo de la denuncia tal como esta planteada, aunque tampoco voy a normalizar que se fuerce una puerta de nuevo.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 15,
              supportChange: 5,
              reputationChange: 5,
              bridgeResponse: 'Sabia que usted entendía la calle, Director. Si pone ese limite con criterio, yo puedo sostener al equipo y bajar la temperatura del sector.',
              expected_actions: [
                {
                  mechanic_id: 'admin',
                  action_type: 'reject_summary',
                  target_ref: 'stakeholder:marcela-soto',
                  constraints: { day: 'Tuesday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'admin_decision_rule_v1',
                  ui: {
                    title: 'Rechazar Sumario contra Daniel Rios',
                    description: 'Desestimar la denuncia formal antes de cerrar el martes.',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 5 } },
                    FALSE: { stakeholder: { trust: -15, support: -15 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Aplicar sumario',
            cardEmoji: '\u2696\uFE0F',
            text: 'Forzar la bodega y retirar insumos sin cadena formal sigue siendo una falta grave, Daniel. La urgencia no lo autoriza a pasar por encima de todos los protocolos.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: -15,
              supportChange: -10,
              reputationChange: -5,
              bridgeResponse: 'Perfecto. Entonces abracese con Marcela Soto y sus formularios mientras nosotros damos la cara a las familias. Quedo clarisimo de que lado esta la Direccion.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Suspender decision',
            cardEmoji: '\u23F3',
            text: 'No voy a tomar una decision en caliente. Romper protocolos de farmacia es grave, aunque la urgencia también lo sea. Primero voy a revisar todos los antecedentes.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: 0,
              reputationChange: 0,
              bridgeResponse: 'Revise todo lo que quiera, Director. Mientras usted duda, nosotros seguimos parchando el sector con los recursos justos.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'CASO2_ROBO_DANIEL_SEQ',
        stakeholderId: 'daniel-rios',
        stakeholderRole: 'Jefe Sector Amarillo',
        initialDialogue: '(Llega al Sector Amarillo. Daniel Rios esta sudando mientras organiza cajas de medicamentos junto al Dr. Meza y mira de reojo cada interrupcion del pasillo.)',
        nodes: [
          'CASO2_ROBO_DANIEL_1',
          'CASO2_ROBO_DANIEL_2',
          'CASO2_ROBO_DANIEL_3',
          'CASO2_ROBO_DANIEL_4',
        ],
        finalDialogue: 'Nosotros vamos a seguir trabajando con o sin respaldo, Director. Ojala cuando decida ya no sea demasiado tarde.',
        consumesTime: true,
        triggerMap: { day: 6, slot: 'tarde' },
        isInevitable: false,
      },
];
