import type { SimulatorConfig } from '../../types';

export const LEY_KARIN_CONFIGURATION: SimulatorConfig = {
  version_id: 'LEY_KARIN',
  title: 'Compass: Ley Karin',
  mechanics: [
    { mechanic_id: 'office', label: 'Oficina Central', tab_id: 'interaction' },
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
