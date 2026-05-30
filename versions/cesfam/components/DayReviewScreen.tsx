import React, { useState } from 'react';
import { DailyResolution } from '../../../types';
import { CesfamDayReviewData } from '../services/dayReview';

interface DayReviewScreenProps {
  data: CesfamDayReviewData;
  resolution: DailyResolution | null;
  onContinue: () => void;
}

const formatSigned = (value: number) => {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '0';
};

const deltaTone = (value: number) => {
  if (value > 0) return 'text-emerald-300';
  if (value < 0) return 'text-rose-300';
  return 'text-slate-300';
};

const pillTone = (positive: boolean) =>
  positive
    ? 'border-emerald-300/30 bg-emerald-500/12 text-emerald-100'
    : 'border-rose-300/30 bg-rose-500/12 text-rose-100';

const outcomeLabel = (status: 'completed' | 'failed') =>
  status === 'completed' ? 'Cumplido' : 'Incumplido';

const outcomeTone = (status: 'completed' | 'failed') =>
  status === 'completed'
    ? 'border-emerald-300/30 bg-emerald-500/12 text-emerald-100'
    : 'border-rose-300/30 bg-rose-500/12 text-rose-100';

const NAME_PREFIXES = new Set(['Dr.', 'Dra.', 'Enf.', 'Sr.', 'Sra.', 'Lic.']);

const shortenName = (fullName: string): string => {
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstWord = parts.find((part) => !NAME_PREFIXES.has(part));
  return firstWord ?? fullName;
};

const formatNameList = (names: string[]): string => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  const head = names.slice(0, -1).join(', ');
  return `${head} y ${names[names.length - 1]}`;
};

