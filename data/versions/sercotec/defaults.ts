import { DirectorObjectives, GameState, TimeSlotType } from '../../../types';
import { SERCOTEC_STAKEHOLDERS } from './stakeholders';

export const TIME_SLOTS: TimeSlotType[] = ['ma?ana', 'tarde'];
export const SECRETARY_ROLE = 'Asistente de Programa';
export const DIRECTOR_OBJECTIVES: DirectorObjectives = {
  maxDeadline: 20,
  minBudget: 0,
  minReputation: 30,
  minProgress: 100,
  minTrustWithRequired: 40,
  requiredStakeholdersRoles: []
};

export const INITIAL_GAME_STATE: GameState = {
  playerName: '',
  projectTitle: 'Gesti?n PyME (SERCOTEC)',
  budget: 500000,
  day: 1,
  timeSlot: 'ma?ana',
  projectDeadline: 20,
  reputation: 60,
  projectProgress: 0,
  stakeholders: SERCOTEC_STAKEHOLDERS,
  staffRoster: [],
  weeklySchedule: [],
  calendar: [],
  eventsLog: [],
  history: {},
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
  playerNotes: '',
  scenarioSchedule: {},
  strategy: {
    budgetAllocation: { community: 20, environment: 20, pr: 20, legal: 20, safety: 20 },
    projectScope: { technicalApproach: 'standard', mitigationMeasures: [] },
    timeline: { schedule: 'normal' },
    publicRelations: { transparency: 'controlled', narrative: 'governance' }
  },
  mechanicEvents: [],
  canonicalActions: [],
  expectedActions: [],
  comparisons: []
};

export const buildInitialGameState = (): GameState => structuredClone(INITIAL_GAME_STATE);
