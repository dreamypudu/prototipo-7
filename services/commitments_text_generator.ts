// Genera textos legibles de compromisos a partir de ExpectedAction y permite que cada mecanica entregue sus propios templates.
import { resolveExpectedActionStatus } from './ComparisonEngine';
import type {
  ConditionGroup,
  ExpectedAction,
  GameState,
  RoomDefinition,
  StaffMember,
  Stakeholder,
} from '../types';

const ACTIVITY_LABELS: Record<string, string> = {
  CLINICAL: 'Atención Clínica',
  ADMIN: 'Trabajo Administrativo',
  TRAINING: 'Capacitación',
  TERRAIN: 'Trabajo en Terreno',
};

const SECTOR_LABELS: Record<string, string> = {
  AZUL: 'Sector Azul',
  ROJO: 'Sector Rojo',
  AMARILLO: 'Sector Amarillo',
  ADMIN: 'Administración',
  COMMON: 'Auditorio',
  OUTSIDE: 'Terreno',
};

const compare = (left: number, op: string, right: number): boolean => {
  switch (op) {
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '>':
      return left > right;
    case '<':
      return left < right;
    case '==':
      return left === right;
    default:
      return false;
  }
};

export const evaluateConditionGroup = (state: GameState, group?: ConditionGroup): boolean => {
  if (!group) return true;
  const allConditions = group.all ?? [];
  const anyConditions = group.any ?? [];

  const allOk = allConditions.every((condition) => {
    switch (condition.kind) {
      case 'global_metric': {
        const value = Number(state[condition.metric] ?? 0);
        return compare(value, condition.op, condition.value);
      }
      case 'stakeholder_metric': {
        const stakeholder = state.stakeholders.find((entry) => entry.id === condition.stakeholderId);
        if (!stakeholder) return false;
        const value = Number(stakeholder[condition.metric] ?? 0);
        return compare(value, condition.op, condition.value);
      }
      case 'completed_sequence':
        return state.completedSequences.includes(condition.sequenceId);
      case 'completed_scenario':
        return state.completedScenarios.includes(condition.scenarioId);
      case 'expected_action': {
        const minCount = condition.minCount ?? 1;
        const count = state.canonicalActions.filter((action) => {
          if (condition.actionType && action.action_type !== condition.actionType) return false;
          if (condition.targetRefIncludes && !String(action.target_ref).includes(condition.targetRefIncludes)) return false;
          return true;
        }).length;
        return count >= minCount;
      }
      case 'promise_outcome': {
        const minCount = condition.minCount ?? 1;
        const matchingExpectedIds = new Set(
          state.expectedActions
            .filter((expected) => {
              if (condition.sourceNodeId && expected.source?.node_id !== condition.sourceNodeId) return false;
              if (condition.sourceOptionId && expected.source?.option_id !== condition.sourceOptionId) return false;
              if (condition.ruleId && expected.rule_id !== condition.ruleId) return false;
              if (condition.actionType && expected.action_type !== condition.actionType) return false;
              if (condition.targetRefIncludes && !String(expected.target_ref).includes(condition.targetRefIncludes)) return false;
              if (condition.stakeholderId && expected.stakeholder_id !== condition.stakeholderId) return false;
              return true;
            })
            .map((expected) => expected.expected_action_id)
        );
        if (matchingExpectedIds.size === 0) return false;
        const allowedOutcomes = new Set(condition.outcomeIn ?? [true, false]);
        const count = state.comparisons.filter((comparison) =>
          matchingExpectedIds.has(comparison.expected_action_id) && allowedOutcomes.has(comparison.outcome)
        ).length;
        return count >= minCount;
      }
      default:
        return false;
    }
  });

  if (!allOk) return false;
  if (anyConditions.length === 0) return true;
  return anyConditions.some((condition) =>
    evaluateConditionGroup(state, {
      all: [condition],
    })
  );
};

export const normalizeTimeWindowBlock = (value: unknown): 'AM' | 'PM' | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === 'AM' || normalized === 'PM') return normalized;
  return null;
};

const getRoomById = (roomDefinitions: RoomDefinition[], roomId?: string | null) =>
  roomId ? roomDefinitions.find((room) => room.id === roomId) : undefined;

export type CommitmentStatus = 'active' | 'completed' | 'failed';

export interface CommitmentTextContext {
  expected: ExpectedAction;
  stakeholders: Stakeholder[];
  staffRoster: StaffMember[];
  roomDefinitions: RoomDefinition[];
}

export interface CommitmentDisplayItem {
  expectedActionId: string;
  stakeholderId?: string;
  stakeholderName?: string;
  title: string;
  description: string;
  status: CommitmentStatus;
  createdAt: number;
}

