import type { ContentUnlocks, EmailTemplate, GameState, MeetingSequence } from '../types';

const unique = (values: string[] = []) => Array.from(new Set(values.filter(Boolean)));

const mergeIds = (current: string[] = [], incoming: string[] = []) =>
  unique([...current, ...incoming]);

export const normalizeContentUnlocks = (unlocks?: ContentUnlocks): Required<ContentUnlocks> => ({
  sequences: unique(unlocks?.sequences),
  emails: unique(unlocks?.emails),
  documents: unique(unlocks?.documents),
});

export const applyContentUnlocks = (state: GameState, unlocks?: ContentUnlocks): GameState => {
  const nextUnlocks = normalizeContentUnlocks(unlocks);
  if (
    nextUnlocks.sequences.length === 0 &&
    nextUnlocks.emails.length === 0 &&
    nextUnlocks.documents.length === 0
  ) {
    return state;
  }

  const current = normalizeContentUnlocks(state.unlockedContent);
  return {
    ...state,
    unlockedContent: {
      sequences: mergeIds(current.sequences, nextUnlocks.sequences),
      emails: mergeIds(current.emails, nextUnlocks.emails),
      documents: mergeIds(current.documents, nextUnlocks.documents),
    },
  };
};

export const isSequenceUnlocked = (sequence: MeetingSequence, state: GameState): boolean =>
  !sequence.requiresUnlock ||
  Boolean(state.unlockedContent?.sequences?.includes(sequence.sequence_id));

export const isEmailUnlocked = (template: EmailTemplate, state: GameState): boolean =>
  !template.requiresUnlock ||
  Boolean(state.unlockedContent?.emails?.includes(template.email_id));
