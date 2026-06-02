
import React, { useLayoutEffect, useRef, useState } from 'react';
import { GameState } from '../../../types';
import { useMechanicContext } from '../../MechanicContext';
import PhoneMechanic from '../../modules/PhoneMechanic';
import { isClientPointOpaqueInElement, primeImageAlpha } from '../../../services/imageAlpha';

// =================================================================================================
// 🎨 ZONA DE CONFIGURACIÓN DE IMÁGENES (PEGAR TUS URLS AQUÍ)
// =================================================================================================
const OFFICE_ASSETS = {
    // 1. LA VISTA GENERAL DE LA OFICINA
    BACKGROUND: "https://i.imgur.com/Hq7snGJ.png",
    // Aspect ratio of the background image (width / height).
    BACKGROUND_ASPECT_RATIO: 16 / 9,

    // 2. ELEMENTOS INDIVIDUALES (Opcional)
    ELEMENT_PC: "",       // Imagen del Monitor/PC
    ELEMENT_PHONE: "",    // Imagen del Teléfono
    ELEMENT_NOTEBOOK: "", // Imagen del Cuaderno/Libreta
    ELEMENT_DOOR: ""      // Imagen de la Puerta (o dejar vacía si es parte del fondo)
};
// =================================================================================================

const PHONE_ASSET = '/data/versions/cesfam/assets/telefono.png';
const TABLET_ASSET = '/data/versions/cesfam/assets/tablet.png';
const DOOR_ASSET = '/data/versions/cesfam/assets/puerta.png';

interface DirectorDeskProps {
    gameState: GameState;
    onNavigate: (tab: string) => void;
    onUpdateNotes: (notes: string) => void;
}

// --- SUB-COMPONENTS DEFINED OUTSIDE TO PREVENT RE-RENDERS ---

interface AlphaHotspotProps {
    src: string;
    alt: string;
    title: string;
    label: string;
    labelClassName: string;
    className: string;
    onActivate: () => void;
    enableHoverEffect?: boolean;
    hoverClassName?: string;
}

const AlphaHotspot: React.FC<AlphaHotspotProps> = ({
    src,
    alt,
    title,
    label,
    labelClassName,
    className,
    onActivate,
    enableHoverEffect = true,
    hoverClassName
}) => {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [over, setOver] = useState(false);

    React.useEffect(() => {
        primeImageAlpha(src);
    }, [src]);

    const isOpaqueAt = (event: React.MouseEvent) =>
        isClientPointOpaqueInElement(boxRef.current, imgRef.current, src, event.clientX, event.clientY);

    const handleMove = (event: React.MouseEvent) => {
        setOver(isOpaqueAt(event));
    };

    const handleClick = (event: React.MouseEvent) => {
        if (!isOpaqueAt(event)) return;
        onActivate();
    };

    return (
        <div
            ref={boxRef}
            className={`absolute ${className}`}
            title={over ? title : undefined}
            onMouseMove={handleMove}
            onMouseLeave={() => setOver(false)}
            onClick={handleClick}
        >
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`w-full h-full object-contain drop-shadow-xl transition-all duration-200 ease-out ${
                    over
                        ? hoverClassName ?? (
                            enableHoverEffect
                                ? 'scale-[1.018] cursor-pointer drop-shadow-[0_0_10px_rgba(255,255,255,0.22)]'
                                : 'cursor-pointer'
                          )
                        : 'cursor-default'
                }`}
                draggable={false}
            />
            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity pointer-events-none ${
                    over ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <span className={`bg-black/80 text-xs px-2 py-1 rounded ${labelClassName}`}>
                    {label}
                </span>
            </div>
        </div>
    );
};

interface ComputerMenuProps {
    onNavigate: (tab: string) => void;
    onClose: () => void;
    hasUnreadEmails: boolean;
}

