import React from 'react';
import { DailyResolution } from '../types';
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

const DayReviewScreen: React.FC<DayReviewScreenProps> = ({ data, resolution, onContinue }) => {
  return (
    <div className="fixed inset-0 z-[180] bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.2),_rgba(2,6,23,0.96)_55%)] px-4 py-5 text-white backdrop-blur-sm md:px-6">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-blue-950/80 bg-slate-950/94 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="border-b border-white/10 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-blue-200/75">Cierre diario</div>
              <h2 className="mt-2 text-3xl font-semibold">Cierre del {data.completedDayLabel}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                El reloj queda detenido. Revisa lo que instalaste hoy antes de abrir el {data.nextDayLabel.toLowerCase()}.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Reputación del día</div>
              <div className={`mt-2 text-4xl font-semibold ${deltaTone(data.reputationDelta)}`}>{formatSigned(data.reputationDelta)}</div>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-5 overflow-y-auto px-6 py-5 md:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] md:px-8">
          <div className="space-y-5">
            <section className="rounded-2xl border border-blue-950/80 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Decisiones tomadas</h3>
                  <p className="text-sm text-slate-400">{data.decisionCount} decisiones registradas durante el día.</p>
                </div>
              </div>
              {data.decisions.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-4 text-sm text-slate-400">
                  No registraste decisiones con impacto directo durante este día.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.decisions.map((decision) => (
                    <div key={decision.id} className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{decision.stakeholderName}</div>
                          <div className="mt-1 text-sm text-slate-300">{decision.choiceText}</div>
                        </div>
                        <div className={`shrink-0 text-sm font-semibold ${deltaTone(decision.reputationDelta)}`}>
                          Rep. {formatSigned(decision.reputationDelta)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-blue-950/80 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Resoluciones y efectos</h3>
                  <p className="text-sm text-slate-400">Lo que quedó cumplido o tensionado al cierre del día.</p>
                </div>
              </div>
              <div className="space-y-4">
                {data.resolutionItems.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-4 text-sm text-slate-400">
                    No hubo compromisos que resolvieran automáticamente al cierre de este día.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.resolutionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                        <span className="text-sm text-slate-100">{item.title}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${outcomeTone(item.status)}`}>
                          {outcomeLabel(item.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {data.internalChanges.length > 0 && (
                  <div className="grid gap-2 md:grid-cols-2">
                    {data.internalChanges.map((change) => (
                      <div key={change.id} className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                        <div className="text-sm font-semibold text-white">{change.stakeholderName}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {change.trustDelta !== 0 && (
                            <span className={`rounded-full border px-2.5 py-1 ${pillTone(change.trustDelta > 0)}`}>
                              Confianza {formatSigned(change.trustDelta)}
                            </span>
                          )}
                          {change.supportDelta !== 0 && (
                            <span className={`rounded-full border px-2.5 py-1 ${pillTone(change.supportDelta > 0)}`}>
                              Apoyo {formatSigned(change.supportDelta)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resolution && Number(resolution.global_deltas?.reputation ?? 0) !== 0 && (
                  <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-200">
                    Reputación automática del cierre: <span className={`font-semibold ${deltaTone(Number(resolution.global_deltas?.reputation ?? 0))}`}>{formatSigned(Number(resolution.global_deltas?.reputation ?? 0))}</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-blue-950/80 bg-white/[0.04] p-5">
              <h3 className="text-lg font-semibold">Con quién hablaste</h3>
              <p className="mt-1 text-sm text-slate-400">Actores con interacción efectiva durante el día.</p>
              {data.spokenStakeholders.length === 0 ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/15 px-4 py-4 text-sm text-slate-400">
                  No quedaron conversaciones registradas en este tramo.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {data.spokenStakeholders.map((stakeholder) => (
                    <div key={stakeholder.id} className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
                      <div className="text-sm font-semibold text-white">{stakeholder.name}</div>
                      <div className="mt-1 text-sm text-slate-400">{stakeholder.role}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-blue-950/80 bg-white/[0.04] p-5">
              <h3 className="text-lg font-semibold">Preparación del siguiente día</h3>
              <p className="mt-2 text-sm text-slate-300">
                Cuando continúes, comenzará el {data.nextDayLabel.toLowerCase()} y volverán a activarse correos, agenda y secuencias inevitables.
              </p>
              <button
                type="button"
                onClick={onContinue}
                className="mt-5 w-full rounded-2xl border border-blue-800 bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(29,78,216,0.35)] transition hover:bg-blue-600"
              >
                Iniciar {data.nextDayLabel}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayReviewScreen;
