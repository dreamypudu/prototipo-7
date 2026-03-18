import React from 'react';
import StakeholderSummaryDashboard from '../../components/StakeholderSummaryDashboard';
import { SECRETARY_ROLE } from '../../data/versions/innovatec/defaults';
import { useMechanicContext } from '../MechanicContext';

const InnovatecSummaryMechanic: React.FC = () => {
  const { gameState } = useMechanicContext();
  return (
    <StakeholderSummaryDashboard gameState={gameState} secretaryRole={SECRETARY_ROLE} />
  );
};

export default InnovatecSummaryMechanic;
