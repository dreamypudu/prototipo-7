import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CommitmentDisplayItem } from '../services/commitments';
import { buildCommitmentDisplayItem } from '../services/commitments';
import type { GameState, GameStatus, RoomDefinition } from '../types';

const buildSignature = (commitment: CommitmentDisplayItem) =>
  `${commitment.status}:${commitment.title}:${commitment.description}`;

export const useCommitmentsTracker = (
  gameState: GameState,
  roomDefinitions: RoomDefinition[] = [],
  gameStatus: GameStatus = 'playing'
) => {
  const [unseenCommitmentIds, setUnseenCommitmentIds] = useState<string[]>([]);
  const previousSignaturesRef = useRef<Record<string, string>>({});
  const hasInitializedRef = useRef(false);

  const commitments = useMemo(
    () =>
      gameState.expectedActions
        .map((expected) => {
          const item = buildCommitmentDisplayItem(expected, gameState, roomDefinitions);
          if (gameStatus !== 'playing' && item.status === 'active') {
            return { ...item, status: 'failed' as const };
          }
          return item;
        })
        .sort((left, right) => right.createdAt - left.createdAt),
    [gameState, roomDefinitions, gameStatus]
  );

  useEffect(() => {
    const nextSignatures: Record<string, string> = {};
    const changedIds: string[] = [];

    commitments.forEach((commitment) => {
      const signature = buildSignature(commitment);
      nextSignatures[commitment.expectedActionId] = signature;

      if (!hasInitializedRef.current) return;
      if (previousSignaturesRef.current[commitment.expectedActionId] !== signature) {
        changedIds.push(commitment.expectedActionId);
      }
    });

    if (hasInitializedRef.current && changedIds.length > 0) {
      setUnseenCommitmentIds((prev) => Array.from(new Set([...prev, ...changedIds])));
    }

    previousSignaturesRef.current = nextSignatures;
    hasInitializedRef.current = true;
  }, [commitments]);

  const markAllSeen = useCallback(() => {
    setUnseenCommitmentIds([]);
  }, []);

  return {
    commitments,
    unseenCount: unseenCommitmentIds.length,
    hasUnseenUpdates: unseenCommitmentIds.length > 0,
    markAllSeen,
  };
};
