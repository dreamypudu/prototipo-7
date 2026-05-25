import type { Consequences } from '../types';

export interface DialogueLine {
  stakeholderId?: string;
  stakeholderRole?: string;
  text: string;
}

const hasText = (text?: string): text is string => Boolean(text?.trim());

export const buildConsequenceDialogueLines = (consequences: Consequences): DialogueLine[] => {
  const reactionLines = (consequences.reactions ?? [])
    .filter((reaction) => hasText(reaction.text))
    .map((reaction) => ({
      stakeholderId: reaction.stakeholder_id,
      stakeholderRole: reaction.stakeholder_role,
      text: reaction.text,
    }));

  const bridgeLine = hasText(consequences.dialogueResponse)
    ? [{
        stakeholderId: consequences.response_stakeholder_id,
        text: consequences.dialogueResponse,
      }]
    : [];

  return [...reactionLines, ...bridgeLine];
};
