import React from 'react';
import { Stakeholder } from '../types';

interface NpcHoverProps {
  stakeholder: Stakeholder;
  children: React.ReactNode;
  /** Ajusta el interlineado del texto dentro de la burbuja (ej: 1.1, 1.25). */
  lineHeight?: number;
  /** Ajusta el zoom de la foto del NPC. */
  portraitScale?: number;
  /** Ajusta el desplazamiento vertical de la foto (px o %). */
  portraitOffsetY?: string | number;
}

const NpcHover: React.FC<NpcHoverProps> = ({
  stakeholder,
  children,
  lineHeight = 1.25,
  portraitScale = 3,
  portraitOffsetY = 70
}) => {
  const translateY =
    typeof portraitOffsetY === 'number' ? `${portraitOffsetY}px` : portraitOffsetY;

  return (
    <span className="relative inline-flex group cursor-help font-semibold text-amber-200">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-gray-900/95 border border-gray-700 shadow-xl w-56 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-150 z-50">
        <div className="flex items-center gap-2">
          <div className="w-20 h-20 rounded-full border border-white/20 overflow-hidden flex-shrink-0">
            <img
              src={stakeholder.portraitUrl}
              alt={stakeholder.name}
              className="w-full h-full object-cover"
              style={{ transform: `translateY(${translateY}) scale(${portraitScale})`, transformOrigin: '50% 50%' }}
            />
          </div>
          <div className="text-xs leading-tight text-white">
            <div className="font-bold">{stakeholder.name}</div>
            <div className="text-gray-300">{stakeholder.role}</div>
          </div>
        </div>
        <div
          className="mt-1 text-[11px] text-gray-200"
          style={{ lineHeight }}
        >
          {stakeholder.personality}
        </div>
      </div>
    </span>
  );
};

export default NpcHover;
