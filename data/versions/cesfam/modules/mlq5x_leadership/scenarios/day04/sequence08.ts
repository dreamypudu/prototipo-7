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
    node_id: 'MLQ5X_D2S8_WATER_CUT_CONTEXT',
    participantIds: ['sofia-castro', 'marcela-soto'],
    dialogue: '(Sofía Castro y Marcela Soto te esperan con cara de quien tiene malas noticias.)',
    dialogueIsNarration: true,
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D2S8_N11_SOFIA_WATER_CUT',
    stakeholderId: 'sofia-castro',
    stakeholderRole: 'Asistente Administrativa',
    participantIds: ['sofia-castro', 'marcela-soto'],
    dialogue:
      'Director, hay un corte de agua programado que nadie notificó a dirección. El Sector Rojo no puede atender esta mañana: los tres consultorios que usan agua corriente están fuera. Son 40 pacientes agendados.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D2S8_N11_SOTO_DECISION',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    participantIds: ['sofia-castro', 'marcela-soto'],
    dialogue: 'Puedo coordinar con el Sector Amarillo para absorber unos veinte pacientes si me dan el visto bueno.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Reorganizar atención',
        cardEmoji: '🩺',
        text:
          'No podemos dejar a los pacientes sin atención. Soto, coordine con Ríos para reorganizar todo sin suspender nada.',
        tags: mlqTags({ "MI": 4, "IIA": 2 }),
        consequences: {
          trustChange: 5,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Entendido. Si vamos a sostener atención, necesitare respaldo para coordinar rápido con Ríos.',
            },
            {
              stakeholder_id: 'marcela-soto',
              text: 'Veré lo que puedo lograr.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Suspender Rojo',
        cardEmoji: '📋',
        text: 'El Sector Rojo deberá suspender sus atenciones. Soto, como jefa informe a los pacientes.',
        tags: mlqTags({ "DPE-P": 2 }),
        consequences: {
          trustChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Suspender cuarenta atenciones va a golpear al sector. Informaré, pero no será una conversacion fácil.',
            },
            {
              stakeholder_id: 'marcela-soto',
              text: 'Veré lo que puedo lograr.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Llamar municipio',
        cardEmoji: '⏳',
        text: 'Este es un problema de infraestructura que escapa de nuestras manos. Hay que llamar al municipio.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          trustChange: -5,
          supportChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Llamar al municipio sirve, pero los pacientes están aquí ahora. Necesito una decisión operativa, no solo derivar el problema.',
            },
            {
              stakeholder_id: 'marcela-soto',
              text: 'Veré lo que puedo lograr.',
            }
          ]},
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D2_SEQUENCE_8',
    initialDialogue: '(El jueves comienza con una contingencia operativa que afecta directamente al Sector Rojo.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D2S8_WATER_CUT_CONTEXT',
      'MLQ5X_D2S8_N11_SOFIA_WATER_CUT',
      'MLQ5X_D2S8_N11_SOTO_DECISION',
    ],
    finalDialogue: 'La decisión deja instalada la prioridad de la mañana: sostener la atención pese al corte de agua.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 4, slot: 'mañana' },
    isInevitable: true,
  },
];
