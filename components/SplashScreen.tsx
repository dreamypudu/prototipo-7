import React, { useEffect, useMemo, useState } from 'react';
import {
  generateExperimentalUserId,
  getStoredExperimentalUserId,
  isUuidV4,
  storeExperimentalUserId,
} from '../services/experimentalUserId';

interface SplashScreenProps {
  onStartGame: (name: string, experimentalUserId: string) => void;
  title?: string;
  subtitle?: string;
  logoUrl?: string;
}

const DEFAULT_LOGO_URL = '/assets/common/logos/icono-compass.svg';

const SplashScreen: React.FC<SplashScreenProps> = ({
  onStartGame,
  title = 'COMPASS',
  subtitle = 'Simulador de Decision',
  logoUrl,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [experimentalUserId, setExperimentalUserId] = useState(() => getStoredExperimentalUserId());
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [logoRefreshKey, setLogoRefreshKey] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLogoRefreshKey((prev) => prev + 1);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  const animatedLogoSrc = useMemo(
    () => `/assets/common/logos/logo-animado-compass.svg?loop=${logoRefreshKey}`,
    [logoRefreshKey]
  );

  const handleGenerateId = () => {
    const nextId = generateExperimentalUserId();
    setExperimentalUserId(nextId);
    storeExperimentalUserId(nextId);
    setCopyStatus('idle');
  };

  const handleCopyId = async () => {
    if (!experimentalUserId) return;
    try {
      await navigator.clipboard.writeText(experimentalUserId);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1600);
    } catch {
      setCopyStatus('idle');
    }
  };

  const canStart = Boolean(playerName.trim()) && isUuidV4(experimentalUserId);

  const handleStart = () => {
    if (!canStart) return;
    storeExperimentalUserId(experimentalUserId);
    onStartGame(playerName.trim(), experimentalUserId);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 transition-opacity duration-500 px-6">
      <div className="text-center animate-fade-in w-full max-w-md flex flex-col items-center">
        <div className="inline-block mb-2 animate-pulse-slow">
          <img
            src={logoUrl || DEFAULT_LOGO_URL}
            alt="Logo"
            className="object-contain"
            style={{ width: '100%', maxWidth: '320px', height: '180px', margin: '0 auto' }}
          />
        </div>

        {title === 'COMPASS' ? (
          <img
            src={animatedLogoSrc}
            alt="COMPASS"
            className="mx-auto mb-1 object-contain"
            style={{ width: '240px', maxWidth: '80%', height: 'auto' }}
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src = '/assets/common/logos/logo-compass.svg';
            }}
          />
        ) : (
          <h1 className="text-4xl font-bold text-white mb-1">{title}</h1>
        )}
        <p className="text-lg text-blue-300 mb-6">{subtitle}</p>

        <div className="w-full animate-fade-in-up mt-2">
          <input
            type="text"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Introduce tu nombre para comenzar"
            className="w-full bg-gray-800/90 border-2 border-gray-600 text-white text-center text-lg px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            onKeyDown={(event) => event.key === 'Enter' && handleStart()}
          />

          <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-300/10 p-4 text-left shadow-lg shadow-amber-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                  ID experimental
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Genera este ID antes de iniciar y usalo tambien en los formularios externos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateId}
                className="shrink-0 rounded-lg border border-amber-200/60 bg-amber-300 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-950 transition hover:bg-amber-200"
              >
                Generar ID
              </button>
            </div>
            <div className="mt-3 flex items-stretch gap-2">
              <div className="min-h-11 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 font-mono text-xs leading-relaxed text-amber-100 break-all">
                {experimentalUserId || 'Sin ID generado'}
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                disabled={!experimentalUserId}
                className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copyStatus === 'copied' ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!canStart}
            className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-10 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:scale-105 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-blue-500/50"
          >
            Iniciar Simulacion
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default SplashScreen;
