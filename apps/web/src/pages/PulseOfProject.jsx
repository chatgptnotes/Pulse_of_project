import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PulseOfProject from '../modules/pulseofproject/PulseOfProject';

const PulseOfProjectPage = () => {
  // Check if we're in client mode based on URL params
  const [searchParams] = useSearchParams();
  const clientMode = searchParams.get('client') === 'true';
  const projectId = searchParams.get('project') || null; // No default project

  return (
    <PulseOfProject
      clientMode={clientMode}
      projectId={projectId}
    />
  );
};

export default PulseOfProjectPage;