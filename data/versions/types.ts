import {
  CaseDefinition,
  Document,
  DirectorObjectives,
  EmailTemplate,
  GameState,
  RoomDefinition,
  ScenarioFile,
  SimulatorVersion,
  Stakeholder,
  StakeholderQuestion,
  TimeSlotType,
} from '../../types';

export interface VersionDefaults {
  timeSlots: TimeSlotType[];
  secretaryRole: string;
  directorObjectives: DirectorObjectives;
  roomDefinitions?: RoomDefinition[];
  buildInitialGameState: () => GameState;
}

export interface VersionContentPack {
  version: SimulatorVersion;
  stakeholders: Stakeholder[];
  scenarios: ScenarioFile;
  questions: Record<string, StakeholderQuestion[]>;
  emails: EmailTemplate[];
  documents: Document[];
  cases: CaseDefinition[];
  defaults: VersionDefaults;
}
