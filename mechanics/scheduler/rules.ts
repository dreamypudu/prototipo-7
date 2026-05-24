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
    return {
      title: `Reservar ${activityLabel}`,
      description: buildCompactDetail(staffName, roomName, dayLabel, timeWindow, minHours ? `${minHours}h` : undefined) || 'Bloque pendiente.',
    };
  },
  training_commitment_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const minHours = expected.constraints?.min_hours;
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: 'Programar capacitacion',
      description: buildCompactDetail(staffName, dayLabel, timeWindow, minHours ? `${minHours}h` : undefined) || 'Capacitacion pendiente.',
    };
  },
  cross_sector_help_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    return {
      title: 'Reasignar apoyo',
      description: buildCompactDetail(staffName, sectorLabel) || 'Apoyo pendiente.',
    };
  },
  reserve_room_for_sector_rule_v1: ({ expected, roomDefinitions }) => {
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions) ?? 'el box indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: `Reservar ${roomName}`,
      description: buildCompactDetail(sectorLabel, dayLabel, timeWindow) || 'Reserva pendiente.',
    };
  },
  keep_staff_in_sector_rule_v1: ({ expected, stakeholders, staffRoster }) => {
    const staffName = resolveStakeholderName(expected.constraints?.staff_id, stakeholders, staffRoster) ?? 'el funcionario indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'su sector';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: `Mantener a ${staffName}`,
      description: buildCompactDetail(sectorLabel, dayLabel, timeWindow) || 'Permanencia pendiente.',
    };
  },
  emergency_room_rule_v1: ({ expected, roomDefinitions }) => {
    const roomName = resolveRoomName(expected.constraints?.room_id, roomDefinitions) ?? 'el box indicado';
    const sectorLabel = resolveSectorLabel(expected.constraints?.target_sector_id) ?? 'el sector indicado';
    const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name);
    const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window);
    return {
      title: `Abrir ${roomName} para contingencia`,
      description: buildCompactDetail(sectorLabel, dayLabel, timeWindow) || 'Contingencia pendiente.',
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
  emergency_room_rule_v1: executeWeekRule('emergency_room_rule_v1'),
  scheduler_war_rule_v1: executeWeekRule('scheduler_war_rule_v1'),
};
