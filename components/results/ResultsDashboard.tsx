import React, { useEffect, useMemo, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ResultTone, SessionResults } from './sessionResults';

const HEADER_COMPASS_LOGO_URL = '/assets/common/logos/logo-animado-compass.svg';
const HEADER_COMPASS_STATIC_LOGO_URL = '/assets/common/logos/logo-compass.svg';
const COMPASS_ICON_URL = '/assets/common/logos/icono-compass.svg';
const HEADER_LOGO_ANIMATION_MS = 4000;
const HEADER_LOGO_PAUSE_MS = 1000;

type IndicatorView = {
  id: string;
  name: string;
  technical: string;
  question: string;
  value: string;
  score: number;
  tone: ResultTone;
  evidence: string;
};

type IconName = 'analyze' | 'appendix' | 'chart' | 'close' | 'download' | 'evidence' | 'file' | 'gap' | 'growth' | 'profile' | 'risk' | 'stakeholder' | 'summary' | 'target' | 'timeline';

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = 'h-4 w-4' }) => {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
    viewBox: '0 0 24 24',
  };
  const paths: Record<IconName, React.ReactNode> = {
    analyze: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 4-4 3 3 5-7" /><path d="M18 7h1v1" /></>,
    appendix: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h6" /></>,
    chart: <><path d="M4 19h16" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-4" /></>,
    close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    evidence: <><path d="M9 11 11 13 15 9" /><path d="M20 11.5V8l-8-5-8 5v8l8 5 3.5-2.2" /><path d="M17 17h4" /><path d="M19 15v4" /></>,
    file: <><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5" /></>,
    gap: <><path d="M4 7h7" /><path d="M13 7h7" /><path d="M4 17h7" /><path d="M13 17h7" /><path d="M11 7v10" /><path d="M13 7v10" /></>,
    growth: <><path d="M4 19h16" /><path d="M6 16c4-7 7-8 12-11" /><path d="M14 5h4v4" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    risk: <><path d="m12 3 10 18H2z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    stakeholder: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 21a6 6 0 0 1 12 0" /><path d="M14 21a5 5 0 0 1 8 0" /></>,
    summary: <><path d="M4 5h16" /><path d="M4 12h10" /><path d="M4 19h7" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3" /><path d="M22 12h-3" /><path d="M12 22v-3" /><path d="M2 12h3" /></>,
    timeline: <><path d="M5 5v14" /><circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><path d="M9 6h10" /><path d="M9 18h10" /><path d="M12 12h7" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
};

