import type { SimulatorConfig } from '../../types';
import {
  canEditCesfamSchedule,
  canSubmitCesfamSchedule,
  getCesfamScheduleEditDisabledReason,
  getCesfamScheduleExecuteDisabledReason,
  wasCesfamScheduleSubmittedThisWeek,
} from './services/scheduleTiming';

export const CESFAM_CONFIGURATION: SimulatorConfig = {
  version_id: 'CESFAM',
  title: 'Gestion Directiva CESFAM',
  mechanics: [
    { mechanic_id: 'office', label: 'Oficina Central', tab_id: 'interaction' },
    { mechanic_id: 'stakeholders', label: 'Relaciones', tab_id: 'summary' },
    { mechanic_id: 'map', label: 'Plano Centro', tab_id: 'map' },
    {
      mechanic_id: 'scheduler',
      label: 'Agenda Semanal',
      tab_id: 'schedule',
      params: {
        scheduleTiming: {
          canEdit: canEditCesfamSchedule,
          canSubmit: canSubmitCesfamSchedule,
          getEditDisabledReason: getCesfamScheduleEditDisabledReason,
          getExecuteDisabledReason: getCesfamScheduleExecuteDisabledReason,
          wasSubmittedThisWeek: wasCesfamScheduleSubmittedThisWeek,
          executeLabel: 'Enviar planificacion semanal',
          submittedLabel: 'Planificacion enviada',
        },
      },
    },
    { mechanic_id: 'inbox', label: 'Correos', tab_id: 'emails' },
    { mechanic_id: 'documents', label: 'Archivos', tab_id: 'documents' },
  ],
  comparison_rules: [
    'visit_priority_rule_v1',
    'visit_stakeholder_rule_v1',
    'reserve_room_for_sector_rule_v1',
    'keep_staff_in_sector_rule_v1',
    'research_hours_rule_v1',
    'admin_decision_rule_v1',
  ],
};
