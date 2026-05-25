export {
  CESFAM_MODULE_CONTENT_PACKS,
  CESFAM_NARRATIVE_MODULES,
  DEFAULT_CESFAM_MODULE_ID,
  getCesfamContentPack,
} from './modules';
export type { CesfamNarrativeModuleId } from './modules';
import { DEFAULT_CESFAM_MODULE_ID, getCesfamContentPack } from './modules';

export const CESFAM_CONTENT = getCesfamContentPack(DEFAULT_CESFAM_MODULE_ID);
