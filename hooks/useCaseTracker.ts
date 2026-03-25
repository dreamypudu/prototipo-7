import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CaseDefinition, CaseGoalSnapshot, GameState } from '../types';
import { buildCaseGoalSnapshot, shouldRevealCaseForSequence } from '../services/commitments';

export interface CaseGoalDisplayItem extends CaseGoalSnapshot {
  title: string;
  description: string;
}

export interface ActiveCaseDisplay {
  case_id: string;
  title: string;
  description: string;
  goals: CaseGoalDisplayItem[];
}

type CaseVisibilityState = {
  activeCaseId: string | null;
  visibleCaseIds: string[];
  unseenCaseIds: string[];
};

const buildInitialVisibilityState = (cases: CaseDefinition[]): CaseVisibilityState => {
  const visibleCaseIds = cases
    .filter((entry) => entry.revealedBySequenceIds.includes('*'))
    .map((entry) => entry.case_id);

  return {
    activeCaseId: visibleCaseIds[0] ?? null,
    visibleCaseIds,
    unseenCaseIds: [],
  };
};

export const useCaseTracker = (cases: CaseDefinition[], gameState: GameState) => {
  const [visibilityState, setVisibilityState] = useState<CaseVisibilityState>(() => buildInitialVisibilityState(cases));
  const previousGoalSignatureRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    setVisibilityState(buildInitialVisibilityState(cases));
    previousGoalSignatureRef.current = null;
    hasInitializedRef.current = false;
  }, [cases]);

  const activeCase = useMemo<ActiveCaseDisplay | null>(() => {
    if (!visibilityState.activeCaseId) return null;
    const definition = cases.find((entry) => entry.case_id === visibilityState.activeCaseId);
    if (!definition) return null;

    return {
      case_id: definition.case_id,
      title: definition.title,
      description: definition.description,
      goals: definition.goals.map((goal) => ({
        ...buildCaseGoalSnapshot(goal, gameState),
        title: goal.title,
        description: goal.description,
      })),
    };
  }, [cases, gameState, visibilityState.activeCaseId]);

  const activeGoalSignature = useMemo(() => {
    if (!activeCase) return null;
    return JSON.stringify({
      caseId: activeCase.case_id,
      goals: activeCase.goals.map((goal) => ({ goal_id: goal.goal_id, status: goal.status })),
    });
  }, [activeCase]);

  useEffect(() => {
    if (!activeCase || !activeGoalSignature) return;
    if (!hasInitializedRef.current) {
      previousGoalSignatureRef.current = activeGoalSignature;
      hasInitializedRef.current = true;
      return;
    }
    if (previousGoalSignatureRef.current === activeGoalSignature) return;

    previousGoalSignatureRef.current = activeGoalSignature;
    setVisibilityState((prev) => ({
      ...prev,
      unseenCaseIds: prev.unseenCaseIds.includes(activeCase.case_id)
        ? prev.unseenCaseIds
        : [...prev.unseenCaseIds, activeCase.case_id],
    }));
  }, [activeCase, activeGoalSignature]);

  const registerSequenceCompleted = useCallback((sequenceId: string | undefined) => {
    if (!sequenceId) return;

    setVisibilityState((prev) => {
      const revealedCases = cases.filter((entry) => shouldRevealCaseForSequence(entry, sequenceId));
      if (revealedCases.length === 0) return prev;

      const revealedIds = revealedCases.map((entry) => entry.case_id);
      const visibleCaseIds = Array.from(new Set([...prev.visibleCaseIds, ...revealedIds]));
      const unseenCaseIds = Array.from(new Set([...prev.unseenCaseIds, ...revealedIds]));
      const activeCaseId = revealedIds[revealedIds.length - 1] ?? prev.activeCaseId;

      return {
        activeCaseId,
        visibleCaseIds,
        unseenCaseIds,
      };
    });
  }, [cases]);

  const markAllSeen = useCallback(() => {
    setVisibilityState((prev) => ({ ...prev, unseenCaseIds: [] }));
  }, []);

  return {
    activeCase,
    unseenCount: visibilityState.unseenCaseIds.length,
    hasUnseenUpdates: visibilityState.unseenCaseIds.length > 0,
    registerSequenceCompleted,
    markAllSeen,
  };
};
