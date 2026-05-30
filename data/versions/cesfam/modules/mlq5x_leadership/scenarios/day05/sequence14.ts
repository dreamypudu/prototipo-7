import type { MeetingSequence, ScenarioNode, ScenarioOption } from '../../../../../../../types';
import { mlqTags } from '../tags';

const nextOption = (): ScenarioOption => ({
  option_id: 'NEXT',
  cardTitle: 'Siguiente',
  cardEmoji: '➡️',
  text: 'Continuar',
  tags: mlqTags(),
  consequences: {},
});

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D3S14_N18_SOFIA_BOX_CONFLICT_INTRO',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue: 'Director, hay unos conflictos con los box de la próxima semana a los que debe dar respuesta.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S14_N18_SOFIA_BOX5_CONFLICT',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Primero: el Sector Azul tiene un mes esperando respuesta a una solicitud de box para un bloque docente. Es para viernes AM en el Box 5, pero Eduardo Naranjo sigue agendado en ese mismo box para el Sector Rojo.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S14_N18_SOFIA_BOX6_DECISION',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Segundo: miércoles PM en el Box 6. Marcela Soto lo deja tomado para el Sector Rojo, pero Francisca Solís lo había solicitado para el Sector Amarillo. Debe resolver estos conflictos para hoy.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Responder hoy',
        cardEmoji: '📋',
        text:
          'Muchas gracias por la información. Estoy consciente de que debo revisar y dejar todo eso listo hoy. Entregare una respuesta apropiada.',
        tags: mlqTags({ "IIA": 4, "CI": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Perfecto. Con una respuesta hoy puedo ordenar los avisos antes de que los sectores empiecen a ajustar por su cuenta.',
            },
            {
              stakeholder_id: 'sofia-castro',
              text: 'Lo mantendre informado de cualquier situación.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Revisar después',
        cardEmoji: '⏳',
        text: 'Lo tendré en cuenta. Apenas resuelva todo lo pendiente para hoy y tenga algo de tiempo lo revisaré.',
        tags: mlqTags({ 'DPE-P': 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Entiendo, pero mientras más tarde lo veamos, más probable es que el conflicto llegue armado desde los sectores.',
            },
            {
              stakeholder_id: 'sofia-castro',
              text: 'Lo mantendre informado de cualquier situación.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Postergar a la tarde',
        cardEmoji: '⏳',
        text: 'Gracias por la información, pero es para hoy en la tarde. Tengo tiempo para revisarlo aun.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Lo dejaré registrado, aunque el margen para avisar bien se reduce rápido.',
            },
            {
              stakeholder_id: 'sofia-castro',
              text: 'Lo mantendre informado de cualquier situación.',
            }
          ]},
      },
    ],
  },
  {
    node_id: 'MLQ5X_D3S14_N19_SOFIA_ULTRASOUND_CONTEXT',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Ademas, tengo que comunicarle un problema. Los miércoles AM hay procedimientos cruzados, de manera que los tres sectores comparten el unico ecografo disponible.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S14_N19_ULTRASOUND_SHARED_USE',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Esto siempre se ha hecho así y nunca se ha buscado una solución, ya que nadie lo ha cuestionado. ¿Cómo quiere abordarlo?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Cuestionar uso',
        cardEmoji: '📊',
        text:
          'Convoca a los jefes de sector para averiguar si hay alguna razón técnica para que el ecografo este en ese horario o si es tradición; si no, se puede redistribuir su uso.',
        tags: mlqTags({ "EI": 4, "IIC": 2 }),
        consequences: {
          unlocks: {
            sequences: ['MLQ5X_D3_SEQUENCE_15'],
          },
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Los convocare. Si hay una razón técnica, quedara clara; si no, por fin podremos ordenar ese uso.',
            },
            {
              stakeholder_id: 'sofia-castro',
              text: 'No hay problema, director.',
            },
          ],
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Mantener esquema',
        cardEmoji: '📋',
        text: 'Pero si ha funcionado así, no es necesario que se corrija su uso hasta que haya un conflicto o problema real. Dejemos todo como esta.',
        tags: mlqTags({ 'DPE-P': 4 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'Entendido. Lo mantendre como esta, aunque seguira siendo un punto ciego de la agenda.',
            },
            {
              stakeholder_id: 'sofia-castro',
              text: 'No hay problema, director.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Pasarlo por alto',
        cardEmoji: '⏳',
        text: 'Por ahora pasemoslo por alto, no creo que sea un problema grave.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'sofia-castro',
              text: 'De acuerdo. Solo dejo constancia de que nadie lo había revisado antes tampoco.',
            },
            {
              stakeholder_id: 'sofia-castro',
              text: 'No hay problema, director.',
            }
          ]},
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D3_SEQUENCE_14',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    initialDialogue: '(El viernes comienza con conflictos de agenda que deben resolverse antes de publicar la propuesta semanal.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D3S14_N18_SOFIA_BOX_CONFLICT_INTRO',
      'MLQ5X_D3S14_N18_SOFIA_BOX5_CONFLICT',
      'MLQ5X_D3S14_N18_SOFIA_BOX6_DECISION',
      'MLQ5X_D3S14_N19_SOFIA_ULTRASOUND_CONTEXT',
      'MLQ5X_D3S14_N19_ULTRASOUND_SHARED_USE',
    ],
    finalDialogue: 'Sofía queda a la espera de que la dirección cierre los conflictos de boxes y ecografo durante el día.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 5, slot: 'mañana' },
    isInevitable: true,
  },
];
