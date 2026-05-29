import {
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

export interface NarrativeClosureConfig {
  message: string;
}

export interface VersionContentPack {
  version: SimulatorVersion;
  stakeholders: Stakeholder[];
  scenarios: ScenarioFile;
  questions: Record<string, StakeholderQuestion[]>;
  emails: EmailTemplate[];
  documents: Document[];
  defaults: VersionDefaults;
  // Si esta presente, el modo cierra automaticamente al agotarse las secuencias jugables,
  // mostrando EndGameScreen con este mensaje. Modos con cierre propio (ej. etica) lo omiten.
  narrativeClosure?: NarrativeClosureConfig;
  // tab_ids de mecanicas a ocultar para este modulo (sobre la config de la version).
  hiddenMechanicTabs?: string[];
}
