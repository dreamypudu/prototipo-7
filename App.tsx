import React, { useState } from 'react';
import VersionSelector from './components/VersionSelector';
import type { SimulatorVersion } from './types';
import GestionEnSaludApp from './versions/cesfam/GestionEnSalud_App';
import InnovatecApp from './versions/innovatec/Innovatec_App';

export default function App(): React.ReactElement {
  const [selectedVersion, setSelectedVersion] = useState<SimulatorVersion | null>(null);

  if (!selectedVersion) {
    return <VersionSelector onSelect={setSelectedVersion} />;
  }

  if (selectedVersion === 'INNOVATEC') {
    return <InnovatecApp onExitToHome={() => setSelectedVersion(null)} />;
  }

  return (
    <GestionEnSaludApp
      version={selectedVersion}
      onExitToHome={() => setSelectedVersion(null)}
    />
  );
}
