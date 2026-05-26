import React, { useState } from 'react';
import VersionSelector from './components/VersionSelector';
import type { RunMode, SimulatorVersion } from './types';
import { DEFAULT_CESFAM_MODULE_ID, getCesfamContentPack, type CesfamNarrativeModuleId } from './data/versions/cesfam';
import GestionEnSaludApp from './versions/cesfam/GestionEnSalud_App';
import InnovatecApp from './versions/innovatec/Innovatec_App';

export default function App(): React.ReactElement {
  const [selectedVersion, setSelectedVersion] = useState<SimulatorVersion | null>(null);
  const [selectedCesfamModuleId, setSelectedCesfamModuleId] = useState<CesfamNarrativeModuleId>(DEFAULT_CESFAM_MODULE_ID);
  const selectedRunMode: RunMode = selectedVersion === 'CESFAM' && selectedCesfamModuleId === 'tutorial'
    ? 'tutorial'
    : 'experiment';

  const returnToSelector = () => {
    setSelectedVersion(null);
    setSelectedCesfamModuleId(DEFAULT_CESFAM_MODULE_ID);
  };

  if (!selectedVersion) {
    return (
      <VersionSelector
        onSelect={(version, options) => {
          if (version === 'CESFAM') {
            setSelectedCesfamModuleId(options?.cesfamModuleId ?? DEFAULT_CESFAM_MODULE_ID);
          }
          setSelectedVersion(version);
        }}
      />
    );
  }

  if (selectedVersion === 'INNOVATEC') {
    return <InnovatecApp onExitToHome={returnToSelector} />;
  }

  return (
    <GestionEnSaludApp
      version={selectedVersion}
      contentPack={selectedVersion === 'CESFAM' ? getCesfamContentPack(selectedCesfamModuleId) : undefined}
      runMode={selectedRunMode}
      onExitToHome={returnToSelector}
    />
  );
}
