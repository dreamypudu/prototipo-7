import type { RoomDefinition, StaffMember, Stakeholder, TimeSlotType } from '../../../types';

interface MapVisitExportInput {
  staff: StaffMember;
  stakeholder: Stakeholder;
  room?: RoomDefinition;
  originRoom: string | null;
  destinationRoom: string;
  arrivedAtMs: number;
  committedDay: number;
  committedTimeSlot: TimeSlotType;
  availableProactiveMeeting: boolean;
}

export const buildMapVisitValueFinal = ({
  staff,
  stakeholder,
  room,
  originRoom,
  destinationRoom,
  arrivedAtMs,
  committedDay,
  committedTimeSlot,
  availableProactiveMeeting,
}: MapVisitExportInput) => ({
  target_type: 'npc',
  target_id: stakeholder.id,
  target_label: stakeholder.name,
  day: committedDay,
  time_slot: committedTimeSlot,
  committed_day: committedDay,
  committed_time_slot: committedTimeSlot,
  source_node_id: null,
  source_option_id: null,
  summary: `Visita a ${stakeholder.name}`,
  mechanic_payload: {
    origin_room: originRoom,
    destination_room: destinationRoom,
    npc_id: stakeholder.id,
    npc_name: stakeholder.name,
    npc_role: stakeholder.role,
    staff_id: staff.id,
    staff_role: staff.role,
    sector_id: staff.sectorId,
    location_id: destinationRoom,
    location_name: room?.name ?? null,
    location_sector: room?.sector ?? null,
    available_proactive_meeting: availableProactiveMeeting,
    arrived_at_ms: arrivedAtMs,
  },
});
