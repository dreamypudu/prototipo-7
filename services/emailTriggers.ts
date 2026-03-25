import { EmailTemplate, GameState, TimeSlotType } from '../types';

export const appendTimeBlockEmails = (
  state: GameState,
  emailTemplates: EmailTemplate[],
  day: number,
  slot: TimeSlotType
): GameState => {
  const newInboxEntries = emailTemplates
    .filter(
      (template) =>
        template.trigger.type === 'ON_TIME_BLOCK' &&
        template.trigger.day === day &&
        template.trigger.slot === slot &&
        !state.inbox.some((entry) => entry.email_id === template.email_id)
    )
    .map((template) => ({
      email_id: template.email_id,
      dayReceived: day,
      isRead: false,
    }));

  if (newInboxEntries.length === 0) return state;

  return {
    ...state,
    inbox: [...state.inbox, ...newInboxEntries],
  };
};
