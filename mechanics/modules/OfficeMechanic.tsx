import React from 'react';
import { useMechanicContext } from '../MechanicContext';
import DialogueArea from '../office/components/DialogueArea';
import DirectorDesk from '../office/components/DirectorDesk';
import ActionBar from '../office/components/ActionBar';
import Spinner from '../shared/components/Spinner';
import { Stakeholder } from '../../types';

const OfficeMechanic: React.FC = () => {
  const { gameState, office, dispatch, contentPack } = useMechanicContext();

  if (!office || office.variant !== 'default') {
    return null;
  }

  const {
    characterInFocus,
    currentDialogue,
    isDialogueNarration,
    playerActions,
    isLoading,
    gameStatus,
    currentMeeting,
    onPlayerAction,
    onNavigateTab,
    onActionHover,
    onDialogueTypingChange
  } = office;

  let sceneParticipants: Stakeholder[] | undefined;
  const currentNodeId = currentMeeting?.sequence.nodes[currentMeeting.nodeIndex];
  const currentNodeDefinition = currentNodeId
    ? contentPack.scenarios.scenarios.find((node) => node.node_id === currentNodeId)
    : undefined;

  if (currentNodeDefinition?.participantIds && currentNodeDefinition.participantIds.length > 0) {
    const participants = currentNodeDefinition.participantIds
      .map((participantId) => gameState.stakeholders.find((stakeholder) => stakeholder.id === participantId))
      .filter((stakeholder): stakeholder is Stakeholder => Boolean(stakeholder));
    sceneParticipants = participants.length > 0 ? participants : undefined;
  } else if (currentMeeting?.sequence.sequence_id === 'SCHEDULE_WAR_SEQ') {
    if (currentNodeId !== 'SCHEDULE_WAR_SOFIA_CHOICE') {
      const guzman = gameState.stakeholders.find((s) => s.role === 'Jefe Sector Azul');
      const soto = gameState.stakeholders.find((s) => s.role === 'Jefa Sector Rojo');
      const rios = gameState.stakeholders.find((s) => s.role === 'Jefe Sector Amarillo');
      if (guzman && soto && rios) {
        sceneParticipants = [guzman, soto, rios];
      }
    }
  }

  const isDialogueActive = Boolean(characterInFocus || currentMeeting);

  const renderCentralPanel = () => {
    if (isDialogueActive) {
      const backgroundKey =
        currentNodeDefinition?.backgroundKey ??
        currentMeeting?.sequence.backgroundKey ??
        'box';
      return (
        <DialogueArea
          key={characterInFocus?.name ?? currentNodeId ?? 'narration'}
          stakeholder={characterInFocus}
          participants={sceneParticipants}
          allStakeholders={gameState.stakeholders}
          dialogue={currentDialogue}
          isNarration={isDialogueNarration}
          timeSlot={gameState.timeSlot}
          backgroundKey={backgroundKey}
          onTypingStateChange={onDialogueTypingChange}
        />
      );
    }

    return (
      <DirectorDesk
        gameState={gameState}
        onNavigate={onNavigateTab}
        onUpdateNotes={(notes) => dispatch({ type: 'update_notes', notes })}
      />
    );
  };

  return (
    <div className="relative h-[calc(100vh-220px)] min-h-[520px]">
      <div className="flex flex-col lg:flex-row gap-4 h-full ml-2">
        <div className="flex-grow flex flex-col h-full">
          <div className="w-full min-h-[520px] max-h-[75vh] bg-gray-800/50 rounded-xl border border-gray-700 overflow-visible">
            {renderCentralPanel()}
          </div>
          {isDialogueActive && (
            <div className="mt-3 bg-gray-800/50 p-4 rounded-xl border border-gray-700 relative flex-shrink-0 max-h-[32vh] overflow-visible">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center rounded-xl z-10">
                  <Spinner />
                </div>
              )}
              <ActionBar
                actions={playerActions}
                onAction={onPlayerAction}
                disabled={isLoading || gameStatus !== 'playing'}
                onHoverEffects={onActionHover}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficeMechanic;
