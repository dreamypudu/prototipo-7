import type { CanonicalAction, ExpectedAction, RoomDefinition, StaffMember, TimeSlotType } from '../../../types';
import type { MechanicRuleContext, MechanicRuleEvaluation, MechanicRuleResolution } from '../../types';
import {
  getMatchingActions,
  isRecord,
} from '../../../services/comparisonRuleUtils';

const BLOCK_HOURS = 4.4;

const normalizeText = (value: unknown) =>
  String(value ?? '')
    .replace(/\u00c3\u00b1/g, 'n')
    .replace(/\u00c3\u00a9/g, 'e')
    .replace(/\u00f1/g, 'n')
    .replace(/\u00e9/g, 'e')
    .replace(/ma\?\?ana/g, 'manana')
    .replace(/ma\?ana/g, 'manana')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const normalizeDayIndex = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return ((value - 1) % 5 + 5) % 5;
  }

  const normalized = normalizeText(value);
  if (!normalized) return null;
  if (/^\d+$/.test(normalized)) {
    return ((Number(normalized) - 1) % 5 + 5) % 5;
  }

  const byLabel: Record<string, number> = {
    lunes: 0,
    monday: 0,
    martes: 1,
    tuesday: 1,
    miercoles: 2,
    wednesday: 2,
    jueves: 3,
    thursday: 3,
    viernes: 4,
    friday: 4,
  };
  return byLabel[normalized] ?? null;
};

const normalizeTimeWindowBlock = (value: unknown): 'AM' | 'PM' | null => {
  const normalized = normalizeText(value).toUpperCase();
  if (normalized === 'AM' || normalized === 'MORNING' || normalized === 'MANANA') return 'AM';
  if (normalized === 'PM' || normalized === 'TARDE' || normalized === 'AFTERNOON' || normalized === 'NOCHE') return 'PM';
  return null;
};

const slotOrder = (value: unknown) => {
  const block = normalizeTimeWindowBlock(value);
  if (block === 'AM') return 0;
  if (block === 'PM') return 1;
  if (normalizeText(value) === 'noche') return 2;
  return 0;
};

const sameDayLabel = (left: unknown, right: unknown) => {
  const leftIndex = normalizeDayIndex(left);
  const rightIndex = normalizeDayIndex(right);
  if (leftIndex !== null && rightIndex !== null) return leftIndex === rightIndex;
  return normalizeText(left) === normalizeText(right);
};

const resolveWeekdayTargetDay = (expected: ExpectedAction): number | null => {
  if (typeof expected.created_day !== 'number') return null;
  const expectedDayIndex = normalizeDayIndex(expected.constraints?.day ?? expected.constraints?.day_name);
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
  currentDay?: number,
  currentTimeSlot?: TimeSlotType
): boolean => {
  if (typeof currentDay !== 'number' || !currentTimeSlot) return false;
  const dueDay = resolveDueDay(expected);
  if (dueDay === null) return false;
  if (currentDay > dueDay) return true;
  if (currentDay < dueDay) return false;

  const slotConstraint = normalizeTimeWindowBlock(expected.constraints?.slot ?? expected.constraints?.time_window);
  if (!slotConstraint) return false;
  const dueSlot = slotConstraint === 'AM' ? 'manana' : 'tarde';
  return slotOrder(currentTimeSlot) > slotOrder(dueSlot);
};

const getWeekSchedule = (action: CanonicalAction): Array<Record<string, any>> => {
  if (!isRecord(action.value_final)) return [];
  const payload = isRecord(action.value_final.mechanic_payload) ? action.value_final.mechanic_payload : {};
  const schedule = payload.week_schedule ?? action.value_final.week_schedule;
  return Array.isArray(schedule) ? schedule : [];
};

const getRoomById = (roomDefinitions: RoomDefinition[], roomId?: string | null) =>
  roomId ? roomDefinitions.find((room) => room.id === roomId) : undefined;

const getStaffById = (staffRoster: StaffMember[], staffId?: string | null) =>
  staffId ? staffRoster.find((staff) => staff.id === staffId) : undefined;

