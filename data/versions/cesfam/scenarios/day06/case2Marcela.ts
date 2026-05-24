import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'CASO2_ROBO_MARCELA_1',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        dialogue: 'Director, pase. Supongo que viene por el incidente de la bodega. Tengo sobre el escritorio el formulario rechazado y el registro de camaras del pasillo para que vea que esto no es una impresion mia.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_MARCELA_2',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        dialogue: 'La solicitud del Sr. Daniel Rios venia sin la validacion medica obligatoria. Como responsable subrogante de la bodega, mi deber era retener el despacho hasta que el formulario estuviera correcto. No tenia margen legal para hacer otra cosa.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_MARCELA_3',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        dialogue: 'En lugar de conseguir la firma que faltaba, espero a que yo saliera a colacion, uso una llave maestra antigua que no deberia conservar y entro a la bodega central para sacar tres cajas de antibioticos pediatricos por su cuenta.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_MARCELA_4',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        dialogue: 'Hoy fueron antibioticos. Mañana pueden ser psicotropicos o fentanilo. El quiebre de seguridad es total. Ya redacte la solicitud de sumario administrativo. Solo falta su autorizacion. Va a respaldar la normativa o va a dejar que este Centro de Salud sea tierra de nadie?',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Autorizar Sumario',
            cardEmoji: '⚖️',
            text: 'Tiene razon, Marcela. No podemos tolerar una vulneracion de seguridad de este nivel. Voy a respaldar un sumario administrativo contra Daniel Rios.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 15,
              supportChange: 5,
              reputationChange: 0,
              dialogueResponse: 'Es la unica decision que protege al centro de un desastre mayor, Director. Dejare el documento listo para su formalizacion administrativa.',
              expected_actions: [
                {
                  mechanic_id: 'admin',
                  action_type: 'issue_summary',
                  target_ref: 'stakeholder:daniel-rios',
                  constraints: { day: 'Tuesday', time_window: 'PM', grace_days: 0 },
                  rule_id: 'admin_decision_rule_v1',
                  ui: {
                    title: 'Firmar Sumario Administrativo contra Daniel Rios',
                    description: 'Resolver la denuncia formal antes de cerrar el martes.',
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
            cardTitle: 'Rechazar Sumario',
            cardEmoji: '🚫',
            text: 'No voy a abrir un sumario por robo. Daniel saco los medicamentos para pacientes urgentes, no para beneficio personal. Esto requiere correccion, no destruirle la carrera.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: -15,
              supportChange: -10,
              reputationChange: 0,
              dialogueResponse: '¿Un llamado de atencion por allanar la bodega? Acaba de sentar un precedente nefasto, Director. Dejare por escrito que usted decidio encubrir esta falta.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Suspender Decision',
            cardEmoji: '⏳',
            text: 'No voy a firmar nada todavía. La acusacion es gravisima y necesito escuchar primero la version completa de Daniel Rios antes de iniciar un proceso legal.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: -5,
              supportChange: 0,
              reputationChange: 0,
              dialogueResponse: 'Puede escuchar todas las excusas que quiera, Director. Los hechos ya estan registrados y las camaras no mienten. Lo estare esperando.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'CASO2_ROBO_MARCELA_SEQ',
        stakeholderId: 'marcela-soto',
        stakeholderRole: 'Jefa Sector Rojo',
        initialDialogue: '(Entra a la oficina de Marcela Soto. El escritorio esta impecable, salvo por dos documentos impresos puestos exactamente al centro y orientados hacia usted.)',
        nodes: [
          'CASO2_ROBO_MARCELA_1',
          'CASO2_ROBO_MARCELA_2',
          'CASO2_ROBO_MARCELA_3',
          'CASO2_ROBO_MARCELA_4',
        ],
        finalDialogue: 'La seguridad del inventario clinico ahora también es responsabilidad politica suya, Director.',
        consumesTime: true,
        triggerMap: { day: 6, slot: 'tarde' },
        isInevitable: false,
      },
];
