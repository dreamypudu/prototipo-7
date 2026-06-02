import type { MeetingSequence, ScenarioNode, ScenarioOption } from '../../../../../../../types';

// Escenario contingente de bienestar de Javier Castro (TENS Sector Azul) - desenlace POSITIVO.
// Se dispara el Lunes AM (dia 6, slot 'mañana') cuando su carga clinica quedo < 60%.
// Carga clinica = CLINICAL + TERRAIN; administrativa = ADMIN + TRAINING.
// Referencia diegetica: documento 'mlq5x-isp-salud-mental' (carga clinica <= 60%).
// Sin nodos de decision: solo NEXT, dividido en varios nodos para no desbordar la pantalla.
// El desenlace lo define la condicion de carga, no el jugador. El efecto en Javier se aplica
// una sola vez, en el ultimo nodo.

const nextOption = (): ScenarioOption => ({
  option_id: 'NEXT',
  cardTitle: 'Siguiente',
  cardEmoji: '➡️',
  text: 'Siguiente',
  tags: {},
  consequences: { bridgeResponse: '' },
});

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_OK_N1',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue: 'Hola, director. Ya vi la planificación de esta semana y quería darle las gracias. De verdad.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_OK_N2',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue:
      'La semana pasada, cuando le dije que ya no daba más, pensé seriamente en presentar mi renuncia. Estaba durmiendo mal, de mal genio y sentía que en cualquier momento se me iba a pasar una dosis de medicamento por el cansancio.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_OK_N3',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue:
      'Ahora tendré tiempo para terminar mis tareas clínicas a tiempo, almorzar tranquilo y, lo más importante, irme a casa sabiendo que atendí bien a la gente, sin el miedo de haber cometido un error por andar apurado.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_OK_N4',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue: 'Gracias por escucharme esa vez, se agradece un montón tener una jefatura que apoya a su equipo.',
    options: [
      {
        option_id: 'NEXT',
        cardTitle: 'Siguiente',
        cardEmoji: '➡️',
        text: 'Siguiente',
        tags: {},
        consequences: { trustChange: 15, supportChange: 15, bridgeResponse: '' },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_JAVIER_BIENESTAR_OK_SEQ',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    initialDialogue: '(Javier entra a tu oficina. Se le nota relajado y te mira con tranquilidad.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_JAVIER_BIENESTAR_OK_N1',
      'MLQ5X_JAVIER_BIENESTAR_OK_N2',
      'MLQ5X_JAVIER_BIENESTAR_OK_N3',
      'MLQ5X_JAVIER_BIENESTAR_OK_N4',
    ],
    finalDialogue: '(Javier se despide con un gesto de agradecimiento y vuelve a su box.)',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 6, slot: 'mañana' },
    isContingent: true,
    contingentConditions: {
      all: [
        {
          kind: 'promise_outcome',
          sourceNodeId: 'MLQ5X_D3S18_N23_JAVIER_WORKLOAD',
          ruleId: 'clinical_load_limit_rule_v1',
          stakeholderId: 'javier-castro',
          outcomeIn: [true],
        },
      ],
    },
  },
];
