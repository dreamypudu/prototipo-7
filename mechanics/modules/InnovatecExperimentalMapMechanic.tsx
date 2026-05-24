import React from 'react';
import ExperimentalMap from '../experimental_map/components/InnovatecExperimentalMap';
import { useMechanicContext } from '../MechanicContext';

const InnovatecExperimentalMapMechanic: React.FC = () => {
  const { gameState } = useMechanicContext();
  return <ExperimentalMap gameState={gameState} />;
};

export default InnovatecExperimentalMapMechanic;
