import React from 'react';
import { Stakeholder, TimeSlotType } from '../../../types';
import { useTypewriter } from '../../../hooks/useTypewriter';
import NpcHover from '../../shared/components/NpcHover';
import { primeImageAlpha, isClientPointOpaque } from '../../../services/imageAlpha';

// Sprite de NPC en la escena de diálogo con hitbox por silueta: el tooltip y el cursor
// solo reaccionan sobre los píxeles opacos del PNG (no sobre el rectángulo transparente).
const SilhouetteSprite: React.FC<{ stakeholder: Stakeholder; isActive: boolean }> = ({ stakeholder, isActive }) => {
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [over, setOver] = React.useState(false);
  const src = stakeholder.portraitUrl ?? '';

  React.useEffect(() => {
    primeImageAlpha(src);
  }, [src]);

  const handleMove = (event: React.MouseEvent) => {
    setOver(isClientPointOpaque(imgRef.current, src, event.clientX, event.clientY));
  };

  return (
    <div
      className={`transition-all duration-500 ease-in-out transform flex flex-col justify-end
                ${isActive ? 'scale-105 z-20 filter-none opacity-100' : 'scale-90 z-10 grayscale-[35%] opacity-85'}`}
      style={{ maxHeight: '70vh', maxWidth: '28vw' }}
    >
      <NpcHover stakeholder={stakeholder} placement="auto" open={over} triggerClassName="pointer-events-auto">
        <img
          ref={imgRef}
          src={stakeholder.portraitUrl}
          alt={stakeholder.name}
          onMouseMove={handleMove}
          onMouseLeave={() => setOver(false)}
          className={`max-h-[60vh] w-auto object-contain drop-shadow-2xl transition-transform duration-200 ${over ? 'scale-[1.03] cursor-help' : 'cursor-default'}`}
        />
      </NpcHover>
    </div>
  );
};

interface DialogueAreaProps {
  stakeholder?: Stakeholder | null;          // NPC que esta hablando; null para narracion
  participants?: Stakeholder[];              // NPC presentes en la escena
  allStakeholders?: Stakeholder[];           // Plantel completo (para tooltips)
  dialogue: string;
  isNarration?: boolean;
  timeSlot: TimeSlotType;
  backgroundKey?: keyof typeof backgroundImages;
  onTypingStateChange?: (isTyping: boolean) => void;
}

// Fondos locales (assets). Solo se usan tres escenarios: oficina CESFAM, pasillo de hospital y box.
const backgroundImages: Record<TimeSlotType | 'hospital' | 'box', string> = {
  'mañana': '/data/versions/cesfam/assets/oficina-cesfam.PNG',
  tarde: '/data/versions/cesfam/assets/oficina-cesfam.PNG',
  noche: '/data/versions/cesfam/assets/oficina-cesfam.PNG',
  hospital: '/data/versions/cesfam/assets/pasillo-hospital.png',
  box: '/data/versions/cesfam/assets/box-cesfam.jpeg',
};

