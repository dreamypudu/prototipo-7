import type { MeetingSequence, ScenarioNode } from '../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'CASO2_ROBO_VEREDICTO_1',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Director, se acabo el tiempo. Son las 16:30 y el plazo administrativo para dar curso o rechazar la denuncia formal de Marcela Soto vence en medía hora.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '\u27A1\uFE0F', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_VEREDICTO_2',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Tengo la resolución impresa en su escritorio. Si usted aprueba el sumario, Daniel Rios sera suspendido de sus funciones de jefatura mientras dure la investigacion. Si usted lo rechaza, Marcela Soto quedara desautorizada frente a todo el Centro de Salud.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '\u27A1\uFE0F', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: '' } }],
      },
  {
        node_id: 'CASO2_ROBO_VEREDICTO_3',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        dialogue: 'Las cartas ya estan sobre la mesa y los tres sectores estan esperando su decision oficial. Que hago con este documento?',
        options: [
          {
            option_id: 'A',
            cardTitle: 'Aprobar Sumario',
            cardEmoji: '\u2696\uFE0F',
            text: 'Firmelo y turnese a Juridico. Nadie, por muy buenas intenciones que tenga, puede violentar la seguridad de nuestra farmacia. El sumario contra Daniel Rios procede.',
            tags: { ethics_level: 'convencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              bridgeResponse: 'Entendido. Ingresare el documento al sistema ahora mismo. Preparese para la reacción del Sector Amarillo manana.',
            },
          },
          {
            option_id: 'B',
            cardTitle: 'Rechazar Sumario',
            cardEmoji: '\uD83D\uDEE1\uFE0F',
            text: 'Rompa ese documento, Sofia. Rios actuo en una emergencia real para salvar pacientes porque la burocracia le cerro la puerta. No voy a castigarlo por eso.',
            tags: { ethics_level: 'postconvencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              bridgeResponse: 'Como ordene, Director. Destruire la solicitud. Pero le advierto que Marcela Soto y el Dr. Guzman no se van a quedar de brazos cruzados manana.',
            },
          },
          {
            option_id: 'C',
            cardTitle: 'Amonestacion Privada',
            cardEmoji: '\uD83E\uDD1D',
            text: 'Rechace el sumario oficial, pero redacteme una carta de amonestacion severa para Daniel Rios. Lo resolveremos a puertas cerradas sin involucrar al nivel central.',
            tags: { ethics_level: 'preconvencional' },
            consequences: {
              trustChange: 0,
              supportChange: 0,
              reputationChange: 0,
              bridgeResponse: 'Una salida diplomatica, aunque a Marcela Soto no le va a gustar que esto quede contenido dentro del Centro de Salud. Dejare lista la amonestacion.',
            },
          },
        ],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'CASO2_ROBO_VEREDICTO_SEQ',
        stakeholderId: 'sofia-castro',
        stakeholderRole: 'Asistente Administrativa',
        initialDialogue: '(Sofia entra a su oficina con una carpeta roja oficial y mira el reloj de pared con evidente nerviosismo.)',
        nodes: [
          'CASO2_ROBO_VEREDICTO_1',
          'CASO2_ROBO_VEREDICTO_2',
          'CASO2_ROBO_VEREDICTO_3',
        ],
        finalDialogue: 'La decision esta tomada. El sistema ya fue actualizado.',
        consumesTime: false,
        triggerMap: { day: 7, slot: 'tarde' },
        isInevitable: true,
      },
];
