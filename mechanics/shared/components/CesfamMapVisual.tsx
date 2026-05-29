import React, { useRef, useState } from 'react';
import { DayOfWeek, ScheduleAssignment, ScheduleBlock, StaffMember, Stakeholder } from '../../../types';
import { CESFAM_ROOMS } from '../../../constants';
import NpcHover from './NpcHover';

export const MAP_BACKGROUND_URL = "https://i.imgur.com/WxYN5Nz.jpegava";

interface CesfamMapVisualProps {
    weeklySchedule: ScheduleAssignment[];
    staffRoster: StaffMember[];
    stakeholders: Stakeholder[];
    viewDay: DayOfWeek;
    viewBlock: ScheduleBlock;
    interactive?: boolean;
    onInteract?: (staff: StaffMember, roomId: string) => void;
    highlightStaffId?: string;
    highlightRoomId?: string;
    className?: string;
    showNames?: boolean;
    compactOccupants?: boolean;
    availableMeetingStaffIds?: string[];
    /** Habilita arrastrar ocupantes entre salas (HTML5 DnD). */
    draggable?: boolean;
    /** Callback al soltar un ocupante sobre una sala. */
    onStaffDrop?: (staffId: string, roomId: string) => void;
    /** Salas en choque con animacion amarilla en vez del anillo rojo estatico. */
    animatedConflict?: boolean;
    /** Envuelve cada retrato en NpcHover (descripcion al pasar el mouse). */
    npcHover?: boolean;
}

const NON_CONFLICT_ROOMS = new Set(['TERRENO', 'AREA_COMUN', 'OFICINA_TECNICA']);

