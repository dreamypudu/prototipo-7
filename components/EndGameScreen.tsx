import React from 'react';

interface EndGameScreenProps {
  status: 'won' | 'lost';
  message: string;
  saveStatus?: 'idle' | 'sending' | 'success' | 'error';
  saveError?: string | null;
  onRetrySave?: () => void;
  onDownloadBackup?: () => void;
  experimentalUserId?: string;
  runMode?: 'experiment' | 'tutorial';
}

const EndGameScreen: React.FC<EndGameScreenProps> = ({
  status,
  message,
  saveStatus = 'idle',
  saveError = null,
  onRetrySave,
  onDownloadBackup,
  experimentalUserId,
  runMode = 'experiment',
}) => {
  const isWin = status === 'won';
  const handleCopyExperimentalId = async () => {
    if (!experimentalUserId) return;
    try {
      await navigator.clipboard.writeText(experimentalUserId);
    } catch {
      // Clipboard support is best effort.
    }
  };

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
        {(experimentalUserId || runMode === 'tutorial') && (
          <div className="mx-auto mb-6 max-w-lg rounded-xl border border-amber-300/35 bg-amber-300/10 p-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                {runMode === 'tutorial' ? 'Modo tutorial' : 'ID experimental'}
              </div>
              {experimentalUserId && (
                <button
                  type="button"
                  onClick={handleCopyExperimentalId}
                  className="rounded-md border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-xs font-bold uppercase text-amber-100 hover:bg-amber-200/20"
                >
                  Copiar
                </button>
              )}
            </div>
            {experimentalUserId && (
              <div className="mt-2 break-all rounded-lg border border-white/10 bg-black/25 p-2 font-mono text-xs leading-relaxed text-amber-50">
                {experimentalUserId}
              </div>
            )}
          </div>
        )}
        <div className="mb-6 space-y-2 text-sm text-gray-300">
          {saveStatus === 'sending' && <p></p>}
          {saveStatus === 'success' && <p className="text-green-300">Sesion guardada correctamente.</p>}
          {saveStatus === 'error' && <p className="text-red-300">No se pudo guardar la sesión: {saveError}</p>}
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
