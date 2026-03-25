import { comparisonRules } from './comparisonRules';
import {
  evaluateVisitMatch as matchesVisitWindow,
  resolveVisitExpectationState,
  resolveVisitPriorityState,
} from './visitPriority';
import type {
  CaseDefinition,
  CaseGoalDefinition,
  CaseGoalSnapshot,
  CanonicalAction,
  ConditionGroup,
  ExpectedAction,
  GameState,
  RoomDefinition,
  StaffMember,
  Stakeholder,
  TimeSlotType,
} from '../types';

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

const ACTIVITY_LABELS: Record<string, string> = {
  CLINICAL: 'Atención Clínica',
  ADMIN: 'Trabajo Administrativo',
  TRAINING: 'Capacitación',
  TERRAIN: 'Trabajo en Terreno',
};

const SECTOR_LABELS: Record<string, string> = {
  AZUL: 'Sector Azul',
  ROJO: 'Sector Rojo',
  AMARILLO: 'Sector Amarillo',
  ADMIN: 'Administración',
  COMMON: 'Auditorio',
  OUTSIDE: 'Terreno',
};

const compare = (left: number, op: string, right: number): boolean => {
  switch (op) {
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '==':
      return left === right;
    default:
      return false;
  }
};

export const evaluateConditionGroup = (state: GameState, group?: ConditionGroup): boolean => {
  if (!group) return true;
  const allConditions = group.all ?? [];
  const anyConditions = group.any ?? [];

  const allOk = allConditions.every((condition) => {
    switch (condition.kind) {
      case 'global_metric': {
        const value = Number(state[condition.metric] ?? 0);
        return compare(value, condition.op, condition.value);
      }
      case 'stakeholder_metric': {
        const stakeholder = state.stakeholders.find((entry) => entry.id === condition.stakeholderId);
        if (!stakeholder) return false;
        const value = Number(stakeholder[condition.metric] ?? 0);
        return compare(value, condition.op, condition.value);
      }
      case 'completed_sequence':
        return state.completedSequences.includes(condition.sequenceId);
      case 'completed_scenario':
        return state.completedScenarios.includes(condition.scenarioId);
      case 'expected_action': {
        const minCount = condition.minCount ?? 1;
        const count = state.canonicalActions.filter((action) => {
          if (condition.actionType && action.action_type !== condition.actionType) return false;
          if (condition.targetRefIncludes && !String(action.target_ref).includes(condition.targetRefIncludes)) return false;
          return true;
        }).length;
        return count >= minCount;
      }
      case 'promise_outcome': {
        const minCount = condition.minCount ?? 1;
        const matchingExpectedIds = new Set(
          state.expectedActions
            .filter((expected) => {
              if (condition.sourceNodeId && expected.source?.node_id !== condition.sourceNodeId) return false;
              if (condition.sourceOptionId && expected.source?.option_id !== condition.sourceOptionId) return false;
              if (condition.ruleId && expected.rule_id !== condition.ruleId) return false;
              if (condition.actionType && expected.action_type !== condition.actionType) return false;
              if (condition.targetRefIncludes && !String(expected.target_ref).includes(condition.targetRefIncludes)) return false;
              if (condition.stakeholderId && expected.stakeholder_id !== condition.stakeholderId) return false;
              return true;
            })
            .map((expected) => expected.expected_action_id)
        );
        if (matchingExpectedIds.size === 0) return false;
        const allowedOutcomes = new Set(condition.outcomeIn ?? ['DONE_OK', 'NOT_DONE', 'DEVIATION']);
        const count = state.comparisons.filter((comparison) =>
          matchingExpectedIds.has(comparison.expected_action_id) && allowedOutcomes.has(comparison.outcome)
        ).length;
        return count >= minCount;
      }
      default:
        return false;
    }
  });

  if (!allOk) return false;
  if (anyConditions.length === 0) return true;
  return anyConditions.some((condition) =>
    evaluateConditionGroup(state, {
      all: [condition],
    })
  );
};

export const buildCaseGoalSnapshot = (definition: CaseGoalDefinition, state: GameState): CaseGoalSnapshot => {
  const failed = definition.failure ? evaluateConditionGroup(state, definition.failure) : false;
  if (failed) {
    return { goal_id: definition.goal_id, status: 'failed', progressLabel: 'Fallido' };
  }
  const completed = evaluateConditionGroup(state, definition.success);
  if (completed) {
    return { goal_id: definition.goal_id, status: 'completed', progressLabel: 'Completado' };
  }
  return { goal_id: definition.goal_id, status: 'in_progress', progressLabel: 'En progreso' };
};

export const shouldRevealCaseForSequence = (definition: CaseDefinition, sequenceId: string): boolean => {
  return definition.revealedBySequenceIds.includes(sequenceId) || definition.revealedBySequenceIds.includes('*');
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
  if (leftIndex !== null && rightIndex !== null) return leftIndex === rightIndex;
  return String(left ?? '') === String(right ?? '');
};

