import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';
import { mlqTags } from '../tags';

export const nodes: ScenarioNode[] = [
  {
    node_id: 'MLQ5X_D2S11_N16_GUZMAN_VISION',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      'Director, queria hacerle una pregunta: tiene una vision para este CESFAM? El anterior nunca tuvo una. Solo apagaba incendios.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Construir vision',
        cardEmoji: '🤝',
        text: 'Tengo una vision en construccion, pero necesito a todos como equipo para darle forma real.',
        tags: mlqTags({ "MI": 4, "IIC": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Esa es una base seria. Si hay vision, puedo aportar desde lo tecnico y la docencia.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Solo espero que esta direccion sea mejor que la anterior.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Pedir semanas',
        cardEmoji: '⏳',
        text: 'Aun estoy conociendo al equipo; necesito unas semanas para formularla.',
        tags: mlqTags(),
        consequences: {
          trustChange: -5,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Comprendo que este conociendo el lugar, pero el CESFAM ya lleva demasiado tiempo sin rumbo claro.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Solo espero que esta direccion sea mejor que la anterior.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'Guiarse por indicadores',
        cardEmoji: '📊',
        text: 'Mi vision es hacer bien lo que hay que hacer y los indicadores son la guia.',
        tags: mlqTags({ "RC": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Los indicadores sirven, pero no reemplazan una direccion que inspire hacia donde vamos.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Solo espero que esta direccion sea mejor que la anterior.',
            }
          ]},
      },
    ],
  },
  {
    node_id: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    dialogue:
      'Ademas, esta manana me escribio la coordinadora de practicas de la universidad preguntando si se mantendran los cupos de practica clinica. Me solicito una respuesta para antes del viernes.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Confirmar cupos',
        cardEmoji: '📘',
        text:
          'Guzman, por favor confirme el interes del CESFAM y la mantencion de los cupos. Estas practicas son una enorme oportunidad.',
        tags: mlqTags({ "IIA": 4, "IIC": 2 }),
        consequences: {
          trustChange: 10,
          expected_actions: [
            {
              mechanic_id: 'office',
              action_type: 'choose_future_option',
              target_ref: 'scenario_node:MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
              constraints: {
                target_node_id: 'MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1',
                accepted_option_ids: ['A', 'B'],
              },
              rule_id: 'future_dialogue_choice_rule_v1',
              stakeholder_id: 'andres-guzman',
              ui: {
                title: 'Sostener cupos de practica clinica',
                description: 'Viernes - en el nodo 22 elegir A o B para mantener una respuesta coherente a Guzman.',
              },
            },
          ],
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Perfecto. Con esa senal puedo responderle a la universidad con respaldo institucional.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Gracias, director.',
            }
          ]},
      },
      {
        option_id: 'B',
        cardTitle: 'Gestionar docencia',
        cardEmoji: '🎯',
        text:
          'Me encargare de gestionar la labor docente ya que los box son escasos; le avisare en cuanto tenga respuesta.',
        tags: mlqTags({ "MI": 2 }),
        consequences: {
          trustChange: 5,
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Me sirve que se haga cargo, aunque necesito una respuesta antes de que la universidad cierre la ventana.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Gracias, director.',
            }
          ]},
      },
      {
        option_id: 'C',
        cardTitle: 'No responder aun',
        cardEmoji: '⏳',
        text:
          'Todavia estoy en proceso de revision interna y verificando box disponibles; no puedo darle una respuesta aun.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          bridgeResponse: [
            {
              stakeholder_id: 'andres-guzman',
              text: 'Entiendo la revision, pero la universidad necesita una posicion. La ambiguedad tambien tiene costo.',
            },
            {
              stakeholder_id: 'andres-guzman',
              text: 'Gracias, director.',
            }
          ]},
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D2_SEQUENCE_11',
    stakeholderId: 'andres-guzman',
    stakeholderRole: 'Jefe Sector Azul',
    initialDialogue: '(Te reunes con Andres Guzman en el Sector Azul durante la tarde del jueves.)',
    initialDialogueIsNarration: true,
    nodes: [
      'MLQ5X_D2S11_N16_GUZMAN_VISION',
      'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
    ],
    finalDialogue: 'Guzman queda esperando una senal clara sobre la continuidad de la docencia clinica del CESFAM.',
    finalDialogueIsNarration: true,
    consumesTime: false,
    triggerMap: { day: 4, slot: 'tarde' },
  },
];
