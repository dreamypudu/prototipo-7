import React, { useState, useEffect, useMemo } from 'react';

interface SplashScreenProps {
  onStartGame: (name: string) => void;
  title?: string;
  subtitle?: string;
  logoUrl?: string;
}

// ==============================================================================
// INSTRUCCIONES: Reemplace la URL de abajo con el enlace a su propio logo.
// Se recomienda una imagen cuadrada (ej: 200x200 px) con fondo transparente.
// Ejemplo: 'https://i.imgur.com/69J15vd.png'
// ==============================================================================

const DEFAULT_LOGO_URL = '/avatars/icono-compass.svg'; // placeholder

const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame, title = 'COMPASS', subtitle = 'Simulador de Decisión', logoUrl }) => {
  const [playerName, setPlayerName] = useState('');
  const [logoRefreshKey, setLogoRefreshKey] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLogoRefreshKey((prev) => prev + 1);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  const animatedLogoSrc = useMemo(
    () => `/avatars/logo-animado-compass.svg?loop=${logoRefreshKey}`,
    [logoRefreshKey]
  );
  
  const handleStart = () => {
    if (playerName.trim()) {
        onStartGame(playerName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 transition-opacity duration-500 px-6">
      <div className="text-center animate-fade-in w-full max-w-md flex flex-col items-center">
        {/* Logo */}
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
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/avatars/logo-compass.svg'; }}
          />
        ) : (
          <h1 className="text-4xl font-bold text-white mb-1">{title}</h1>
        )}
        <p className="text-lg text-blue-300 mb-6">{subtitle}</p>
        
        {/* Registro directo */}
        <div className="w-full animate-fade-in-up mt-2">
              <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Introduce tu nombre para comenzar"
                  className="w-full bg-gray-800/90 border-2 border-gray-600 text-white text-center text-lg px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              />
              <button
                  onClick={handleStart}
                  disabled={!playerName.trim()}
                  className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-10 rounded-lg text-lg transition-all duration-300 ease-in-out transform hover:bg-blue-500 hover:scale-105 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-blue-500/50"
                  >
                  Iniciar Simulación
              </button>
              <p className="mt-4 text-sm leading-relaxed text-slate-300/90">
                Los datos recopilados en esta herramienta no se usarán para investigación ni estarán asociados a tu identidad. Se utilizarán
                únicamente para validación interna del funcionamiento de la herramienta (Congreso Mejor Universidad 2026, Concepción).
              </p>
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
