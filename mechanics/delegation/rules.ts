import type { MechanicComparisonRule } from '../types';
import { resolveGenericExpectedAction } from '../../services/comparisonRuleUtils';

// La delegacion se resuelve TRUE cuando existe una accion canonica 'delegate_task'
// cuyo target_ref coincide con el compromiso (sin constraints adicionales).
export const delegationRules: Record<string, MechanicComparisonRule> = {
  delegate_task_rule_v1: {
    rule_id: 'delegate_task_rule_v1',
    mechanic_id: 'delegation',
    action_type: 'delegate_task',
    resolve: resolveGenericExpectedAction,
  },
};
