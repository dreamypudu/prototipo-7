import { EmailTemplate, GameState, TimeSlotType } from '../../../types';
import { isEmailUnlocked } from '../../../services/contentUnlocks';
import { evaluateConditionGroup } from '../../../services/commitments_text_generator';

const matchesComparisonOutcomeTrigger = (
  state: GameState,
  trigger: Extract<EmailTemplate['trigger'], { type: 'ON_COMPARISON_OUTCOME' }>,
  day: number,
  slot: TimeSlotType
): boolean => {
  if (!isAtOrAfterTriggerTime(day, slot, trigger.day, trigger.slot)) return false;

  const condition = trigger.condition;
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

  const allowedOutcomes = new Set(condition.outcomeIn ?? [true, false]);
  const minCount = condition.minCount ?? 1;
  const matchCount = state.comparisons.filter((comparison) =>
    matchingExpectedIds.has(comparison.expected_action_id) &&
    allowedOutcomes.has(comparison.outcome)
  ).length;

  return matchCount >= minCount;
};

const slotOrder = (slot: TimeSlotType): number => {
  if (slot === 'mañana') return 0;
  if (slot === 'tarde') return 1;
  if (slot === 'noche') return 2;
  return 0;
};

const isAtOrAfterTriggerTime = (
  currentDay: number,
  currentSlot: TimeSlotType,
  triggerDay: number,
  triggerSlot: TimeSlotType
): boolean => {
  if (currentDay > triggerDay) return true;
  if (currentDay < triggerDay) return false;
  return slotOrder(currentSlot) >= slotOrder(triggerSlot);
};

const shouldAppendEmail = (
  state: GameState,
  template: EmailTemplate,
  dueEventIds: Set<string>,
  day: number,
  slot: TimeSlotType
): boolean => {
  if (!isEmailUnlocked(template, state)) return false;
  if (state.inbox.some((entry) => entry.email_id === template.email_id)) return false;

  switch (template.trigger.type) {
    case 'ON_TIME_BLOCK':
      return template.trigger.day === day && template.trigger.slot === slot;
    case 'ON_CASE_EVENT':
      return dueEventIds.has(template.trigger.event_id);
    case 'ON_COMPARISON_OUTCOME':
      return matchesComparisonOutcomeTrigger(state, template.trigger, day, slot);
    case 'ON_CONDITION_GROUP':
      return evaluateConditionGroup(state, template.trigger.condition);
    default:
      return false;
  }
};

export const appendTimeBlockEmails = (
  state: GameState,
  emailTemplates: EmailTemplate[],
  day: number,
  slot: TimeSlotType
): GameState => {
  const pendingEmailEvents = state.pendingEmailEvents ?? [];
  const dueEventIds = new Set(
    pendingEmailEvents
      .filter((event) => event.day === day && event.slot === slot)
      .map((event) => event.event_id)
  );

  const newInboxEntries = emailTemplates
    .filter((template) => shouldAppendEmail(state, template, dueEventIds, day, slot))
    .map((template) => ({
      email_id: template.email_id,
      dayReceived: day,
      isRead: false,
    }));
  const remainingPendingEvents = pendingEmailEvents.filter(
    (event) => !(event.day === day && event.slot === slot)
  );

  if (newInboxEntries.length === 0 && remainingPendingEvents.length === pendingEmailEvents.length) {
    return state;
  }

  return {
    ...state,
    inbox: [...state.inbox, ...newInboxEntries],
    pendingEmailEvents: remainingPendingEvents,
  };
};
