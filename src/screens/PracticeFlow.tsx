import React, { useState } from 'react';
import { PracticeSetupScreen } from './PracticeSetupScreen';
import { PracticeActiveScreen } from './PracticeActiveScreen';
import { PracticeSummaryScreen } from './PracticeSummaryScreen';
interface PracticeFlowProps {
  onClose: () => void;
}
export function PracticeFlow({ onClose }: PracticeFlowProps) {
  const [step, setStep] = useState<'setup' | 'active' | 'summary'>('setup');
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const handleStart = (practiceConfig: any) => {
    setConfig(practiceConfig);
    setStep('active');
  };
  const handleEnd = (practiceStats: any) => {
    setStats(practiceStats);
    setStep('summary');
  };
  return (
    <>
      {step === 'setup' &&
      <PracticeSetupScreen onClose={onClose} onStart={handleStart} />
      }
      {step === 'active' &&
      <PracticeActiveScreen config={config} onEnd={handleEnd} />
      }
      {step === 'summary' &&
      <PracticeSummaryScreen stats={stats} onDone={onClose} />
      }
    </>);

}