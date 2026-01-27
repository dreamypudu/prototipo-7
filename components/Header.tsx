
import React from 'react';
import { EffectMagnitude, GameState, GlobalEffectsUI, TimeSlotType } from '../types';
import { getGameDate } from '../constants';

interface HeaderProps {
  gameState: GameState;
  countdown: number;
  isTimerPaused: boolean;
  onTogglePause: () => void;
  onAdvanceTime: () => void;
  onOpenSidebar: () => void;
  periodDuration?: number;
  globalEffectsHighlight?: GlobalEffectsUI | null;
  title?: string;
  subtitle?: string;
}

const TimeDisplay: React.FC<{ day: number; deadline: number; slot: TimeSlotType; countdown: number; isPaused: boolean; onTogglePause: () => void; onAdvance: () => void; periodDuration: number; }> = ({ day, deadline, slot, countdown, isPaused, onTogglePause, onAdvance, periodDuration }) => {
    const progress = ((periodDuration - countdown) / periodDuration) * 100;
    const { week, dayName } = getGameDate(day);
    const slotLabel = slot === 'mañana' ? 'Mañana' : slot === 'tarde' ? 'Tarde' : 'Noche';

    return (
        <div className="time-card flex-grow">
            <div className="text-teal-300"><ClockIcon /></div>
            <div className="flex-grow">
                <div className="flex justify-between items-baseline">
                    <div className="eyebrow">Semana {week} · {dayName}</div>
                    <div className="text-lg font-bold text-white leading-tight flex items-center gap-2">
                      {slotLabel}
                      <span className="text-xs text-gray-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                        {Math.max(0, countdown)}s
                      </span>
                    </div>
                </div>
                <div className="time-bar mt-2">
                    <div className={`time-bar__fill ${isPaused ? 'opacity-60' : ''}`} style={{ width: `${progress}%`, transition: isPaused ? 'none' : 'width 1s linear' }}/>
                </div>
            </div>
             <div className="flex items-center gap-2 pl-3 border-l border-gray-700/70">
                <button onClick={onTogglePause} className="p-2 rounded-full bg-white/10 border border-white/10 hover:border-teal-300/60 text-teal-200 transition-colors" title={isPaused ? 'Reanudar' : 'Pausar'}>
                    {isPaused ? <PlayIcon /> : <PauseIcon />}
                </button>
                <button onClick={onAdvance} className="p-2 rounded-full bg-white/10 border border-white/10 hover:border-teal-300/60 text-teal-200 transition-colors" title="Avanzar al Siguiente Bloque">
                   <ForwardIcon />
                </button>
            </div>
        </div>
    );
};


const getMagnitudeSize = (magnitude: EffectMagnitude): string => {
    if (magnitude === 'S') return 'w-3 h-3';
    if (magnitude === 'M') return 'w-4 h-4';
    return 'w-5 h-5';
};

const getMagnitudeColor = (magnitude?: EffectMagnitude) => {
    // Un solo color (blanco) para todas las magnitudes, evitando sesgos
    return { dot: 'bg-white', glow: 'rgba(255,255,255,0.55)' };
};

const getMagnitudeFill = (magnitude?: EffectMagnitude) => {
    return '#ffffff';
};

const magnitudeCardStyles = (magnitude?: EffectMagnitude) => {
    return 'bg-white/10 border-white/60 shadow-[0_0_26px_rgba(255,255,255,0.35)]';
};

// Ajusta aquí los diámetros de los anillos para M y L (el punto central representa S).
const RING_LEVELS: EffectMagnitude[] = ['M', 'L'];
const RING_SIZES = [28, 40];

