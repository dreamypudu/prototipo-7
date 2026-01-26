import React from 'react';

interface HelpButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick, ariaLabel = 'Abrir ayuda' }) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white/10 border border-teal-200/60 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:bg-white/16 hover:shadow-[0_14px_36px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all"
    >
      <span className="text-2xl font-bold leading-none">?</span>
    </button>
  );
};

export default HelpButton;
