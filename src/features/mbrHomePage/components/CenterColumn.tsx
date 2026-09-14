import React from 'react';
import SbHeroWelcomeCard from './SbHeroWelcomeCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  onClickReadStory?: (memberId: string) => void;
}

export default function CenterColumn({ onClickReadStory }: CenterColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      <SbHeroWelcomeCard />
      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}


