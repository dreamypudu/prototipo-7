import type {
  CanonicalAction,
  ComparisonResult,
  DailyResolution,
  ExpectedAction,
  GameState,
  RoomDefinition,
  StaffMember,
  TimeSlotType,
} from '../types';
import { comparisonRules, type ComparisonRule } from './comparisonRules';
import {
  evaluateVisitMatch as matchesVisitWindow,
  resolveVisitExpectationState,
  resolveVisitPriorityState,
} from './visitPriority';

const BLOCK_HOURS = 4.4;

const DAY_INDEX_BY_LABEL: Record<string, number> = {
  lunes: 0,
  monday: 0,
  martes: 1,
  tuesday: 1,
  miercoles: 2,
  miércoles: 2,
  wednesday: 2,
  jueves: 3,
  thursday: 3,
  viernes: 4,
  friday: 4,
};

const SLOT_ORDER: Record<string, number> = {
  mañana: 0,
  'ma?ana': 0,
  'ma??ana': 0,
  tarde: 1,
  noche: 2,
};

const DEFAULT_RULE_EFFECTS: Record<string, Record<'TRUE' | 'FALSE', Record<string, any>>> = {
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

const normalizeDayIndex = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return ((value - 1) % 5 + 5) % 5;
  }
  if (typeof value === 'string') {
    return DAY_INDEX_BY_LABEL[value.trim().toLowerCase()] ?? null;
  }
  return null;
};

const normalizeTimeWindowBlock = (value: unknown): 'AM' | 'PM' | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === 'AM' || normalized === 'PM') return normalized;
  return null;
};

const normalizeSlotBlock = (value: unknown): 'AM' | 'PM' | null => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'mañana' || normalized === 'ma?ana' || normalized === 'ma??ana') return 'AM';
    if (normalized === 'tarde') return 'PM';
  }
  return normalizeTimeWindowBlock(value);
};

const sameDayLabel = (left: unknown, right: unknown) => {
  const leftIndex = normalizeDayIndex(left);
  const rightIndex = normalizeDayIndex(right);
  if (leftIndex !== null && rightIndex !== null) {
    return leftIndex === rightIndex;
  }
  return String(left ?? '') === String(right ?? '');
};

const pickBestMatch = (
  expected: ExpectedAction,
  matches: CanonicalAction[]
): CanonicalAction => {
  const afterExpected = matches
    .filter((action) => action.committed_at >= expected.created_at)
    .sort((a, b) => a.committed_at - b.committed_at);
  if (afterExpected.length > 0) {
    return afterExpected[0];
  }
  return [...matches].sort((a, b) => a.committed_at - b.committed_at)[0];
};

const resolveWeekdayTargetDay = (expected: ExpectedAction): number | null => {
  if (typeof expected.created_day !== 'number') return null;
  const expectedDayIndex = normalizeDayIndex(expected.constraints?.day);
  if (expectedDayIndex === null) return null;
  const createdDayIndex = normalizeDayIndex(expected.created_day);
  if (createdDayIndex === null) return null;
  const currentWeekStart = expected.created_day - createdDayIndex;
  const sameWeekTargetDay = currentWeekStart + expectedDayIndex;
  return sameWeekTargetDay < expected.created_day ? sameWeekTargetDay + 5 : sameWeekTargetDay;
};

const resolveDueDay = (expected: ExpectedAction): number | null => {
  const targetDay = resolveWeekdayTargetDay(expected);
  if (targetDay === null) return null;
  const graceDays = Number(expected.constraints?.grace_days ?? 0);
  return targetDay + (Number.isFinite(graceDays) ? graceDays : 0);
};

const isExpiredBySchedule = (
  expected: ExpectedAction,
  currentDay: number,
  currentTimeSlot: TimeSlotType
): boolean => {
  const dueDay = resolveDueDay(expected);
  if (dueDay === null) return false;
  if (currentDay > dueDay) return true;
  if (currentDay < dueDay) return false;

  const slotConstraint = normalizeTimeWindowBlock(expected.constraints?.slot ?? expected.constraints?.time_window);
  if (!slotConstraint) return false;
  const dueSlot: TimeSlotType = slotConstraint === 'AM' ? 'mañana' : 'tarde';
  return (SLOT_ORDER[currentTimeSlot] ?? 0) > (SLOT_ORDER[dueSlot] ?? 0);
};

