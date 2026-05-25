import type { StakeholderQuestion } from '../../../../../types';

export const CESFAM_MLQ5X_QUESTIONS: Record<string, StakeholderQuestion[]> = {
  'sofia-castro': [
    {
      question_id: 'mlq_sofia_prioridades',
      text: 'Que senales debo observar hoy en el equipo?',
      answer: 'Observe si el equipo entiende por que se toman las decisiones, no solo que instrucciones recibe.',
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
