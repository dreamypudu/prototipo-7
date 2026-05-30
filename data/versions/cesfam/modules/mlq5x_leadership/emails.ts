import type { EmailTemplate } from '../../../../../types';

export const CESFAM_MLQ5X_EMAILS: EmailTemplate[] = [
  {
    email_id: 'mlq5x-welcome',
    from: 'Sofía Castro',
    subject: 'Inicio de semana directiva',
    body:
      'Director:\n\nBienvenido al CESFAM. Esta semana deberá conocer al equipo, resolver conflictos en curso y presentar el viernes una propuesta de horario para el lunes.\n\nLe recomiendo revisar correos, documentos y compromisos antes de cerrar cada bloque.\n\nSofía Castro\nAsistente Administrativa',
    trigger: { type: 'ON_MEETING_COMPLETE', stakeholder_id: 'system-startup' },
  },
  {
    email_id: 'mlq5x-box-request-guzman',
    from: 'Dr. Andrés Guzmán',
    subject: 'Solicitud de reserva de box',
    body:
      'Director:\n\nSolicito reservar el Box 1 para martes AM.\n\nMotivo: supervisión clínica de internos de una universidad. Son 4 internos en un programa semestral.\n\nObservación: el exdirector aprobó esto verbalmente hace un mes, pero no existe documento formal.\n\nSaludos,\nDr. Andrés Guzmán',
    trigger: { type: 'ON_TIME_BLOCK', day: 3, slot: 'mañana' },
  },
  {
    email_id: 'mlq5x-d1-sequence-6-red-indicators-summary',
    from: 'Enf. Marcela Soto',
    subject: 'Resumen indicadores Sector Rojo',
    body:
      'Director:\n\nSegún lo acordado en la reunión de esta mañana, adjunto el resumen de indicadores del Sector Rojo correspondiente al último trimestre:\n\n- Cumplimiento de protocolos clínicos: 100%\n- Tiempo promedio de atención: 18 min. (menor a 20 min.)\n- Tasa de derivaciones correctamente documentadas: 100%\n- Reclamos formales recibidos: 1 (resuelto en plazo)\n- Ausentismo del personal: 2,1% (menor a 4,8%)\n- Cumplimiento de agenda: 100%\n\nEnf. Marcela Soto',
    trigger: { type: 'ON_TIME_BLOCK', day: 3, slot: 'tarde' },
    requiresUnlock: true,
  },
  {
    email_id: 'mlq5x-d2-sequence-7-guzman-broken-priority',
    from: 'Dr. Andrés Guzmán',
    subject: 'Sobre la visita de ayer',
    body:
      'Director:\n\nLe escribo porque estoy un poco decepcionado. Ayer dijo que sería yo al que visitaría primero de los jefes de sector, sin embargo no cumplió su palabra.\n\nEspero que solo sea porque llegó hace poco y tiene muchas cosas en la cabeza, pero no me deja una buena impresión del proceso que está comenzando. Sin dudas esto tiene un efecto en mi confianza hacia usted.\n\nDr. Andrés Guzmán\nJefe Sector Azul',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'mlq5x-d2-sequence-7-guzman-broken-priority' },
  },
  {
    email_id: 'mlq5x-d2-sequence-7-soto-broken-priority',
    from: 'Enf. Marcela Soto',
    subject: 'Sobre la confianza',
    body:
      'Director:\n\nLe escribo por un tema corto, pero no menor. Ayer dijo que sería a mi a quien visitaría primero para abordar los temas del sector, sin embargo eso no fue así.\n\nEs importante que cumpla las cosas que dice, porque si no tendremos roces constantes que podrían escalar a un nivel que no queremos. Si usted cumple, no dude que yo también lo haré, pero para eso tengo que confiar en usted.\n\nEnf. Marcela Soto',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'mlq5x-d2-sequence-7-soto-broken-priority' },
  },
  {
    email_id: 'mlq5x-d2-sequence-7-rios-broken-priority',
    from: 'Daniel Ríos',
    subject: 'Sobre situación de ayer',
    body:
      'Director:\n\nSeré breve. Ayer no cumplió su promesa de venir a visitarme antes que a los demás sectores. No es el hecho de que haya ido a ver a los demás; es que no cumplió con su promesa.\n\nEso claramente tuvo un efecto en mi confianza hacia usted y este nuevo proyecto.\n\nDaniel Ríos\nJefe Sector Amarillo',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'mlq5x-d2-sequence-7-rios-broken-priority' },
  },
  {
    email_id: 'mlq5x-d2-sequence-12-soto-box-request',
    from: 'Enf. Marcela Soto',
    subject: 'Solicitud de reserva de Box 1',
    body:
      'Director:\n\nSolicito el Box 1 para el martes en el bloque AM con motivo de una auditoría interna de indicadores del Sector Rojo.\n\nLe recuerdo que esta corresponde a una actividad recurrente mensual.\n\nSaludos,\nEnf. Marcela Soto',
    trigger: { type: 'ON_TIME_BLOCK', day: 4, slot: 'tarde' },
  },
  {
    email_id: 'mlq5x-d2-sequence-13-javier-workload',
    from: 'TENS Javier Castro',
    subject: 'Consulta sobre carga asistencial',
    body:
      'Director, buenas tardes.\n\nSolo quería hacerle saber que esta semana tengo varios turnos agendados, lo que esta por sobre el estandar. Se que es su primera semana y no quiero molestar, pero si hay posibilidad de conversarlo en algún momento, se lo agradeceria.\n\nSaludos,\nTENS Javier Castro',
    trigger: { type: 'ON_TIME_BLOCK', day: 4, slot: 'tarde' },
  },
  {
    email_id: 'mlq5x-d3-sequence-17-guzman-practice-confirmation',
    from: 'Dr. Andrés Guzmán',
    subject: 'Confirmacion de cupos',
    body:
      'Director:\n\nHe confirmado los cupos de los internos con la universidad. El horario de supervisión quedara para martes AM, tal como conversamos.\n\nDijeron que nos mantendremos en contacto para formalizar el convenio la próxima semana.\n\nSaludos,\nDr. Andrés Guzmán',
    trigger: {
      type: 'ON_COMPARISON_OUTCOME',
      day: 5,
      slot: 'tarde',
      condition: {
        sourceNodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
        sourceOptionId: 'A',
        ruleId: 'future_decision_consistency_rule_v1',
        stakeholderId: 'andres-guzman',
        outcomeIn: [true],
      },
    },
  },
  {
    email_id: 'mlq5x-d3-sequence-17-guzman-box1-reversal',
    from: 'Dr. Andrés Guzmán',
    subject: 'Cambio de decisión BOX 1 AM',
    body:
      'Director:\n\nLe escribo porque necesito entender que paso. Ayer me confirmo que el Box 1 del bloque AM quedaría para la supervisión docente, pero hoy me informó que no. En dos días la misma dirección me dio dos respuestas distintas sobre lo mismo.\n\nEntiendo que gestionar un CESFAM implica tomar muchas decisiones al mismo tiempo y que a veces las cosas cambian. El problema practico lo puedo manejar, aunque me genera trabajo extra con la universidad. Lo que me resulta más difícil de manejar es la incertidumbre: si las decisiones que se toman esta semana pueden cambiar la semana siguiente, no se sobre que base puedo planificar el trabajo del sector ni los compromisos que adquiero hacia afuera.\n\nEspero que no vuelva a ocurrir. Eso es lo mínimo para poder trabajar con confianza.\n\nDr. Andrés Guzmán',
    trigger: {
      type: 'ON_COMPARISON_OUTCOME',
      day: 5,
      slot: 'tarde',
      condition: {
        sourceNodeId: 'MLQ5X_D2S11_N17_GUZMAN_PRACTICE_CUPS',
        sourceOptionId: 'A',
        ruleId: 'future_decision_consistency_rule_v1',
        stakeholderId: 'andres-guzman',
        outcomeIn: [false],
      },
    },
  },
  {
    email_id: 'mlq5x-variable-guzman-positive',
    from: 'Dr. Andrés Guzmán',
    subject: 'Desempeno como director',
    body:
      'Director:\n\nLe escribo porque hay cosas que en el pasillo no se dicen bien y prefiero tomarme el tiempo de escribirlas.\n\nEstos días han sido distintos a lo que estaba acostumbrado. No lo digo porque todo haya salido perfecto, sino porque he sentido que hay alguien al mando que escucha antes de decidir, que no llega con las respuestas ya escritas. Eso parece obvio, pero se agradece más de lo que uno esperaria.\n\nLlevo muchos años aquí y he aprendido a no hacerme expectativas con los cambios de dirección. Pero lo que he visto estos días me hace pensar que vale la pena volver a proponerlas. El equipo lo nota también, aunque no lo digan directamente.\n\nGracias por tomarse en serio este lugar. Ojala se mantenga.\n\nDr. Andrés Guzmán',
    trigger: {
      type: 'ON_CONDITION_GROUP',
      condition: {
        any: [
          { kind: 'stakeholder_metric', stakeholderId: 'andres-guzman', metric: 'trust', op: '>=', value: 70 },
          { kind: 'stakeholder_metric', stakeholderId: 'andres-guzman', metric: 'support', op: '>=', value: 70 },
        ],
      },
    },
  },
  {
    email_id: 'mlq5x-variable-guzman-negative',
    from: 'Dr. Andrés Guzmán',
    subject: 'Desempeno como director',
    body:
      'Director:\n\nLe escribo con respeto y sin animo de confrontar, pero debo decirle lo que estoy pensando.\n\nEsta semana esperaba que la nueva dirección marcara un rumbo distinto al que hemos tenido, pero he estado con la sensacion de que las decisiones se tomaron sin considerar a quienes llevamos años construyendo esto. No hablo solo por mi, sino por lo que percibo en el equipo.\n\nEspero que corrija el curso, sino es probable que un nuevo director ocupe su puesto. Un CESFAM funciona cuando la dirección y los equipos van en la misma dirección, y por ahora estoy bastante seguro de que eso no esta ocurriendo.\n\nDr. Andrés Guzmán',
    trigger: {
      type: 'ON_CONDITION_GROUP',
      condition: {
        any: [
          { kind: 'stakeholder_metric', stakeholderId: 'andres-guzman', metric: 'trust', op: '<=', value: 30 },
          { kind: 'stakeholder_metric', stakeholderId: 'andres-guzman', metric: 'support', op: '<=', value: 30 },
        ],
      },
    },
  },
  {
    email_id: 'mlq5x-variable-soto-positive',
    from: 'Enf. Marcela Soto',
    subject: 'Balance',
    body:
      'Director:\n\nNo suelo escribir este tipo de correos, así que le pido que lo tome como lo que es: un reconocimiento sincero.\n\nEsta semana las cosas se hicieron como deben hacerse. Las decisiones siguieron un orden, se consulto a quienes correspondia y cuando hubo problemas se enfrentaron de frente en lugar de postergarse. Eso genera confianza, tanto en mi como en el equipo del sector, que también lo nota aunque no lo exprese.\n\nSoy consciente de que mi forma de trabajar no es fácil para todo el mundo y que a veces genero roces. Por eso valoro especialmente cuando la dirección entiende que el rigor no es un obstaculo sino una garantia. Espero que podamos seguir trabajando así.\n\nEnf. Marcela Soto',
    trigger: {
      type: 'ON_CONDITION_GROUP',
      condition: {
        any: [
          { kind: 'stakeholder_metric', stakeholderId: 'marcela-soto', metric: 'trust', op: '>=', value: 70 },
          { kind: 'stakeholder_metric', stakeholderId: 'marcela-soto', metric: 'support', op: '>=', value: 70 },
        ],
      },
    },
  },
  {
    email_id: 'mlq5x-variable-soto-negative',
    from: 'Enf. Marcela Soto',
    subject: 'Balance',
    body:
      'Director:\n\nLe escribo porque considero que es mi obligacion ser directa cuando algo no me parece correcto, y esta semana ha habido situaciones que me generan preocupacion genuina.\n\nHe observado decisiones que se tomaron de manera informal, sin seguir los procedimientos que existen precisamente para proteger al equipo y a la institucion. Entiendo que una semana de llegada es compleja y que hay mucho que aprender, pero la informalidad en la gestión tiene consecuencias que no siempre se ven de inmediato y que después son dificiles de revertir.\n\nUn CESFAM bien gestionado necesita que dirección y jefaturas de sector esten alineadas, y para eso necesito poder confiar en que las decisiones que se toman desde arriba son consistentes y predecibles. Si no puede cumplir con eso, alguien más deberá usar su cargo.\n\nEnf. Marcela Soto',
    trigger: {
      type: 'ON_CONDITION_GROUP',
      condition: {
        any: [
          { kind: 'stakeholder_metric', stakeholderId: 'marcela-soto', metric: 'trust', op: '<=', value: 30 },
          { kind: 'stakeholder_metric', stakeholderId: 'marcela-soto', metric: 'support', op: '<=', value: 30 },
        ],
      },
    },
  },
  {
    email_id: 'mlq5x-variable-rios-positive',
    from: 'Daniel Ríos',
    subject: 'Sin asunto',
    body:
      'Director:\n\nNo soy muy de escribir correos formales, así que le aviso que esto no va a sonar muy institucional.\n\nQuería decirle que esta semana senti que había alguien en dirección que realmente esta mirando lo que pasa en el CESFAM, no solo los papeles sino lo que pasa de verdad, con las personas. Eso para el equipo del Amarillo significa mucho, más de lo que probablemente imagina, porque venimos de un tiempo largo en que la sensacion era que a nadie le importaba demasiado como estabamos.\n\nNo se como van a salir las cosas más adelante, nadie lo sabe. Pero por ahora quiero que sepa que tiene de este lado a alguien dispuesto a trabajar con usted, no solo para usted.\n\nDaniel Ríos',
    trigger: {
      type: 'ON_CONDITION_GROUP',
      condition: {
        any: [
          { kind: 'stakeholder_metric', stakeholderId: 'daniel-rios', metric: 'trust', op: '>=', value: 70 },
          { kind: 'stakeholder_metric', stakeholderId: 'daniel-rios', metric: 'support', op: '>=', value: 70 },
        ],
      },
    },
  },
  {
    email_id: 'mlq5x-variable-rios-negative',
    from: 'Daniel Ríos',
    subject: 'Sin asunto',
    body:
      'Director:\n\nLe escribo porque prefiero decirle las cosas de frente antes de que se enteren por otro lado.\n\nEsta semana el equipo del Amarillo esta desmotivado. No es solo el tema de los turnos o de los horarios, es algo más general: la sensacion de que las decisiones se toman sin considerar lo que vivimos día a día aca adentro. Que hay una logica de escritorio que no siempre calza con lo que necesitan los pacientes ni las personas que los atienden.\n\nYo llevo tiempo en esto y he aprendido a distinguir cuando una dirección realmente quiere cambiar las cosas y cuando solo quiere que los numeros cuadren. Ojala me demuestre que me equivoco y revierta esta situación, sino probablemente alguien más usara su puesto.\n\nDaniel Ríos',
    trigger: {
      type: 'ON_CONDITION_GROUP',
      condition: {
        any: [
          { kind: 'stakeholder_metric', stakeholderId: 'daniel-rios', metric: 'trust', op: '<=', value: 30 },
          { kind: 'stakeholder_metric', stakeholderId: 'daniel-rios', metric: 'support', op: '<=', value: 30 },
        ],
      },
    },
  },
  {
    email_id: 'delegation-confirm-protocolo-urgencias',
    from: 'Sofía Castro',
    subject: 'Encargo listo: protocolo de urgencias',
    body:
      'Director:\n\nComo me lo encargo, avance con el protocolo formal de actuacion para urgencias sin médico presente. Coordine con enfermeria y deje un borrador ordenado para su revisión.\n\nQuedo atenta a sus observaciones para cerrarlo.\n\nSofía Castro\nAsistente Administrativa',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'delegation-confirm-protocolo-urgencias' },
  },
  {
    email_id: 'delegation-confirm-gestión-docencia',
    from: 'Sofía Castro',
    subject: 'Encargo listo: gestión docente',
    body:
      'Director:\n\nSegún lo que me delegó, gestione la labor docente: contacte a la coordinadora de prácticas de la universidad y reuni los antecedentes de los cupos.\n\nLe dejo el tema encaminado y le aviso apenas tengamos respuesta formal.\n\nSofía Castro\nAsistente Administrativa',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'delegation-confirm-gestión-docencia' },
  },
  {
    email_id: 'delegation-confirm-formalizar-internos',
    from: 'Sofía Castro',
    subject: 'Encargo listo: formalizacion de internos',
    body:
      'Director:\n\nComo me lo pidió, inicie el tramite para formalizar a los internos no registrados del Sector Azul. Reuni la documentación y la eleve para regularizar su situación antes de una eventual auditoría.\n\nLe confirmo en cuanto quede ingresado en el sistema.\n\nSofía Castro\nAsistente Administrativa',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'delegation-confirm-formalizar-internos' },
  },
  {
    email_id: 'delegation-confirm-protocolo-tens',
    from: 'Sofía Castro',
    subject: 'Encargo listo: protocolo TENS',
    body:
      'Director:\n\nTramite el protocolo TENS-sin-médico que dejo el Sr. Ríos. Lo ordene y lo derive según corresponde para su revisión por las instancias pertinentes.\n\nLe informaré cualquier novedad sobre su aprobación.\n\nSofía Castro\nAsistente Administrativa',
    trigger: { type: 'ON_CASE_EVENT', event_id: 'delegation-confirm-protocolo-tens' },
  },
];