const ComputerMenu: React.FC<ComputerMenuProps> = ({ onNavigate, onClose, hasUnreadEmails }) => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm animate-fade-in">
        <div className="bg-gray-800 p-8 rounded-xl border-2 border-blue-500 shadow-2xl max-w-2xl w-full relative">
                {/* Monitor Frame Effect */}
            <div className="absolute top-0 left-0 w-full h-8 bg-gray-700 rounded-t-lg flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={onClose}></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-xs text-gray-400 font-mono">CESFAM_OS v2.0 - Director Access</span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6">
                <button onClick={() => onNavigate('schedule')} className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-700/50 transition-all group">
                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-3xl">📅</span>
                    </div>
                    <span className="font-bold text-gray-200">Planificación</span>
                </button>
                <button onClick={() => onNavigate('emails')} className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-700/50 transition-all group">
                        <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative">
                            <span className="text-3xl">✉️</span>
                            {hasUnreadEmails && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-gray-900">!</span>
                            )}
                    </div>
                    <span className="font-bold text-gray-200">Correos</span>
                </button>
                <button onClick={() => onNavigate('documents')} className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-700/50 transition-all group">
                        <div className="w-16 h-16 bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative">
                            <span className="text-3xl">📂</span>
                    </div>
                    <span className="font-bold text-gray-200">Documentos</span>
                </button>
            </div>
            <p className="text-center text-gray-500 text-xs mt-8">Sistema de Gestión Integrada - Servicio de Salud</p>
        </div>
    </div>
);

interface NotebookOverlayProps {
    notes: string;
    onUpdateNotes: (notes: string) => void;
    onClose: () => void;
}

