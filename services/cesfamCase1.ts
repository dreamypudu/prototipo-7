import type { CanonicalAction, GameState, RoomDefinition } from '../types';
import { buildCommitmentDisplayItem } from './commitments';
import { getPhysicalConflictData } from './scheduleConflicts';

export const CASE1_CASE_ID = 'CASE_CESFAM_BORRADOR_LUNES';
export const CASE1_INTRO_SEQUENCE_ID = 'CASE1_ETHICS_INTRO_SEQ';
export const CASE1_FRIDAY_REMINDER_SEQUENCE_ID = 'CASE1_FRIDAY_REMINDER_SEQ';
export const CASE1_ENDING_CLEAN_SEQUENCE_ID = 'CASE1_ENDING_CLEAN_SEQ';
export const CASE1_ENDING_TENSE_SEQUENCE_ID = 'CASE1_ENDING_TENSE_SEQ';
export const CASE1_ENDING_ESCALATION_SEQUENCE_ID = 'CASE1_ENDING_ESCALATION_SEQ';
export const CASE1_ENDING_SEQUENCE_IDS = new Set([
  CASE1_ENDING_CLEAN_SEQUENCE_ID,
  CASE1_ENDING_TENSE_SEQUENCE_ID,
  CASE1_ENDING_ESCALATION_SEQUENCE_ID,
]);
export const CASE1_REQUIRED_MEETING_SEQUENCE_IDS = ['AZUL_MEETING_1', 'ROJO_MEETING_1', 'AMARILLO_MEETING_1'] as const;
export const CASE1_FRIDAY_DAY = 5;
export const CASE1_NEXT_MONDAY_DAY = 6;

type Case1Outcome = 'clean' | 'tense' | 'escalation';

const buildScheduleCanonicalAction = (state: GameState): CanonicalAction => ({
  canonical_action_id: `case1-submit-${state.day}-${state.timeSlot}`,
  mechanic_id: 'scheduler',
  action_type: 'execute_week',
  target_ref: 'global',
  value_final: {
    week_schedule: state.weeklySchedule.map((assignment) => ({
      staff_id: assignment.staffId,
      day: assignment.day,
      block: assignment.block,
      activity: assignment.activity,
      room_id: assignment.roomId ?? null,
    })),
  },
  committed_at: Date.now(),
  context: {
    day: state.day,
    time_slot: state.timeSlot,
  },
});

const buildPostSubmissionState = (state: GameState): GameState => ({
  ...state,
  canonicalActions: [...state.canonicalActions, buildScheduleCanonicalAction(state)],
});

const getMondayAssignments = (state: GameState) =>
  state.weeklySchedule.filter((assignment) => assignment.day === 'Lunes' && assignment.block === 'AM');

const getMondayConflictGroups = (state: GameState) =>
  getPhysicalConflictData(state.weeklySchedule).groups.filter(
    (group) => group.day === 'Lunes' && group.block === 'AM'
  );

const getRoomSector = (roomDefinitions: RoomDefinition[], roomId?: string | null) =>
  roomId ? roomDefinitions.find((room) => room.id === roomId)?.sector : undefined;

const hasClaudiaStillDisplaced = (state: GameState, roomDefinitions: RoomDefinition[]) => {
  const claudiaAssignment = getMondayAssignments(state).find((assignment) => assignment.staffId === 'claudia-morales');
  if (!claudiaAssignment) return false;
  return getRoomSector(roomDefinitions, claudiaAssignment.roomId) !== 'ROJO';
};

const hasAmarilloExtraRelief = (state: GameState, roomDefinitions: RoomDefinition[]) =>
  getMondayAssignments(state).some((assignment) => {
    const staff = state.staffRoster.find((entry) => entry.id === assignment.staffId);
    if (!staff || staff.sectorId !== 'AMARILLO') return false;
    const roomSector = getRoomSector(roomDefinitions, assignment.roomId);
    return roomSector === 'AZUL' || roomSector === 'ROJO';
  });

const getCommitmentStatuses = (state: GameState, roomDefinitions: RoomDefinition[]) => {
  const submittedState = buildPostSubmissionState(state);
  return submittedState.expectedActions.map((expected) =>
    buildCommitmentDisplayItem(expected, submittedState, roomDefinitions)
  );
};

export const resolveCase1SubmissionOutcome = (state: GameState, roomDefinitions: RoomDefinition[]) => {
  const commitmentStatuses = getCommitmentStatuses(state, roomDefinitions);
  const failedCommitments = commitmentStatuses.filter((item) => item.status === 'failed');
  const mondayConflictGroups = getMondayConflictGroups(state);
  const heardAllHeads = CASE1_REQUIRED_MEETING_SEQUENCE_IDS.every((sequenceId) =>
    state.completedSequences.includes(sequenceId)
  );
  const claudiaStillDisplaced = hasClaudiaStillDisplaced(state, roomDefinitions);

  let outcome: Case1Outcome = 'tense';
  if (!heardAllHeads || failedCommitments.length > 0 || mondayConflictGroups.length >= 2) {
    outcome = 'escalation';
  } else if (mondayConflictGroups.length === 0 && !claudiaStillDisplaced) {
    outcome = 'clean';
  }

  const emailIds = new Set<string>();
  if (outcome === 'clean') {
    emailIds.add('email-case1-monday-clean');
  }
  if (outcome === 'tense') {
    emailIds.add('email-case1-monday-tense');
  }
  if (outcome === 'escalation') {
    emailIds.add('email-case1-monday-escalation');
  }

  const failedExpectedActions = failedCommitments
    .map((item) => state.expectedActions.find((expected) => expected.expected_action_id === item.expectedActionId))
    .filter(Boolean);

  const failedRuleIds = new Set(failedExpectedActions.map((expected) => expected!.rule_id));

  if (outcome !== 'clean') {
    if (
      failedRuleIds.has('keep_staff_in_sector_rule_v1') ||
      failedRuleIds.has('visit_priority_rule_v1') ||
      claudiaStillDisplaced
    ) {
      emailIds.add('email-case1-monday-marcela');
    }

    const hasFailedAmarilloReservation = failedExpectedActions.some(
      (expected) =>
        expected?.rule_id === 'reserve_room_for_sector_rule_v1' &&
        expected.constraints?.target_sector_id === 'AMARILLO'
    );

    if (hasFailedAmarilloReservation || !hasAmarilloExtraRelief(state, roomDefinitions)) {
      emailIds.add('email-case1-monday-daniel');
    }

    if (
      failedRuleIds.has('research_hours_rule_v1') ||
      failedRuleIds.has('training_commitment_rule_v1')
    ) {
      emailIds.add('email-case1-monday-guzman');
    }
  }

  const sequenceId =
    outcome === 'clean'
      ? CASE1_ENDING_CLEAN_SEQUENCE_ID
      : outcome === 'tense'
        ? CASE1_ENDING_TENSE_SEQUENCE_ID
        : CASE1_ENDING_ESCALATION_SEQUENCE_ID;

  return {
    outcome,
    sequenceId,
    emailIds: [...emailIds],
    mondayConflictGroups,
    failedCommitmentIds: failedCommitments.map((item) => item.expectedActionId),
  };
};
