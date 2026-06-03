// Orquesta la comparacion expected vs canonical usando las reglas registradas por cada mecanica.
import type {
  CanonicalAction,
  ContentUnlocks,
  ComparisonResult,
  DailyResolution,
  DecisionLogEntry,
  ExpectedAction,
  GameState,
  RoomDefinition,
  StaffMember,
  TimeSlotType,
} from '../types';
import type { MechanicRuleContext, MechanicRuleEvaluation } from '../mechanics/types';
import { MECHANIC_REGISTRY } from '../mechanics/registry';
import { resolveGenericExpectedAction } from './comparisonRuleUtils';
import { normalizeContentUnlocks } from './contentUnlocks';

const DEFAULT_SESSION_ID = 'local-session';

type OutcomeBranch = 'TRUE' | 'FALSE';

interface CompareOptions {
  includeNotDone?: boolean;
  finalize?: boolean;
  sessionId?: string;
  resolvedDay?: number | null;
  resolvedAtMs?: number;
  currentDay?: number;
  currentTimeSlot?: TimeSlotType;
  staffRoster?: StaffMember[];
  roomDefinitions?: RoomDefinition[];
  decisionLog?: DecisionLogEntry[];
}

const DEFAULT_RULE_EFFECTS: Record<string, Record<OutcomeBranch, Record<string, any>>> = {
  meeting_time_rule_v1: {
    TRUE: { global: { reputation: 10 } },
    FALSE: { global: { reputation: -10 } },
  },
  visit_stakeholder_rule_v1: {
    TRUE: { stakeholder: { trust: 10 } },
    FALSE: { stakeholder: { trust: -10 } },
  },
  research_hours_rule_v1: {
    TRUE: { global: { reputation: 10 } },
    FALSE: { global: { reputation: -10 } },
  },
  admin_decision_rule_v1: {
    TRUE: {},
    FALSE: {},
  },
  reserve_room_for_sector_rule_v1: {
    TRUE: {},
    FALSE: { global: { reputation: -10 } },
  },
  keep_staff_in_sector_rule_v1: {
    TRUE: {},
    FALSE: { global: { reputation: -10 } },
  },
  default_rule: {
    TRUE: {},
    FALSE: {},
  },
};

const buildComparisonId = (
  sessionId: string,
  expectedActionId: string,
  canonicalActionId: string | null,
  resolvedDay?: number | null
) => [
  sessionId || DEFAULT_SESSION_ID,
  expectedActionId,
  canonicalActionId ?? 'none',
  resolvedDay ?? 'pending',
].join('__');

const createComparison = (
  expected: ExpectedAction,
  canonicalAction: CanonicalAction | null,
  evaluation: MechanicRuleEvaluation,
  options: Required<Pick<CompareOptions, 'sessionId' | 'resolvedAtMs'>> & Pick<CompareOptions, 'resolvedDay'>
): ComparisonResult => {
  const canonicalActionId = canonicalAction?.canonical_action_id ?? null;
  const expectedCreatedAtMs = typeof expected.created_at === 'number' ? expected.created_at : null;
  const commitmentElapsedMs =
    expectedCreatedAtMs !== null ? Math.max(0, options.resolvedAtMs - expectedCreatedAtMs) : null;
  const reason = evaluation.outcome ? null : evaluation.reason ?? 'other_rule_failed';
  const rawDeviation = evaluation.outcome
    ? null
    : evaluation.rawDeviation ?? { reason, rule_id: expected.rule_id };

  return {
    comparison_id: buildComparisonId(options.sessionId, expected.expected_action_id, canonicalActionId, options.resolvedDay),
    session_id: options.sessionId,
    expected_action_id: expected.expected_action_id,
    canonical_action_id: canonicalActionId,
    mechanic_id: expected.mechanic_id ?? canonicalAction?.mechanic_id ?? null,
    outcome: evaluation.outcome,
    reason,
    rule_id: expected.rule_id,
    resolved_day: options.resolvedDay ?? null,
    resolved_at_ms: options.resolvedAtMs,
    commitment_elapsed_ms: commitmentElapsedMs,
    raw_deviation: rawDeviation,
    deviation: rawDeviation,
  };
};

