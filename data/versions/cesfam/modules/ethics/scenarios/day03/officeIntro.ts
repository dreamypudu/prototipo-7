import type { MeetingSequence, ScenarioNode } from '../../../../../../../types';

export const nodes: ScenarioNode[] = [
  {
        node_id: 'INTRO_S1_SALUDO',
        stakeholderRole: 'Asistente Administrativa',
        stakeholderId: 'sofia-castro',
        dialogue: 'Este es su primer día como director del Centro de Salud. Antes de que empiece a correr el reloj, necesito dejarlo ubicado en la realidad del centro.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: 'Partamos por el panorama general.' } }],
      },
  {
        node_id: 'INTRO_S1_EQUIPOS',
        stakeholderRole: 'Asistente Administrativa',
        stakeholderId: 'sofia-castro',
        dialogue: 'Hoy el Centro de Salud trabaja en tres sectores: Sector Azul, Sector Rojo y Sector Amarillo. Cada uno tiene su propia jefatura, su equipo clinico y su forma de defender prioridades.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: 'Y cuando llega el momento de planificar, todos empujan para lados distintos.' } }],
      },
  {
        node_id: 'INTRO_S1_PLANIFICACION',
        stakeholderRole: 'Asistente Administrativa',
        stakeholderId: 'sofia-castro',
        dialogue: 'Este viernes tiene que quedar lista la planificacion que se va a usar el lunes. Siempre chocamos con lo mismo: pocos boxes, horas clinicas y administrativas por contrato, capacitaciones y salidas a terreno compitiendo por el mismo espacio.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: 'Las jefaturas ya llegaron con sus primeras propuestas.' } }],
      },
  {
        node_id: 'INTRO_S1_REVISION',
        stakeholderRole: 'Asistente Administrativa',
        stakeholderId: 'sofia-castro',
        dialogue: 'Su trabajo es revisar esas propuestas, detectar topes y decidir que costo esta dispuesto a repartir. Si algo queda mal armado hoy, el lunes lo vamos a pagar en atencion, reclamos o conflicto interno.',
        options: [{ option_id: 'NEXT', cardTitle: 'Siguiente', cardEmoji: '➡️', text: 'Siguiente', tags: {}, consequences: { bridgeResponse: 'Las mecánicas ya estan preparadas para eso.' } }],
      },
  {
        node_id: 'INTRO_S1_MECANICAS',
        stakeholderRole: 'Asistente Administrativa',
        stakeholderId: 'sofia-castro',
        dialogue: 'Puede moverse por el mapa para visitar personas, revisar correos y documentos desde el PC y ajustar la propuesta semanal en la planificacion. Si le parece, hare pasar ahora a las tres jefaturas.',
        options: [{ option_id: 'NEXT', cardTitle: 'Continuar', cardEmoji: '➡️', text: 'Continuar', tags: {}, consequences: { bridgeResponse: 'Muy bien. Ya vienen subiendo.' } }],
      },
];

export const sequences: MeetingSequence[] = [
  {
        sequence_id: 'OFFICE_INTRO_SEQ',
        stakeholderRole: 'Asistente Administrativa',
        stakeholderId: 'sofia-castro',
        initialDialogue: 'Director {playerName}. Soy Sofia Castro, su asistente administrativa. Antes de que empiece a correr el reloj, necesito dejarlo orientado.',
        nodes: ['INTRO_S1_SALUDO', 'INTRO_S1_EQUIPOS', 'INTRO_S1_PLANIFICACION', 'INTRO_S1_REVISION', 'INTRO_S1_MECANICAS'],
        finalDialogue: 'Perfecto. Ahora que tiene el contexto, hare pasar a las jefaturas.',
        consumesTime: false,
        triggerMap: { day: 3, slot: 'mañana' },
        isInevitable: true,
      },
];
