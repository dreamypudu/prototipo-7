import type { CanonicalAction, ExpectedAction, TimeSlotType } from '../types';

const DAY_INDEX_BY_LABEL: Record<string, number> = {
  lunes: 0,
  monday: 0,
  martes: 1,
  tuesday: 1,
  miercoles: 2,
  'miÃ©rcoles': 2,
  wednesday: 2,
  jueves: 3,
  thursday: 3,
  viernes: 4,
  friday: 4,
};

const SLOT_ORDER: Record<TimeSlotType, number> = {
  'maÃ±ana': 0,
  tarde: 1,
  noche: 2,
};

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
  if (value === 'maÃ±ana') return 'AM';
  if (value === 'tarde') return 'PM';
  return normalizeTimeWindowBlock(value);
};

const resolveWeekdayTargetDay = (expected: ExpectedAction): number | null => {
  if (typeof expected.created_day !== 'number') return null;
  const expectedDayIndex = normalizeDayIndex(expected.constraints?.day);
  if (expectedDayIndex === null) return null;
  const createdDayIndex = normalizeDayIndex(expected.created_day);
  if (createdDayIndex === null) return null;
  const currentWeekStart = expected.created_day - createdDayIndex;
  const sameWeekTargetDay = currentWeekStart + expectedDayIndex;
  return sameWeekTargetDay < expected.created_day ? expected.created_day : sameWeekTargetDay;
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

  const slotConstraint = normalizeSlotBlock(expected.constraints?.slot ?? expected.constraints?.time_window);
  if (!slotConstraint) return false;
  const dueSlot: TimeSlotType = slotConstraint === 'AM' ? 'maÃ±ana' : 'tarde';
  return SLOT_ORDER[currentTimeSlot] > SLOT_ORDER[dueSlot];
};

const isVisitInsideWindow = (expected: ExpectedAction, actual: CanonicalAction) => {
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

export const evaluateVisitMatch = (expected: ExpectedAction, actual: CanonicalAction) =>
  actual.target_ref === expected.target_ref && isVisitInsideWindow(expected, actual);

export interface VisitPriorityState {
  status: 'active' | 'completed' | 'failed';
  matchedAction: CanonicalAction | null;
  reason?: string;
}

export interface VisitExpectationState {
  status: 'active' | 'completed' | 'failed';
  matchedAction: CanonicalAction | null;
  reason?: string;
}

export const resolveVisitExpectationState = (
  expected: ExpectedAction,
  canonicalActions: CanonicalAction[],
  currentDay: number,
  currentTimeSlot: TimeSlotType
): VisitExpectationState => {
  const relevantVisits = canonicalActions
    .filter(
      (action) =>
        action.action_type === 'visit_stakeholder' &&
        action.target_ref === expected.target_ref &&
        (!expected.mechanic_id || action.mechanic_id === expected.mechanic_id) &&
        action.committed_at >= expected.created_at
    )
    .sort((a, b) => a.committed_at - b.committed_at);

  const matchingVisit = relevantVisits.find((action) => isVisitInsideWindow(expected, action));
  if (matchingVisit) {
    return { status: 'completed', matchedAction: matchingVisit };
  }

  if (isExpiredBySchedule(expected, currentDay, currentTimeSlot)) {
    return {
      status: 'failed',
      matchedAction: relevantVisits[0] ?? null,
      reason: relevantVisits.length > 0 ? 'time_window_miss' : 'not_done',
    };
  }

  return { status: 'active', matchedAction: null };
};

export const resolveVisitPriorityState = (
  expected: ExpectedAction,
  canonicalActions: CanonicalAction[],
  currentDay: number,
  currentTimeSlot: TimeSlotType
): VisitPriorityState => {
  const relevantVisits = canonicalActions
    .filter(
      (action) =>
        action.action_type === 'visit_stakeholder' &&
        (!expected.mechanic_id || action.mechanic_id === expected.mechanic_id) &&
        action.committed_at >= expected.created_at &&
        isVisitInsideWindow(expected, action)
    )
    .sort((a, b) => a.committed_at - b.committed_at);

  if (relevantVisits.length === 0) {
    if (isExpiredBySchedule(expected, currentDay, currentTimeSlot)) {
      return { status: 'failed', matchedAction: null, reason: 'not_done' };
    }
    return { status: 'active', matchedAction: null };
  }

  const firstVisit = relevantVisits[0];
  if (firstVisit.target_ref === expected.target_ref) {
    return { status: 'completed', matchedAction: firstVisit };
  }

  return {
    status: 'failed',
    matchedAction: firstVisit,
    reason: 'priority_not_respected',
  };
};
