import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActivityType, DayOfWeek, GameState, ScheduleAssignment, ScheduleBlock, StaffMember } from '../types';
import { CESFAM_ROOMS, DAYS_OF_WEEK, SCHEDULE_BLOCKS } from '../constants';
import { useMechanicContext } from '../mechanics/MechanicContext';
import CesfamMapVisual from './CesfamMapVisual';

interface SchedulerInterfaceProps {
    gameState: GameState;
    onUpdateSchedule: (newSchedule: ScheduleAssignment[]) => void;
    onExecuteWeek: () => void;
}

type SectorId = StaffMember['sectorId'];

interface PhysicalConflictGroup {
    key: string;
    day: DayOfWeek;
    block: ScheduleBlock;
    roomId: string;
    staffIds: string[];
    cellKeys: string[];
}

interface OverlayRect {
    key: string;
    x: number;
    y: number;
    width: number;
    height: number;
    cx: number;
    cy: number;
}

interface OverlayLine {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface OverlayGeometry {
    width: number;
    height: number;
    rects: OverlayRect[];
    lines: OverlayLine[];
}

interface AssignmentOverlayProps {
    staff: StaffMember;
    day: DayOfWeek;
    block: ScheduleBlock;
    selectedActivity: ActivityType;
    selectedRoomId?: string;
    resolvedRoomId: string;
    hasConflict: boolean;
    onActivityChange: (activity: ActivityType) => void;
    onRoomChange: (roomId?: string) => void;
    onSave: () => void;
    onClose: () => void;
    previewContent: React.ReactNode;
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
    CLINICAL: 'bg-red-600 hover:bg-red-500',
    ADMIN: 'bg-blue-600 hover:bg-blue-500',
    TERRAIN: 'bg-green-600 hover:bg-green-500',
    TRAINING: 'bg-yellow-600 hover:bg-yellow-500',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
    CLINICAL: 'Atención Clínica',
    ADMIN: 'Trabajo Administrativo',
    TERRAIN: 'Terreno',
    TRAINING: 'Capacitación',
};

const NON_CONFLICT_ROOMS = new Set(['TERRENO', 'AREA_COMUN', 'OFICINA_TECNICA']);
const SECTOR_ORDER: SectorId[] = ['AZUL', 'ROJO', 'AMARILLO'];
const SCHEDULE_COLUMN_COUNT = DAYS_OF_WEEK.length * SCHEDULE_BLOCKS.length;

const SECTOR_META: Record<SectorId, { shortLabel: string; title: string; headerClass: string; verticalClass: string }> = {
    AZUL: {
        shortLabel: 'AZUL',
        title: 'Sector Azul',
        headerClass: 'bg-sky-950/35 border-sky-500/30 text-sky-100',
        verticalClass: 'bg-sky-950/55 text-sky-200 border-sky-500/30',
    },
    ROJO: {
        shortLabel: 'ROJO',
        title: 'Sector Rojo',
        headerClass: 'bg-rose-950/35 border-rose-500/30 text-rose-100',
        verticalClass: 'bg-rose-950/55 text-rose-200 border-rose-500/30',
    },
    AMARILLO: {
        shortLabel: 'AMARILLO',
        title: 'Sector Amarillo',
        headerClass: 'bg-amber-950/35 border-amber-500/30 text-amber-100',
        verticalClass: 'bg-amber-950/55 text-amber-200 border-amber-500/30',
    },
};

const getDefaultClinicalRoom = (staff: StaffMember): string => {
    if (staff.sectorId === 'AZUL') return 'BOX_1';
    if (staff.sectorId === 'ROJO') return 'BOX_4';
    return 'BOX_7';
};

const resolveRoomId = (staff: StaffMember, activity: ActivityType, selectedRoomId?: string): string => {
    if (activity === 'ADMIN') return 'OFICINA_TECNICA';
    if (activity === 'TERRAIN') return 'TERRENO';
    if (activity === 'TRAINING') return 'AREA_COMUN';
    return selectedRoomId || getDefaultClinicalRoom(staff);
};

const getPhysicalConflictData = (schedule: ScheduleAssignment[]) => {
    const usageMap = new Map<string, ScheduleAssignment[]>();
    const conflictedCellKeys = new Set<string>();

    schedule.forEach(assign => {
        if (!assign.roomId || NON_CONFLICT_ROOMS.has(assign.roomId)) return;
        const key = `${assign.day}|${assign.block}|${assign.roomId}`;
        const entries = usageMap.get(key) ?? [];
        entries.push(assign);
        usageMap.set(key, entries);
    });

    const groups: PhysicalConflictGroup[] = [];

    usageMap.forEach((assignments, key) => {
        if (assignments.length <= 1) return;

        const [day, block, roomId] = key.split('|');
        const cellKeys = assignments.map(assign => `${assign.staffId}-${assign.day}-${assign.block}`);
        cellKeys.forEach(cellKey => conflictedCellKeys.add(cellKey));

        groups.push({
            key,
            day: day as DayOfWeek,
            block: block as ScheduleBlock,
            roomId,
            staffIds: assignments.map(assign => assign.staffId),
            cellKeys,
        });
    });

    return { groups, conflictedCellKeys };
};

const AssignmentOverlay: React.FC<AssignmentOverlayProps> = ({
    staff,
    day,
    block,
    selectedActivity,
    selectedRoomId,
    resolvedRoomId,
    hasConflict,
    onActivityChange,
    onRoomChange,
    onSave,
    onClose,
    previewContent,
}) => {
    const availableBoxes = CESFAM_ROOMS.filter(room => room.id.startsWith('BOX'));
    const resolvedRoom = CESFAM_ROOMS.find(room => room.id === resolvedRoomId);
    const selectedBox = availableBoxes.find(room => room.id === selectedRoomId);
    const isOutsideSector = selectedActivity === 'CLINICAL' && !!selectedBox && selectedBox.sector !== staff.sectorId;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 lg:p-6 animate-fade-in">
            <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 lg:grid lg:grid-cols-[minmax(420px,500px)_minmax(0,1fr)]">
                <div className="bg-gray-800 rounded-2xl border border-gray-600 shadow-2xl overflow-hidden animate-slide-in-left">
                    <div className="border-b border-gray-700 bg-gray-900/70 px-6 py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Asignación</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{staff.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">{day} · {block}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full border border-gray-600 px-3 py-1 text-sm text-gray-300 transition hover:border-gray-400 hover:text-white"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 p-6">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-3">Actividad</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map(activity => (
                                    <button
                                        key={activity}
                                        onClick={() => onActivityChange(activity)}
                                        className={`p-3 rounded-lg text-sm font-bold border-2 transition-all ${
                                            selectedActivity === activity
                                                ? `border-white ${ACTIVITY_COLORS[activity]}`
                                                : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-500'
                                        }`}
                                    >
                                        {ACTIVITY_LABELS[activity]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedActivity === 'CLINICAL' && (
                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Asignar Box</label>
                                <select
                                    value={selectedRoomId || ''}
                                    onChange={(e) => onRoomChange(e.target.value || undefined)}
                                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Usar box sugerido del sector</option>
                                    {availableBoxes.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.name} {room.sector === staff.sectorId ? '(Sector)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {isOutsideSector && (
                                    <p className="text-xs text-yellow-400 mt-2">Advertencia: está asignando un box fuera de su sector.</p>
                                )}
                            </div>
                        )}

