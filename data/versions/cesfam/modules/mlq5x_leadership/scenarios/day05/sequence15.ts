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

const sectorHeads = ['andres-guzman', 'marcela-soto', 'daniel-rios'];

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D3S15_CHIEFS_ENTER',
    participantIds: sectorHeads,
    dialogue: '(Entran los tres jefes de sector.)',
    dialogueIsNarration: true,
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S15_N20_GUZMAN_ULTRASOUND',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    participantIds: sectorHeads,
    dialogue: '¿Esta reunión es por el uso del ecografo?',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S15_N20_SOTO_ULTRASOUND',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    participantIds: sectorHeads,
    dialogue: 'Si. La verdad, a pesar de que sea el unico disponible, nunca he tenido ningún inconveniente mayor.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S15_N20_RIOS_ULTRASOUND',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: sectorHeads,
    dialogue: 'Es cierto. Considerando las limitaciones del CESFAM, creo que podemos seguir bien como estamos.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S15_N20_GUZMAN_KEEP_NORMAL',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    participantIds: sectorHeads,
    dialogue: 'Opino que todo siga normal. Esto no ha causado ningún impacto clínico.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S15_N20_RIOS_ROTATING_SHIFTS',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: sectorHeads,
    dialogue:
      'Estoy de acuerdo. Cambiando de tema, quería aprovechar la oportunidad para proponer un sistema de turnos rotativos semanales en el Sector Amarillo. Lo probe informalmente el mes pasado y funciono.',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D3S15_N20_SOTO_ROTATING_SHIFTS_DECISION',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    participantIds: sectorHeads,
    dialogue: 'De acuerdo con el reglamento, los turnos deben seguir un esquema fijo aprobado por dirección. Esto viola el reglamento.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Ponderar evidencia',
        cardEmoji: '⚖️',
        text:
          'Ambas perspectivas tienen peso. Es importante leer el reglamento antes de decidir; sin embargo, si la propuesta de Ríos funciona, debe tenerse en cuenta.',
        tags: mlqTags({ "EI": 2, "CI": 2 }),
        consequences: {
          supportChange: -10,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Si se va a considerar una excepcion, necesito que el reglamento no quede como una sugerencia.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Eso es todo lo que pido: que si algo funciona en terreno, se mire antes de descartarlo.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Es importante que lo considere, director. Es algo que podría tener buenas consecuencias para el Sector Amarillo.',
            }
          ]
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Aplicar reglamento',
        cardEmoji: '📋',
        text: 'Lamentablemente si viola el reglamento no puede aplicarse hasta que se modifique formalmente.',
        tags: mlqTags({ 'DPE-A': 2 }),
        consequences: {
          supportChange: 10,
          stakeholder_effects: {
            'daniel-rios': { trustChange: -5, supportChange: -5 },
          },
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Gracias. El reglamento existe para que los turnos no dependan de ensayos informales.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Entiendo la regla, pero entonces nunca vamos a probar una salida aunque el equipo ya haya visto que funciona.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Es importante que lo considere, director. Es algo que podría tener buenas consecuencias para el Sector Amarillo.',
            }
          ]
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Revisar reglamento',
        cardEmoji: '📊',
        text: 'El reglamento puede revisarse, sobre todo si hay evidencia de que algo funciona mejor.',
        tags: mlqTags({ "EI": 2 }),
        consequences: {
          stakeholder_effects: {
            'daniel-rios': { supportChange: 10 },
          },
          bridgeResponse: [
            {
              stakeholder_id: 'daniel-rios',
              text: 'Eso abre una puerta real para el equipo. Podemos traer evidencia y ordenar la propuesta.',
            },
            {
              stakeholder_id: 'marcela-soto',
              text: 'Estoy dispuesta a revisar, pero tiene que hacerse por una vía formal y trazable.',
            },
            {
              stakeholder_id: 'daniel-rios',
              text: 'Es importante que lo considere, director. Es algo que podría tener buenas consecuencias para el Sector Amarillo.',
            }
          ]
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D3_SEQUENCE_15',
    initialDialogue: '(La decisión de revisar el uso del ecografo convoca a los tres jefes de sector durante la tarde.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D3S15_CHIEFS_ENTER',
      'MLQ5X_D3S15_N20_GUZMAN_ULTRASOUND',
      'MLQ5X_D3S15_N20_SOTO_ULTRASOUND',
      'MLQ5X_D3S15_N20_RIOS_ULTRASOUND',
      'MLQ5X_D3S15_N20_GUZMAN_KEEP_NORMAL',
      'MLQ5X_D3S15_N20_RIOS_ROTATING_SHIFTS',
      'MLQ5X_D3S15_N20_SOTO_ROTATING_SHIFTS_DECISION',
    ],
    finalDialogue: 'La reunión deja abierta una discusion mayor: cuando la evidencia operacional tensiona el reglamento, la dirección debe decidir como aprender sin perder control.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 5, slot: 'tarde' },
    isContingent: true,
    requiresUnlock: true,
  },
];