const pickBestMatch = (expected: ExpectedAction, matches: CanonicalAction[]): CanonicalAction | null => {
  const afterExpected = matches
    .filter((action) => action.committed_at >= expected.created_at)
    .sort((a, b) => a.committed_at - b.committed_at);
  if (afterExpected.length > 0) {
    return afterExpected[0];
  }
  if (matches.length === 0) return null;
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

  const slotConstraint = normalizeSlotBlock(expected.constraints?.slot ?? expected.constraints?.time_window);
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

export type CommitmentStatus = 'active' | 'completed' | 'failed';

export interface CommitmentTextContext {
  expected: ExpectedAction;
  stakeholders: Stakeholder[];
  staffRoster: StaffMember[];
  roomDefinitions: RoomDefinition[];
}

export interface CommitmentDisplayItem {
  expectedActionId: string;
  stakeholderId?: string;
  stakeholderName?: string;
  title: string;
  description: string;
  status: CommitmentStatus;
  createdAt: number;
}

const resolveStakeholderName = (
  stakeholderId: string | undefined,
  stakeholders: Stakeholder[],
  staffRoster: StaffMember[]
) => {
  if (!stakeholderId) return undefined;
  return (
    stakeholders.find((stakeholder) => stakeholder.id === stakeholderId)?.name ??
    staffRoster.find((staff) => staff.id === stakeholderId)?.name ??
    stakeholderId
  );
};

const resolveTargetStakeholderName = (targetRef: string, stakeholders: Stakeholder[], staffRoster: StaffMember[]) => {
  if (!targetRef.startsWith('stakeholder:')) return undefined;
  return resolveStakeholderName(targetRef.split(':', 2)[1], stakeholders, staffRoster);
};

const resolveRoomName = (roomId: string | undefined, roomDefinitions: RoomDefinition[]) =>
  roomId ? getRoomById(roomDefinitions, roomId)?.name ?? roomId : undefined;

const resolveSectorLabel = (sectorId: string | undefined) => (sectorId ? SECTOR_LABELS[sectorId] ?? sectorId : undefined);

const resolveActivityLabel = (activity: string | undefined) => (activity ? ACTIVITY_LABELS[activity] ?? activity : undefined);

const resolveScheduleDayLabel = (dayName: string | undefined) => (dayName ? dayName : undefined);

const buildCompactDetail = (...parts: Array<string | undefined | null>) =>
  parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' - ');

const fallbackCommitmentText = ({ expected, stakeholders, staffRoster }: CommitmentTextContext) => ({
  title:
    resolveTargetStakeholderName(expected.target_ref, stakeholders, staffRoster) ??
    `Registrar ${expected.action_type.replace(/_/g, ' ')}`,
  description: 'Accion pendiente.',
});

type CommitmentTemplate = (context: CommitmentTextContext) => { title: string; description: string };

const RULE_TEMPLATES: Record<string, CommitmentTemplate> = {
  visit_priority_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const stakeholderName = resolveTargetStakeholderName(expected.target_ref, stakeholders, staffRoster) ?? 'el NPC indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name ?? expected.constraints?.day);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window ?? expected.constraints?.slot);
    return {
      title: `Priorizar reunion con ${stakeholderName}`,
      description: buildCompactDetail(dayLabel, timeWindow) || 'Visita prioritaria.',
    };
  },
  visit_stakeholder_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const stakeholderName = resolveTargetStakeholderName(expected.target_ref, stakeholders, staffRoster) ?? 'el NPC indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name ?? expected.constraints?.day);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window ?? expected.constraints?.slot);
    return {
      title: `Visitar a ${stakeholderName}`,
      description: buildCompactDetail(dayLabel, timeWindow) || 'Seguimiento pendiente.',
    };
  },
  research_hours_rule_v1: ({ expected, stakeholders, staffRoster, roomDefinitions }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const activityLabel = resolveActivityLabel(expected.constraints?.activity) ?? 'la actividad indicada';
    const minHours = expected.constraints?.min_hours;
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions);
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: `Reservar ${activityLabel}`,
      description: buildCompactDetail(staffName, roomName, dayLabel, timeWindow, minHours ? `${minHours}h` : undefined) || 'Bloque pendiente.',
    };
  },
  training_commitment_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const minHours = expected.constraints?.min_hours;
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: 'Programar capacitacion',
      description: buildCompactDetail(staffName, dayLabel, timeWindow, minHours ? `${minHours}h` : undefined) || 'Capacitacion pendiente.',
    };
  },
  cross_sector_help_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    return {
      title: 'Reasignar apoyo',
      description: buildCompactDetail(staffName, sectorLabel) || 'Apoyo pendiente.',
    };
  },
  reserve_room_for_sector_rule_v1: ({ expected, roomDefinitions }) => {
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions) ?? 'el box indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: `Reservar ${roomName}`,
      description: buildCompactDetail(sectorLabel, dayLabel, timeWindow) || 'Reserva pendiente.',
    };
  },
  keep_staff_in_sector_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'su sector';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: `Mantener a ${staffName}`,
      description: buildCompactDetail(sectorLabel, dayLabel, timeWindow) || 'Permanencia pendiente.',
    };
  },
  emergency_room_rule_v1: ({ expected, roomDefinitions }) => {
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions) ?? 'el box indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: `Abrir ${roomName} para contingencia`,
      description: buildCompactDetail(sectorLabel, dayLabel, timeWindow) || 'Contingencia pendiente.',
    };
  },
};

