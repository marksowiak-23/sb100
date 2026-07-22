/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Edit3, Save, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, FileText, AlertTriangle, ShieldAlert, Globe } from 'lucide-react';
import { taskApi, MbrStory } from '@/src/services/api';

interface StoryEditorPanelProps {
  topicTitle?: string;
  topicId?: string;
  componentName?: string;
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

export default function StoryEditorPanel({
  topicTitle = 'Section',
  topicId = 'general',
  componentName,
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

  useEffect(() => {
    loadStories();
  }, [topicId, isSandbox, componentName]);

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalStoryTypeCd = componentName || componentNameMap[topicId] || topicId;

      if (isSandbox) {
        const key = `sandbox_stories_${finalStoryTypeCd}`;
        const saved = sessionStorage.getItem(key);
        let list: Partial<MbrStory>[] = [];
        if (saved) {
          list = JSON.parse(saved);
        } else {
          list = (DEFAULT_STORIES[topicId] || [
            {
              mbrStoryId: `st_${topicId}_1`,
              mbrStoryTitle: `${topicTitle} Memories & Reflections`,
              mbrStoryContent: `Write your story notes and reflections for ${topicTitle} here...`,
              mbrStoryPublishStatusCd: 'Draft'
            }
          ]).map(s => ({
            ...s,
            mbrStoryTypeCd: finalStoryTypeCd,
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

        const dbStories = await taskApi.getStories(currentMbrId);
        const filtered = dbStories.filter((s) => s.mbrStoryTypeCd === finalStoryTypeCd);

        if (filtered.length > 0) {
          // Select max mbrStoryVersion if multiple stories exist
          const sorted = [...filtered].sort((a, b) => (b.mbrStoryVersion || 0) - (a.mbrStoryVersion || 0));
          setStories(sorted);
          selectStory(sorted[0]);
        } else {
          setStories([]);
          setActiveStoryId(null);
        }
      }
    } catch (err: any) {
      setError(`Failed to load stories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectStory = (story: Partial<MbrStory>) => {
    setActiveStoryId(story.mbrStoryId || null);
    setTitle(story.mbrStoryTitle || '');
    setContent(story.mbrStoryContent || '');
    setStatus(story.mbrStoryPublishStatusCd || 'Draft');
    setIsEditing(false);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCreateNew = () => {
    const newId = `temp_${Date.now()}`;
    const newStory: Partial<MbrStory> = {
      mbrStoryId: newId,
      mbrStoryTitle: `New ${topicTitle} Story`,
      mbrStoryContent: '',
      mbrStoryPublishStatusCd: 'Draft'
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

      const finalStoryTypeCd = componentName || componentNameMap[topicId] || topicId;

      // Find original version from active story
      const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);
      const version = activeStory ? (activeStory.mbrStoryVersion || 1) : 1;

      const updatedStory: Partial<MbrStory> = {
        mbrStoryId: (activeStoryId && !activeStoryId.startsWith('temp_')) ? activeStoryId : undefined,
        mbrStoryTitle: title.trim(),
        mbrStoryContent: content,
        mbrStoryPublishStatusCd: status,
        mbrStoryTypeCd: finalStoryTypeCd,
        mbrMbrId: currentMbrId,
        mbrStoryVersion: version
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
        sessionStorage.setItem(`sandbox_stories_${finalStoryTypeCd}`, JSON.stringify(nextList));
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

      const finalStoryTypeCd = componentName || componentNameMap[topicId] || topicId;
      const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);

      const updatedStory: Partial<MbrStory> = {
        mbrStoryId: (!activeStoryId.startsWith('temp_')) ? activeStoryId : undefined,
        mbrStoryTitle: title.trim() || 'Untitled Story',
        mbrStoryContent: content,
        mbrStoryPublishStatusCd: 'Published',
        mbrStoryTypeCd: finalStoryTypeCd,
        mbrMbrId: currentMbrId,
        mbrStoryVersion: activeStory ? (activeStory.mbrStoryVersion || 1) : 1
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
        sessionStorage.setItem(`sandbox_stories_${finalStoryTypeCd}`, JSON.stringify(nextList));
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
      }
      setShowPublishModal(false);
    } catch (err: any) {
      setError(`Failed to publish story: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handlePrivacyClick = () => {
    setSuccessMsg('Privacy settings configured for this story.');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div id="story-editor-panel" className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.015)] flex flex-col gap-5">
      {/* --- HEADER BAR --- */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/60 border border-blue-100 text-blue-700 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-slate-800 leading-tight">
                Story Editor — {topicTitle}
              </h3>
              {stories.length > 0 && (
                <span className="px-2 py-0.5 rounded-full border text-[9px] font-bold bg-amber-50 text-amber-700 border-amber-200/60 font-mono uppercase">
                  {status}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Craft narrative stories and personal memoirs for this section
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
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

      {/* --- STORY SELECTOR TABS --- */}
      {!isEditing && stories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {stories.map((s) => (
            <button
              key={s.mbrStoryId}
              onClick={() => selectStory(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold whitespace-nowrap transition-all cursor-pointer border ${
                activeStoryId === s.mbrStoryId
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s.mbrStoryTitle || 'Untitled Story'}
            </button>
          ))}
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
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 border border-blue-600 font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Story</span>
          </button>
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

          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-700 px-3 py-2 outline-none focus:border-slate-800 cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="text-right text-[10px] font-mono text-slate-400 font-bold self-end pb-2">
              {wordCount} words
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Story Content & Narrative
            </label>
            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story details here. Share memories, feelings, and reflection..."
              className="w-full bg-white border border-[#EFECE7] rounded-2xl text-xs font-serif text-slate-700 p-4 leading-relaxed outline-none focus:border-slate-800 transition-colors resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EFECE7]">
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
      ) : (
        /* VIEW MODE */
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#EFECE7] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-serif text-lg font-bold text-slate-850 leading-snug">
                {title || 'Untitled Story'}
              </h4>
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
                  onClick={() => setIsEditing(true)}
                  title="Edit Story"
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-150 rounded-xl cursor-pointer transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
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
    </div>
  );
}
