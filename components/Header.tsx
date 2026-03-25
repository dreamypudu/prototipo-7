
import React, { useMemo, useState } from 'react';
import { DailyEffectSummary, DecisionLogEntry, EffectMagnitude, GameState, GlobalEffectsUI, InternalEffectsPreview, TimeSlotType } from '../types';
import { getGameDate } from '../constants';

interface HeaderProps {
  gameState: GameState;
  countdown: number;
  isTimerPaused: boolean;
  onTogglePause: () => void;
  onAdvanceTime: () => void;
  onOpenSidebar: () => void;
  showPauseControl?: boolean;
  periodDuration?: number;
  globalEffectsHighlight?: GlobalEffectsUI | null;
  recentInternalResolution?: InternalEffectsPreview | null;
  dailySummary?: DailyEffectSummary | null;
  title?: string;
  subtitle?: string;
  logoUrl?: string;
}

const TimeDisplay: React.FC<{ day: number; deadline: number; slot: TimeSlotType; countdown: number; isPaused: boolean; onTogglePause: () => void; onAdvance: () => void; periodDuration: number; showPauseControl?: boolean; }> = ({ day, deadline, slot, countdown, isPaused, onTogglePause, onAdvance, periodDuration, showPauseControl = true }) => {
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
                {showPauseControl && (
                  <button onClick={onTogglePause} className="p-2 rounded-full bg-white/10 border border-white/10 hover:border-teal-300/60 text-teal-200 transition-colors" title={isPaused ? 'Reanudar' : 'Pausar'}>
                      {isPaused ? <PlayIcon /> : <PauseIcon />}
                  </button>
                )}
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

// S, M y L se representan como anillos crecientes alrededor del punto central.
const RING_LEVELS: EffectMagnitude[] = ['S', 'M', 'L'];
const RING_SIZES = [18, 28, 40];

const MAGNITUDE_RANK: Record<EffectMagnitude, number> = {
    S: 1,
    M: 2,
    L: 3,
};

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
              {/* Relleno según magnitud activa */}
              {highlight && (
                <span
                  className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 z-0"
                  style={{
                    width: `${RING_SIZES[MAGNITUDE_RANK[highlight] - 1]}px`,
                    height: `${RING_SIZES[MAGNITUDE_RANK[highlight] - 1]}px`,
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
                const active = Boolean(highlight) && MAGNITUDE_RANK[level] <= MAGNITUDE_RANK[highlight];
                const ringColor = active ? getMagnitudeFill(highlight) : 'rgba(255,255,255,0.45)';
                const anim = active && highlight === level ? 'animate-[ping_1.6s_ease-out_infinite]' : '';
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

const getResolutionVisuals = (trend: DailyEffectSummary['internalTrend'], magnitude: number) => {
    if (trend === 'up') {
        return {
            arrow: '↑',
            textClass: magnitude >= 8 ? 'text-[12px]' : magnitude >= 4 ? 'text-[10px]' : 'text-[9px]',
            colorClass: 'text-emerald-400',
            bgClass: 'bg-emerald-500/10 border-emerald-400/25',
            glowClass: 'shadow-[0_0_14px_rgba(52,211,153,0.18)]',
        };
    }
    if (trend === 'down') {
        return {
            arrow: '↓',
            textClass: magnitude >= 8 ? 'text-[12px]' : magnitude >= 4 ? 'text-[10px]' : 'text-[9px]',
            colorClass: 'text-rose-400',
            bgClass: 'bg-rose-500/10 border-rose-400/25',
            glowClass: 'shadow-[0_0_14px_rgba(251,113,133,0.18)]',
        };
    }
    return {
        arrow: '•',
        textClass: 'text-[8px]',
        colorClass: 'text-gray-300',
        bgClass: 'bg-white/5 border-white/15',
        glowClass: '',
    };
};

const TinyArrowPlaceholder: React.FC = () => (
    <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/15 bg-white/5 shadow-[inset_0_0_8px_rgba(255,255,255,0.05)]">
        <span
            className="absolute text-[8px] font-bold text-emerald-400 leading-none"
            style={{ animation: 'header-arrow-float-up 1.6s ease-in-out infinite' }}
        >
            ↑
        </span>
        <span
            className="absolute text-[8px] font-bold text-rose-400 leading-none"
            style={{ animation: 'header-arrow-float-down 1.6s ease-in-out infinite' }}
        >
            ↓
        </span>
    </span>
);

const ResolutionCardContent: React.FC<{
    label: string;
    reputation: number | null;
    stakeholderName?: string | null;
    internalTrend: DailyEffectSummary['internalTrend'];
    internalMagnitude: number;
    animate?: boolean;
}> = ({
    label,
    reputation,
    stakeholderName,
    internalTrend,
    internalMagnitude,
    animate = false,
}) => {
    const visual = getResolutionVisuals(internalTrend, internalMagnitude);
    const formatDelta = (value: number) => `${value >= 0 ? '+' : ''}${value}`;

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
            <div className="flex items-center justify-between gap-4 text-sm font-semibold text-white">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        Reputación {typeof reputation === 'number' ? formatDelta(reputation) : <TinyArrowPlaceholder />}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {stakeholderName ? (
                        <span className={`min-w-[7.5rem] h-6 rounded-full border border-white/10 bg-white/5 px-2 text-[11px] leading-6 text-gray-200 truncate ${animate ? 'animate-pulse border-cyan-300/40 bg-cyan-500/10' : ''}`}>
                            {stakeholderName}
                        </span>
                    ) : null}
                    {typeof reputation === 'number' || internalTrend !== 'neutral' ? (
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${visual.bgClass} ${visual.glowClass} ${animate ? 'animate-pulse' : ''}`}>
                            <span className={`${visual.colorClass} ${visual.textClass} font-bold leading-none ${animate ? 'animate-bounce' : ''}`}>
                                {visual.arrow}
                            </span>
                        </span>
                    ) : (
                        <TinyArrowPlaceholder />
                    )}
                </div>
            </div>
        </div>
    );
};

const ResolutionHistoryRow: React.FC<{
    label: string;
    reputation: number | null;
    stakeholderName?: string | null;
    internalTrend: DailyEffectSummary['internalTrend'];
    internalMagnitude: number;
}> = ({
    label,
    reputation,
    stakeholderName,
    internalTrend,
    internalMagnitude,
}) => {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-2.5">
            <ResolutionCardContent
                label={label}
                reputation={reputation}
                stakeholderName={stakeholderName}
                internalTrend={internalTrend}
                internalMagnitude={internalMagnitude}
            />
        </div>
    );
};

const buildDecisionHistoryItem = (entry: DecisionLogEntry, index: number) => {
    const trustDelta = Number(entry.consequences.trustChange ?? 0);
    const supportDelta = Number(entry.consequences.supportChange ?? 0);
    const strongestInternal = Math.abs(supportDelta) > Math.abs(trustDelta) ? supportDelta : trustDelta;
    const reputation = typeof entry.consequences.reputationChange === 'number' ? entry.consequences.reputationChange : 0;
    if (strongestInternal === 0 && reputation === 0) return null;

    return {
        key: `decision-${index}`,
        label: `Resolución D${entry.day}`,
        reputation,
        stakeholderName: entry.stakeholder,
        internalTrend: strongestInternal > 0 ? 'up' : 'down' as const,
        internalMagnitude: Math.abs(strongestInternal),
        sortDay: entry.day,
        sortIndex: index,
    };
};

const ResolutionStat: React.FC<{
    summary?: DailyEffectSummary | null;
    history: GameState['dailyResolutions'];
    decisionLog: DecisionLogEntry[];
    stakeholders: GameState['stakeholders'];
    recentInternal?: InternalEffectsPreview | null;
}> = ({ summary, history, decisionLog, stakeholders, recentInternal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const historyItems = useMemo(
        () => {
            const stakeholderNameById = new Map(stakeholders.map((stakeholder) => [stakeholder.id, stakeholder.name]));
            const dailyItems = [...history].map((entry, index) => {
                let strongestInternal = 0;
                let strongestStakeholderName: string | null = null;
                Object.entries(entry.stakeholder_deltas || {}).forEach(([stakeholderId, delta]: [string, any]) => {
                    const trustDelta = Number(delta?.trust || 0);
                    const supportDelta = Number(delta?.support || 0);
                    if (Math.abs(trustDelta) > Math.abs(strongestInternal)) {
                        strongestInternal = trustDelta;
                        strongestStakeholderName = stakeholderNameById.get(stakeholderId) ?? stakeholderId;
                    }
                    if (Math.abs(supportDelta) > Math.abs(strongestInternal)) {
                        strongestInternal = supportDelta;
                        strongestStakeholderName = stakeholderNameById.get(stakeholderId) ?? stakeholderId;
                    }
                });
                return {
                    key: `daily-${entry.day}-${index}`,
                    label: `Resolución D${entry.day}`,
                    reputation: Number(entry.global_deltas?.reputation || 0),
                    stakeholderName: strongestStakeholderName,
                    internalTrend: strongestInternal > 0 ? 'up' : strongestInternal < 0 ? 'down' : 'neutral' as const,
                    internalMagnitude: Math.abs(strongestInternal),
                    sortDay: entry.day,
                    sortIndex: index,
                };
            });
            const decisionItems = decisionLog
                .map((entry, index) => buildDecisionHistoryItem(entry, index))
                .filter((item): item is NonNullable<typeof item> => item !== null);

            return [...decisionItems, ...dailyItems].sort((a, b) => {
                if (b.sortDay !== a.sortDay) return b.sortDay - a.sortDay;
                return b.sortIndex - a.sortIndex;
            });
        },
        [history, decisionLog, stakeholders]
    );
    const summaryHistoryItem = summary
        ? historyItems.find((item) => item.label === `Resolución D${summary.day}`)
        : null;
    const currentStakeholderName = recentInternal?.stakeholderName ?? summaryHistoryItem?.stakeholderName ?? null;

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                type="button"
                className="stat-card relative overflow-hidden bg-white/10 border-white/20 min-w-[320px] hover:border-white/30 transition-colors text-left"
            >
                <ResolutionCardContent
                    label={summary ? `Resolución D${summary.day}` : 'Resolución diaria'}
                    reputation={summary ? Number(summary.global.reputation || 0) : null}
                    stakeholderName={currentStakeholderName}
                    internalTrend={recentInternal?.direction ?? summary?.internalTrend ?? 'neutral'}
                    internalMagnitude={Math.abs(recentInternal?.rawDelta ?? summary?.internalMagnitude ?? 0)}
                    animate={Boolean(recentInternal)}
                />
            </button>
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-[360px] rounded-2xl border border-white/10 bg-[#111827]/95 p-3 shadow-2xl backdrop-blur">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-gray-400">Historial de resoluciones</span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-gray-300 hover:text-white"
                        >
                            Cerrar
                        </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {historyItems.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-sm text-gray-400">
                                Aún no hay resoluciones registradas.
                            </div>
                        ) : (
                            historyItems.map((item) => (
                                <ResolutionHistoryRow
                                    key={item.key}
                                    label={item.label}
                                    reputation={item.reputation}
                                    stakeholderName={item.stakeholderName}
                                    internalTrend={item.internalTrend}
                                    internalMagnitude={item.internalMagnitude}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ gameState, countdown, isTimerPaused, onTogglePause, onAdvanceTime, onOpenSidebar, showPauseControl = true, periodDuration = 90, globalEffectsHighlight, recentInternalResolution, dailySummary, title, subtitle, logoUrl }) => {
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
                <ResolutionStat summary={dailySummary} history={gameState.dailyResolutions} decisionLog={gameState.decisionLog} stakeholders={gameState.stakeholders} recentInternal={recentInternalResolution} />
                <GlobalStat label="Reputación" value={gameState.reputation} highlight={reputationHighlight} accentClass="bg-amber-300" barMax={100} />
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
                    showPauseControl={showPauseControl}
                 />
            </div>
        </div>
      </div>
      <style>{`
        @keyframes header-arrow-float-up {
          0%, 100% { transform: translateY(2px); opacity: 0.7; }
          50% { transform: translateY(-2px); opacity: 1; }
        }
        @keyframes header-arrow-float-down {
          0%, 100% { transform: translateY(-2px); opacity: 0.7; }
          50% { transform: translateY(2px); opacity: 1; }
        }
      `}</style>
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
