// Calcula el balance de carga clinica vs administrativa de un funcionario en la semana.
// Agrupacion: clinico (carga asistencial) = CLINICAL + TERRAIN; administrativo = ADMIN + TRAINING.
import type { ScheduleAssignment } from '../types';

export interface StaffLoad {
  clinicalBlocks: number;
  adminBlocks: number;
  totalBlocks: number;
  clinicalPct: number; // 0-100
  adminPct: number; // 0-100
}

export const getStaffLoad = (schedule: ScheduleAssignment[], staffId: string): StaffLoad => {
  const blocks = schedule.filter((assignment) => assignment.staffId === staffId);
  const clinicalBlocks = blocks.filter(
    (assignment) => assignment.activity === 'CLINICAL' || assignment.activity === 'TERRAIN'
  ).length;
  const adminBlocks = blocks.filter(
    (assignment) => assignment.activity === 'ADMIN' || assignment.activity === 'TRAINING'
  ).length;
  const totalBlocks = blocks.length;
  if (totalBlocks === 0) {
    return { clinicalBlocks: 0, adminBlocks: 0, totalBlocks: 0, clinicalPct: 0, adminPct: 0 };
  }
  const clinicalPct = (clinicalBlocks / totalBlocks) * 100;
  return {
    clinicalBlocks,
    adminBlocks,
    totalBlocks,
    clinicalPct,
    adminPct: 100 - clinicalPct,
  };
};
