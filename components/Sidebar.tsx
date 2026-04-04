import React from 'react';

interface StageTab {
  id: string;
  label: string;
  status: 'active' | 'upcoming' | 'done';
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onReturnHome?: () => void;
  stages?: StageTab[];
  onSelectStage?: (stageId: string) => void;
  developerUnlocked: boolean;
  onUnlockDeveloper: (password: string) => boolean;
  onTogglePause?: () => void;
  isTimerPaused?: boolean;
  onToggleBitacora?: () => void;
  hasBitacora?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onReturnHome,
  stages = [],
  onSelectStage,
  developerUnlocked,
  onUnlockDeveloper,
  onTogglePause,
  isTimerPaused = false,
  onToggleBitacora,
  hasBitacora = false,
}) => {
  const [showDeveloperView, setShowDeveloperView] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  const handleNavigation = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  const handleDeveloperToggle = () => {
    setShowDeveloperView((prev) => !prev);
    setPasswordError('');
  };

  const handleDeveloperSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const unlocked = onUnlockDeveloper(passwordInput);
    if (unlocked) {
      setPasswordInput('');
      setPasswordError('');
      return;
    }
    setPasswordError('Contraseña incorrecta.');
  };

  const handleBitacoraToggle = () => {
    if (!onToggleBitacora) return;
    onToggleBitacora();
    onClose();
  };

  const handleStageSelect = (stage: StageTab) => {
    if (stage.status === 'upcoming') return;
    if (onSelectStage) {
      onSelectStage(stage.id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sidebar-panel z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="eyebrow">Navegación</div>
              <h2 className="text-2xl font-bold text-white">Herramientas</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-teal-200/60">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            <ul className="space-y-2">
              {stages.length > 0 && (
                <li className="mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Etapas</h3>
                  <div className="flex flex-col gap-2">
                    {stages.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => handleStageSelect(stage)}
                        disabled={stage.status === 'upcoming'}
                        className={`w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg text-sm border transition-colors shadow-sm ${
                          stage.status === 'active'
                            ? 'bg-gradient-to-r from-teal-600/30 to-sky-600/20 border-teal-400 text-white'
                            : stage.status === 'done'
                              ? 'bg-white/5 border-gray-600 text-gray-100 hover:bg-white/8'
                              : 'bg-transparent border-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <span className="font-semibold">{stage.label}</span>
                        {stage.status === 'upcoming' && (
                          <span className="text-[10px] uppercase text-yellow-300">Proximamente</span>
                        )}
                        {stage.status === 'active' && (
                          <span className="text-[10px] uppercase text-blue-200">Actual</span>
                        )}
                      </button>
                    ))}
                  </div>
                </li>
              )}
              {onReturnHome && (
                <li>
                  <button
                    onClick={() => { onReturnHome(); onClose(); }}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                  >
                    <HomeIcon />
                    <span>Volver al inicio</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => handleNavigation('data_export')}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                >
                  <DataExportIcon />
                  <span>Exportar Datos</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleDeveloperToggle}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                >
                  <DeveloperIcon />
                  <span>Vista de desarrollador</span>
                </button>
              </li>
              {showDeveloperView && (
                <li className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  {!developerUnlocked ? (
                    <form onSubmit={handleDeveloperSubmit} className="space-y-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Acceso restringido</div>
                        <p className="mt-1 text-sm text-gray-300">Ingresa la contraseña para habilitar herramientas de desarrollador.</p>
                      </div>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(event) => setPasswordInput(event.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-teal-300/60"
                        placeholder="Contraseña"
                      />
                      {passwordError && <p className="text-xs text-rose-300">{passwordError}</p>}
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-teal-300/40 bg-teal-500/10 px-3 py-2 text-sm font-semibold text-teal-100 transition-colors hover:border-teal-200/60 hover:bg-teal-500/20"
                      >
                        Desbloquear vista
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <div className="mb-1">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Herramientas de desarrollador</div>
                      </div>
                      {onTogglePause && (
                        <button
                          onClick={onTogglePause}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-base text-gray-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                        >
                          <PauseButtonIcon />
                          <span>{isTimerPaused ? 'Reanudar tiempo' : 'Pausar tiempo'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleNavigation('summary')}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-base text-gray-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                      >
                        <RelationsIcon />
                        <span>Relaciones</span>
                      </button>
                      <button
                        onClick={() => handleNavigation('experimental_map')}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-base text-gray-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                      >
                        <MapIcon />
                        <span>Mapa Experimental</span>
                      </button>
                      {hasBitacora && onToggleBitacora && (
                        <button
                          onClick={handleBitacoraToggle}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-lg text-base text-gray-200 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
                        >
                          <NotebookIcon />
                          <span>Bitácora</span>
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

// Icons for the sidebar buttons
const DataExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-6v6m0-6h6m-6 6h6m6-3l-5.447 2.724A1 1 0 0115 16.382V5.618a1 1 0 011.447-.894L21 7m0 0v6" />
    </svg>
);

const DeveloperIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.868v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5V3m0 18v-2m6.364-11.364l1.414-1.414M4.222 19.778l1.414-1.414M19 12h2M3 12H1m17.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414" />
    </svg>
);

const PauseButtonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const RelationsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V9H2v11h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7m5-12a3 3 0 110 6 3 3 0 010-6z" />
    </svg>
);

const NotebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 4h11a2 2 0 012 2v14H7a2 2 0 01-2-2V4zm0 0H4m3 4h8m-8 4h8m-8 4h5" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
    </svg>
);


export default Sidebar;
