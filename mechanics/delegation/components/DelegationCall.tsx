import React, { useState } from 'react';
import type { ExpectedAction, TimeSlotType } from '../../../types';
import { useMechanicContext } from '../../MechanicContext';
import {
  DELEGATION_MECHANIC_ID,
  DELEGATE_TASK_ACTION_TYPE,
  WEEKLY_DELEGATION_LIMIT,
  countDelegationsInWeek,
  getDelegatedTargetRefs,
  getDelegationWeek,
  getPendingDelegations,
} from '../services/delegationQuota';

interface DelegationCallProps {
  onClose: () => void;
}

const DelegationCall: React.FC<DelegationCallProps> = ({ onClose }) => {
  const { gameState, engine, dispatch, contentPack } = useMechanicContext();
  // Refleja la delegacion al instante mientras el buffer del engine se sincroniza al GameState.
  const [localDelegated, setLocalDelegated] = useState<Set<string>>(new Set());
  // Tarea en confirmacion: muestra el monologo de Sofia antes de cerrar el encargo.
  const [confirmingTask, setConfirmingTask] = useState<ExpectedAction | null>(null);

  const doneRefs = getDelegatedTargetRefs(gameState.canonicalActions);
  const pending = getPendingDelegations(gameState).filter((task) => !localDelegated.has(task.target_ref));
  const pendingLocalCount = [...localDelegated].filter((ref) => !doneRefs.has(ref)).length;
  const usedThisWeek = countDelegationsInWeek(gameState.canonicalActions, gameState.day) + pendingLocalCount;
  const remaining = Math.max(0, WEEKLY_DELEGATION_LIMIT - usedThisWeek);

  const morningSlot = (contentPack.defaults.timeSlots[0] ?? 'mañana') as TimeSlotType;

  const taskContent = (targetRef: string) => contentPack.delegationTasks?.[targetRef];

  const confirmDelegation = (task: ExpectedAction) => {
    const content = taskContent(task.target_ref);

    engine.emitCanonicalAction(
      DELEGATION_MECHANIC_ID,
      DELEGATE_TASK_ACTION_TYPE,
      task.target_ref,
      {
        day: gameState.day,
        time_slot: gameState.timeSlot,
        summary: `Delegacion a Sofia: ${task.ui?.title ?? task.target_ref}`,
        source_node_id: task.source?.node_id ?? null,
        source_option_id: task.source?.option_id ?? null,
        mechanic_payload: {
          task_target_ref: task.target_ref,
          task_title: task.ui?.title ?? null,
          task_description: task.ui?.description ?? null,
          related_stakeholder_id: task.stakeholder_id ?? null,
          delegated_day: gameState.day,
          delegated_week: getDelegationWeek(gameState.day),
        },
      },
      { day: gameState.day, time_slot: gameState.timeSlot }
    );
    engine.emitEvent(DELEGATION_MECHANIC_ID, 'task_delegated', {
      target_ref: task.target_ref,
      day: gameState.day,
    });

    // Correo de confirmacion de Sofia ~1 dia despues.
    if (content?.confirmationEmailEventId) {
      dispatch({
        type: 'schedule_email_event',
        event_id: content.confirmationEmailEventId,
        day: gameState.day + 1,
        slot: morningSlot,
      });
    }

    setLocalDelegated((prev) => new Set(prev).add(task.target_ref));
    setConfirmingTask(null);
  };

  // --- Vista: monologo de Sofia (globo rectangular + "Siguiente") ---
  if (confirmingTask) {
    const content = taskContent(confirmingTask.target_ref);
    const monologue =
      content?.monologue ??
      'Entendido, director. Me hago cargo de esta gestión y le informaré apenas tenga novedades.';
    const secretary = gameState.stakeholders.find((s) => s.id === 'sofia-castro');

    return (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm animate-fade-in">
        <div className="bg-gray-900 border-4 border-gray-700 rounded-3xl p-6 w-96 max-h-[560px] flex flex-col shadow-2xl relative">
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-full"></div>

          <div className="mt-8 flex items-center gap-3">
            {secretary?.portraitUrl && (
              <img src={secretary.portraitUrl} className="w-12 h-12 rounded-full object-cover border border-cyan-500/60" />
            )}
            <div>
              <h3 className="text-white text-lg font-bold leading-tight">Sofía Castro</h3>
              <p className="text-xs text-gray-400">Asistente Administrativa</p>
            </div>
          </div>

          <div className="mt-4 flex-grow overflow-y-auto rounded-xl border border-gray-600 bg-gray-800 p-4 text-sm leading-relaxed text-gray-100 whitespace-pre-line">
            {monologue}
          </div>

          <button
            onClick={() => confirmDelegation(confirmingTask)}
            className="mt-4 self-center rounded-full bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 font-bold shadow-lg transition-transform hover:scale-105"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  // --- Vista: lista de tareas delegables ---
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border-4 border-gray-700 rounded-3xl p-6 w-96 max-h-[560px] flex flex-col shadow-2xl relative">
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-full"></div>

        <div className="mt-8 mb-2 text-center">
          <h3 className="text-white text-xl font-bold">Sofía Castro</h3>
          <p className="text-xs text-gray-400">Asistente Administrativa</p>
        </div>

        <div className="mb-3 rounded-lg border border-cyan-900/60 bg-cyan-950/30 p-3 text-xs leading-relaxed text-cyan-100">
          {remaining > 0
            ? `"Puedo encargarme de hasta ${WEEKLY_DELEGATION_LIMIT} tareas por semana, director. Esta semana me quedan ${remaining}."`
            : `"Esta semana ya tomé ${WEEKLY_DELEGATION_LIMIT} encargos suyos, director. Lo demás tendrá que esperar a la próxima semana."`}
        </div>

        <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {pending.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No tiene tareas pendientes por delegar.</p>
          ) : (
            pending.map((task) => (
              <div key={task.expected_action_id} className="rounded-xl border border-gray-700 bg-gray-800 p-3">
                <p className="text-sm font-bold text-gray-100">{task.ui?.title ?? task.target_ref}</p>
                {task.ui?.description && <p className="text-xs text-gray-400 mt-1">{task.ui.description}</p>}
                <button
                  onClick={() => setConfirmingTask(task)}
                  disabled={remaining <= 0}
                  className={`mt-2 w-full rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                    remaining <= 0
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}
                >
                  Delegar a Sofía
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 bg-red-600 hover:bg-red-500 text-white rounded-full p-3 self-center shadow-lg transition-transform hover:scale-105"
        >
          <span className="font-bold text-sm px-4">Colgar / Salir</span>
        </button>
      </div>
    </div>
  );
};

export default DelegationCall;
