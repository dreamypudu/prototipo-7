import { CanonicalAction, DailyResolution, DecisionLogEntry, GameState, QuestionLogEntry, Stakeholder } from '../../../types';

export interface DayReviewDecisionItem {
  id: string;
  stakeholderName: string;
  choiceText: string;
  reputationDelta: number;
  trustDelta: number;
  supportDelta: number;
}

export interface DayReviewSpokenStakeholder {
  id: string;
  name: string;
  role: string;
}

export interface DayReviewResolutionItem {
  id: string;
  title: string;
  status: 'completed' | 'failed';
}

export interface DayReviewInternalChangeItem {
  id: string;
  stakeholderName: string;
  trustDelta: number;
  supportDelta: number;
}

export interface DayReviewPendingCommitment {
  id: string;
  title: string;
}

export interface CesfamDayReviewData {
  completedDay: number;
  completedDayLabel: string;
  nextDay: number;
  nextDayLabel: string;
  reputationDelta: number;
  decisionCount: number;
  decisions: DayReviewDecisionItem[];
  spokenStakeholders: DayReviewSpokenStakeholder[];
  resolutionItems: DayReviewResolutionItem[];
  internalChanges: DayReviewInternalChangeItem[];
  pendingCommitments: DayReviewPendingCommitment[];
}

const CESFAM_DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Lunes siguiente',
};

const getDayLabel = (day: number) => CESFAM_DAY_LABELS[day] ?? `Día ${day}`;

const findStakeholderByName = (stakeholders: Stakeholder[], name: string) =>
  stakeholders.find((stakeholder) => stakeholder.name === name) ?? null;

const mapDecision = (entry: DecisionLogEntry, index: number): DayReviewDecisionItem => ({
  id: `decision-${entry.day}-${index}`,
  stakeholderName: entry.stakeholder,
  choiceText: entry.choiceText,
  reputationDelta: Number(entry.consequences.reputationChange ?? 0),
  trustDelta: Number(entry.consequences.trustChange ?? 0),
  supportDelta: Number(entry.consequences.supportChange ?? 0),
});

const getEntryDay = (entry: { day?: number | string | null; committed_day?: number | string | null; context?: Record<string, any> }) => {
  const rawDay = entry.day ?? entry.committed_day ?? entry.context?.day;
  const day = Number(rawDay);
  return Number.isFinite(day) ? day : null;
};

const getActionLabel = (action: CanonicalAction) => {
  if (action.summary) return action.summary;
  const targetLabel = action.target_label || action.target_ref;
  const mechanicLabel = action.mechanic_id ? `${action.mechanic_id}: ` : '';
  return `${mechanicLabel}${action.action_type}${targetLabel ? ` (${targetLabel})` : ''}`;
};

const mapCanonicalAction = (action: CanonicalAction, index: number): DayReviewDecisionItem => ({
  id: `canonical-${action.canonical_action_id}-${index}`,
  stakeholderName: action.target_label || action.target_ref || action.mechanic_id,
  choiceText: getActionLabel(action),
  reputationDelta: 0,
  trustDelta: 0,
  supportDelta: 0,
});

const appendSpokenStakeholder = (
  result: DayReviewSpokenStakeholder[],
  seen: Set<string>,
  stakeholder: Stakeholder | null,
  fallbackId: string,
  fallbackName: string,
  fallbackRole = 'Actor relevante'
) => {
  const id = stakeholder?.id ?? fallbackId;
  if (seen.has(id)) return;
  seen.add(id);
  result.push({
    id,
    name: stakeholder?.name ?? fallbackName,
    role: stakeholder?.role ?? fallbackRole,
  });
};

const mapResolutionStatus = (outcome: DailyResolution['comparisons'][number]['outcome']): 'completed' | 'failed' =>
  outcome ? 'completed' : 'failed';

