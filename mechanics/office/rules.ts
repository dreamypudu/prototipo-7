import type { DecisionLogEntry } from '../../types';
import type { MechanicComparisonRule, MechanicRuleContext, MechanicRuleResolution } from '../types';

interface DecisionRequirement {
  node_id?: string;
  nodeId?: string;
  sequence_id?: string;
  sequenceId?: string;
  accepted_option_ids?: unknown;
  rejected_option_ids?: unknown;
}

const findLatestDecision = (
  decisionLog: DecisionLogEntry[],
  nodeId?: string,
  sequenceId?: string
) => {
  return [...decisionLog]
    .reverse()
    .find((entry) => {
      if (nodeId && entry.nodeId !== nodeId) return false;
      if (sequenceId && entry.sequence_id !== sequenceId) return false;
      return true;
    });
};

const normalizeOptionIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
};

const getRequirementNodeId = (requirement: DecisionRequirement) =>
  requirement.node_id ?? requirement.nodeId;

const getRequirementSequenceId = (requirement: DecisionRequirement) =>
  requirement.sequence_id ?? requirement.sequenceId;

const evaluateDecision = (
  requirement: DecisionRequirement,
  decisionLog: DecisionLogEntry[]
) => {
  const nodeId = getRequirementNodeId(requirement);
  const sequenceId = getRequirementSequenceId(requirement);
  const decision = findLatestDecision(decisionLog, nodeId, sequenceId);
  const acceptedOptionIds = normalizeOptionIds(requirement.accepted_option_ids);
  const rejectedOptionIds = normalizeOptionIds(requirement.rejected_option_ids);

  if (!nodeId) {
    return {
      outcome: false,
      reason: 'decision_requirement_missing_node',
      node_id: null,
      sequence_id: sequenceId ?? null,
    };
  }

  if (!decision) {
    return {
      outcome: null,
      reason: 'decision_missing',
      node_id: nodeId,
      sequence_id: sequenceId ?? null,
      accepted_option_ids: acceptedOptionIds,
      rejected_option_ids: rejectedOptionIds,
    };
  }

  const actualOptionId = String(decision.choiceId);
  const rejected = rejectedOptionIds.includes(actualOptionId);
  const accepted = acceptedOptionIds.length === 0 || acceptedOptionIds.includes(actualOptionId);
  const outcome = accepted && !rejected;

  return {
    outcome,
    reason: outcome ? null : 'decision_option_inconsistent',
    node_id: nodeId,
    sequence_id: sequenceId ?? null,
    accepted_option_ids: acceptedOptionIds,
    rejected_option_ids: rejectedOptionIds,
    actual_option_id: actualOptionId,
    actual_choice_text: decision.choiceText,
  };
};

const resolveFutureDecisionConsistency = (
  expected: Parameters<MechanicComparisonRule['resolve']>[0],
  context: MechanicRuleContext
): MechanicRuleResolution | null => {
  const targetNodeId = String(expected.constraints?.target_node_id ?? '');
  if (!targetNodeId) return null;

  const targetDecision = findLatestDecision(
    context.decisionLog,
    targetNodeId,
    expected.constraints?.target_sequence_id ? String(expected.constraints.target_sequence_id) : undefined
  );

  if (!targetDecision) {
    if (!context.includeNotDone && !context.finalize) return null;
    return {
      canonicalAction: null,
      evaluation: {
        outcome: false,
        reason: 'target_decision_missing',
        rawDeviation: {
          expected_source: expected.source,
          target_node_id: targetNodeId,
          target_sequence_id: expected.constraints?.target_sequence_id ?? null,
        },
      },
    };
  }

  const acceptedOptionIds = normalizeOptionIds(expected.constraints?.accepted_option_ids);
  const rejectedOptionIds = normalizeOptionIds(expected.constraints?.rejected_option_ids);
  const choiceId = String(targetDecision.choiceId);
  const rejected = rejectedOptionIds.includes(choiceId);
  const accepted = acceptedOptionIds.length === 0 || acceptedOptionIds.includes(choiceId);
  const outcome = accepted && !rejected;

  return {
    canonicalAction: null,
    evaluation: {
      outcome,
      reason: outcome ? null : 'future_decision_inconsistent',
      rawDeviation: outcome
        ? null
        : {
            expected_source: expected.source,
            target_node_id: targetNodeId,
            expected_option_ids: acceptedOptionIds,
            rejected_option_ids: rejectedOptionIds,
            actual_option_id: choiceId,
            actual_choice_text: targetDecision.choiceText,
          },
    },
  };
};

const resolveDecisionChainConsistency = (
  expected: Parameters<MechanicComparisonRule['resolve']>[0],
  context: MechanicRuleContext
): MechanicRuleResolution | null => {
  const requirements = Array.isArray(expected.constraints?.required_decisions)
    ? expected.constraints.required_decisions as DecisionRequirement[]
    : [];

  if (requirements.length === 0) return null;

  const evaluations = requirements.map((requirement) =>
    evaluateDecision(requirement, context.decisionLog)
  );
  const pending = evaluations.filter((evaluation) => evaluation.outcome === null);
  const failures = evaluations.filter((evaluation) => evaluation.outcome === false);

  if (pending.length > 0 && !context.includeNotDone && !context.finalize) {
    return null;
  }

  const outcome = pending.length === 0 && failures.length === 0;
  return {
    canonicalAction: null,
    evaluation: {
      outcome,
      reason: outcome
        ? null
        : failures.length > 0
          ? 'decision_chain_inconsistent'
          : 'decision_chain_incomplete',
      rawDeviation: outcome
        ? null
        : {
            expected_source: expected.source,
            required_decisions: evaluations,
          },
    },
  };
};

export const officeRules: Record<string, MechanicComparisonRule> = {
  future_decision_consistency_rule_v1: {
    rule_id: 'future_decision_consistency_rule_v1',
    mechanic_id: 'office',
    action_type: 'choose_future_option',
    resolve: resolveFutureDecisionConsistency,
    commitmentText: ({ expected }) => ({
      title: expected.ui?.title ?? 'Consistencia narrativa: sostener decision futura',
      description: expected.ui?.description ?? 'Mantener una decision posterior coherente con lo dicho antes.',
    }),
  },
  decision_chain_consistency_rule_v1: {
    rule_id: 'decision_chain_consistency_rule_v1',
    mechanic_id: 'office',
    action_type: 'decision_chain_consistency',
    resolve: resolveDecisionChainConsistency,
    commitmentText: ({ expected }) => ({
      title: expected.ui?.title ?? 'Consistencia narrativa: sostener cadena de decisiones',
      description: expected.ui?.description ?? 'Mantener una cadena de decisiones coherente entre varios nodos.',
    }),
  },
};