const NotebookOverlay: React.FC<NotebookOverlayProps> = ({ notes, onUpdateNotes, onClose }) => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#fdfbf7] text-gray-800 p-8 rounded-lg shadow-2xl max-w-xl w-full h-3/4 flex flex-col relative transform rotate-1">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
            <h3 className="font-handwriting text-2xl mb-4 text-gray-600 border-b-2 border-red-300 pb-2">Notas Personales (Privado)</h3>
            <textarea
                className="flex-grow bg-transparent border-none resize-none outline-none font-handwriting text-xl leading-8 p-2"
                style={{ backgroundImage: 'linear-gradient(transparent, transparent 29px, #e5e7eb 30px)', backgroundSize: '100% 30px', lineHeight: '30px' }}
                value={notes}
                onChange={(e) => onUpdateNotes(e.target.value)}
                placeholder="Escriba sus recordatorios, promesas o impresiones aquí..."
            />
        </div>
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap');
            .font-handwriting { font-family: 'Kalam', cursive; }
        `}</style>
    </div>
);

const DirectorDesk: React.FC<DirectorDeskProps> = ({ gameState, onNavigate, onUpdateNotes }) => {
    const { engine } = useMechanicContext();
    const [activeView, setActiveView] = useState<'office' | 'pc_menu' | 'notebook' | 'phone'>('office');
    const deskRef = useRef<HTMLDivElement>(null);
    const [imageBounds, setImageBounds] = useState({ top: 0, left: 0, width: 0, height: 0 });

    useLayoutEffect(() => {
        const element = deskRef.current;
        if (!element) return;

        const ratio = OFFICE_ASSETS.BACKGROUND_ASPECT_RATIO;
        if (!ratio) return;

        const updateBounds = () => {
            const rect = element.getBoundingClientRect();
            const containerRatio = rect.width / rect.height;
            let width = rect.width;
            let height = rect.height;
            let left = 0;
            let top = 0;

            if (containerRatio > ratio) {
                height = rect.height;
                width = height * ratio;
                left = (rect.width - width) / 2;
            } else {
                width = rect.width;
                height = width / ratio;
                top = (rect.height - height) / 2;
            }

            setImageBounds({ top, left, width, height });
        };

        updateBounds();
        const observer = new ResizeObserver(updateBounds);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const imageStyle = imageBounds.width
        ? { top: imageBounds.top, left: imageBounds.left, width: imageBounds.width, height: imageBounds.height }
        : { top: 0, left: 0, width: '100%', height: '100%' };
    const handleNotesUpdate = (notes: string) => {
        engine.emitEvent('office', 'notes_updated', { notes_length: notes.length });
        onUpdateNotes(notes);
    };

    return (
        <div ref={deskRef} className="relative w-full h-full min-h-[620px] bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-800 select-none">
            {/* BACKGROUND IMAGE - OFFICE */}
            <div
                className="absolute bg-cover bg-center transition-transform duration-500"
                style={{
                    ...imageStyle,
                    backgroundImage: `url('${OFFICE_ASSETS.BACKGROUND}')`,
                    filter: activeView !== 'office' ? 'blur(4px) brightness(0.5)' : 'none',
                    transform: activeView !== 'office' ? 'scale(1.02)' : 'scale(1)'
                }}
            />

            {/* --- HOTSPOTS (Only active in office view) --- */}
            {activeView === 'office' && (
                <div className="absolute z-10" style={imageStyle}>
                    {/* 1. DOOR - EXIT TO MAP */}
                    <AlphaHotspot
                        src={DOOR_ASSET}
                        alt="Puerta de salida"
                        title="Salir al Mapa"
                        label="Salir al CESFAM"
                        labelClassName="text-white"
                        className="top-[0%] right-[0.5%] w-[27%] h-[90%] z-40"
                        enableHoverEffect={false}
                        hoverClassName="cursor-pointer drop-shadow-[0_0_38px_rgba(250,204,21,1)]"
                        onActivate={() => onNavigate('map')}
                    />

                    {/* 2. WINDOW - TIME DISPLAY */}
                    <div className="absolute top-[0%] left-[0%] w-[20%] h-[10%] pointer-events-none z-0 flex items-end justify-center pb-4 border-2 border-transparent hover:border-white/10">
                         <div className="bg-black/60 px-3 py-1 rounded text-white text-sm font-mono backdrop-blur-sm border border-gray-600">
                            {gameState.timeSlot === 'mañana' ? '☀️ Mañana' : '🌇 Tarde'} - Día {gameState.day}
                         </div>
                    </div>

                    {/* 3. PC MONITOR - HUB */}
                    <div
                        className="absolute bottom-[27%] left-[35%] w-[30%] h-[30%] cursor-pointer group z-40 border-2 border-white/20 hover:border-cyan-400 rounded-lg"
                        onClick={() => setActiveView('pc_menu')}
                        title="Usar Computador"
                    >
                         {OFFICE_ASSETS.ELEMENT_PC && <img src={OFFICE_ASSETS.ELEMENT_PC} className="w-full h-full object-contain" alt="PC" />}

                         <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-black/80 text-cyan-300 text-xs px-2 py-1 rounded">
                                Acceder al Sistema
                            </span>
                        </div>
                    </div>

                    {/* 4. NOTEBOOK - NOTES */}
                    <AlphaHotspot
                        src={TABLET_ASSET}
                        alt="Tablet de notas"
                        title="Notas Personales"
                        label="Notas"
                        labelClassName="text-yellow-200"
                        className="bottom-[-23%] left-[60.5%] w-[26%] h-[80%] -rotate-4 z-30"
                        onActivate={() => setActiveView('notebook')}
                    />

                    {/* 5. PHONE - CALLS */}
                    <AlphaHotspot
                        src={PHONE_ASSET}
                        alt="Telefono"
                        title="Telefono"
                        label="Llamar"
                        labelClassName="text-green-300"
                        className="bottom-[-33%] left-[-26.5%] w-[100%] h-[110%] -rotate-4 z-20"
                        onActivate={() => setActiveView('phone')}
                    />
                </div>
            )}

            {/* --- OVERLAYS --- */}
            {activeView === 'pc_menu' && (
                <ComputerMenu
                    onNavigate={onNavigate}
                    onClose={() => setActiveView('office')}
                    hasUnreadEmails={gameState.inbox.some(e => !e.isRead)}
                />
            )}
            {activeView === 'notebook' && (
                <NotebookOverlay
                    notes={gameState.playerNotes}
                    onUpdateNotes={handleNotesUpdate}
                    onClose={() => setActiveView('office')}
                />
            )}
            {activeView === 'phone' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-fade-in">
                    <PhoneMechanic onClose={() => setActiveView('office')} />
                </div>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default DirectorDesk;
