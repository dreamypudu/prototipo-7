import type { StakeholderQuestion } from '../../../../../types';

export const CESFAM_MLQ5X_QUESTIONS: Record<string, StakeholderQuestion[]> = {
  'sofia-castro': [
    {
      question_id: 'mlq_sofia_prioridades',
      text: '¿Qué señales debo observar hoy en el equipo?',
      answer: 'Observe si el equipo entiende por qué se toman las decisiones, no solo qué instrucciones recibe.',
    },
    {
      question_id: 'mlq_sofia_pendientes',
      text: '¿Qué tengo pendiente esta semana?',
      answer: 'Debe escuchar a los tres jefes de sector, resolver los conflictos que surjan y dejar lista la planificación semanal antes del cierre del viernes.',
    },
    {
      question_id: 'mlq_sofia_animo',
      text: '¿Cómo está el ánimo del equipo?',
      answer: 'Tenso pero expectante, director. Vienen de una dirección que solo apagaba incendios; observan si la suya marca un rumbo distinto.',
    },
    {
      question_id: 'mlq_sofia_plazos',
      text: '¿Hay algún plazo que no deba olvidar?',
      answer: 'La planificación de la próxima semana debe quedar enviada antes de cerrar el viernes. No conviene dejarla para el último bloque.',
    },
  ],
  'andres-guzman': [
    {
      question_id: 'mlq_guzman_vision',
      text: 'Que espera de la direccion esta semana?',
      answer: 'Espero una direccion con vision clara. Si solo administra urgencias, el centro queda sin rumbo.',
    },
  ],
  'marcela-soto': [
    {
      question_id: 'mlq_marcela_confianza',
      text: 'Que le daria confianza en mi liderazgo?',
      answer: 'Coherencia. Si promete algo al equipo, debe sostenerlo incluso cuando aumente la presion.',
    },
  ],
  'daniel-rios': [
    {
      question_id: 'mlq_daniel_apoyo',
      text: 'Como puedo apoyar mejor al equipo territorial?',
      answer: 'Escuche el terreno antes de fijar metas. La motivacion cae cuando las decisiones parecen venir desde lejos.',
    },
  ],
};
