import type { SimulatorConfig } from '../../types';

export const MUNICIPAL_CONFIGURATION: SimulatorConfig = {
  version_id: 'MUNICIPAL',
  title: 'Alcaldía Municipal',
  mechanics: [
    { mechanic_id: 'office', label: 'Palacio Municipal', tab_id: 'interaction' },
    { mechanic_id: 'map', label: 'Mapa Comunal', tab_id: 'map' },
  ],
  comparison_rules: [],
};
