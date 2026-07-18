/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';

interface SbMbrAuthorPageFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
}

const STORY_CONTENTS: Record<string, string[]> = {
  introduction: [
    "Eleanor Hartwell was born in the coastal town of Coos Bay, Oregon, in the autumn of 1961 — the second of four children raised in a weathered house that sat close enough to the water that the family could hear the tide turn in the night. Her father worked the docks; her mother kept a kitchen garden and read poetry aloud on Sunday mornings. It was a life measured not in milestones but in seasons, in the smell of rain on cedar, in the rhythm of boats leaving and returning.",
    "She spent her childhood in the company of her grandfather, Harold, a taciturn man who had served in the Pacific and come home carrying something he never named. He taught Eleanor to fish, to mend nets, and to sit quietly with discomfort — lessons she would draw on for the rest of her life. When Harold died the summer Eleanor turned twelve, she began writing. Not because anyone encouraged her, but because silence had to go somewhere.",
    "The chapters that follow are Eleanor's attempt to trace the invisible threads connecting her childhood on the Oregon coast to the woman she became: a schoolteacher, a gardener, a late-in-life painter, and a grandmother of three. She writes not to settle old accounts but to understand them — to find, in the accumulating details of an ordinary life, something worth passing on.",
    "This is her story, told in her own words, one chapter at a time."
  ],
  demographics: [
    "Eleanor Ruth Hartwell was born on October 14, 1961, in Coos Bay, Coos County, Oregon. She is the second of four children born to Raymond Dale Hartwell and Margaret Ann Hartwell, née Sorenson. Her father's family had roots in coastal Oregon stretching back three generations; her mother's family emigrated from Norway to Minnesota in the early 1900s before eventually settling on the West Coast.",
    "Eleanor attended Marshfield High School in Coos Bay, graduating in 1979. She went on to earn a Bachelor of Arts in English Literature from the University of Oregon in Eugene in 1983, and later completed a teaching credential through Oregon State University in 1985. She taught fourth and fifth grade at Lincoln Elementary School in Portland for over two decades before retiring in 2008.",
    "She married Thomas Allen Hartwell in June of 1987 in a small ceremony on the Oregon coast. They have two children: a son, Daniel, born 1990, who lives in Seattle with his family; and a daughter, Claire, born 1993, who resides in Portland. Eleanor has three grandchildren. Thomas passed away in 2019 after a brief illness.",
    "Eleanor currently resides in the Sellwood neighborhood of Portland, Oregon, in the home she and Thomas shared for thirty years. She is of Norwegian and English descent, identifies as Protestant, and holds dual membership in the Coos Bay Historical Society and the Oregon Memoir Writers Circle."
  ]
};

export default function SbMbrAuthorPageFeature({ isSandbox, onClickBack }: SbMbrAuthorPageFeatureProps) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [storyContents, setStoryContents] = useState<Record<string, string[]>>(STORY_CONTENTS);

  const getActiveContent = (): string[] => {
    return storyContents[activeSection] || ["This chapter draft is empty."];
  };

  const handleSaveActiveContent = (newContent: string[]) => {
    setStoryContents((prev) => ({
      ...prev,
      [activeSection]: newContent
    }));
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Sidebar */}
        <div className="lg:col-span-3">
          <LeftColumn
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>

        {/* Center Column Content */}
        <div className="lg:col-span-6 bg-slate-50/50 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            isSandbox={isSandbox}
            activeSection={activeSection}
            activeContent={getActiveContent()}
            onClickBack={onClickBack}
            onSaveActiveContent={handleSaveActiveContent}
          />
        </div>

        {/* Right Column Sidebar */}
        <div className="lg:col-span-3">
          <RightColumn />
        </div>

      </div>
    </div>
  );
}
