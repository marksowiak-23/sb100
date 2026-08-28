/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Edit3, Save, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, FileText, AlertTriangle, ShieldAlert, Globe, Sparkles } from 'lucide-react';
import { taskApi, mbrStoryActivityApi, mbrStoryStatApi, MbrStory } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface StoryEditorPanelProps {
  topicTitle?: string;
  topicId?: string;
  componentName?: string;
  subordinateId?: string;
  subordinateName?: string;
  memberId?: string;
  readOnly?: boolean;
  isSandbox?: boolean;
  onClose: () => void;
}

const componentNameMap: Record<string, string> = {
  family: 'sbMbrStryFamly',
  residencies: 'sbMbrStryResidence',
  hobbies: 'sbMbrStryActivity',
  achievements: 'sbMbrStryAchievement',
  education: 'sbMbrStryEducation',
  employment: 'sbMbrStryEmployment',
};

const DEFAULT_STORIES: Record<string, Partial<MbrStory>[]> = {
  family: [
    {
      mbrStoryId: 'st_fam_1',
      mbrStoryTitle: 'Sunday Mornings at Harold’s Dock',
      mbrStoryContent: 'Every Sunday after morning services, the family would gather near the harbor. Harold would untie the wooden skiff and take us out past the breakwater to watch the fog roll off the headlands. Those silent mornings taught me more about patience and presence than any classroom ever could.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  residencies: [
    {
      mbrStoryId: 'st_res_1',
      mbrStoryTitle: 'The Old Cedar House by the Tide',
      mbrStoryContent: 'Our home in Coos Bay sat perched on stilts above the salt marsh. High tide meant the water tapped softly against the floorboards below our beds, whispering secrets of distant ocean currents.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  achievements: [
    {
      mbrStoryId: 'st_ach_1',
      mbrStoryTitle: 'Writing Whispers of the Coast',
      mbrStoryContent: 'Receiving the Pulitzer Prize in Biography was never something I anticipated when I sat down at my kitchen table in Sellwood. I simply wanted to record the voices of workers and elders whose stories were slipping away with the tide.',
      mbrStoryPublishStatusCd: 'Published'
    }
  ],
  education: [
    {
      mbrStoryId: 'st_edu_1',
      mbrStoryTitle: 'First Day at Lincoln Elementary',
      mbrStoryContent: 'Stepping into classroom 2B as a young teacher was nerve-wracking. Thirty pairs of bright eyes looked up at me expecting guidance. I decided that day to build a classroom rooted in curiosity and kindness.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  employment: [
    {
      mbrStoryId: 'st_emp_1',
      mbrStoryTitle: 'Thirty Years of Red Ink and Fresh Chalk',
      mbrStoryContent: 'Teaching literature wasn’t just a career; it was a daily invitation to help young minds discover empathy through stories. Watching a hesitant reader suddenly unlock a book remains the greatest reward of my working life.',
      mbrStoryPublishStatusCd: 'Published'
    }
  ],
  hobbies: [
    {
      mbrStoryId: 'st_act_1',
      mbrStoryTitle: 'Plein Air Painting in the Willamette Valley',
      mbrStoryContent: 'When I retired from teaching, I picked up watercolor brushes. Capturing the shifting light on Oregon hops fields became my weekend sanctuary and a new way of observing nature.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ]
};

const formatPublishedDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
  return dateStr;
};

export default function StoryEditorPanel({
  topicTitle = 'Section',
  topicId = 'general',
  componentName,
  subordinateId,
  subordinateName,
  memberId,
  readOnly = false,
  isSandbox = true,
  onClose
}: StoryEditorPanelProps) {
  const [stories, setStories] = useState<Partial<MbrStory>[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Draft');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);
  const [activeIntentId, setActiveIntentId] = useState<string | undefined>(undefined);
  const [storyStatsMap, setStoryStatsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleContentUpdate = (e: any) => {
      const detail = e.detail || {};
      if (detail.content) {
        setContent(detail.content);
        if (detail.threadId) setActiveThreadId(detail.threadId);
        if (detail.intentId) setActiveIntentId(detail.intentId);
        setSuccessMsg('Story content updated from StoryMate AI!');
      }
    };
    window.addEventListener('update-story-editor-content', handleContentUpdate);
    return () => window.removeEventListener('update-story-editor-content', handleContentUpdate);
  }, []);

  useEffect(() => {
    loadStories();
  }, [topicId, isSandbox, componentName, subordinateId]);

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId] || topicId);

      if (isSandbox) {
        const key = `sandbox_stories_${finalStoryTypeCd}_${subordinateId || 'all'}`;
        const saved = sessionStorage.getItem(key);
        let list: Partial<MbrStory>[] = [];
        if (saved) {
          list = JSON.parse(saved);
        } else {
          list = (DEFAULT_STORIES[topicId] || [
            {
              mbrStoryId: `st_${topicId}_1`,
              mbrStoryTitle: subordinateName ? `Story of ${subordinateName}` : `${topicTitle} Memories & Reflections`,
              mbrStoryContent: `Write your story notes and reflections for ${subordinateName || topicTitle} here...`,
              mbrStoryPublishStatusCd: 'Draft'
            }
          ]).map(s => ({
            ...s,
            mbrStoryTypeCd: finalStoryTypeCd,
            mbrStorySubordinateId: subordinateId || undefined,
            mbrStoryVersion: s.mbrStoryVersion || 1
          }));
          sessionStorage.setItem(key, JSON.stringify(list));
        }
        setStories(list);
        if (list.length > 0) {
          selectStory(list[0]);
        }
      } else {
        // DB load
        let currentMbrId = memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1'; // fallback
        if (currentMbrId === 'm1') {
          currentMbrId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0';
        } else if (!memberId) {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
              if (mbrProfile && mbrProfile.mbrId) {
                currentMbrId = mbrProfile.mbrId;
              }
            } catch (e) {
              console.warn("Could not retrieve member profile ID from DB, falling back to default Eleanor Hartwell UUID:", e);
            }
          }
        }

        const dbStories = await taskApi.getStories(currentMbrId);
        const filtered = dbStories.filter((s) => {
          const isFamilyType = (s.mbrStoryTypeCd === 'sbMbrStryFamly' || s.mbrStoryTypeCd === 'Family');
          const isResidencyType = (s.mbrStoryTypeCd === 'sbMbrStryResidence' || s.mbrStoryTypeCd === 'Residencies' || s.mbrStoryTypeCd === 'Residence');
          const isAchievementType = (s.mbrStoryTypeCd === 'sbMbrStryAchievement' || s.mbrStoryTypeCd === 'Achievements' || s.mbrStoryTypeCd === 'Achievement');
          const isEducationType = (s.mbrStoryTypeCd === 'sbMbrStryEducation' || s.mbrStoryTypeCd === 'Education');
          const isActivityType = (s.mbrStoryTypeCd === 'sbMbrStryActivity' || s.mbrStoryTypeCd === 'Activities' || s.mbrStoryTypeCd === 'Activities and Hobbies' || s.mbrStoryTypeCd === 'Hobbies' || s.mbrStoryTypeCd === 'Activity');
          
          let matchesType = false;
          if (topicId?.toLowerCase() === 'family' || finalStoryTypeCd === 'sbMbrStryFamly') {
            matchesType = isFamilyType;
          } else if (topicId?.toLowerCase() === 'residencies' || finalStoryTypeCd === 'sbMbrStryResidence') {
            matchesType = isResidencyType;
          } else if (topicId?.toLowerCase() === 'achievements' || finalStoryTypeCd === 'sbMbrStryAchievement') {
            matchesType = isAchievementType;
          } else if (topicId?.toLowerCase() === 'education' || finalStoryTypeCd === 'sbMbrStryEducation') {
            matchesType = isEducationType;
          } else if (topicId?.toLowerCase() === 'hobbies' || topicId?.toLowerCase() === 'activities' || finalStoryTypeCd === 'sbMbrStryActivity') {
            matchesType = isActivityType;
          } else {
            matchesType = s.mbrStoryTypeCd === finalStoryTypeCd || s.mbrStoryTypeCd?.toLowerCase() === topicId?.toLowerCase();
          }
          if (!matchesType) return false;

          if (subordinateId) {
            return s.mbrStorySubordinateId === subordinateId;
          } else if (topicId?.toLowerCase() === 'family') {
            return !s.mbrStorySubordinateId;
          }
          return true;
        });

        if (filtered.length > 0) {
          // Select max mbrStoryVersion if multiple stories exist
          const sorted = [...filtered].sort((a, b) => (b.mbrStoryVersion || 0) - (a.mbrStoryVersion || 0));
          setStories(sorted);

          // Load story view stats for this member
          try {
            const stats = await mbrStoryStatApi.getMemberStoryStatsByMbrId(currentMbrId);
            const map: Record<string, number> = {};
            if (Array.isArray(stats)) {
              stats.forEach((st) => {
                if (st.mbrStoryId) {
                  map[st.mbrStoryId] = st.mbrStoryStatViewedCnt || 0;
                }
              });
            }
            setStoryStatsMap(map);
          } catch (statErr) {
            console.warn("Could not retrieve story stats:", statErr);
          }

          const defaultStory = (readOnly ? sorted.find(s => (s.mbrStoryPublishStatusCd || '').toLowerCase() === 'published') : null) || sorted[0];
          selectStory(defaultStory);
        } else {
          setStories([]);
          setActiveStoryId(null);
          setStoryStatsMap({});
        }
      }
    } catch (err: any) {
      setError(`Failed to load stories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const recordedViewsRef = React.useRef<Set<string>>(new Set());

  const selectStory = (story: Partial<MbrStory>) => {
    setActiveStoryId(story.mbrStoryId || null);
    setTitle(story.mbrStoryTitle || '');
    setContent(story.mbrStoryContent || '');
    setStatus(story.mbrStoryPublishStatusCd || 'Draft');
    setActiveThreadId(story.mbrStoryThreadID);
    setActiveIntentId(story.chIntentId);
    setIsEditing(false);
    setError(null);
    setSuccessMsg(null);

    // Record View Activity if viewing another member's story
    if (story.mbrStoryId && !story.mbrStoryId.startsWith('temp_')) {
      (async () => {
        try {
          let viewerMbrId: string | null = null;
          const storedMbr = sessionStorage.getItem('sb_current_mbr');
          if (storedMbr) {
            try {
              const parsed = JSON.parse(storedMbr);
              if (parsed.mbrId) viewerMbrId = parsed.mbrId;
            } catch {}
          }
          if (!viewerMbrId) {
            const userStr = sessionStorage.getItem('user');
            if (userStr) {
              try {
                const u = JSON.parse(userStr);
                const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
                if (mbrProfile && mbrProfile.mbrId) viewerMbrId = mbrProfile.mbrId;
              } catch {}
            }
          }

          const storyOwnerMbrId = story.mbrMbrId || (memberId === 'm1' ? 'e20986fa-0fb9-4081-ae5d-35bc8f504df0' : memberId);
          if (viewerMbrId && storyOwnerMbrId && viewerMbrId !== storyOwnerMbrId) {
            const viewKey = `${viewerMbrId}_${story.mbrStoryId}`;
            if (!recordedViewsRef.current.has(viewKey)) {
              recordedViewsRef.current.add(viewKey);
              if (!isSandbox) {
                await mbrStoryActivityApi.createStoryActivity({
                  mbrId: storyOwnerMbrId,
                  mbrStoryId: story.mbrStoryId,
                  actMbrId: viewerMbrId,
                  actTypeCd: 'VIEW',
                  actDate: new Date().toISOString()
                });
                setStoryStatsMap((prev) => ({
                  ...prev,
                  [story.mbrStoryId!]: (prev[story.mbrStoryId!] || 0) + 1
                }));
              }
            }
          }
        } catch (viewErr) {
          console.warn("Could not record story view activity:", viewErr);
        }
      })();
    }
  };

  const handleCreateNew = () => {
    const newId = `temp_${Date.now()}`;
    const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId] || topicId);
    const newStory: Partial<MbrStory> = {
      mbrStoryId: newId,
      mbrStoryTitle: subordinateName ? `Story of ${subordinateName}` : `New ${topicTitle} Story`,
      mbrStoryContent: '',
      mbrStoryPublishStatusCd: 'Draft',
      mbrStoryTypeCd: finalStoryTypeCd,
      mbrStorySubordinateId: subordinateId || undefined
    };
    setStories((prev) => [...prev, newStory]);
    setActiveStoryId(newId);
    setTitle(newStory.mbrStoryTitle!);
    setContent('');
    setStatus('Draft');
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Story title is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Resolve logged-in member ID
      let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1'; // fallback
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) {
            currentMbrId = mbrProfile.mbrId;
          }
        } catch (e) {
          console.warn("Could not retrieve member profile ID from DB, falling back to default Eleanor Hartwell UUID:", e);
        }
      }

      const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId] || topicId);
      const sandboxKey = `sandbox_stories_${finalStoryTypeCd}_${subordinateId || 'all'}`;

      // Find original version from active story
      const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);
      const version = activeStory ? (activeStory.mbrStoryVersion || 1) : 1;

      const todayDateStr = new Date().toISOString().split('T')[0];

      // Check if user is publishing a draft story that has an original published story reference
      const isPublishingDraftWithOriginal = (status || '').toLowerCase() === 'published' && activeStory && activeStory.mbrStoryOriginalId;

      if (isPublishingDraftWithOriginal) {
        const originalId = activeStory.mbrStoryOriginalId!;
        const updatedOriginalStory: Partial<MbrStory> = {
          mbrStoryTitle: title.trim(),
          mbrStoryContent: content,
          mbrStoryPublishStatusCd: 'Published',
          mbrStoryPublishedDate: activeStory.mbrStoryPublishedDate || todayDateStr,
          mbrStoryTypeCd: finalStoryTypeCd,
          mbrStorySubordinateId: subordinateId || undefined,
          mbrMbrId: currentMbrId,
          mbrStoryVersion: version,
          mbrStoryThreadID: activeThreadId,
          chIntentId: activeIntentId,
        };

        if (isSandbox) {
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? { ...updatedOriginalStory, mbrStoryId: originalId } : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push({ ...updatedOriginalStory, mbrStoryId: originalId });
          }
          setStories(nextList);
          sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
          const updatedTarget = nextList.find((s) => s.mbrStoryId === originalId) || { ...updatedOriginalStory, mbrStoryId: originalId };
          selectStory(updatedTarget);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
        } else {
          const savedResult = await taskApi.updateStory(originalId, updatedOriginalStory);
          if (activeStoryId && !activeStoryId.startsWith('temp_')) {
            try {
              await taskApi.deleteStory(activeStoryId);
            } catch (delErr) {
              console.warn("Could not delete draft story after publishing:", delErr);
            }
          }
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? savedResult : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push(savedResult);
          }
          setStories(nextList);
          selectStory(savedResult);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
          window.dispatchEvent(new CustomEvent('stats-updated'));
        }
        setIsEditing(false);
        return;
      }

      const updatedStory: Partial<MbrStory> = {
        mbrStoryId: (activeStoryId && !activeStoryId.startsWith('temp_')) ? activeStoryId : undefined,
        mbrStoryTitle: title.trim(),
        mbrStoryContent: content,
        mbrStoryPublishStatusCd: status,
        mbrStoryPublishedDate: (status || '').toLowerCase() === 'published' ? (activeStory?.mbrStoryPublishedDate || todayDateStr) : activeStory?.mbrStoryPublishedDate,
        mbrStoryTypeCd: finalStoryTypeCd,
        mbrStorySubordinateId: subordinateId || undefined,
        mbrMbrId: currentMbrId,
        mbrStoryVersion: version,
        mbrStoryThreadID: activeThreadId,
        chIntentId: activeIntentId,
        mbrStoryOriginalId: activeStory?.mbrStoryOriginalId,
      };

      if (isSandbox) {
        // In Sandbox mode, keep a temp/mock ID
        const sandboxStory = {
          ...updatedStory,
          mbrStoryId: activeStoryId || `st_${Date.now()}`
        };
        const nextList = stories.map((s) =>
          s.mbrStoryId === activeStoryId ? sandboxStory : s
        );
        if (!stories.some((s) => s.mbrStoryId === activeStoryId)) {
          nextList.push(sandboxStory);
        }
        setStories(nextList);
        sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
        setSuccessMsg('Story saved successfully to Sandbox!');
      } else {
        let savedResult: MbrStory;
        if (activeStoryId && !activeStoryId.startsWith('temp_')) {
          savedResult = await taskApi.updateStory(activeStoryId, updatedStory);
        } else {
          savedResult = await taskApi.createStory(updatedStory);
        }
        
        // Update local state stories list
        const nextList = stories.map((s) =>
          s.mbrStoryId === activeStoryId ? savedResult : s
        );
        if (!stories.some((s) => s.mbrStoryId === activeStoryId)) {
          nextList.push(savedResult);
        }
        setStories(nextList);
        setActiveStoryId(savedResult.mbrStoryId);
        setSuccessMsg('Story saved successfully to database!');
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(`Failed to save story: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!activeStoryId) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!activeStoryId) return;
    setDeleting(true);

    try {
      const finalStoryTypeCd = componentName || componentNameMap[topicId] || topicId;

      if (isSandbox) {
        const nextList = stories.filter((s) => s.mbrStoryId !== activeStoryId);
        setStories(nextList);
        sessionStorage.setItem(`sandbox_stories_${finalStoryTypeCd}`, JSON.stringify(nextList));
        if (nextList.length > 0) {
          selectStory(nextList[0]);
        } else {
          setTitle('');
          setContent('');
          setActiveStoryId(null);
        }
      } else {
        if (!activeStoryId.startsWith('temp_')) {
          await taskApi.deleteStory(activeStoryId);
        }
        const nextList = stories.filter((s) => s.mbrStoryId !== activeStoryId);
        setStories(nextList);
        if (nextList.length > 0) {
          selectStory(nextList[0]);
        } else {
          setTitle('');
          setContent('');
          setActiveStoryId(null);
        }
      }
      setSuccessMsg('Story deleted successfully.');
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(`Failed to delete story: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const confirmPublish = () => {
    if (!activeStoryId) return;
    setShowPublishModal(true);
  };

  const executePublish = async () => {
    if (!activeStoryId) return;
    setPublishing(true);
    setError(null);

    try {
      let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) {
            currentMbrId = mbrProfile.mbrId;
          }
        } catch (e) {
          console.warn("Could not retrieve member profile ID from DB:", e);
        }
      }

      const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId] || topicId);
      const sandboxKey = `sandbox_stories_${finalStoryTypeCd}_${subordinateId || 'all'}`;
      const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);

      const todayDateStr = new Date().toISOString().split('T')[0];

      // Check if publishing a draft story that references an original published story
      if (activeStory && activeStory.mbrStoryOriginalId) {
        const originalId = activeStory.mbrStoryOriginalId;
        const updatedOriginalStory: Partial<MbrStory> = {
          mbrStoryTitle: title.trim() || 'Untitled Story',
          mbrStoryContent: content,
          mbrStoryPublishStatusCd: 'Published',
          mbrStoryPublishedDate: todayDateStr,
          mbrStoryTypeCd: finalStoryTypeCd,
          mbrStorySubordinateId: subordinateId || undefined,
          mbrMbrId: currentMbrId,
          mbrStoryVersion: activeStory.mbrStoryVersion || 1,
          mbrStoryThreadID: activeThreadId,
          chIntentId: activeIntentId,
        };

        if (isSandbox) {
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? { ...updatedOriginalStory, mbrStoryId: originalId } : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push({ ...updatedOriginalStory, mbrStoryId: originalId });
          }
          setStories(nextList);
          sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
          const updatedTarget = nextList.find((s) => s.mbrStoryId === originalId) || { ...updatedOriginalStory, mbrStoryId: originalId };
          selectStory(updatedTarget);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
        } else {
          const savedResult = await taskApi.updateStory(originalId, updatedOriginalStory);
          if (activeStoryId && !activeStoryId.startsWith('temp_')) {
            try {
              await taskApi.deleteStory(activeStoryId);
            } catch (delErr) {
              console.warn("Could not delete draft story after publishing:", delErr);
            }
          }
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? savedResult : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push(savedResult);
          }
          setStories(nextList);
          selectStory(savedResult);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
          window.dispatchEvent(new CustomEvent('stats-updated'));
        }
      } else {
        const updatedStory: Partial<MbrStory> = {
          mbrStoryId: (!activeStoryId.startsWith('temp_')) ? activeStoryId : undefined,
          mbrStoryTitle: title.trim() || 'Untitled Story',
          mbrStoryContent: content,
          mbrStoryPublishStatusCd: 'Published',
          mbrStoryPublishedDate: todayDateStr,
          mbrStoryTypeCd: finalStoryTypeCd,
          mbrStorySubordinateId: subordinateId || undefined,
          mbrMbrId: currentMbrId,
          mbrStoryVersion: activeStory ? (activeStory.mbrStoryVersion || 1) : 1,
          mbrStoryThreadID: activeThreadId,
          chIntentId: activeIntentId,
        };

        if (isSandbox) {
          const sandboxStory = {
            ...updatedStory,
            mbrStoryId: activeStoryId
          };
          const nextList = stories.map((s) =>
            s.mbrStoryId === activeStoryId ? sandboxStory : s
          );
          setStories(nextList);
          sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
          setStatus('Published');
          setSuccessMsg('Story published successfully in Sandbox!');
        } else {
          let savedResult: MbrStory;
          if (!activeStoryId.startsWith('temp_')) {
            savedResult = await taskApi.updateStory(activeStoryId, updatedStory);
          } else {
            savedResult = await taskApi.createStory(updatedStory);
          }
          const nextList = stories.map((s) =>
            s.mbrStoryId === activeStoryId ? savedResult : s
          );
          setStories(nextList);
          setActiveStoryId(savedResult.mbrStoryId);
          setStatus('Published');
          setSuccessMsg('Story published successfully to database!');
          window.dispatchEvent(new CustomEvent('stats-updated'));
        }
      }
      setShowPublishModal(false);
    } catch (err: any) {
      setError(`Failed to publish story: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleEditClick = async () => {
    // Check if the current active story is Published
    const isPublished = (status || '').toLowerCase() === 'published';

    if (isPublished) {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      try {
        let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1'; // fallback
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile && mbrProfile.mbrId) {
              currentMbrId = mbrProfile.mbrId;
            }
          } catch (e) {
            console.warn("Could not retrieve member profile ID from DB:", e);
          }
        }

        const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId] || topicId);
        const sandboxKey = `sandbox_stories_${finalStoryTypeCd}_${subordinateId || 'all'}`;
        const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);
        const currentVersion = activeStory ? (activeStory.mbrStoryVersion || 1) : 1;
        const originalId = activeStory?.mbrStoryOriginalId || (activeStoryId && !activeStoryId.startsWith('temp_') ? activeStoryId : undefined);

        const newDraftStory: Partial<MbrStory> = {
          mbrStoryTitle: title.trim() || `${topicTitle} Story`,
          mbrStoryContent: content,
          mbrStoryPublishStatusCd: 'Draft',
          mbrStoryTypeCd: finalStoryTypeCd,
          mbrStorySubordinateId: subordinateId || undefined,
          mbrMbrId: currentMbrId,
          mbrStoryVersion: currentVersion + 1,
          mbrStoryThreadID: activeThreadId,
          chIntentId: activeIntentId,
          mbrStoryOriginalId: originalId,
        };

        if (isSandbox) {
          const newId = `st_draft_${Date.now()}`;
          const sandboxStory = {
            ...newDraftStory,
            mbrStoryId: newId
          };
          const nextList = [sandboxStory, ...stories];
          setStories(nextList);
          sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
          setActiveStoryId(newId);
          setStatus('Draft');
          setSuccessMsg('Created new draft story copied from published story.');
        } else {
          const savedResult = await taskApi.createStory(newDraftStory);
          const nextList = [savedResult, ...stories];
          setStories(nextList);
          setActiveStoryId(savedResult.mbrStoryId);
          setStatus('Draft');
          setSuccessMsg('Created new draft story copied from published story.');
        }

        setIsEditing(true);
      } catch (err: any) {
        setError(`Failed to create new draft story: ${err.message}`);
      } finally {
        setSaving(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handlePrivacyClick = () => {
    setSuccessMsg('Privacy settings configured for this story.');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div id="story-editor-panel" className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.015)] flex flex-col gap-5 relative">
      {/* --- HEADER BAR --- */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/60 border border-blue-100 text-blue-700 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-slate-800 leading-tight">
              {readOnly ? `Member Stories — ${topicTitle}` : `Story Editor — ${topicTitle}`}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              {readOnly ? 'View narrative stories and personal memoirs for this section' : 'Craft narrative stories and personal memoirs for this section'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && !isEditing && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Story</span>
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close Story Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- NOTIFICATIONS --- */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs font-medium flex-grow">{error}</div>
            <button onClick={() => setError(null)} className="cursor-pointer">
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl"
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs font-medium flex-grow">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="cursor-pointer">
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STORIES TABLE --- */}
      {!isEditing && stories.length > 0 && (
        <div className="bg-white border border-[#EFECE7] rounded-2xl overflow-hidden shadow-xs">
          <div className="max-h-[225px] overflow-y-auto scrollbar-thin">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-[#EFECE7] z-10">
                <tr>
                  <th className="py-2.5 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="py-2.5 px-3 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-20 shrink-0">
                    Views
                  </th>
                  <th className="py-2.5 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-32 shrink-0">
                    Published Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7]">
                {stories.map((s) => {
                  const isActive = activeStoryId === s.mbrStoryId;
                  const formattedDate = formatPublishedDate(s.mbrStoryPublishedDate);
                  const viewCount = (s.mbrStoryId && storyStatsMap[s.mbrStoryId] !== undefined) ? storyStatsMap[s.mbrStoryId] : 0;
                  return (
                    <tr
                      key={s.mbrStoryId}
                      onClick={() => selectStory(s)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isActive
                          ? 'bg-slate-100/90 font-bold text-slate-900'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-serif">
                        <div className="flex items-start gap-2">
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0 mt-1.5" />
                          )}
                          <span className="whitespace-normal break-words leading-snug">
                            {s.mbrStoryTitle || 'Untitled Story'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-600 align-top pt-3">
                        {viewCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap align-top pt-3">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* --- MAIN EDITOR / VIEW CONTENT --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
          <span className="text-xs font-medium">Loading stories...</span>
        </div>
      ) : stories.length === 0 ? (
        /* NO STORIES FOUND STATE */
        <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-slate-350" />
          <p className="text-xs font-serif text-slate-500 italic">No stories found for this section.</p>
          {!readOnly && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 border border-blue-600 font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Story</span>
            </button>
          )}
        </div>
      ) : isEditing ? (
        /* EDIT MODE */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Story Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A Summer to Remember..."
              className="w-full bg-white border border-[#EFECE7] rounded-xl text-sm font-serif font-bold text-slate-800 px-3.5 py-2.5 outline-none focus:border-slate-800 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Story Content & Narrative
              </label>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {wordCount} words
              </span>
            </div>
            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story details here. Share memories, feelings, and reflection..."
              className="w-full bg-white border border-[#EFECE7] rounded-2xl text-xs font-serif text-slate-700 p-4 leading-relaxed outline-none focus:border-slate-800 transition-colors resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EFECE7]">
            <button
              type="button"
              onClick={() => {
                const compName = (subordinateId || componentName === 'sbMbrStryFamilyMember') ? 'sbMbrStryFamilyMember' : (componentName || componentNameMap[topicId] || topicId);
                window.dispatchEvent(new CustomEvent('open-story-mate', {
                  detail: {
                    componentName: compName,
                    topicId,
                    topicTitle,
                    activeStoryId,
                    mbrStoryThreadID: activeThreadId,
                    chIntentId: activeIntentId,
                    storyTitle: title,
                    storyContent: content,
                  }
                }));
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="StoryMate AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>StoryMate AI</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="px-4 py-2 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all duration-150 cursor-pointer disabled:opacity-50 border border-blue-600"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Story</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#EFECE7] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="font-serif text-lg font-bold text-slate-850 leading-snug">
                  {title || 'Untitled Story'}
                </h4>
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold font-mono uppercase ${
                  (status || '').toLowerCase() === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {status || 'Draft'}
                </span>
              </div>
              {!readOnly && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={confirmDelete}
                    title="Delete Story"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-150 rounded-xl cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={confirmPublish}
                    disabled={status === 'Published'}
                    title={status === 'Published' ? 'Story is already Published' : 'Publish Story'}
                    className={`p-2 border rounded-xl transition-colors ${
                      status === 'Published'
                        ? 'text-emerald-600 bg-emerald-50/60 border-emerald-200 opacity-60 cursor-not-allowed'
                        : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-slate-200 hover:border-emerald-150 cursor-pointer'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePrivacyClick}
                    title="Privacy Settings"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEditClick}
                    disabled={saving}
                    title={status.toLowerCase() === 'published' ? 'Edit Published Story (Creates a new Draft copy)' : 'Edit Story'}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-150 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {content ? (
              <div className="font-serif text-xs text-slate-700 leading-relaxed space-y-2.5 whitespace-pre-wrap pt-1 border-t border-slate-100">
                {content}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 font-serif italic text-xs">
                No content written for this story yet. Click the edit icon to start writing.
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 font-bold">
              <span>Topic: {topicTitle}</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </div>
      )}
      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowDeleteModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-sm w-full z-10 p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-850">
                  Delete Story?
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-slate-700">"{title || 'this story'}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 transition-all cursor-pointer border border-rose-600 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Story</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- CUSTOM PUBLISH CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowPublishModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-sm w-full z-10 p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-850">
                  Publish Story?
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to publish <span className="font-semibold text-slate-700">"{title || 'this story'}"</span>? This will update its status to Published in the database.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowPublishModal(false)}
                  disabled={publishing}
                  className="flex-1 py-2.5 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executePublish}
                  disabled={publishing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all cursor-pointer border border-emerald-600 disabled:opacity-50"
                >
                  {publishing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  <span>Publish Story</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AdminComponentTag name="StoryEditorPanel" />
    </div>
  );
}
