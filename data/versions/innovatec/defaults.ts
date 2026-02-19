import { GameState, TimeSlotType, DirectorObjectives } from '../../../types';
import { INNOVATEC_STAKEHOLDERS } from './stakeholders';

export const TIME_SLOTS: TimeSlotType[] = ['mañana', 'tarde', 'noche'];

export const SECRETARY_ROLE = "Asistente Ejecutiva";

export const DIRECTOR_OBJECTIVES: DirectorObjectives = {
  maxDeadline: 28,
  minBudget: 0,
  minReputation: 30,
  minProgress: 100,
  minTrustWithRequired: 40,
  requiredStakeholdersRoles: [
    "Chief Financial Officer (CFO)",
    "Lead Engineer"
  ]
};

export const INITIAL_GAME_STATE: GameState = {
  playerName: '',
  projectTitle: "Proyecto Quantum Leap",
  budget: 1000000,
  day: 1,
  timeSlot: 'mañana',
  projectDeadline: 28,
  reputation: 60,
  projectProgress: 0,
  stakeholders: INNOVATEC_STAKEHOLDERS,
  staffRoster: [],
  weeklySchedule: [],
  eventsLog: [],
  calendar: [],
  history: {},
  strategy: {
    budgetAllocation: {
      community: 20,
      environment: 20,
      pr: 20,
      legal: 20,
      safety: 20,
    },
    projectScope: {
      technicalApproach: 'standard',
      mitigationMeasures: [],
    },
    timeline: {
      schedule: 'normal',
    },
    publicRelations: {
      transparency: 'controlled',
      narrative: 'jobs',
    },
  },
  completedScenarios: [],
  completedSequences: [],
  criticalWarnings: [],
  decisionLog: [],
  questionLog: [],
  processLog: [],
  inbox: [],
  stakeholder_preferences: {},
  readDocuments: [],
  playerActionsLog: [],
  playerNotes: "",
  scenarioSchedule: {},

  mechanicEvents: [],
  canonicalActions: [],
  expectedActions: [],
  comparisons: [],
};

export const buildInitialGameState = (): GameState => structuredClone(INITIAL_GAME_STATE);