const GlobalStat: React.FC<{
    label: string;
    value: number;
    highlight?: EffectMagnitude;
    accentClass: string;
    barMax?: number;
    suffix?: string;
}> = ({ label, value, highlight, accentClass, barMax, suffix }) => {
    const magnitudeStyle = getMagnitudeColor(highlight);
    const cardTone = magnitudeCardStyles(highlight);
    const pct = barMax !== undefined ? Math.max(0, Math.min(100, (value / barMax) * 100)) : null;
    return (
        <div className={`stat-card relative overflow-hidden ${cardTone}`}>
            <div className="relative w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
              {/* Relleno según magnitud M/L */}
              {highlight && ['M', 'L'].includes(highlight) && (
                <span
                  className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 z-0"
                  style={{
                    width: `${highlight === 'L' ? RING_SIZES[1] : RING_SIZES[0]}px`,
                    height: `${highlight === 'L' ? RING_SIZES[1] : RING_SIZES[0]}px`,
                    backgroundColor: getMagnitudeFill(highlight),
                    opacity: 0.95
                  }}
                />
              )}
              <div
                className={`stat-dot relative z-20 ${highlight ? magnitudeStyle.dot : accentClass}`}
              />
              {/* Rings always visible; around the dot */}
              {RING_LEVELS.map((level, idx) => {
                const size = RING_SIZES[idx];
                const active =
                  (highlight === 'M' && level === 'M') ||
                  (highlight === 'L');
                const ringColor = active ? getMagnitudeFill(highlight) : 'rgba(255,255,255,0.45)';
                const anim =
                  (highlight === 'M' && level === 'M') ||
                  (highlight === 'L' && level === 'L')
                    ? 'animate-[ping_1.6s_ease-out_infinite]'
                    : '';
                return (
                  <span
                    key={level}
                    className={`absolute rounded-full border z-10 ${anim}`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      borderColor: ringColor
                    }}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
                {barMax !== undefined ? (
                  <div className="mt-1">
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                      <div
                        className={`h-full ${highlight ? magnitudeStyle.dot : accentClass} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-gray-300 mt-1">{Math.round(pct ?? 0)}%</div>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-white">
                    {value.toLocaleString()}
                    {suffix ? suffix : ''}
                  </span>
                )}
            </div>
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ gameState, countdown, isTimerPaused, onTogglePause, onAdvanceTime, onOpenSidebar, periodDuration = 90, globalEffectsHighlight, title, subtitle, logoUrl }) => {
  const budgetHighlight = globalEffectsHighlight?.budget;
  const reputationHighlight = globalEffectsHighlight?.reputation;
  const displayTitle = title || 'Compass';
  const displaySubtitle = subtitle || 'Simulador de decisiones';
  return (
    <header className="panel p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shadow-sm overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-base">🎯</span>
                )}
            </div>
            <div>
                <h1 className="text-lg font-semibold text-white/80 tracking-tight">{displayTitle}</h1>
                <p className="text-xs text-gray-300 leading-tight">{displaySubtitle}</p>
            </div>
            <button 
                onClick={onOpenSidebar} 
                className="p-2 rounded-full bg-white/8 border border-white/10 hover:border-teal-200/60 text-gray-200 hover:text-white transition-colors" 
                title="Herramientas y Opciones"
            >
                <SettingsIcon />
            </button>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-3">
                <GlobalStat label="Presupuesto" value={gameState.budget} highlight={budgetHighlight} accentClass="bg-emerald-300" />
                <GlobalStat label="Reputación" value={gameState.reputation} highlight={reputationHighlight} accentClass="bg-amber-300" barMax={100} />
                <GlobalStat label="Ciclo" value={gameState.day} accentClass="bg-sky-300" />
            </div>
            <div className="min-w-[260px] w-full lg:w-auto">
                <TimeDisplay 
                    day={gameState.day} 
                    deadline={gameState.projectDeadline} 
                    slot={gameState.timeSlot} 
                    countdown={countdown}
                    isPaused={isTimerPaused}
                    onTogglePause={onTogglePause}
                    onAdvance={onAdvanceTime}
                    periodDuration={periodDuration}
                 />
            </div>
        </div>
      </div>
    </header>
  );
};

// SVG Icons
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" clipRule="evenodd" />
    </svg>
);
const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);
const ForwardIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4.555 5.168A1 1 0 003 6.006v7.988a1 1 0 001.555.832l6.197-3.994a1 1 0 000-1.664L4.555 5.168zM10.555 5.168A1 1 0 009 6.006v7.988a1 1 0 001.555.832l6.197-3.994a1 1 0 000-1.664l-6.197-3.994z" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export default Header;
