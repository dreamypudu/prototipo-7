import type { ScenarioTag } from '../../../../../../types';

type MlqAcronym = 'IIA' | 'IIC' | 'MI' | 'EI' | 'CI' | 'RC' | 'DPE-A' | 'DPE-P' | 'LF';

export const mlqTags = (
  scores: Partial<Record<MlqAcronym, number>> = {}
): ScenarioTag[] =>
  Object.entries(scores).map(([tagValue, score]) => ({
    tag_type: 'MLQ-5X',
    tag_value: tagValue,
    tag_score: Number(score),
  }));
