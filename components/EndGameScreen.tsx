
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`w-full max-w-2xl bg-gray-900 rounded-2xl border-4 ${isWin ? 'border-green-500' : 'border-red-500'} shadow-2xl p-8 text-center`}>
        <h1 className={`text-4xl font-bold mb-4 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
          {isWin ? 'Decisión Tomada' : 'Project Failure'}
        </h1>
        <p className="text-lg text-gray-300 mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="mb-6 space-y-2 text-sm text-gray-300">
          {saveStatus === 'sending' && <p>Guardando sesiÃ³n...</p>}
          {saveStatus === 'success' && <p className="text-green-300">SesiÃ³n guardada.</p>}
          {saveStatus === 'error' && <p className="text-red-300">No se pudo guardar la sesiÃ³n: {saveError}</p>}
        </div>
        {(saveStatus === 'error' || onRetrySave || onDownloadBackup) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {onRetrySave && saveStatus === 'error' && (
              <button
                onClick={onRetrySave}
                className="px-5 py-2 rounded-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-500 transition-colors"
              >
                Reintentar envÃ­o
              </button>
            )}
            {onDownloadBackup && (
              <button
                onClick={onDownloadBackup}
                className="px-5 py-2 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Descargar JSON
              </button>
            )}
          </div>
        )}
        <button 
          onClick={() => window.location.reload()}
          className={`px-8 py-3 rounded-lg font-bold text-white transition-transform transform hover:scale-105 ${isWin ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
        >
          Jugar de Nuevo
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default EndGameScreen;
