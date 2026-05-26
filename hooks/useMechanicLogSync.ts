import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { compareExpectedVsActual, mergeComparisonResults } from '../services/ComparisonEngine';
import { mechanicEngine } from '../services/MechanicEngine';
import { GameState, RoomDefinition } from '../types';

type SetGameState = Dispatch<SetStateAction<GameState>>;

interface MechanicLogSyncOptions {
  sessionId?: string;
  roomDefinitions?: RoomDefinition[];
}

export const useMechanicLogSync = (
  setGameState: SetGameState,
  options: MechanicLogSyncOptions = {}
) => {
  return useCallback(() => {
    const flushed = mechanicEngine.flush();
    if (flushed.events.length || flushed.canonical.length || flushed.expected.length) {
      setGameState((prev) => {
        const nextExpected = [...prev.expectedActions, ...flushed.expected];
        const nextCanonical = [...prev.canonicalActions, ...flushed.canonical];
        const newComparisons = compareExpectedVsActual(
          nextExpected,
          nextCanonical,
          prev.comparisons,
          {
            includeNotDone: false,
            sessionId: options.sessionId,
            currentDay: prev.day,
            currentTimeSlot: prev.timeSlot,
            staffRoster: prev.staffRoster,
            roomDefinitions: options.roomDefinitions ?? [],
            decisionLog: prev.decisionLog,
          }
        );

        return {
          ...prev,
          mechanicEvents: [...prev.mechanicEvents, ...flushed.events],
          canonicalActions: nextCanonical,
          expectedActions: nextExpected,
          comparisons: mergeComparisonResults(prev.comparisons, newComparisons),
        };
      });
    }
  }, [options.roomDefinitions, options.sessionId, setGameState]);
};
