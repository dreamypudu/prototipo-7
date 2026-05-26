import type { VersionContentPack } from '../../types';
import { CESFAM_ETHICS_CONTENT } from './ethics';
import { CESFAM_MLQ5X_CONTENT } from './mlq5x_leadership';
import { CESFAM_TUTORIAL_CONTENT } from './tutorial';

export const CESFAM_NARRATIVE_MODULES = [
  {
    id: 'ethics',
    title: 'Comportamiento ético',
    description: 'Dilemas de gestion, promesas y decisiones bajo tension operacional.',
    instrumentId: 'ETHICS',
    runMode: 'experiment',
    contentPack: CESFAM_ETHICS_CONTENT,
  },
  {
    id: 'mlq5x_leadership',
    title: 'Habilidades de Liderazgo',
    description: 'Conductas de liderazgo observables bajo dimensiones MLQ-5X.',
    instrumentId: 'MLQ-5X',
    runMode: 'experiment',
    contentPack: CESFAM_MLQ5X_CONTENT,
  },
  {
    id: 'tutorial',
    title: 'Tutorial',
    description: 'Exploracion breve sin tiempo ni envio de datos experimentales.',
    instrumentId: 'TUTORIAL',
    runMode: 'tutorial',
    contentPack: CESFAM_TUTORIAL_CONTENT,
  },
] as const;

export type CesfamNarrativeModuleId = typeof CESFAM_NARRATIVE_MODULES[number]['id'];

export const CESFAM_MODULE_CONTENT_PACKS: Record<CesfamNarrativeModuleId, VersionContentPack> =
  Object.fromEntries(
    CESFAM_NARRATIVE_MODULES.map((module) => [module.id, module.contentPack])
  ) as Record<CesfamNarrativeModuleId, VersionContentPack>;

export const DEFAULT_CESFAM_MODULE_ID: CesfamNarrativeModuleId = 'ethics';

export const getCesfamContentPack = (
  moduleId: CesfamNarrativeModuleId = DEFAULT_CESFAM_MODULE_ID
): VersionContentPack => CESFAM_MODULE_CONTENT_PACKS[moduleId] ?? CESFAM_MODULE_CONTENT_PACKS[DEFAULT_CESFAM_MODULE_ID];
