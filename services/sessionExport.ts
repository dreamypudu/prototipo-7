// Construye el payload completo de sesión que se descarga o persiste en backend.
import {
  CanonicalAction,
  DailyResolution,
  ComparisonResult,
  ComparisonMode,
  DecisionLogEntry,
  ExpectedAction,
  GameState,
  MechanicEvent,
  PlayerActionLogEntry,
  ProcessLogEntry,
  QuestionLogEntry,
  RoomDefinition,
  SimulatorConfig
} from '../types';
import { compareExpectedVsActual, finalizePendingComparisonsLocally, mergeComparisonResults } from './ComparisonEngine';
import { COMPARISON_MODE, isFrontendComparisonMode } from './comparisonMode';

export interface SessionExport {
  comparison_mode: ComparisonMode;
  session_metadata: {
    session_id: string;
    simulator_version_id: string;
    user_id?: string;
    start_time: string;
    end_time: string;
  };
  explicit_decisions: DecisionLogEntry[];
  expected_actions: ExpectedAction[];
  mechanic_events: MechanicEvent[];
  canonical_actions: CanonicalAction[];
  comparisons: ComparisonResult[];
  daily_resolutions?: DailyResolution[];
  process_log: ProcessLogEntry[];
  player_actions_log: PlayerActionLogEntry[];
  question_log: QuestionLogEntry[];
  final_state: {
    stakeholders: GameState['stakeholders'];
    completedSequences: GameState['completedSequences'];
    completedScenarios: GameState['completedScenarios'];
    unlockedContent?: GameState['unlockedContent'];
    global: {
      day: number;
      timeSlot: GameState['timeSlot'];
      budget: number;
      reputation: number;
      projectProgress: number;
    };
  };
}

interface SessionExportParams {
  gameState: GameState;
  config: SimulatorConfig | null;
  sessionId: string;
  anonymousUserId: string;
  startedAt?: number | null;
  endedAt?: number | null;
  roomDefinitions?: RoomDefinition[];
}

export const buildSessionExport = ({
  gameState,
  config,
  sessionId,
  anonymousUserId,
  startedAt,
  endedAt,
  roomDefinitions = []
}: SessionExportParams): SessionExport => {
  const startTime = new Date(startedAt ?? Date.now()).toISOString();
  const endTime = new Date(endedAt ?? Date.now()).toISOString();
  const newComparisons = isFrontendComparisonMode
    ? finalizePendingComparisonsLocally(gameState, roomDefinitions, { sessionId })
    : compareExpectedVsActual(
        gameState.expectedActions,
        gameState.canonicalActions,
        gameState.comparisons,
        {
          includeNotDone: true,
          finalize: true,
          sessionId,
          resolvedDay: gameState.day,
          currentDay: gameState.day,
          currentTimeSlot: gameState.timeSlot,
          staffRoster: gameState.staffRoster,
          roomDefinitions,
          decisionLog: gameState.decisionLog,
        }
      );
  const comparisons = mergeComparisonResults(gameState.comparisons, newComparisons);

  return {
    comparison_mode: COMPARISON_MODE,
    session_metadata: {
      session_id: sessionId,
      simulator_version_id: config?.version_id ?? 'UNKNOWN',
      user_id: anonymousUserId,
      start_time: startTime,
      end_time: endTime
    },
    explicit_decisions: gameState.decisionLog,
    expected_actions: gameState.expectedActions,
    mechanic_events: gameState.mechanicEvents,
    canonical_actions: gameState.canonicalActions,
    comparisons,
    daily_resolutions: gameState.dailyResolutions,
    process_log: gameState.processLog,
    player_actions_log: gameState.playerActionsLog,
    question_log: gameState.questionLog,
    final_state: {
      stakeholders: gameState.stakeholders,
      completedSequences: gameState.completedSequences,
      completedScenarios: gameState.completedScenarios,
      unlockedContent: gameState.unlockedContent,
      global: {
        day: gameState.day,
        timeSlot: gameState.timeSlot,
        budget: gameState.budget,
        reputation: gameState.reputation,
        projectProgress: gameState.projectProgress
      }
    }
  };
};
