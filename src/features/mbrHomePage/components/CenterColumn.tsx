import React from 'react';
import SbHeroWelcomeCard from './SbHeroWelcomeCard';
import SbGettingStartedCard from './SbGettingStartedCard';
import SbPersonalTriviaCard from './SbPersonalTriviaCard';
import SbRememberWhenCard from './SbRememberWhenCard';
import SbEasyStoryWritingCard from './SbEasyStoryWritingCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { useHomePageCardConfigs } from '@/src/hooks/useHomePageCardConfigs';

interface CenterColumnProps {
  onClickReadStory?: (memberId: string) => void;
  onClickAuthorPage?: (initialPrompt?: string, section?: string, trivia?: any) => void;
  onNavigate?: (tab: string) => void;
}

export default function CenterColumn({ onClickReadStory, onClickAuthorPage, onNavigate }: CenterColumnProps) {
  const {
    isGettingStartedCardEnabled,
    isPersonalTriviaCardEnabled,
    isRememberWhenCardEnabled
  } = useHomePageCardConfigs();

  return (
    <div className="space-y-6 flex flex-col relative">
      <div data-coach-mark="home-welcome-card">
        <SbHeroWelcomeCard />
      </div>
      {isGettingStartedCardEnabled && (
        <div data-coach-mark="home-getting-started">
          <SbGettingStartedCard onNavigate={onNavigate} onClickAuthorPage={onClickAuthorPage} />
        </div>
      )}
      {isPersonalTriviaCardEnabled && (
        <div data-coach-mark="home-daily-sparks">
          <SbPersonalTriviaCard onClickAuthorPage={onClickAuthorPage} />
        </div>
      )}
      {isRememberWhenCardEnabled && (
        <SbRememberWhenCard onClickAuthorPage={onClickAuthorPage} />
      )}
      
      {/* Easy Story Writing panel displayed on mobile under the Did You Know panel */}
      <div className="block lg:hidden">
        <SbEasyStoryWritingCard onClickAuthorPage={onClickAuthorPage} />
      </div>

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}




