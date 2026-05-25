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
    node_id: 'MLQ5X_D1S4_N7_RIOS_DERIVACION',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: ['daniel-rios', 'francisca-solis'],
    dialogue:
      'Le presento a Francisca Solis, nuestra enfermera. Antes que lo escuche como rumor de otro lado, queria informarle que ayer Francisca derivo a un paciente de 80 anos con dolor toracico porque el medico de turno no llego. No espero autorizacion. Eso es un problema para usted?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Validar decision clinica',
        cardEmoji: '🩺',
        text:
          'La decision clinica fue correcta. La idea es que podamos trabajar en un protocolo formal para proteger a todos cuando ocurra algo similar.',
        tags: mlqTags({ "IIC": 4, "CI": 2 }),
        consequences: {
          trustChange: 5,
          dialogueResponse: 'Esta bien, jefe.',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Pedir mas contexto',
        cardEmoji: '⏳',
        text: 'La verdad depende de cada caso. No puedo opinar sin mas informacion sobre los efectos de esa derivacion.',
        tags: mlqTags({ "LF": 2 }),
        consequences: {
          dialogueResponse: 'Esta bien, jefe.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Exigir autorizacion',
        cardEmoji: '📋',
        text:
          'Es importante que en el futuro espere autorizacion antes de actuar. Si la derivacion es incorrecta, puede perjudicar seriamente al CESFAM.',
        tags: mlqTags({ "DPE-A": 2 }),
        consequences: {
          dialogueResponse: 'Esta bien, jefe.',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D1S4_N8_RIOS_SANCION',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    participantIds: ['daniel-rios', 'francisca-solis'],
    dialogue: 'Va a aplicar algun tipo de sancion?',
    options: [
      {
        option_id: 'A',
        cardTitle: 'No sancionar',
        cardEmoji: '⚖️',
        text:
          'Su accion clinica fue correcta aunque el proceso administrativo no lo fue. Por ahora no aplicare ninguna sancion.',
        tags: mlqTags({ "CI": 4, "IIC": 2 }),
        consequences: {
          trustChange: 10,
          supportChange: 5,
          dialogueResponse: 'Es importante que considere la importancia de atender a los pacientes.',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Abrir proceso',
        cardEmoji: '📘',
        text: 'Iniciare un proceso y por ahora no hay sancion, pero es importante que siga los protocolos.',
        tags: mlqTags({ "DPE-A": 2 }),
        consequences: {
          dialogueResponse: 'Es importante que considere la importancia de atender a los pacientes.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Dejar antecedente',
        cardEmoji: '📋',
        text:
          'La situacion quedara en su historial. Es importante que en adelante aplique los protocolos para que no haya consecuencias formales.',
        tags: mlqTags({ "DPE-A": 2 }),
        consequences: {
          trustChange: -5,
          supportChange: -5,
          dialogueResponse: 'Es importante que considere la importancia de atender a los pacientes.',
        },
      },
    ],
  },
  {
    node_id: 'MLQ5X_D1S4_SOTO_ENTERS',
    participantIds: ['daniel-rios', 'francisca-solis', 'marcela-soto'],
    dialogue: '(Aparece Marcela Soto con una carpeta.)',
    options: [nextOption()],
  },
  {
    node_id: 'MLQ5X_D1S4_N9_SOTO_REPORTE',
    stakeholderId: 'marcela-soto',
    stakeholderRole: 'Jefa Sector Rojo',
    participantIds: ['daniel-rios', 'francisca-solis', 'marcela-soto'],
    dialogue:
      'Director, necesito informarle formalmente que Francisca Solis atendio sin medico presente ayer. Esto es una infraccion al protocolo de atencion de urgencias. Aqui traigo el reporte.',
    options: [
      {
        option_id: 'A',
        cardTitle: 'Integrar reporte',
        cardEmoji: '📘',
        text:
          'Gracias por el reporte. Ya tengo contexto del caso y habra un protocolo formal de actuacion lo antes posible.',
        tags: mlqTags({ "IIC": 2, "DPE-A": 2 }),
        consequences: {
          trustChange: 5,
          dialogueResponse: 'Que bueno que tenga presentes los protocolos, director.',
        },
      },
      {
        option_id: 'B',
        cardTitle: 'Postergar informe',
        cardEmoji: '⏳',
        text: 'Envieme el informe por escrito; durante la semana lo vere.',
        tags: mlqTags({ "DPE-P": 2 }),
        consequences: {
          supportChange: 5,
          dialogueResponse: 'Que bueno que tenga presentes los protocolos, director.',
        },
      },
      {
        option_id: 'C',
        cardTitle: 'Reafirmar protocolo',
        cardEmoji: '📋',
        text:
          'Tiene razon, efectivamente es una infraccion. De ahora en adelante me asegurare de que el protocolo se aplique siempre, sin excepcion.',
        tags: mlqTags({ "IIA": 2 }),
        consequences: {
          trustChange: 5,
          dialogueResponse: 'Que bueno que tenga presentes los protocolos, director.',
        },
      },
    ],
  },
];

export const sequences: MeetingSequence[] = [
  {
    sequence_id: 'MLQ5X_D1_SEQUENCE_4',
    stakeholderId: 'daniel-rios',
    stakeholderRole: 'Jefe Sector Amarillo',
    initialDialogue: '(Llegas a la oficina del Sector Amarillo para escuchar a Daniel Rios y su equipo.)',
    nodes: [
      'MLQ5X_D1S4_N7_RIOS_DERIVACION',
      'MLQ5X_D1S4_N8_RIOS_SANCION',
      'MLQ5X_D1S4_SOTO_ENTERS',
      'MLQ5X_D1S4_N9_SOTO_REPORTE',
    ],
    finalDialogue: 'La tension entre atencion oportuna y protocolo formal queda instalada entre los sectores Amarillo y Rojo.',
    consumesTime: false,
    triggerMap: { day: 3, slot: 'tarde' },
  },
];