const resolveRuleForExpected = (expected: ExpectedAction) => {
  if (!expected.mechanic_id) return null;
  return MECHANIC_REGISTRY[expected.mechanic_id]?.rules?.[expected.rule_id] ?? null;
};

const resolveExpectedComparison = (
  expected: ExpectedAction,
  canonicalActions: CanonicalAction[],
  options: CompareOptions
): ComparisonResult | null => {
  const sessionId = options.sessionId ?? DEFAULT_SESSION_ID;
  const resolvedAtMs = options.resolvedAtMs ?? Date.now();
  const ruleContext: MechanicRuleContext = {
    canonicalActions,
    decisionLog: options.decisionLog ?? [],
    currentDay: options.currentDay,
    currentTimeSlot: options.currentTimeSlot,
    staffRoster: options.staffRoster ?? [],
    roomDefinitions: options.roomDefinitions ?? [],
    includeNotDone: options.includeNotDone ?? true,
    finalize: options.finalize ?? false,
  };

  const rule = resolveRuleForExpected(expected);
  const resolution = rule
    ? rule.resolve(expected, ruleContext)
    : resolveGenericExpectedAction(expected, ruleContext);

  if (!resolution) return null;

  return createComparison(expected, resolution.canonicalAction, resolution.evaluation, {
    sessionId,
    resolvedAtMs,
    resolvedDay: options.resolvedDay ?? null,
  });
};

const mergeEffectBranches = (base: Record<string, any>, override: Record<string, any>) => ({
  ...base,
  ...override,
  global: {
    ...(base.global ?? {}),
    ...(override.global ?? {}),
  },
  stakeholder: {
    ...(base.stakeholder ?? {}),
    ...(override.stakeholder ?? {}),
  },
});

const resolveEffectPayload = (expected: ExpectedAction, outcome: OutcomeBranch) => {
  const base = DEFAULT_RULE_EFFECTS[expected.rule_id]?.[outcome] ?? DEFAULT_RULE_EFFECTS.default_rule[outcome] ?? {};
  const custom = expected.effects?.[outcome];
  if (!custom) return base;
  return mergeEffectBranches(base, custom);
};

const resolveEffectStakeholderId = (expected: ExpectedAction) => {
  if (expected.target_ref.startsWith('stakeholder:')) {
    return expected.target_ref.split(':', 2)[1];
  }
  return expected.stakeholder_id ?? null;
};

const applyEffects = (
  globalDeltas: Record<string, number>,
  stakeholderDeltas: Record<string, Record<string, number>>,
  scheduledEmailEvents: NonNullable<DailyResolution['scheduled_email_events']>,
  contentUnlocks: Required<ContentUnlocks>,
  expected: ExpectedAction,
  outcome: OutcomeBranch
) => {
  const effect = resolveEffectPayload(expected, outcome);
  Object.entries(effect.global ?? {}).forEach(([key, value]) => {
    globalDeltas[key] = (globalDeltas[key] ?? 0) + Number(value || 0);
  });
  if (Array.isArray(effect.scheduled_email_events)) {
    scheduledEmailEvents.push(...effect.scheduled_email_events);
  }
  const effectUnlocks = normalizeContentUnlocks(effect.unlocks);
  contentUnlocks.sequences.push(...effectUnlocks.sequences);
  contentUnlocks.emails.push(...effectUnlocks.emails);
  contentUnlocks.documents.push(...effectUnlocks.documents);

  const stakeholderId = resolveEffectStakeholderId(expected);
  if (!stakeholderId) return;

  const stakeholderEffect = effect.stakeholder ?? {};
  if (Object.keys(stakeholderEffect).length === 0) return;

  const current = stakeholderDeltas[stakeholderId] ?? {};
  Object.entries(stakeholderEffect).forEach(([key, value]) => {
    current[key] = (current[key] ?? 0) + Number(value || 0);
  });
  stakeholderDeltas[stakeholderId] = current;
};

