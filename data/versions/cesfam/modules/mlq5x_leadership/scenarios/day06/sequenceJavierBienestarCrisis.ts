import type { MeetingSequence, ScenarioNode, ScenarioOption } from '../../../../../../../types';

// Escenario contingente de bienestar de Javier Castro (TENS Sector Azul) - desenlace CRISIS.
// Se dispara el Lunes AM (dia 6, slot 'mañana') cuando su carga clinica quedo >= 60%.
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
    node_id: 'MLQ5X_JAVIER_BIENESTAR_CRISIS_N1',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue: 'Director, ya vi la planificación de esta semana y no tomó en cuenta mi petición.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_CRISIS_N2',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue:
      'Se lo dije la semana pasada, ya no doy más. El viernes casi me pongo a llorar porque mientras atendía a un paciente tenía que correr a preparar una vía.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_CRISIS_N3',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue:
      'Mi cuerpo no aguanta este ritmo, no puedo hacer las cosas bien, estoy empezando a tener problemas con mis compañeros y ya ni siquiera duermo pensando en el desastre que me va a tocar al día siguiente.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_CRISIS_N4',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue: 'Siento que aquí solo importan los números y las metas, pero a nadie le importa que nos estemos reventando.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_JAVIER_BIENESTAR_CRISIS_N5',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    dialogue:
      'No me pida que aguante más, porque ya no puedo. No me tome más en consideración, porque desde mañana yo no soy más parte de este CESFAM.',
    options: [
      {
        option_id: 'NEXT',
        cardTitle: 'Siguiente',
        cardEmoji: '➡️',
        text: 'Siguiente',
        tags: {},
        consequences: { trustChange: -15, supportChange: -15, bridgeResponse: '' },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_JAVIER_BIENESTAR_CRISIS_SEQ',
    stakeholderId: 'javier-castro',
    stakeholderRole: 'TENS Sector Azul',
    initialDialogue: '(Javier entra a tu oficina. Tiene ojeras marcadas, los ojos vidriosos por la frustración y se le nota visiblemente alterado.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_JAVIER_BIENESTAR_CRISIS_N1',
      'MLQ5X_JAVIER_BIENESTAR_CRISIS_N2',
      'MLQ5X_JAVIER_BIENESTAR_CRISIS_N3',
      'MLQ5X_JAVIER_BIENESTAR_CRISIS_N4',
      'MLQ5X_JAVIER_BIENESTAR_CRISIS_N5',
    ],
    finalDialogue: '(Javier se levanta y sale de la oficina sin esperar respuesta.)',
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
          outcomeIn: [false],
        },
      ],
    },
  },
];
