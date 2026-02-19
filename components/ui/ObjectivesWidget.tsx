import React from 'react';
import type { ObjectiveDisplayItem, } from '../../hooks/useObjectivesTracker';
import type { Stakeholder } from '../../types';

interface ObjectivesWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  hasUnseenUpdates: boolean;
  unseenCount: number;
  globalObjectives: ObjectiveDisplayItem[];
  npcObjectives: ObjectiveDisplayItem[];
  stakeholders: Stakeholder[];
}

const statusStyles: Record<ObjectiveDisplayItem['status'], string> = {
  pending: 'bg-gray-500/20 text-gray-200 border-gray-400/30',
  in_progress: 'bg-blue-500/20 text-blue-100 border-blue-300/40',
  completed: 'bg-emerald-500/20 text-emerald-100 border-emerald-300/40',
  failed: 'bg-red-500/20 text-red-100 border-red-300/40',
};

const statusLabel: Record<ObjectiveDisplayItem['status'], string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  failed: 'Fallido',
};

const ObjectivesWidget: React.FC<ObjectivesWidgetProps> = ({
  isOpen,
  onToggle,
  hasUnseenUpdates,
  unseenCount,
  globalObjectives,
  npcObjectives,
  stakeholders,
}) => {
  const getStakeholderName = (stakeholderId?: string) => {
    if (!stakeholderId) return null;
    return stakeholders.find((entry) => entry.id === stakeholderId)?.name ?? stakeholderId;
  };

  const renderObjective = (objective: ObjectiveDisplayItem) => (
    <li
      key={objective.objective_id}
      className="rounded-lg border border-white/10 bg-slate-900/75 p-3 text-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{objective.title}</p>
          {objective.stakeholderId && (
            <p className="mt-0.5 text-xs text-cyan-200/90">
              NPC: {getStakeholderName(objective.stakeholderId)}
            </p>
          )}
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[objective.status]}`}>
          {statusLabel[objective.status]}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-200/90">{objective.description}</p>
    </li>
  );

  return (
    <>
      <button
        onClick={onToggle}
        aria-label="Abrir objetivos"
        title="Objetivos"
        className={`fixed bottom-20 right-6 z-40 h-12 w-12 rounded-full border border-amber-200/70 bg-amber-400 text-slate-900 shadow-[0_10px_24px_rgba(0,0,0,0.38)] transition-all hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 ${
          hasUnseenUpdates ? 'animate-pulse' : ''
        }`}
      >
        <span className="text-xl leading-none">🎯</span>
        {unseenCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unseenCount}
          </span>
        )}
      </button>

      <aside
        className={`fixed bottom-20 right-20 z-40 w-[min(420px,88vw)] rounded-xl border border-white/15 bg-slate-950/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300 ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200/90">Objetivos</p>
            <p className="text-sm text-slate-200">Se actualizan al finalizar secuencias.</p>
          </div>
          <button
            onClick={onToggle}
            className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-200/90">Globales</p>
            {globalObjectives.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-300">
                Aún no hay objetivos globales desbloqueados.
              </p>
            ) : (
              <ul className="space-y-2">{globalObjectives.map(renderObjective)}</ul>
            )}
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-200/90">Por NPC</p>
            {npcObjectives.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-300">
                Aún no hay objetivos de NPC desbloqueados.
              </p>
            ) : (
              <ul className="space-y-2">{npcObjectives.map(renderObjective)}</ul>
            )}
          </section>
        </div>
      </aside>
    </>
  );
};

export default ObjectivesWidget;