const ACTION_TEMPLATES: Record<string, CommitmentTemplate> = {
  'map:visit_stakeholder': RULE_TEMPLATES.visit_stakeholder_rule_v1,
  'scheduler:execute_week': ({ expected, roomDefinitions, stakeholders, staffRoster }) => ({
    title: resolveRoomName(expected.constraints?.room_id, roomDefinitions)
      ? `Ajustar planificación semanal`
      : `Confirmar planificación semanal`,
    description:
      RULE_TEMPLATES[expected.rule_id]?.({ expected, roomDefinitions, stakeholders, staffRoster }).description ??
      'Debes reflejar esta decisión al ejecutar la planificación.',
  }),
};

export const describeExpectedAction = (context: CommitmentTextContext) => {
  if (context.expected.ui?.title) {
    return {
      title: context.expected.ui.title,
      description: context.expected.ui.description ?? '',
    };
  }

  const byRule = RULE_TEMPLATES[context.expected.rule_id];
  if (byRule) return byRule(context);

  const byAction = ACTION_TEMPLATES[`${context.expected.mechanic_id ?? 'unknown'}:${context.expected.action_type}`];
  if (byAction) return byAction(context);

  const fallbackRule = comparisonRules[context.expected.rule_id];
  if (fallbackRule && context.expected.target_ref.startsWith('stakeholder:')) {
    const stakeholderName = resolveTargetStakeholderName(context.expected.target_ref, context.stakeholders, context.staffRoster) ?? 'el NPC indicado';
    return {
      title: `Seguimiento con ${stakeholderName}`,
      description: 'La decisión dejó un compromiso asociado a este NPC.',
    };
  }

  return fallbackCommitmentText(context);
};

export const resolveCommitmentStatus = (
  expected: ExpectedAction,
  gameState: GameState,
  roomDefinitions: RoomDefinition[]
): CommitmentStatus => {
  if (expected.rule_id === 'visit_priority_rule_v1') {
    return resolveVisitPriorityState(
      expected,
      gameState.canonicalActions,
      gameState.day,
      gameState.timeSlot
    ).status;
  }

  if (expected.action_type === 'visit_stakeholder') {
    return resolveVisitExpectationState(
      expected,
      gameState.canonicalActions,
      gameState.day,
      gameState.timeSlot
    ).status;
  }

  const matches = gameState.canonicalActions.filter(
    (action) =>
      action.action_type === expected.action_type &&
      action.target_ref === expected.target_ref &&
      (!expected.mechanic_id || action.mechanic_id === expected.mechanic_id)
  );

  if (matches.length > 0) {
    const matchingAction =
      expected.action_type === 'execute_week'
        ? matches.find((action) => evaluateExecuteWeekMatch(expected, action, gameState.staffRoster, roomDefinitions))
        : matches.find((action) => matchesVisitWindow(expected, action)) ?? pickBestMatch(expected, matches);

    if (matchingAction) {
      if (expected.action_type === 'execute_week' && !evaluateExecuteWeekMatch(expected, matchingAction, gameState.staffRoster, roomDefinitions)) {
        return 'failed';
      }
      if (expected.action_type === 'visit_stakeholder' && !matchesVisitWindow(expected, matchingAction)) {
        return 'failed';
      }
      return 'completed';
    }
    return 'failed';
  }

  if (isExpiredBySchedule(expected, gameState.day, gameState.timeSlot)) {
    return 'failed';
  }

  return gameState.comparisons.some(
    (comparison) => comparison.expected_action_id === expected.expected_action_id && comparison.outcome === 'DEVIATION'
  )
    ? 'failed'
    : 'active';
};

export const buildCommitmentDisplayItem = (
  expected: ExpectedAction,
  gameState: GameState,
  roomDefinitions: RoomDefinition[]
): CommitmentDisplayItem => {
  const { title, description } = describeExpectedAction({
    expected,
    stakeholders: gameState.stakeholders,
    staffRoster: gameState.staffRoster,
    roomDefinitions,
  });

  const stakeholderId = expected.target_ref.startsWith('stakeholder:')
    ? expected.target_ref.split(':', 2)[1]
    : expected.stakeholder_id;

  return {
    expectedActionId: expected.expected_action_id,
    stakeholderId,
    stakeholderName: resolveStakeholderName(stakeholderId, gameState.stakeholders, gameState.staffRoster),
    title,
    description,
    status: resolveCommitmentStatus(expected, gameState, roomDefinitions),
    createdAt: expected.created_at,
  };
};
