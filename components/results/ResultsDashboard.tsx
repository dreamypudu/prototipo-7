import React from 'react';
import { SessionResults } from './sessionResults';

// Radar nativo (sin libreria de charts). Valores 0..max sobre N ejes.
const Radar: React.FC<{ data: { axis: string; value: number }[]; max?: number }> = ({ data, max = 4 }) => {
  const size = 320, c = size / 2, r = c - 48, n = data.length;
  const pt = (i: number, radius: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + radius * Math.cos(a), c + radius * Math.sin(a)];
  };
  const ring = (frac: number) => data.map((_, i) => pt(i, r * frac).join(',')).join(' ');
  const shape = data.map((d, i) => pt(i, r * (Math.max(0, d.value) / max)).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px]" role="img" aria-label="Perfil de liderazgo">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="rgba(148,163,184,0.18)" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, r);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(148,163,184,0.18)" />;
      })}
      <polygon points={shape} fill="rgba(34,211,238,0.25)" stroke="#22D3EE" strokeWidth={2} />
      {data.map((d, i) => {
        const [x, y] = pt(i, r + 16);
        return (
          <text key={d.axis} x={x} y={y} fill="#cbd5e1" fontSize={11} fontWeight={700}
            textAnchor={x < c - 5 ? 'end' : x > c + 5 ? 'start' : 'middle'} dominantBaseline="middle">
            {d.axis}
          </text>
        );
      })}
    </svg>
  );
};

const ResultsDashboard: React.FC<{ results: SessionResults; onClose: () => void }> = ({ results, onClose }) => {
  const kindColor = { good: 'text-emerald-300', risk: 'text-rose-300', info: 'text-sky-300' } as const;
  const kindIcon = { good: '✓', risk: '⚠', info: 'ℹ' } as const;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
      <div className="my-6 w-full max-w-4xl rounded-2xl border border-cyan-300/25 bg-slate-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300/80">Tu perfil conductual</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{results.headline.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{results.headline.subtitle}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-sm text-slate-300 hover:bg-white/10">Cerrar</button>
        </div>

        {results.status === 'mock' && (
          <div className="mb-6 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
            Datos de ejemplo. La pipeline de análisis aún no está conectada.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Radar liderazgo */}
          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="mb-2 text-sm font-bold text-white">Estilo de liderazgo (MLQ-5X)</h3>
            <div className="flex justify-center"><Radar data={results.leadership} /></div>
          </section>

          {/* Dice vs Hace */}
          <section className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Dice vs. Hace</h3>
              <span className="text-sm font-bold text-cyan-300">{results.consistency_pct}% cumplido</span>
            </div>
            <ul className="space-y-2">
              {results.diceVsHace.map((d, i) => (
                <li key={i} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <div className="flex items-start gap-2">
                    <span className={d.kept ? 'text-emerald-400' : 'text-rose-400'}>{d.kept ? '✓' : '✗'}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-100">{d.promise}</p>
                      <p className="text-[11px] text-slate-400">{d.detail}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Métricas conductuales */}
        <section className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-white">Cómo te comportaste</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.behavior.map((b) => (
              <div key={b.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">{b.label}</div>
                <div className="mt-1 text-xl font-bold text-cyan-200">{b.value}</div>
                <div className="mt-1 text-[11px] text-slate-400">{b.hint}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Highlights */}
        <section className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <h3 className="mb-2 text-sm font-bold text-white">Lo más importante</h3>
          <ul className="space-y-1.5">
            {results.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={kindColor[h.kind]}>{kindIcon[h.kind]}</span>
                <span className="text-slate-200">{h.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ResultsDashboard;
