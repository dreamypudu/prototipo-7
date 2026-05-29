import type { CanonicalAction, ExpectedAction, GameState } from '../../../types';

export const DELEGATION_MECHANIC_ID = 'delegation';
export const DELEGATE_TASK_ACTION_TYPE = 'delegate_task';
export const WEEKLY_DELEGATION_LIMIT = 2;

// Semana operativa: 5 dias habiles por semana (misma logica que getCesfamWeekInfo).
export const getDelegationWeek = (day: number): number =>
  Math.floor((Math.max(1, Math.floor(day)) - 1) / 5) + 1;

export const getDelegatedTargetRefs = (canonicalActions: CanonicalAction[]): Set<string> =>
  new Set(
    canonicalActions
      .filter((action) => action.action_type === DELEGATE_TASK_ACTION_TYPE)
      .map((action) => action.target_ref)
  );

export const countDelegationsInWeek = (canonicalActions: CanonicalAction[], day: number): number => {
  const week = getDelegationWeek(day);
  return canonicalActions.filter(
    (action) =>
      action.action_type === DELEGATE_TASK_ACTION_TYPE &&
      getDelegationWeek(action.day ?? day) === week
  ).length;
};

export const getPendingDelegations = (gameState: GameState): ExpectedAction[] => {
  const done = getDelegatedTargetRefs(gameState.canonicalActions);
  return gameState.expectedActions.filter(
    (expected) => expected.mechanic_id === DELEGATION_MECHANIC_ID && !done.has(expected.target_ref)
  );
};
