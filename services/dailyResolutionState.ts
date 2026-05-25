// Aplica una resolución diaria ya calculada sobre GameState y evita duplicar comparaciones/resoluciones.
import type { ComparisonResult, DailyResolution, GameState } from '../types';
import { mergeComparisonResults } from './ComparisonEngine';

const clampReputation = (value: number): number => Math.max(0, Math.min(100, value));

const buildComparisonKey = (comparison: ComparisonResult) =>
  [
    comparison.expected_action_id,
    comparison.canonical_action_id ?? 'none',
    comparison.outcome,
    comparison.rule_id ?? 'default',
  ].join('::');

const upsertDailyResolution = (
  resolutions: DailyResolution[],
  nextResolution: DailyResolution
): DailyResolution[] => {
  const existingIndex = resolutions.findIndex((entry) => entry.day === nextResolution.day);
  if (existingIndex === -1) {
    return [...resolutions, nextResolution].sort((a, b) => a.day - b.day);
  }

  const updated = [...resolutions];
  updated[existingIndex] = nextResolution;
  return updated;
};

export const applyDailyResolutionToState = (
  prev: GameState,
  resolution: DailyResolution
): GameState => {
  const deltaBudget = Number(resolution.global_deltas?.budget || 0);
  const deltaReputation = Number(resolution.global_deltas?.reputation || 0);

  const updatedStakeholders = prev.stakeholders.map((stakeholder) => {
    const deltas = resolution.stakeholder_deltas?.[stakeholder.id];
    if (!deltas) return stakeholder;

    const trustDelta = Number(deltas.trust || 0);
    const supportDelta = Number(deltas.support || 0);
    return {
      ...stakeholder,
      trust: Math.max(0, Math.min(100, stakeholder.trust + trustDelta)),
      support: Math.max(
        stakeholder.minSupport,
        Math.min(stakeholder.maxSupport, stakeholder.support + supportDelta)
      ),
    };
  });

  const knownComparisonKeys = new Set(prev.comparisons.map(buildComparisonKey));
  const newComparisons = resolution.comparisons.filter((comparison) => !knownComparisonKeys.has(buildComparisonKey(comparison)));
  const comparisons = mergeComparisonResults(prev.comparisons, resolution.comparisons);
  const resolvedExpectedActionIds = Array.from(
    new Set([...(prev.resolvedExpectedActionIds ?? []), ...(resolution.resolved_expected_action_ids ?? [])])
  );
  const pendingEmailEvents = [
    ...(prev.pendingEmailEvents ?? []),
    ...(resolution.scheduled_email_events ?? []),
  ];

  const summary = `Resolución día ${resolution.day}: presupuesto ${deltaBudget >= 0 ? '+' : ''}${deltaBudget}, reputación ${deltaReputation >= 0 ? '+' : ''}${deltaReputation}`;
  const shouldLogSummary =
    newComparisons.length > 0 ||
    deltaBudget !== 0 ||
    deltaReputation !== 0 ||
    Object.keys(resolution.stakeholder_deltas ?? {}).length > 0;

  return {
    ...prev,
    budget: prev.budget + deltaBudget,
    reputation: clampReputation(prev.reputation + deltaReputation),
    stakeholders: updatedStakeholders,
    comparisons,
    dailyResolutions: upsertDailyResolution(prev.dailyResolutions ?? [], resolution),
    resolvedExpectedActionIds,
    pendingEmailEvents,
    eventsLog: shouldLogSummary ? [...prev.eventsLog, summary] : prev.eventsLog,
  };
};