export const buildCesfamDayReviewData = (
  gameState: GameState,
  completedDay: number,
  nextDay: number,
  resolution: DailyResolution | null
): CesfamDayReviewData => {
  const completedDayNumber = Number(completedDay);
  const explicitDecisionEntries = gameState.decisionLog
    .filter((entry) => getEntryDay(entry) === completedDayNumber && entry.is_decision !== false);
  const explicitDecisions = explicitDecisionEntries.map(mapDecision);
  const explicitDecisionKeys = new Set(
    explicitDecisionEntries.map((entry) => `${entry.nodeId}:${entry.choiceId}`)
  );
  const mechanicActions = gameState.canonicalActions
    .filter((action) => getEntryDay(action) === completedDayNumber)
    .filter((action) => {
      if (!action.source_node_id || !action.source_option_id) return true;
      return !explicitDecisionKeys.has(`${action.source_node_id}:${action.source_option_id}`);
    })
    .map(mapCanonicalAction);
  const decisions = [...explicitDecisions, ...mechanicActions];

  const questions = gameState.questionLog.filter((entry) => entry.day === completedDay);
  const stakeholderById = new Map(gameState.stakeholders.map((stakeholder) => [stakeholder.id, stakeholder]));
  const expectedActionById = new Map(
    gameState.expectedActions.map((expected) => [expected.expected_action_id, expected])
  );

  const spokenStakeholders: DayReviewSpokenStakeholder[] = [];
  const seenStakeholders = new Set<string>();

  decisions.forEach((entry) => {
    appendSpokenStakeholder(
      spokenStakeholders,
      seenStakeholders,
      findStakeholderByName(gameState.stakeholders, entry.stakeholderName),
      entry.stakeholderName,
      entry.stakeholderName
    );
  });

  questions.forEach((entry: QuestionLogEntry) => {
    const stakeholder = stakeholderById.get(entry.stakeholder_id) ?? null;
    appendSpokenStakeholder(
      spokenStakeholders,
      seenStakeholders,
      stakeholder,
      entry.stakeholder_id,
      stakeholder?.name ?? entry.stakeholder_id
    );
  });

  const resolutionItems: DayReviewResolutionItem[] = (resolution?.comparisons ?? []).map((comparison, index) => ({
    id: `resolution-${comparison.expected_action_id}-${index}`,
    title:
      expectedActionById.get(comparison.expected_action_id)?.ui?.title ??
      `Compromiso ${index + 1}`,
    status: mapResolutionStatus(comparison.outcome),
  }));

  const internalChanges: DayReviewInternalChangeItem[] = Object.entries(resolution?.stakeholder_deltas ?? {})
    .map(([stakeholderId, delta]) => {
      const trustDelta = Number(delta?.trust ?? 0);
      const supportDelta = Number(delta?.support ?? 0);
      if (trustDelta === 0 && supportDelta === 0) return null;
      const stakeholder = stakeholderById.get(stakeholderId);
      return {
        id: stakeholderId,
        stakeholderName: stakeholder?.name ?? stakeholderId,
        trustDelta,
        supportDelta,
      };
    })
    .filter((item): item is DayReviewInternalChangeItem => item !== null)
    .sort((a, b) => Math.max(Math.abs(b.trustDelta), Math.abs(b.supportDelta)) - Math.max(Math.abs(a.trustDelta), Math.abs(a.supportDelta)));

  const directReputationDelta = decisions.reduce((sum, entry) => sum + entry.reputationDelta, 0);
  const resolutionReputationDelta = Number(resolution?.global_deltas?.reputation ?? 0);

  // Compromisos pendientes: expectedActions creadas hasta hoy cuyo expected_action_id
  // todavia no aparece resuelto en gameState.comparisons. Son las "promesas vivas"
  // que el jugador todavia tiene que cumplir.
  const resolvedExpectedActionIds = new Set(
    gameState.comparisons
      .map((comparison) => comparison.expected_action_id)
      .filter((id): id is string => Boolean(id))
  );
  const pendingCommitments: DayReviewPendingCommitment[] = gameState.expectedActions
    .filter((expected) => !resolvedExpectedActionIds.has(expected.expected_action_id))
    .filter((expected) => {
      const createdDay = Number(expected.created_day ?? completedDay);
      return Number.isFinite(createdDay) && createdDay <= completedDayNumber;
    })
    .map((expected) => ({
      id: expected.expected_action_id,
      title: expected.ui?.title ?? expected.target_ref ?? expected.action_type ?? 'Compromiso pendiente',
    }));

  return {
    completedDay,
    completedDayLabel: getDayLabel(completedDay),
    nextDay,
    nextDayLabel: getDayLabel(nextDay),
    reputationDelta: directReputationDelta + resolutionReputationDelta,
    decisionCount: decisions.length,
    decisions,
    spokenStakeholders,
    resolutionItems,
    internalChanges,
    pendingCommitments,
  };
};
