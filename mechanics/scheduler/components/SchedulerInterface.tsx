import React, { useMemo, useState } from 'react';
import { ActivityType, DayOfWeek, GameState, ScheduleAssignment, ScheduleBlock } from '../../../types';
import { DAYS_OF_WEEK, SCHEDULE_BLOCKS } from '../../../constants';
import { useMechanicContext } from '../../MechanicContext';
import { getPhysicalConflictData } from '../services/scheduleConflicts';
import { buildSchedulerExecuteWeekValueFinal } from '../services/scheduleCanonicalExport';
import CesfamMapVisual from '../../shared/components/CesfamMapVisual';
import { getStaffLoad } from '../../../services/scheduleLoad';

// Umbral de bienestar (ISP): carga clinica directa por sobre este % se considera riesgo de sobrecarga.
const CLINICAL_LOAD_RISK_THRESHOLD = 60;

interface SchedulerInterfaceProps {
    gameState: GameState;
    onUpdateSchedule: (newSchedule: ScheduleAssignment[]) => void;
    onExecuteWeek: () => void;
    executeLabel?: string;
    canExecuteWeek?: boolean;
    executeDisabledReason?: string | null;
    canEditSchedule?: boolean;
    editDisabledReason?: string | null;
}

// La sala destino determina la actividad (inverso de resolveRoomId del modal anterior).
const getActivityForRoom = (roomId: string): ActivityType => {
    if (roomId === 'OFICINA_TECNICA') return 'ADMIN';
    if (roomId === 'TERRENO') return 'TERRAIN';
    if (roomId === 'AREA_COMUN') return 'TRAINING';
    return 'CLINICAL';
};

