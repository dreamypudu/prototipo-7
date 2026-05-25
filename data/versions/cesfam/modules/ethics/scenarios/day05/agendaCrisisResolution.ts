import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'AGENDA_CRISIS_FRIDAY_1',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Director, llegamos al limite. El Servicio de Salud cierra el portal de recepcion de agendas en menos de una hora y necesitamos enviar la planificacion definitiva.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_FRIDAY_2',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Revise el sistema recien y nadie ha cedido de verdad. El Dr. Guzman sigue exigiendo el Box 5 para su docencia del viernes y Marcela Soto no piensa soltar ese mismo box para Eduardo Naranjo.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_FRIDAY_3',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Lo mismo pasa con el Box 6 del miercoles en la tarde. O queda para la auditoria sanitaria del Sector Rojo o queda para el triaje respiratorio del Sector Amarillo. Fisicamente no caben los dos equipos en el mismo box.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_FRIDAY_4',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Y por ultimo, Javier Castro. Paz Herrera lo espera para apoyar sus curaciones el lunes en la mañana, pero Daniel Rios sigue dando por hecho que se ira con el Sector Amarillo a terreno.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_FRIDAY_5',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Necesito que entre ahora mismo a la pestaña de Planificacion, resuelva estos topes arrastrando los bloques y presione Ejecutar Semana. Las consecuencias de lo que cierre hoy le van a explotar en la cara el lunes a primera hora.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { dialogueResponse: '' } }],
      },
  {
        node_id: 'AGENDA_CRISIS_FRIDAY_6',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Antes de que cierre la puerta y lo deje trabajar con la grilla, digame la verdad. Sabiendo todo lo que prometio y lo que probablemente va a tener que incumplir, como cree que le fue en esta primera semana gestionando a las jefaturas?',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Logre un equilibrio',
            cardEmoji: '⚖️',
            text: 'Creo que logre un equilibrio, Sofia. No todos van a salir conformes, pero el Centro de Salud puede seguir funcionando sin paralizarse.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 5,
              supportChange: 0,
              reputationChange: 5,
              dialogueResponse: 'Esa es la actitud que se necesita aqui. Ya veremos si las jefaturas opinan lo mismo cuando se publique la agenda final.',
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Fui estricto',
            cardEmoji: '📘',
            text: 'Fui estricto. Las reglas, los protocolos y la excelencia técnica estan para cumplirse, aunque eso tenga costo politico.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              dialogueResponse: 'Es una postura clara, pero arriesgada. Entonces preparese para reclamos formales de la comunidad y de los equipos.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Priorice la calle',
            cardEmoji: '❤️',
            text: 'Le di prioridad a los pacientes mas vulnerables y a la urgencia de la calle. Si eso trae sumarios o costos burocraticos, me hare cargo.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 5,
              dialogueResponse: 'La comunidad se lo puede reconocer, Director. El Ministerio y la Universidad, en cambio, no suelen ser tan generosos.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'AGENDA_CRISIS_RESOLUTION_SEQ',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        initialDialogue: '(Sofia entra a su oficina. Se ve tensa y mira el reloj insistente, como si ya no quedara margen para seguir posponiendo decisiones).',
        nodes: [
          'AGENDA_CRISIS_FRIDAY_1',
          'AGENDA_CRISIS_FRIDAY_2',
          'AGENDA_CRISIS_FRIDAY_3',
          'AGENDA_CRISIS_FRIDAY_4',
          'AGENDA_CRISIS_FRIDAY_5',
          'AGENDA_CRISIS_FRIDAY_6',
        ],
        finalDialogue: 'La herramienta de Planificacion lo esta esperando, Director. No lo retrase mas.',
        consumesTime: false,
        triggerMap: { day: 5, slot: 'tarde' },
        isInevitable: true,
      },
];
