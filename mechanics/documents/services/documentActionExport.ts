import type { Document, TimeSlotType } from '../../../types';

interface DocumentReadExportInput {
  document: Document;
  openedAtMs: number;
  closedAtMs: number;
  openedCount: number;
  reopened: boolean;
  maxScrollDepth: number;
  committedDay: number;
  committedTimeSlot: TimeSlotType;
  wasUnreadBeforeAction: boolean;
}

export const buildDocumentReadValueFinal = ({
  document,
  openedAtMs,
  closedAtMs,
  openedCount,
  reopened,
  maxScrollDepth,
  committedDay,
  committedTimeSlot,
  wasUnreadBeforeAction,
}: DocumentReadExportInput) => {
  const readDurationMs = Math.max(0, closedAtMs - openedAtMs);
  const scrollDepth = Math.max(0, Math.min(100, maxScrollDepth));

  return {
    target_type: 'document',
    target_id: document.id,
    target_label: document.title,
    day: committedDay,
    time_slot: committedTimeSlot,
    committed_day: committedDay,
    committed_time_slot: committedTimeSlot,
    source_node_id: null,
    source_option_id: null,
    summary: `Lectura de documento: ${document.title}`,
    mechanic_payload: {
      document_id: document.id,
      title: document.title,
      content_length: document.content.length,
      was_unread_before_action: wasUnreadBeforeAction,
      opened_at_ms: openedAtMs,
      closed_at_ms: closedAtMs,
      read_duration_ms: readDurationMs,
      opened_count: openedCount,
      reopened,
      scroll_depth: scrollDepth,
    },
  };
};
