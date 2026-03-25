
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ActionEffectsPreview, ConversationMode, DailyResolution, GameState, GlobalEffectsUI, InternalEffectsPreview, Stakeholder, StakeholderQuestion, PlayerAction, TimeSlotType, Commitment, ScenarioNode, ScenarioOption, MeetingSequence, ProcessLogEntry, DecisionLogEntry, Consequences, InboxEmail, PlayerActionLogEntry, Document, ScheduleAssignment, StaffMember, SimulatorVersion, SimulatorConfig, MechanicConfig, GameStatus, QuestionLogEntry, ScenarioFile } from './types';
import { SIMULATOR_CONFIGS } from './data/simulatorConfigs';
import { getVersionContentPack, type VersionContentPack } from './data/versions';
import { startLogging, finalizeLogging } from './services/Timelogger';
import { mechanicEngine } from './services/MechanicEngine';
import { MECHANIC_REGISTRY } from './mechanics/registry';
import { MechanicProvider } from './mechanics/MechanicContext';
import { MechanicDispatchAction, OfficeState } from './mechanics/types';
import { buildSessionExport } from './services/sessionExport';
import { useMechanicLogSync } from './hooks/useMechanicLogSync';
import { compareExpectedVsActual } from './services/ComparisonEngine';
import { clampReputation, resolveActionEffectsPreview, resolveGlobalEffects, resolveInternalEffectsPreview } from './services/globalEffects';
import { isFrontendComparisonMode } from './services/comparisonMode';
import { getInitialDeveloperAccess, tryUnlockDeveloperAccess } from './services/developerAccess';
import { appendTimeBlockEmails } from './services/emailTriggers';
import { resolveDayEffectsLocally, resolutionHasChanges } from './services/localDayResolution';
import { applyDailyResolutionToState } from './services/dailyResolutionState';
import {
  clearSessionSnapshot,
  downloadSessionSnapshot,
  persistSessionExport,
  saveSessionSnapshot,
} from './services/sessionPersistence';
import {
  CASE1_ENDING_SEQUENCE_IDS,
  CASE1_FRIDAY_DAY,
  CASE1_FRIDAY_REMINDER_SEQUENCE_ID,
  CASE1_INTRO_SEQUENCE_ID,
  CASE1_NEXT_MONDAY_DAY,
  resolveCase1SubmissionOutcome,
} from './services/cesfamCase1';
import {
  resolveStakeholderByRef,
  sequenceBelongsToStakeholder,
} from './services/stakeholderResolver';
import {
  canEditCesfamSchedule,
  getCesfamScheduleExecuteDisabledReason,
  getCesfamWeekInfo,
  wasCesfamScheduleSubmittedThisWeek,
} from './services/cesfamScheduleTiming';
import { buildDefaultWeeklySchedule } from './data/versions/cesfam/defaults';

import Header from './components/Header';
import DayReviewScreen from './components/DayReviewScreen';
import EndGameScreen from './components/EndGameScreen';
import WarningPopup from './components/WarningPopup';
import Sidebar from './components/Sidebar';
import HelpButton from './components/ui/HelpButton';
import HelpPanel from './components/ui/HelpPanel';
import CaseObjectivesPanel from './components/ui/CaseObjectivesPanel';
import VersionSelector from './components/VersionSelector';
import InnovatecGame from './games/InnovatecGame';
import SplashScreen from './components/SplashScreen';
import type { DailyEffectSummary } from './types';
import { useCaseTracker } from './hooks/useCaseTracker';
import { useCommitmentsTracker } from './hooks/useCommitmentsTracker';
import { buildCesfamDayReviewData, type CesfamDayReviewData } from './services/dayReview';
import { evaluateConditionGroup } from './services/commitments';

type ActiveTab = string;
type AppStep = 'version_selection' | 'splash' | 'game';

interface PendingDayReviewState {
  nextState: GameState;
  summary: DailyEffectSummary | null;
  resolution: DailyResolution | null;
  reviewData: CesfamDayReviewData;
  deferredEmailIds: string[];
}

const PERIOD_DURATION = 90;
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_URL ||
  'https://prototipo-5-41cj.onrender.com';

const DEFAULT_VERSION: SimulatorVersion = 'CESFAM';
const DEFAULT_CONTENT_PACK = getVersionContentPack(DEFAULT_VERSION);
const DEFAULT_INITIAL_STATE = DEFAULT_CONTENT_PACK.defaults.buildInitialGameState();

const LOGO_BY_VERSION: Partial<Record<SimulatorVersion, string>> = {
  INNOVATEC: '/avatars/icono-compass.svg',
  CESFAM: '/avatars/icono-compass.svg',
  LEY_KARIN: '/avatars/icono-compass.svg',
  SERCOTEC: '/avatars/icono-compass.svg',
  MUNICIPAL: '/avatars/icono-compass.svg'
};

const SUBTITLE_BY_VERSION: Record<SimulatorVersion, string> = {
  CESFAM: 'Gestión en Salud',
  INNOVATEC: 'Innovatec (Proyecto Quantum Leap)',
  LEY_KARIN: 'Ley Karin',
  SERCOTEC: 'Gestión PyME (SERCOTEC)',
  MUNICIPAL: 'Gestión Municipal'
};

const getVersionSubtitle = (version: SimulatorVersion | null, fallback?: string) => {
  if (version && SUBTITLE_BY_VERSION[version]) return SUBTITLE_BY_VERSION[version];
  return fallback || 'Simulador de decisiones';
};

type ResolvedMechanicConfig = MechanicConfig & {
  label: string;
  tab_id: string;
};

const summarizeDeltas = (
  day: number,
  globalDeltas: { budget?: number; reputation?: number },
  stakeholderDeltas: Record<string, any>
): DailyEffectSummary => {
  const b = Number(globalDeltas?.budget || 0);
  const r = Number(globalDeltas?.reputation || 0);
  let strongestInternal = 0;
  Object.values(stakeholderDeltas || {}).forEach((delta: any) => {
    const trustDelta = Number(delta?.trust || 0);
    const supportDelta = Number(delta?.support || 0);
    if (Math.abs(trustDelta) > Math.abs(strongestInternal)) strongestInternal = trustDelta;
    if (Math.abs(supportDelta) > Math.abs(strongestInternal)) strongestInternal = supportDelta;
  });
  return {
    day,
    global: {
      budget: b,
      reputation: r,
    },
    internalTrend: strongestInternal > 0 ? 'up' : strongestInternal < 0 ? 'down' : 'neutral',
    internalMagnitude: Math.abs(strongestInternal),
  };
};

const createInitialGameState = (contentPack: VersionContentPack): GameState => {
  const baseState = contentPack.defaults.buildInitialGameState();
  const scenarioSource = contentPack.scenarios;
  const initialSchedule: Record<string, {day: number, slot: TimeSlotType}> = {};

  scenarioSource.sequences.forEach(seq => {
      if (seq.triggerMap && (seq.isInevitable || seq.isContingent)) {
          initialSchedule[seq.sequence_id] = seq.triggerMap;
      }
  });

  return {
      ...baseState,
      scenarioSchedule: initialSchedule,
      mechanicEvents: [],
      canonicalActions: [],
      expectedActions: [],
      comparisons: [],
      dailyResolutions: [],
      resolvedExpectedActionIds: [],
      questionLog: []
  };
};

const appendCaseEventEmails = (
  state: GameState,
  emailTemplates: VersionContentPack['emails'],
  eventIds: string[],
  dayReceived: number
): GameState => {
  if (eventIds.length === 0) return state;

  const templates = emailTemplates.filter(
    (template) => template.trigger.type === 'ON_CASE_EVENT' && eventIds.includes(template.trigger.event_id)
  );
  const newInboxEntries = templates
    .filter((template) => !state.inbox.some((entry) => entry.email_id === template.email_id))
    .map((template) => ({
      email_id: template.email_id,
      dayReceived,
      isRead: false,
    }));

  if (newInboxEntries.length === 0) return state;
  return {
    ...state,
    inbox: [...state.inbox, ...newInboxEntries],
  };
};

const getSequenceCompletionEmailIds = (sequenceId?: string): string[] => {
  if (sequenceId === CASE1_INTRO_SEQUENCE_ID) return ['case1-docs-ready'];
  if (sequenceId === CASE1_FRIDAY_REMINDER_SEQUENCE_ID) return ['case1-friday-reminder'];
  return [];
};

const resolveMechanics = (config: SimulatorConfig | null): ResolvedMechanicConfig[] => {
  if (!config) return [];
  return config.mechanics.flatMap((mechanic) => {
    const registryEntry = MECHANIC_REGISTRY[mechanic.mechanic_id];
    if (!registryEntry) {
      console.warn(`Mechanic not registered: ${mechanic.mechanic_id}`);
      return [];
    }
    return [{
      ...registryEntry,
      ...mechanic,
      label: mechanic.label ?? registryEntry.label,
      tab_id: mechanic.tab_id ?? registryEntry.tab_id
    }];
  });
};

