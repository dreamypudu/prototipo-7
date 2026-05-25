import type { BridgeResponseLine, Consequences } from '../types';

export interface DialogueLine {
  stakeholderId?: string;
  stakeholderRole?: string;
  preserveCurrentSpeaker?: boolean;
  text: string;
}

const hasText = (text?: string): text is string => Boolean(text?.trim());

const mapBridgeLine = (line: BridgeResponseLine): DialogueLine => ({
  stakeholderId: line.stakeholder_id,
  stakeholderRole: line.stakeholder_role,
  text: line.text,
});

export const buildConsequenceDialogueLines = (consequences: Consequences): DialogueLine[] => {
  if (Array.isArray(consequences.bridgeResponse)) {
    return consequences.bridgeResponse
      .filter((line) => hasText(line.text))
      .map(mapBridgeLine);
  }

  return hasText(consequences.bridgeResponse)
    ? [{
        stakeholderId: consequences.response_stakeholder_id,
        preserveCurrentSpeaker: !consequences.response_stakeholder_id,
        text: consequences.bridgeResponse,
      }]
    : [];
};
