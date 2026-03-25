import React from 'react';
import { GameState, ScheduleBlock, StaffMember } from '../types';
import { CESFAM_PRESENT_MAP_SCHEDULE, DAYS_OF_WEEK } from '../constants';
import { useMechanicContext } from '../mechanics/MechanicContext';
import CesfamMapVisual from './CesfamMapVisual';

interface CesfamMapProps {
    gameState: GameState;
    onInteract: (staff: StaffMember) => boolean;
}

const CesfamMap: React.FC<CesfamMapProps> = ({ gameState, onInteract }) => {
    const { engine, availableProactiveStakeholderIds } = useMechanicContext();
    const currentBlock: ScheduleBlock = gameState.timeSlot === 'mañana' ? 'AM' : 'PM';
    const dayOfWeek = DAYS_OF_WEEK[(gameState.day - 1) % 5];
    const mapSchedule = gameState.day >= 3 && gameState.day <= 5
        ? CESFAM_PRESENT_MAP_SCHEDULE
        : gameState.weeklySchedule;

    const handleInteract = (staff: StaffMember, roomId: string) => {
        const shouldLog = onInteract(staff);
        if (!shouldLog) return;

        engine.emitEvent('map', 'staff_clicked', {
            staff_id: staff.id,
            location_id: roomId,
            day: gameState.day,
            time_slot: gameState.timeSlot
        });

        const stakeholder = gameState.stakeholders.find(s => s.id === staff.id);
        if (!stakeholder) return;

        engine.emitCanonicalAction(
            'map',
            'visit_stakeholder',
            `stakeholder:${stakeholder.id}`,
            {
                day: gameState.day,
                time_slot: gameState.timeSlot,
                location_id: roomId,
                arrived_at: Date.now()
            }
        );
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-blue-300">Mapa del CESFAM</h2>
                    <p className="text-gray-400 max-w-xl">
                        Visualización en tiempo real de la ubicación del personal.
                        <br />
                        <span className="text-yellow-400 font-bold">⚠ Costo de Movimiento: 6 segundos.</span> Haga clic en un funcionario para ir a verlo.
                    </p>
                </div>
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-2 text-right">
                    <div className="text-sm font-bold text-white">{dayOfWeek}</div>
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">{currentBlock}</div>
                </div>
            </div>

            <CesfamMapVisual
                weeklySchedule={mapSchedule}
                staffRoster={gameState.staffRoster}
                stakeholders={gameState.stakeholders}
                viewDay={dayOfWeek}
                viewBlock={currentBlock}
                interactive
                onInteract={handleInteract}
                availableMeetingStaffIds={availableProactiveStakeholderIds}
            />

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-in forwards; }
                .text-shadow-sm { text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
            `}</style>
        </div>
    );
};

export default CesfamMap;
