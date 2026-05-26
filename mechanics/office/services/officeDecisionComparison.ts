import type { GameState, RoomDefinition } from '../../../types';
import { compareExpectedVsActual, mergeComparisonResults } from '../../../services/ComparisonEngine';

interface OfficeDecisionComparisonOptions {
  sessionId?: string;
  roomDefinitions?: RoomDefinition[];
}

export const syncOfficeDecisionComparisons = (
  state: GameState,
  options: OfficeDecisionComparisonOptions = {}
): GameState => {
  const officeExpectedActions = state.expectedActions.filter(
    (expected) => expected.mechanic_id === 'office'
  );

  if (officeExpectedActions.length === 0) return state;

  const newComparisons = compareExpectedVsActual(
    officeExpectedActions,
    state.canonicalActions,
    state.comparisons,
    {
      includeNotDone: false,
      sessionId: options.sessionId,
      currentDay: state.day,
      currentTimeSlot: state.timeSlot,
      staffRoster: state.staffRoster,
      roomDefinitions: options.roomDefinitions ?? [],
      decisionLog: state.decisionLog,
    }
  );

  if (newComparisons.length === 0) return state;

  return {
    ...state,
    comparisons: mergeComparisonResults(state.comparisons, newComparisons),
  };
};