export const resolveStakeholderName = (
  stakeholderId: string | undefined,
  stakeholders: Stakeholder[],
  staffRoster: StaffMember[]
) => {
  if (!stakeholderId) return undefined;
  return (
    stakeholders.find((stakeholder) => stakeholder.id === stakeholderId)?.name ??
    staffRoster.find((staff) => staff.id === stakeholderId)?.name ??
    stakeholderId
  );
};

export const resolveTargetStakeholderName = (targetRef: string, stakeholders: Stakeholder[], staffRoster: StaffMember[]) => {
  if (!targetRef.startsWith('stakeholder:')) return undefined;
  return resolveStakeholderName(targetRef.split(':', 2)[1], stakeholders, staffRoster);
};

export const resolveRoomName = (roomId: string | undefined, roomDefinitions: RoomDefinition[]) =>
  roomId ? getRoomById(roomDefinitions, roomId)?.name ?? roomId : undefined;

export const resolveSectorLabel = (sectorId: string | undefined) => (sectorId ? SECTOR_LABELS[sectorId] ?? sectorId : undefined);

export const resolveActivityLabel = (activity: string | undefined) => (activity ? ACTIVITY_LABELS[activity] ?? activity : undefined);

export const resolveScheduleDayLabel = (dayName: string | undefined) => (dayName ? dayName : undefined);

export const buildCompactDetail = (...parts: Array<string | undefined | null>) =>
  parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean)
    .join(' - ');

const fallbackCommitmentText = ({ expected, stakeholders, staffRoster }: CommitmentTextContext) => ({
  title:
    resolveTargetStakeholderName(expected.target_ref, stakeholders, staffRoster) ??
    `Registrar ${expected.action_type.replace(/_/g, ' ')}`,
  description: 'Accion pendiente.',
});

export type CommitmentTemplate = (context: CommitmentTextContext) => { title: string; description: string };

export interface CommitmentTextTemplates {
  ruleTemplates?: Record<string, CommitmentTemplate>;
  actionTemplates?: Record<string, CommitmentTemplate>;
}

export const describeExpectedAction = (
  context: CommitmentTextContext,
  templates: CommitmentTextTemplates = {}
) => {
  if (context.expected.ui?.title) {
    return {
      title: context.expected.ui.title,
      description: context.expected.ui.description ?? '',
    };
  }

  const ruleTemplates = templates.ruleTemplates ?? {};
  const actionTemplates = templates.actionTemplates ?? {};

  const byRule = ruleTemplates[context.expected.rule_id];
  if (byRule) return byRule(context);

  const byAction = actionTemplates[`${context.expected.mechanic_id ?? 'unknown'}:${context.expected.action_type}`];
  if (byAction) return byAction(context);

  if (context.expected.target_ref.startsWith('stakeholder:')) {
    const stakeholderName = resolveTargetStakeholderName(context.expected.target_ref, context.stakeholders, context.staffRoster) ?? 'el NPC indicado';
    return {
      title: `Seguimiento con ${stakeholderName}`,
      description: 'La decisión dejó un compromiso asociado a este NPC.',
    };
  }

  return fallbackCommitmentText(context);
};

export const buildCommitmentTextTemplates = (
  mechanicEntries: Array<{ rules?: Record<string, { rule_id: string; commitmentText?: CommitmentTemplate }> }>
): CommitmentTextTemplates => {
  const ruleTemplates: Record<string, CommitmentTemplate> = {};

  mechanicEntries.forEach((entry) => {
    Object.values(entry.rules ?? {}).forEach((rule) => {
      if (rule.commitmentText) {
        ruleTemplates[rule.rule_id] = rule.commitmentText;
      }
    });
  });

  return { ruleTemplates };
};

export const resolveCommitmentStatus = (
  expected: ExpectedAction,
  gameState: GameState,
  roomDefinitions: RoomDefinition[]
): CommitmentStatus => {
  return resolveExpectedActionStatus(expected, gameState, roomDefinitions);
};

export const buildCommitmentDisplayItem = (
  expected: ExpectedAction,
  gameState: GameState,
  roomDefinitions: RoomDefinition[],
  templates: CommitmentTextTemplates = {}
): CommitmentDisplayItem => {
  const { title, description } = describeExpectedAction({
    expected,
    stakeholders: gameState.stakeholders,
    staffRoster: gameState.staffRoster,
    roomDefinitions,
  }, templates);

  const stakeholderId = expected.target_ref.startsWith('stakeholder:')
    ? expected.target_ref.split(':', 2)[1]
    : expected.stakeholder_id;

  return {
    expectedActionId: expected.expected_action_id,
    stakeholderId,
    stakeholderName: resolveStakeholderName(stakeholderId, gameState.stakeholders, gameState.staffRoster),
    title,
    description,
    status: resolveCommitmentStatus(expected, gameState, roomDefinitions),
    createdAt: expected.created_at,
  };
};