const getWeekSchedule = (action: CanonicalAction): Array<Record<string, any>> => {
  if (!action.value_final || typeof action.value_final !== 'object') return [];
  const schedule = (action.value_final as Record<string, any>).week_schedule;
  return Array.isArray(schedule) ? schedule : [];
};

const getRoomById = (roomDefinitions: RoomDefinition[], roomId?: string | null) =>
  roomId ? roomDefinitions.find((room) => room.id === roomId) : undefined;

const getStaffById = (staffRoster: StaffMember[], staffId?: string | null) =>
  staffId ? staffRoster.find((staff) => staff.id === staffId) : undefined;

const matchesScheduleConstraints = (
  assignment: Record<string, any>,
  constraints: Record<string, any>,
  staffRoster: StaffMember[],
  roomDefinitions: RoomDefinition[]
) => {
  if (constraints.day_name && !sameDayLabel(assignment.day, constraints.day_name)) return false;
  if (constraints.staff_id && assignment.staff_id !== constraints.staff_id) return false;
  if (constraints.activity && assignment.activity !== constraints.activity) return false;
  if (constraints.room_id && assignment.room_id !== constraints.room_id) return false;

  const timeWindowBlock = normalizeTimeWindowBlock(constraints.time_window);
  if (timeWindowBlock && assignment.block !== timeWindowBlock) return false;

  if (constraints.target_sector_id) {
    if (constraints.staff_id) {
      const room = getRoomById(roomDefinitions, assignment.room_id);
      if (!room || room.sector !== constraints.target_sector_id) return false;
    } else {
      const staff = getStaffById(staffRoster, assignment.staff_id);
      if (!staff || staff.sectorId !== constraints.target_sector_id) return false;
    }
  }

  return true;
};

const matchesScheduleSlot = (
  assignment: Record<string, any>,
  constraints: Record<string, any>
) => {
  if (constraints.day_name && !sameDayLabel(assignment.day, constraints.day_name)) return false;
  if (constraints.room_id && assignment.room_id !== constraints.room_id) return false;

  const timeWindowBlock = normalizeTimeWindowBlock(constraints.time_window);
  if (timeWindowBlock && assignment.block !== timeWindowBlock) return false;

  return true;
};

const isBoxRoomId = (roomId: unknown) =>
  typeof roomId === 'string' && roomId.startsWith('BOX_');

const evaluateExecuteWeekMatch = (
  expected: ExpectedAction,
  actual: CanonicalAction,
  staffRoster: StaffMember[],
  roomDefinitions: RoomDefinition[]
) => {
  const constraints = expected.constraints ?? {};
  const weekSchedule = getWeekSchedule(actual);
  if (weekSchedule.length === 0) return false;

  if (expected.rule_id === 'reserve_room_for_sector_rule_v1') {
    const slotAssignments = weekSchedule.filter((assignment) =>
      matchesScheduleSlot(assignment, constraints)
    );

    if (slotAssignments.length === 0) return false;

    return slotAssignments.every((assignment) =>
      matchesScheduleConstraints(assignment, constraints, staffRoster, roomDefinitions)
    );
  }

  if (expected.rule_id === 'keep_staff_in_sector_rule_v1') {
    const timeWindowBlock = normalizeTimeWindowBlock(constraints.time_window);
    const staffAssignments = weekSchedule.filter((assignment) => {
      if (constraints.day_name && !sameDayLabel(assignment.day, constraints.day_name)) return false;
      if (constraints.staff_id && assignment.staff_id !== constraints.staff_id) return false;
      if (timeWindowBlock && assignment.block !== timeWindowBlock) return false;
      return true;
    });

    if (staffAssignments.length === 0) return false;
    return staffAssignments.some((assignment) => isBoxRoomId(assignment.room_id));
  }

  const matchingAssignments = weekSchedule.filter((assignment) =>
    matchesScheduleConstraints(assignment, constraints, staffRoster, roomDefinitions)
  );

  const minHours = Number(constraints.min_hours);
  if (Number.isFinite(minHours) && minHours > 0) {
    return matchingAssignments.length * BLOCK_HOURS >= minHours;
  }

  return matchingAssignments.length > 0;
};

