import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stakeholder } from '../../../types';

interface NpcHoverProps {
  stakeholder: Stakeholder;
  children: React.ReactNode;
  /** Ajusta el interlineado del texto dentro de la burbuja (ej: 1.1, 1.25). */
  lineHeight?: number;
  /** Ajusta el zoom de la foto del NPC. */
  portraitScale?: number;
  /** Ajusta el desplazamiento vertical de la foto (px o %). */
  portraitOffsetY?: string | number;
  /** Posicion de la burbuja. 'auto' la abre hacia el centro segun el borde mas cercano. */
  placement?: 'top' | 'right' | 'left' | 'auto';
  /** Sobreescribe las clases del span trigger (por defecto estilo de nombre inline). */
  triggerClassName?: string;
  /** Renderiza la burbuja en document.body (fixed) para escapar overflow/clipping de contenedores. */
  portal?: boolean;
  /** Burbuja compacta (menos ancho, retrato y texto mas chicos). Util en el mapa. */
  compact?: boolean;
}

const BUBBLE_DECOR = 'rounded-xl bg-gray-900/95 border border-gray-700 shadow-xl';
const BUBBLE_HOVER = 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150 z-50';

const NpcHover: React.FC<NpcHoverProps> = ({
  stakeholder,
  children,
  lineHeight = 1.25,
  portraitScale = 3,
  portraitOffsetY = 70,
  placement = 'top',
  triggerClassName = 'cursor-help font-semibold text-amber-200',
  portal = false,
  compact = false,
}) => {
  const translateY =
    typeof portraitOffsetY === 'number' ? `${portraitOffsetY}px` : portraitOffsetY;
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [autoSide, setAutoSide] = useState<'left' | 'right'>('right');
  const [portalCoords, setPortalCoords] = useState<{ left: number; top: number; transform: string } | null>(null);

  const resolveSide = (): 'left' | 'right' => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return 'right';
    const center = rect.left + rect.width / 2;
    return center < window.innerWidth / 2 ? 'right' : 'left';
  };

  const computePortalCoords = (place: 'top' | 'right' | 'left') => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    if (place === 'right') {
      return { left: rect.right + 8, top: rect.top + rect.height / 2, transform: 'translateY(-50%)' };
    }
    if (place === 'left') {
      return { left: rect.left - 8, top: rect.top + rect.height / 2, transform: 'translate(-100%, -50%)' };
    }
    // top
    return { left: rect.left + rect.width / 2, top: rect.top - 8, transform: 'translate(-50%, -100%)' };
  };

  // En modo 'auto', al pasar el mouse se mide la posicion del trigger y la burbuja
  // se abre hacia el centro de la pantalla (lado opuesto al borde mas cercano).
  const handleMouseEnter = () => {
    let place: 'top' | 'right' | 'left';
    if (placement === 'auto') {
      const side = resolveSide();
      setAutoSide(side);
      place = side;
    } else {
      place = placement as 'top' | 'right' | 'left';
    }
    if (portal) {
      setPortalCoords(computePortalCoords(place));
    }
  };

  const handleMouseLeave = () => {
    if (portal) setPortalCoords(null);
  };

  const resolvedPlacement = placement === 'auto' ? autoSide : placement;
  // En 'auto' (sprites de personajes) la imagen suele traer espacio transparente alrededor,
  // por eso se usa margen negativo para acercar la burbuja al dibujo. Ajusta -ml-12/-mr-12 a gusto.
  const rightOffset = placement === 'auto' ? '-ml-12' : 'ml-1';
  const leftOffset = placement === 'auto' ? '-mr-12' : 'mr-1';
  // En 'auto' (sprites) la burbuja se ancla mas arriba (a la altura de la cara). Ajusta top-1/4.
  const vAnchor = placement === 'auto' ? 'top-1/4' : 'top-1/2';
  const sizeClass = compact ? 'w-56 px-3 py-2.5' : 'w-72 px-4 py-3';
  const bubbleDecor = `${sizeClass} ${BUBBLE_DECOR}`;
  const bubbleClass =
    resolvedPlacement === 'right'
      ? `absolute left-full ${vAnchor} ${rightOffset} -translate-y-1/2 ${bubbleDecor} ${BUBBLE_HOVER}`
      : resolvedPlacement === 'left'
        ? `absolute right-full ${vAnchor} ${leftOffset} -translate-y-1/2 ${bubbleDecor} ${BUBBLE_HOVER}`
        : `absolute bottom-full left-1/2 mb-2 -translate-x-1/2 ${bubbleDecor} ${BUBBLE_HOVER}`;

  const portraitSize = compact ? 'w-14 h-14' : 'w-24 h-24';
  const bubbleInner = (
    <>
      <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
        <div className={`${portraitSize} rounded-full border border-white/20 overflow-hidden flex-shrink-0`}>
          <img
            src={stakeholder.portraitUrl}
            alt={stakeholder.name}
            className="w-full h-full object-cover"
            style={{ transform: `translateY(${translateY}) scale(${portraitScale})`, transformOrigin: '50% 50%' }}
          />
        </div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} leading-tight text-white`}>
          <div className="font-bold">{stakeholder.name}</div>
          <div className={`text-gray-300 ${compact ? 'text-[10px]' : ''}`}>{stakeholder.role}</div>
        </div>
      </div>
      <div className={`text-gray-200 ${compact ? 'mt-1.5 text-[11px]' : 'mt-2 text-sm'}`} style={{ lineHeight }}>
        {stakeholder.personality}
      </div>
    </>
  );

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex group ${triggerClassName}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {portal
        ? portalCoords &&
          createPortal(
            <div
              className={`${bubbleDecor} pointer-events-none`}
              style={{ position: 'fixed', left: portalCoords.left, top: portalCoords.top, transform: portalCoords.transform, zIndex: 9999 }}
            >
              {bubbleInner}
            </div>,
            document.body
          )
        : <div className={bubbleClass}>{bubbleInner}</div>}
    </span>
  );
};

export default NpcHover;
