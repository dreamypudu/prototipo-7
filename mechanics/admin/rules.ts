import type { MechanicComparisonRule } from '../types';
import { resolveGenericExpectedAction } from '../../services/comparisonRuleUtils';

export const adminRules: Record<string, MechanicComparisonRule> = {
  admin_decision_rule_v1: {
    rule_id: 'admin_decision_rule_v1',
    mechanic_id: 'admin',
    action_type: 'admin_decision',
    resolve: resolveGenericExpectedAction,
  },
};
