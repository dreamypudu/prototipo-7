import type { GameState, MeetingSequence } from '../types';
import { isSequenceUnlocked } from './contentUnlocks';

interface BlockingSequenceQueueOptions {
  isSequenceWindowOpen: (sequence: MeetingSequence, state: GameState) => boolean;
  shouldTriggerContingentSequence: (sequence: MeetingSequence, state: GameState) => boolean;
}

const isBlockingSequence = (sequence: MeetingSequence) =>
  Boolean(sequence.isContingent || sequence.isInevitable);

const getBlockingPriority = (sequence: MeetingSequence) => {
  if (sequence.isContingent) return 0;
  if (sequence.isInevitable) return 1;
  return 2;
};

export const getBlockingSequenceQueue = (
  sequences: MeetingSequence[],
  state: GameState,
  options: BlockingSequenceQueueOptions
): MeetingSequence[] =>
  sequences
    .map((sequence, index) => ({ sequence, index }))
    .filter(({ sequence }) => {
      if (!isBlockingSequence(sequence)) return false;
      if (state.completedSequences.includes(sequence.sequence_id)) return false;
      if (!isSequenceUnlocked(sequence, state)) return false;
      if (!options.isSequenceWindowOpen(sequence, state)) return false;
      if (sequence.isContingent) {
        return options.shouldTriggerContingentSequence(sequence, state);
      }
      return Boolean(sequence.isInevitable);
    })
    .sort((left, right) => {
      const priorityDelta = getBlockingPriority(left.sequence) - getBlockingPriority(right.sequence);
      return priorityDelta !== 0 ? priorityDelta : left.index - right.index;
    })
    .map(({ sequence }) => sequence);

export const getNextBlockingSequence = (
  sequences: MeetingSequence[],
  state: GameState,
  options: BlockingSequenceQueueOptions
) => getBlockingSequenceQueue(sequences, state, options)[0] ?? null;
