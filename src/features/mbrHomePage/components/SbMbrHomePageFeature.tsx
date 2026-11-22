import React, { useState, useEffect } from 'react';
import { Award, Sparkles } from 'lucide-react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import MbrEarlyAdopter from '@/src/components/mbrEarlyAdopter';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMbrHomePageFeatureProps {
  onClickReadStory?: (memberId: string) => void;
  onClickAuthorPage?: (initialPrompt?: string, section?: string, trivia?: any) => void;
  onNavigate?: (tab: string) => void;
}

export default function SbMbrHomePageFeature({ onClickReadStory, onClickAuthorPage, onNavigate }: SbMbrHomePageFeatureProps) {
  const [showEarlyAdopterModal, setShowEarlyAdopterModal] = useState(false);
  const [earlyAdopterMode, setEarlyAdopterMode] = useState<'welcome' | 'badge'>('badge');
  const [memberFirstName, setMemberFirstName] = useState<string>('');

  useEffect(() => {
    try {
      const mbrStr = sessionStorage.getItem('sb_current_mbr');
      if (mbrStr) {
        const parsed = JSON.parse(mbrStr);
        if (parsed?.mbrFirstName) setMemberFirstName(parsed.mbrFirstName);
      }
    } catch {}

    // Pop up the Early Adopter welcome dialog automatically right after member registration.
    // Remove the sessionStorage flag ONLY inside the timer callback so React StrictMode's
    // mount -> unmount -> remount cycle in dev doesn't consume the flag before the modal opens.
    try {
      const shouldShowWelcome = sessionStorage.getItem('sb_show_early_adopter_welcome') === 'true';
      if (shouldShowWelcome) {
        const timer = window.setTimeout(() => {
          try {
            sessionStorage.removeItem('sb_show_early_adopter_welcome');
          } catch {}
          setEarlyAdopterMode('welcome');
          setShowEarlyAdopterModal(true);
        }, 400);
        return () => window.clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleOpenFromBadge = () => {
    setEarlyAdopterMode('badge');
    setShowEarlyAdopterModal(true);
  };

  return (
    <div className="w-full relative">
      {/* Mobile Early Adopter Badge (< lg) */}
      <div className="lg:hidden max-w-7xl w-full mx-auto mb-4">
        <button
          type="button"
          onClick={handleOpenFromBadge}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E1B4B] border border-amber-400/50 text-amber-300 text-xs font-serif font-bold shadow-md cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Early Adopter</span>
          <span className="text-[10px] font-sans font-normal text-slate-300">· Free Lifetime Member</span>
          <Sparkles className="w-3 h-3 text-amber-200" />
        </button>
      </div>

      {/* 3-Column Responsive Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftColumn
            onClickAuthorPage={onClickAuthorPage}
            onClickReadStory={onClickReadStory}
            onOpenEarlyAdopter={handleOpenFromBadge}
          />
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

      {/* Founding Early Adopter Dialog */}
      <MbrEarlyAdopter
        isOpen={showEarlyAdopterModal}
        onClose={() => setShowEarlyAdopterModal(false)}
        mode={earlyAdopterMode}
        memberFirstName={memberFirstName}
        onStartWriting={() => onClickAuthorPage?.()}
        onViewAccount={() => {
          if (onNavigate) {
            onNavigate('mbrAccountPage');
          } else {
            window.dispatchEvent(new CustomEvent('open-member-account'));
          }
        }}
      />

      <AdminComponentTag name="SbMbrHomePageFeature" />
    </div>
  );
}

