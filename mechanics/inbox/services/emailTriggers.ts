import { EmailTemplate, GameState, TimeSlotType } from '../../../types';
import { isEmailUnlocked } from '../../../services/contentUnlocks';

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
    .filter(
      (template) =>
        (
          template.trigger.type === 'ON_TIME_BLOCK' &&
          template.trigger.day === day &&
          template.trigger.slot === slot ||
          template.trigger.type === 'ON_CASE_EVENT' &&
          dueEventIds.has(template.trigger.event_id)
        ) &&
        isEmailUnlocked(template, state) &&
        !state.inbox.some((entry) => entry.email_id === template.email_id)
    )
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