const SchedulerInterface: React.FC<SchedulerInterfaceProps> = ({
    gameState,
    onUpdateSchedule,
    onExecuteWeek,
    executeLabel = 'Ejecutar semana',
    canExecuteWeek = true,
    executeDisabledReason,
    canEditSchedule = true,
    editDisabledReason,
}) => {
    const { engine } = useMechanicContext();
    const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; block: ScheduleBlock } | null>(null);
    const [draftSchedule, setDraftSchedule] = useState<ScheduleAssignment[] | null>(null);
    const [hoveredStaffId, setHoveredStaffId] = useState<string | null>(null);

    const conflictBlockKeys = useMemo(() => {
        const { groups } = getPhysicalConflictData(gameState.weeklySchedule);
        return new Set(groups.map(group => `${group.day}|${group.block}`));
    }, [gameState.weeklySchedule]);

    const openSlot = (day: DayOfWeek, block: ScheduleBlock) => {
        setSelectedSlot({ day, block });
        setDraftSchedule(gameState.weeklySchedule.map(assignment => ({ ...assignment })));
    };

    const closeSlot = () => {
        setSelectedSlot(null);
        setDraftSchedule(null);
    };

    const handleStaffDrop = (staffId: string, roomId: string) => {
        if (!selectedSlot || !canEditSchedule) return;
        setDraftSchedule(prev => {
            const base = prev ?? gameState.weeklySchedule;
            return base.map(assignment => {
                if (
                    assignment.staffId !== staffId ||
                    assignment.day !== selectedSlot.day ||
                    assignment.block !== selectedSlot.block
                ) {
                    return assignment;
                }
                return { ...assignment, activity: getActivityForRoom(roomId), roomId };
            });
        });
    };

    const handleSaveAssignment = () => {
        if (!draftSchedule) return;
        onUpdateSchedule(draftSchedule);
        engine.emitEvent('scheduler', 'schedule_updated', { assignment_count: draftSchedule.length });
        closeSlot();
    };

    const handleExecuteWeek = () => {
        const submittedAtMs = Date.now();
        engine.emitCanonicalAction(
            'scheduler',
            'execute_week',
            'global',
            buildSchedulerExecuteWeekValueFinal(gameState, submittedAtMs),
            { day: gameState.day, time_slot: gameState.timeSlot }
        );
        onExecuteWeek();
    };

    const isExecuteDisabled = !canExecuteWeek;

    if (selectedSlot) {
        const mapSchedule = draftSchedule ?? gameState.weeklySchedule;
        return (
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-fade-in h-full flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Asignación de salas</p>
                        <h2 className="text-3xl font-bold text-blue-300 mt-1">CESFAM · {selectedSlot.day} {selectedSlot.block}</h2>
                        <p className="text-gray-400">Arrastra a cada funcionario hacia su sala. Las salas en choque parpadean en amarillo.</p>
                        {!canEditSchedule && editDisabledReason && (
                            <p className="mt-2 text-sm font-medium text-amber-300">{editDisabledReason}</p>
                        )}
                    </div>

                    {(() => {
                        const atRiskCount = gameState.staffRoster.filter((staff) => {
                            const staffLoad = getStaffLoad(mapSchedule, staff.id);
                            return staffLoad.totalBlocks > 0 && staffLoad.clinicalPct >= CLINICAL_LOAD_RISK_THRESHOLD;
                        }).length;
                        const hoveredStaff = hoveredStaffId
                            ? gameState.staffRoster.find((staff) => staff.id === hoveredStaffId)
                            : undefined;
                        const load = hoveredStaff ? getStaffLoad(mapSchedule, hoveredStaff.id) : null;

                        return (
                            <div className="w-64 shrink-0 self-center rounded-lg border border-white/15 bg-slate-950/70 p-3">
                                {hoveredStaff && load ? (
                                    <>
                                        <p className="mb-1 truncate text-[11px] font-bold text-white" title={hoveredStaff.name}>{hoveredStaff.name}</p>
                                        <p className="mb-1.5 text-[9px] uppercase tracking-wider text-slate-400">Balance de jornada</p>
                                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                                            <div className="h-full bg-orange-500 transition-all" style={{ width: `${load.clinicalPct}%` }} />
                                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${load.adminPct}%` }} />
                                        </div>
                                        <div className="mt-1 flex justify-between text-[10px] font-semibold">
                                            <span className="text-orange-300">Clínica {Math.round(load.clinicalPct)}%</span>
                                            <span className="text-blue-300">Admin {Math.round(load.adminPct)}%</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-400">Balance de carga</p>
                                        <p className={`text-[11px] font-bold ${atRiskCount > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                                            {atRiskCount > 0
                                                ? `${atRiskCount} funcionario${atRiskCount > 1 ? 's' : ''} en riesgo`
                                                : 'Sin sobrecargas'}
                                        </p>
                                        <p className="mt-1 text-[9px] leading-snug text-slate-400">Pasa el mouse sobre un funcionario para ver su jornada (clínica ≤ 60% recomendado).</p>
                                    </>
                                )}
                            </div>
                        );
                    })()}

                    <button
                        onClick={closeSlot}
                        className="shrink-0 self-center rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-400 hover:text-white"
                    >
                        Volver
                    </button>
                </div>

                <div className="flex-grow min-h-[360px]">
                    <CesfamMapVisual
                        weeklySchedule={mapSchedule}
                        staffRoster={gameState.staffRoster}
                        stakeholders={gameState.stakeholders}
                        viewDay={selectedSlot.day}
                        viewBlock={selectedSlot.block}
                        draggable={canEditSchedule}
                        onStaffDrop={handleStaffDrop}
                        animatedConflict
                        npcHover
                        showLoadBar
                        onHoverStaffChange={setHoveredStaffId}
                        showNames={false}
                        compactOccupants
                        className="h-full"
                    />
                </div>

                {canEditSchedule && (
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={closeSlot} className="px-4 py-2 text-gray-300 transition hover:text-white">Cancelar</button>
                        <button
                            onClick={handleSaveAssignment}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Guardar Asignación
                        </button>
                    </div>
                )}

                <style>{`
                    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                    .animate-fade-in { animation: fade-in 0.35s ease-in forwards; }
                `}</style>
            </div>
        );
    }

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-fade-in h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-blue-300">Planificación Semanal</h2>
                <p className="text-gray-400">Selecciona un bloque para asignar las salas. Los bloques con choque parpadean en rojo.</p>
            </div>

            <div className="flex-grow">
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `72px repeat(${DAYS_OF_WEEK.length}, minmax(0, 1fr))` }}
                >
                    <div></div>
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-300 pb-1">
                            {day}
                        </div>
                    ))}

                    {SCHEDULE_BLOCKS.map(block => (
                        <React.Fragment key={block}>
                            <div className="flex items-center justify-center text-sm font-bold text-gray-400">
                                {block}
                            </div>
                            {DAYS_OF_WEEK.map(day => {
                                const hasConflict = conflictBlockKeys.has(`${day}|${block}`);
                                return (
                                    <button
                                        key={`${day}-${block}`}
                                        onClick={() => openSlot(day, block)}
                                        className={`h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-1 font-semibold transition-all hover:scale-[1.03] ${
                                            hasConflict
                                                ? 'border-red-400 text-red-100 animate-conflict-glow-red'
                                                : 'border-gray-700 bg-gray-900/50 text-gray-300 hover:border-gray-500'
                                        }`}
                                        title={`${day} ${block}${hasConflict ? ' · Choque detectado' : ''}`}
                                    >
                                        {hasConflict ? (
                                            <span className="text-xs font-bold uppercase tracking-wide">Choque</span>
                                        ) : (
                                            <span className="text-xs text-gray-500">Asignar</span>
                                        )}
                                    </button>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-4 items-center">
                {executeDisabledReason && (
                    <p className="text-sm font-bold text-amber-300">{executeDisabledReason}</p>
                )}
                <button
                    onClick={handleExecuteWeek}
                    disabled={isExecuteDisabled}
                    className={`font-bold py-3 px-8 rounded-lg shadow-lg transform transition flex items-center gap-2 ${
                        isExecuteDisabled ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-500 hover:scale-105 text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {executeLabel}
                </button>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-in forwards; }
                @keyframes conflict-glow-red {
                    0%, 100% { box-shadow: 0 0 8px 1px rgba(239,68,68,0.5); background-color: rgba(127,29,29,0.55); }
                    50% { box-shadow: 0 0 22px 6px rgba(239,68,68,0.95); background-color: rgba(185,28,28,0.8); }
                }
                .animate-conflict-glow-red { animation: conflict-glow-red 1s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default SchedulerInterface;
