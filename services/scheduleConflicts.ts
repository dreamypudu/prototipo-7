import type { DayOfWeek, ScheduleAssignment, ScheduleBlock } from '../types';

export interface PhysicalConflictGroup {
  key: string;
  day: DayOfWeek;
  block: ScheduleBlock;
  roomId: string;
  staffIds: string[];
  cellKeys: string[];
}

export const NON_CONFLICT_ROOM_IDS = new Set(['TERRENO', 'AREA_COMUN', 'OFICINA_TECNICA']);

export const getPhysicalConflictData = (schedule: ScheduleAssignment[]) => {
  const usageMap = new Map<string, ScheduleAssignment[]>();
  const conflictedCellKeys = new Set<string>();

  schedule.forEach((assignment) => {
    if (!assignment.roomId || NON_CONFLICT_ROOM_IDS.has(assignment.roomId)) return;
    const key = `${assignment.day}|${assignment.block}|${assignment.roomId}`;
    const entries = usageMap.get(key) ?? [];
    entries.push(assignment);
    usageMap.set(key, entries);
  });

  const groups: PhysicalConflictGroup[] = [];

  usageMap.forEach((assignments, key) => {
    if (assignments.length <= 1) return;

    const [day, block, roomId] = key.split('|');
    const cellKeys = assignments.map((assignment) => `${assignment.staffId}-${assignment.day}-${assignment.block}`);
    cellKeys.forEach((cellKey) => conflictedCellKeys.add(cellKey));

    groups.push({
      key,
      day: day as DayOfWeek,
      block: block as ScheduleBlock,
      roomId,
      staffIds: assignments.map((assignment) => assignment.staffId),
      cellKeys,
    });
  });

  return { groups, conflictedCellKeys };
};

