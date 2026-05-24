import type { SimulatorConfig } from '../../types';

export const SERCOTEC_CONFIGURATION: SimulatorConfig = {
  version_id: 'SERCOTEC',
  title: 'Consultoria PyME SERCOTEC',
  mechanics: [
    { mechanic_id: 'office', label: 'Oficina Central', tab_id: 'interaction' },
    { mechanic_id: 'inbox', label: 'Correos', tab_id: 'emails' },
  ],
  comparison_rules: [],
};
