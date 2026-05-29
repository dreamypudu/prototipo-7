import React, { useRef, useState } from 'react';
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
}

const BUBBLE_BASE =
  'px-4 py-3 rounded-xl bg-gray-900/95 border border-gray-700 shadow-xl w-72 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150 z-50';

const NpcHover: React.FC<NpcHoverProps> = ({
  stakeholder,
  children,
  lineHeight = 1.25,
  portraitScale = 3,
  portraitOffsetY = 70,
  placement = 'top',
  triggerClassName = 'cursor-help font-semibold text-amber-200',
}) => {
  const translateY =
    typeof portraitOffsetY === 'number' ? `${portraitOffsetY}px` : portraitOffsetY;
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [autoSide, setAutoSide] = useState<'left' | 'right'>('right');

  // En modo 'auto', al pasar el mouse se mide la posicion del trigger y la burbuja
  // se abre hacia el centro de la pantalla (lado opuesto al borde mas cercano).
  const handleMouseEnter = () => {
    if (placement !== 'auto') return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    setAutoSide(center < window.innerWidth / 2 ? 'right' : 'left');
  };

  const resolvedPlacement = placement === 'auto' ? autoSide : placement;
  // En 'auto' (sprites de personajes) la imagen suele traer espacio transparente alrededor,
  // por eso se usa margen negativo para acercar la burbuja al dibujo. Ajusta -ml-12/-mr-12 a gusto.
  const rightOffset = placement === 'auto' ? '-ml-12' : 'ml-1';
  const leftOffset = placement === 'auto' ? '-mr-12' : 'mr-1';
  // En 'auto' (sprites) la burbuja se ancla mas arriba (a la altura de la cara). Ajusta top-1/4.
  const vAnchor = placement === 'auto' ? 'top-1/4' : 'top-1/2';
  const bubbleClass =
    resolvedPlacement === 'right'
      ? `absolute left-full ${vAnchor} ${rightOffset} -translate-y-1/2 ${BUBBLE_BASE}`
      : resolvedPlacement === 'left'
        ? `absolute right-full ${vAnchor} ${leftOffset} -translate-y-1/2 ${BUBBLE_BASE}`
        : `absolute bottom-full left-1/2 mb-2 -translate-x-1/2 ${BUBBLE_BASE}`;

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex group ${triggerClassName}`}
      onMouseEnter={handleMouseEnter}
    >
      {children}
      <div className={bubbleClass}>
        <div className="flex items-center gap-3">
          <div className="w-24 h-24 rounded-full border border-white/20 overflow-hidden flex-shrink-0">
            <img
              src={stakeholder.portraitUrl}
              alt={stakeholder.name}
              className="w-full h-full object-cover"
              style={{ transform: `translateY(${translateY}) scale(${portraitScale})`, transformOrigin: '50% 50%' }}
            />
          </div>
          <div className="text-sm leading-tight text-white">
            <div className="font-bold">{stakeholder.name}</div>
            <div className="text-gray-300">{stakeholder.role}</div>
          </div>
        </div>
        <div
          className="mt-2 text-sm text-gray-200"
          style={{ lineHeight }}
        >
          {stakeholder.personality}
        </div>
      </div>
    </span>
  );
};

export default NpcHover;