                        {selectedActivity !== 'CLINICAL' && (
                            <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3 text-sm text-gray-300">
                                Esta actividad usa automáticamente <span className="font-bold text-white">{resolvedRoom?.name ?? resolvedRoomId}</span>.
                            </div>
                        )}

                        <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/30 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80 mb-2">Previsualización</p>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-lg font-bold text-white">{resolvedRoom?.name ?? resolvedRoomId}</p>
                                    <p className="text-sm text-gray-400">El mapa refleja este bloque antes de guardar.</p>
                                </div>
                                {hasConflict && (
                                    <span className="rounded-full border border-red-500/70 bg-red-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-200 animate-pulse">
                                        Choque detectado
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-700 bg-gray-900/50 px-6 py-4">
                        <button onClick={onClose} className="px-4 py-2 text-gray-300 transition hover:text-white">Cancelar</button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Guardar Asignación
                        </button>
                    </div>
                </div>

                <div className="min-h-[360px] rounded-2xl border border-gray-700 bg-gray-800/90 shadow-2xl overflow-hidden animate-slide-in-right">
                    <div className="border-b border-gray-700 bg-gray-900/70 px-6 py-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Mapa de previsualización</p>
                        <div className="mt-2 flex items-center justify-between gap-4">
                            <div>
                                <h4 className="text-2xl font-bold text-white">CESFAM · {day} {block}</h4>
                                <p className="text-sm text-gray-400">Vista solo lectura del bloque seleccionado.</p>
                            </div>
                            <span className="rounded-full border border-gray-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-300">
                                Cambios sin guardar
                            </span>
                        </div>
                    </div>
                    <div className="h-[calc(100%-97px)] p-4 lg:p-5">
                        {previewContent}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in { animation: fade-in 0.25s ease-out forwards; }
                .animate-slide-in-left { animation: slide-in-left 0.32s ease-out forwards; }
                .animate-slide-in-right { animation: slide-in-right 0.36s ease-out forwards; }
            `}</style>
        </div>
    );
};

const SchedulerInterface: React.FC<SchedulerInterfaceProps> = ({ gameState, onUpdateSchedule, onExecuteWeek }) => {
    const { engine } = useMechanicContext();
    const [editingCell, setEditingCell] = useState<{ staffId: string; day: DayOfWeek; block: ScheduleBlock } | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
    const [conflictOverlayGeometry, setConflictOverlayGeometry] = useState<OverlayGeometry>({
        width: 0,
        height: 0,
        rects: [],
        lines: [],
    });

    const tableWrapperRef = useRef<HTMLDivElement | null>(null);
    const tableRef = useRef<HTMLTableElement | null>(null);
    const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const staffBySector = useMemo(
        () => SECTOR_ORDER.map(sector => ({
            sector,
            staff: gameState.staffRoster.filter(member => member.sectorId === sector),
        })),
        [gameState.staffRoster]
    );

    const { groups: physicalConflictGroups, conflictedCellKeys } = useMemo(
        () => getPhysicalConflictData(gameState.weeklySchedule),
        [gameState.weeklySchedule]
    );

    const currentEditingStaff = useMemo(
        () => editingCell ? gameState.staffRoster.find(staff => staff.id === editingCell.staffId) ?? null : null,
        [editingCell, gameState.staffRoster]
    );

    const resolvedPreviewRoomId = useMemo(() => {
        if (!currentEditingStaff || !selectedActivity) return undefined;
        return resolveRoomId(currentEditingStaff, selectedActivity, selectedRoomId);
    }, [currentEditingStaff, selectedActivity, selectedRoomId]);

    const previewSchedule = useMemo(() => {
        if (!editingCell || !currentEditingStaff || !selectedActivity || !resolvedPreviewRoomId) {
            return gameState.weeklySchedule;
        }

        return gameState.weeklySchedule.map(assignment => {
            if (
                assignment.staffId !== editingCell.staffId ||
                assignment.day !== editingCell.day ||
                assignment.block !== editingCell.block
            ) {
                return assignment;
            }

            return {
                ...assignment,
                activity: selectedActivity,
                roomId: resolvedPreviewRoomId,
            };
        });
    }, [currentEditingStaff, editingCell, gameState.weeklySchedule, resolvedPreviewRoomId, selectedActivity]);

    const previewConflictData = useMemo(
        () => getPhysicalConflictData(previewSchedule),
        [previewSchedule]
    );

    const previewHasSelectedConflict = !!(
        editingCell && previewConflictData.conflictedCellKeys.has(`${editingCell.staffId}-${editingCell.day}-${editingCell.block}`)
    );

    useLayoutEffect(() => {
        const wrapper = tableWrapperRef.current;
        const table = tableRef.current;
        if (!wrapper || !table) return;

        let frameId = 0;

        const updateOverlay = () => {
            frameId = 0;

            const wrapperRect = wrapper.getBoundingClientRect();
            const width = Math.max(wrapper.scrollWidth, table.offsetWidth);
            const height = Math.max(wrapper.scrollHeight, table.offsetHeight);
            const rects: OverlayRect[] = [];
            const lines: OverlayLine[] = [];

            physicalConflictGroups.forEach(group => {
                const groupRects = group.cellKeys
                    .map(cellKey => {
                        const element = cellRefs.current[cellKey];
                        if (!element) return null;

                        const rect = element.getBoundingClientRect();
                        const x = rect.left - wrapperRect.left - 4;
                        const y = rect.top - wrapperRect.top - 4;
                        const paddedWidth = rect.width + 8;
                        const paddedHeight = rect.height + 8;

                        return {
                            key: `${group.key}-${cellKey}`,
                            x,
                            y,
                            width: paddedWidth,
                            height: paddedHeight,
                            cx: x + (paddedWidth / 2),
                            cy: y + (paddedHeight / 2),
                        };
                    })
                    .filter((rect): rect is OverlayRect => rect !== null)
                    .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

                rects.push(...groupRects);

                if (groupRects.length === 2) {
                    lines.push({
                        key: `${group.key}-line-0`,
                        x1: groupRects[0].cx,
                        y1: groupRects[0].cy,
                        x2: groupRects[1].cx,
                        y2: groupRects[1].cy,
                    });
                    return;
                }

                if (groupRects.length > 2) {
                    const [anchor, ...rest] = groupRects;
                    rest.forEach((rect, index) => {
                        lines.push({
                            key: `${group.key}-line-${index}`,
                            x1: anchor.cx,
                            y1: anchor.cy,
                            x2: rect.cx,
                            y2: rect.cy,
                        });
                    });
                }
            });

            setConflictOverlayGeometry({ width, height, rects, lines });
        };

        const scheduleUpdate = () => {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(updateOverlay);
        };

        scheduleUpdate();

        const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null;
        resizeObserver?.observe(wrapper);
        resizeObserver?.observe(table);
        window.addEventListener('resize', scheduleUpdate);

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', scheduleUpdate);
        };
    }, [physicalConflictGroups, staffBySector, gameState.weeklySchedule]);

    const handleCellClick = (staffId: string, day: DayOfWeek, block: ScheduleBlock) => {
        const assignment = gameState.weeklySchedule.find(item => item.staffId === staffId && item.day === day && item.block === block);
        setEditingCell({ staffId, day, block });
        setSelectedActivity(assignment?.activity ?? 'CLINICAL');
        setSelectedRoomId(assignment?.activity === 'CLINICAL' ? assignment.roomId : undefined);
    };

    const closeEditor = () => {
        setEditingCell(null);
        setSelectedActivity(null);
        setSelectedRoomId(undefined);
    };

    const handleSaveAssignment = () => {
        if (!editingCell || !currentEditingStaff || !selectedActivity) return;

        const finalRoomId = resolveRoomId(currentEditingStaff, selectedActivity, selectedRoomId);
        const newSchedule = gameState.weeklySchedule.map(assignment => {
            if (
                assignment.staffId !== editingCell.staffId ||
                assignment.day !== editingCell.day ||
                assignment.block !== editingCell.block
            ) {
                return assignment;
            }

            return {
                ...assignment,
                activity: selectedActivity,
                roomId: finalRoomId,
            };
        });

        onUpdateSchedule(newSchedule);
        engine.emitEvent('scheduler', 'schedule_updated', { assignment_count: newSchedule.length });
        closeEditor();
    };

    const handleExecuteWeek = () => {
        const normalizedWeekSchedule = gameState.weeklySchedule.map(assignment => ({
            staff_id: assignment.staffId,
            day: assignment.day,
            block: assignment.block,
            activity: assignment.activity,
            room_id: assignment.roomId ?? null,
        }));

        engine.emitCanonicalAction(
            'scheduler',
            'execute_week',
            'global',
            { week_schedule: normalizedWeekSchedule },
            { day: gameState.day, time_slot: gameState.timeSlot }
        );
        onExecuteWeek();
    };

    const getAssignment = (staffId: string, day: DayOfWeek, block: ScheduleBlock) =>
        gameState.weeklySchedule.find(a => a.staffId === staffId && a.day === day && a.block === block);

    const calculateLoad = (staff: StaffMember): { burnout: number; hoursAssigned: number } => {
        const assignments = gameState.weeklySchedule.filter(a => a.staffId === staff.id);
        const clinicalCount = assignments.filter(a => a.activity === 'CLINICAL').length;
        const terrainCount = assignments.filter(a => a.activity === 'TERRAIN').length;
        const trainingCount = assignments.filter(a => a.activity === 'TRAINING').length;
        const adminCount = assignments.filter(a => a.activity === 'ADMIN').length;

        const totalBlocks = clinicalCount + terrainCount + trainingCount + adminCount;
        const hoursAssigned = totalBlocks * 4.4;
        const projectedBurnout = staff.burnout + (clinicalCount * 5) + (terrainCount * 2) - (trainingCount * 5);

        return {
            burnout: Math.max(0, Math.min(100, projectedBurnout)),
            hoursAssigned,
        };
    };

    const hasCriticalConflicts = conflictedCellKeys.size > 0;

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-fade-in h-full flex flex-col relative">
            {editingCell && currentEditingStaff && selectedActivity && resolvedPreviewRoomId && (
                <AssignmentOverlay
                    staff={currentEditingStaff}
                    day={editingCell.day}
                    block={editingCell.block}
                    selectedActivity={selectedActivity}
                    selectedRoomId={selectedRoomId}
                    resolvedRoomId={resolvedPreviewRoomId}
                    hasConflict={previewHasSelectedConflict}
                    onActivityChange={setSelectedActivity}
                    onRoomChange={setSelectedRoomId}
                    onSave={handleSaveAssignment}
                    onClose={closeEditor}
                    previewContent={
                        <CesfamMapVisual
                            weeklySchedule={previewSchedule}
                            staffRoster={gameState.staffRoster}
                            stakeholders={gameState.stakeholders}
                            viewDay={editingCell.day}
                            viewBlock={editingCell.block}
                            highlightStaffId={editingCell.staffId}
                            highlightRoomId={resolvedPreviewRoomId}
                            className="h-full min-h-[340px]"
                            showNames={false}
                            compactOccupants
                        />
                    }
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-blue-300">Planificación Semanal</h2>
                    <p className="text-gray-400">
                        {hasCriticalConflicts
                            ? <span className="text-red-400 font-bold animate-pulse">⚠ Existen choques en las propuestas. Debe resolverlos antes de continuar.</span>
                            : 'Asigne actividades. Cuide las horas de contrato vs asignadas.'}
                    </p>
                </div>
                <div className="flex gap-4">
                    {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${ACTIVITY_COLORS[key as ActivityType]}`}></div>
                            <span className="text-xs text-gray-300">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {hasCriticalConflicts && (
                <div className="bg-yellow-900/40 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg mb-4 flex items-center gap-3 animate-pulse">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <p className="font-bold">VISUALIZANDO PROPUESTAS DE JEFATURAS</p>
                        <p className="text-sm">Lo que ves son las peticiones simultáneas de los tres sectores. Los bloques en <span className="text-red-400 font-bold">ROJO</span> indican donde dos o más jefes quieren el mismo recurso. Tú tienes la última palabra.</p>
                    </div>
                </div>
            )}

            <div className="flex-grow overflow-auto">
                <div ref={tableWrapperRef} className="relative min-w-max">
                    <svg
                        className="pointer-events-none absolute left-0 top-0 z-20 overflow-visible"
                        width={conflictOverlayGeometry.width}
                        height={conflictOverlayGeometry.height}
                    >
                        {conflictOverlayGeometry.lines.map(line => (
                            <line
                                key={line.key}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#facc15"
                                strokeWidth={3}
                                strokeLinecap="round"
                            />
                        ))}
                        {conflictOverlayGeometry.rects.map(rect => (
                            <rect
                                key={rect.key}
                                x={rect.x}
                                y={rect.y}
                                width={rect.width}
                                height={rect.height}
                                rx={10}
                                fill="rgba(250, 204, 21, 0.08)"
                                stroke="#facc15"
                                strokeWidth={2}
                            />
                        ))}
                    </svg>

                    <table ref={tableRef} className="w-full text-left border-collapse relative z-10">
                        <thead>
                            <tr>
                                <th className="p-2 border-b border-gray-600 bg-gray-900/50 text-gray-300 font-semibold w-10"></th>
                                <th className="p-2 border-b border-gray-600 bg-gray-900/50 text-gray-300 font-semibold w-48">Funcionario</th>
                                {DAYS_OF_WEEK.map(day => (
                                    <th key={day} className="p-2 border-b border-gray-600 bg-gray-900/50 text-gray-300 font-semibold text-center" colSpan={2}>
                                        {day}
                                    </th>
                                ))}
                                <th className="p-2 border-b border-gray-600 bg-gray-900/50 text-gray-300 font-semibold text-center w-24">Carga</th>
                            </tr>
                            <tr>
                                <th className="p-1 bg-gray-900/30 border-b border-gray-700/50"></th>
                                <th className="p-1 bg-gray-900/30 border-b border-gray-700/50"></th>
                                {DAYS_OF_WEEK.map(day => (
                                    <React.Fragment key={`${day}-sub`}>
                                        <th className="text-xs text-center text-gray-500 bg-gray-900/30 p-1 border-b border-gray-700/50">AM</th>
                                        <th className="text-xs text-center text-gray-500 bg-gray-900/30 p-1 border-b border-gray-700/50">PM</th>
                                    </React.Fragment>
                                ))}
                                <th className="p-1 bg-gray-900/30 border-b border-gray-700/50"></th>
                            </tr>
                        </thead>

                        {staffBySector.map(({ sector, staff }) => {
                            const sectorMeta = SECTOR_META[sector];

                            return (
                                <tbody key={sector}>
                                    <tr>
                                        <td
                                            rowSpan={staff.length + 1}
                                            className={`border-b border-r ${sectorMeta.verticalClass} min-w-[3rem] align-top p-0`}
                                        >
                                            <div className="flex h-full min-h-[3.5rem] items-center justify-center px-2 py-3">
                                                <span
                                                    className="text-[11px] font-black tracking-[0.35em] uppercase"
                                                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                                >
                                                    {sectorMeta.shortLabel}
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            colSpan={SCHEDULE_COLUMN_COUNT + 2}
                                            className={`border-b px-4 py-3 font-bold tracking-wide uppercase ${sectorMeta.headerClass}`}
                                        >
                                            {sectorMeta.title}
                                        </td>
                                    </tr>

                                    {staff.map(staffMember => {
                                        const { hoursAssigned } = calculateLoad(staffMember);
                                        const isOverworked = hoursAssigned > staffMember.contractHours;
                                        const isUnderworked = hoursAssigned < (staffMember.contractHours - 8);

                                        return (
                                            <tr key={staffMember.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                                <td className="p-3 font-medium text-gray-200">
                                                    <div>{staffMember.name}</div>
                                                    <div className="text-xs text-gray-500">{staffMember.role} ({staffMember.contractHours}hrs)</div>
                                                </td>

                                                {DAYS_OF_WEEK.map(day => (
                                                    <React.Fragment key={`${staffMember.id}-${day}`}>
                                                        {SCHEDULE_BLOCKS.map(block => {
                                                            const assign = getAssignment(staffMember.id, day, block);
                                                            const roomName = assign?.roomId ? CESFAM_ROOMS.find(room => room.id === assign.roomId)?.name : '';
                                                            const cellKey = `${staffMember.id}-${day}-${block}`;
                                                            const isConflict = conflictedCellKeys.has(cellKey);

                                                            return (
                                                                <td key={cellKey} className="p-1">
                                                                    <button
                                                                        ref={(node) => {
                                                                            cellRefs.current[cellKey] = node;
                                                                        }}
                                                                        onClick={() => handleCellClick(staffMember.id, day, block)}
                                                                        className={`w-full h-12 rounded shadow-sm transition-all transform hover:scale-105 flex flex-col items-center justify-center p-1 relative ${
                                                                            assign ? ACTIVITY_COLORS[assign.activity] : 'bg-gray-700'
                                                                        } ${isConflict ? 'ring-4 ring-red-500 animate-pulse z-10' : ''}`}
                                                                        title={`${day} ${block}: ${assign ? ACTIVITY_LABELS[assign.activity] : 'Sin asignar'}`}
                                                                    >
                                                                        {isConflict && <span className="text-xs font-bold text-white bg-red-600 px-1 rounded absolute -top-2">CHOQUE</span>}
                                                                        {assign?.activity === 'CLINICAL' && assign.roomId && (
                                                                            <span className="text-[9px] font-bold text-white bg-black/20 px-1 rounded truncate w-full text-center">
                                                                                {roomName?.replace('Box ', 'B')}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ))}

                                                <td className="p-2 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${isOverworked ? 'bg-red-500' : isUnderworked ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                                style={{ width: `${Math.min(100, (hoursAssigned / staffMember.contractHours) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-xs font-mono ${isOverworked ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                                                            {Math.round(hoursAssigned)}/{staffMember.contractHours}h
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            );
                        })}
                    </table>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-4 items-center">
                {hasCriticalConflicts && <p className="text-red-400 text-sm font-bold animate-bounce">Resuelva los conflictos de sala para continuar.</p>}
                <button
                    onClick={handleExecuteWeek}
                    disabled={hasCriticalConflicts}
                    className={`font-bold py-3 px-8 rounded-lg shadow-lg transform transition flex items-center gap-2 ${
                        hasCriticalConflicts ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-500 hover:scale-105 text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ejecutar Semana
                </button>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-in forwards; }
            `}</style>
        </div>
    );
};

export default SchedulerInterface;
