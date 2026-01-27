import React from 'react';
import { useMechanicContext } from '../MechanicContext';
import DialogueArea from '../../components/DialogueArea';
import DirectorDesk from '../../components/DirectorDesk';
import ActionBar from '../../components/ActionBar';
import Spinner from '../../components/ui/Spinner';
import { Stakeholder } from '../../types';

const OfficeMechanic: React.FC = () => {
  const { gameState, office, dispatch } = useMechanicContext();

  if (!office || office.variant !== 'default') {
    return null;
  }

  const {
    characterInFocus,
    currentDialogue,
    playerActions,
    isLoading,
    gameStatus,
    currentMeeting,
    onPlayerAction,
    onNavigateTab,
    onActionHover
  } = office;

  let sceneParticipants: Stakeholder[] | undefined;
  if (currentMeeting?.sequence.sequence_id === 'SCHEDULE_WAR_SEQ') {
    const guzman = gameState.stakeholders.find((s) => s.role === 'Jefe Sector Azul');
    const soto = gameState.stakeholders.find((s) => s.role === 'Jefa Sector Rojo');
    const rios = gameState.stakeholders.find((s) => s.role === 'Jefe Sector Amarillo');
    if (guzman && soto && rios) {
      sceneParticipants = [guzman, soto, rios];
    }
  }

  const renderCentralPanel = () => {
    if (characterInFocus) {
      const isIntroHospital = gameState.day <= 1 && gameState.completedSequences.length < 2;
      const backgroundKey = isIntroHospital ? 'hospital' : 'box';
      return (
        <DialogueArea
          key={characterInFocus.name}
          stakeholder={characterInFocus}
          participants={sceneParticipants}
          allStakeholders={gameState.stakeholders}
          dialogue={currentDialogue}
          timeSlot={gameState.timeSlot}
          backgroundKey={backgroundKey as any}
        />
      );
    }

    return (
      <DirectorDesk
        gameState={gameState}
        onNavigate={onNavigateTab}
        onCall={(stakeholder) => dispatch({ type: 'call_stakeholder', stakeholder })}
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
          {characterInFocus && (
            <div className="mt-3 bg-gray-800/50 p-4 rounded-xl border border-gray-700 relative flex-shrink-0 max-h-[32vh] overflow-auto">
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
