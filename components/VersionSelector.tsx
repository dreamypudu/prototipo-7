import React from 'react';
import { SimulatorVersion } from '../types';

interface VersionSelectorProps {
  onSelect: (version: SimulatorVersion) => void;
}

interface VersionOption {
  id: SimulatorVersion;
  title: string;
  description: string;
  icon: string;
  active: boolean;
}

const VERSIONS: VersionOption[] = [
  {
    id: 'LEY_KARIN',
    title: 'Compass: Ley Karin',
    description: 'Gestión preventiva y resolución de conflictos laborales bajo la normativa de la Ley Karin.',
    icon: '⚖️',
    active: true
  },
  {
    id: 'CESFAM',
    title: 'Gestión en Salud (CESFAM)',
    description: 'Alinea a tres sectores en un centro de salud primaria de alta complejidad.',
    icon: '🏥',
    active: true
  },
  {
    id: 'INNOVATEC',
    title: 'Innovatec (Proyecto Quantum Leap)',
    description: 'Lidera un proyecto de IA corporativa con decisiones éticas, presupuestarias y de talento.',
    icon: '🧠',
    active: true
  },
  {
    id: 'SERCOTEC',
    title: 'Gestión PyME (SERCOTEC)',
    description: 'Asesora a emprendedores y gestiona fondos concursables para el desarrollo regional.',
    icon: '🏪',
    active: false
  },
  {
    id: 'MUNICIPAL',
    title: 'Gestión Municipal',
    description: 'Equilibra comunidad, presupuesto público y tiempos políticos.',
    icon: '🏛️',
    active: false
  }
];

const VersionSelector: React.FC<VersionSelectorProps> = ({ onSelect }) => {
  const accentByVersion: Record<SimulatorVersion, string> = {
    LEY_KARIN: '#c19a3f',
    CESFAM: '#1b4e89',
    INNOVATEC: '#7b5cff',
    SERCOTEC: '#6f7d8c',
    MUNICIPAL: '#9aa5b1'
  };
const fontByVersion: Record<SimulatorVersion, string> = {
    LEY_KARIN: "'Inter', 'Segoe UI', sans-serif",
    CESFAM: "'Space Grotesk', 'Inter', 'Segoe UI', sans-serif",
    INNOVATEC: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
    SERCOTEC: "'Roboto Mono', 'Fira Code', monospace",
    MUNICIPAL: "'Inter', 'Segoe UI', sans-serif"
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 p-6 overflow-y-auto"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(8,17,35,0.9), rgba(8,17,35,0.78)), url('/avatars/cesfam-portada.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Módulo de Simulación COMPASS</h1>
          <p className="text-xl text-blue-100/90">Selecciona el contexto de la simulación para comenzar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up">
          {VERSIONS.map((version) => {
            const accent = accentByVersion[version.id];
            const font = fontByVersion[version.id];
            const isDisabled = !version.active;
            const cardBg =
              version.id === 'CESFAM'
                ? {
                    backgroundImage:
                      "linear-gradient(180deg, rgba(12,22,38,0.82), rgba(12,23,40,0.62)), url('/avatars/fondo cesfam portada.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 20px 60px rgba(27, 78, 137, 0.65)',
                    borderColor: '#1b6fd6',
                    filter: 'brightness(1.03)'
                  }
                : undefined;
            return (
              <button
                key={version.id}
                onClick={() => version.active && onSelect(version.id)}
                disabled={!version.active}
                className={`group relative text-left rounded-3xl border-2 transition-all duration-300 h-full flex flex-col overflow-hidden backdrop-blur-md ${
                  version.active
                    ? 'bg-white/10 border-white/15 cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:shadow-[0_24px_70px_rgba(0,0,0,0.50)] hover:-translate-y-1'
                    : 'bg-white/5 border-white/10 cursor-not-allowed opacity-50 grayscale'
                }`}
                style={{
                  borderColor: version.active ? accent : undefined,
                  padding: '2rem',
                  ...cardBg
                }}
              >
                <div
                  className="absolute top-4 right-4 text-4xl drop-shadow-sm opacity-90"
                  style={{ color: accent }}
                >
                  {version.icon}
                </div>
                <h2
                  className="text-3xl font-extrabold mb-3 leading-tight pr-10 tracking-tight"
                  style={{
                    fontFamily: font,
                    color: version.id === 'CESFAM' ? '#ffffff' : version.active ? accent : '#ffffff',
                    textShadow: version.id === 'CESFAM' ? '0 0 12px rgba(255,255,255,0.9)' : undefined
                  }}
                >
                  {version.title}
                </h2>
                <p className="text-[#e0e0e0] text-sm leading-relaxed mb-8 flex-grow" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                  {version.description}
                </p>

                {!version.active ? (
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <span className="text-[10px] uppercase font-bold text-gray-300/70 bg-white/5 px-2 py-1 rounded border border-white/10">
                      Próximamente
                    </span>
                  </div>
                ) : (
                  <div
                    className="mt-auto pt-4 border-t border-white/10 flex items-center gap-2 font-bold group-hover:gap-3 transition-all"
                    style={{
                      color: version.id === 'CESFAM' ? '#ffffff' : accent,
                      fontFamily: "'Inter','Segoe UI',sans-serif",
                      textShadow: version.id === 'CESFAM' ? '0 0 10px rgba(255,255,255,0.9)' : undefined
                    }}
                  >
                    <span>Iniciar versión</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-gray-300 mt-12 text-sm">
          Competency & Profiling Simulation System © 2026
        </p>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out 0.3s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default VersionSelector;
