// Construye el JSON autocontenido que la mecánica de planificación guarda en value_final.
import type { GameState } from '../../../types';
import { getPhysicalConflictData } from './scheduleConflicts';

export const buildSchedulerExecuteWeekValueFinal = (state: GameState, submittedAtMs = Date.now()) => {
  const weekSchedule = state.weeklySchedule.map((assignment) => ({
    staff_id: assignment.staffId,
    day: assignment.day,
    block: assignment.block,
    activity: assignment.activity,
    room_id: assignment.roomId ?? null,
  }));
  const conflictData = getPhysicalConflictData(state.weeklySchedule);
  const loadSummary = state.staffRoster.map((staff) => {
    const assignments = weekSchedule.filter((assignment) => assignment.staff_id === staff.id);
    const clinicalBlocks = assignments.filter((assignment) => assignment.activity === 'CLINICAL').length;
    const terrainBlocks = assignments.filter((assignment) => assignment.activity === 'TERRAIN').length;
    const trainingBlocks = assignments.filter((assignment) => assignment.activity === 'TRAINING').length;
    const adminBlocks = assignments.filter((assignment) => assignment.activity === 'ADMIN').length;
    const assignedHours = (clinicalBlocks + terrainBlocks + trainingBlocks + adminBlocks) * 4.4;

    return {
      staff_id: staff.id,
      staff_name: staff.name,
      sector_id: staff.sectorId,
      contract_hours: staff.contractHours,
      assigned_hours: Math.round(assignedHours * 10) / 10,
      clinical_blocks: clinicalBlocks,
      terrain_blocks: terrainBlocks,
      training_blocks: trainingBlocks,
      admin_blocks: adminBlocks,
      is_over_contract: assignedHours > staff.contractHours,
      is_under_contract: assignedHours < staff.contractHours - 8,
    };
  });

  return {
    target_type: 'schedule',
    target_id: 'global',
    target_label: 'Planificacion semanal',
    day: state.day,
    time_slot: state.timeSlot,
    committed_day: state.day,
    committed_time_slot: state.timeSlot,
    source_node_id: null,
    source_option_id: null,
    summary: `Ejecución de planificación semanal con ${weekSchedule.length} asignaciones`,
    mechanic_payload: {
      schedule_scope: 'weekly',
      week_schedule: weekSchedule,
      assignment_count: weekSchedule.length,
      conflict_count: conflictData.groups.length,
      conflicts: conflictData.groups,
      load_summary: loadSummary,
      submitted_at_ms: submittedAtMs,
    },
  };
};
