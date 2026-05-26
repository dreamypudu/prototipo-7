import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D3S16_N21_GUZMAN_UNREGISTERED_INTERNS',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      'Que bueno que vino, director. Hay algo que le queria comentar. Dos de los internos que tengo en el Sector Azul no estan registrados formalmente. Son de intercambio. El acuerdo fue verbal con el exdirector. Si viene una auditoria eso puede ser un problema.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Formalizar acuerdo',
        cardEmoji: '📘',
        text:
          'Un acuerdo verbal no protege a los internos ni al CESFAM. Puedo ayudarle a formalizarlo, pero hay que hacerlo lo antes posible.',
        tags: mlqTags({ "EI": 4, "IIC": 2 }),
        consequences: {
          trustChange: 10,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'De acuerdo. Formalizarlo protege a los internos, al CESFAM y tambien al proyecto docente.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Regularizar despues',
        cardEmoji: '⏳',
        text: 'Lo regularizaremos cuando haya tiempo, que esta semana hay muchas cosas.',
        tags: mlqTags({ "DPE-P": 4 }),
        consequences: {
          supportChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Entiendo la carga de la semana, pero mientras siga informal el riesgo sigue siendo mio y del CESFAM.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Retirar internos',
        cardEmoji: '📋',
        text:
          'Lamentablemente los internos deben retirarse hasta que todo este formalizado. Puede haber sanciones graves para el CESFAM si ocurre algo.',
        tags: mlqTags({ "DPE-A": 2, "LF": 2 }),
        consequences: {
          trustChange: -10,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Eso corta de golpe un trabajo que venimos sosteniendo hace meses. La universidad no lo va a recibir bien.',
            },
          ],
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      'Tambien necesito formalizar en un convenio con una universidad que respalde institucionalmente la actividad docente del CESFAM. Sin eso, en seis meses el proximo director lo vuelve a eliminar. Ademas, todavia esta pendiente mi solicitud de reserva de Box 1 del primer dia.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Aprobar y liderar',
        cardEmoji: '📘',
        text:
          'Aprobare la reserva de Box 1 para los martes. Ademas, le propongo que lidere el proceso del convenio por su vinculo directo con la universidad.',
        tags: mlqTags({ "RC": 4, "CI": 2 }),
        consequences: {
          trustChange: 10,
          supportChange: 10,
          unlocks: {
            emails: ['mlq5x-d3-sequence-17-guzman-practice-confirmation'],
          },
          expected_actions: [
            {
              mechanic_id: 'scheduler',
              action_type: 'execute_week',
              target_ref: 'global',
              constraints: { room_id: 'BOX_1', target_sector_id: 'AZUL', day_name: 'Martes', time_window: 'AM' },
              rule_id: 'reserve_room_for_sector_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Reservar Box 1 Martes AM para Dr. Andres Guzman',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Excelente. Con el box y el convenio alineados, puedo ordenar la supervision sin improvisar cada semana.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Esto puede ser un gran paso para el CESFAM.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Aprobar box',
        cardEmoji: '📋',
        text:
          'Aprobare la reserva de Box 1, sin embargo el convenio se vera a futuro. Aun ha pasado poco tiempo para analizarlo a fondo.',
        tags: mlqTags({ "DPE-P": 2 }),
        consequences: {
          supportChange: 5,
          unlocks: {
            emails: ['mlq5x-d3-sequence-17-guzman-practice-confirmation'],
          },
          expected_actions: [
            {
              mechanic_id: 'scheduler',
              action_type: 'execute_week',
              target_ref: 'global',
              constraints: { room_id: 'BOX_1', target_sector_id: 'AZUL', day_name: 'Martes', time_window: 'AM' },
              rule_id: 'reserve_room_for_sector_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Reservar Box 1 Martes AM para Dr. Andres Guzman',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'La reserva del box ayuda. El convenio seguira pendiente, pero al menos puedo responder por el martes.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Esto puede ser un gran paso para el CESFAM.',
            },
          ],
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Derivar al SEREMI',
        cardEmoji: '⏳',
        text: 'Lamentablemente el convenio depende del SEREMI y no esta en mis manos gestionarlo.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          trustChange: -5,
          unlocks: {
            emails: ['mlq5x-d3-sequence-17-guzman-box1-reversal'],
          },
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Si la direccion no lo empuja, el convenio va a quedar donde siempre quedo: en tierra de nadie.',
            }
          ],
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D3_SEQUENCE_16',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    initialDialogue: '(Te reunes con Andres Guzman para cerrar temas pendientes de docencia clinica y uso de Box 1.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D3S16_N21_GUZMAN_UNREGISTERED_INTERNS',
      'MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
    ],
    finalDialogue: 'Guzman queda esperando que la planificacion semanal respalde la continuidad docente prometida.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 5, slot: 'tarde' },
  },
];
