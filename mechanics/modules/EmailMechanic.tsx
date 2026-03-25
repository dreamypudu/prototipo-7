import React from 'react';
import EmailClient from '../../components/EmailClient';
import { useMechanicContext } from '../MechanicContext';

const EmailMechanic: React.FC = () => {
  const { gameState, dispatch, contentPack } = useMechanicContext();
  return (
    <EmailClient
      inbox={gameState.inbox}
      templates={contentPack.emails}
      onMarkAsRead={(emailId) => dispatch({ type: 'mark_email_read', emailId })}
    />
  );
};

export default EmailMechanic;