const DayReviewScreen: React.FC<DayReviewScreenProps> = ({ data, resolution, onContinue }) => {
  const [showDetail, setShowDetail] = useState(false);

  const completedResolutions = data.resolutionItems.filter((r) => r.status === 'completed').length;
  const totalResolutions = data.resolutionItems.length;

  const spokenShortNames = data.spokenStakeholders.slice(0, 4).map((s) => shortenName(s.name));

  const visiblePendings = data.pendingCommitments.slice(0, 5);
  const extraPendings = Math.max(0, data.pendingCommitments.length - visiblePendings.length);

  const hasAnyHighlight =
    spokenShortNames.length > 0 || totalResolutions > 0 || data.reputationDelta !== 0;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.2),_rgba(2,6,23,0.96)_55%)] px-4 py-6 text-white backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-blue-950/80 bg-slate-950/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        {/* Continuar arriba — siempre visible, sin scroll */}
        <div className="flex flex-col items-center gap-3 border-b border-white/10 px-6 py-6">
          <button
            type="button"
            onClick={onContinue}
            className="day-review-continue group inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-yellow-200/80 bg-gradient-to-r from-yellow-300 to-yellow-200 px-8 py-4 text-base font-bold uppercase tracking-wide text-slate-950 transition-transform hover:scale-[1.015]"
          >
            <span>Continuar al {data.nextDayLabel.toLowerCase()}</span>
            <span className="text-xl leading-none transition-transform group-hover:translate-x-1">→</span>
          </button>
          <p className="text-center text-xs text-slate-400">
            El reloj queda pausado. Tomate un momento antes de continuar.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <h2 className="text-2xl font-semibold">Cierre del {data.completedDayLabel}</h2>
          <p className="mt-1 text-sm text-slate-400">
            Una pausa para mirar lo que dejaste instalado hoy.
          </p>

          {/* Tres highlights */}
          <div className="mt-6 space-y-3">
            {spokenShortNames.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-2xl leading-none">🤝</span>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Conexiones</div>
                  <div className="mt-1 text-base text-white">
                    Conectaste con <span className="font-semibold">{formatNameList(spokenShortNames)}</span>.
                  </div>
                </div>
              </div>
            )}

            {totalResolutions > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-2xl leading-none">⚖️</span>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Compromisos del día</div>
                  <div className="mt-1 text-base text-white">
                    Sostuviste <span className="font-semibold">{completedResolutions} de {totalResolutions}</span> compromisos.
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span className="text-2xl leading-none">📈</span>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-slate-400">Reputación</div>
                <div className={`mt-1 text-base ${deltaTone(data.reputationDelta)}`}>
                  Reputación del día:{' '}
                  <span className="font-semibold">{formatSigned(data.reputationDelta)}</span>
                </div>
              </div>
            </div>

            {!hasAnyHighlight && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
                Día de transición — sin interacciones registradas.
              </div>
            )}
          </div>

          {/* Pendientes */}
          {visiblePendings.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
                Lo que dejaste pendiente
              </div>
              <ul className="space-y-1.5 text-sm text-slate-100">
                {visiblePendings.map((pending) => (
                  <li key={pending.id} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-300" />
                    <span>{pending.title}</span>
                  </li>
                ))}
                {extraPendings > 0 && (
                  <li className="pl-3.5 text-xs text-amber-200/70">
                    y {extraPendings} {extraPendings === 1 ? 'compromiso más' : 'compromisos más'}…
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Detalle colapsable */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDetail((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <span>
                {showDetail ? 'Ocultar detalle del día' : 'Ver detalle del día'}
                <span className="ml-2 text-xs text-slate-500">
                  ({data.decisionCount}{' '}
                  {data.decisionCount === 1 ? 'registro' : 'registros'})
                </span>
              </span>
              <span className={`transition-transform ${showDetail ? 'rotate-90' : ''}`}>▸</span>
            </button>

            {showDetail && (
              <div className="mt-3 space-y-4">
                <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-sm font-semibold text-white">Decisiones y acciones</h3>
                  {data.decisions.length === 0 ? (
                    <div className="mt-2 text-xs text-slate-400">
                      No registraste decisiones o acciones estructuradas durante este día.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {data.decisions.map((decision) => (
                        <div
                          key={decision.id}
                          className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white">
                                {decision.stakeholderName}
                              </div>
                              <div className="mt-1 text-sm text-slate-300">{decision.choiceText}</div>
                            </div>
                            {decision.reputationDelta !== 0 && (
                              <div
                                className={`shrink-0 text-xs font-semibold ${deltaTone(decision.reputationDelta)}`}
                              >
                                Rep. {formatSigned(decision.reputationDelta)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {(data.resolutionItems.length > 0 || data.internalChanges.length > 0) && (
                  <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="text-sm font-semibold text-white">Resoluciones y efectos</h3>

                    {data.resolutionItems.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {data.resolutionItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2"
                          >
                            <span className="text-sm text-slate-100">{item.title}</span>
                            <span
                              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${outcomeTone(item.status)}`}
                            >
                              {outcomeLabel(item.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {data.internalChanges.length > 0 && (
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {data.internalChanges.map((change) => (
                          <div
                            key={change.id}
                            className="rounded-xl border border-white/10 bg-black/15 px-3 py-2"
                          >
                            <div className="text-sm font-semibold text-white">{change.stakeholderName}</div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                              {change.trustDelta !== 0 && (
                                <span className={`rounded-full border px-2 py-0.5 ${pillTone(change.trustDelta > 0)}`}>
                                  Confianza {formatSigned(change.trustDelta)}
                                </span>
                              )}
                              {change.supportDelta !== 0 && (
                                <span className={`rounded-full border px-2 py-0.5 ${pillTone(change.supportDelta > 0)}`}>
                                  Apoyo {formatSigned(change.supportDelta)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {resolution && Number(resolution.global_deltas?.reputation ?? 0) !== 0 && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-slate-300">
                        Reputación automática del cierre:{' '}
                        <span
                          className={`font-semibold ${deltaTone(Number(resolution.global_deltas?.reputation ?? 0))}`}
                        >
                          {formatSigned(Number(resolution.global_deltas?.reputation ?? 0))}
                        </span>
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .day-review-continue {
          box-shadow:
            0 0 22px rgba(250, 204, 21, 0.85),
            0 0 48px rgba(250, 204, 21, 0.45),
            0 16px 30px rgba(0, 0, 0, 0.45);
          animation: day-review-glow 1.8s ease-in-out infinite alternate;
        }
        .day-review-continue:hover {
          box-shadow:
            0 0 32px rgba(250, 204, 21, 1),
            0 0 64px rgba(250, 204, 21, 0.6),
            0 16px 30px rgba(0, 0, 0, 0.45);
        }
        @keyframes day-review-glow {
          from { filter: brightness(1); }
          to   { filter: brightness(1.08); }
        }
      `}</style>
    </div>
  );
};

export default DayReviewScreen;
