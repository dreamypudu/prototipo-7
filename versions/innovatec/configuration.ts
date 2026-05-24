import type { SimulatorConfig } from '../../types';

export const INNOVATEC_CONFIGURATION: SimulatorConfig = {
  version_id: 'INNOVATEC',
  title: 'Innovatec: Proyecto Quantum Leap',
  mechanics: [
    { mechanic_id: 'office', component_id: 'innovatec_office', label: 'Oficina Central', tab_id: 'interaction' },
    { mechanic_id: 'inbox', component_id: 'innovatec_inbox', label: 'Correos', tab_id: 'emails' },
    { mechanic_id: 'calendar', component_id: 'innovatec_calendar', label: 'Calendario', tab_id: 'calendar' },
    { mechanic_id: 'stakeholders', component_id: 'innovatec_stakeholders', label: 'Stakeholders', tab_id: 'summary' },
    { mechanic_id: 'data_export', label: 'Datos', tab_id: 'data_export' },
    { mechanic_id: 'experimental_map', component_id: 'innovatec_experimental_map', label: 'Mapa Experimental', tab_id: 'experimental_map' },
  ],
  comparison_rules: [],
};
