import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ConditionGroup,
  GameState,
  GlobalObjectiveDefinition,
  NpcObjectiveDefinition,
  ObjectiveSnapshot,
} from '../types';

type ObjectiveOwner = 'global' | 'npc';

type ObjectiveDefinition = (GlobalObjectiveDefinition | NpcObjectiveDefinition) & { owner: ObjectiveOwner };

type ObjectiveEntry = {
  definition: ObjectiveDefinition;
  visible: boolean;
  snapshot: ObjectiveSnapshot;
  hasUnseenUpdate: boolean;
};

export interface ObjectiveDisplayItem extends ObjectiveSnapshot {
  title: string;
  description: string;
  owner: ObjectiveOwner;
  stakeholderId?: string;
}

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

const evaluateConditionGroup = (state: GameState, group?: ConditionGroup): boolean => {
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

const buildSnapshot = (definition: ObjectiveDefinition, state: GameState): ObjectiveSnapshot => {
  const failed = definition.failure ? evaluateConditionGroup(state, definition.failure) : false;
  if (failed) {
    return { objective_id: definition.objective_id, status: 'failed', progressLabel: 'Fallido' };
  }
  const completed = evaluateConditionGroup(state, definition.success);
  if (completed) {
    return { objective_id: definition.objective_id, status: 'completed', progressLabel: 'Completado' };
  }
  return { objective_id: definition.objective_id, status: 'in_progress', progressLabel: 'En progreso' };
};

const shouldRevealForSequence = (definition: ObjectiveDefinition, sequenceId: string): boolean => {
  return definition.revealedBySequenceIds.includes(sequenceId) || definition.revealedBySequenceIds.includes('*');
};

const toDisplayItem = (entry: ObjectiveEntry): ObjectiveDisplayItem => ({
  ...entry.snapshot,
  title: entry.definition.title,
  description: entry.definition.description,
  owner: entry.definition.owner,
  stakeholderId: entry.definition.owner === 'npc' ? entry.definition.stakeholderId : undefined,
});

const buildInitialEntries = (
  globalObjectives: GlobalObjectiveDefinition[],
  npcObjectives: NpcObjectiveDefinition[]
): Record<string, ObjectiveEntry> => {
  const entries: Record<string, ObjectiveEntry> = {};
  globalObjectives.forEach((definition) => {
    entries[definition.objective_id] = {
      definition: { ...definition, owner: 'global' },
      visible: false,
      hasUnseenUpdate: false,
      snapshot: { objective_id: definition.objective_id, status: 'pending', progressLabel: 'Pendiente' },
    };
  });
  npcObjectives.forEach((definition) => {
    entries[definition.objective_id] = {
      definition: { ...definition, owner: 'npc' },
      visible: false,
      hasUnseenUpdate: false,
      snapshot: { objective_id: definition.objective_id, status: 'pending', progressLabel: 'Pendiente' },
    };
  });
  return entries;
};

export const useObjectivesTracker = (
  globalObjectives: GlobalObjectiveDefinition[],
  npcObjectives: NpcObjectiveDefinition[]
) => {
  const [entries, setEntries] = useState<Record<string, ObjectiveEntry>>(() =>
    buildInitialEntries(globalObjectives, npcObjectives)
  );

  useEffect(() => {
    setEntries(buildInitialEntries(globalObjectives, npcObjectives));
  }, [globalObjectives, npcObjectives]);

  const registerSequenceCompleted = useCallback((sequenceId: string | undefined, stateSnapshot: GameState) => {
    if (!sequenceId) return;
    setEntries((prev) => {
      const next: Record<string, ObjectiveEntry> = {};
      Object.values(prev).forEach((entry) => {
        let updated = { ...entry };

        if (!updated.visible && shouldRevealForSequence(updated.definition, sequenceId)) {
          updated.visible = true;
          updated.hasUnseenUpdate = true;
        }

        if (updated.visible) {
          const evaluated = buildSnapshot(updated.definition, stateSnapshot);
          if (evaluated.status !== updated.snapshot.status || evaluated.progressLabel !== updated.snapshot.progressLabel) {
            updated.snapshot = evaluated;
            updated.hasUnseenUpdate = true;
          } else {
            updated.snapshot = evaluated;
          }
        }
        next[updated.definition.objective_id] = updated;
      });
      return next;
    });
  }, []);

  const markAllSeen = useCallback(() => {
    setEntries((prev) => {
      const next: Record<string, ObjectiveEntry> = {};
      Object.values(prev).forEach((entry) => {
        next[entry.definition.objective_id] = { ...entry, hasUnseenUpdate: false };
      });
      return next;
    });
  }, []);

  const unseenCount = useMemo(
    () => Object.values(entries).filter((entry) => entry.visible && entry.hasUnseenUpdate).length,
    [entries]
  );

  const globalVisible = useMemo(
    () =>
      Object.values(entries)
        .filter((entry) => entry.visible && entry.definition.owner === 'global')
        .map(toDisplayItem),
    [entries]
  );

  const npcVisible = useMemo(
    () =>
      Object.values(entries)
        .filter((entry) => entry.visible && entry.definition.owner === 'npc')
        .map(toDisplayItem),
    [entries]
  );

  return {
    globalVisible,
    npcVisible,
    unseenCount,
    hasUnseenUpdates: unseenCount > 0,
    registerSequenceCompleted,
    markAllSeen,
  };
};
