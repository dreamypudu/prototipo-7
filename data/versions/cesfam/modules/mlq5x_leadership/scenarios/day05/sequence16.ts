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
          expected_actions: [
            {
              mechanic_id: 'delegation',
              action_type: 'delegate_task',
              target_ref: 'task:formalizar_internos',
              rule_id: 'delegate_task_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Delegar: formalización de internos no registrados',
                description: 'Te comprometiste a ayudar a formalizar a los internos. Llama a Sofía Castro (teléfono) para delegar el trámite.',
              },
            },
          ],
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
      'Para sostener cupos de practica clinica necesito dos cosas: avanzar en el convenio universitario y reservar Box 1 los martes AM para supervision docente. Sin ese bloque, la actividad docente queda dependiendo de improvisaciones semanales.',
    contextualDialogue: [
      {
        when: {
          all: [
            {
              kind: 'decision_choice',
              nodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
              optionId: 'A',
            },
          ],
        },
        position: 'before',
        text: 'Como usted me pidio confirmar a la universidad que mantendriamos los cupos, necesito que esa senal ahora tenga respaldo operativo.',
      },
      {
        when: {
          all: [
            {
              kind: 'decision_choice',
              nodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
              optionId: 'B',
            },
          ],
        },
        position: 'before',
        text: 'Usted me dijo que gestionaria la labor docente; esta es la decision concreta que permite hacerla viable.',
      },
      {
        when: {
          all: [
            {
              kind: 'decision_choice',
              nodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
              optionId: 'C',
            },
          ],
        },
        position: 'before',
        text: 'Como todavia no hubo una respuesta clara para la universidad, necesito saber si vamos a sostener estos cupos o no.',
      },
    ],
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
          expected_actions: [
            {
              mechanic_id: 'scheduler',
              action_type: 'execute_week',
              target_ref: 'global',
              constraints: { room_id: 'BOX_1', target_sector_id: 'AZUL', day_name: 'Martes', time_window: 'AM' },
              rule_id: 'reserve_room_for_sector_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Planificacion: reservar Box 1 para Sector Azul / supervision docente de Dr. Andres Guzman - Martes AM',
                description: 'En la grilla semanal, dejar Box 1 asignado al Sector Azul el Martes AM para sostener la supervision docente comprometida con Guzman.',
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
          expected_actions: [
            {
              mechanic_id: 'scheduler',
              action_type: 'execute_week',
              target_ref: 'global',
              constraints: { room_id: 'BOX_1', target_sector_id: 'AZUL', day_name: 'Martes', time_window: 'AM' },
              rule_id: 'reserve_room_for_sector_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Planificacion: reservar Box 1 para Sector Azul / supervision docente de Dr. Andres Guzman - Martes AM',
                description: 'En la grilla semanal, dejar Box 1 asignado al Sector Azul el Martes AM para sostener la supervision docente comprometida con Guzman.',
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
          trustChange: -15,
          supportChange: -15,
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
