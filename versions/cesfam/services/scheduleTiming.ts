const WORK_DAYS_PER_WEEK = 5;

export interface CesfamWeekInfo {
  week: number;
  dayIndex: number;
}

export const getCesfamWeekInfo = (day: number): CesfamWeekInfo => {
  const normalizedDay = Math.max(1, Math.floor(day));
  const dayIndex = (normalizedDay - 1) % WORK_DAYS_PER_WEEK;
  const week = Math.floor((normalizedDay - 1) / WORK_DAYS_PER_WEEK) + 1;
  return { week, dayIndex };
};

export const wasCesfamScheduleSubmittedThisWeek = (
  day: number,
  lastScheduleSubmissionDay?: number | null
): boolean => {
  if (typeof lastScheduleSubmissionDay !== 'number' || !Number.isFinite(lastScheduleSubmissionDay)) {
    return false;
  }
  return getCesfamWeekInfo(lastScheduleSubmissionDay).week === getCesfamWeekInfo(day).week;
};

export const canEditCesfamSchedule = (day: number): boolean => {
  const { week, dayIndex } = getCesfamWeekInfo(day);
  if (week === 1) {
    return day >= 4;
  }
  return dayIndex >= 2;
};

export const getCesfamScheduleEditDisabledReason = (day: number): string | null => {
  if (canEditCesfamSchedule(day)) return null;
  const { week } = getCesfamWeekInfo(day);
  return week === 1
    ? 'La planificación se habilita después del detonante del jueves.'
    : 'La planificación está bloqueada por mantención externa hasta el miércoles.';
};

export const canSubmitCesfamSchedule = (
  day: number,
  lastScheduleSubmissionDay?: number | null
): boolean => {
  if (wasCesfamScheduleSubmittedThisWeek(day, lastScheduleSubmissionDay)) return false;
  const { week, dayIndex } = getCesfamWeekInfo(day);
  if (week === 1) {
    return dayIndex >= 4;
  }
  return dayIndex >= 2;
};

export const getCesfamScheduleExecuteDisabledReason = (
  day: number,
  lastScheduleSubmissionDay?: number | null
): string | null => {
  if (wasCesfamScheduleSubmittedThisWeek(day, lastScheduleSubmissionDay)) {
    return 'La planificación de esta semana ya fue enviada.';
  }
  const { week, dayIndex } = getCesfamWeekInfo(day);
  if (week === 1 && dayIndex < 4) {
    return 'El borrador inicial solo puede enviarse el viernes.';
  }
  if (week > 1 && dayIndex < 2) {
    return 'La planificación está bloqueada por mantención externa hasta el miércoles.';
  }
  return null;
};

export const shouldResetCesfamWeeklySchedule = (day: number): boolean =>
  getCesfamWeekInfo(day).dayIndex === 0;
