import type { SimulatorVersion } from '../../types';
import { CESFAM_CONTENT } from './cesfam';
import { INNOVATEC_CONTENT } from './innovatec';
import { LEYKARIN_CONTENT } from './leykarin';
import { MUNICIPAL_CONTENT } from './municipal';
import { SERCOTEC_CONTENT } from './sercotec';
import type { VersionContentPack } from './types';

export const VERSION_CONTENT_PACKS: Record<SimulatorVersion, VersionContentPack> = {
  CESFAM: CESFAM_CONTENT,
  INNOVATEC: INNOVATEC_CONTENT,
  LEY_KARIN: LEYKARIN_CONTENT,
  SERCOTEC: SERCOTEC_CONTENT,
  MUNICIPAL: MUNICIPAL_CONTENT,
};

export const getVersionContentPack = (version: SimulatorVersion): VersionContentPack => {
  const pack = VERSION_CONTENT_PACKS[version];
  if (!pack) {
    throw new Error(`Version content pack not found for ${version}`);
  }
  return pack;
};

export type { VersionContentPack } from './types';
