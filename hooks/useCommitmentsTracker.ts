import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CommitmentDisplayItem, CommitmentTextTemplates } from '../services/commitments_text_generator';
import { buildCommitmentDisplayItem } from '../services/commitments_text_generator';
import type { GameState, GameStatus, RoomDefinition } from '../types';

const EMPTY_COMMITMENT_TEXT_TEMPLATES: CommitmentTextTemplates = {};

const buildSignature = (commitment: CommitmentDisplayItem) =>
  `${commitment.status}:${commitment.title}:${commitment.description}`;

export const useCommitmentsTracker = (
  gameState: GameState,
  roomDefinitions: RoomDefinition[] = [],
  gameStatus: GameStatus = 'playing',
  textTemplates: CommitmentTextTemplates = EMPTY_COMMITMENT_TEXT_TEMPLATES
) => {
  const [unseenCommitmentIds, setUnseenCommitmentIds] = useState<string[]>([]);
  const previousSignaturesRef = useRef<Record<string, string>>({});
  const hasInitializedRef = useRef(false);

  const commitments = useMemo(
    () =>
      gameState.expectedActions
        .map((expected) => {
          const item = buildCommitmentDisplayItem(expected, gameState, roomDefinitions, textTemplates);
          if (gameStatus !== 'playing' && item.status === 'active') {
            return { ...item, status: 'failed' as const };
          }
          return item;
        })
        .sort((left, right) => right.createdAt - left.createdAt),
    [gameState, roomDefinitions, gameStatus, textTemplates]
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
