import React from 'react';
import { DayOfWeek, ScheduleAssignment, ScheduleBlock, StaffMember, Stakeholder } from '../types';
import { CESFAM_ROOMS } from '../constants';

export const MAP_BACKGROUND_URL = "https://i.imgur.com/WxYN5Nz.jpeg";

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
}) => {
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
        <div className={`flex-grow grid grid-cols-3 grid-rows-5 gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 relative overflow-hidden shadow-inner ${className}`}>
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

                return (
                    <div
                        key={room.id}
                        className={`relative rounded-lg border-2 p-2 flex flex-col transition-all duration-300 ${room.color} backdrop-blur-sm shadow-sm ${
                            hasPhysicalConflict ? 'ring-2 ring-red-500 border-red-400 shadow-red-900/40' : ''
                        } ${isHighlightedRoom ? 'ring-2 ring-cyan-300 border-cyan-200 shadow-cyan-500/30 scale-[1.01]' : ''}`}
                        style={{ gridArea: room.gridArea }}
                    >
                        <span className="text-xs font-bold text-white/95 bg-black/70 px-2 py-1 rounded w-max mb-2 border border-white/20 shadow-sm z-10">
                            {room.name}
                        </span>

                        <div className={`${occupantLayoutClass} ${compactVerticalLiftClass} flex-grow z-10 transform-gpu`}>
                            {occupants.map(staff => {
                                const portrait = getPortraitProps(staff.id, staff.portraitUrl);
                                const isHighlightedStaff = highlightStaffId === staff.id;
                                const occupantClass = `group relative ${interactive ? 'cursor-pointer' : 'cursor-default'}`;
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

                                const occupantBody = (
                                    <div className={`flex items-center ${showNames ? 'gap-2' : 'justify-center'}`}>
                                        <div className={`${avatarSizeClass} rounded-full overflow-hidden border-2 shadow-md bg-gray-800 transition ${
                                            interactive ? 'transform group-hover:scale-110 group-hover:border-yellow-400' : ''
                                        } ${isHighlightedStaff ? highlightedAvatarClass : 'border-white/80'}`}>
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
                                            {staff.burnout > 70 && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                }

                                return (
                                    <div key={staff.id} className={occupantClass} title={showNames ? undefined : staff.name}>
                                        {occupantBody}
                                        {staff.burnout > 70 && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            {occupants.length === 0 && (
                                <span className="text-gray-200/50 text-[10px] italic select-none font-semibold text-shadow-sm">Vacío</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CesfamMapVisual;