const evaluateVisitMatch = (expected: ExpectedAction, actual: CanonicalAction) => {
  const actualValue = actual.value_final && typeof actual.value_final === 'object' ? actual.value_final : {};
  const actualDay = Number((actualValue as Record<string, any>).day ?? 0);
  const targetDay = resolveWeekdayTargetDay(expected);
  const dueDay = resolveDueDay(expected);
  if (targetDay !== null && (actualDay < targetDay || (dueDay !== null && actualDay > dueDay))) {
    return false;
  }

  const expectedSlot = normalizeSlotBlock(expected.constraints?.slot ?? expected.constraints?.time_window);
  if (!expectedSlot) return true;
  const actualSlot = normalizeSlotBlock((actualValue as Record<string, any>).time_slot);
  return !actualSlot || actualSlot === expectedSlot;
};

const applyRule = (
  expected: ExpectedAction,
  actual: CanonicalAction
): { outcome: ComparisonResult['outcome']; deviation?: any } => {
  const rule: ComparisonRule | undefined = comparisonRules[expected.rule_id];
  if (!rule) {
    return {
      outcome: 'DEVIATION',
      deviation: { reason: 'missing_rule', rule_id: expected.rule_id },
    };
  }
  return rule(expected, actual);
};

const resolveEffectPayload = (expected: ExpectedAction, outcome: 'TRUE' | 'FALSE') => {
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
  expected: ExpectedAction,
  outcome: 'TRUE' | 'FALSE'
) => {
  const effect = resolveEffectPayload(expected, outcome);
  Object.entries(effect.global ?? {}).forEach(([key, value]) => {
    globalDeltas[key] = (globalDeltas[key] ?? 0) + Number(value || 0);
  });

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

const resolveExpectedComparison = (
  expected: ExpectedAction,
  gameState: GameState,
  roomDefinitions: RoomDefinition[],
  options?: { finalize?: boolean; resolvedDay?: number }
): ComparisonResult | null => {
  if (expected.rule_id === 'visit_priority_rule_v1') {
    const priorityState = resolveVisitPriorityState(
      expected,
      gameState.canonicalActions,
      gameState.day,
      gameState.timeSlot
    );

    if (priorityState.status === 'completed' && priorityState.matchedAction) {
      return {
        expected_action_id: expected.expected_action_id,
        canonical_action_id: priorityState.matchedAction.canonical_action_id,
        outcome: 'DONE_OK',
        rule_id: expected.rule_id,
        resolved_day: options?.resolvedDay,
      };
    }

    if (priorityState.status === 'failed') {
      return {
        expected_action_id: expected.expected_action_id,
        canonical_action_id: priorityState.matchedAction?.canonical_action_id ?? null,
        outcome: priorityState.reason === 'priority_not_respected' ? 'DEVIATION' : 'NOT_DONE',
        deviation: priorityState.reason ? { reason: priorityState.reason } : undefined,
        rule_id: expected.rule_id,
        resolved_day: options?.resolvedDay,
      };
    }

    return options?.finalize ? {
      expected_action_id: expected.expected_action_id,
      canonical_action_id: null,
      outcome: 'NOT_DONE',
      rule_id: expected.rule_id,
      resolved_day: options?.resolvedDay,
    } : null;
  }

  if (expected.action_type === 'visit_stakeholder') {
    const visitState = resolveVisitExpectationState(
      expected,
      gameState.canonicalActions,
      gameState.day,
      gameState.timeSlot
    );

    if (visitState.status === 'completed' && visitState.matchedAction) {
      return {
        expected_action_id: expected.expected_action_id,
        canonical_action_id: visitState.matchedAction.canonical_action_id,
        outcome: 'DONE_OK',
        rule_id: expected.rule_id,
        resolved_day: options?.resolvedDay,
      };
    }

    if (visitState.status === 'failed') {
      return {
        expected_action_id: expected.expected_action_id,
        canonical_action_id: visitState.matchedAction?.canonical_action_id ?? null,
        outcome: visitState.reason === 'time_window_miss' ? 'DEVIATION' : 'NOT_DONE',
        deviation: visitState.reason ? { reason: visitState.reason } : undefined,
        rule_id: expected.rule_id,
        resolved_day: options?.resolvedDay,
      };
    }

    return options?.finalize ? {
      expected_action_id: expected.expected_action_id,
      canonical_action_id: null,
      outcome: 'NOT_DONE',
      rule_id: expected.rule_id,
      resolved_day: options?.resolvedDay,
    } : null;
  }

  const matches = gameState.canonicalActions.filter(
    (action) =>
      action.action_type === expected.action_type &&
      action.target_ref === expected.target_ref &&
      (!expected.mechanic_id || action.mechanic_id === expected.mechanic_id)
  );

  if (matches.length > 0) {
    if (expected.action_type === 'execute_week') {
      const matchingAction = matches.find((action) =>
        evaluateExecuteWeekMatch(expected, action, gameState.staffRoster, roomDefinitions)
      );
      if (matchingAction) {
        return {
          expected_action_id: expected.expected_action_id,
          canonical_action_id: matchingAction.canonical_action_id,
          outcome: 'DONE_OK',
          rule_id: expected.rule_id,
          resolved_day: options?.resolvedDay,
        };
      }
      const best = pickBestMatch(expected, matches);
      return {
        expected_action_id: expected.expected_action_id,
        canonical_action_id: best.canonical_action_id,
        outcome: 'DEVIATION',
        deviation: { reason: 'constraints_not_met' },
        rule_id: expected.rule_id,
        resolved_day: options?.resolvedDay,
      };
    }

    const best = pickBestMatch(expected, matches);
    const result = applyRule(expected, best);
    return {
      expected_action_id: expected.expected_action_id,
      canonical_action_id: best.canonical_action_id,
      outcome: result.outcome,
      deviation: result.deviation,
      rule_id: expected.rule_id,
      resolved_day: options?.resolvedDay,
    };
  }

  if (options?.finalize || isExpiredBySchedule(expected, gameState.day, gameState.timeSlot)) {
    return {
      expected_action_id: expected.expected_action_id,
      canonical_action_id: null,
      outcome: 'NOT_DONE',
      rule_id: expected.rule_id,
      resolved_day: options?.resolvedDay,
    };
  }

  return null;
};

const getResolvedExpectedIds = (gameState: GameState) => {
  const ids = new Set<string>(gameState.resolvedExpectedActionIds ?? []);
  (gameState.comparisons ?? []).forEach((comparison) => ids.add(comparison.expected_action_id));
  return ids;
};

export const resolveDayEffectsLocally = (
  gameState: GameState,
  completedDay: number,
  roomDefinitions: RoomDefinition[]
): DailyResolution => {
  const resolvedIds = getResolvedExpectedIds(gameState);
  const comparisons: ComparisonResult[] = [];
  const globalDeltas: Record<string, number> = {};
  const stakeholderDeltas: Record<string, Record<string, number>> = {};
  const resolvedExpectedActionIds: string[] = [];

  gameState.expectedActions.forEach((expected) => {
    if (resolvedIds.has(expected.expected_action_id)) return;
    const comparison = resolveExpectedComparison(expected, gameState, roomDefinitions, {
      resolvedDay: completedDay,
    });
    if (!comparison) return;

    comparisons.push(comparison);
    resolvedExpectedActionIds.push(expected.expected_action_id);
    applyEffects(
      globalDeltas,
      stakeholderDeltas,
      expected,
      comparison.outcome === 'DONE_OK' ? 'TRUE' : 'FALSE'
    );
  });

  return {
    day: completedDay,
    comparisons,
    global_deltas: globalDeltas,
    stakeholder_deltas: stakeholderDeltas,
    resolved_expected_action_ids: resolvedExpectedActionIds,
    status: 'frontend_applied',
    created_at: new Date().toISOString(),
  };
};

export const finalizePendingComparisonsLocally = (
  gameState: GameState,
  roomDefinitions: RoomDefinition[]
): ComparisonResult[] => {
  const resolvedIds = getResolvedExpectedIds(gameState);
  return gameState.expectedActions
    .filter((expected) => !resolvedIds.has(expected.expected_action_id))
    .map((expected) =>
      resolveExpectedComparison(expected, gameState, roomDefinitions, {
        finalize: true,
        resolvedDay: gameState.day,
      })
    )
    .filter((comparison): comparison is ComparisonResult => Boolean(comparison));
};

export const resolutionHasChanges = (resolution: DailyResolution) =>
  resolution.comparisons.length > 0 || hasAnyDelta(resolution.global_deltas, resolution.stakeholder_deltas);
