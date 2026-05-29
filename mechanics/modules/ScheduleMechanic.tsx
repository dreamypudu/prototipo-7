import React from 'react';
import SchedulerInterface from '../scheduler/components/SchedulerInterface';
import { useMechanicContext } from '../MechanicContext';
import type { MechanicModuleProps } from '../types';

interface ScheduleTimingPolicy {
  canEdit?: (day: number) => boolean;
  canSubmit?: (day: number, lastScheduleSubmissionDay?: number | null) => boolean;
  getEditDisabledReason?: (day: number) => string | null;
  getExecuteDisabledReason?: (day: number, lastScheduleSubmissionDay?: number | null) => string | null;
  wasSubmittedThisWeek?: (day: number, lastScheduleSubmissionDay?: number | null) => boolean;
  executeLabel?: string;
  submittedLabel?: string;
}

const ScheduleMechanic: React.FC<MechanicModuleProps> = ({ params }) => {
  const { gameState, dispatch } = useMechanicContext();
  const scheduleTiming = params?.scheduleTiming as ScheduleTimingPolicy | undefined;
  // En el tutorial la asignacion de box esta siempre habilitada (sin bloqueo por dia/semana).
  const isTutorial = gameState.runMode === 'tutorial';
  const submittedThisWeek = isTutorial
    ? false
    : scheduleTiming?.wasSubmittedThisWeek?.(gameState.day, gameState.lastScheduleSubmissionDay) ?? false;
  const canEditSchedule = isTutorial ? true : scheduleTiming?.canEdit?.(gameState.day) ?? true;
  const canExecuteWeek = isTutorial
    ? true
    : scheduleTiming?.canSubmit?.(gameState.day, gameState.lastScheduleSubmissionDay) ?? true;
  const executeLabel = submittedThisWeek
    ? scheduleTiming?.submittedLabel ?? 'Planificacion enviada'
    : scheduleTiming?.executeLabel ?? 'Ejecutar semana';
  const executeDisabledReason = isTutorial
    ? null
    : scheduleTiming?.getExecuteDisabledReason?.(gameState.day, gameState.lastScheduleSubmissionDay) ?? null;
  const editDisabledReason = isTutorial ? null : scheduleTiming?.getEditDisabledReason?.(gameState.day) ?? null;

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
