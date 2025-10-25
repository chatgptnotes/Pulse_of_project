import React from 'react';
import PulseOfProject from '../modules/pulseofproject/PulseOfProject';

const PulseOfProjectPage = () => {
  // Check if we're in client mode based on URL params
  const urlParams = new URLSearchParams(window.location.search);
  const clientMode = urlParams.get('client') === 'true';
  const projectId = urlParams.get('project') || 'neurosense-mvp';

  return (
    <PulseOfProject
      clientMode={clientMode}
      projectId={projectId}
    />
  );
};

export default PulseOfProjectPage;