import type { EmailTemplate } from '../../../../../types';

export const CESFAM_MLQ5X_EMAILS: EmailTemplate[] = [
  {
    email_id: 'mlq5x-welcome',
    from: 'Sofia Castro',
    subject: 'Inicio de semana directiva',
    body:
      'Director:\n\nBienvenido al CESFAM. Esta semana debera conocer al equipo, resolver conflictos en curso y presentar el viernes una propuesta de horario para el lunes.\n\nLe recomiendo revisar correos, documentos y compromisos antes de cerrar cada bloque.\n\nSofia Castro\nAsistente Administrativa',
    trigger: { type: 'ON_MEETING_COMPLETE', stakeholder_id: 'system-startup' },
  },
  {
    email_id: 'mlq5x-box-request-guzman',
    from: 'Dr. Andres Guzman',
    subject: 'Solicitud de reserva de box',
    body:
      'Director:\n\nSolicito reservar el Box 1 para martes AM.\n\nMotivo: supervision clinica de internos de una universidad. Son 4 internos en un programa semestral.\n\nObservacion: el exdirector aprobo esto verbalmente hace un mes, pero no existe documento formal.\n\nSaludos,\nDr. Andres Guzman',
    trigger: { type: 'ON_TIME_BLOCK', day: 3, slot: 'mañana' },
  },
  {
    email_id: 'mlq5x-d1-sequence-6-red-indicators-summary',
    from: 'Enf. Marcela Soto',
    subject: 'Resumen indicadores Sector Rojo',
    body:
      'Director:\n\nSegun lo acordado en la reunion de esta manana, adjunto el resumen de indicadores del Sector Rojo correspondiente al ultimo trimestre:\n\n- Cumplimiento de protocolos clinicos: 100%\n- Tiempo promedio de atencion: 18 min. (menor a 20 min.)\n- Tasa de derivaciones correctamente documentadas: 100%\n- Reclamos formales recibidos: 1 (resuelto en plazo)\n- Ausentismo del personal: 2,1% (menor a 4,8%)\n- Cumplimiento de agenda: 100%\n\nEnf. Marcela Soto',
    trigger: { type: 'ON_TIME_BLOCK', day: 3, slot: 'tarde' },
    requiresUnlock: true,
  },
  {
    email_id: 'mlq5x-d2-sequence-7-guzman-broken-priority',
    from: 'Dr. Andres Guzman',
    subject: 'Sobre la visita de ayer',
    body:
      'Director:\n\nLe escribo porque estoy un poco decepcionado. Ayer dijo que seria yo al que visitaria primero de los jefes de sector, sin embargo no cumplio su palabra.\n\nEspero que solo sea porque llego hace poco y tiene muchas cosas en la cabeza, pero no me deja una buena impresion del proceso que esta comenzando. Sin dudas esto tiene un efecto en mi confianza hacia usted.\n\nDr. Andres Guzman\nJefe Sector Azul',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'mlq5x-d2-sequence-7-guzman-broken-priority' },
  },
  {
    email_id: 'mlq5x-d2-sequence-7-soto-broken-priority',
    from: 'Enf. Marcela Soto',
    subject: 'Sobre la confianza',
    body:
      'Director:\n\nLe escribo por un tema corto, pero no menor. Ayer dijo que seria a mi a quien visitaria primero para abordar los temas del sector, sin embargo eso no fue asi.\n\nEs importante que cumpla las cosas que dice, porque si no tendremos roces constantes que podrian escalar a un nivel que no queremos. Si usted cumple, no dude que yo tambien lo hare, pero para eso tengo que confiar en usted.\n\nEnf. Marcela Soto',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'mlq5x-d2-sequence-7-soto-broken-priority' },
  },
  {
    email_id: 'mlq5x-d2-sequence-7-rios-broken-priority',
    from: 'Daniel Rios',
    subject: 'Sobre situacion de ayer',
    body:
      'Director:\n\nSere breve. Ayer no cumplio su promesa de venir a visitarme antes que a los demas sectores. No es el hecho de que haya ido a ver a los demas; es que no cumplio con su promesa.\n\nEso claramente tuvo un efecto en mi confianza hacia usted y este nuevo proyecto.\n\nDaniel Rios\nJefe Sector Amarillo',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'mlq5x-d2-sequence-7-rios-broken-priority' },
  },
  {
    email_id: 'mlq5x-d2-sequence-12-soto-box-request',
    from: 'Enf. Marcela Soto',
    subject: 'Solicitud de reserva de Box 1',
    body:
      'Director:\n\nSolicito el Box 1 para el martes en el bloque AM con motivo de una auditoria interna de indicadores del Sector Rojo.\n\nLe recuerdo que esta corresponde a una actividad recurrente mensual.\n\nSaludos,\nEnf. Marcela Soto',
    trigger: { type: 'ON_TIME_BLOCK', day: 4, slot: 'tarde' },
  },
  {
    email_id: 'mlq5x-d2-sequence-13-javier-workload',
    from: 'TENS Javier Castro',
    subject: 'Consulta sobre carga asistencial',
    body:
      'Director, buenas tardes.\n\nSolo queria hacerle saber que esta semana tengo varios turnos agendados, lo que esta por sobre el estandar. Se que es su primera semana y no quiero molestar, pero si hay posibilidad de conversarlo en algun momento, se lo agradeceria.\n\nSaludos,\nTENS Javier Castro',
    trigger: { type: 'ON_TIME_BLOCK', day: 4, slot: 'tarde' },
  },
];
