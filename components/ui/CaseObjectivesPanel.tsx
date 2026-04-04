import React from 'react';
import type { ActiveCaseDisplay } from '../../hooks/useCaseTracker';
import type { CommitmentDisplayItem } from '../../services/commitments';

interface CaseObjectivesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  hasUnseenUpdates: boolean;
  unseenCount: number;
  activeCase: ActiveCaseDisplay | null;
  commitments: CommitmentDisplayItem[];
  collapsed?: boolean;
  hideHeader?: boolean;
  className?: string;
}

const goalStatusStyles: Record<ActiveCaseDisplay['goals'][number]['status'], string> = {
  pending: 'bg-gray-500/20 text-gray-200 border-gray-400/30',
  in_progress: 'bg-blue-500/20 text-blue-100 border-blue-300/40',
  completed: 'bg-emerald-500/20 text-emerald-100 border-emerald-300/40',
  failed: 'bg-red-500/20 text-red-100 border-red-300/40',
};

const goalStatusLabel: Record<ActiveCaseDisplay['goals'][number]['status'], string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  failed: 'Fallido',
};

const commitmentStatusStyles: Record<CommitmentDisplayItem['status'], string> = {
  active: 'bg-amber-400/20 text-amber-100 border-amber-300/50',
  completed: 'bg-emerald-500/20 text-emerald-100 border-emerald-300/40',
  failed: 'bg-red-500/20 text-red-100 border-red-300/40',
};

const commitmentCardStyles: Record<CommitmentDisplayItem['status'], string> = {
  active: 'border-white/10 bg-slate-950/60',
  completed: 'border-emerald-300/70 bg-emerald-500/30 shadow-[0_0_24px_rgba(52,211,153,0.35)]',
  failed: 'border-rose-300/70 bg-rose-500/30 shadow-[0_0_24px_rgba(244,63,94,0.35)]',
};

const commitmentStatusLabel: Record<CommitmentDisplayItem['status'], string> = {
  active: 'Vigente',
  completed: 'Cumplido',
  failed: 'Incumplido',
};

const CaseObjectivesPanel: React.FC<CaseObjectivesPanelProps> = ({
  isOpen,
  onToggle,
  hasUnseenUpdates,
  unseenCount,
  activeCase,
  commitments,
  collapsed = false,
  hideHeader = false,
  className = '',
}) => {
  const content = (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-4 pr-2">
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Objetivos</p>
        {!activeCase ? (
          <p className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
            Aun no hay objetivos visibles.
          </p>
        ) : (
          <div className="rounded-xl border border-blue-950/70 bg-slate-950/60 p-3">
            <ul className="space-y-2">
              {activeCase.goals.map((goal) => (
                <li key={goal.goal_id} className="rounded-lg border border-white/10 bg-slate-900/80 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100">{goal.title}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${goalStatusStyles[goal.status]}`}>
                      {goalStatusLabel[goal.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Decisiones</p>
        {commitments.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
            Aun no hay decisiones registradas.
          </p>
        ) : (
          <ul className="space-y-2">
            {commitments.map((commitment) => (
              <li
                key={commitment.expectedActionId}
                className={`rounded-xl border p-3 transition-all duration-300 ${commitmentCardStyles[commitment.status]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-100">{commitment.title}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${commitmentStatusStyles[commitment.status]}`}>
                    {commitmentStatusLabel[commitment.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        aria-label="Abrir objetivos"
        className={`relative w-10 h-10 rounded-2xl border border-amber-300/70 bg-amber-400 text-slate-900 shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:bg-amber-300 ${hasUnseenUpdates ? 'animate-pulse' : ''} ${className}`}
      >
        <span className="text-xs font-semibold tracking-[0.16em]">OBJ</span>
        {unseenCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unseenCount}
          </span>
        )}
      </button>
    );
  }

  if (hideHeader) {
    if (!isOpen) return null;
    return (
      <section className={`w-full rounded-2xl border border-blue-950/80 bg-slate-900/85 shadow-[0_14px_32px_rgba(0,0,0,0.34)] ${className}`}>
        {content}
      </section>
    );
  }

  return (
    <section className={`w-full rounded-2xl border border-blue-950/80 bg-slate-900/85 shadow-[0_14px_32px_rgba(0,0,0,0.34)] ${className}`}>
      <button
        onClick={onToggle}
        className={`relative flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition ${
          isOpen ? 'border-b border-white/10' : ''
        }`}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-amber-200/90">Objetivos</p>
        </div>
        <div className="flex items-center gap-2">
          {unseenCount > 0 && (
            <span className={`inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white ${hasUnseenUpdates ? 'animate-pulse' : ''}`}>
              {unseenCount}
            </span>
          )}
          <span className="text-lg text-amber-300">{isOpen ? '-' : '+'}</span>
        </div>
      </button>

      {isOpen && content}
    </section>
  );
};

export default CaseObjectivesPanel;
