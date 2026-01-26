import { ScenarioFile } from '../types';

// Plantilla inicial para la versión "Ley Karin".
// Rellena `scenarios` y `sequences` con los nodos y flujos específicos
// cuando se definan los casos y actores.
export const scenarios: ScenarioFile = {
  simulation_id: 'LEY_KARIN',
  scenarios: [
    // Ejemplo mínimo (descomentar y adaptar):
    // {
    //   node_id: 'LK_INTRO_1',
    //   stakeholderRole: 'Jefe Sector Azul',
    //   dialogue: 'Plantilla de diálogo inicial para Ley Karin.',
    //   options: [
    //     {
    //       option_id: 'A',
    //       text: 'Ejemplo de decisión',
    //       tags: { focus: 'cumplimiento' },
    //       consequences: {
    //         trustChange: 0,
    //         supportChange: 0,
    //         reputationChange: 0,
    //         dialogueResponse: 'Respuesta de ejemplo.'
    //       }
    //     }
    //   ]
    // }
  ],
  sequences: [
    // {
    //   sequence_id: 'LK_SEQ_INTRO',
    //   stakeholderRole: 'Jefe Sector Azul',
    //   nodes: ['LK_INTRO_1'],
    //   initialDialogue: 'Secuencia inicial Ley Karin.',
    //   finalDialogue: 'Cierre de la secuencia.',
    //   triggerMap: { day: 1, slot: 'mañana' },
    //   isInevitable: true
    // }
  ]
};
