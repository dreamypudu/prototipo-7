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

// Contenido por tarea delegable, indexado por target_ref del expected_action de delegacion.
export interface DelegationTaskContent {
  // Monologo breve de Sofia al aceptar el encargo (globo de dialogo + "Siguiente").
  monologue: string;
  // event_id del correo de confirmacion (trigger ON_CASE_EVENT) que llega ~1 dia despues.
  confirmationEmailEventId?: string;
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
  // Contenido de las tareas delegables (monologo + correo), indexado por target_ref.
  delegationTasks?: Record<string, DelegationTaskContent>;
}
