import type { StakeholderQuestion } from '../../../../../types';

export const CESFAM_MLQ5X_QUESTIONS: Record<string, StakeholderQuestion[]> = {
  'sofia-castro': [
    {
      question_id: 'mlq_sofia_prioridades',
      text: '¿Qué señales debo observar hoy en el equipo?',
      answer:
        'Observe si el equipo entiende por qué se toman las decisiones, no solo qué instrucciones recibe. Cuando solo siguen órdenes, después no se hacen cargo de los problemas que aparecen.',
    },
    {
      question_id: 'mlq_sofia_pendientes',
      text: '¿Qué tengo pendiente esta semana?',
      answer:
        'Debe escuchar a los tres jefes de sector, resolver los conflictos que surjan y dejar lista la planificación semanal antes del cierre del viernes.',
    },
    {
      question_id: 'mlq_sofia_animo',
      text: '¿Cómo está el ánimo del equipo?',
      answer:
        'Tenso pero expectante, director. Vienen de una dirección que solo apagaba incendios; observan si la suya marca un rumbo distinto.',
    },
    {
      question_id: 'mlq_sofia_plazos',
      text: '¿Hay algún plazo que no deba olvidar?',
      answer:
        'La planificación de la próxima semana debe quedar enviada antes de cerrar el viernes. No conviene dejarla para el último bloque.',
    },
    {
      question_id: 'mlq_sofia_orden_escucha',
      text: '¿A qué jefatura me conviene escuchar antes de decidir algo operativo?',
      answer:
        'Soto trae datos y protocolos; Ríos trae la lectura del terreno; Guzmán pone la mirada larga y la docencia. Conviene cruzar las tres voces antes de comprometer una decisión que afecte a todos.',
    },
    {
      question_id: 'mlq_sofia_comunicacion_riesgo',
      text: '¿Dónde solemos atrasar la comunicación con los sectores?',
      answer:
        'Cuando una decisión queda firmada sin avisar a quien depende de ella. Si reagenda un box o mueve un turno, el sector afectado debería enterarse antes de que el documento esté listo.',
    },
    {
      question_id: 'mlq_sofia_director_anterior',
      text: '¿Qué hacía distinto el director anterior que el equipo todavía recuerda?',
      answer:
        'Resolvía cada cosa con el sector que reclamara más fuerte. Eso evitaba peleas en el momento, pero dejaba la sensación de que no había criterio. Hoy todos lo miran a usted esperando ver si hay otro estilo.',
    },
  ],
  'andres-guzman': [
    {
      question_id: 'mlq_guzman_vision',
      text: '¿Qué espera de la dirección esta semana?',
      answer:
        'Espero una dirección con visión clara. Si solo administra urgencias, el centro queda sin rumbo y la docencia termina dependiendo de la buena voluntad de quien esté de turno.',
    },
    {
      question_id: 'mlq_guzman_docencia_vs_indicadores',
      text: '¿Cómo planea sostener la docencia frente a la presión por indicadores?',
      answer:
        'No son cosas opuestas, director. Un equipo que enseña también se exige técnicamente. Si la dirección la mira solo como horas perdidas, perdemos algo más que un convenio: perdemos el sentido de por qué estamos acá.',
    },
    {
      question_id: 'mlq_guzman_universidad',
      text: '¿Qué se juega el CESFAM si se cae el vínculo con la universidad?',
      answer:
        'Capacidad técnica, atracción de buenos profesionales y un cable a tierra con la formación nueva. La universidad puede irse a otro centro, y volver a entrar nunca es gratis.',
    },
    {
      question_id: 'mlq_guzman_director_anterior',
      text: '¿Por qué cree que el director anterior no pudo sostener este compromiso?',
      answer:
        'Porque trató cada decisión como un favor personal, no como una política de dirección. Cuando todo depende del ánimo del que firma, lo importante se cae a la primera semana complicada.',
    },
    {
      question_id: 'mlq_guzman_internos',
      text: '¿Qué pasa si el tema de los internos sin registrar nos estalla en una auditoría?',
      answer:
        'Pierdo a los internos, pierdo el convenio docente y la responsabilidad legal cae sobre mí y sobre el CESFAM. Por eso le insisto en formalizarlo antes de que nos llegue una visita inesperada.',
    },
  ],
  'marcela-soto': [
    {
      question_id: 'mlq_marcela_confianza',
      text: '¿Qué le daría confianza en mi liderazgo?',
      answer:
        'Coherencia. Si promete algo al equipo, debe sostenerlo incluso cuando aumente la presión. Y, sobre todo, que no use la urgencia como excusa para saltarse el protocolo.',
    },
    {
      question_id: 'mlq_marcela_protocolo_excepcion',
      text: '¿Cómo equilibra protocolo y excepción cuando la urgencia clínica lo exige?',
      answer:
        'El protocolo no se rompe, se cambia. Si una situación clínica obliga a actuar fuera de la norma, lo registramos formalmente y se revisa la norma. Lo que no podemos permitir es que la excepción se vuelva costumbre.',
    },
    {
      question_id: 'mlq_marcela_amarillo',
      text: '¿Qué señal espera de la dirección frente a las desviaciones del Sector Amarillo?',
      answer:
        'Que se reconozcan como desviaciones, no como flexibilidad. Si saltarse un protocolo no tiene consecuencia, el resto del CESFAM aprende que las reglas son opcionales.',
    },
    {
      question_id: 'mlq_marcela_riesgo_relativizar',
      text: '¿Qué se pone en juego si el protocolo se relativiza por la urgencia?',
      answer:
        'Primero perdemos trazabilidad: nadie sabe quién decidió qué. Después perdemos al equipo joven, que se forma con la idea de que las reglas son sugerencias. Y, en el peor de los casos, perdemos al paciente.',
    },
    {
      question_id: 'mlq_marcela_indicadores',
      text: '¿Por qué insiste tanto en los indicadores del Sector Rojo?',
      answer:
        'Porque son lo único que dirección puede revisar sin que dependa del relato del jefe de turno. Si los datos no llegan limpios, todo el resto pasa a ser conversación y las decisiones se toman a ciegas.',
    },
  ],
  'daniel-rios': [
    {
      question_id: 'mlq_daniel_apoyo',
      text: '¿Cómo puedo apoyar mejor al equipo territorial?',
      answer:
        'Escuche el terreno antes de fijar metas. La motivación cae cuando las decisiones parecen venir desde lejos. Y por favor, no me deje administrar la fatiga del equipo solo desde el reglamento.',
    },
    {
      question_id: 'mlq_daniel_sobrecarga',
      text: '¿Qué señales del equipo me dirían que la sobrecarga pasó el límite?',
      answer:
        'Cuando la gente deja de discutir sus turnos: ya no reclama porque ya no espera nada. Ahí empiezan las renuncias y los errores clínicos por agotamiento. Si llegamos a ese punto, ya estamos tarde.',
    },
    {
      question_id: 'mlq_daniel_propuesta_concreta',
      text: '¿Cuál es la propuesta concreta que necesita del director esta semana?',
      answer:
        'Que la dirección defina si vamos a tener un sistema de turnos rotativos o no. No me sirve un "lo revisaré"; necesito una respuesta para sostener al equipo del Amarillo hasta que llegue refuerzo de personal.',
    },
    {
      question_id: 'mlq_daniel_urgencia_protocolo',
      text: '¿Cómo distingue una urgencia clínica real de una excusa para saltarse el protocolo?',
      answer:
        'Por el costo al paciente si esperáramos. Si esperar el protocolo significa que llegue dañado a otro centro, es urgencia. Si esperar es solo incomodidad para nosotros, es protocolo. Esa línea es delgada y por eso necesitamos hablarla en conjunto, no a posteriori.',
    },
    {
      question_id: 'mlq_daniel_amarillo_riesgo',
      text: '¿Qué pierde el Sector Amarillo si las decisiones siguen tardando?',
      answer:
        'Pierdo gente buena que se va a otro CESFAM porque allá al menos saben lo que pueden esperar. Y la comunidad pierde continuidad: el mismo paciente termina viendo a un funcionario distinto cada semana, sin que nadie se haga cargo de su historia.',
    },
  ],
};
