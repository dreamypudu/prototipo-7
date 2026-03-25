import React from 'react';
import SchedulerInterface from '../../components/SchedulerInterface';
import { useMechanicContext } from '../MechanicContext';

const ScheduleMechanic: React.FC = () => {
  const { gameState, dispatch, contentPack } = useMechanicContext();
  const isCesfam = contentPack.version === 'CESFAM';
  const draftAlreadySubmitted = gameState.lastScheduleSubmissionDay === 5;
  const canExecuteWeek = isCesfam ? gameState.day >= 5 && !draftAlreadySubmitted : true;
  const executeLabel = isCesfam
    ? draftAlreadySubmitted
      ? 'Borrador enviado'
      : 'Enviar borrador semanal'
    : 'Ejecutar semana';
  const executeDisabledReason = isCesfam
    ? draftAlreadySubmitted
      ? 'El borrador de esta semana ya fue enviado.'
      : gameState.day < 5
        ? 'El borrador solo puede enviarse el viernes.'
        : null
    : null;

  return (
    <SchedulerInterface
      gameState={gameState}
      onUpdateSchedule={(schedule) => dispatch({ type: 'update_schedule', schedule })}
      onExecuteWeek={() => dispatch({ type: 'execute_week' })}
      executeLabel={executeLabel}
      canExecuteWeek={canExecuteWeek}
      executeDisabledReason={executeDisabledReason}
    />
  );
};

export default ScheduleMechanic;
