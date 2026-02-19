import {
  DirectorObjectives,
  EmailTemplate,
  GameState,
  GlobalObjectiveDefinition,
  NpcObjectiveDefinition,
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
  buildInitialGameState: () => GameState;
}

export interface VersionContentPack {
  version: SimulatorVersion;
  stakeholders: Stakeholder[];
  scenarios: ScenarioFile;
  questions: Record<string, StakeholderQuestion[]>;
  emails: EmailTemplate[];
  globalObjectives: GlobalObjectiveDefinition[];
  npcObjectives: NpcObjectiveDefinition[];
  defaults: VersionDefaults;
}
