import { DailyResolution, DecisionLogEntry, GameState, QuestionLogEntry, Stakeholder } from '../types';

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
  outcome === 'DONE_OK' ? 'completed' : 'failed';

export const buildCesfamDayReviewData = (
  gameState: GameState,
  completedDay: number,
  nextDay: number,
  resolution: DailyResolution | null
): CesfamDayReviewData => {
  const decisions = gameState.decisionLog
    .filter((entry) => entry.day === completedDay)
    .map(mapDecision);

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
  };
};
