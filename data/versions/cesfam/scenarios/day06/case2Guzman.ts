import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'CASO2_ROBO_GUZMAN_1',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        dialogue: 'Director, que grata sorpresa. Pase, por favor. Supongo que viene buscando un poco de perspectiva en medio del circo que armaron esta tarde. Pongase comodo; el cafe esta recien hecho.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_GUZMAN_2',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        dialogue: 'Por supuesto que ya estoy enterado del conflicto entre Marcela Soto y Daniel Rios. En este Centro de Salud las paredes son de papel y los egos demasiado grandes como para guardar un secreto.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_GUZMAN_3',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        dialogue: 'Si me permite una observacion clinica, el nivel de ordinariez de este conflicto es inaudito. Marcela Soto trata la bodega como si fuera un regimiento y Daniel Rios decidio que la respuesta a un problema administrativo era actuar por la fuerza.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_GUZMAN_4',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        dialogue: 'Lo grave no es solo el antibiotico. Es el precedente. Si hoy alguien entra a la bodega central usando una llave antigua para sacar cajas a escondidas, mañana otro hara lo mismo con insumos mucho mas sensibles y todos fingiran sorpresa.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_GUZMAN_5',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        dialogue: 'Y mientras ellos juegan a la guerra tribal, el Sector Azul paga el costo. Marcela bloqueo el acceso a la farmacia central por su inventario de seguridad y mis internos de la Universidad no han podido retirar insumos para las curaciones programadas.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_GUZMAN_6',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        dialogue: 'Si el Decano se entera de que en este Centro de Salud el personal fuerza accesos y retira medicamentos sin cadena formal, el convenio puede resentirse. Usted tiene que dar una señal de autoridad clara. Necesito saber si va a castigar a Rios o si va a dejar que esto se normalice.',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Aliarse con Guzman',
            cardEmoji: '🏛️',
            text: 'Comparto su diagnóstico, doctor. La conducta de Daniel Rios no se puede validar. Voy a empujar una respuesta administrativa dura para restablecer el orden.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 15,
              supportChange: 10,
              reputationChange: 5,
              dialogueResponse: 'Una decision lucida. El centro necesita demostrar que todavía existe autoridad. Estare atento a que esa firmeza no se diluya mañana.',
              expected_actions: [
                {
                  mechanic_id: 'admin',
                  action_type: 'issue_summary',
                  target_ref: 'stakeholder:daniel-rios',
                  constraints: { day: 'Tuesday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'admin_decision_rule_v1',
                  ui: {
                    title: 'Respaldar Sumario contra Daniel Rios',
                    description: 'Guzman espera una senal institucional dura antes del miercoles.',
                  },
                  effects: {
                    TRUE: { stakeholder: { trust: 10, support: 5 } },
                    FALSE: { stakeholder: { trust: -20, support: -15 } },
                  },
                },
              ],
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Defender la urgencia',
            cardEmoji: '🩺',
            text: 'No voy a criminalizar a Daniel Rios por haber resuelto una urgencia clinica. El problema de fondo es que el sistema obligo a elegir entre papeleo y pacientes.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: -15,
              supportChange: -10,
              reputationChange: 0,
              dialogueResponse: 'Entonces la Direccion va a avalar el caos si viene envuelto en un discurso humanitario. No se sorprenda cuando la proxima crisis sea mas cara y bastante menos defendible.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Marcar distancia',
            cardEmoji: '🛑',
            text: 'Le pido que baje el tono, doctor Guzman. Yo decidire como se resuelve esta crisis y no voy a tomar medidas para complacer ni a la Universidad ni a ningun bloque interno.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -10,
              supportChange: -5,
              reputationChange: 0,
              dialogueResponse: 'Nadie le esta dando ordenes, Director. Solo le estoy describiendo como funciona el mundo real cuando la institucionalidad pierde el control. Permiso.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'CASO2_ROBO_GUZMAN_SEQ',
        stakeholderId: 'andres-guzman',
        stakeholderRole: 'Jefe Sector Azul',
        initialDialogue: '(El Dr. Guzman esta relajado en su sillon, leyendo un paper en su tablet. Apenas levanta la vista cuando usted entra.)',
        nodes: [
          'CASO2_ROBO_GUZMAN_1',
          'CASO2_ROBO_GUZMAN_2',
          'CASO2_ROBO_GUZMAN_3',
          'CASO2_ROBO_GUZMAN_4',
          'CASO2_ROBO_GUZMAN_5',
          'CASO2_ROBO_GUZMAN_6',
        ],
        finalDialogue: 'Cierre la puerta al salir, por favor. El ruido del pasillo interfiere con el poco pensamiento serio que queda en este edificio.',
        consumesTime: true,
        triggerMap: { day: 6, slot: 'tarde' },
        isInevitable: false,
      },
];
