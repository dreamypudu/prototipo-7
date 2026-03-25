import React from 'react';
import DocumentReader from '../../components/DocumentReader';
import { useMechanicContext } from '../MechanicContext';

const DocumentsMechanic: React.FC = () => {
  const { gameState, dispatch, contentPack } = useMechanicContext();
  return (
    <DocumentReader
      documents={contentPack.documents}
      readDocuments={gameState.readDocuments}
      onMarkAsRead={(documentId) => dispatch({ type: 'mark_document_read', docId: documentId })}
    />
  );
};

export default DocumentsMechanic;
