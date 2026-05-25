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
} from '../../defaults';
import type { GameState } from '../../../../../types';
import { CESFAM_MLQ5X_STAKEHOLDERS } from './stakeholders';

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
  });