const matchesScheduleSlot = (
  assignment: Record<string, any>,
  constraints: Record<string, any>
) => {
  if (constraints.day_name && !sameDayLabel(assignment.day, constraints.day_name)) return false;
  if (constraints.day && !sameDayLabel(assignment.day, constraints.day)) return false;
  if (constraints.room_id && assignment.room_id !== constraints.room_id) return false;

  const timeWindowBlock = normalizeTimeWindowBlock(constraints.time_window ?? constraints.slot);
  if (timeWindowBlock && normalizeTimeWindowBlock(assignment.block) !== timeWindowBlock) return false;

  return true;
};

const matchesScheduleConstraints = (
  assignment: Record<string, any>,
  constraints: Record<string, any>,
  staffRoster: StaffMember[],
  roomDefinitions: RoomDefinition[]
) => {
  if (!matchesScheduleSlot(assignment, constraints)) return false;
  if (constraints.staff_id && assignment.staff_id !== constraints.staff_id) return false;
  if (constraints.activity && assignment.activity !== constraints.activity) return false;

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

const isBoxRoomId = (roomId: unknown) =>
  typeof roomId === 'string' && roomId.startsWith('BOX_');

const diagnoseScheduleFailure = (
  weekSchedule: Array<Record<string, any>>,
  constraints: Record<string, any>,
  staffRoster: StaffMember[],
  roomDefinitions: RoomDefinition[],
  extra?: Record<string, any>
): MechanicRuleEvaluation => {
  if (weekSchedule.length === 0) {
    return {
      outcome: false,
      reason: 'not_done',
      rawDeviation: { reason: 'not_done', constraints, ...extra },
    };
  }

  let candidates = weekSchedule;

  if ((constraints.day_name || constraints.day) && !candidates.some((assignment) =>
    sameDayLabel(assignment.day, constraints.day_name ?? constraints.day)
  )) {
    return {
      outcome: false,
      reason: 'wrong_day',
      rawDeviation: { reason: 'wrong_day', constraints, week_schedule: weekSchedule, ...extra },
    };
  }
  if (constraints.day_name || constraints.day) {
    candidates = candidates.filter((assignment) => sameDayLabel(assignment.day, constraints.day_name ?? constraints.day));
  }

  const expectedBlock = normalizeTimeWindowBlock(constraints.time_window ?? constraints.slot);
  if (expectedBlock && !candidates.some((assignment) => normalizeTimeWindowBlock(assignment.block) === expectedBlock)) {
    return {
      outcome: false,
      reason: 'wrong_time',
      rawDeviation: { reason: 'wrong_time', constraints, week_schedule: weekSchedule, ...extra },
    };
  }
  if (expectedBlock) {
    candidates = candidates.filter((assignment) => normalizeTimeWindowBlock(assignment.block) === expectedBlock);
  }

  if (constraints.room_id && !candidates.some((assignment) => assignment.room_id === constraints.room_id)) {
    return {
      outcome: false,
      reason: 'wrong_room',
      rawDeviation: { reason: 'wrong_room', constraints, week_schedule: weekSchedule, ...extra },
    };
  }

  if (constraints.staff_id && !candidates.some((assignment) => assignment.staff_id === constraints.staff_id)) {
    return {
      outcome: false,
      reason: 'wrong_resource',
      rawDeviation: { reason: 'wrong_resource', constraints, week_schedule: weekSchedule, ...extra },
    };
  }

  if (constraints.activity && !candidates.some((assignment) => assignment.activity === constraints.activity)) {
    return {
      outcome: false,
      reason: 'wrong_activity',
      rawDeviation: { reason: 'wrong_activity', constraints, week_schedule: weekSchedule, ...extra },
    };
  }

  if (constraints.target_sector_id && !candidates.some((assignment) =>
    matchesScheduleConstraints(assignment, constraints, staffRoster, roomDefinitions)
  )) {
    return {
      outcome: false,
      reason: 'wrong_resource',
      rawDeviation: { reason: 'wrong_resource', constraints, week_schedule: weekSchedule, ...extra },
    };
  }

  return {
    outcome: false,
    reason: 'other_rule_failed',
    rawDeviation: { reason: 'other_rule_failed', constraints, week_schedule: weekSchedule, ...extra },
  };
};

export const evaluateExecuteWeekRule = (
  expected: ExpectedAction,
  actual: CanonicalAction,
  staffRoster: StaffMember[],
  roomDefinitions: RoomDefinition[]
): MechanicRuleEvaluation => {
  const constraints = expected.constraints ?? {};
  const weekSchedule = getWeekSchedule(actual);
  if (weekSchedule.length === 0) {
    return {
      outcome: false,
      reason: 'not_done',
      rawDeviation: { reason: 'not_done', constraints },
    };
  }

  if (expected.rule_id === 'reserve_room_for_sector_rule_v1') {
    const slotAssignments = weekSchedule.filter((assignment) => matchesScheduleSlot(assignment, constraints));
    if (slotAssignments.length === 0) {
      return diagnoseScheduleFailure(weekSchedule, constraints, staffRoster, roomDefinitions);
    }

    const allValid = slotAssignments.every((assignment) =>
      matchesScheduleConstraints(assignment, constraints, staffRoster, roomDefinitions)
    );
    if (allValid) return { outcome: true };

    return diagnoseScheduleFailure(weekSchedule, constraints, staffRoster, roomDefinitions, {
      matching_slot_assignments: slotAssignments,
    });
  }

  if (expected.rule_id === 'keep_staff_in_sector_rule_v1') {
    const expectedBlock = normalizeTimeWindowBlock(constraints.time_window ?? constraints.slot);
    const staffAssignments = weekSchedule.filter((assignment) => {
      if ((constraints.day_name || constraints.day) && !sameDayLabel(assignment.day, constraints.day_name ?? constraints.day)) return false;
      if (constraints.staff_id && assignment.staff_id !== constraints.staff_id) return false;
      if (expectedBlock && normalizeTimeWindowBlock(assignment.block) !== expectedBlock) return false;
      return true;
    });

    if (staffAssignments.length === 0) {
      return diagnoseScheduleFailure(weekSchedule, constraints, staffRoster, roomDefinitions);
    }
    if (staffAssignments.some((assignment) => isBoxRoomId(assignment.room_id))) return { outcome: true };

    return {
      outcome: false,
      reason: 'wrong_room',
      rawDeviation: {
        reason: 'wrong_room',
        constraints,
        matching_staff_assignments: staffAssignments,
      },
    };
  }

  const matchingAssignments = weekSchedule.filter((assignment) =>
    matchesScheduleConstraints(assignment, constraints, staffRoster, roomDefinitions)
  );

  const minHours = Number(constraints.min_hours);
  if (Number.isFinite(minHours) && minHours > 0) {
    const assignedHours = matchingAssignments.length * BLOCK_HOURS;
    if (assignedHours >= minHours) return { outcome: true };
    return {
      outcome: false,
      reason: 'wrong_time',
      rawDeviation: {
        reason: 'wrong_time',
        constraints,
        assigned_hours: assignedHours,
        required_hours: minHours,
        matching_assignments: matchingAssignments,
      },
    };
  }

  if (matchingAssignments.length > 0) return { outcome: true };
  return diagnoseScheduleFailure(weekSchedule, constraints, staffRoster, roomDefinitions);
};

export const resolveExecuteWeekRule = (
  expected: ExpectedAction,
  ruleContext: MechanicRuleContext
): MechanicRuleResolution | null => {
  const matches = getMatchingActions(expected, ruleContext.canonicalActions);

  if (matches.length > 0) {
    const afterExpected = matches
      .filter((action) => action.committed_at >= expected.created_at)
      .sort((a, b) => a.committed_at - b.committed_at);
    const candidates = afterExpected.length > 0
      ? afterExpected
      : [...matches].sort((a, b) => a.committed_at - b.committed_at);
    const evaluated = candidates.map((action) => ({
      action,
      evaluation: evaluateExecuteWeekRule(expected, action, ruleContext.staffRoster, ruleContext.roomDefinitions),
    }));
    const resolved = evaluated.find((entry) => entry.evaluation.outcome) ?? evaluated[evaluated.length - 1];

    return {
      canonicalAction: resolved.action,
      evaluation: resolved.evaluation,
    };
  }

  if (
    ruleContext.finalize ||
    ruleContext.includeNotDone ||
    isExpiredBySchedule(expected, ruleContext.currentDay, ruleContext.currentTimeSlot)
  ) {
    return {
      canonicalAction: null,
      evaluation: { outcome: false, reason: 'not_done', rawDeviation: { reason: 'not_done' } },
    };
  }

  return null;
};