const hasAnyDelta = (
  globalDeltas: Record<string, number>,
  stakeholderDeltas: Record<string, Record<string, number>>
) => {
  if (Object.values(globalDeltas).some((value) => Number(value || 0) !== 0)) return true;
  return Object.values(stakeholderDeltas).some((deltas) =>
    Object.values(deltas).some((value) => Number(value || 0) !== 0)
  );
};

const getResolvedExpectedIds = (gameState: GameState) => {
  const ids = new Set<string>(gameState.resolvedExpectedActionIds ?? []);
  (gameState.comparisons ?? [])
    .filter(isTerminalComparison)
    .forEach((comparison) => ids.add(comparison.expected_action_id));
  return ids;
};

const hasResolvedDay = (comparison: ComparisonResult) =>
  comparison.resolved_day !== null && comparison.resolved_day !== undefined;

export const isTerminalComparison = (comparison: ComparisonResult) =>
  comparison.outcome || hasResolvedDay(comparison);

const shouldReplaceComparison = (
  current: ComparisonResult,
  incoming: ComparisonResult
) => {
  if (isTerminalComparison(current)) return false;
  if (isTerminalComparison(incoming)) return true;
  if (incoming.outcome && !current.outcome) return true;
  if (incoming.canonical_action_id && !current.canonical_action_id) return true;
  return Number(incoming.resolved_at_ms ?? 0) >= Number(current.resolved_at_ms ?? 0);
};

export const mergeComparisonResults = (
  existingComparisons: ComparisonResult[],
  incomingComparisons: ComparisonResult[]
): ComparisonResult[] => {
  if (incomingComparisons.length === 0) return existingComparisons;

  const byExpectedAction = new Map<string, ComparisonResult>();
  [...existingComparisons, ...incomingComparisons].forEach((comparison) => {
    const current = byExpectedAction.get(comparison.expected_action_id);
    if (!current || shouldReplaceComparison(current, comparison)) {
      byExpectedAction.set(comparison.expected_action_id, comparison);
    }
  });

  return Array.from(byExpectedAction.values());
};

export const compareExpectedVsActual = (
  expectedActions: ExpectedAction[],
  canonicalActions: CanonicalAction[],
  existingComparisons: ComparisonResult[] = [],
  options: CompareOptions = {}
): ComparisonResult[] => {
  const compared = new Set(
    existingComparisons
      .filter(isTerminalComparison)
      .map((comparison) => comparison.expected_action_id)
  );
  const sessionId = options.sessionId ?? existingComparisons.find((comparison) => comparison.session_id)?.session_id ?? DEFAULT_SESSION_ID;
  const resolvedAtMs = options.resolvedAtMs ?? Date.now();
  const results: ComparisonResult[] = [];

  expectedActions.forEach((expected) => {
    if (compared.has(expected.expected_action_id)) return;

    const comparison = resolveExpectedComparison(expected, canonicalActions, {
      ...options,
      sessionId,
      resolvedAtMs,
    });
    if (comparison) results.push(comparison);
  });

  return results;
};

