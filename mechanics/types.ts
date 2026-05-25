import type { ComponentType } from 'react';
import type { CommitmentTemplate } from '../services/commitments_text_generator';
import type {
  ConversationMode,
  GameStatus,
  GlobalEffectsUI,
  MeetingSequence,
  PlayerAction,
  ScheduleAssignment,
  CanonicalAction,
  ExpectedAction,
  RoomDefinition,
  StakeholderQuestion,
  StaffMember,
  Stakeholder,
  TimeSlotType
} from '../types';

export interface MechanicModuleProps {
  params?: Record<string, any>;
}

export type MechanicDispatchAction =
  | { type: 'update_schedule'; schedule: ScheduleAssignment[] }
  | { type: 'execute_week' }
  | { type: 'mark_email_read'; emailId: string }
  | { type: 'mark_document_read'; docId: string }
  | { type: 'update_notes'; notes: string }
  | { type: 'map_interact'; staff: StaffMember }
  | { type: 'call_stakeholder'; stakeholder: Stakeholder }
  | { type: 'update_scenario_schedule'; id: string; day: number; slot: TimeSlotType }
  | { type: 'navigate_tab'; tabId: string };

export type MechanicDispatch = (action: MechanicDispatchAction) => boolean | void;

export type OfficeVariant = 'default' | 'innovatec';

export interface OfficeBaseState {
  variant: OfficeVariant;
  characterInFocus: Stakeholder | null;
  currentDialogue: string;
  isDialogueNarration?: boolean;
  playerActions: PlayerAction[];
  conversationMode: ConversationMode;
  isLoading: boolean;
  gameStatus: GameStatus;
  currentMeeting: { sequence: MeetingSequence; nodeIndex: number } | null;
  onPlayerAction: (action: PlayerAction) => void;
  onNavigateTab: (tabId: string) => void;
  onActionHover?: (effects: GlobalEffectsUI | null) => void;
  onAskQuestion?: (question: StakeholderQuestion) => void;
  onDialogueTypingChange?: (isTyping: boolean) => void;
}

export interface DefaultOfficeState extends OfficeBaseState {
  variant: 'default';
}

export interface InnovatecOfficeState extends OfficeBaseState {
  variant: 'innovatec';
  secretary: Stakeholder | null;
  schedulingState: 'none' | 'selecting_slot' | 'selecting_stakeholder' | 'confirming_schedule';
  onSlotSelect: (day: number, slot: TimeSlotType) => void;
  onRequestMeeting: (stakeholder: Stakeholder) => void;
}

export type OfficeState = DefaultOfficeState | InnovatecOfficeState;

export interface MechanicRuleEvaluation {
  outcome: boolean;
  reason?: string | null;
  rawDeviation?: any;
}

export interface MechanicRuleResolution {
  canonicalAction: CanonicalAction | null;
  evaluation: MechanicRuleEvaluation;
}

export interface MechanicRuleContext {
  canonicalActions: CanonicalAction[];
  currentDay?: number;
  currentTimeSlot?: TimeSlotType;
  staffRoster: StaffMember[];
  roomDefinitions: RoomDefinition[];
  includeNotDone: boolean;
  finalize: boolean;
}

export interface MechanicComparisonRule {
  rule_id: string;
  mechanic_id: string;
  action_type: string;
  resolve: (expected: ExpectedAction, context: MechanicRuleContext) => MechanicRuleResolution | null;
  commitmentText?: CommitmentTemplate;
}

export interface MechanicRegistryEntry {
  mechanic_id: string;
  label: string;
  tab_id: string;
  Module?: ComponentType<MechanicModuleProps>;
  rules?: Record<string, MechanicComparisonRule>;
}

export type MechanicRegistry = Record<string, MechanicRegistryEntry>;
