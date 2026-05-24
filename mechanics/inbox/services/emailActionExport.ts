import type { EmailTemplate, InboxEmail, TimeSlotType } from '../../../types';

interface EmailReadExportInput {
  email: InboxEmail;
  template?: EmailTemplate;
  openedAtMs: number;
  closedAtMs: number;
  openedCount: number;
  reopened: boolean;
  committedDay: number;
  committedTimeSlot: TimeSlotType;
}

export const buildEmailReadValueFinal = ({
  email,
  template,
  openedAtMs,
  closedAtMs,
  openedCount,
  reopened,
  committedDay,
  committedTimeSlot,
}: EmailReadExportInput) => {
  const readDurationMs = Math.max(0, closedAtMs - openedAtMs);

  return {
    target_type: 'email',
    target_id: email.email_id,
    target_label: template?.subject ?? null,
    day: committedDay,
    time_slot: committedTimeSlot,
    committed_day: committedDay,
    committed_time_slot: committedTimeSlot,
    source_node_id: null,
    source_option_id: null,
    summary: template?.subject ? `Lectura de correo: ${template.subject}` : `Lectura de correo: ${email.email_id}`,
    mechanic_payload: {
      email_id: email.email_id,
      subject: template?.subject ?? null,
      from: template?.from ?? null,
      received_day: email.dayReceived,
      grants_information: template?.grants_information ?? null,
      was_unread_before_action: !email.isRead,
      opened_at_ms: openedAtMs,
      closed_at_ms: closedAtMs,
      read_duration_ms: readDurationMs,
      opened_count: openedCount,
      reopened,
    },
  };
};