const CesfamMapVisual: React.FC<CesfamMapVisualProps> = ({
    weeklySchedule,
    staffRoster,
    stakeholders,
    viewDay,
    viewBlock,
    interactive = false,
    onInteract,
    highlightStaffId,
    highlightRoomId,
    className = '',
    showNames = true,
    compactOccupants = false,
    availableMeetingStaffIds = [],
    draggable = false,
    onStaffDrop,
    animatedConflict = false,
    npcHover = false,
}) => {
    const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
    const emptyDragImageRef = useRef<HTMLImageElement | null>(null);

    const getEmptyDragImage = () => {
        if (!emptyDragImageRef.current) {
            const img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            emptyDragImageRef.current = img;
        }
        return emptyDragImageRef.current;
    };

    const handleDragStart = (event: React.DragEvent, staff: StaffMember) => {
        setDraggedStaffId(staff.id);
        setDragPos({ x: event.clientX, y: event.clientY });
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', staff.id);
        event.dataTransfer.setDragImage(getEmptyDragImage(), 0, 0);
    };

    const handleDragMove = (event: React.DragEvent) => {
        if (event.clientX === 0 && event.clientY === 0) return;
        setDragPos({ x: event.clientX, y: event.clientY });
    };

    const handleDragEnd = () => {
        setDraggedStaffId(null);
        setDragPos(null);
    };

    const getOccupants = (roomId: string) => {
        return staffRoster.filter(staff => {
            const assignment = weeklySchedule.find(
                a => a.staffId === staff.id && a.day === viewDay && a.block === viewBlock
            );

            if (!assignment) return false;
            if (assignment.roomId === roomId) return true;

            if (!assignment.roomId) {
                if (roomId === 'TERRENO' && assignment.activity === 'TERRAIN') return true;
                if (roomId === 'AREA_COMUN' && assignment.activity === 'TRAINING') return true;
                if (assignment.activity === 'ADMIN' && roomId === 'OFICINA_TECNICA') return true;
            }

            return false;
        });
    };

    const getPortraitProps = (staffId: string, fallbackUrl?: string) => {
        const stakeholder = stakeholders.find(s => s.id === staffId);
        return {
            src: stakeholder?.portraitUrl ?? fallbackUrl ?? '',
            style: {
                objectPosition: '50% 0%',
                transform: `translateY(${stakeholder?.portraitOffsetY ?? '85%'}) scale(${stakeholder?.portraitScale ?? 2.9})`
            }
        };
    };

    return (
        <>
        <div className={`flex-grow grid grid-cols-3 grid-rows-3 gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 relative overflow-hidden shadow-inner ${className}`}>
            {MAP_BACKGROUND_URL && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 pointer-events-none"
                    style={{ backgroundImage: `url('${MAP_BACKGROUND_URL}')` }}
                />
            )}

            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #4299e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {CESFAM_ROOMS.map(room => {
                const occupants = getOccupants(room.id);
                const hasPhysicalConflict = !NON_CONFLICT_ROOMS.has(room.id) && occupants.length > 1;
                const isHighlightedRoom = highlightRoomId === room.id;
                const compactCount = occupants.length;
                const occupantLayoutClass = compactOccupants
                    ? compactCount <= 1
                        ? 'flex justify-center items-start pt-1'
                        : compactCount <= 3
                            ? 'flex flex-row justify-center items-start gap-2 pt-1'
                            : compactCount <= 4
                                ? 'grid grid-cols-2 justify-items-center items-start content-start gap-1 pt-1'
                                : 'grid grid-cols-3 justify-items-center items-start content-start gap-1 pt-1'
                    : 'flex flex-wrap gap-2 justify-center items-center';
                const compactVerticalLiftClass = compactOccupants ? '-translate-y-3' : '';

                const conflictClass = hasPhysicalConflict
                    ? animatedConflict
                        ? 'border-yellow-300 animate-conflict-glow-yellow'
                        : 'ring-2 ring-red-500 border-red-400 shadow-red-900/40'
                    : '';

                return (
                    <div
                        key={room.id}
                        className={`relative rounded-lg border-2 p-2 flex flex-col transition-all duration-300 ${room.color} backdrop-blur-sm shadow-sm ${conflictClass} ${isHighlightedRoom ? 'ring-2 ring-cyan-300 border-cyan-200 shadow-cyan-500/30 scale-[1.01]' : ''}`}
                        style={{ gridArea: room.gridArea }}
                        onDragOver={draggable ? (event) => event.preventDefault() : undefined}
                        onDrop={
                            draggable && onStaffDrop
                                ? () => {
                                      if (draggedStaffId) onStaffDrop(draggedStaffId, room.id);
                                      setDraggedStaffId(null);
                                  }
                                : undefined
                        }
                    >
                        <span className="text-xs font-bold text-white/95 bg-black/70 px-2 py-1 rounded w-max mb-2 border border-white/20 shadow-sm z-10">
                            {room.name}
                        </span>

                        <div className={`${occupantLayoutClass} ${compactVerticalLiftClass} flex-grow z-10 transform-gpu`}>
                            {occupants.map(staff => {
                                const portrait = getPortraitProps(staff.id, staff.portraitUrl);
                                const isHighlightedStaff = highlightStaffId === staff.id;
                                const hasAvailableMeeting = availableMeetingStaffIds.includes(staff.id);
                                const stakeholder = stakeholders.find(s => s.id === staff.id);
                                const occupantClass = `group relative ${interactive ? 'cursor-pointer' : draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`;
                                const avatarSizeClass = compactOccupants
                                    ? compactCount <= 3
                                        ? 'w-12 h-12 lg:w-14 lg:h-14'
                                        : compactCount <= 4
                                                ? 'w-9 h-9 lg:w-10 lg:h-10'
                                                : 'w-8 h-8 lg:w-9 lg:h-9'
                                    : 'w-14 h-14 lg:w-16 lg:h-16';
                                const highlightedAvatarClass = compactOccupants
                                    ? 'border-cyan-300 ring-1 ring-cyan-400/60'
                                    : 'border-cyan-300 ring-2 ring-cyan-400/70 scale-105';
                                const availableMeetingAvatarClass = compactOccupants
                                    ? 'border-yellow-300 ring-2 ring-yellow-400/80 shadow-[0_0_12px_rgba(250,204,21,0.35)]'
                                    : 'border-yellow-300 ring-2 ring-yellow-400/80 shadow-[0_0_14px_rgba(250,204,21,0.4)]';
                                const avatarStateClass = isHighlightedStaff
                                    ? highlightedAvatarClass
                                    : hasAvailableMeeting
                                        ? availableMeetingAvatarClass
                                        : 'border-white/80';

                                const occupantBody = (
                                    <div className={`flex items-center ${showNames ? 'gap-2' : 'justify-center'}`}>
                                        <div className={`${avatarSizeClass} rounded-full overflow-hidden border-2 shadow-md bg-gray-800 transition ${
                                            interactive ? 'transform group-hover:scale-110 group-hover:border-yellow-400' : ''
                                        } ${avatarStateClass}`}>
                                            <img
                                                src={portrait.src}
                                                alt={staff.name}
                                                className="w-full h-full object-cover"
                                                style={portrait.style}
                                            />
                                        </div>
                                        {showNames && (
                                            <span className={`text-xs font-semibold px-2 py-1 rounded border ${
                                                isHighlightedStaff
                                                    ? 'text-cyan-100 bg-cyan-950/80 border-cyan-400/60'
                                                    : hasAvailableMeeting
                                                        ? 'text-yellow-100 bg-yellow-950/70 border-yellow-400/60'
                                                    : 'text-white bg-black/60 border-white/10'
                                            }`}>
                                                {staff.name}
                                            </span>
                                        )}
                                    </div>
                                );

                                if (interactive && onInteract) {
                                    return (
                                        <button
                                            key={staff.id}
                                            onClick={() => onInteract(staff, room.id)}
                                            className={occupantClass}
                                            title={showNames ? `Ir a ver a: ${staff.name}` : staff.name}
                                        >
                                            {occupantBody}
                                            {hasAvailableMeeting && (
                                                <span className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-gray-950 shadow-[0_0_10px_rgba(250,204,21,0.55)] animate-meeting-float">
                                                    !
                                                </span>
                                            )}
                                            {staff.burnout > 70 && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                }

                                const occupantNode = (
                                    <div
                                        className={`${occupantClass} ${draggable && draggedStaffId === staff.id ? 'opacity-40' : ''}`}
                                        title={showNames ? undefined : staff.name}
                                        draggable={draggable}
                                        onDragStart={draggable ? (event) => handleDragStart(event, staff) : undefined}
                                        onDrag={draggable ? handleDragMove : undefined}
                                        onDragEnd={draggable ? handleDragEnd : undefined}
                                    >
                                        {occupantBody}
                                        {hasAvailableMeeting && (
                                            <span className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-gray-950 shadow-[0_0_10px_rgba(250,204,21,0.55)] animate-meeting-float">
                                                !
                                            </span>
                                        )}
                                        {staff.burnout > 70 && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        )}
                                    </div>
                                );

                                if (npcHover && stakeholder) {
                                    return (
                                        <NpcHover key={staff.id} stakeholder={stakeholder} placement="top" triggerClassName="">
                                            {occupantNode}
                                        </NpcHover>
                                    );
                                }

                                return <React.Fragment key={staff.id}>{occupantNode}</React.Fragment>;
                            })}

                            {occupants.length === 0 && (
                                <span className="text-gray-200/50 text-[10px] italic select-none font-semibold text-shadow-sm">Vacío</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
        {draggable && draggedStaffId && dragPos && (() => {
            const draggedStaff = staffRoster.find(staff => staff.id === draggedStaffId);
            if (!draggedStaff) return null;
            const portrait = getPortraitProps(draggedStaff.id, draggedStaff.portraitUrl);
            return (
                <div
                    className="pointer-events-none fixed z-[200] w-14 h-14 rounded-full overflow-hidden border-2 border-yellow-300 shadow-2xl bg-gray-800"
                    style={{ left: dragPos.x, top: dragPos.y, transform: 'translate(-50%, -50%)' }}
                >
                    <img src={portrait.src} alt={draggedStaff.name} className="w-full h-full object-cover" style={portrait.style} />
                </div>
            );
        })()}
        <style>{`
            @keyframes meeting-float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
            }
            .animate-meeting-float {
                animation: meeting-float 1.8s ease-in-out infinite;
            }
            @keyframes conflict-glow-yellow {
                0%, 100% { box-shadow: 0 0 6px 1px rgba(250,204,21,0.45); border-color: rgba(253,224,71,0.7); }
                50% { box-shadow: 0 0 20px 6px rgba(250,204,21,0.9); border-color: rgba(253,224,71,1); }
            }
            .animate-conflict-glow-yellow {
                animation: conflict-glow-yellow 1.1s ease-in-out infinite;
            }
        `}</style>
        </>
    );
};

export default CesfamMapVisual;
