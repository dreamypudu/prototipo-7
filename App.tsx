
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConversationMode, GameState, GlobalEffectsUI, Stakeholder, StakeholderQuestion, PlayerAction, TimeSlotType, Commitment, ScenarioNode, ScenarioOption, MeetingSequence, ProcessLogEntry, DecisionLogEntry, Consequences, InboxEmail, PlayerActionLogEntry, Document, ScheduleAssignment, StaffMember, SimulatorVersion, SimulatorConfig, MechanicConfig, GameStatus, QuestionLogEntry, ScenarioFile } from './types';
import { SIMULATOR_CONFIGS } from './data/simulatorConfigs';
import { getVersionContentPack, type VersionContentPack } from './data/versions';
import { startLogging, finalizeLogging } from './services/Timelogger';
import { mechanicEngine } from './services/MechanicEngine';
import { MECHANIC_REGISTRY } from './mechanics/registry';
import { MechanicProvider } from './mechanics/MechanicContext';
import { MechanicDispatchAction, OfficeState } from './mechanics/types';
import { compareExpectedVsActual } from './services/ComparisonEngine';
import { buildSessionExport } from './services/sessionExport';
import { useMechanicLogSync } from './hooks/useMechanicLogSync';
import { clampReputation, resolveGlobalEffects } from './services/globalEffects';
import {
  resolveStakeholderByRef,
  sequenceBelongsToStakeholder,
} from './services/stakeholderResolver';

import Header from './components/Header';
import EndGameScreen from './components/EndGameScreen';
import WarningPopup from './components/WarningPopup';
import Sidebar from './components/Sidebar';
import HelpButton from './components/ui/HelpButton';
import HelpPanel from './components/ui/HelpPanel';
import ObjectivesWidget from './components/ui/ObjectivesWidget';
import VersionSelector from './components/VersionSelector';
import InnovatecGame from './games/InnovatecGame';
import SplashScreen from './components/SplashScreen';
import type { DailyEffectSummary } from './types';
import { useObjectivesTracker } from './hooks/useObjectivesTracker';

type ActiveTab = string;
type AppStep = 'version_selection' | 'splash' | 'game';

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
  stakeholderDeltas: Record<string, any>,
  stakeholders: Stakeholder[]
): DailyEffectSummary => {
  const parts: string[] = [];
  const b = Number(globalDeltas?.budget || 0);
  const r = Number(globalDeltas?.reputation || 0);
  parts.push(`Presupuesto ${b >= 0 ? '+' : ''}${b}`);
  parts.push(`Reputación ${r >= 0 ? '+' : ''}${r}`);
  const stakeParts: string[] = [];
  Object.entries(stakeholderDeltas || {}).forEach(([id, delta]) => {
    const sh = stakeholders.find(s => s.id === id);
    if (!sh) return;
    const t = Number(delta?.trust || 0);
    const s = Number(delta?.support || 0);
    stakeParts.push(`${sh.name}: confianza ${t >= 0 ? '+' : ''}${t}, apoyo ${s >= 0 ? '+' : ''}${s}`);
  });
  return {
    day,
    summary: parts.join(' | '),
    stakeholderDetails: stakeParts
  };
};

