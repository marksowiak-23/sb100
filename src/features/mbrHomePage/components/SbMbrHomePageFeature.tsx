import React from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMbrHomePageFeatureProps {
  onClickReadStory?: (memberId: string) => void;
  onClickAuthorPage?: (initialPrompt?: string) => void;
  onNavigate?: (tab: string) => void;
}

export default function SbMbrHomePageFeature({ onClickReadStory, onClickAuthorPage, onNavigate }: SbMbrHomePageFeatureProps) {
  return (
    <div className="w-full relative">
      {/* 3-Column Responsive Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftColumn onClickAuthorPage={onClickAuthorPage} onClickReadStory={onClickReadStory} />
        </div>

        {/* Center Column Section */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn onClickReadStory={onClickReadStory} onClickAuthorPage={onClickAuthorPage} onNavigate={onNavigate} />
        </div>


        {/* Right Column Section: Recommended publishing sponsors and legal footer links */}
        <div className="lg:col-span-3">
          <RightColumn />
        </div>

      </div>
      <AdminComponentTag name="SbMbrHomePageFeature" />
    </div>
  );
}

