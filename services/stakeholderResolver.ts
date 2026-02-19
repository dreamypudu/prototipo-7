import type { MeetingSequence, ScenarioNode, Stakeholder } from '../types';

type StakeholderRef = {
  stakeholderId?: string;
  stakeholderRole?: string;
};

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentValidationError';
  }
}

const resolveByRole = (stakeholders: Stakeholder[], stakeholderRole: string): Stakeholder | null => {
  const matches = stakeholders.filter((stakeholder) => stakeholder.role === stakeholderRole);
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    console.warn(`[Content] Multiple stakeholders found for role "${stakeholderRole}". Using first match.`);
  }
  return matches[0] ?? null;
};

export const resolveStakeholderByRef = (
  stakeholders: Stakeholder[],
  ref: StakeholderRef
): Stakeholder | null => {
  if (ref.stakeholderId) {
    const stakeholder = stakeholders.find((candidate) => candidate.id === ref.stakeholderId);
    if (stakeholder) return stakeholder;
  }
  if (ref.stakeholderRole) {
    return resolveByRole(stakeholders, ref.stakeholderRole);
  }
  return null;
};

export const resolveStakeholderOrThrow = (
  stakeholders: Stakeholder[],
  ref: StakeholderRef,
  context: string
): Stakeholder => {
  const stakeholder = resolveStakeholderByRef(stakeholders, ref);
  if (stakeholder) return stakeholder;

  const descriptor = ref.stakeholderId
    ? `stakeholderId="${ref.stakeholderId}"`
    : `stakeholderRole="${ref.stakeholderRole ?? 'unknown'}"`;
  throw new ContentValidationError(`[Content] Invalid stakeholder reference (${descriptor}) in ${context}`);
};

export const sequenceBelongsToStakeholder = (
  sequence: MeetingSequence,
  stakeholder: Stakeholder
): boolean => {
  if (sequence.stakeholderId) return sequence.stakeholderId === stakeholder.id;
  return sequence.stakeholderRole === stakeholder.role;
};

export const nodeBelongsToStakeholder = (
  node: ScenarioNode,
  stakeholder: Stakeholder
): boolean => {
  if (node.stakeholderId) return node.stakeholderId === stakeholder.id;
  return node.stakeholderRole === stakeholder.role;
};
