import React from 'react';
import { GlobalEffectsUI, PlayerAction } from '../types';
import { logEvent } from '../services/Timelogger';

interface DecisionCardDeckProps {
  options: PlayerAction[];
  disabled: boolean;
  onOptionSelected: (action: PlayerAction) => void;
  onHoverEffects?: (effects: GlobalEffectsUI | null) => void;
}

type ThrowDirection = 'left' | 'right';

interface PreviewPlacement {
  bottom: number;
  left: number;
  width: number;
  minHeight: number;
}

const CARD_THROW_SOUND_BASE64 =
  'data:audio/mpeg;base64,//uQxAAADhYAAAB9AAAACAAADSAAAAEsAAABkYXRhAAAAAA==';

const getOptionIcon = (action: PlayerAction) => {
  if (action.cardEmoji) return action.cardEmoji;
  if (action.uiVariant === 'danger') return '!';
  if (action.uiVariant === 'success') return '+';

  const risk = (action.riskLevel || '').toLowerCase();
  if (risk === 'high') return '^';
  if (risk === 'medium') return '*';
  if (risk === 'low') return 'o';

  return '#';
};

const DecisionCardDeck: React.FC<DecisionCardDeckProps> = ({
  options,
  disabled,
  onOptionSelected,
  onHoverEffects
}) => {
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const [previewPlacement, setPreviewPlacement] = React.useState<PreviewPlacement | null>(null);
  const [previewAnimatedIn, setPreviewAnimatedIn] = React.useState(false);
  const [throwingId, setThrowingId] = React.useState<string | null>(null);
  const [directionById, setDirectionById] = React.useState<Record<string, ThrowDirection>>({});

  const soundRef = React.useRef<HTMLAudioElement | null>(null);
  const cardRefs = React.useRef<Record<string, HTMLArticleElement | null>>({});
  const closeTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const audio = new Audio(CARD_THROW_SOUND_BASE64);
    audio.volume = 0.35;
    soundRef.current = audio;
  }, []);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const updatePreviewPlacement = React.useCallback((actionId: string) => {
    const card = cardRefs.current[actionId];
    if (!card) {
      setPreviewPlacement(null);
      return;
    }

    const rect = card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const width = rect.width;
    const left = Math.min(Math.max(12, rect.left), Math.max(12, viewportWidth - width - 12));
    const bottom = Math.max(12, window.innerHeight - rect.bottom);
    const minHeight = Math.ceil(rect.height + 64);

    setPreviewPlacement({ bottom, left, width, minHeight });
  }, []);

  React.useEffect(() => {
    const optionIds = new Set(options.map((option) => option.action));

    if (previewId && !optionIds.has(previewId)) {
      setPreviewId(null);
      setPreviewPlacement(null);
      setPreviewAnimatedIn(false);
    }

    if (throwingId && !optionIds.has(throwingId)) {
      setThrowingId(null);
    }
  }, [options, previewId, throwingId]);

  React.useEffect(() => {
    if (!previewId) return;

    const onViewportChange = () => updatePreviewPlacement(previewId);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [previewId, updatePreviewPlacement]);

  React.useEffect(() => {
    if (!previewId) {
      setPreviewAnimatedIn(false);
      return;
    }

    setPreviewAnimatedIn(false);
    const frame = window.requestAnimationFrame(() => setPreviewAnimatedIn(true));
    return () => window.cancelAnimationFrame(frame);
  }, [previewId]);

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const schedulePreviewClose = (actionId: string) => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setPreviewId((current) => {
        if (current !== actionId) return current;
        onHoverEffects?.(null);
        setPreviewPlacement(null);
        setPreviewAnimatedIn(false);
        return null;
      });
    }, 140);
  };

  const openPreview = (action: PlayerAction) => {
    if (disabled || action.isLocked || throwingId) return;
    clearCloseTimer();
    setPreviewId(action.action);
    updatePreviewPlacement(action.action);
  };

  const handleHoverIn = (action: PlayerAction) => {
    logEvent('hover_enter', { option_id: action.action });
    const effects = action.globalEffectsUI;
    const hasEffects = effects && Object.keys(effects).length > 0;
    onHoverEffects?.(hasEffects ? effects : null);
  };

  const handleHoverOut = (action: PlayerAction) => {
    logEvent('hover_leave', { option_id: action.action });
    onHoverEffects?.(null);
  };

  const handleActivate = (action: PlayerAction) => {
    if (disabled || action.isLocked || throwingId) return;

    if (previewId !== action.action) {
      openPreview(action);
      return;
    }

    const direction: ThrowDirection = Math.random() > 0.5 ? 'right' : 'left';
    setDirectionById((prev) => ({ ...prev, [action.action]: direction }));
    setThrowingId(action.action);
    soundRef.current?.play().catch(() => {});

    window.setTimeout(() => {
      onOptionSelected(action);
      setThrowingId(null);
      setPreviewId(null);
      setPreviewPlacement(null);
      setPreviewAnimatedIn(false);
    }, 320);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: PlayerAction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate(action);
    }
  };

  const previewAction = previewId ? options.find((action) => action.action === previewId) ?? null : null;
  const isThrowingPreview = previewId !== null && previewId === throwingId;
  const throwDirection = previewId ? directionById[previewId] || 'right' : 'right';

  return (
    <div className="relative overflow-visible">
      <div
        className="relative z-10 grid items-stretch gap-3 pb-2"
        style={{ gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, minmax(0, 1fr))` }}
      >
        {options.map((action, idx) => {
          const hasPreview = previewId !== null;
          const isDimmed = hasPreview && previewId !== action.action;
          const isActive = previewId === action.action;

          return (
            <article
              key={`${action.action}-${idx}`}
              ref={(node) => {
                cardRefs.current[action.action] = node;
              }}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled || action.isLocked}
              onMouseEnter={() => {
                handleHoverIn(action);
                openPreview(action);
              }}
              onMouseLeave={() => {
                handleHoverOut(action);
                schedulePreviewClose(action.action);
              }}
              onFocus={() => {
                handleHoverIn(action);
                openPreview(action);
              }}
              onBlur={() => {
                handleHoverOut(action);
                schedulePreviewClose(action.action);
              }}
              onKeyDown={(e) => handleKeyDown(e, action)}
              onClick={() => handleActivate(action)}
              className={`min-w-0 rounded-2xl border bg-gradient-to-b from-slate-800/95 to-slate-950/95 select-none transition-all duration-200 ${
                isActive ? 'border-cyan-300/80 shadow-[0_20px_36px_rgba(0,0,0,0.52)]' : 'border-slate-600/80 shadow-[0_14px_30px_rgba(0,0,0,0.45)]'
              } ${isDimmed ? 'opacity-45' : ''} ${action.isLocked || disabled ? 'opacity-55' : ''}`}
              style={{
                width: '100%',
                cursor: isActive ? 'grabbing' : 'grab',
                transform: 'translate3d(0,0,0)'
              }}
            >
              <div className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center text-2xl font-bold text-slate-100">
                    {getOptionIcon(action)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white text-[15px] leading-snug break-words whitespace-normal">
                      {action.label}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {previewAction && previewPlacement && (
        <article
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || previewAction.isLocked}
          onMouseEnter={() => {
            clearCloseTimer();
            handleHoverIn(previewAction);
            updatePreviewPlacement(previewAction.action);
          }}
          onMouseLeave={() => {
            handleHoverOut(previewAction);
            schedulePreviewClose(previewAction.action);
          }}
          onKeyDown={(e) => handleKeyDown(e, previewAction)}
          onClick={() => handleActivate(previewAction)}
          className="fixed z-[140] rounded-2xl border border-cyan-300/90 bg-gradient-to-b from-slate-800 to-slate-950 text-white shadow-[0_30px_60px_rgba(0,0,0,0.62)]"
          style={{
            bottom: previewPlacement.bottom,
            left: previewPlacement.left,
            width: previewPlacement.width,
            minHeight: previewPlacement.minHeight,
            maxHeight: '72vh',
            overflowY: 'auto',
            cursor: 'grabbing',
            transition: 'transform 360ms cubic-bezier(0.2,0.9,0.2,1), opacity 280ms ease',
            transform: isThrowingPreview
              ? throwDirection === 'right'
                ? 'translate3d(140%, 0, 0) rotate(12deg)'
                : 'translate3d(-140%, 0, 0) rotate(-12deg)'
              : previewAnimatedIn
              ? 'translate3d(0,0,0) scale(1.01)'
              : 'translate3d(0,18px,0) scale(0.98)',
            transformOrigin: 'bottom center',
            opacity: isThrowingPreview ? 0 : 1
          }}
        >
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-slate-100 break-words whitespace-normal">
              {previewAction.description || previewAction.label}
            </p>
          </div>
        </article>
      )}
    </div>
  );
};

export default DecisionCardDeck;
