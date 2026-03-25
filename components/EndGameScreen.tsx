import React from 'react';

interface EndGameScreenProps {
  status: 'won' | 'lost';
  message: string;
  saveStatus?: 'idle' | 'sending' | 'success' | 'error';
  saveError?: string | null;
  onRetrySave?: () => void;
  onDownloadBackup?: () => void;
}

const EndGameScreen: React.FC<EndGameScreenProps> = ({
  status,
  message,
  saveStatus = 'idle',
  saveError = null,
  onRetrySave,
  onDownloadBackup,
}) => {
  const isWin = status === 'won';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-2xl border-4 bg-gray-900 p-8 text-center shadow-2xl ${
          isWin ? 'border-green-500' : 'border-red-500'
        }`}
      >
        <h1 className={`mb-4 text-4xl font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
          {isWin ? 'Simulacion Terminada' : 'Simulacion Interrumpida'}
        </h1>
        <p className="mb-6 whitespace-pre-line text-lg text-gray-300">{message}</p>
        <div className="mb-6 space-y-2 text-sm text-gray-300">
          {saveStatus === 'sending' && <p></p>}
          {saveStatus === 'success' && <p className="text-green-300">Sesion guardada correctamente.</p>}
          {saveStatus === 'error' && <p className="text-red-300">No se pudo guardar la sesion: {saveError}</p>}
        </div>
        {(saveStatus === 'error' || onRetrySave || onDownloadBackup) && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            {onRetrySave && saveStatus === 'error' && (
              <button
                onClick={onRetrySave}
                className="rounded-lg bg-yellow-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-yellow-500"
              >
                Reintentar envio
              </button>
            )}
            {onDownloadBackup && (
              <button
                onClick={onDownloadBackup}
                className="rounded-lg bg-slate-700 px-5 py-2 font-semibold text-white transition-colors hover:bg-slate-600"
              >
                Descargar JSON
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className={`transform rounded-lg px-8 py-3 font-bold text-white transition-transform hover:scale-105 ${
            isWin ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'
          }`}
        >
          Jugar de Nuevo
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EndGameScreen;
