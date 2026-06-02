import React, { useState } from 'react';
import type { ExpectedAction, TimeSlotType } from '../../types';
import { useMechanicContext } from '../MechanicContext';
import { SECRETARY_ROLE } from '../../constants';
import {
  DELEGATION_MECHANIC_ID,
  DELEGATE_TASK_ACTION_TYPE,
  WEEKLY_DELEGATION_LIMIT,
  countDelegationsInWeek,
  getDelegatedTargetRefs,
  getDelegationWeek,
  getPendingDelegations,
} from '../delegation/services/delegationQuota';

interface PhoneMechanicProps {
  // Si se entrega, el telefono se comporta como overlay (con boton de salir).
  onClose?: () => void;
}

const GREETING = 'Dígame, director. ¿En qué puedo ayudarle?';

const secretaryPhonePortraitClass =
  'absolute left-1/2 top-1/2 h-auto w-[300%] max-w-none -translate-x-1/2 -translate-y-[20%]';

const PhoneMechanic: React.FC<PhoneMechanicProps> = ({ onClose }) => {
  const { gameState, engine, dispatch, contentPack } = useMechanicContext();
  const [inCall, setInCall] = useState(false);
  const [balloonText, setBalloonText] = useState(GREETING);
  const [localDelegated, setLocalDelegated] = useState<Set<string>>(new Set());

  const secretary = gameState.stakeholders.find((s) => s.role === SECRETARY_ROLE);
  const questions = (secretary && contentPack.questions?.[secretary.id]) || [];
  const morningSlot = (contentPack.defaults.timeSlots[0] ?? 'mañana') as TimeSlotType;

  const doneRefs = getDelegatedTargetRefs(gameState.canonicalActions);
  const pending = getPendingDelegations(gameState).filter((t) => !localDelegated.has(t.target_ref));
  const pendingLocalCount = [...localDelegated].filter((ref) => !doneRefs.has(ref)).length;
  const usedThisWeek = countDelegationsInWeek(gameState.canonicalActions, gameState.day) + pendingLocalCount;
  const remaining = Math.max(0, WEEKLY_DELEGATION_LIMIT - usedThisWeek);

  const taskContent = (ref: string) => contentPack.delegationTasks?.[ref];

  const startCall = () => {
    setInCall(true);
    setBalloonText(GREETING);
  };

  const endCall = () => {
    setInCall(false);
    setBalloonText(GREETING);
  };

  const askQuestion = (questionId: string, answer: string) => {
    setBalloonText(answer);
    engine.emitEvent('phone', 'question_asked', { question_id: questionId, day: gameState.day });
  };

  const delegateTask = (task: ExpectedAction) => {
    if (remaining <= 0) {
      setBalloonText(
        `Esta semana ya tomé ${WEEKLY_DELEGATION_LIMIT} encargos suyos, director. Lo demás tendrá que esperar a la próxima semana.`
      );
      return;
    }
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
    engine.emitEvent(DELEGATION_MECHANIC_ID, 'task_delegated', { target_ref: task.target_ref, day: gameState.day });
    if (content?.confirmationEmailEventId) {
      dispatch({
        type: 'schedule_email_event',
        event_id: content.confirmationEmailEventId,
        day: gameState.day + 1,
        slot: morningSlot,
      });
    }
    setBalloonText(
      content?.monologue ?? 'Entendido, director. Me hago cargo y le informaré apenas tenga novedades.'
    );
    setLocalDelegated((prev) => new Set(prev).add(task.target_ref));
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      {/* Telefono: un solo contacto (Sofia) */}
      <div className="relative flex h-[560px] w-[300px] flex-col overflow-hidden rounded-[2.5rem] border-[10px] border-gray-800 bg-gray-950 shadow-2xl">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-gray-800" />
        {onClose && (
          <button
            onClick={onClose}
            title="Salir"
            className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-gray-800/80 text-gray-300 transition-colors hover:bg-red-600 hover:text-white"
          >
            ✕
          </button>
        )}

        {inCall && secretary ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-cyan-400/70 shadow-lg">
              <img src={secretary.portraitUrl} alt={secretary.name} className={secretaryPhonePortraitClass} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{secretary.name}</p>
              <p className="text-xs text-cyan-300">En llamada…</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-center gap-3 p-5 pt-10">
            <p className="text-center text-xs uppercase tracking-widest text-gray-500">Contacto</p>
            {secretary && (
              <button
                onClick={startCall}
                className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3 text-left transition-all hover:border-cyan-400 hover:bg-cyan-900/30"
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-500">
                  <img src={secretary.portraitUrl} alt={secretary.name} className={secretaryPhonePortraitClass} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-100">{secretary.name}</p>
                  <p className="text-xs text-gray-500">{secretary.role}</p>
                </div>
                <span className="ml-auto text-xl">📞</span>
              </button>
            )}
          </div>
        )}

        {inCall && (
          <button
            onClick={endCall}
            className="m-4 self-center rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-red-500"
          >
            Colgar
          </button>
        )}
      </div>

      {/* Globo de dialogo + preguntas/encargos a la derecha, fuera del telefono */}
      {inCall && (
        <div className="relative ml-5 w-80 self-center">
          <div className="absolute -left-2 top-10 h-4 w-4 rotate-45 border-b border-l border-gray-600 bg-gray-800" />
          <div className="rounded-2xl border border-gray-600 bg-gray-800 p-4 shadow-xl">
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-100">{balloonText}</p>
          </div>

          {/* Preguntas predeterminadas + encargos (compromisos activos) */}
          <div className="mt-3 flex flex-col gap-2">
            {questions.map((q) => (
              <button
                key={q.question_id}
                onClick={() => askQuestion(q.question_id, q.answer)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:border-cyan-500 hover:text-white"
              >
                {q.text}
              </button>
            ))}
            {pending.map((task) => (
              <button
                key={task.expected_action_id}
                onClick={() => delegateTask(task)}
                className="flex items-center gap-2 rounded-lg border border-amber-600/60 bg-amber-950/30 px-3 py-2 text-left text-sm font-semibold text-amber-100 transition-colors hover:border-amber-400 hover:bg-amber-900/40"
              >
                <span>📋</span>
                <span>{task.ui?.title ?? task.target_ref}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneMechanic;
