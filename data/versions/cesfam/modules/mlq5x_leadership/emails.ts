import type { EmailTemplate } from '../../../../../types';

export const CESFAM_MLQ5X_EMAILS: EmailTemplate[] = [
  {
    email_id: 'mlq5x-welcome',
    from: 'Sofia Castro',
    subject: 'Foco de observacion: liderazgo directivo',
    body: 'Director/a:\n\nEsta semana observaremos como sus decisiones influyen en motivacion, confianza, autonomia y claridad de proposito del equipo.\n\nLas reuniones y compromisos permitiran observar conductas asociadas a liderazgo transformacional, transaccional y evitativo.',
    trigger: { type: 'ON_TIME_BLOCK', day: 3, slot: 'mañana' },
  },
];
