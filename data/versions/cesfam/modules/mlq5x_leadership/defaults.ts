import {
  buildInitialGameStateWithStakeholders,
  CESFAM_PRESENT_MAP_SCHEDULE,
  CESFAM_ROOMS,
  DAYS_OF_WEEK,
  DIRECTOR_OBJECTIVES,
  SCHEDULE_BLOCKS,
  SECRETARY_ROLE,
  TIME_SLOTS,
  buildDefaultWeeklySchedule,
  getGameDate,
} from '../ethics/defaults';
import type { GameState, ScheduleAssignment } from '../../../../../types';
import { CESFAM_MLQ5X_STAKEHOLDERS } from './stakeholders';

// Horario inicial especifico del modulo de liderazgo (MLQ-5X). Parte del horario base
// de etica y corrige tres cosas alineadas con la narrativa de este modulo:
//  - Javier Castro: solo horas clinicas (sin el bloque de terreno del Lunes AM).
//  - Guzman y Soto: ambos en Box 1 el Martes AM (supervision docente vs auditoria),
//    lo que deja preparado el conflicto de Box 1 que el jugador debe resolver.
const buildLeadershipWeeklySchedule = (): ScheduleAssignment[] =>
  buildDefaultWeeklySchedule().map((assignment) => {
    if (assignment.staffId === 'javier-castro') {
      return { ...assignment, activity: 'CLINICAL', roomId: 'BOX_3' };
    }
    if (assignment.day === 'Martes' && assignment.block === 'AM' && assignment.staffId === 'andres-guzman') {
      return { ...assignment, activity: 'CLINICAL', roomId: 'BOX_1' };
    }
    if (assignment.day === 'Martes' && assignment.block === 'AM' && assignment.staffId === 'marcela-soto') {
      return { ...assignment, activity: 'CLINICAL', roomId: 'BOX_1' };
    }
    return assignment;
  });

export {
  CESFAM_PRESENT_MAP_SCHEDULE,
  CESFAM_ROOMS,
  DAYS_OF_WEEK,
  DIRECTOR_OBJECTIVES,
  SCHEDULE_BLOCKS,
  SECRETARY_ROLE,
  TIME_SLOTS,
  buildDefaultWeeklySchedule,
  getGameDate,
};

export const buildInitialGameState = (): GameState =>
  buildInitialGameStateWithStakeholders(CESFAM_MLQ5X_STAKEHOLDERS, {
    projectTitle: 'Gestion Directiva CESFAM: Liderazgo MLQ-5X',
    inbox: [{ email_id: 'mlq5x-welcome', dayReceived: 3, isRead: false }],
    weeklySchedule: buildLeadershipWeeklySchedule(),
  });
