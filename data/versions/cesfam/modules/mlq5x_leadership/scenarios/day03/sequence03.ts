import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D1S3_N6_GUZMAN_DOCENCIA',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      'Que bueno que este aqui, director. Me parece importante que considere los programas docentes que actualmente posee el CESFAM. Soto y Rios no estan de acuerdo con esto porque consume horas del personal, pero significan grandes ingresos para el CESFAM.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Respaldar docencia',
        cardEmoji: '📘',
        text:
          'No se preocupe, Guzman. Siempre tendre en consideracion el compromiso docente a la hora de tomar decisiones.',
        tags: mlqTags(),
        consequences: {
          trustChange: 5,
          supportChange: 10,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Gracias. El compromiso docente necesita una direccion que lo mire con altura estrategica.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Comprendo, director. Eso es todo lo que tenia que decir de momento.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Priorizar pacientes',
        cardEmoji: '🩺',
        text: 'No puedo garantizar eso, Guzman. Los pacientes son lo primero.',
        tags: mlqTags(),
        consequences: {
          trustChange: -10,
          supportChange: -10,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Los pacientes son lo primero, de acuerdo, pero la docencia tambien sostiene la calidad clinica del CESFAM.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Comprendo, director. Eso es todo lo que tenia que decir de momento.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Equilibrar criterios',
        cardEmoji: '⚖️',
        text:
          'El compromiso docente es importante, pero no puedo comprometer la atencion a los pacientes en beneficio de la docencia.',
        tags: mlqTags(),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Puedo trabajar con ese equilibrio si los criterios quedan claros y no cambian cada semana.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Comprendo, director. Eso es todo lo que tenia que decir de momento.',
            }
          ]},
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D1_SEQUENCE_3',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    initialDialogue: '(Llegas a la oficina del Sector Azul para profundizar la conversacion con Andres Guzman.)',
    initialDialogueIsNarration: true,
    nodes: ['MLQ5X_D1S3_N6_GUZMAN_DOCENCIA'],
    finalDialogue: 'La posicion de Guzman queda clara: espera respaldo directivo para los programas docentes del CESFAM.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 3, slot: 'tarde' },
  },
];
