import React from 'react';
import { useMechanicContext } from '../MechanicContext';

const NotesMechanic: React.FC = () => {
  const { gameState, dispatch } = useMechanicContext();

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 h-full flex flex-col animate-fade-in">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-blue-300">Mis Notas</h2>
        <p className="text-gray-400">Anota aquí tus hallazgos, impresiones y recordatorios. Son privados.</p>
      </div>
      <textarea
        className="flex-grow w-full resize-none rounded-xl border border-gray-700 bg-gray-900/70 p-4 text-base leading-7 text-gray-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
        value={gameState.playerNotes}
        onChange={(event) => dispatch({ type: 'update_notes', notes: event.target.value })}
        placeholder="Escribe tus hallazgos aquí..."
      />
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-in forwards; }
      `}</style>
    </div>
  );
};

export default NotesMechanic;
