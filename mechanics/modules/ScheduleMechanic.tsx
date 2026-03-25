import React from 'react';
import SchedulerInterface from '../../components/SchedulerInterface';
import { useMechanicContext } from '../MechanicContext';
import {
  canEditCesfamSchedule,
  canSubmitCesfamSchedule,
  getCesfamScheduleEditDisabledReason,
  getCesfamScheduleExecuteDisabledReason,
  wasCesfamScheduleSubmittedThisWeek,
} from '../../services/cesfamScheduleTiming';

const ScheduleMechanic: React.FC = () => {
  const { gameState, dispatch, contentPack } = useMechanicContext();
  const isCesfam = contentPack.version === 'CESFAM';
  const submittedThisWeek = isCesfam
    ? wasCesfamScheduleSubmittedThisWeek(gameState.day, gameState.lastScheduleSubmissionDay)
    : false;
  const canEditSchedule = isCesfam ? canEditCesfamSchedule(gameState.day) : true;
  const canExecuteWeek = isCesfam
    ? canSubmitCesfamSchedule(gameState.day, gameState.lastScheduleSubmissionDay)
    : true;
  const executeLabel = isCesfam
    ? submittedThisWeek
      ? 'Planificación enviada'
      : 'Enviar planificación semanal'
    : 'Ejecutar semana';
  const executeDisabledReason = isCesfam
    ? getCesfamScheduleExecuteDisabledReason(gameState.day, gameState.lastScheduleSubmissionDay)
    : null;
  const editDisabledReason = isCesfam ? getCesfamScheduleEditDisabledReason(gameState.day) : null;

  return (
    <SchedulerInterface
      gameState={gameState}
      onUpdateSchedule={(schedule) => dispatch({ type: 'update_schedule', schedule })}
      onExecuteWeek={() => dispatch({ type: 'execute_week' })}
      executeLabel={executeLabel}
      canExecuteWeek={canExecuteWeek}
      executeDisabledReason={executeDisabledReason}
      canEditSchedule={canEditSchedule}
      editDisabledReason={editDisabledReason}
    />
  );
};

export default ScheduleMechanic;
