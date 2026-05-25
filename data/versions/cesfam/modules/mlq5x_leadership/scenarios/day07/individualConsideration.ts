import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D7_CONSIDERATION_1',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue: 'Director/a, no se si corresponde decirlo, pero siento que estoy quedando atras. Me cuesta pedir ayuda cuando todos estan mirando indicadores.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Acompanamiento individual',
        text: 'Reconocer la situacion, acordar apoyo especifico y hacer seguimiento sin exponerlo.',
        tags: { instrument: 'MLQ-5X', dimension: 'individualized_consideration', behavior: 'coaching_support' },
        consequences: {
          dialogueResponse: 'Gracias. Eso me permite pedir ayuda sin sentir que falle.',
          trustChange: 5,
          supportChange: 3,
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Normalizar presion',
        text: 'Decir que todos estan exigidos y que debe adaptarse al ritmo del centro.',
        tags: { instrument: 'MLQ-5X', dimension: 'passive_management', behavior: 'low_individual_attention' },
        consequences: {
          dialogueResponse: 'Entiendo. Voy a seguir intentando mantener el ritmo.',
          trustChange: -4,
          supportChange: -2,
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D7_CONSIDERATION_SEQ',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    initialDialogue: '(Javier pide una conversacion breve, visiblemente inseguro.)',
    nodes: ['MLQ5X_D7_CONSIDERATION_1'],
    finalDialogue: 'El cierre deja una medida clara de cuanto apoyo individual recibio el equipo vulnerable.',
    consumesTime: false,
    triggerMap: { day: 7, slot: 'mañana' },
  },
];
