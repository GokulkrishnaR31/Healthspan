import React, { useState } from 'react';
import MobileLayout from '../../components/MobileLayout';
import SleepActivityTracker from '../../components/SleepActivityTracker';
import VoiceMealModal from '../../components/VoiceMealModal';

export default function ElderActivitySleepPage() {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  return (
    <MobileLayout onOpenVoiceLog={() => setIsVoiceModalOpen(true)}>
      <div className="space-y-6">
        <SleepActivityTracker onVoiceSleepInput={() => setIsVoiceModalOpen(true)} />
      </div>

      <VoiceMealModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </MobileLayout>
  );
}