const toneStyles: Record<ResultTone, { label: string; text: string; bg: string; border: string; chart: string }> = {
  good: { label: 'Fortaleza', text: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200', chart: '#047857' },
  info: { label: 'Senal', text: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200', chart: '#1E40AF' },
  risk: { label: 'Alerta', text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200', chart: '#DC2626' },
};

const indicatorCopy: Record<string, Pick<IndicatorView, 'name' | 'technical' | 'question'>> = {
  intention_action_gap: {
    name: 'Brecha dice vs hace',
    technical: 'Intention-Action Gap',
    question: 'Cumple lo que declara?',
  },
  leadership_failure_point: {
    name: 'Punto de quiebre',
    technical: 'Leadership Failure Point',
    question: 'Donde se debilita su liderazgo?',
  },
  role_transition_risk: {
    name: 'Riesgo de transicion',
    technical: 'Role Transition Risk',
    question: 'Esta preparado para un rol mas complejo?',
  },
  ethical_drift: {
    name: 'Deriva etica',
    technical: 'Ethical Drift',
    question: 'Mantiene sus criterios cuando hay costo?',
  },
  learning_velocity: {
    name: 'Velocidad de aprendizaje',
    technical: 'Learning Velocity',
    question: 'Mejora despues de recibir consecuencias?',
  },
  decision_signature: {
    name: 'Firma conductual',
    technical: 'Behavioral Signature',
    question: 'Cual es su patron de decision?',
  },
};

const benchmarkData = [
  { name: 'Dice vs hace', value: 42, target: 65 },
  { name: 'Informacion', value: 71, target: 60 },
  { name: 'Aprendizaje', value: 76, target: 62 },
  { name: 'Transicion', value: 38, target: 58 },
];

const trajectoryData = [
  { day: 'D1', pressure: 25, consistency: 82, learning: 38 },
  { day: 'D2', pressure: 42, consistency: 70, learning: 46 },
  { day: 'D3', pressure: 58, consistency: 64, learning: 55 },
  { day: 'D4', pressure: 75, consistency: 48, learning: 67 },
  { day: 'D5', pressure: 86, consistency: 41, learning: 78 },
];

const decisionTreeNodes = [
  {
    id: 'd1',
    day: 'D1',
    title: 'Declara escucha activa',
    detail: 'Inicio con equipo clinico. Promete levantar informacion antes de ajustar agenda.',
    x: 6,
    y: 42,
    tone: 'good' as ResultTone,
  },
  {
    id: 'd2a',
    day: 'D2',
    title: 'Visita Sector Azul',
    detail: 'Prioriza una demanda visible, pero desplaza el compromiso asociado al Sector Rojo.',
    x: 28,
    y: 22,
    tone: 'risk' as ResultTone,
  },
  {
    id: 'd2b',
    day: 'D2',
    title: 'Omite alerta de sobrecarga',
    detail: 'La senal queda registrada, pero no se transforma inmediatamente en accion.',
    x: 28,
    y: 62,
    tone: 'risk' as ResultTone,
  },
  {
    id: 'd3',
    day: 'D3',
    title: 'Revisa protocolo',
    detail: 'Antes de resolver urgencia, consulta evidencia documental y mejora calidad decisional.',
    x: 50,
    y: 38,
    tone: 'good' as ResultTone,
  },
  {
    id: 'd4',
    day: 'D4',
    title: 'Ajusta carga clinica',
    detail: 'Tras feedback, reasigna carga de Javier a 50%. Muestra aprendizaje observable.',
    x: 72,
    y: 24,
    tone: 'good' as ResultTone,
  },
  {
    id: 'd5',
    day: 'D5',
    title: 'Cierre multi-actor',
    detail: 'Bajo presion, baja la consistencia y reaparece la brecha de seguimiento.',
    x: 72,
    y: 62,
    tone: 'info' as ResultTone,
  },
  {
    id: 'out',
    day: 'Cierre',
    title: 'Perfil analitico-reactivo',
    detail: 'Explora evidencia, aprende de feedback, pero acelera decisiones bajo presion social.',
    x: 90,
    y: 42,
    tone: 'info' as ResultTone,
  },
];

const decisionTreeEdges = [
  ['d1', 'd2a'],
  ['d1', 'd2b'],
  ['d2a', 'd3'],
  ['d2b', 'd3'],
  ['d3', 'd4'],
  ['d3', 'd5'],
  ['d4', 'out'],
  ['d5', 'out'],
];

const stakeholderRows = [
  { name: 'Equipo clinico', trust: 'Alta', support: 'Media', questions: 4, signals: 1, commitments: '2/3' },
  { name: 'Jefatura', trust: 'Media', support: 'Alta', questions: 1, signals: 0, commitments: '1/1' },
  { name: 'Usuarios finales', trust: 'Baja', support: 'Baja', questions: 0, signals: 3, commitments: '0/2' },
];

const predictiveModels = [
  {
    title: 'Preparacion para rol superior',
    value: 'Media',
    detail: 'Buen desempeno operativo con alerta en conflicto multi-actor y seguimiento de compromisos.',
  },
  {
    title: 'Riesgo de transicion',
    value: 'Moderado',
    detail: 'El riesgo aparece al pasar de ejecucion individual a coordinacion con multiples actores.',
  },
  {
    title: 'Entrenabilidad de brechas',
    value: 'Alta',
    detail: 'La conducta mejora despues de feedback y consecuencias negativas dentro de la simulacion.',
  },
];

const rankingItems = [
  'Seguimiento de compromisos bajo presion',
  'Priorizacion multi-actor',
  'Conversaciones dificiles',
];

const meetingRows = [
  { day: 'D1', meeting: 'Inicio con equipo clinico', focus: 'Alineamiento y expectativas', signal: 'Declara escucha activa' },
  { day: 'D1', meeting: 'Reunion con jefatura', focus: 'Metas institucionales', signal: 'Prioriza continuidad operacional' },
  { day: 'D2', meeting: 'Sector Rojo', focus: 'Sobrecarga y agenda', signal: 'Omite una advertencia critica' },
  { day: 'D3', meeting: 'Comite de urgencias', focus: 'Protocolo y riesgo clinico', signal: 'Busca evidencia documental' },
  { day: 'D4', meeting: 'Conversacion con funcionario', focus: 'Carga laboral', signal: 'Ajusta decision tras feedback' },
  { day: 'D5', meeting: 'Cierre multi-actor', focus: 'Conflicto entre sectores', signal: 'Cae seguimiento bajo presion' },
];

const actionRows = [
  { type: 'Documento', action: 'Reviso protocolo de urgencias', moment: 'Antes de decidir', impact: 'Mejora calidad de evidencia' },
  { type: 'Agenda', action: 'Reservo bloque para reunion clinica', moment: 'D3 tarde', impact: 'Cumple compromiso parcial' },
  { type: 'Mapa', action: 'Visito Sector Azul primero', moment: 'D2 manana', impact: 'Desplaza compromiso con Sector Rojo' },
  { type: 'Pregunta', action: 'Consulta a jefatura por restricciones', moment: 'D4 manana', impact: 'Reduce incertidumbre politica' },
  { type: 'Correo', action: 'Abre alerta de sobrecarga', moment: 'D5 tarde', impact: 'Detecta senal tarde' },
  { type: 'Agenda', action: 'Reasigna carga clinica de Javier', moment: 'D5 cierre', impact: 'Recupera confianza del equipo' },
];

const commitmentRows = [
  { promise: 'Escuchar al equipo antes de cambios de agenda', expected: 'Visitar Sector Rojo', actual: 'Visita Sector Azul', result: 'Brecha' },
  { promise: 'Revisar protocolo antes de resolver urgencia', expected: 'Abrir documento', actual: 'Documento revisado', result: 'Cumplido' },
  { promise: 'Aliviar carga de funcionario sobreexigido', expected: 'Bajar carga a 60% o menos', actual: 'Carga ajustada a 50%', result: 'Cumplido' },
  { promise: 'Sostener cupos docentes', expected: 'Reservar Box 1', actual: 'Box asignado a otro actor', result: 'Brecha' },
  { promise: 'Levantar informacion de usuarios finales', expected: 'Consultar senales del caso', actual: 'No consulta directa', result: 'Brecha' },
];

const indicatorAnalysis: Record<string, { title: string; verdict: string; examples: string[]; recommendation: string }> = {
  intention_action_gap: {
    title: 'Analisis de brecha dice vs hace',
    verdict: 'La brecha aparece porque varias promesas colaborativas no se traducen en acciones posteriores cuando sube la presion operacional.',
    examples: [
      'Declara que escuchara al equipo antes de decidir, pero visita primero al Sector Azul cuando el compromiso critico estaba asociado al Sector Rojo.',
      'Promete sostener cupos docentes, pero el recurso clave termina asignado a otro actor.',
      'Cuando la decision tiene costo politico, privilegia resolver rapido sobre cerrar el compromiso original.',
    ],
    recommendation: 'Entrenar seguimiento de acuerdos con recordatorios visibles, priorizacion multi-actor y cierre explicito de compromisos.',
  },
  leadership_failure_point: {
    title: 'Analisis de punto de quiebre',
    verdict: 'El liderazgo se sostiene en interacciones simples, pero se debilita cuando debe equilibrar actores con intereses incompatibles.',
    examples: [
      'En conversaciones individuales muestra consideracion y escucha.',
      'En el cierre multi-actor, baja la consistencia y aumenta la resolucion pragmatica.',
      'La presion entre jefatura, equipo y usuarios finales reduce su balance de stakeholders.',
    ],
    recommendation: 'Practicar escenarios donde la decision correcta exige sostener una postura frente a dos grupos con demandas opuestas.',
  },
  role_transition_risk: {
    title: 'Analisis de riesgo de transicion',
    verdict: 'El riesgo es moderado porque el desempeno operativo es bueno, pero el rol superior exige mas seguimiento, delegacion y lectura politica.',
    examples: [
      'Gestiona bien acciones concretas como revisar documentos y ajustar carga.',
      'Muestra fragilidad cuando los compromisos dependen de coordinar varios actores.',
      'El patron sugiere riesgo al pasar de ejecucion individual a liderazgo sistemico.',
    ],
    recommendation: 'Acompanamiento en delegacion, gobierno de compromisos y conversaciones dificiles antes de asumir un rol mas amplio.',
  },
  ethical_drift: {
    title: 'Analisis de deriva etica',
    verdict: 'La deriva etica es baja-moderada: sostiene criterios eticos generales, pero cede parcialmente cuando actuar correctamente tiene costo operativo o politico.',
    examples: [
      'Revisa el protocolo de urgencias antes de resolver, lo que protege la calidad de la decision.',
      'Cuando aparece presion por continuidad operacional, posterga senales de usuarios finales.',
      'No hay una ruptura etica grave; el patron es mas bien una tension entre prudencia y costo institucional.',
    ],
    recommendation: 'Entrenar decisiones con costo reputacional, explicitando criterios no negociables antes de entrar en presion.',
  },
  learning_velocity: {
    title: 'Analisis de velocidad de aprendizaje',
    verdict: 'La velocidad de aprendizaje es alta porque despues de consecuencias negativas aumenta la busqueda de informacion y ajusta decisiones.',
    examples: [
      'Tras recibir feedback por sobrecarga, reasigna carga clinica a 50%.',
      'Despues de una senal ignorada, revisa documentos antes de resolver el caso de urgencia.',
      'El patron muestra capacidad de correccion, no solo justificacion del error.',
    ],
    recommendation: 'Usar feedback inmediato y simulaciones repetidas; es probable que la brecha mejore con practica dirigida.',
  },
  decision_signature: {
    title: 'Analisis de firma conductual',
    verdict: 'La firma conductual es analitico-reactiva: explora evidencia, pero acelera decisiones cuando hay presion social o institucional.',
    examples: [
      'Compara alternativas antes de elegir y revisa informacion disponible.',
      'La deliberacion baja en el tramo final con mayor conflicto.',
      'Tiende a recuperar calidad decisional cuando recibe feedback claro.',
    ],
    recommendation: 'Instalar pausas deliberativas obligatorias antes de decisiones de alto impacto.',
  },
};

const reportSections: { id: string; label: string; icon: IconName }[] = [
  { id: 'cover', label: 'Portada', icon: 'file' },
  { id: 'summary', label: 'Resumen', icon: 'summary' },
  { id: 'profile', label: 'Perfil', icon: 'profile' },
  { id: 'indicators', label: 'Indicadores', icon: 'analyze' },
  { id: 'gap', label: 'Dice vs hace', icon: 'gap' },
  { id: 'trajectory', label: 'Trayectoria', icon: 'timeline' },
  { id: 'stakeholders', label: 'Stakeholders', icon: 'stakeholder' },
  { id: 'benchmarks', label: 'Benchmarks', icon: 'chart' },
  { id: 'development', label: 'Desarrollo', icon: 'target' },
  { id: 'evidence', label: 'Evidencia', icon: 'appendix' },
];

const clamp = (value: number) => Math.max(0, Math.min(value, 100));

const ReportPage: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  children,
  className = '',
}) => (
  <section className={`report-page rounded-md border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    <div className="mb-5 border-b border-slate-200 pb-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-800">Informe Conductual</p>
      <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950">{title}</h2>
      {subtitle && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const StatusBadge: React.FC<{ tone: ResultTone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${toneStyles[tone].bg} ${toneStyles[tone].border} ${toneStyles[tone].text}`}>
    {children}
  </span>
);

const MetricBlock: React.FC<{ label: string; value: string; helper: string; tone?: ResultTone }> = ({ label, value, helper, tone = 'info' }) => (
  <div className={`rounded-md border p-4 shadow-sm ${toneStyles[tone].bg} ${toneStyles[tone].border}`}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <Icon name={tone === 'good' ? 'growth' : tone === 'risk' ? 'risk' : 'analyze'} className={`h-4 w-4 ${toneStyles[tone].text}`} />
    </div>
    <p className={`mt-2 text-3xl font-black ${toneStyles[tone].text}`}>{value}</p>
    <p className="mt-2 text-sm leading-relaxed text-slate-700">{helper}</p>
  </div>
);

const BulletChart: React.FC<{ data: typeof benchmarkData }> = ({ data }) => (
  <div className="space-y-3">
    {data.map((item) => (
      <div key={item.name}>
        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-700">{item.name}</span>
          <span className="font-bold text-slate-950">P{item.value}</span>
        </div>
        <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-800" style={{ width: `${clamp(item.value)}%` }} />
          <span className="absolute top-0 h-4 w-0.5 bg-amber-600" style={{ left: `${clamp(item.target)}%` }} />
        </div>
      </div>
    ))}
  </div>
);

const AIInterpretation: React.FC<{ summary: string }> = ({ summary }) => (
  <div className="ai-panel relative overflow-hidden rounded-md border border-blue-200 bg-[#0f3f73] p-5 text-white shadow-sm">
    <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_180px]">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/12 text-cyan-100">
            <Icon name="analyze" className="h-4 w-4" />
          </span>
          Interpretacion IA
          <span className="ai-dot ml-1 h-1.5 w-1.5 rounded-full bg-cyan-200" />
          <span className="ai-dot h-1.5 w-1.5 rounded-full bg-cyan-200 [animation-delay:160ms]" />
          <span className="ai-dot h-1.5 w-1.5 rounded-full bg-cyan-200 [animation-delay:320ms]" />
        </div>
        <p className="mt-4 text-lg leading-relaxed text-blue-50">{summary}</p>
      </div>
      <div className="hidden content-center gap-2 lg:grid">
        {[72, 48, 86, 58, 64].map((width, index) => (
          <span key={index} className="ai-bar h-2 rounded-full bg-cyan-100/80" style={{ width: `${width}%`, animationDelay: `${index * 120}ms` }} />
        ))}
      </div>
    </div>
  </div>
);

