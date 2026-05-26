import type { GameState, ScenarioNode } from '../types';
import { evaluateConditionGroup } from './commitments_text_generator';

const normalizeText = (value: string) => value.trim();

export const resolveScenarioDialogue = (node: ScenarioNode, state: GameState): string => {
  const matchingSegments = (node.contextualDialogue ?? []).filter((segment) =>
    evaluateConditionGroup(state, segment.when)
  );

  if (matchingSegments.length === 0) return node.dialogue;

  const before = matchingSegments
    .filter((segment) => segment.position !== 'after')
    .map((segment) => normalizeText(segment.text));
  const after = matchingSegments
    .filter((segment) => segment.position === 'after')
    .map((segment) => normalizeText(segment.text));

  return [...before, normalizeText(node.dialogue), ...after]
    .filter(Boolean)
    .join(' ');
};
