/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import StoryMatePanel from './StoryMatePanel';
import StoryEditorPanel from './StoryEditorPanel';
import SbMbrAuthorProfile from './SbMbrAuthorProfile';
import SbMbrBookEditor from '@/src/components/SbMbrBookEditor';
import SbMbrStryFamily from './SbMbrStryFamily';
import SbMbrStryResidence from './SbMbrStryResidence';
import SbMbrStryActivity from './SbMbrStryActivity';
import SbMbrStryAchievement from './SbMbrStryAchievement';
import SbMbrStryEducation from './SbMbrStryEducation';
import SbMbrStryEmployment from './SbMbrStryEmployment';

interface CenterColumnProps {
  isSandbox: boolean;
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
  onSaveActiveContent: (newContent: string[]) => void;
}

export default function CenterColumn({
  isSandbox,
  activeSection,
  activeContent,
  onClickBack,
  onSaveActiveContent
}: CenterColumnProps) {
  const [showStoryMate, setShowStoryMate] = useState(false);
  const [storyEditorConfig, setStoryEditorConfig] = useState<{ topicId: string; topicTitle: string; componentName?: string } | null>(null);

  // Hide StoryMate panel and StoryEditor panel whenever the active topic/section changes
  const [storyMateConfig, setStoryMateConfig] = useState<{
    componentName?: string;
    topicId?: string;
    topicTitle?: string;
    activeStoryId?: string;
    mbrStoryThreadID?: string;
    chIntentId?: string;
    storyTitle?: string;
    storyContent?: string;
  } | null>(null);

  useEffect(() => {
    setShowStoryMate(false);
    setStoryMateConfig(null);
    setStoryEditorConfig(null);
  }, [activeSection]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      const detail = e?.detail || {};
      setStoryMateConfig({
        componentName: detail.componentName,
        topicId: detail.topicId || activeSection,
        topicTitle: detail.topicTitle,
        activeStoryId: detail.activeStoryId,
        mbrStoryThreadID: detail.mbrStoryThreadID,
        chIntentId: detail.chIntentId,
        storyTitle: detail.storyTitle,
        storyContent: detail.storyContent,
      });
      setShowStoryMate(true);
      setTimeout(() => {
        const el = document.getElementById('story-mate-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    window.addEventListener('open-story-mate', handleOpen);
    return () => window.removeEventListener('open-story-mate', handleOpen);
  }, [activeSection]);

  useEffect(() => {
    const handleOpenEditor = (e: any) => {
      const detail = e.detail || {};
      setStoryEditorConfig({
        topicId: detail.topicId || activeSection,
        topicTitle: detail.topicTitle || 'Section',
        componentName: detail.componentName
      });
      setTimeout(() => {
        const el = document.getElementById('story-editor-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    window.addEventListener('open-story-editor', handleOpenEditor);
    return () => window.removeEventListener('open-story-editor', handleOpenEditor);
  }, [activeSection]);

  return (
    <div className="space-y-6 flex flex-col">
      
      {/* --- BACK NAVIGATION LINK --- */}
      <div>
        <button
          onClick={onClickBack}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* --- PROFILE SUMMARY CARD --- */}
      <SbMbrAuthorProfile isSandbox={isSandbox} />

      {/* --- ACTIVE BOOK EDITOR (FOR INTRODUCTION & DEMOGRAPHICS) --- */}
      {(activeSection === 'introduction' || activeSection === 'demographics') && (
        <SbMbrBookEditor
          sectionTitle={activeSection}
          content={activeContent}
          onSave={onSaveActiveContent}
        />
      )}

      {/* --- FAMILY DIRECTORY PANEL --- */}
      {activeSection === 'family' && (
        <SbMbrStryFamily isSandbox={isSandbox} />
      )}

      {/* --- RESIDENCES PANEL --- */}
      {activeSection === 'residencies' && (
        <SbMbrStryResidence isSandbox={isSandbox} />
      )}

      {/* --- ACTIVITIES & HOBBIES PANEL --- */}
      {activeSection === 'hobbies' && (
        <SbMbrStryActivity isSandbox={isSandbox} />
      )}

      {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
      {activeSection === 'achievements' && (
        <SbMbrStryAchievement isSandbox={isSandbox} />
      )}

      {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
      {activeSection === 'education' && (
        <SbMbrStryEducation isSandbox={isSandbox} />
      )}

      {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
      {activeSection === 'employment' && (
        <SbMbrStryEmployment isSandbox={isSandbox} />
      )}

      {storyEditorConfig && (
        <StoryEditorPanel
          topicId={storyEditorConfig.topicId}
          topicTitle={storyEditorConfig.topicTitle}
          componentName={storyEditorConfig.componentName}
          isSandbox={isSandbox}
          onClose={() => setStoryEditorConfig(null)}
        />
      )}

      {/* --- STORY MATE PANEL --- */}
      {showStoryMate && (
        <StoryMatePanel
          memberName="Eleanor"
          componentName={storyMateConfig?.componentName}
          topicId={storyMateConfig?.topicId || activeSection}
          storyTitle={storyMateConfig?.storyTitle}
          storyContent={storyMateConfig?.storyContent}
          mbrStoryThreadID={storyMateConfig?.mbrStoryThreadID}
          chIntentId={storyMateConfig?.chIntentId}
          onClose={() => {
            setShowStoryMate(false);
            setStoryMateConfig(null);
          }}
        />
      )}

    </div>
  );
}
