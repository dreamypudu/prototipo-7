import type { GameState, MeetingSequence, TimeSlotType } from '../types';
import { isSequenceUnlocked } from './contentUnlocks';

export interface SequenceReachabilityOptions {
  timeSlots: TimeSlotType[];
  isSequenceWindowOpen: (sequence: MeetingSequence, state: GameState) => boolean;
  shouldTriggerContingentSequence: (sequence: MeetingSequence, state: GameState) => boolean;
}

// Una secuencia mantiene viva la simulacion si esta desbloqueada y aun puede jugarse:
// disponible en el periodo actual, o con una ventana (triggerMap) en un periodo futuro.
// Esto permite que las elecciones del jugador "muevan" dinamicamente el cierre: si una linea
// narrativa desbloquea o agenda una secuencia mas adelante, el cierre se posterga hasta ella.
export const hasReachableSequence = (
  sequences: MeetingSequence[],
  state: GameState,
  options: SequenceReachabilityOptions
): boolean =>
  sequences.some((seq) => {
    if (state.completedSequences.includes(seq.sequence_id)) return false;
    if (!isSequenceUnlocked(seq, state)) return false;

    if (options.isSequenceWindowOpen(seq, state)) {
      if (seq.isContingent) {
        if (options.shouldTriggerContingentSequence(seq, state)) return true;
      } else {
        return true;
      }
    }

    if (seq.triggerMap) {
      const slotNow = options.timeSlots.indexOf(state.timeSlot);
      const slotTrigger = options.timeSlots.indexOf(seq.triggerMap.slot);
      const hasFutureWindow =
        seq.triggerMap.day > state.day ||
        (seq.triggerMap.day === state.day && slotTrigger > slotNow);
      if (hasFutureWindow) return true;
    }

    return false;
  });