const DecisionPathTree: React.FC<{
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ selectedId, onSelect }) => {
  const selected = decisionTreeNodes.find((node) => node.id === selectedId) ?? decisionTreeNodes[0];
  const nodeById = new Map(decisionTreeNodes.map((node) => [node.id, node]));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="relative h-[360px] overflow-hidden rounded-md border border-slate-200 bg-slate-50 shadow-sm">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {decisionTreeEdges.map(([from, to]) => {
            const a = nodeById.get(from);
            const b = nodeById.get(to);
            if (!a || !b) return null;
            return (
              <path
                key={`${from}-${to}`}
                d={`M ${a.x + 4} ${a.y + 4} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x + 4} ${b.y + 4}`}
                fill="none"
                stroke={from === selectedId || to === selectedId ? '#123f73' : '#CBD5E1'}
                strokeWidth={from === selectedId || to === selectedId ? 0.7 : 0.45}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {decisionTreeNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node.id)}
            className={`absolute w-[132px] rounded-md border bg-white p-2 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              selectedId === node.id ? 'border-blue-800 ring-2 ring-blue-100' : toneStyles[node.tone].border
            }`}
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <span className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${toneStyles[node.tone].bg} ${toneStyles[node.tone].text}`}>
              {node.day}
            </span>
            <span className="block font-black leading-tight text-slate-950">{node.title}</span>
          </button>
        ))}
      </div>

      <div className={`rounded-md border p-4 shadow-sm ${toneStyles[selected.tone].bg} ${toneStyles[selected.tone].border}`}>
        <p className={`text-xs font-black uppercase tracking-[0.14em] ${toneStyles[selected.tone].text}`}>Nodo seleccionado</p>
        <h3 className="mt-2 text-xl font-black text-slate-950">{selected.title}</h3>
        <p className="mt-1 text-sm font-bold text-slate-500">{selected.day}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{selected.detail}</p>
      </div>
    </div>
  );
};

const ResultsDashboard: React.FC<{ results: SessionResults; onClose: () => void }> = ({ results, onClose }) => {
  const indicators = results.advancedIndicators
    .filter((indicator) => indicatorCopy[indicator.id])
    .map<IndicatorView>((indicator) => ({
      ...indicatorCopy[indicator.id],
      id: indicator.id,
      value: indicator.value,
      score: indicator.score,
      tone: indicator.tone,
      evidence: indicator.evidence,
    }));

  const [activeEvidence, setActiveEvidence] = useState<IndicatorView>(indicators[0]);
  const [activeSection, setActiveSection] = useState(reportSections[1].id);
  const [analysisIndicator, setAnalysisIndicator] = useState<IndicatorView | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedPathNode, setSelectedPathNode] = useState(decisionTreeNodes[0].id);
  const [logoRefreshKey, setLogoRefreshKey] = useState(0);
  const [isLogoAnimating, setIsLogoAnimating] = useState(true);
  const showSection = (id: string) => activeSection === id || activeSection === 'all';
  const keptCount = results.diceVsHace.filter((item) => item.kept).length;
  const missedCount = results.diceVsHace.length - keptCount;
  const pieData = [
    { name: 'Cumplidos', value: keptCount, color: '#047857' },
    { name: 'Incumplidos', value: missedCount, color: '#DC2626' },
  ];
  const handlePrint = () => {
    const previousSection = activeSection;
    const restore = () => setActiveSection(previousSection);
    window.addEventListener('afterprint', restore, { once: true });
    flushSync(() => setActiveSection('all'));
    window.print();
  };
  const openIndicatorAnalysis = (indicator: IndicatorView) => {
    setActiveEvidence(indicator);
    setAnalysisIndicator(indicator);
    setAnalysisLoading(true);
  };

  useEffect(() => {
    let pauseTimer: number | undefined;
    const animationTimer = window.setTimeout(() => {
      setIsLogoAnimating(false);
      pauseTimer = window.setTimeout(() => {
        setLogoRefreshKey((prev) => prev + 1);
        setIsLogoAnimating(true);
      }, HEADER_LOGO_PAUSE_MS);
    }, HEADER_LOGO_ANIMATION_MS);

    return () => {
      window.clearTimeout(animationTimer);
      if (pauseTimer !== undefined) {
        window.clearTimeout(pauseTimer);
      }
    };
  }, [logoRefreshKey]);

  const logoSrc = useMemo(() => {
    if (!isLogoAnimating) {
      return HEADER_COMPASS_STATIC_LOGO_URL;
    }
    return `${HEADER_COMPASS_LOGO_URL}?loop=${logoRefreshKey}`;
  }, [isLogoAnimating, logoRefreshKey]);

  useEffect(() => {
    if (!analysisIndicator) return;
    const timer = window.setTimeout(() => setAnalysisLoading(false), 1100);
    return () => window.clearTimeout(timer);
  }, [analysisIndicator]);

  return createPortal(
    <div className="report-modal-backdrop fixed inset-0 z-[2147483647] overflow-y-auto bg-slate-900/75 p-3 text-slate-950 backdrop-blur-sm">
      <div className="report-shell mx-auto max-w-6xl">
        <div className="report-toolbar sticky top-3 z-20 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-300/30 bg-[#123f73] px-4 py-3 shadow-[0_18px_45px_rgba(8,27,54,0.35)]">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="COMPASS"
              className="h-8 w-44 object-contain object-left"
              onError={(event) => {
                event.currentTarget.src = HEADER_COMPASS_STATIC_LOGO_URL;
              }}
            />
            <h2 className="border-l border-white/20 pl-3 text-lg font-black text-white">Informe Conductual</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-[#123f73] transition hover:bg-blue-50"
            >
              <Icon name="download" className="h-4 w-4" />
              Exportar informe PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Icon name="close" className="h-4 w-4" />
              Cerrar
            </button>
          </div>
        </div>

        <nav className="report-nav sticky top-[82px] z-10 mb-3 flex gap-2 overflow-x-auto rounded-md border border-slate-200 bg-white/95 p-2 shadow backdrop-blur">
          {reportSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                activeSection === section.id ? 'bg-[#123f73] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {section.id === 'cover' ? (
                <span className={`flex h-5 w-5 items-center justify-center rounded bg-[#123f73] p-0.5 ${activeSection === section.id ? 'bg-white/15' : ''}`}>
                  <img src={COMPASS_ICON_URL} alt="" className="h-full w-full object-contain" />
                </span>
              ) : (
                <Icon name={section.icon} className="h-4 w-4" />
              )}
              {section.label}
            </button>
          ))}
        </nav>

        <article className="report-document space-y-4 pb-6">
          <section className={`report-page rounded-md border border-slate-200 bg-white p-8 shadow-sm ${showSection('cover') ? '' : 'hidden'}`}>
            <div className="grid min-h-[520px] content-between gap-10">
              <div>
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[#123f73] p-2 shadow-sm">
                    <img src={COMPASS_ICON_URL} alt="Icono COMPASS" className="h-full w-full object-contain" />
                  </span>
                  <div className="inline-flex rounded-md bg-[#123f73] px-5 py-4 shadow-sm">
                    <img
                      src={logoSrc}
                      alt="COMPASS"
                      className="h-10 w-56 object-contain object-left"
                      onError={(event) => {
                        event.currentTarget.src = HEADER_COMPASS_STATIC_LOGO_URL;
                      }}
                    />
                  </div>
                </div>
                <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight text-slate-950">Informe Conductual</h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                  Evidencia conductual situada, interpretable y auditable para orientar decisiones de talento, desarrollo y aprendizaje.
                </p>
              </div>
              <div className="grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                <MetricBlock label="Participante" value="P-042" helper="Codigo anonimizado." />
                <MetricBlock label="Simulacion" value="CESFAM" helper="Modulo liderazgo en salud." />
                <MetricBlock label="Organizacion" value="Cliente" helper="Informe privado para gestion de talento." />
                <MetricBlock label="Fecha" value={new Date(results.generated_at).toLocaleDateString()} helper="Generado desde la sesion." />
              </div>
            </div>
          </section>

          <ReportPage title="Resumen ejecutivo" className={showSection('summary') ? '' : 'hidden'}>
            <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              <AIInterpretation summary={results.aiSummary.summary} />
              <MetricBlock
                label="Dice vs hace"
                value={`${results.consistency_pct}%`}
                helper={`${keptCount}/${results.diceVsHace.length} compromisos criticos cumplidos.`}
                tone={results.consistency_pct >= 70 ? 'good' : 'risk'}
              />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <h3 className="flex items-center gap-2 font-black text-emerald-900"><Icon name="growth" className="h-5 w-5" />Fortalezas observadas</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {results.aiSummary.strengths.map((item) => <li key={item} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />{item}</li>)}
                </ul>
              </div>
              <div className="rounded-md border border-red-200 bg-red-50 p-4 shadow-sm">
                <h3 className="flex items-center gap-2 font-black text-red-900"><Icon name="risk" className="h-5 w-5" />Riesgos relevantes</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {results.aiSummary.risks.map((item) => <li key={item} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-700" />{item}</li>)}
                </ul>
              </div>
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 shadow-sm">
                <h3 className="flex items-center gap-2 font-black text-blue-900"><Icon name="target" className="h-5 w-5" />Recomendacion prioritaria</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{results.aiSummary.nextStep}</p>
              </div>
            </div>
          </ReportPage>

          <ReportPage title="Perfil conductual observado" className={showSection('profile') ? '' : 'hidden'}>
            <div className="grid gap-5 lg:grid-cols-[0.55fr_0.45fr]">
              <div className="h-80 rounded-md border border-slate-200 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results.leadership} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" domain={[0, 4]} />
                    <YAxis type="category" dataKey="axis" width={56} />
                    <Tooltip />
                    <Bar dataKey="value" name="Puntaje MLQ-5X" fill="#1E40AF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-3">
                {results.behavior.slice(0, 6).map((metric) => (
                  <div key={metric.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-slate-900">{metric.label}</p>
                      <span className="text-lg font-black text-blue-900">{metric.value}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{metric.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </ReportPage>

          <ReportPage title="Indicadores estrategicos" className={showSection('indicators') ? '' : 'hidden'}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {indicators.map((indicator) => (
                <button
                  key={indicator.id}
                  type="button"
                  onClick={() => openIndicatorAnalysis(indicator)}
                  className={`rounded-md border bg-white p-4 text-left transition hover:border-blue-400 hover:shadow-sm ${activeEvidence.id === indicator.id ? 'border-blue-700 ring-2 ring-blue-100' : 'border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${toneStyles[indicator.tone].bg} ${toneStyles[indicator.tone].border} ${toneStyles[indicator.tone].text}`}>
                        <Icon name={indicator.tone === 'risk' ? 'risk' : indicator.tone === 'good' ? 'growth' : 'analyze'} className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-slate-950">{indicator.name}</h3>
                        <p className="text-xs font-semibold text-slate-500">{indicator.technical}</p>
                      </div>
                    </div>
                    <StatusBadge tone={indicator.tone}>{toneStyles[indicator.tone].label}</StatusBadge>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-sm font-bold text-blue-900">
                    <Icon name="summary" className="h-4 w-4" />
                    {indicator.question}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{indicator.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{indicator.evidence}</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[#123f73]" style={{ width: `${clamp(indicator.score)}%` }} />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                <Icon name="evidence" className="h-4 w-4" />
                Evidencia seleccionada
              </p>
              <h3 className="mt-2 text-xl font-black text-slate-950">{activeEvidence.name}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">{activeEvidence.technical} - {activeEvidence.question}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{activeEvidence.evidence}</p>
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Limite: esta lectura describe un patron observado en esta simulacion. Debe contrastarse con mas sesiones o evidencia externa.
              </p>
            </div>
          </ReportPage>

          <ReportPage title="Brecha dice vs hace" className={showSection('gap') ? '' : 'hidden'}>
            <div className="grid gap-5 lg:grid-cols-[0.42fr_0.58fr]">
              <div className="h-64 rounded-md border border-slate-200 p-3 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={3}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Compromiso</th>
                      <th className="px-3 py-2">Resultado</th>
                      <th className="px-3 py-2">Evidencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {results.diceVsHace.map((item) => (
                      <tr key={item.promise}>
                        <td className="px-3 py-3 font-semibold text-slate-800">{item.promise}</td>
                        <td className="px-3 py-3"><StatusBadge tone={item.kept ? 'good' : 'risk'}>{item.kept ? 'Cumplido' : 'Brecha'}</StatusBadge></td>
                        <td className="px-3 py-3 text-slate-600">{item.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ReportPage>

          <ReportPage title="Trayectoria durante la simulacion" className={showSection('trajectory') ? '' : 'hidden'}>
            <div className="h-72 rounded-md border border-slate-200 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trajectoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pressure" name="Presion" stroke="#D97706" strokeWidth={2} />
                  <Line type="monotone" dataKey="consistency" name="Consistencia" stroke="#1E40AF" strokeWidth={2} />
                  <Line type="monotone" dataKey="learning" name="Aprendizaje" stroke="#047857" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon name="timeline" className="h-5 w-5 text-blue-800" />
                <h3 className="text-lg font-black text-slate-950">Arbol de camino conductual</h3>
              </div>
              <DecisionPathTree selectedId={selectedPathNode} onSelect={setSelectedPathNode} />
            </div>
          </ReportPage>

          <ReportPage title="Stakeholders y puntos ciegos" className={showSection('stakeholders') ? '' : 'hidden'}>
            <div className="overflow-hidden rounded-md border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Stakeholder</th>
                    <th className="px-3 py-2">Relacion</th>
                    <th className="px-3 py-2">Apoyo</th>
                    <th className="px-3 py-2">Preguntas</th>
                    <th className="px-3 py-2">Senales ignoradas</th>
                    <th className="px-3 py-2">Compromisos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stakeholderRows.map((row) => (
                    <tr key={row.name}>
                      <td className="px-3 py-3 font-bold text-slate-900">{row.name}</td>
                      <td className="px-3 py-3">{row.trust}</td>
                      <td className="px-3 py-3">{row.support}</td>
                      <td className="px-3 py-3">{row.questions}</td>
                      <td className="px-3 py-3">{row.signals}</td>
                      <td className="px-3 py-3">{row.commitments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportPage>

          <ReportPage title="Benchmarks, rankings y modelos predictivos" className={showSection('benchmarks') ? '' : 'hidden'}>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-md border border-slate-200 p-4">
                <h3 className="font-black text-slate-950">Benchmark de cohorte</h3>
                <p className="mb-4 mt-1 text-sm text-slate-600">Cohorte CESFAM liderazgo inicial. N=184 sesiones.</p>
                <BulletChart data={benchmarkData} />
              </div>
              <div className="rounded-md border border-slate-200 p-4">
                <h3 className="font-black text-slate-950">Ranking de brechas entrenables</h3>
                <ol className="mt-4 space-y-3">
                  {rankingItems.map((item, index) => (
                    <li key={item} className="flex gap-3 rounded-md bg-slate-50 p-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-800 text-xs font-black text-white">{index + 1}</span>
                      <span className="font-semibold text-slate-800">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {predictiveModels.map((model) => (
                <div key={model.title} className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Modelo predictivo</p>
                  <h3 className="mt-2 font-black text-slate-950">{model.title}</h3>
                  <p className="mt-2 text-2xl font-black text-blue-900">{model.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{model.detail}</p>
                </div>
              ))}
            </div>
          </ReportPage>

          <ReportPage title="Ruta de desarrollo recomendada" className={showSection('development') ? '' : 'hidden'}>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricBlock label="Prioridad 1" value="Seguimiento" helper="Practicar acuerdos, recordatorios y cierre de compromisos bajo presion." tone="risk" />
              <MetricBlock label="Practica sugerida" value="Conflicto" helper="Simulaciones de conflicto multi-actor con feedback inmediato." tone="info" />
              <MetricBlock label="Meta observable" value="75%" helper="Subir consistencia promesa-accion en la siguiente medicion." tone="good" />
            </div>
          </ReportPage>

          <ReportPage title="Anexo de evidencia" className={showSection('evidence') ? '' : 'hidden'}>
            <div className="grid gap-3 md:grid-cols-3">
              {results.dataLayers.map((layer) => (
                <MetricBlock key={layer.label} label={layer.label} value={layer.value} helper={layer.hint} />
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 font-black text-slate-900">
                  <Icon name="timeline" className="h-4 w-4 text-blue-800" />
                  Reuniones observadas
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Dia</th>
                      <th className="px-3 py-2">Reunion</th>
                      <th className="px-3 py-2">Senal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {meetingRows.map((row) => (
                      <tr key={`${row.day}-${row.meeting}`}>
                        <td className="px-3 py-3 font-bold text-blue-900">{row.day}</td>
                        <td className="px-3 py-3"><span className="font-semibold text-slate-900">{row.meeting}</span><br /><span className="text-xs text-slate-500">{row.focus}</span></td>
                        <td className="px-3 py-3 text-slate-700">{row.signal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 font-black text-slate-900">
                  <Icon name="evidence" className="h-4 w-4 text-blue-800" />
                  Acciones registradas
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Tipo</th>
                      <th className="px-3 py-2">Accion</th>
                      <th className="px-3 py-2">Impacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {actionRows.map((row) => (
                      <tr key={`${row.type}-${row.action}`}>
                        <td className="px-3 py-3 font-bold text-blue-900">{row.type}</td>
                        <td className="px-3 py-3"><span className="font-semibold text-slate-900">{row.action}</span><br /><span className="text-xs text-slate-500">{row.moment}</span></td>
                        <td className="px-3 py-3 text-slate-700">{row.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 font-black text-slate-900">
                <Icon name="gap" className="h-4 w-4 text-blue-800" />
                Compromisos evaluados
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Promesa</th>
                    <th className="px-3 py-2">Esperado</th>
                    <th className="px-3 py-2">Real</th>
                    <th className="px-3 py-2">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {commitmentRows.map((row) => (
                    <tr key={row.promise}>
                      <td className="px-3 py-3 font-semibold text-slate-900">{row.promise}</td>
                      <td className="px-3 py-3 text-slate-700">{row.expected}</td>
                      <td className="px-3 py-3 text-slate-700">{row.actual}</td>
                      <td className="px-3 py-3"><StatusBadge tone={row.result === 'Cumplido' ? 'good' : 'risk'}>{row.result}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 h-72 rounded-md border border-slate-200 p-3 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.behavior.map((item) => ({ name: item.label.split(' ')[0], value: Number.parseFloat(item.value) || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1E40AF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportPage>
        </article>

        {analysisIndicator && (
          <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm">
            <div className="ai-chat-shell w-full max-w-3xl overflow-hidden rounded-lg border border-blue-200 bg-white shadow-[0_28px_90px_rgba(8,27,54,0.45)]">
              <div className="flex items-center justify-between gap-3 bg-[#123f73] px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/12">
                    <Icon name="analyze" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Analisis IA</p>
                    <h3 className="text-lg font-black">{analysisIndicator.name}</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalysisIndicator(null)}
                  className="rounded-md border border-white/25 p-2 text-white transition hover:bg-white/10"
                  aria-label="Cerrar analisis IA"
                >
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[72vh] overflow-y-auto bg-slate-50 p-5">
                {analysisLoading ? (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#123f73]" />
                      <div className="min-w-0 flex-1 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                        <p className="text-sm font-bold text-slate-900">Interpretando evidencia de la simulacion...</p>
                        <div className="mt-4 space-y-2">
                          {[84, 64, 72, 52].map((width, index) => (
                            <span key={index} className="ai-chat-loading block h-2 rounded-full bg-blue-200" style={{ width: `${width}%`, animationDelay: `${index * 130}ms` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-4">
                      <div className="grid gap-2 md:grid-cols-3">
                        <span className="h-16 rounded-md bg-slate-100" />
                        <span className="h-16 rounded-md bg-slate-100" />
                        <span className="h-16 rounded-md bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123f73] text-white">
                        <Icon name="analyze" className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">
                          {indicatorAnalysis[analysisIndicator.id]?.title ?? `Analisis de ${analysisIndicator.name}`}
                        </p>
                        <p className="mt-3 text-base leading-relaxed text-slate-800">
                          {indicatorAnalysis[analysisIndicator.id]?.verdict ?? analysisIndicator.evidence}
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="flex items-center gap-2 text-sm font-black text-slate-950">
                        <Icon name="evidence" className="h-4 w-4 text-blue-800" />
                        Ejemplos concretos observados
                      </p>
                      <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
                        {(indicatorAnalysis[analysisIndicator.id]?.examples ?? [analysisIndicator.evidence]).map((example) => (
                          <li key={example} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-800" />
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="ml-12 rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                      <p className="flex items-center gap-2 text-sm font-black text-emerald-900">
                        <Icon name="target" className="h-4 w-4" />
                        Recomendacion de desarrollo
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        {indicatorAnalysis[analysisIndicator.id]?.recommendation ?? 'Profundizar con evidencia adicional y repetir el escenario bajo condiciones similares.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes ai-scan {
            0% { transform: translateX(-110%); opacity: 0; }
            18% { opacity: 0.55; }
            70% { opacity: 0.22; }
            100% { transform: translateX(110%); opacity: 0; }
          }
          @keyframes ai-dot {
            0%, 80%, 100% { opacity: 0.22; transform: translateY(0); }
            40% { opacity: 1; transform: translateY(-2px); }
          }
          @keyframes ai-bar {
            0% { transform: scaleX(0.25); opacity: 0.35; }
            50% { transform: scaleX(1); opacity: 1; }
            100% { transform: scaleX(0.55); opacity: 0.55; }
          }
          @keyframes ai-chat-loading {
            0% { transform: scaleX(0.22); opacity: 0.35; }
            50% { transform: scaleX(1); opacity: 0.95; }
            100% { transform: scaleX(0.48); opacity: 0.55; }
          }
          @keyframes ai-chat-in {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .ai-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.18) 44%, transparent 62%);
            animation: ai-scan 2.7s ease-in-out infinite;
          }
          .ai-panel::after {
            content: '';
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at 16% 20%, rgba(125, 211, 252, 0.22), transparent 28%),
              linear-gradient(135deg, rgba(255,255,255,0.08), transparent 42%);
            pointer-events: none;
          }
          .ai-dot { animation: ai-dot 1.2s ease-in-out infinite; }
          .ai-bar { transform-origin: left; animation: ai-bar 1.8s ease-in-out infinite; }
          .ai-chat-shell { animation: ai-chat-in 220ms ease-out both; }
          .ai-chat-loading { transform-origin: left; animation: ai-chat-loading 1.05s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .ai-panel::before,
            .ai-dot,
            .ai-bar,
            .ai-chat-shell,
            .ai-chat-loading { animation: none !important; }
          }
          @media print {
            @page { size: A4; margin: 14mm; }
            body > *:not(.report-modal-backdrop) { display: none !important; }
            body { background: white !important; }
            .report-modal-backdrop { position: static !important; inset: auto !important; overflow: visible !important; background: white !important; padding: 0 !important; }
            .report-shell { max-width: none !important; margin: 0 !important; }
            .report-toolbar { display: none !important; }
            .report-nav { display: none !important; }
            .report-document { padding: 0 !important; }
            .report-page { display: block !important; break-inside: avoid; page-break-inside: avoid; box-shadow: none !important; border: 0 !important; border-radius: 0 !important; min-height: 270mm; }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default ResultsDashboard;