export default function App(): React.ReactElement {
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const anonymousUserIdRef = useRef<string>(crypto.randomUUID());
  const sessionStartRef = useRef<number | null>(null);
  const sessionEndRef = useRef<number | null>(null);
  const pendingCase1EndingRef = useRef<{ sequenceId: string; emailIds: string[] } | null>(null);
  const [appStep, setAppStep] = useState<AppStep>('version_selection');
  const [config, setConfig] = useState<SimulatorConfig | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<SimulatorVersion | null>(null);
  const [contentPack, setContentPack] = useState<VersionContentPack>(DEFAULT_CONTENT_PACK);
  const [scenarioData, setScenarioData] = useState<ScenarioFile>(DEFAULT_CONTENT_PACK.scenarios);
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(DEFAULT_CONTENT_PACK));
  
  const [characterInFocus, setCharacterInFocus] = useState<Stakeholder | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<string>("");
  const [playerActions, setPlayerActions] = useState<PlayerAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('interaction');
  
  const [countdown, setCountdown] = useState(PERIOD_DURATION);
  const [isTimerPaused, setIsTimerPaused] = useState(true);
  const [isDialogueTyping, setIsDialogueTyping] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [endGameMessage, setEndGameMessage] = useState<string>('');
  const [currentMeeting, setCurrentMeeting] = useState<{ sequence: MeetingSequence; nodeIndex: number } | null>(null);
  const [warningPopupMessage, setWarningPopupMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredGlobalEffects, setHoveredGlobalEffects] = useState<GlobalEffectsUI | null>(null);
  const [recentInternalResolution, setRecentInternalResolution] = useState<InternalEffectsPreview | null>(null);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('idle');
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [questionsOrigin, setQuestionsOrigin] = useState<ConversationMode | null>(null);
  const [questionsBaseDialogue, setQuestionsBaseDialogue] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<DailyEffectSummary | null>(null);
  const [pendingDayReview, setPendingDayReview] = useState<PendingDayReviewState | null>(null);
  const [isPreparingDayReview, setIsPreparingDayReview] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [isLeftRailExpanded, setIsLeftRailExpanded] = useState(false);
  const [logPos, setLogPos] = useState<{ x: number; y: number }>({ x: 240, y: 110 });
  const [isLogDragging, setIsLogDragging] = useState(false);
  const [logDragOffset, setLogDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isDeveloperUnlocked, setIsDeveloperUnlocked] = useState<boolean>(() => getInitialDeveloperAccess());
  const [finalPersistStatus, setFinalPersistStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [finalPersistError, setFinalPersistError] = useState<string | null>(null);
  const upSoundRef = useRef<HTMLAudioElement | null>(null);
  const downSoundRef = useRef<HTMLAudioElement | null>(null);
  const finalPersistAttemptedRef = useRef(false);
  const prevStats = useRef<{ budget: number; reputation: number }>({
    budget: DEFAULT_INITIAL_STATE.budget,
    reputation: DEFAULT_INITIAL_STATE.reputation
  });
  const audioUnlocked = useRef(false);
  const timeSlots = contentPack.defaults.timeSlots;
  const morningSlot = (timeSlots[0] ?? 'mañana') as TimeSlotType;
  const roomDefinitions = contentPack.defaults.roomDefinitions ?? [];
  const directorObjectives = contentPack.defaults.directorObjectives;
  const secretaryRole = contentPack.defaults.secretaryRole;
  const emailTemplates = contentPack.emails;
  const caseTracker = useCaseTracker(contentPack.cases, gameState);
  const commitmentTracker = useCommitmentsTracker(gameState, roomDefinitions, gameStatus);
  const {
    activeCase,
    unseenCount: caseUnseenCount,
    hasUnseenUpdates: hasUnseenCaseUpdates,
    registerSequenceCompleted,
    markAllSeen: markCaseUpdatesSeen,
  } = caseTracker;
  const {
    commitments,
    unseenCount: commitmentUnseenCount,
    hasUnseenUpdates: hasUnseenCommitmentUpdates,
    markAllSeen: markCommitmentsSeen,
  } = commitmentTracker;
  const objectivesUnseenCount = caseUnseenCount + commitmentUnseenCount;
  const hasUnseenObjectiveUpdates = hasUnseenCaseUpdates || hasUnseenCommitmentUpdates;
  const enabledMechanics = resolveMechanics(config);
  const playerVisibleMechanics = useMemo(
    () => enabledMechanics.filter((mechanic) => mechanic.tab_id !== 'summary' && mechanic.tab_id !== 'experimental_map'),
    [enabledMechanics]
  );
  const effectiveTimerPaused = isTimerPaused || isDialogueTyping || isPreparingDayReview || Boolean(pendingDayReview);
  // Sync mechanic engine buffers with React state periodically or on significant events
  const syncLogs = useMechanicLogSync(setGameState);
  const mergeMechanicFlushIntoState = useCallback((baseState: GameState): GameState => {
    const flushed = mechanicEngine.flush();
    if (!flushed.events.length && !flushed.canonical.length && !flushed.expected.length) {
      return baseState;
    }

    const nextExpected = [...baseState.expectedActions, ...flushed.expected];
    const nextCanonical = [...baseState.canonicalActions, ...flushed.canonical];

    return {
      ...baseState,
      mechanicEvents: [...baseState.mechanicEvents, ...flushed.events],
      canonicalActions: nextCanonical,
      expectedActions: nextExpected,
      comparisons: isFrontendComparisonMode
        ? baseState.comparisons
        : [
            ...baseState.comparisons,
            ...compareExpectedVsActual(
              nextExpected,
              nextCanonical,
              baseState.comparisons,
              { includeNotDone: false }
            ),
          ],
    };
  }, []);
  const stageTabs = [
    { id: 'stage_1', label: 'Etapa 1: Inicio', status: 'active' as const },
    { id: 'stage_2', label: 'Etapa 2: Progreso', status: 'upcoming' as const },
    { id: 'stage_3', label: 'Etapa 3: Cierre', status: 'upcoming' as const }
  ];
  const mechanicIconByTab: Record<string, string> = {
    interaction: '🏢',
    map: '🗺️',
    schedule: '📅',
    emails: '✉️',
    documents: '📁',
    calendar: '📆',
    data_export: '📤',
  };

  useEffect(() => {
    if (appStep !== 'game') return;
    const interval = setInterval(() => {
      syncLogs();
    }, 1000);
    return () => clearInterval(interval);
  }, [appStep, syncLogs]);

  // init sounds
  useEffect(() => {
    upSoundRef.current = new Audio('/sounds/indicator-up.mp3');
    downSoundRef.current = new Audio('/sounds/indicator-down.mp3');
    if (upSoundRef.current) upSoundRef.current.volume = 0.85;
    if (downSoundRef.current) downSoundRef.current.volume = 0.85;
  }, [timeSlots]);

  // Unlock audio on first user interaction (autoplay policies)
  useEffect(() => {
    const unlock = () => {
      if (audioUnlocked.current) return;
      const playSilent = async (el: HTMLAudioElement | null) => {
        if (!el) return;
        try {
          el.muted = true;
          el.currentTime = 0;
          await el.play();
          el.pause();
          el.currentTime = 0;
          el.muted = false;
          audioUnlocked.current = true;
        } catch (e) {
          // ignore; will retry on next interaction
        }
      };
      playSilent(upSoundRef.current);
      playSilent(downSoundRef.current);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // play sounds on indicator change
  useEffect(() => {
    const prev = prevStats.current;
    if (gameState.budget !== prev.budget) {
      const diff = gameState.budget - prev.budget;
      const snd = diff > 0 ? upSoundRef.current : downSoundRef.current;
      if (snd && audioEnabled && audioUnlocked.current) {
        snd.currentTime = 0;
        snd.play().catch(() => {});
      }
    }
    if (gameState.reputation !== prev.reputation) {
      const diff = gameState.reputation - prev.reputation;
      const snd = diff > 0 ? upSoundRef.current : downSoundRef.current;
      if (snd && audioEnabled && audioUnlocked.current) {
        snd.currentTime = 0;
        snd.play().catch(() => {});
      }
    }
    prevStats.current = { budget: gameState.budget, reputation: gameState.reputation };
  }, [gameState.budget, gameState.reputation]);

  // Drag handlers for Bitácora panel
  useEffect(() => {
    if (!isLogDragging) return;
    const handleMove = (e: MouseEvent) => {
      setLogPos({ x: e.clientX - logDragOffset.x, y: e.clientY - logDragOffset.y });
    };
    const handleUp = () => setIsLogDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isLogDragging, logDragOffset]);

  useEffect(() => {
    if (activeTab !== 'data_export') return;
    syncLogs();
  }, [activeTab, syncLogs]);

  useEffect(() => {
    if (!isDeveloperUnlocked && showLogPanel) {
      setShowLogPanel(false);
    }
  }, [isDeveloperUnlocked, showLogPanel]);

  const setPersonalizedDialogue = useCallback((dialogue: string) => {
    setCurrentDialogue(dialogue.replace(/{playerName}/g, gameState.playerName));
  }, [gameState.playerName]);

  const handleActionHover = useCallback((effects: ActionEffectsPreview | null) => {
    setHoveredGlobalEffects(effects?.global ?? null);
  }, []);

  const showToast = useCallback((msg: string, durationMs = 5000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), durationMs);
  }, []);

  const handleDeveloperUnlock = useCallback((password: string) => {
    const unlocked = tryUnlockDeveloperAccess(password);
    if (unlocked) {
      setIsDeveloperUnlocked(true);
    }
    return unlocked;
  }, []);

  const handleToggleObjectives = useCallback(() => {
    setIsObjectivesOpen((prev) => {
      const next = !prev;
      if (next) {
        markCaseUpdatesSeen();
        markCommitmentsSeen();
      }
      return next;
    });
  }, [markCaseUpdatesSeen, markCommitmentsSeen]);

  const handleLeftRailEnter = useCallback(() => {
    setIsLeftRailExpanded(true);
    setIsObjectivesOpen(false);
  }, []);

  const handleLeftRailLeave = useCallback(() => {
    setIsLeftRailExpanded(false);
    setIsObjectivesOpen(false);
  }, []);

  useEffect(() => {
    if (isObjectivesOpen && hasUnseenObjectiveUpdates) {
      markCaseUpdatesSeen();
      markCommitmentsSeen();
    }
  }, [isObjectivesOpen, hasUnseenObjectiveUpdates, markCaseUpdatesSeen, markCommitmentsSeen]);

  const hasQuestionsFor = (stakeholder: Stakeholder | null): boolean => {
    if (!stakeholder) return false;
    return Array.isArray(stakeholder.questions) && stakeholder.questions.length > 0;
  };

  const buildPreSequenceActions = (
    stakeholder: Stakeholder,
    actionLabel: string,
    actionCost: string,
    allowQuestions: boolean
  ): PlayerAction[] => {
    const actions: PlayerAction[] = [];
    if (allowQuestions && hasQuestionsFor(stakeholder)) {
      actions.push({ label: 'Hacer preguntas', cost: 'Opcional', action: 'ask_questions', uiVariant: 'success' });
    }
    actions.push({ label: actionLabel, cost: actionCost, action: 'start_meeting_sequence' });
    return actions;
  };

  const buildPostSequenceActions = (
    stakeholder: Stakeholder,
    options?: { concludeLabel?: string; concludeCost?: string }
  ): PlayerAction[] => {
    const actions: PlayerAction[] = [];
    if (hasQuestionsFor(stakeholder)) {
      actions.push({ label: 'Hacer preguntas', cost: 'Opcional', action: 'ask_questions', uiVariant: 'success' });
    }
    actions.push({
      label: options?.concludeLabel ?? 'Concluir Reunion',
      cost: options?.concludeCost ?? 'Finalizar',
      action: 'conclude_meeting'
    });
    return actions;
  };

  const getQuestionRequirementText = (question: StakeholderQuestion): string => {
    const parts: string[] = [];
    if (typeof question.requirements?.trust_min === 'number') parts.push(`Confianza >= ${question.requirements.trust_min}`);
    if (typeof question.requirements?.support_min === 'number') parts.push(`Apoyo >= ${question.requirements.support_min}`);
    if (typeof question.requirements?.reputation_min === 'number') parts.push(`Reputacion >= ${question.requirements.reputation_min}`);
    return parts.join(' | ');
  };

  const canAskQuestion = (question: StakeholderQuestion, stakeholder: Stakeholder, reputation: number): boolean => {
    const req = question.requirements;
    if (!req) return true;
    if (typeof req.trust_min === 'number' && stakeholder.trust < req.trust_min) return false;
    if (typeof req.support_min === 'number' && stakeholder.support < req.support_min) return false;
    if (typeof req.reputation_min === 'number' && reputation < req.reputation_min) return false;
    return true;
  };

  const buildQuestionListActions = (
    stakeholder: Stakeholder,
    reputation: number,
    origin: ConversationMode | null
  ): PlayerAction[] => {
    const actions = stakeholder.questions
      .map(question => {
        const alreadyAsked = stakeholder.questionsAsked.includes(question.question_id);
        const canAsk = canAskQuestion(question, stakeholder, reputation);
        const suffix = canAsk ? '' : ' (Bloqueada)';
        return {
          label: `${question.text}${suffix}`,
          cost: canAsk ? 'Pregunta' : 'Bloqueada',
          action: `question:${question.question_id}`,
          uiVariant: canAsk ? (alreadyAsked ? 'muted' : 'default') : 'danger',
          isLocked: !canAsk
        };
      });

    if (origin === 'questions_only') {
      actions.push({ label: 'Concluir Reunion', cost: 'Finalizar', action: 'conclude_meeting' });
    } else {
      actions.push({ label: 'Volver', cost: 'Volver', action: 'close_questions' });
    }
    return actions;
  };

  const buildQuestionAnswerActions = (
    origin: ConversationMode | null,
    startMeta?: { label: string; cost: string }
  ): PlayerAction[] => {
    const actions: PlayerAction[] = [
      { label: 'Seguir preguntando', cost: 'Opcional', action: 'return_to_questions', uiVariant: 'success' }
    ];
    if (origin === 'pre_sequence') {
      actions.push({
        label: startMeta?.label ?? 'Comenzar Reunion',
        cost: startMeta?.cost ?? 'Tiempo',
        action: 'start_meeting_sequence'
      });
    }
    if (origin === 'post_sequence' || origin === 'questions_only') {
      actions.push({ label: 'Concluir Reunion', cost: 'Finalizar', action: 'conclude_meeting' });
    }
    return actions;
  };

  const getSequenceActionMeta = (sequence: MeetingSequence) => {
    if (sequence.isInevitable) {
      return { label: 'Atender Situacion Inevitable', cost: 'Obligatorio' };
    }
    if (sequence.isContingent) {
      return { label: 'Atender Evento Contingente', cost: 'Obligatorio' };
    }
    return { label: 'Comenzar Reunion', cost: 'Tiempo' };
  };

  const hasCompletedSequenceForStakeholder = (stakeholder: Stakeholder, completedSequences: string[]) => {
    return scenarioData.sequences.some(
      seq => sequenceBelongsToStakeholder(seq, stakeholder) && completedSequences.includes(seq.sequence_id)
    );
  };

  const isInteractionBlockingTimeout = Boolean(
    characterInFocus && characterInFocus.role !== secretaryRole
  );

  const shouldTriggerContingentSequence = (sequence: MeetingSequence, state: GameState) => {
    if (!sequence.isContingent) return false;
    if (sequence.contingentConditions && !evaluateConditionGroup(state, sequence.contingentConditions)) {
      return false;
    }

    if (!sequence.contingentRules) {
      return Boolean(sequence.contingentConditions);
    }

    const rules = sequence.contingentRules;

    if (typeof rules.budgetBelow === 'number' && state.budget >= rules.budgetBelow) {
      return false;
    }

    if (typeof rules.trustBelow === 'number' || typeof rules.supportBelow === 'number') {
      const stakeholder = resolveStakeholderByRef(state.stakeholders, {
        stakeholderId: rules.stakeholderId ?? sequence.stakeholderId,
        stakeholderRole: rules.stakeholderRole ?? sequence.stakeholderRole,
      });
      if (!stakeholder) return false;

      if (typeof rules.trustBelow === 'number' && stakeholder.trust >= rules.trustBelow) {
        return false;
      }
      if (typeof rules.supportBelow === 'number' && stakeholder.support >= rules.supportBelow) {
        return false;
      }
    }

    return true;
  };

  const startSequence = useCallback((sequence: MeetingSequence, stakeholder: Stakeholder, options?: { pauseTimer?: boolean; actionLabel?: string; actionCost?: string }) => {
    const actionLabel = options?.actionLabel ?? "Comenzar Reunion";
    const actionCost = options?.actionCost ?? "Tiempo";
    setActiveTab('interaction');
    setCharacterInFocus(stakeholder);
    setCurrentMeeting({ sequence, nodeIndex: 0 });
    setPersonalizedDialogue(sequence.initialDialogue);
    setConversationMode('pre_sequence');
    const allowQuestions = hasCompletedSequenceForStakeholder(stakeholder, gameState.completedSequences);
    setPlayerActions(buildPreSequenceActions(stakeholder, actionLabel, actionCost, allowQuestions));
    const shouldPause = options?.pauseTimer ?? Boolean(sequence.isInevitable || sequence.isContingent);
    if (shouldPause) {
      setIsTimerPaused(true);
    }
  }, [setPersonalizedDialogue, buildPreSequenceActions, gameState.completedSequences, scenarioData]);

  const getSequenceOrder = (sequenceId: string) => {
    const match = sequenceId.match(/_(\d+)$/);
    return match ? Number(match[1]) : 0;
  };

  const isSequenceWindowOpen = useCallback((sequence: MeetingSequence, state: GameState) => {
    if (!sequence.triggerMap) return true;
    if (state.day > sequence.triggerMap.day) return true;
    if (state.day < sequence.triggerMap.day) return false;
    return timeSlots.indexOf(state.timeSlot) >= timeSlots.indexOf(sequence.triggerMap.slot);
  }, [timeSlots]);

  useEffect(() => {
    if (gameStatus === 'playing') return;
    if (appStep === 'game' && sessionEndRef.current === null) {
      sessionEndRef.current = Date.now();
    }
  }, [gameStatus, appStep, setGameState]);

  useEffect(() => {
    if (gameStatus !== 'playing' || appStep !== 'game') return;

    const { stakeholders, day, criticalWarnings, projectProgress } = gameState;
    let newWarnings: string[] = [];
    let stateChanges: Partial<GameState> = {};
    let updatedStakeholders = [...stakeholders];

    if (projectProgress >= directorObjectives.minProgress) {
      setEndGameMessage(`¡Gestión Exitosa! Has logrado alinear a los tres sectores. El CESFAM opera con un equilibrio razonable entre calidad, normativa y comunidad.`);
      setGameStatus('won');
      return;
    }

    const requiredStakeholders = stakeholders.filter(s => directorObjectives.requiredStakeholdersRoles.includes(s.role));
    let stakeholdersWereUpdated = false;
    requiredStakeholders.forEach(s => {
      if (s.trust < directorObjectives.minTrustWithRequired && s.status !== 'critical') {
        const warningMsg = `Crisis de Gobernabilidad: ${s.name} (${s.role}) está boicoteando activamente su gestión.`;
        if (!criticalWarnings.includes(warningMsg)) {
          newWarnings.push(warningMsg);
          updatedStakeholders = updatedStakeholders.map(sh => sh.name === s.name ? { ...sh, status: 'critical' } : sh);
          stakeholdersWereUpdated = true;
        }
      }
    });
    if (stakeholdersWereUpdated) {
      stateChanges.stakeholders = updatedStakeholders;
    }

    if (day > directorObjectives.maxDeadline && !criticalWarnings.includes(`Gestión Fallida: Plazo Excedido.`)) {
      newWarnings.push(`Gestión Fallida: Plazo Excedido.`);
    }

    if (newWarnings.length > 0) {
      setGameState(prev => ({ ...prev, ...stateChanges, criticalWarnings: [...prev.criticalWarnings, ...newWarnings] }));
      setWarningPopupMessage(newWarnings[0]);
      setIsTimerPaused(true);
    }
  }, [gameState, gameStatus, appStep, directorObjectives]);

  useEffect(() => {
    if (pendingDayReview || isPreparingDayReview) return;
    if (appStep !== 'game' || gameStatus !== 'playing' || currentMeeting) return;

    const inevitableSeq = scenarioData.sequences.find(seq =>
      seq.isInevitable &&
      !gameState.completedSequences.includes(seq.sequence_id) &&
      isSequenceWindowOpen(seq, gameState)
    );

    const contingentSeq = scenarioData.sequences.find(seq =>
      seq.isContingent &&
      !gameState.completedSequences.includes(seq.sequence_id) &&
      shouldTriggerContingentSequence(seq, gameState)
    );

    const sequenceToStart = inevitableSeq ?? contingentSeq;
    if (!sequenceToStart) return;

    const stakeholder = resolveStakeholderByRef(gameState.stakeholders, {
      stakeholderId: sequenceToStart.stakeholderId,
      stakeholderRole: sequenceToStart.stakeholderRole,
    });
    if (stakeholder) {
      const label = sequenceToStart.isInevitable ? "Atender Situacion Inevitable" : "Atender Evento Contingente";
      startSequence(sequenceToStart, stakeholder, { pauseTimer: true, actionLabel: label, actionCost: "Obligatorio" });
    } else {
      console.error(`[Content] Sequence ${sequenceToStart.sequence_id} references unknown stakeholderId="${sequenceToStart.stakeholderId}"`);
    }
  }, [pendingDayReview, isPreparingDayReview, gameState.day, gameState.timeSlot, gameState.completedSequences, appStep, gameStatus, currentMeeting, gameState.scenarioSchedule, gameState.stakeholders, startSequence, scenarioData, isSequenceWindowOpen]);

  const advanceTime = useCallback((currentState: GameState): GameState => {
    let nextSlotIndex = timeSlots.indexOf(currentState.timeSlot) + 1;
    let nextDay = currentState.day;
    let newEvents: string[] = [];
    let historyUpdate = {};
    let completedDay: number | null = null;

    if (nextSlotIndex >= timeSlots.length) {
      nextSlotIndex = 0;
      nextDay++;
      historyUpdate = { [currentState.day]: currentState.stakeholders };
      completedDay = currentState.day;
    }
    const nextSlot = timeSlots[nextSlotIndex];

    let newState = { ...currentState, day: nextDay, timeSlot: nextSlot, history: { ...currentState.history, ...historyUpdate } };

    if (
      selectedVersion === 'CESFAM' &&
      nextDay > currentState.day &&
      getCesfamWeekInfo(nextDay).dayIndex === 0
    ) {
      newState = {
        ...newState,
        weeklySchedule: buildDefaultWeeklySchedule(),
        eventsLog: [...newState.eventsLog, 'Se reinició la planificación para la nueva semana.'],
      };
    }

    if (nextDay > currentState.day) {
      newEvents.push(`Ha comenzado el día ${nextDay}.`);
      newState.stakeholders = newState.stakeholders.map(sh => {
        const updatedCommitments = sh.commitments.map(c => (c.status === 'pending' && nextDay > c.dayDue) ? { ...c, status: 'broken' as const } : c);
        const newlyBroken = updatedCommitments.filter(c => c.status === 'broken').length - sh.commitments.filter(c => c.status === 'broken').length;
        let newTrust = Math.max(0, sh.trust - (newlyBroken * 20));
        return { ...sh, commitments: updatedCommitments, trust: newTrust };
      });
    }
    if (completedDay !== null) {
      (newState as any).__completedDay = completedDay;
    }
    newState.eventsLog = [...newState.eventsLog, ...newEvents];
    return newState;
  }, [selectedVersion]);

  const applyLocalDailyResolution = useCallback(
    (baseState: GameState, completedDay: number) => {
      const resolution = resolveDayEffectsLocally(baseState, completedDay, roomDefinitions);
      if (!resolutionHasChanges(resolution)) {
        return { nextState: baseState, resolution: null as null };
      }

      const nextState = applyDailyResolutionToState(baseState, resolution);
      return { nextState, resolution };
    },
    [roomDefinitions]
  );

  const resolveCompletedDayTransition = useCallback(
    async (completedDay: number, snapshot: GameState) => {
      if (isFrontendComparisonMode) {
        const localResult = applyLocalDailyResolution(snapshot, completedDay);
        const summary = localResult.resolution
          ? summarizeDeltas(
              completedDay,
              localResult.resolution.global_deltas,
              localResult.resolution.stakeholder_deltas
            )
          : null;

        return {
          nextState: localResult.nextState,
          resolution: localResult.resolution,
          summary,
        };
      }

      try {
        const exportPayload = buildSessionExport({
          gameState: snapshot,
          config,
          sessionId: sessionIdRef.current,
          anonymousUserId: anonymousUserIdRef.current,
          startedAt: sessionStartRef.current ?? Date.now(),
          endedAt: Date.now(),
          roomDefinitions,
        });

        const firstResp = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exportPayload),
        });

        if (!firstResp.ok) {
          return { nextState: snapshot, resolution: null, summary: null };
        }

        const resp = await fetch(
          `${API_BASE_URL.replace(/\/$/, '')}/sessions/${exportPayload.session_metadata.session_id}/resolve_day_effects?day=${completedDay}`,
          { method: 'POST' }
        );

        if (!resp.ok) {
          return { nextState: snapshot, resolution: null, summary: null };
        }

        const data = await resp.json();
        const resolution: DailyResolution = {
          day: completedDay,
          comparisons: data.comparisons || [],
          global_deltas: data.global_deltas || {},
          stakeholder_deltas: data.stakeholder_deltas || {},
          resolved_expected_action_ids: (data.comparisons || [])
            .map((comparison: any) => comparison.expected_action_id)
            .filter(Boolean),
          status: data.cached ? 'cached' : 'applied',
          created_at: new Date().toISOString(),
        };

        const nextState = applyDailyResolutionToState(snapshot, resolution);
        const summary = summarizeDeltas(
          completedDay,
          resolution.global_deltas,
          resolution.stakeholder_deltas
        );

        return { nextState, resolution, summary };
      } catch (err: any) {
        console.error('[Backend] resolveCompletedDayTransition error:', {
          error: err?.message || String(err),
          apiUrl: API_BASE_URL,
          type: err?.name,
        });
        showToast(`Error de conexión: ${err?.message || 'No se pudo conectar al servidor'}`);
        return { nextState: snapshot, resolution: null, summary: null };
      }
    },
    [applyLocalDailyResolution, config, roomDefinitions, showToast]
  );

  const advanceToCase1Monday = useCallback((
    justCompletedSequenceId: string,
    mondayEmailIds: string[]
  ) => {
    let stateAfterMeetingEnd = { ...gameState };
    if (!stateAfterMeetingEnd.completedSequences.includes(justCompletedSequenceId)) {
      stateAfterMeetingEnd.completedSequences = [...stateAfterMeetingEnd.completedSequences, justCompletedSequenceId];
    }

    if (characterInFocus && characterInFocus.role !== secretaryRole) {
      stateAfterMeetingEnd.stakeholders = stateAfterMeetingEnd.stakeholders.map((stakeholder) =>
        stakeholder.name === characterInFocus.name
          ? { ...stakeholder, lastMetDay: gameState.day }
          : stakeholder
      );
    }

    let nextState: GameState = {
      ...stateAfterMeetingEnd,
      day: CASE1_NEXT_MONDAY_DAY,
      timeSlot: morningSlot,
      weeklySchedule: buildDefaultWeeklySchedule(),
      history: { ...stateAfterMeetingEnd.history, [gameState.day]: stateAfterMeetingEnd.stakeholders },
      eventsLog: [
        ...stateAfterMeetingEnd.eventsLog,
        'Borrador semanal enviado. Comienza el lunes siguiente.',
        'Se reinici? la planificaci?n para la nueva semana.',
      ],
    };
    if (isFrontendComparisonMode) {
      const localResult = applyLocalDailyResolution(stateAfterMeetingEnd, stateAfterMeetingEnd.day);
      nextState = {
        ...localResult.nextState,
        day: CASE1_NEXT_MONDAY_DAY,
        timeSlot: morningSlot,
        weeklySchedule: buildDefaultWeeklySchedule(),
        history: { ...localResult.nextState.history, [gameState.day]: localResult.nextState.stakeholders },
        eventsLog: [
          ...localResult.nextState.eventsLog,
          'Borrador semanal enviado. Comienza el lunes siguiente.',
          'Se reinici? la planificaci?n para la nueva semana.',
        ],
      };
      if (localResult.resolution) {
        setDailySummary(
          summarizeDeltas(
            localResult.resolution.day,
            localResult.resolution.global_deltas,
            localResult.resolution.stakeholder_deltas
          )
        );
      } else {
        setDailySummary(null);
      }
    }
    nextState = appendCaseEventEmails(nextState, emailTemplates, mondayEmailIds, CASE1_NEXT_MONDAY_DAY);

    registerSequenceCompleted(justCompletedSequenceId);
    setGameState(nextState);
    setCurrentMeeting(null);
    setConversationMode('idle');
    setQuestionsOrigin(null);
    setQuestionsBaseDialogue('');
    setCharacterInFocus(null);
    setCountdown(PERIOD_DURATION);
    setIsTimerPaused(false);
    pendingCase1EndingRef.current = null;
    syncLogs();
  }, [gameState, characterInFocus, secretaryRole, emailTemplates, registerSequenceCompleted, syncLogs, applyLocalDailyResolution, morningSlot]);

  const syncDayWithBackend = useCallback(
    async (completedDay: number, snapshot: GameState) => {
      if (isFrontendComparisonMode) {
        const resolution = resolveDayEffectsLocally(snapshot, completedDay, roomDefinitions);
        if (!resolutionHasChanges(resolution)) {
          setDailySummary(null);
          return;
        }

        setGameState((prev) => applyDailyResolutionToState(prev, resolution));
        setDailySummary(summarizeDeltas(completedDay, resolution.global_deltas, resolution.stakeholder_deltas));
        return;
      }

      try {
        const exportPayload = buildSessionExport({
          gameState: snapshot,
          config,
          sessionId: sessionIdRef.current,
          anonymousUserId: anonymousUserIdRef.current,
          startedAt: sessionStartRef.current ?? Date.now(),
          endedAt: Date.now(),
          roomDefinitions,
        });
        
        console.log(`[Backend] Attempting to connect to ${API_BASE_URL}`);
        
        const firstResp = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exportPayload)
        });

        if (!firstResp.ok) {
          console.warn(`[Backend] POST /sessions failed with status ${firstResp.status}`);
          return;
        }

        const resp = await fetch(
          `${API_BASE_URL.replace(/\/$/, '')}/sessions/${exportPayload.session_metadata.session_id}/resolve_day_effects?day=${completedDay}`,
          { method: 'POST' }
        );
        
        if (!resp.ok) {
          const errorText = await resp.text();
          console.warn(`[Backend] resolve_day_effects failed with status ${resp.status}: ${errorText}`);
          return;
        }
        
        const data = await resp.json();
        const globalDeltas = data.global_deltas || {};
        const stakeholderDeltas = data.stakeholder_deltas || {};
        setGameState((prev) =>
          applyDailyResolutionToState(prev, {
            day: completedDay,
            comparisons: data.comparisons || [],
            global_deltas: globalDeltas,
            stakeholder_deltas: stakeholderDeltas,
            resolved_expected_action_ids: (data.comparisons || [])
              .map((comparison: any) => comparison.expected_action_id)
              .filter(Boolean),
            status: data.cached ? 'cached' : 'applied',
            created_at: new Date().toISOString(),
          })
        );
        const summary = summarizeDeltas(completedDay, globalDeltas, stakeholderDeltas);
        setDailySummary(summary);
      } catch (err: any) {
        console.error('[Backend] syncDayWithBackend error:', {
          error: err?.message || String(err),
          apiUrl: API_BASE_URL,
          type: err?.name
        });
        showToast(`Error de conexión: ${err?.message || 'No se pudo conectar al servidor'}`);
      }
    },
    [config, gameState.stakeholders, roomDefinitions, showToast]
  );

  const presentScenario = useCallback((scenario: ScenarioNode) => {
    const activeStakeholder = resolveStakeholderByRef(gameState.stakeholders, {
      stakeholderId: scenario.stakeholderId,
      stakeholderRole: scenario.stakeholderRole,
    });
    if (!activeStakeholder) {
      console.error(`[Content] Scenario ${scenario.node_id} references unknown stakeholderId="${scenario.stakeholderId}"`);
      setPersonalizedDialogue('Contenido invalido: no se pudo resolver el NPC de este escenario.');
      setPlayerActions([{ label: 'Concluir Reunion', cost: 'Finalizar', action: 'conclude_meeting' }]);
      return;
    }
    setCharacterInFocus(activeStakeholder);

    setPersonalizedDialogue(scenario.dialogue);
    setPlayerActions(
      scenario.options.map(opt => {
        const effects = resolveGlobalEffects(opt.consequences);
        const preview = resolveActionEffectsPreview(opt.consequences, activeStakeholder.name);
        return {
          label: opt.cardTitle || opt.text,
          description: opt.text,
          cardEmoji: opt.cardEmoji,
          action: opt.option_id,
          cost: 'Decisión',
          globalEffectsUI: effects.ui,
          internalEffectsPreview: preview.internal,
        };
      })
    );
    startLogging(scenario.node_id);

    mechanicEngine.emitEvent('dialogue', 'scenario_presented', { node_id: scenario.node_id });
  }, [setPersonalizedDialogue, gameState.stakeholders]);

  const advanceTimeAndUpdateFocus = useCallback((
    justCompletedSequenceId?: string,
    options?: { skipTimeAdvance?: boolean; forceResumeTimer?: boolean }
  ) => {
    let stateAfterMeetingEnd = { ...gameState };
    if (justCompletedSequenceId && !stateAfterMeetingEnd.completedSequences.includes(justCompletedSequenceId)) {
      stateAfterMeetingEnd.completedSequences = [...stateAfterMeetingEnd.completedSequences, justCompletedSequenceId];
    }

    if (characterInFocus && characterInFocus.role !== secretaryRole) {
      stateAfterMeetingEnd.stakeholders = stateAfterMeetingEnd.stakeholders.map(sh =>
        sh.name === characterInFocus.name ? { ...sh, lastMetDay: gameState.day } : sh
      );
    }
    stateAfterMeetingEnd = mergeMechanicFlushIntoState(stateAfterMeetingEnd);
    const skipTimeAdvance = Boolean(options?.skipTimeAdvance);
    const deferredEmailIds = getSequenceCompletionEmailIds(justCompletedSequenceId);
    const shouldBlockFridayClose =
      selectedVersion === 'CESFAM' &&
      !skipTimeAdvance &&
      !pendingCase1EndingRef.current &&
      stateAfterMeetingEnd.day === CASE1_FRIDAY_DAY &&
      stateAfterMeetingEnd.timeSlot === 'tarde' &&
      stateAfterMeetingEnd.lastScheduleSubmissionDay !== CASE1_FRIDAY_DAY;

    if (shouldBlockFridayClose) {
      const blockedState = appendCaseEventEmails(stateAfterMeetingEnd, emailTemplates, deferredEmailIds, stateAfterMeetingEnd.day);
      registerSequenceCompleted(justCompletedSequenceId);
      setGameState(blockedState);
      setCharacterInFocus(null);
      setActiveTab('schedule');
      setWarningPopupMessage('Debes enviar el borrador semanal antes de cerrar el viernes.');
      setIsTimerPaused(true);
      setCountdown(0);
      syncLogs();
      return;
    }

    const shouldAdvanceFromInitialChiefsSequence =
      selectedVersion === 'CESFAM' &&
      justCompletedSequenceId === 'SCHEDULE_WAR_SEQ' &&
      stateAfterMeetingEnd.day === 3 &&
      stateAfterMeetingEnd.timeSlot === morningSlot;

    let newState = skipTimeAdvance
      ? stateAfterMeetingEnd
      : shouldAdvanceFromInitialChiefsSequence
        ? {
            ...stateAfterMeetingEnd,
            day: 3,
            timeSlot: 'tarde',
            history: { ...stateAfterMeetingEnd.history },
            eventsLog: [...stateAfterMeetingEnd.eventsLog, 'Ha comenzado el bloque de la tarde del miércoles.'],
          }
        : advanceTime(stateAfterMeetingEnd);
    const completedDay = !skipTimeAdvance ? ((newState as any).__completedDay as number | null) : null;
    const shouldOpenCesfamDayReview =
      selectedVersion === 'CESFAM' &&
      completedDay !== null &&
      completedDay >= 3 &&
      completedDay < CASE1_FRIDAY_DAY;

    registerSequenceCompleted(justCompletedSequenceId);

    if (shouldOpenCesfamDayReview) {
      const snapshot = { ...newState };
      delete (snapshot as any).__completedDay;

      setCurrentMeeting(null);
      setConversationMode('idle');
      setQuestionsOrigin(null);
      setQuestionsBaseDialogue('');
      setCharacterInFocus(null);
      setIsSidebarOpen(false);
      setIsHelpOpen(false);
      setIsTimerPaused(true);
      setCountdown(PERIOD_DURATION);
      setIsPreparingDayReview(true);

      void (async () => {
        const resolved = await resolveCompletedDayTransition(completedDay, snapshot);
        const reviewData = buildCesfamDayReviewData(
          resolved.nextState,
          completedDay,
          resolved.nextState.day,
          resolved.resolution
        );

        setPendingDayReview({
          nextState: resolved.nextState,
          summary: resolved.summary,
          resolution: resolved.resolution,
          reviewData,
          deferredEmailIds,
        });
        setIsPreparingDayReview(false);
      })();
      return;
    }

    if (isFrontendComparisonMode && completedDay !== null && completedDay > 0) {
      const snapshot = { ...newState };
      delete (snapshot as any).__completedDay;
      const localResult = applyLocalDailyResolution(snapshot, completedDay);
      newState = localResult.nextState;
      if (localResult.resolution) {
        setDailySummary(
          summarizeDeltas(
            completedDay,
            localResult.resolution.global_deltas,
            localResult.resolution.stakeholder_deltas
          )
        );
      } else {
        setDailySummary(null);
      }
    }
    delete (newState as any).__completedDay;
    newState = appendCaseEventEmails(newState, emailTemplates, deferredEmailIds, newState.day);
    setGameState(newState);
    if (!skipTimeAdvance) {
      if (!isFrontendComparisonMode && completedDay !== null && completedDay > 0) {
        const snapshot = { ...newState };
        delete (snapshot as any).__completedDay;
        syncDayWithBackend(completedDay, snapshot);
      }
      setCountdown(PERIOD_DURATION);
      setIsTimerPaused(false);
    } else {
      // Reactivar el timer y evitar que quede congelado si el contador estaba en 0
      setIsTimerPaused(false);
      setCountdown(prev => prev > 0 ? prev : PERIOD_DURATION);
    }
    setCharacterInFocus(null);
    syncLogs();
  }, [gameState, characterInFocus, advanceTime, secretaryRole, registerSequenceCompleted, syncLogs, selectedVersion, emailTemplates, mergeMechanicFlushIntoState, resolveCompletedDayTransition, morningSlot]);

  useEffect(() => {
    if (effectiveTimerPaused || activeTab !== 'interaction' || gameStatus !== 'playing' || appStep !== 'game') return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (isInteractionBlockingTimeout) {
            setIsTimerPaused(true);
            return 0;
          }
          advanceTimeAndUpdateFocus();
          return PERIOD_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [effectiveTimerPaused, activeTab, advanceTimeAndUpdateFocus, gameStatus, appStep, isInteractionBlockingTimeout]);

  useEffect(() => {
    if (appStep !== 'game') return;
    setIsTimerPaused(false);
    setGameState(prev => {
      const welcomeEmails = emailTemplates.filter(
        (template) =>
          template.trigger.type === 'ON_MEETING_COMPLETE' &&
          template.trigger.stakeholder_id === 'system-startup'
      );
      const newEmails = welcomeEmails
        .filter(t => !prev.inbox.some(e => e.email_id === t.email_id))
        .map(t => ({ email_id: t.email_id, dayReceived: 1, isRead: false }));
      return newEmails.length > 0 ? { ...prev, inbox: [...prev.inbox, ...newEmails] } : prev;
    });
  }, [appStep, emailTemplates]);

  useEffect(() => {
    if (appStep !== 'game' || pendingDayReview || isPreparingDayReview) return;
    setGameState((prev) => appendTimeBlockEmails(prev, emailTemplates, prev.day, prev.timeSlot));
  }, [appStep, pendingDayReview, isPreparingDayReview, gameState.day, gameState.timeSlot, emailTemplates]);

  const handleUpdateSchedule = (newSchedule: ScheduleAssignment[]) => {
    setGameState(prev => ({ ...prev, weeklySchedule: newSchedule }));
  };

  const handleUpdateNotes = (notes: string) => {
      setGameState(prev => ({...prev, playerNotes: notes }));
  };

  const handleAskQuestion = (question: StakeholderQuestion) => {
      if (!characterInFocus) return;
      setGameState(prev => {
          const updatedStakeholders = prev.stakeholders.map(sh => {
              if (sh.id !== characterInFocus.id) return sh;
              const alreadyAsked = sh.questionsAsked.includes(question.question_id);
              if (alreadyAsked) return sh;
              return {
                  ...sh,
                  questionsAsked: [...sh.questionsAsked, question.question_id]
              };
          });

          const questionLogEntry: QuestionLogEntry = {
              day: prev.day,
              timeSlot: prev.timeSlot,
              stakeholder_id: characterInFocus.id,
              question_id: question.question_id,
              was_locked: false,
              trust_at_ask: characterInFocus.trust,
              support_at_ask: characterInFocus.support,
              reputation_at_ask: prev.reputation,
              timestamp: Date.now()
          };

          return {
              ...prev,
              stakeholders: updatedStakeholders,
              questionLog: [...prev.questionLog, questionLogEntry],
              eventsLog: [...prev.eventsLog, `Pregunta a ${characterInFocus.name}: ${question.text}`]
          };
      });
  };
  
  const handleMapInteract = (staff: StaffMember): boolean => {
      const MOVEMENT_COST = 6;
      let timeAdvanced = false;
      setCountdown(prev => {
          const newVal = prev - MOVEMENT_COST;
          if (newVal <= 0) { timeAdvanced = true; return 0; }
          return newVal;
      });
      if (timeAdvanced) { advanceTimeAndUpdateFocus(); return false; }

      const blockingInevitable = scenarioData.sequences.find(seq =>
          seq.isInevitable &&
          !gameState.completedSequences.includes(seq.sequence_id) &&
          isSequenceWindowOpen(seq, gameState)
      );
      if (blockingInevitable) {
          setWarningPopupMessage("Hay un evento inevitable pendiente. Debes atenderlo antes de iniciar uno proactivo.");
          return false;
      }
      const blockingContingent = scenarioData.sequences.find(seq =>
          seq.isContingent &&
          !gameState.completedSequences.includes(seq.sequence_id) &&
          shouldTriggerContingentSequence(seq, gameState)
      );
      if (blockingContingent) {
          setWarningPopupMessage("Hay un evento contingente pendiente. Debes atenderlo antes de iniciar uno proactivo.");
          return false;
      }

      const stakeholder = gameState.stakeholders.find(s => s.id === staff.id);
      if (stakeholder) {
          setCharacterInFocus(stakeholder);
          setActiveTab('interaction');
          const proactiveSequence = scenarioData.sequences
              .filter(seq =>
                  sequenceBelongsToStakeholder(seq, stakeholder) &&
                  !seq.isInevitable &&
                  !seq.isContingent &&
                  isSequenceWindowOpen(seq, gameState)
              )
              .sort((a, b) => getSequenceOrder(a.sequence_id) - getSequenceOrder(b.sequence_id))
              .find(seq => !gameState.completedSequences.includes(seq.sequence_id));
          if (proactiveSequence) {
               startSequence(proactiveSequence, stakeholder, { pauseTimer: false });
               return true;
          }
          if (hasQuestionsFor(stakeholder)) {
              setConversationMode('questions_only');
              setQuestionsOrigin('questions_only');
              setQuestionsBaseDialogue('(No hay mas reuniones pendientes. Puedes hacer preguntas si lo deseas.)');
              setPersonalizedDialogue('(No hay mas reuniones pendientes. Puedes hacer preguntas si lo deseas.)');
              setPlayerActions(buildQuestionListActions(stakeholder, gameState.reputation, 'questions_only'));
          } else {
              setConversationMode('idle');
              setPersonalizedDialogue(`(El ${staff.name} parece ocupado o no tiene nada urgente que tratar contigo en este momento).`);
              setPlayerActions([{ label: "Volver", cost: "Gratis", action: "conclude_meeting" }]);
          }
      } else {
          setWarningPopupMessage(`INSPECCION RAPIDA: ${staff.name}`);
      }
      return true;
  };

  const handleCallStakeholder = (stakeholder: Stakeholder) => {
      setCharacterInFocus(stakeholder);
      setActiveTab('interaction');
      setPersonalizedDialogue(`(Por teléfono) Aló, ¿Director? Aquí ${stakeholder.name}.`);
      setPlayerActions([{ label: "Solo quería confirmar...", cost: "Corto", action: "conclude_meeting" }]);
  };

  const handleExecuteWeek = () => {
      syncLogs();

      if (selectedVersion === 'CESFAM') {
          const executeDisabledReason = getCesfamScheduleExecuteDisabledReason(
            gameState.day,
            gameState.lastScheduleSubmissionDay
          );

          if (executeDisabledReason) {
              setWarningPopupMessage(executeDisabledReason);
              setActiveTab('schedule');
              return;
          }

          const { week } = getCesfamWeekInfo(gameState.day);

          if (week === 1) {
              const outcome = resolveCase1SubmissionOutcome(gameState, roomDefinitions);
              pendingCase1EndingRef.current = {
                  sequenceId: outcome.sequenceId,
                  emailIds: outcome.emailIds,
              };

              setGameState(prev => ({
                  ...prev,
                  lastScheduleSubmissionDay: prev.day,
                  eventsLog: [...prev.eventsLog, `Borrador semanal enviado en el dia ${prev.day}.`],
              }));

              const endingSequence = scenarioData.sequences.find(seq => seq.sequence_id === outcome.sequenceId);
              const stakeholder = gameState.stakeholders.find(entry => entry.id === 'sofia-castro');

              if (endingSequence && stakeholder) {
                  startSequence(endingSequence, stakeholder, {
                      pauseTimer: true,
                      actionLabel: 'Revisar cierre del caso',
                      actionCost: 'Cierre',
                  });
              }

              setWarningPopupMessage('Borrador semanal enviado.');
              setActiveTab('interaction');
              return;
          }

          setGameState(prev => ({
              ...prev,
              lastScheduleSubmissionDay: prev.day,
              eventsLog: [...prev.eventsLog, `Planificaci?n semanal enviada en el dia ${prev.day}.`],
          }));
          setWarningPopupMessage('Planificaci?n semanal enviada.');
          setActiveTab('interaction');
          return;
      }

      setGameState(prev => {
          const jumpDays = 5;
          return { ...prev, day: prev.day + jumpDays, eventsLog: [...prev.eventsLog, `Semana ejecutada. Avanzado al dia ${prev.day + jumpDays}.`] };
      });
      setWarningPopupMessage('Semana ejecutada con exito.');
      setActiveTab('interaction');
  };

  const handleSetupScheduleWar = () => {
      setActiveTab('schedule');
      setCurrentMeeting(null);
      setCharacterInFocus(null);
      setWarningPopupMessage("┬íPROPUESTAS DE JEFATURAS CARGADAS!");
  };

  const handlePlayerAction = async (action: PlayerAction) => {
    if (gameStatus !== 'playing' || pendingDayReview || isPreparingDayReview) return;
    if (action.action === 'open_conflicted_schedule') { handleSetupScheduleWar(); return; }

    if (action.action === 'ask_questions' && characterInFocus) {
        const origin = conversationMode === 'pre_sequence' || conversationMode === 'post_sequence'
          ? conversationMode
          : 'questions_only';
        setQuestionsOrigin(origin);
        setQuestionsBaseDialogue(currentDialogue);
        setConversationMode('questions');
        setPlayerActions(buildQuestionListActions(characterInFocus, gameState.reputation, origin));
        return;
    }

    if (action.action === 'close_questions' && characterInFocus) {
        const origin = questionsOrigin;
        setQuestionsOrigin(null);
        setConversationMode(origin ?? 'idle');
        if (questionsBaseDialogue) {
          setPersonalizedDialogue(questionsBaseDialogue);
        }
        setQuestionsBaseDialogue('');
        if (origin === 'pre_sequence' && currentMeeting?.sequence) {
            const meta = getSequenceActionMeta(currentMeeting.sequence);
            const allowQuestions = hasCompletedSequenceForStakeholder(characterInFocus, gameState.completedSequences);
            setPlayerActions(buildPreSequenceActions(characterInFocus, meta.label, meta.cost, allowQuestions));
        } else if (origin === 'post_sequence') {
            setPlayerActions(buildPostSequenceActions(characterInFocus));
        }
        return;
    }

    if (action.action === 'return_to_questions' && characterInFocus) {
        const origin = questionsOrigin ?? 'questions_only';
        setConversationMode('questions');
        if (questionsBaseDialogue) {
          setPersonalizedDialogue(questionsBaseDialogue);
        }
        setPlayerActions(buildQuestionListActions(characterInFocus, gameState.reputation, origin));
        return;
    }

    if (action.action.startsWith('question:') && characterInFocus) {
        const questionId = action.action.split(':')[1];
        const question = characterInFocus.questions.find(q => q.question_id === questionId);
        if (!question) return;
        const alreadyAsked = characterInFocus.questionsAsked.includes(question.question_id);
        const canAsk = canAskQuestion(question, characterInFocus, gameState.reputation);
        if (!canAsk) {
            const reqText = getQuestionRequirementText(question);
            const message = reqText ? `No puedo responder eso aun. Requisitos: ${reqText}.` : 'No puedo responder eso aun.';
            setPersonalizedDialogue(message);
            setPlayerActions(buildQuestionListActions(characterInFocus, gameState.reputation, questionsOrigin));
            return;
        }

        handleAskQuestion(question);
        setPersonalizedDialogue(question.answer);
        const meta = questionsOrigin === 'pre_sequence' && currentMeeting?.sequence
          ? getSequenceActionMeta(currentMeeting.sequence)
          : undefined;
        setPlayerActions(buildQuestionAnswerActions(questionsOrigin, meta));
        return;
    }
    
    const processLog = finalizeLogging(action.action);
    setIsLoading(true);

    if (!characterInFocus) { setIsLoading(false); return; }

    if (currentMeeting) {
        const { sequence, nodeIndex } = currentMeeting;
        switch (action.action) {
            case 'start_meeting_sequence': {
                setConversationMode('in_sequence');
                const scenario = scenarioData.scenarios.find(s => s.node_id === sequence.nodes[0]);
                if (scenario) presentScenario(scenario);
                setIsLoading(false);
                return;
            }
            case 'NEXT': {
                const nextNodeIndex = nodeIndex + 1;
                if (nextNodeIndex >= sequence.nodes.length) {
                    setPersonalizedDialogue(sequence.finalDialogue);
                    setConversationMode('post_sequence');
                    const postSequenceActions =
                      selectedVersion === 'CESFAM' && sequence.sequence_id === 'AGENDA_CRISIS_RESOLUTION_SEQ'
                        ? [{ label: 'Abrir Planificacion', cost: 'Obligatorio', action: 'conclude_meeting' } satisfies PlayerAction]
                        : CASE1_ENDING_SEQUENCE_IDS.has(sequence.sequence_id)
                          ? [{ label: 'Iniciar lunes', cost: 'Cierre', action: 'conclude_meeting' } satisfies PlayerAction]
                          : buildPostSequenceActions(characterInFocus);
                    setPlayerActions(postSequenceActions);
                    setIsLoading(false);
                    return;
                }
                setCurrentMeeting(prev => ({ ...prev!, nodeIndex: nextNodeIndex }));
                const nextScenario = scenarioData.scenarios.find(s => s.node_id === sequence.nodes[nextNodeIndex]);
                if (nextScenario) presentScenario(nextScenario);
                setIsLoading(false);
                return;
            }
            case 'continue_meeting_sequence': {
                const nextNodeIndex = nodeIndex + 1;
                setCurrentMeeting(prev => ({ ...prev!, nodeIndex: nextNodeIndex }));
                const nextScenario = scenarioData.scenarios.find(s => s.node_id === sequence.nodes[nextNodeIndex]);
                if (nextScenario) presentScenario(nextScenario);
                setIsLoading(false);
                return;
            }
            case 'end_meeting_sequence':
                setPersonalizedDialogue(sequence.finalDialogue);
                setConversationMode('post_sequence');
                setPlayerActions(
                  selectedVersion === 'CESFAM' && sequence.sequence_id === 'AGENDA_CRISIS_RESOLUTION_SEQ'
                    ? [{ label: 'Abrir Planificacion', cost: 'Obligatorio', action: 'conclude_meeting' } satisfies PlayerAction]
                    : CASE1_ENDING_SEQUENCE_IDS.has(sequence.sequence_id)
                      ? [{ label: 'Iniciar lunes', cost: 'Cierre', action: 'conclude_meeting' } satisfies PlayerAction]
                      : buildPostSequenceActions(characterInFocus)
                );
                setIsLoading(false);
                return;
        }
    }
    
    if (action.action === 'conclude_meeting') {
        const justCompletedSequenceId = currentMeeting?.sequence.sequence_id;
        if (
          selectedVersion === 'CESFAM' &&
          justCompletedSequenceId === 'AGENDA_CRISIS_RESOLUTION_SEQ'
        ) {
          setGameState(prev => ({
            ...prev,
            completedSequences:
              justCompletedSequenceId && !prev.completedSequences.includes(justCompletedSequenceId)
                ? [...prev.completedSequences, justCompletedSequenceId]
                : prev.completedSequences,
          }));
          registerSequenceCompleted(justCompletedSequenceId);
          setCurrentMeeting(null);
          setConversationMode('idle');
          setQuestionsOrigin(null);
          setQuestionsBaseDialogue('');
          setCharacterInFocus(null);
          setActiveTab('schedule');
          setWarningPopupMessage('Debes enviar la planificación antes de cerrar el viernes.');
          setIsTimerPaused(true);
          setCountdown(0);
          setIsLoading(false);
          return;
        }
        if (
          justCompletedSequenceId &&
          pendingCase1EndingRef.current &&
          pendingCase1EndingRef.current.sequenceId === justCompletedSequenceId &&
          CASE1_ENDING_SEQUENCE_IDS.has(justCompletedSequenceId)
        ) {
          advanceToCase1Monday(justCompletedSequenceId, pendingCase1EndingRef.current.emailIds);
          setIsLoading(false);
          return;
        }
        const shouldForceAdvanceBlock = countdown <= 0;
        const shouldAdvanceAfterInitialChiefsSequence =
          selectedVersion === 'CESFAM' &&
          gameState.day === 3 &&
          gameState.timeSlot === morningSlot &&
          currentMeeting?.sequence?.sequence_id === 'SCHEDULE_WAR_SEQ';
        const skipTimeAdvance = !shouldForceAdvanceBlock && !shouldAdvanceAfterInitialChiefsSequence;
        setCurrentMeeting(null);
        setConversationMode('idle');
        setQuestionsOrigin(null);
        setQuestionsBaseDialogue('');
        advanceTimeAndUpdateFocus(justCompletedSequenceId, {
          skipTimeAdvance,
          forceResumeTimer: shouldForceAdvanceBlock
        });
        setIsLoading(false);
        return;
    }

    const currentScenarioId = currentMeeting ? currentMeeting.sequence.nodes[currentMeeting.nodeIndex] : '';
    const scenario = scenarioData.scenarios.find(s => s.node_id === currentScenarioId);

    if (scenario) {
        const option = scenario.options.find(o => o.option_id === action.action);
        if (option) {
            const { consequences } = option;
            const globalEffects = resolveGlobalEffects(consequences);
            setHoveredGlobalEffects(null);
            
            // PSYCHOMETRIC REGISTRATION
            if (consequences.expected_actions) {
              mechanicEngine.registerExpectedActions(scenario.node_id, option.option_id, consequences.expected_actions, {
                stakeholderId: scenario.stakeholderId,
                day: gameState.day,
                timeSlot: gameState.timeSlot,
              });
              const toastText = characterInFocus?.name ? `${characterInFocus.name} recordará eso` : 'NPC recordará eso';
              showToast(toastText);
            }
            mechanicEngine.emitEvent('dialogue', 'decision_made', {
              node_id: scenario.node_id,
              option_id: option.option_id
            });
            setRecentInternalResolution(resolveInternalEffectsPreview(consequences, characterInFocus.name));

            setGameState(prev => {
                const newStakeholders = prev.stakeholders.map(sh => sh.name === characterInFocus.name ? { ...sh, trust: Math.max(0, Math.min(100, sh.trust + (consequences.trustChange ?? 0))), support: Math.max(sh.minSupport, Math.min(sh.maxSupport, sh.support + (consequences.supportChange ?? 0))) } : sh);
                const globalEffectsBefore = { budget: prev.budget, reputation: prev.reputation };
                const nextBudget = prev.budget + globalEffects.deltas.budget;
                const nextReputation = clampReputation(prev.reputation + globalEffects.deltas.reputation);
                const globalEffectsAfter = { budget: nextBudget, reputation: nextReputation };
                const decisionEntry: DecisionLogEntry = {
                    day: prev.day,
                    timeSlot: prev.timeSlot,
                    stakeholder: characterInFocus.name,
                    nodeId: scenario.node_id,
                    choiceId: option.option_id,
                    choiceText: option.text,
                    tags: option.tags,
                    consequences,
                    globalEffectsShown: globalEffects.ui,
                    globalEffectsApplied: globalEffects.real,
                    globalEffectsBefore,
                    globalEffectsAfter
                };
                return {
                    ...prev,
                    budget: nextBudget,
                    reputation: nextReputation,
                    projectProgress: Math.max(0, Math.min(100, prev.projectProgress + (consequences.projectProgressChange ?? 0))),
                    stakeholders: newStakeholders,
                    completedScenarios: [...prev.completedScenarios, scenario.node_id],
                    eventsLog: [...prev.eventsLog, `Decisión: ${action.label}`],
                    processLog: processLog ? [...prev.processLog, processLog] : prev.processLog,
                    decisionLog: [...prev.decisionLog, decisionEntry]
                };
            });
            
            setPersonalizedDialogue(consequences.dialogueResponse);
            if (currentMeeting) {
                if (currentMeeting.nodeIndex >= currentMeeting.sequence.nodes.length - 1) {
                    setPlayerActions([{ label: "Finalizar Discusión", cost: "Continuar", action: "end_meeting_sequence" }]);
                } else {
                    setPlayerActions([{ label: "Continuar...", cost: "Continuar", action: "continue_meeting_sequence" }]);
                }
            } else {
                if (hasQuestionsFor(characterInFocus)) {
                    setConversationMode('post_sequence');
                    setPlayerActions(buildPostSequenceActions(characterInFocus));
                } else {
                    setPlayerActions([{ label: "Concluir Reunion", cost: "Finalizar", action: "conclude_meeting" }]);
                }
            }
        }
    }
    setIsLoading(false);
  };

  const handleManualAdvance = () => { advanceTimeAndUpdateFocus(); };
  const handleContinueFromDayReview = useCallback(() => {
    if (!pendingDayReview) return;

    const nextState = appendCaseEventEmails(
      pendingDayReview.nextState,
      emailTemplates,
      pendingDayReview.deferredEmailIds,
      pendingDayReview.nextState.day
    );

    setPendingDayReview(null);
    setGameState(nextState);
    setDailySummary(pendingDayReview.summary);
    setActiveTab('interaction');
    setCountdown(PERIOD_DURATION);
    setIsTimerPaused(false);
    syncLogs();
  }, [pendingDayReview, emailTemplates, syncLogs]);

  const handleMarkEmailAsRead = (emailId: string) => {
    setGameState(prev => ({ ...prev, inbox: prev.inbox.map(e => e.email_id === emailId ? { ...e, isRead: true } : e) }));
  };
  const handleMarkDocumentAsRead = (docId: string) => {
    setGameState(prev => prev.readDocuments.includes(docId) ? prev : { ...prev, readDocuments: [...prev.readDocuments, docId] });
  };
  const handleSidebarNavigate = (tab: any) => { setActiveTab(tab); };
  const handleReturnHome = () => {
    if (appStep === 'game') {
      saveSessionSnapshot(sessionExport);
    }
    setIsSidebarOpen(false);
    setWarningPopupMessage(null);
    setGameStatus('playing');
    setEndGameMessage('');
    setFinalPersistStatus('idle');
    setFinalPersistError(null);
    setCurrentMeeting(null);
    setCharacterInFocus(null);
    setPendingDayReview(null);
    setIsPreparingDayReview(false);
    setCurrentDialogue('');
    setPlayerActions([]);
    setIsLoading(false);
    setIsTimerPaused(true);
    setCountdown(PERIOD_DURATION);
    setActiveTab('interaction');
    setHoveredGlobalEffects(null);
    setIsObjectivesOpen(false);
    setConversationMode('idle');
    setQuestionsOrigin(null);
    setQuestionsBaseDialogue('');
    setContentPack(DEFAULT_CONTENT_PACK);
    setScenarioData(DEFAULT_CONTENT_PACK.scenarios);
    pendingCase1EndingRef.current = null;
    setGameState(createInitialGameState(DEFAULT_CONTENT_PACK));
    prevStats.current = {
      budget: DEFAULT_INITIAL_STATE.budget,
      reputation: DEFAULT_INITIAL_STATE.reputation,
    };
    finalPersistAttemptedRef.current = false;
    sessionStartRef.current = null;
    sessionEndRef.current = null;
    sessionIdRef.current = crypto.randomUUID();
    anonymousUserIdRef.current = crypto.randomUUID();
    setConfig(null);
    setSelectedVersion(null);
    setAppStep('version_selection');
  };
  const sessionExport = buildSessionExport({
    gameState,
    config,
    sessionId: sessionIdRef.current,
    anonymousUserId: anonymousUserIdRef.current,
    startedAt: sessionStartRef.current ?? undefined,
    endedAt: sessionEndRef.current ?? undefined,
    roomDefinitions,
  });
  const persistFinalSession = useCallback(async () => {
    const exportPayload = buildSessionExport({
      gameState,
      config,
      sessionId: sessionIdRef.current,
      anonymousUserId: anonymousUserIdRef.current,
      startedAt: sessionStartRef.current ?? undefined,
      endedAt: sessionEndRef.current ?? Date.now(),
      roomDefinitions,
    });

    setFinalPersistStatus('sending');
    setFinalPersistError(null);
    saveSessionSnapshot(exportPayload);

    try {
      await persistSessionExport(exportPayload, API_BASE_URL);
      clearSessionSnapshot(exportPayload.session_metadata.session_id);
      setFinalPersistStatus('success');
      setFinalPersistError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al guardar la sesión';
      setFinalPersistStatus('error');
      setFinalPersistError(message);
      console.error('[SessionPersistence] Final session export failed', error);
    }
  }, [gameState, config, roomDefinitions]);
  const handleStartGame = (name: string) => {
    sessionStartRef.current = Date.now();
    sessionEndRef.current = null;
    sessionIdRef.current = crypto.randomUUID();
    anonymousUserIdRef.current = crypto.randomUUID();
    finalPersistAttemptedRef.current = false;
    setFinalPersistStatus('idle');
    setFinalPersistError(null);
    setGameState(prev => ({...prev, playerName: name}));
    setQuestionsBaseDialogue('');
    setAppStep('game');
  };
  const handleSelectVersion = (version: SimulatorVersion) => {
    const nextConfig = SIMULATOR_CONFIGS[version];
    const nextMechanics = resolveMechanics(nextConfig);
    const nextPack = getVersionContentPack(version);
    pendingCase1EndingRef.current = null;
    finalPersistAttemptedRef.current = false;
    setFinalPersistStatus('idle');
    setFinalPersistError(null);
    setSelectedVersion(version);
    setConfig(nextConfig);
    setContentPack(nextPack);
    setIsObjectivesOpen(false);
    setScenarioData(nextPack.scenarios);
    const baseState = createInitialGameState(nextPack);
    setGameState(baseState);
    prevStats.current = {
      budget: baseState.budget,
      reputation: baseState.reputation,
    };
    if (nextMechanics.length > 0) {
      setActiveTab(nextMechanics[0].tab_id);
    }
    setAppStep('splash');
  };
  useEffect(() => {
    if (appStep !== 'game') return;
    saveSessionSnapshot(sessionExport);
  }, [appStep, sessionExport]);

  useEffect(() => {
    if (appStep !== 'game' || gameStatus === 'playing') return;
    if (finalPersistAttemptedRef.current) return;
    finalPersistAttemptedRef.current = true;
    void persistFinalSession();
  }, [appStep, gameStatus, persistFinalSession]);

  const handleUpdateScenarioSchedule = (id: string, day: number, slot: TimeSlotType) => { setGameState(prev => ({ ...prev, scenarioSchedule: { ...prev.scenarioSchedule, [id]: { day, slot } } })); };
  const dispatch = (action: MechanicDispatchAction) => {
    switch (action.type) {
      case 'update_schedule':
        handleUpdateSchedule(action.schedule);
        return;
      case 'execute_week':
        handleExecuteWeek();
        return;
      case 'mark_email_read':
        handleMarkEmailAsRead(action.emailId);
        return;
      case 'mark_document_read':
        handleMarkDocumentAsRead(action.docId);
        return;
      case 'update_notes':
        handleUpdateNotes(action.notes);
        return;
      case 'map_interact':
        return handleMapInteract(action.staff);
      case 'call_stakeholder':
        handleCallStakeholder(action.stakeholder);
        return;
      case 'update_scenario_schedule':
        handleUpdateScenarioSchedule(action.id, action.day, action.slot);
        return;
      case 'navigate_tab':
        setActiveTab(action.tabId);
        return;
      default:
        return;
    }
  };

  const officeState: OfficeState = {
    variant: 'default',
    characterInFocus,
    currentDialogue,
    playerActions,
    conversationMode,
    isLoading,
    gameStatus,
    currentMeeting,
    onPlayerAction: handlePlayerAction,
    onNavigateTab: (tabId) => setActiveTab(tabId),
    onActionHover: handleActionHover,
    onAskQuestion: handleAskQuestion,
    onDialogueTypingChange: setIsDialogueTyping
  };

  const availableProactiveStakeholderIds = useMemo(() => {
    const ids = new Set<string>();

    scenarioData.sequences
      .filter(seq =>
        !seq.isInevitable &&
        !seq.isContingent &&
        isSequenceWindowOpen(seq, gameState) &&
        !gameState.completedSequences.includes(seq.sequence_id)
      )
      .forEach(seq => {
        const stakeholder = resolveStakeholderByRef(gameState.stakeholders, {
          stakeholderId: seq.stakeholderId,
          stakeholderRole: seq.stakeholderRole,
        });
        if (stakeholder) {
          ids.add(stakeholder.id);
        }
      });

    return [...ids];
  }, [scenarioData, gameState, isSequenceWindowOpen]);

  const collapsedMechanicIndicators = useMemo(() => {
    const unreadEmails = gameState.inbox.filter((entry) => !entry.isRead).length;
    const unreadDocuments = (contentPack.documents ?? []).filter(
      (document) => !gameState.readDocuments.includes(document.id)
    ).length;

    return playerVisibleMechanics.map((mechanic) => {
      let hasUpdate = false;
      let badgeCount = 0;

      switch (mechanic.tab_id) {
        case 'emails':
          hasUpdate = unreadEmails > 0;
          badgeCount = unreadEmails;
          break;
        case 'documents':
          hasUpdate = unreadDocuments > 0;
          badgeCount = unreadDocuments;
          break;
        case 'map':
          hasUpdate = availableProactiveStakeholderIds.length > 0;
          break;
        case 'schedule':
          hasUpdate =
            selectedVersion === 'CESFAM' &&
            canEditCesfamSchedule(gameState.day) &&
            !wasCesfamScheduleSubmittedThisWeek(gameState.day, gameState.lastScheduleSubmissionDay);
          break;
        default:
          hasUpdate = false;
      }

      return {
        id: mechanic.mechanic_id,
        tabId: mechanic.tab_id,
        icon: mechanicIconByTab[mechanic.tab_id] || '•',
        hasUpdate,
        badgeCount,
        isActive: activeTab === mechanic.tab_id,
      };
    });
  }, [
    activeTab,
    availableProactiveStakeholderIds,
    contentPack.documents,
    gameState.day,
    gameState.inbox,
    gameState.lastScheduleSubmissionDay,
    gameState.readDocuments,
    playerVisibleMechanics,
    selectedVersion,
  ]);
  const mechanicContextValue = {
    gameState,
    engine: mechanicEngine,
    dispatch,
    sessionExport,
    office: officeState,
    availableProactiveStakeholderIds,
    contentPack,
  };

  const renderMechanicTab = () => {

    const enabledEntry = enabledMechanics.find((mechanic) => mechanic.tab_id === activeTab);
    const registryEntry = enabledEntry
      ? MECHANIC_REGISTRY[enabledEntry.mechanic_id]
      : Object.values(MECHANIC_REGISTRY).find((entry) => entry.tab_id === activeTab);

    if (registryEntry?.Module) {
      const Module = registryEntry.Module;
      return <Module params={enabledEntry?.params} />;
    }

    return null;
  };


  if (selectedVersion === 'INNOVATEC') return <InnovatecGame onExitToHome={handleReturnHome} />;
  if (appStep === 'version_selection') return <VersionSelector onSelect={handleSelectVersion} />;
  if (appStep === 'splash') return (
    <SplashScreen
      onStartGame={handleStartGame}
      title="COMPASS"
      subtitle={getVersionSubtitle(selectedVersion, config?.title)}
      logoUrl={selectedVersion ? LOGO_BY_VERSION[selectedVersion] : undefined}
    />
  );

  return (
    <MechanicProvider value={mechanicContextValue}>
    <div
      className="app-shell"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 0px))' }}
    >
     <div className="layout-grid">
       <Sidebar
         isOpen={isSidebarOpen}
         onClose={() => setIsSidebarOpen(false)}
         onNavigate={handleSidebarNavigate}
         onReturnHome={handleReturnHome}
         stages={stageTabs}
         developerUnlocked={isDeveloperUnlocked}
         onUnlockDeveloper={handleDeveloperUnlock}
         onTogglePause={() => setIsTimerPaused((prev) => !prev)}
         isTimerPaused={isTimerPaused}
         onToggleBitacora={() => setShowLogPanel((prev) => !prev)}
         hasBitacora
      />
      {warningPopupMessage && <WarningPopup message={warningPopupMessage} onClose={() => setWarningPopupMessage(null)} />}
      {isPreparingDayReview && (
        <div className="fixed inset-0 z-[175] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="rounded-2xl border border-blue-950/80 bg-slate-950/95 px-6 py-5 text-center shadow-2xl">
            <div className="text-xs uppercase tracking-[0.32em] text-blue-200/70">Cierre diario</div>
            <div className="mt-3 text-lg font-semibold text-white">Preparando resumen del día...</div>
          </div>
        </div>
      )}
      {pendingDayReview && (
        <DayReviewScreen
          data={pendingDayReview.reviewData}
          resolution={pendingDayReview.resolution}
          onContinue={handleContinueFromDayReview}
        />
      )}
      {gameStatus !== 'playing' && (
        <EndGameScreen
          status={gameStatus}
          message={endGameMessage}
          saveStatus={finalPersistStatus}
          saveError={finalPersistError}
          onRetrySave={() => {
            finalPersistAttemptedRef.current = true;
            void persistFinalSession();
          }}
          onDownloadBackup={() =>
            downloadSessionSnapshot(
              sessionExport,
              `session_export_${sessionExport.session_metadata.session_id}.json`
            )
          }
        />
      )}
      <div
        className="sticky z-40"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <Header
          gameState={gameState}
          countdown={countdown}
          isTimerPaused={effectiveTimerPaused}
          onTogglePause={() => setIsTimerPaused(prev => !prev)}
          onAdvanceTime={handleManualAdvance}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          showPauseControl={false}
          globalEffectsHighlight={hoveredGlobalEffects}
          recentInternalResolution={recentInternalResolution}
          dailySummary={dailySummary}
          title="COMPASS"
          subtitle={getVersionSubtitle(selectedVersion, config?.title)}
          logoUrl={selectedVersion ? LOGO_BY_VERSION[selectedVersion] : undefined}
        />
      </div>
      <div className="fixed bottom-36 right-6 z-40">
        <button
          onClick={() => setAudioEnabled((v) => !v)}
          className={`px-3 py-2 rounded-full border text-sm font-semibold transition ${
            audioEnabled
              ? 'bg-emerald-600/80 text-white border-emerald-400 hover:bg-emerald-500'
              : 'bg-gray-800/80 text-gray-200 border-gray-600 hover:bg-gray-700'
          }`}
          title={audioEnabled ? 'Desactivar audio' : 'Activar audio'}
        >
          {audioEnabled ? 'Audio ON' : 'Audio OFF'}
        </button>
      </div>
      <HelpButton onClick={() => setIsHelpOpen(true)} />
      <HelpPanel
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Ayuda rápida"
        sections={[
          { heading: "Objetivo", content: "Toma decisiones, observa su impacto y sigue el flujo de reuniones y tareas." },
          { heading: "Atajos", items: ["Espacio: Pausar/continuar tiempo", "H: Abrir/Cerrar ayuda (pendiente de wiring)"] },
          { heading: "Sugerencia", content: "Pasa el cursor sobre las acciones para ver impacto en presupuesto/reputación." }
        ]}
      />
      
      <div className="mt-4 flex gap-3">
        <div
          className="relative flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out"
          style={{ width: `${isLeftRailExpanded ? (isObjectivesOpen ? 320 : 208) : 64}px` }}
          onMouseEnter={handleLeftRailEnter}
          onMouseLeave={handleLeftRailLeave}
        >
          <div className="flex h-full min-h-[32rem] flex-col gap-3 pt-3">
            <button
              onClick={handleToggleObjectives}
              className={`group relative flex h-16 items-center overflow-hidden rounded-[1.6rem] border bg-slate-900/85 px-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.28)] transition-all duration-300 ${
                isLeftRailExpanded ? 'w-full border-blue-950/80' : 'w-16 border-white/10'
              }`}
            >
              <div className={`relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-slate-900 transition-all ${hasUnseenObjectiveUpdates ? 'border-amber-200 bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.75)]' : 'border-amber-300/70 bg-amber-300/90'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="7"></circle>
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"></circle>
                </svg>
                {objectivesUnseenCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {objectivesUnseenCount}
                  </span>
                )}
              </div>
              <div
                className={`flex min-w-0 items-center justify-between whitespace-nowrap transition-all duration-300 ease-out ${
                  isLeftRailExpanded ? 'ml-3 w-full opacity-100 translate-x-0' : 'ml-0 w-0 opacity-0 translate-x-[-10px]'
                }`}
              >
                <span className="text-[11px] uppercase tracking-[0.24em] text-amber-200/90">Objetivos</span>
                <span className="pr-1 text-lg text-amber-300">{isObjectivesOpen ? '▾' : '▸'}</span>
              </div>
            </button>

            {isLeftRailExpanded && (
              <CaseObjectivesPanel
                isOpen={isObjectivesOpen}
                onToggle={handleToggleObjectives}
                hasUnseenUpdates={hasUnseenObjectiveUpdates}
                unseenCount={objectivesUnseenCount}
                activeCase={activeCase}
                commitments={commitments}
                hideHeader
                className="w-full"
              />
            )}

            <aside className="w-full">
              <nav className="flex flex-col gap-3" aria-label="Tabs">
                {playerVisibleMechanics.map((m) => {
                  const indicator = collapsedMechanicIndicators.find((item) => item.tabId === m.tab_id);
                  return (
                    <button
                      key={m.mechanic_id}
                      onClick={() => setActiveTab(m.tab_id)}
                      className={`group relative flex h-14 items-center overflow-hidden rounded-[1.4rem] border bg-slate-900/85 px-2.5 shadow-[0_12px_24px_rgba(0,0,0,0.24)] transition-all duration-300 ${
                        isLeftRailExpanded ? 'w-full border-blue-950/80' : 'w-16 border-white/10'
                      } ${activeTab === m.tab_id ? 'ring-1 ring-blue-900/45' : ''}`}
                    >
                      <div className={`relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border text-lg transition-all ${
                        indicator?.hasUpdate
                          ? 'border-cyan-200/80 bg-cyan-400/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.55)] animate-pulse'
                          : activeTab === m.tab_id
                            ? 'border-white/40 bg-white/18 text-white shadow-[0_10px_18px_rgba(0,0,0,0.22)]'
                            : 'border-white/15 bg-white/10 text-white shadow-[0_10px_18px_rgba(0,0,0,0.22)]'
                      }`}>
                        <span>{mechanicIconByTab[m.tab_id] || '•'}</span>
                        {(indicator?.badgeCount ?? 0) > 0 && (
                          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-white">
                            {indicator?.badgeCount}
                          </span>
                        )}
                      </div>
                      <div
                        className={`min-w-0 overflow-hidden whitespace-nowrap text-left transition-all duration-300 ease-out ${
                          isLeftRailExpanded ? 'ml-3 w-full opacity-100 translate-x-0' : 'ml-0 w-0 opacity-0 translate-x-[-10px]'
                        }`}
                      >
                        <span className={`block ${activeTab === m.tab_id ? 'text-white' : 'text-slate-300'}`}>{m.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </aside>
          </div>
        </div>

        <main className="relative flex-grow">
          {renderMechanicTab()}
          {toastMessage && (
            <div className="pointer-events-none absolute right-4 top-4 z-30 max-w-sm w-[21rem] animate-memo-toast">
              <div className="overflow-hidden rounded-2xl border border-cyan-200/40 bg-slate-950/90 shadow-[0_18px_42px_rgba(0,0,0,0.38)] backdrop-blur-md">
                <div className="h-1.5 w-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300" />
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                    💭
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug text-white">{toastMessage}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bitácora panel */}
      {showLogPanel && (
        <div
          className="fixed z-40 w-80 max-h-[70vh] bg-gray-900/95 border border-amber-400/70 rounded-2xl shadow-2xl p-4 overflow-y-auto select-none"
          style={{ top: logPos.y, left: logPos.x, cursor: isLogDragging ? 'grabbing' : 'default' }}
        >
          <div
            className="flex justify-between items-center mb-3"
            onMouseDown={(e) => {
              setIsLogDragging(true);
              setLogDragOffset({ x: e.clientX - logPos.x, y: e.clientY - logPos.y });
            }}
          >
            <h3 className="text-xl font-bold text-amber-300">Bitácora</h3>
            <button
              className="text-amber-200 hover:text-white"
              onClick={() => setShowLogPanel(false)}
            >
              ×
            </button>
          </div>
          <ul className="space-y-2 text-sm pr-1">
            {gameState.eventsLog.slice().reverse().map((event, idx) => (
              <li key={idx} className="bg-gray-800/70 p-2 rounded-md border border-gray-700/70">
                {event}
              </li>
            ))}
            {gameState.eventsLog.length === 0 && (
              <li className="text-gray-400">Sin eventos aún.</li>
            )}
          </ul>
        </div>
      )}
      <style>{`
        @keyframes memo-toast {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-memo-toast { animation: memo-toast 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
     </div>
    </div>
    </MechanicProvider>
  );
}

