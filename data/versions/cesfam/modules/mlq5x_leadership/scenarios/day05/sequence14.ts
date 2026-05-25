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
    node_id: 'MLQ5X_D3S14_N18_SOFIA_BOX_CONFLICT_INTRO',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue: 'Director, hay unos conflictos con los box de la proxima semana a los que debe dar respuesta.',
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
      'Segundo: miercoles PM en el Box 6. Marcela Soto lo deja tomado para el Sector Rojo, pero Francisca Solis lo habia solicitado para el Sector Amarillo. Debe resolver estos conflictos para hoy.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Responder hoy',
        cardEmoji: '📋',
        text:
          'Muchas gracias por la informacion. Estoy consciente de que debo revisar y dejar todo eso listo hoy. Entregare una respuesta apropiada.',
        tags: mlqTags({ "IIA": 4, "CI": 2 }),
        consequences: {
          dialogueResponse: 'Lo mantendre informado de cualquier situacion.',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Revisar despues',
        cardEmoji: '⏳',
        text: 'Lo tendre en cuenta. Apenas resuelva todo lo pendiente para hoy y tenga algo de tiempo lo revisare.',
        tags: mlqTags({ 'DPE-P': 2 }),
        consequences: {
          dialogueResponse: 'Lo mantendre informado de cualquier situacion.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Postergar a la tarde',
        cardEmoji: '⏳',
        text: 'Gracias por la informacion, pero es para hoy en la tarde. Tengo tiempo para revisarlo aun.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          dialogueResponse: 'Lo mantendre informado de cualquier situacion.',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D3S14_N19_SOFIA_ULTRASOUND_CONTEXT',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Ademas, tengo que comunicarle un problema. Los miercoles AM hay procedimientos cruzados, de manera que los tres sectores comparten el unico ecografo disponible.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S14_N19_ULTRASOUND_SHARED_USE',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    dialogue:
      'Esto siempre se ha hecho asi y nunca se ha buscado una solucion, ya que nadie lo ha cuestionado. Como quiere abordarlo?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Cuestionar uso',
        cardEmoji: '📊',
        text:
          'Convoca a los jefes de sector para averiguar si hay alguna razon tecnica para que el ecografo este en ese horario o si es tradicion; si no, se puede redistribuir su uso.',
        tags: mlqTags({ "EI": 4, "IIC": 2 }),
        consequences: {
          dialogueResponse: 'No hay problema, director.',
          unlocks: {
            sequences: ['MLQ5X_D3_SEQUENCE_15'],
          },
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Mantener esquema',
        cardEmoji: '📋',
        text: 'Pero si ha funcionado asi, no es necesario que se corrija su uso hasta que haya un conflicto o problema real. Dejemos todo como esta.',
        tags: mlqTags({ 'DPE-P': 4 }),
        consequences: {
          dialogueResponse: 'No hay problema, director.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Pasarlo por alto',
        cardEmoji: '⏳',
        text: 'Por ahora pasemoslo por alto, no creo que sea un problema grave.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          dialogueResponse: 'No hay problema, director.',
        },
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
    nodes: [
      'MLQ5X_D3S14_N18_SOFIA_BOX_CONFLICT_INTRO',
      'MLQ5X_D3S14_N18_SOFIA_BOX5_CONFLICT',
      'MLQ5X_D3S14_N18_SOFIA_BOX6_DECISION',
      'MLQ5X_D3S14_N19_SOFIA_ULTRASOUND_CONTEXT',
      'MLQ5X_D3S14_N19_ULTRASOUND_SHARED_USE',
    ],
    finalDialogue: 'Sofia queda a la espera de que la direccion cierre los conflictos de boxes y ecografo durante el dia.',
    consumesTime: false,
    triggerMap: { day: 5, slot: 'mañana' },
    isInevitable: true,
  },
];
