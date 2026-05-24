import type { ExpectedAction, TimeSlotType } from '../../../types';
import type { MechanicRuleContext, MechanicRuleResolution } from '../../types';
import {
  resolveVisitExpectationState,
  resolveVisitPriorityState,
} from './visitPriority';

const MORNING_SLOT = 'ma\u00f1ana' as TimeSlotType;

const normalizeVisitReason = (reason?: string) => {
  if (reason === 'time_window_miss') return 'wrong_time';
  if (reason === 'priority_not_respected') return 'wrong_npc';
  if (reason === 'not_done') return 'not_done';
  return 'other_rule_failed';
};

export const resolveVisitStakeholderRule = (
  expected: ExpectedAction,
  ruleContext: MechanicRuleContext
): MechanicRuleResolution | null => {
  const visitDay = ruleContext.currentDay ?? (ruleContext.finalize || ruleContext.includeNotDone ? Number.MAX_SAFE_INTEGER : expected.created_day ?? 0);
  const visitSlot = ruleContext.currentTimeSlot ?? (ruleContext.finalize || ruleContext.includeNotDone ? 'tarde' : expected.created_time_slot ?? MORNING_SLOT);
  const visitState = resolveVisitExpectationState(
    expected,
    ruleContext.canonicalActions,
    visitDay,
    visitSlot
  );

  if (visitState.status === 'completed' && visitState.matchedAction) {
    return { canonicalAction: visitState.matchedAction, evaluation: { outcome: true } };
  }

  if (visitState.status === 'failed') {
    const reason = normalizeVisitReason(visitState.reason);
    return {
      canonicalAction: visitState.matchedAction,
      evaluation: {
        outcome: false,
        reason,
        rawDeviation: { reason, visit_reason: visitState.reason ?? null },
      },
    };
  }

  if (ruleContext.finalize || ruleContext.includeNotDone) {
    return {
      canonicalAction: null,
      evaluation: { outcome: false, reason: 'not_done', rawDeviation: { reason: 'not_done' } },
    };
  }

  return null;
};

export const resolveVisitPriorityRule = (
  expected: ExpectedAction,
  ruleContext: MechanicRuleContext
): MechanicRuleResolution | null => {
  const visitDay = ruleContext.currentDay ?? (ruleContext.finalize || ruleContext.includeNotDone ? Number.MAX_SAFE_INTEGER : expected.created_day ?? 0);
  const visitSlot = ruleContext.currentTimeSlot ?? (ruleContext.finalize || ruleContext.includeNotDone ? 'tarde' : expected.created_time_slot ?? MORNING_SLOT);
  const priorityState = resolveVisitPriorityState(
    expected,
    ruleContext.canonicalActions,
    visitDay,
    visitSlot
  );

  if (priorityState.status === 'completed' && priorityState.matchedAction) {
    return { canonicalAction: priorityState.matchedAction, evaluation: { outcome: true } };
  }

  if (priorityState.status === 'failed') {
    const reason = normalizeVisitReason(priorityState.reason);
    return {
      canonicalAction: priorityState.matchedAction,
      evaluation: {
        outcome: false,
        reason,
        rawDeviation: { reason, visit_reason: priorityState.reason ?? null },
      },
    };
  }

  if (ruleContext.finalize || ruleContext.includeNotDone) {
    return {
      canonicalAction: null,
      evaluation: { outcome: false, reason: 'not_done', rawDeviation: { reason: 'not_done' } },
    };
  }

  return null;
};
