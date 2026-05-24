import type { MechanicComparisonRule } from '../types';
import type { CommitmentTemplate } from '../../services/commitments_text_generator';
import {
  buildCompactDetail,
  normalizeTimeWindowBlock,
  resolveScheduleDayLabel,
  resolveTargetStakeholderName,
} from '../../services/commitments_text_generator';
import {
  resolveVisitPriorityRule,
  resolveVisitStakeholderRule,
} from './services/mapComparisonRules';

const visitStakeholderText: CommitmentTemplate = ({ expected, stakeholders, staffRoster }) => {
  const stakeholderName = resolveTargetStakeholderName(expected.target_ref, stakeholders, staffRoster) ?? 'el NPC indicado';
  const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name ?? expected.constraints?.day);
  const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window ?? expected.constraints?.slot);
  return {
    title: `Visitar a ${stakeholderName}`,
    description: buildCompactDetail(dayLabel, timeWindow) || 'Seguimiento pendiente.',
  };
};

const visitPriorityText: CommitmentTemplate = ({ expected, stakeholders, staffRoster }) => {
  const stakeholderName = resolveTargetStakeholderName(expected.target_ref, stakeholders, staffRoster) ?? 'el NPC indicado';
  const dayLabel = resolveScheduleDayLabel(expected.constraints?.day_name ?? expected.constraints?.day);
  const timeWindow = normalizeTimeWindowBlock(expected.constraints?.time_window ?? expected.constraints?.slot);
  return {
    title: `Priorizar reunion con ${stakeholderName}`,
    description: buildCompactDetail(dayLabel, timeWindow) || 'Visita prioritaria.',
  };
};

export const mapRules: Record<string, MechanicComparisonRule> = {
  visit_stakeholder_rule_v1: {
    rule_id: 'visit_stakeholder_rule_v1',
    mechanic_id: 'map',
    action_type: 'visit_stakeholder',
    resolve: resolveVisitStakeholderRule,
    commitmentText: visitStakeholderText,
  },
  visit_priority_rule_v1: {
    rule_id: 'visit_priority_rule_v1',
    mechanic_id: 'map',
    action_type: 'visit_stakeholder',
    resolve: resolveVisitPriorityRule,
    commitmentText: visitPriorityText,
  },
};
