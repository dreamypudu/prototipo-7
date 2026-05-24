import type { SimulatorConfig, SimulatorVersion } from '../types';
import { CESFAM_CONFIGURATION } from './cesfam/configuration';
import { INNOVATEC_CONFIGURATION } from './innovatec/configuration';
import { LEY_KARIN_CONFIGURATION } from './leykarin/configuration';
import { MUNICIPAL_CONFIGURATION } from './municipal/configuration';
import { SERCOTEC_CONFIGURATION } from './sercotec/configuration';

export const SIMULATOR_CONFIGS: Record<SimulatorVersion, SimulatorConfig> = {
  CESFAM: CESFAM_CONFIGURATION,
  INNOVATEC: INNOVATEC_CONFIGURATION,
  LEY_KARIN: LEY_KARIN_CONFIGURATION,
  SERCOTEC: SERCOTEC_CONFIGURATION,
  MUNICIPAL: MUNICIPAL_CONFIGURATION,
};
