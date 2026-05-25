import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D2S9_N12_SOTO_WATER_CUT_FOLLOWUP',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    dialogue:
      'A pesar de los inconvenientes, logramos atender casi a la totalidad de los pacientes. Fue agotador, pero pudimos sobrellevar la situacion.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Reconocer equipo',
        cardEmoji: '🤝',
        text:
          'Atendieron a casi todos los pacientes pese al corte de agua; eso no pasa en cualquier CESFAM. Es merito de ustedes como equipo.',
        tags: mlqTags({ "MI": 4, "IIA": 2 }),
        consequences: {
          trustChange: 5,
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Gracias. El equipo hizo un esfuerzo real y necesitaba que alguien lo reconociera.',
            },
            {
              stakeholder_id: 'marcela-soto',
              text: 'Esperemos que para el proximo inconveniente al menos haya un aviso previo.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Mantener foco',
        cardEmoji: '🎯',
        text: 'Buen trabajo a todo el equipo. Ahora no hay que bajar los brazos para las actividades de la tarde.',
        tags: mlqTags({ "RC": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'De acuerdo. El reconocimiento ayuda, pero vamos a necesitar energia para sostener la tarde.',
            },
            {
              stakeholder_id: 'marcela-soto',
              text: 'Esperemos que para el proximo inconveniente al menos haya un aviso previo.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Seguir trabajando',
        cardEmoji: '⏳',
        text: 'Fue una gran jornada la de la manana, pero aun hay trabajo que hacer.',
        tags: mlqTags(),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'marcela-soto',
              text: 'Si, queda trabajo. Solo espero que no se invisibilice lo que costo sacar adelante la manana.',
            },
            {
              stakeholder_id: 'marcela-soto',
              text: 'Esperemos que para el proximo inconveniente al menos haya un aviso previo.',
            }
          ]},
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D2_SEQUENCE_9',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    initialDialogue: '(Te reunes con Marcela Soto durante la tarde para revisar como quedo la operacion del Sector Rojo tras el corte de agua.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D2S9_N12_SOTO_WATER_CUT_FOLLOWUP'],
    finalDialogue: 'Soto queda atenta a que direccion anticipe mejor las contingencias operativas del CESFAM.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 4, slot: 'tarde' },
  },
];