const createInitialGameState = (contentPack: VersionContentPack): GameState => {
  const baseState = contentPack.defaults.buildInitialGameState();
  const scenarioSource = contentPack.scenarios;
  const initialSchedule: Record<string, {day: number, slot: TimeSlotType}> = {
      'EVENT_STORM': { day: 1, slot: 'tarde' },
      'AZUL_MEETING_BLOCKED': { day: 1, slot: 'tarde' },
  };

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
      questionLog: []
  };
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
  const sessionStartRef = useRef<number | null>(null);
  const sessionEndRef = useRef<number | null>(null);
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
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [endGameMessage, setEndGameMessage] = useState<string>('');
  const [currentMeeting, setCurrentMeeting] = useState<{ sequence: MeetingSequence; nodeIndex: number } | null>(null);
  const [warningPopupMessage, setWarningPopupMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredGlobalEffects, setHoveredGlobalEffects] = useState<GlobalEffectsUI | null>(null);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('idle');
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [questionsOrigin, setQuestionsOrigin] = useState<ConversationMode | null>(null);
  const [questionsBaseDialogue, setQuestionsBaseDialogue] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState<DailyEffectSummary | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [logPos, setLogPos] = useState<{ x: number; y: number }>({ x: 240, y: 110 });
  const [isLogDragging, setIsLogDragging] = useState(false);
  const [logDragOffset, setLogDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const upSoundRef = useRef<HTMLAudioElement | null>(null);
  const downSoundRef = useRef<HTMLAudioElement | null>(null);
  const prevStats = useRef<{ budget: number; reputation: number }>({
    budget: DEFAULT_INITIAL_STATE.budget,
    reputation: DEFAULT_INITIAL_STATE.reputation
  });
  const audioUnlocked = useRef(false);
  const timeSlots = contentPack.defaults.timeSlots;
  const directorObjectives = contentPack.defaults.directorObjectives;
  const secretaryRole = contentPack.defaults.secretaryRole;
  const emailTemplates = contentPack.emails;
  const objectivesTracker = useObjectivesTracker(contentPack.globalObjectives, contentPack.npcObjectives);
  const {
    globalVisible: globalObjectivesVisible,
    npcVisible: npcObjectivesVisible,
    unseenCount: objectivesUnseenCount,
    hasUnseenUpdates: hasUnseenObjectiveUpdates,
    registerSequenceCompleted,
    markAllSeen: markObjectiveUpdatesSeen,
  } = objectivesTracker;
  const enabledMechanics = resolveMechanics(config);
  // Sync mechanic engine buffers with React state periodically or on significant events
  const syncLogs = useMechanicLogSync(setGameState);
  const stageTabs = [
    { id: 'stage_1', label: 'Etapa 1: Inicio', status: 'active' as const },
    { id: 'stage_2', label: 'Etapa 2: Progreso', status: 'upcoming' as const },
    { id: 'stage_3', label: 'Etapa 3: Cierre', status: 'upcoming' as const }
  ];

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

  const setPersonalizedDialogue = useCallback((dialogue: string) => {
    setCurrentDialogue(dialogue.replace(/{playerName}/g, gameState.playerName));
  }, [gameState.playerName]);

  const handleActionHover = useCallback((effects: GlobalEffectsUI | null) => {
    setHoveredGlobalEffects(effects);
  }, []);

  const showToast = useCallback((msg: string, durationMs = 5000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), durationMs);
  }, []);

  const handleToggleObjectives = useCallback(() => {
    setIsObjectivesOpen((prev) => {
      const next = !prev;
      if (next) {
        markObjectiveUpdatesSeen();
      }
      return next;
    });
  }, [markObjectiveUpdatesSeen]);

  useEffect(() => {
    if (isObjectivesOpen && hasUnseenObjectiveUpdates) {
      markObjectiveUpdatesSeen();
    }
  }, [isObjectivesOpen, hasUnseenObjectiveUpdates, markObjectiveUpdatesSeen]);

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

  const buildPostSequenceActions = (stakeholder: Stakeholder): PlayerAction[] => {
    const actions: PlayerAction[] = [];
    if (hasQuestionsFor(stakeholder)) {
      actions.push({ label: 'Hacer preguntas', cost: 'Opcional', action: 'ask_questions', uiVariant: 'success' });
    }
    actions.push({ label: 'Concluir Reunion', cost: 'Finalizar', action: 'conclude_meeting' });
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

  const shouldTriggerContingentSequence = (sequence: MeetingSequence, state: GameState) => {
    if (!sequence.isContingent || !sequence.contingentRules) return false;
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

  useEffect(() => {
    if (gameStatus === 'playing') return;
    if (appStep === 'game' && sessionEndRef.current === null) {
      sessionEndRef.current = Date.now();
    }
    setGameState(prev => {
      const newComparisons = compareExpectedVsActual(
        prev.expectedActions,
        prev.canonicalActions,
        prev.comparisons,
        { includeNotDone: true }
      );
      if (newComparisons.length === 0) return prev;
      return { ...prev, comparisons: [...prev.comparisons, ...newComparisons] };
    });
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
    if (appStep !== 'game' || gameStatus !== 'playing' || currentMeeting) return;

    const inevitableSeq = scenarioData.sequences.find(seq =>
      seq.isInevitable &&
      !gameState.completedSequences.includes(seq.sequence_id) &&
      gameState.scenarioSchedule[seq.sequence_id]?.day === gameState.day &&
      gameState.scenarioSchedule[seq.sequence_id]?.slot === gameState.timeSlot
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
  }, [gameState.day, gameState.timeSlot, gameState.completedSequences, appStep, gameStatus, currentMeeting, gameState.scenarioSchedule, gameState.stakeholders, startSequence, scenarioData]);

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
  }, []);

  const applyDailyDeltas = useCallback(
    (prev: GameState, completedDay: number, globalDeltas: any, stakeholderDeltas: Record<string, any>): GameState => {
      const deltaBudget = Number(globalDeltas?.budget || 0);
      const deltaReputation = Number(globalDeltas?.reputation || 0);
      const nextBudget = prev.budget + deltaBudget;
      const nextReputation = clampReputation(prev.reputation + deltaReputation);

      const updatedStakeholders = prev.stakeholders.map((sh) => {
        const deltas = stakeholderDeltas?.[sh.id];
        if (!deltas) return sh;
        const trustDelta = Number(deltas.trust || 0);
        const supportDelta = Number(deltas.support || 0);
        return {
          ...sh,
          trust: Math.max(0, Math.min(100, sh.trust + trustDelta)),
          support: Math.max(sh.minSupport, Math.min(sh.maxSupport, sh.support + supportDelta)),
        };
      });

      const summary = `Resolución día ${completedDay}: presupuesto ${deltaBudget >= 0 ? '+' : ''}${deltaBudget}, reputación ${deltaReputation >= 0 ? '+' : ''}${deltaReputation}`;
      return {
        ...prev,
        budget: nextBudget,
        reputation: nextReputation,
        stakeholders: updatedStakeholders,
        eventsLog: [...prev.eventsLog, summary],
      };
    },
    []
  );

  const syncDayWithBackend = useCallback(
    async (completedDay: number, snapshot: GameState) => {
      try {
        const exportPayload = buildSessionExport({
          gameState: snapshot,
          config,
          sessionId: sessionIdRef.current,
          startedAt: sessionStartRef.current ?? Date.now(),
          endedAt: Date.now()
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
        setGameState((prev) => applyDailyDeltas(prev, completedDay, globalDeltas, stakeholderDeltas));
        const summary = summarizeDeltas(completedDay, globalDeltas, stakeholderDeltas, gameState.stakeholders);
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
    [config, applyDailyDeltas, gameState.stakeholders, showToast]
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
        return {
          label: opt.cardTitle || opt.text,
          description: opt.text,
          cardEmoji: opt.cardEmoji,
          action: opt.option_id,
          cost: 'Decisión',
          globalEffectsUI: effects.ui
        };
      })
    );
    startLogging(scenario.node_id);

    mechanicEngine.emitEvent('dialogue', 'scenario_presented', { node_id: scenario.node_id });
  }, [setPersonalizedDialogue, gameState.stakeholders]);

  const advanceTimeAndUpdateFocus = useCallback((justCompletedSequenceId?: string, options?: { skipTimeAdvance?: boolean }) => {
    let stateAfterMeetingEnd = { ...gameState };
    if (justCompletedSequenceId && !stateAfterMeetingEnd.completedSequences.includes(justCompletedSequenceId)) {
      stateAfterMeetingEnd.completedSequences = [...stateAfterMeetingEnd.completedSequences, justCompletedSequenceId];
    }

    if (characterInFocus && characterInFocus.role !== secretaryRole) {
      stateAfterMeetingEnd.stakeholders = stateAfterMeetingEnd.stakeholders.map(sh =>
        sh.name === characterInFocus.name ? { ...sh, lastMetDay: gameState.day } : sh
      );
    }
    const skipTimeAdvance = Boolean(options?.skipTimeAdvance);
    const newState = skipTimeAdvance ? stateAfterMeetingEnd : advanceTime(stateAfterMeetingEnd);
    registerSequenceCompleted(justCompletedSequenceId, newState);
    setGameState(newState);
    if (!skipTimeAdvance) {
      const completedDay = (newState as any).__completedDay as number | null;
      if (completedDay !== null && completedDay > 0) {
        const snapshot = { ...newState };
        delete (snapshot as any).__completedDay;
        syncDayWithBackend(completedDay, snapshot);
      }
      setCountdown(PERIOD_DURATION);
    } else {
      // Reactivar el timer y evitar que quede congelado si el contador estaba en 0
      setIsTimerPaused(false);
      setCountdown(prev => prev > 0 ? prev : PERIOD_DURATION);
    }
    setCharacterInFocus(null);
    syncLogs();
  }, [gameState, characterInFocus, advanceTime, secretaryRole, registerSequenceCompleted, syncLogs]);

  useEffect(() => {
    if (isTimerPaused || activeTab !== 'interaction' || gameStatus !== 'playing' || appStep !== 'game') return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          advanceTimeAndUpdateFocus();
          return PERIOD_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerPaused, activeTab, advanceTimeAndUpdateFocus, gameStatus, appStep]);

  useEffect(() => {
    if (appStep !== 'game') return;
    setIsTimerPaused(false);
    setGameState(prev => {
      const welcomeEmails = emailTemplates.filter(t => t.trigger.stakeholder_id === 'system-startup');
      const newEmails = welcomeEmails
        .filter(t => !prev.inbox.some(e => e.email_id === t.email_id))
        .map(t => ({ email_id: t.email_id, dayReceived: 1, isRead: false }));
      return newEmails.length > 0 ? { ...prev, inbox: [...prev.inbox, ...newEmails] } : prev;
    });
  }, [appStep, emailTemplates]);

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
          gameState.scenarioSchedule[seq.sequence_id]?.day === gameState.day &&
          gameState.scenarioSchedule[seq.sequence_id]?.slot === gameState.timeSlot
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
                  !seq.isContingent
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
      setGameState(prev => {
          const jumpDays = 5;
          return { ...prev, day: prev.day + jumpDays, eventsLog: [...prev.eventsLog, `Semana Ejecutada. Avanzado al día ${prev.day + jumpDays}.`] };
      });
      setWarningPopupMessage("Semana ejecutada con éxito.");
      setActiveTab('interaction');
  };

  const handleSetupScheduleWar = () => {
      setActiveTab('schedule');
      setCurrentMeeting(null);
      setCharacterInFocus(null);
      setWarningPopupMessage("┬íPROPUESTAS DE JEFATURAS CARGADAS!");
  };

  const handlePlayerAction = async (action: PlayerAction) => {
    if (gameStatus !== 'playing') return;
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
                    setPlayerActions(buildPostSequenceActions(characterInFocus));
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
                setPlayerActions(buildPostSequenceActions(characterInFocus));
                setIsLoading(false);
                return;
        }
    }
    
    if (action.action === 'conclude_meeting') {
        const justCompletedSequenceId = currentMeeting?.sequence.sequence_id;
        const skipTimeAdvance = currentMeeting?.sequence?.consumesTime === false;
        setCurrentMeeting(null);
        setConversationMode('idle');
        setQuestionsOrigin(null);
        setQuestionsBaseDialogue('');
        advanceTimeAndUpdateFocus(justCompletedSequenceId, { skipTimeAdvance });
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
              mechanicEngine.registerExpectedActions(scenario.node_id, option.option_id, consequences.expected_actions);
              const toastText = characterInFocus?.name ? `${characterInFocus.name} recordará eso` : 'NPC recordará eso';
              showToast(toastText);
            }
            mechanicEngine.emitEvent('dialogue', 'decision_made', {
              node_id: scenario.node_id,
              option_id: option.option_id
            });

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
            setCountdown(PERIOD_DURATION);
        }
    }
    setIsLoading(false);
  };

  const handleManualAdvance = () => { advanceTimeAndUpdateFocus(); };
  const handleMarkEmailAsRead = (emailId: string) => {
    setGameState(prev => ({ ...prev, inbox: prev.inbox.map(e => e.email_id === emailId ? { ...e, isRead: true } : e) }));
  };
  const handleMarkDocumentAsRead = (docId: string) => {
    setGameState(prev => prev.readDocuments.includes(docId) ? prev : { ...prev, readDocuments: [...prev.readDocuments, docId] });
  };
  const handleSidebarNavigate = (tab: any) => { setActiveTab(tab); };
  const handleReturnHome = () => {
    setIsSidebarOpen(false);
    setWarningPopupMessage(null);
    setGameStatus('playing');
    setEndGameMessage('');
    setCurrentMeeting(null);
    setCharacterInFocus(null);
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
    setGameState(createInitialGameState(DEFAULT_CONTENT_PACK));
    prevStats.current = {
      budget: DEFAULT_INITIAL_STATE.budget,
      reputation: DEFAULT_INITIAL_STATE.reputation,
    };
    sessionStartRef.current = null;
    sessionEndRef.current = null;
    sessionIdRef.current = crypto.randomUUID();
    setConfig(null);
    setSelectedVersion(null);
    setAppStep('version_selection');
  };
  const sessionExport = buildSessionExport({
    gameState,
    config,
    sessionId: sessionIdRef.current,
    startedAt: sessionStartRef.current ?? undefined,
    endedAt: sessionEndRef.current ?? undefined
  });
  const handleStartGame = (name: string) => {
    sessionStartRef.current = Date.now();
    sessionEndRef.current = null;
    sessionIdRef.current = crypto.randomUUID();
    setGameState(prev => ({...prev, playerName: name}));
    setQuestionsBaseDialogue('');
    setAppStep('game');
  };
  const handleSelectVersion = (version: SimulatorVersion) => {
    const nextConfig = SIMULATOR_CONFIGS[version];
    const nextMechanics = resolveMechanics(nextConfig);
    const nextPack = getVersionContentPack(version);
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
    onAskQuestion: handleAskQuestion
  };

  const mechanicContextValue = {
    gameState,
    engine: mechanicEngine,
    dispatch,
    sessionExport,
    office: officeState
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
       />
      {warningPopupMessage && <WarningPopup message={warningPopupMessage} onClose={() => setWarningPopupMessage(null)} />}
      {gameStatus !== 'playing' && <EndGameScreen status={gameStatus} message={endGameMessage} />}
      <div
        className="sticky z-40"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <Header
          gameState={gameState}
          countdown={countdown}
          isTimerPaused={isTimerPaused}
          onTogglePause={() => setIsTimerPaused(prev => !prev)}
          onAdvanceTime={handleManualAdvance}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          globalEffectsHighlight={hoveredGlobalEffects}
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
      <ObjectivesWidget
        isOpen={isObjectivesOpen}
        onToggle={handleToggleObjectives}
        hasUnseenUpdates={hasUnseenObjectiveUpdates}
        unseenCount={objectivesUnseenCount}
        globalObjectives={globalObjectivesVisible}
        npcObjectives={npcObjectivesVisible}
        stakeholders={gameState.stakeholders}
      />
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
        {/* Lateral nav con colapsado */}
        <div className={`flex flex-col items-start transition-all duration-400 ease-out ${isNavCollapsed ? 'w-12' : 'w-44 flex-shrink-0'}`}>
          <button
            onClick={() => setIsNavCollapsed(prev => !prev)}
            className="mb-2 p-2 rounded-full bg-white/10 border border-white/15 hover:border-teal-300/60 text-gray-200 hover:text-white transition-all duration-300 shadow-sm hover:scale-105"
            title={isNavCollapsed ? 'Mostrar navegación' : 'Ocultar navegación'}
          >
            <span className="text-lg">☰</span>
          </button>
          {!isNavCollapsed && (
            <aside className="w-full transition-opacity duration-300 ease-out animate-slide-fade">
              <nav className="flex flex-col gap-2" aria-label="Tabs">
                {enabledMechanics.map((m) => (
                  <button
                    key={m.mechanic_id}
                    onClick={() => setActiveTab(m.tab_id)}
                    className={`tab-button w-full text-left transition-transform duration-200 ease-out hover:translate-x-1 ${activeTab === m.tab_id ? 'tab-button--active' : ''}`}
                  >
                    {m.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowLogPanel(prev => !prev)}
                  className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 ease-out font-semibold hover:translate-x-1 ${showLogPanel ? 'bg-amber-400 text-gray-900 border-amber-500' : 'bg-amber-300/90 text-gray-900 border-amber-500 hover:bg-amber-400'}`}
                >
                  Bitácora
                </button>
              </nav>
            </aside>
          )}
        </div>

        <main className="flex-grow">
          {renderMechanicTab()}
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
      {dailySummary && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 max-w-2xl panel p-6 text-white border border-white/10">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="text-sm uppercase tracking-wide text-gray-300">Resolución día {dailySummary.day}</div>
              <div className="text-xl font-bold mt-1">{dailySummary.summary}</div>
              {dailySummary.stakeholderDetails.length > 0 && (
                <ul className="mt-2 text-sm text-gray-200 space-y-1">
                  {dailySummary.stakeholderDetails.map((line, idx) => (
                    <li key={idx}>• {line}</li>
                  ))}
                </ul>
              )}
            </div>
            <button
              className="text-gray-300 hover:text-white text-sm"
              onClick={() => setDailySummary(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      {toastMessage && (
        <div className="fixed top-1/2 right-6 -translate-y-1/2 max-w-xs w-[18rem] bg-gray-900/95 text-white px-5 py-4 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] border border-teal-200/60 text-base font-semibold tracking-wide animate-fade-in z-50">
          <div className="flex items-start gap-2">
            <span className="text-xl leading-none">💭</span>
            <span className="leading-tight">{toastMessage}</span>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-fade { animation: slide-fade 0.25s ease-out; }
      `}</style>
     </div>
    </div>
    </MechanicProvider>
  );
}