export const resolveDayEffectsLocally = (
  gameState: GameState,
  completedDay: number,
  roomDefinitions: RoomDefinition[],
  options: { sessionId?: string } = {}
): DailyResolution => {
  const resolvedIds = getResolvedExpectedIds(gameState);
  const comparisons: ComparisonResult[] = [];
  const globalDeltas: Record<string, number> = {};
  const stakeholderDeltas: Record<string, Record<string, number>> = {};
  const scheduledEmailEvents: NonNullable<DailyResolution['scheduled_email_events']> = [];
  const contentUnlocks: Required<ContentUnlocks> = { sequences: [], emails: [], documents: [] };
  const resolvedExpectedActionIds: string[] = [];
  const resolvedAtMs = Date.now();

  gameState.expectedActions.forEach((expected) => {
    if (resolvedIds.has(expected.expected_action_id)) return;
    const comparison = resolveExpectedComparison(expected, gameState.canonicalActions, {
      sessionId: options.sessionId ?? DEFAULT_SESSION_ID,
      resolvedDay: completedDay,
      resolvedAtMs,
      currentDay: gameState.day,
      currentTimeSlot: gameState.timeSlot,
      staffRoster: gameState.staffRoster,
      roomDefinitions,
      decisionLog: gameState.decisionLog,
      includeNotDone: false,
    });
    if (!comparison) return;

    comparisons.push(comparison);
    resolvedExpectedActionIds.push(expected.expected_action_id);
    applyEffects(
      globalDeltas,
      stakeholderDeltas,
      scheduledEmailEvents,
      contentUnlocks,
      expected,
      comparison.outcome ? 'TRUE' : 'FALSE'
    );
  });

  return {
    day: completedDay,
    comparisons,
    global_deltas: globalDeltas,
    stakeholder_deltas: stakeholderDeltas,
    resolved_expected_action_ids: resolvedExpectedActionIds,
    content_unlocks: normalizeContentUnlocks(contentUnlocks),
    scheduled_email_events: scheduledEmailEvents,
    status: 'frontend_applied',
    created_at: new Date(resolvedAtMs).toISOString(),
  };
};

export const finalizePendingComparisonsLocally = (
  gameState: GameState,
  roomDefinitions: RoomDefinition[],
  options: { sessionId?: string } = {}
): ComparisonResult[] => {
  const resolvedIds = getResolvedExpectedIds(gameState);
  return gameState.expectedActions
    .filter((expected) => !resolvedIds.has(expected.expected_action_id))
    .map((expected) =>
      resolveExpectedComparison(expected, gameState.canonicalActions, {
        sessionId: options.sessionId ?? DEFAULT_SESSION_ID,
        finalize: true,
        includeNotDone: true,
        resolvedDay: gameState.day,
        currentDay: gameState.day,
        currentTimeSlot: gameState.timeSlot,
        staffRoster: gameState.staffRoster,
        roomDefinitions,
        decisionLog: gameState.decisionLog,
      })
    )
    .filter((comparison): comparison is ComparisonResult => Boolean(comparison));
};

export const resolveExpectedActionStatus = (
  expected: ExpectedAction,
  gameState: GameState,
  roomDefinitions: RoomDefinition[]
): 'active' | 'completed' | 'failed' => {
  const terminal = gameState.comparisons.find(
    (comparison) => comparison.expected_action_id === expected.expected_action_id
      && isTerminalComparison(comparison)
  );
  if (terminal) return terminal.outcome ? 'completed' : 'failed';

  const comparison = resolveExpectedComparison(expected, gameState.canonicalActions, {
    sessionId: gameState.comparisons[0]?.session_id ?? DEFAULT_SESSION_ID,
    currentDay: gameState.day,
    currentTimeSlot: gameState.timeSlot,
    staffRoster: gameState.staffRoster,
    roomDefinitions,
    decisionLog: gameState.decisionLog,
    includeNotDone: false,
  });

  if (!comparison) return 'active';
  return comparison.outcome ? 'completed' : 'failed';
};

export const resolutionHasChanges = (resolution: DailyResolution) =>
  resolution.comparisons.length > 0 ||
  hasAnyDelta(resolution.global_deltas, resolution.stakeholder_deltas) ||
  Boolean(
    resolution.content_unlocks?.sequences?.length ||
    resolution.content_unlocks?.emails?.length ||
    resolution.content_unlocks?.documents?.length
  ) ||
  Boolean(resolution.scheduled_email_events?.length);