const DialogueArea: React.FC<DialogueAreaProps> = ({
  stakeholder,
  participants,
  allStakeholders,
  dialogue,
  isNarration = false,
  timeSlot,
  backgroundKey,
  onTypingStateChange
}) => {
  const [skipTyping, setSkipTyping] = React.useState(false);
  const lastTypingStateRef = React.useRef<boolean | null>(null);

  // Reset el salto cuando cambia el diálogo (solo afecta a la línea actual)
  React.useEffect(() => {
    setSkipTyping(false);
  }, [dialogue]);

  const safeDialogue = typeof dialogue === 'string' ? dialogue : '';
  const typedText = useTypewriter(safeDialogue, 15);
  const displayedText = skipTyping ? safeDialogue : typedText;
  const isTyping = safeDialogue.length > 0 && !skipTyping && displayedText.length < safeDialogue.length;

  React.useEffect(() => {
    if (lastTypingStateRef.current == isTyping) return;
    lastTypingStateRef.current = isTyping;
    onTypingStateChange?.(isTyping);
  }, [isTyping, onTypingStateChange]);

  React.useEffect(() => () => onTypingStateChange?.(false), [onTypingStateChange]);

  const key = backgroundKey || timeSlot;
  const bgImage = backgroundImages[key] || backgroundImages['mañana'];

  // If a scene provides participants, keep them, but always ensure the active speaker is visible.
  const activeParticipants =
    participants && participants.length > 0
      ? stakeholder && !participants.some((participant) => participant.id === stakeholder.id)
        ? [...participants, stakeholder]
        : participants
      : stakeholder
        ? [stakeholder]
        : [];
  const roster = allStakeholders ?? activeParticipants;
  const showNameplate = Boolean(stakeholder && !isNarration);

  const renderWithTooltips = (text: string) => {
    if (!text) return '';

    // 1) Respetar los tags explícitos [[npc:id|Alias]]
    if (text.includes('[[npc:')) {
      const tagRegex = /\[\[npc:([^\]|]+)(?:\|([^\]]+))?\]\]/gi;
      const nodes: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = tagRegex.exec(text)) !== null) {
        const [full, npcId, alias] = match;
        if (match.index > lastIndex) {
          nodes.push(
            <React.Fragment key={`txt-${nodes.length}`}>{text.slice(lastIndex, match.index)}</React.Fragment>
          );
        }
        const target = roster.find((s) => s.id === npcId);
        if (target) {
          nodes.push(
            <NpcHover key={`npc-${nodes.length}-${npcId}`} stakeholder={target}>
              {alias || target.name}
            </NpcHover>
          );
        } else {
          nodes.push(<React.Fragment key={`miss-${nodes.length}`}>{alias || npcId}</React.Fragment>);
        }
        lastIndex = match.index + full.length;
      }
      if (lastIndex < text.length) {
        nodes.push(<React.Fragment key={`tail-${lastIndex}`}>{text.slice(lastIndex)}</React.Fragment>);
      }
      return nodes;
    }

    // 2) Auto-etiquetado: nombres con y sin tildes, nombres/ apellidos y shortId
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const tokenCandidates = new Map<string, Set<string>>();
    const registerToken = (token: string, id: string) => {
      const normalized = token.trim();
      if (!normalized) return;
      const current = tokenCandidates.get(normalized) ?? new Set<string>();
      current.add(id);
      tokenCandidates.set(normalized, current);
    };

    roster.forEach((s) => {
      const full = s.name.trim();
      const noAcc = stripAccents(full);
      const parts = full.split(/\s+/);
      const first = parts[0];
      const last = parts[parts.length - 1];

      // Evitar que títulos/roles cortos como "TENS", "Dr.", "Enf." se auto-enlacen
      const roleTokens = ['tens', 'dr.', 'dr', 'enf.', 'enf', 'sr.', 'sr', 'sra.', 'sra', 'srta.', 'srta', 'ing.', 'ing', 'lic.', 'lic'];
      const skipFirst = roleTokens.includes(first.toLowerCase());

      registerToken(full, s.id);
      registerToken(noAcc, s.id);
      if (!skipFirst) {
        registerToken(first, s.id);
        registerToken(stripAccents(first), s.id);
      }
      registerToken(last, s.id);
      registerToken(stripAccents(last), s.id);
    });

    const aliasMap: { token: string; id: string }[] = [];
    tokenCandidates.forEach((ids, token) => {
      // Los nombres completos siempre pueden enlazarse; apellidos o nombres ambiguos no.
      const tokenLooksFullName = token.trim().includes(' ');
      if (!tokenLooksFullName && ids.size > 1) return;
      ids.forEach((id) => aliasMap.push({ token, id }));
    });

    if (aliasMap.length === 0) return text;

    // Ordenar por longitud para evitar que un apellido corto se trague uno largo
    aliasMap.sort((a, b) => b.token.length - a.token.length);

    const filtered = aliasMap.filter(({ token }) => token.length > 2); // evita capturar "en", "de", etc.
    if (filtered.length === 0) return text;

    const pattern = filtered.map(({ token }) => escape(token)).join('|');
    const nameRegex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    const nodes: React.ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = nameRegex.exec(text)) !== null) {
      const [full] = m;
      if (m.index > last) {
        nodes.push(<React.Fragment key={`txt-${nodes.length}`}>{text.slice(last, m.index)}</React.Fragment>);
      }
      // Buscar por token normalizado
      const target = aliasMap.find((a) => a.token.toLowerCase() === full.toLowerCase());
      const stakeholderMatch = target ? roster.find((s) => s.id === target.id) : undefined;
      if (stakeholderMatch) {
        nodes.push(
          <NpcHover key={`npc-${nodes.length}-${stakeholderMatch.id}`} stakeholder={stakeholderMatch}>
            {full}
          </NpcHover>
        );
      } else {
        nodes.push(<React.Fragment key={`miss-${nodes.length}`}>{full}</React.Fragment>);
      }
      last = m.index + full.length;
    }
    if (last < text.length) nodes.push(<React.Fragment key={`tail-${last}`}>{text.slice(last)}</React.Fragment>);
    return nodes;
  };

  const renderDialogueText = (text: string) => {
    const lines = text.split('\n');
    return lines.flatMap((line, index) => {
      const trimmed = line.trim();
      const isNarratorLine = isNarration || trimmed.startsWith('(');
      const narratorText = isNarratorLine
        ? trimmed.replace(/^\(/, '').replace(/\)?$/, '')
        : line;
      const renderedLine = isNarratorLine ? (
        <em key={`line-${index}`} className="text-gray-300 italic">
          {renderWithTooltips(narratorText)}
        </em>
      ) : (
        <React.Fragment key={`line-${index}`}>{renderWithTooltips(line)}</React.Fragment>
      );

      return index < lines.length - 1
        ? [renderedLine, <React.Fragment key={`br-${index}`}>{'\n'}</React.Fragment>]
        : [renderedLine];
    });
  };

  return (
    <div
      className="relative w-full h-full bg-center transition-all duration-1000 overflow-visible min-h-[520px]"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#080d16'
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

      {/* Character Sprites Container */}
      <div className="absolute bottom-0 left-0 w-full h-full flex justify-center items-end px-2 md:px-6 gap-3 md:gap-6 pb-10 md:pb-8 pointer-events-none">
        {activeParticipants.map((p) => (
          <SilhouetteSprite
            key={p.id}
            stakeholder={p}
            isActive={Boolean(stakeholder && p.id === stakeholder.id)}
          />
        ))}
      </div>

      {/* Dialogue Box */}
      <div className="absolute bottom-5 left-5 right-5 dialogue-box p-5 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in z-30">
        {showNameplate && stakeholder && (
          <div className="dialogue-nameplate absolute -top-4 left-8 rounded-t-lg px-4 py-2 flex items-center gap-2">
            <h3 className="text-xl font-bold text-white drop-shadow-md">{stakeholder.name}</h3>
            <span className="text-xs text-gray-400 uppercase tracking-widest">({stakeholder.role})</span>
          </div>
        )}
        <div
          className={`text-md lg:text-lg text-gray-100 leading-relaxed max-h-28 pr-2 scroll-soft overflow-visible cursor-pointer whitespace-pre-wrap ${showNameplate ? 'mt-4' : 'mt-0'}`}
          onClick={() => setSkipTyping(true)}
          title="Click para mostrar todo el texto"
        >
          {renderDialogueText(displayedText)}
          <span
            className={`inline-block w-2 h-5 bg-gray-200 ml-1 ${
              displayedText.length === safeDialogue.length || skipTyping ? 'animate-none opacity-0' : 'animate-pulse'
            }`}
          />
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
};

export default DialogueArea;
