import React from 'react';

interface HelpLink {
  label: string;
  href?: string;
}

interface HelpSection {
  heading: string;
  content?: string;
  items?: string[];
  links?: HelpLink[];
}

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sections?: HelpSection[];
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose, title = 'Ayuda', sections = [] }) => {
  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
    >
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 right-0 h-full w-[360px] max-w-full bg-gray-900 text-white border-l border-gray-700 shadow-2xl transform transition-transform duration-250 ease-out ${
          isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-teal-200/80">Centro de ayuda</div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-300"
            aria-label="Cerrar ayuda"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
          {sections.length === 0 && (
            <p className="text-sm text-gray-300">
              Usa este panel para mostrar tips contextuales de la mecánica o versión actual.
            </p>
          )}
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-sm font-semibold text-teal-200">{section.heading}</h4>
              {section.content && <p className="text-sm text-gray-200">{section.content}</p>}
              {section.items && (
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {section.links && (
                <div className="flex flex-col gap-1">
                  {section.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      className="text-sm text-teal-200 hover:text-teal-100 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default HelpPanel;
