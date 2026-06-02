import type { MechanicComparisonRule } from '../types';
import type { CommitmentTemplate } from '../../services/commitments_text_generator';
import {
  buildCompactDetail,
  normalizeTimeWindowBlock,
  resolveActivityLabel,
  resolveRoomName,
  resolveScheduleDayLabel,
  resolveSectorLabel,
  resolveStakeholderName,
} from '../../services/commitments_text_generator';
import { resolveExecuteWeekRule } from './services/schedulerComparisonRules';

const scheduleCommitmentText: Record<string, CommitmentTemplate> = {
  research_hours_rule_v1: ({ expected, stakeholders, staffRoster, roomDefinitions }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const activityLabel = resolveActivityLabel(expected.constraints?.activity) ?? 'la actividad indicada';
    const minHours = expected.constraints?.min_hours;
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions);
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    const scheduleDetail = buildCompactDetail(roomName, dayLabel, timeWindow, minHours ? `${minHours}h` : undefined);
    return {
      title: `Planificacion: asignar ${activityLabel} a ${staffName}${scheduleDetail ? ` - ${scheduleDetail}` : ''}`,
      description: `En la grilla semanal, ubicar a ${staffName} en la actividad ${activityLabel}${scheduleDetail ? ` con ${scheduleDetail}` : ''}.`,
    };
  },
  training_commitment_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const minHours = expected.constraints?.min_hours;
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    const scheduleDetail = buildCompactDetail(dayLabel, timeWindow, minHours ? `${minHours}h` : undefined);
    return {
      title: `Planificacion: programar capacitacion para ${staffName}${scheduleDetail ? ` - ${scheduleDetail}` : ''}`,
      description: `En la grilla semanal, reservar capacitacion para ${staffName}${scheduleDetail ? ` en ${scheduleDetail}` : ''}.`,
    };
  },
  cross_sector_help_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    const timeDetail = buildCompactDetail(dayLabel, timeWindow);
    const scheduleDetail = buildCompactDetail(sectorLabel, dayLabel, timeWindow);
    return {
      title: `Planificacion: reasignar apoyo de ${staffName}${scheduleDetail ? ` - ${scheduleDetail}` : ''}`,
      description: `En la grilla semanal, asignar a ${staffName} como apoyo para ${sectorLabel}${timeDetail ? ` en ${timeDetail}` : ''}.`,
    };
  },
  reserve_room_for_sector_rule_v1: ({ expected, roomDefinitions }) => {
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions) ?? 'el box indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    const timeDetail = buildCompactDetail(dayLabel, timeWindow);
    return {
      title: `Planificacion: reservar ${roomName} para ${sectorLabel}${timeDetail ? ` - ${timeDetail}` : ''}`,
      description: `En la grilla semanal, dejar ${roomName} asignado a ${sectorLabel}${timeDetail ? ` en ${timeDetail}` : ''}.`,
    };
  },
  keep_staff_in_sector_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'su sector';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    const timeDetail = buildCompactDetail(dayLabel, timeWindow);
    return {
      title: `Planificacion: mantener a ${staffName} en ${sectorLabel}${timeDetail ? ` - ${timeDetail}` : ''}`,
      description: `En la grilla semanal, ${staffName} debe permanecer en ${sectorLabel}${timeDetail ? ` en ${timeDetail}` : ''}.`,
    };
  },
  clinical_load_limit_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const maxClinicalPct = expected.constraints?.max_clinical_pct ?? 60;
    return {
      title: `Planificacion: limitar la carga clinica de ${staffName} (<= ${maxClinicalPct}%)`,
      description: `En la grilla semanal, dejar la jornada de ${staffName} con a lo mas ${maxClinicalPct}% de horas clinicas (box y terreno), liberando el resto a tareas administrativas.`,
    };
  },
  emergency_room_rule_v1: ({ expected, roomDefinitions }) => {
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions) ?? 'el box indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    const timeDetail = buildCompactDetail(dayLabel, timeWindow);
    return {
      title: `Planificacion: abrir ${roomName} para contingencia de ${sectorLabel}${timeDetail ? ` - ${timeDetail}` : ''}`,
      description: `En la grilla semanal, habilitar ${roomName} para ${sectorLabel}${timeDetail ? ` en ${timeDetail}` : ''}.`,
    };
  },
};

const executeWeekRule = (ruleId: string): MechanicComparisonRule => ({
  rule_id: ruleId,
  mechanic_id: 'scheduler',
  action_type: 'execute_week',
  resolve: resolveExecuteWeekRule,
  commitmentText: scheduleCommitmentText[ruleId],
});

export const schedulerRules: Record<string, MechanicComparisonRule> = {
  reserve_room_for_sector_rule_v1: executeWeekRule('reserve_room_for_sector_rule_v1'),
  keep_staff_in_sector_rule_v1: executeWeekRule('keep_staff_in_sector_rule_v1'),
  research_hours_rule_v1: executeWeekRule('research_hours_rule_v1'),
  training_commitment_rule_v1: executeWeekRule('training_commitment_rule_v1'),
  cross_sector_help_rule_v1: executeWeekRule('cross_sector_help_rule_v1'),
  clinical_load_limit_rule_v1: executeWeekRule('clinical_load_limit_rule_v1'),
  emergency_room_rule_v1: executeWeekRule('emergency_room_rule_v1'),
  scheduler_war_rule_v1: executeWeekRule('scheduler_war_rule_v1'),
};
