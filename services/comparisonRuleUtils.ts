// Helpers genericos para reglas de comparacion; la logica especifica debe vivir en la mecanica que define la regla.
import type { CanonicalAction, ExpectedAction } from '../types';
import type { MechanicRuleContext, MechanicRuleResolution, MechanicRuleEvaluation } from '../mechanics/types';

export const isRecord = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const deepEqual = (left: any, right: any): boolean => {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => deepEqual(item, right[index]));
  }
  if (!isRecord(left) || !isRecord(right)) return false;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length && leftKeys.every((key) => deepEqual(left[key], right[key]));
};

export const pickBestMatch = (
  expected: ExpectedAction,
  matches: CanonicalAction[]
): CanonicalAction => {
  const afterExpected = matches
    .filter((action) => action.committed_at >= expected.created_at)
    .sort((a, b) => a.committed_at - b.committed_at);
  if (afterExpected.length > 0) return afterExpected[0];
  return [...matches].sort((a, b) => a.committed_at - b.committed_at)[0];
};

export const getMatchingActions = (
  expected: ExpectedAction,
  canonicalActions: CanonicalAction[]
) =>
  canonicalActions.filter(
    (action) =>
      action.action_type === expected.action_type &&
      action.target_ref === expected.target_ref &&
      (!expected.mechanic_id || action.mechanic_id === expected.mechanic_id)
  );

const getComparableActualValue = (
  key: string,
  actual: CanonicalAction,
  mergedActual: Record<string, any>
) => {
  if (key === 'target_ref') return actual.target_ref;
  return mergedActual[key];
};

export const evaluateGenericRule = (expected: ExpectedAction, actual: CanonicalAction): MechanicRuleEvaluation => {
  const constraints = expected.constraints ?? {};
  const constraintEntries = Object.entries(constraints).filter(([, value]) => value !== undefined);
  if (constraintEntries.length === 0) return { outcome: true };

  const valueFinal = isRecord(actual.value_final) ? actual.value_final : {};
  const mechanicPayload = isRecord(valueFinal.mechanic_payload) ? valueFinal.mechanic_payload : {};
  const context = isRecord(actual.context) ? actual.context : {};
  const mergedActual = { ...context, ...actual, ...valueFinal, ...mechanicPayload };
  const mismatches: Record<string, { expected: any; actual: any }> = {};

  for (const [key, expectedValue] of constraintEntries) {
    const actualValue = getComparableActualValue(key, actual, mergedActual);
    if (!deepEqual(actualValue, expectedValue)) {
      mismatches[key] = { expected: expectedValue, actual: actualValue };
    }
  }

  const mismatchKeys = Object.keys(mismatches);
  if (mismatchKeys.length === 0) return { outcome: true };

  return {
    outcome: false,
    reason: 'other_rule_failed',
    rawDeviation: {
      reason: 'other_rule_failed',
      mismatches,
      actual: mergedActual,
    },
  };
};

export const resolveGenericExpectedAction = (
  expected: ExpectedAction,
  ruleContext: MechanicRuleContext
): MechanicRuleResolution | null => {
  const matches = getMatchingActions(expected, ruleContext.canonicalActions);

  if (matches.length > 0) {
    const best = pickBestMatch(expected, matches);
    return {
      canonicalAction: best,
      evaluation: evaluateGenericRule(expected, best),
    };
  }

  if (
    ruleContext.finalize ||
    ruleContext.includeNotDone
  ) {
    return {
      canonicalAction: null,
      evaluation: { outcome: false, reason: 'not_done', rawDeviation: { reason: 'not_done' } },
    };
  }

  return null;
};
