/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle, 
  BookOpen, 
  HelpCircle,
  Filter,
  MessageSquare,
  Layers,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { topicSparkApi, topicApi, TopicSpark, Topic } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import PageSeo from '@/src/components/PageSeo';

// Standard fallback topics in case API is empty or loading
const FALLBACK_TOPICS: Topic[] = [
  { topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', topicName: 'Family', topicFullName: 'Family & Heritage Stories', topicSortOrder: 10 },
  { topicId: '0c56cf6a-64d7-4174-abb0-0a049a40dcd5', topicName: 'Residencies', topicFullName: 'Residences & Places Lived', topicSortOrder: 20 },
  { topicId: '95af15b6-ccd4-4487-8151-aef0ad82b6e8', topicName: 'Achievements', topicFullName: 'Achievements & Milestones', topicSortOrder: 30 },
  { topicId: '196bc8c6-2b8b-4d80-9cc6-1498d37b67a6', topicName: 'Education', topicFullName: 'Education & Training', topicSortOrder: 40 },
  { topicId: '272a39fd-9b43-4fee-9c26-dccf1d8edd1e', topicName: 'Employment', topicFullName: 'Employment & Career', topicSortOrder: 50 },
  { topicId: 'df0744af-1f72-4c4a-b141-05cfdbd2863d', topicName: 'Activities', topicFullName: 'Activities & Hobbies', topicSortOrder: 60 },
  { topicId: 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e', topicName: 'Other', topicFullName: 'Other & Custom Stories', topicSortOrder: 70 }
];

// Fallback spark questions for sandbox simulation
const FALLBACK_SPARKS: TopicSpark[] = [
  { sparkId: 'spk-1', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'What was your favorite childhood tradition with your family or grandparents?', sparkCreatedAt: new Date().toISOString() },
  { sparkId: 'spk-2', topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', sparkQuestion: 'How did your parents meet, and what stories did they pass down about it?', sparkCreatedAt: new Date().toISOString() },
  { sparkId: 'spk-3', topicId: '0c56cf6a-64d7-4174-abb0-0a049a40dcd5', sparkQuestion: 'What is the most vivid memory of your first childhood home or neighborhood?', sparkCreatedAt: new Date().toISOString() },
  { sparkId: 'spk-4', topicId: '0c56cf6a-64d7-4174-abb0-0a049a40dcd5', sparkQuestion: 'What was the biggest transition you experienced when moving to a new city?', sparkCreatedAt: new Date().toISOString() },
  { sparkId: 'spk-5', topicId: '95af15b6-ccd4-4487-8151-aef0ad82b6e8', sparkQuestion: 'What proud accomplishment took the most persistence and dedication?', sparkCreatedAt: new Date().toISOString() },
  { sparkId: 'spk-6', topicId: '196bc8c6-2b8b-4d80-9cc6-1498d37b67a6', sparkQuestion: 'Which teacher or mentor made the biggest impact on your life and why?', sparkCreatedAt: new Date().toISOString() },
  { sparkId: 'spk-7', topicId: '272a39fd-9b43-4fee-9c26-dccf1d8edd1e', sparkQuestion: 'What was your very first paid job and what valuable lesson did it teach you?', sparkCreatedAt: new Date().toISOString() },
  { sparkId: 'spk-8', topicId: 'df0744af-1f72-4c4a-b141-05cfdbd2863d', sparkQuestion: 'What hobby or passion brings you the most joy, focus, and creativity?', sparkCreatedAt: new Date().toISOString() }
];

export default function AdminTopicSparksFeature() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sparks, setSparks] = useState<TopicSpark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Dialog States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSpark, setEditingSpark] = useState<TopicSpark | null>(null);
  const [formTopicId, setFormTopicId] = useState<string>('');
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Deletion Modal
  const [deletingSpark, setDeletingSpark] = useState<TopicSpark | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Topics
      let loadedTopics: Topic[] = [];
      try {
        loadedTopics = await topicApi.getTopics();
      } catch (e) {
        console.warn('Could not fetch topics from API, using defaults:', e);
      }
      if (!loadedTopics || loadedTopics.length === 0) {
        loadedTopics = FALLBACK_TOPICS;
      }
      setTopics(loadedTopics);

      // 2. Fetch Sparks
      let loadedSparks: TopicSpark[] = [];
      try {
        loadedSparks = await topicSparkApi.getTopicSparks();
      } catch (e) {
        console.warn('Could not fetch topic sparks from API, using defaults:', e);
      }
      if (!loadedSparks || loadedSparks.length === 0) {
        loadedSparks = FALLBACK_SPARKS;
      }
      setSparks(loadedSparks);
    } catch (err: any) {
      showNotification('error', `Failed to load topic sparks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Map topicId to Topic Object
  const topicMap = useMemo(() => {
    const map = new Map<string, Topic>();
    topics.forEach((t) => map.set(t.topicId, t));
    return map;
  }, [topics]);

  // Sparks count per topic
  const sparkCountByTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    sparks.forEach((s) => {
      counts[s.topicId] = (counts[s.topicId] || 0) + 1;
    });
    return counts;
  }, [sparks]);

  // Filtered Sparks
  const filteredSparks = useMemo(() => {
    return sparks.filter((spark) => {
      // Topic filter
      if (selectedTopicId !== 'ALL' && spark.topicId !== selectedTopicId) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuestion = spark.sparkQuestion?.toLowerCase().includes(q);
        const topicName = topicMap.get(spark.topicId)?.topicName?.toLowerCase() || '';
        const topicFullName = topicMap.get(spark.topicId)?.topicFullName?.toLowerCase() || '';
        return matchesQuestion || topicName.includes(q) || topicFullName.includes(q);
      }
      return true;
    });
  }, [sparks, selectedTopicId, searchQuery, topicMap]);

  // Open Add Dialog
  const handleOpenAdd = (defaultTopic?: string) => {
    setEditingSpark(null);
    const initialTopic = defaultTopic && defaultTopic !== 'ALL' 
      ? defaultTopic 
      : (selectedTopicId !== 'ALL' ? selectedTopicId : (topics[0]?.topicId || ''));
    setFormTopicId(initialTopic);
    setFormQuestion('');
    setIsFormOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (spark: TopicSpark) => {
    setEditingSpark(spark);
    setFormTopicId(spark.topicId);
    setFormQuestion(spark.sparkQuestion);
    setIsFormOpen(true);
  };

  // Handle Form Save
  const handleSaveSpark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopicId) {
      showNotification('error', 'Please select a topic.');
      return;
    }
    const cleanQuestion = formQuestion.trim();
    if (!cleanQuestion) {
      showNotification('error', 'Please enter a spark question.');
      return;
    }
    if (cleanQuestion.length > 120) {
      showNotification('error', 'Spark question must be 120 characters or less.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSpark) {
        // Update existing spark
        const updated = await topicSparkApi.updateTopicSpark(editingSpark.sparkId, {
          topicId: formTopicId,
          sparkQuestion: cleanQuestion
        });
        setSparks((prev) => prev.map((s) => (s.sparkId === editingSpark.sparkId ? { ...s, ...updated, sparkQuestion: cleanQuestion, topicId: formTopicId } : s)));
        showNotification('success', 'Topic spark question updated successfully.');
      } else {
        // Create new spark
        const created = await topicSparkApi.createTopicSpark({
          topicId: formTopicId,
          sparkQuestion: cleanQuestion
        });
        setSparks((prev) => [created, ...prev]);
        showNotification('success', 'New topic spark question added successfully.');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      showNotification('error', `Failed to save spark question: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingSpark) return;
    setIsSubmitting(true);
    try {
      await topicSparkApi.deleteTopicSpark(deletingSpark.sparkId);
      setSparks((prev) => prev.filter((s) => s.sparkId !== deletingSpark.sparkId));
      showNotification('success', 'Topic spark question deleted successfully.');
      setDeletingSpark(null);
    } catch (err: any) {
      showNotification('error', `Failed to delete spark question: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 relative pb-12">
      <PageSeo 
        title="Topic Sparks Administration | StoryBook" 
        description="Maintain and organize story spark questions for each topic in StoryBook" 
      />

      {/* HEADER BAR */}
      <div className="bg-[#122347] text-white border border-slate-900 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-gradient-to-br from-amber-400/20 to-amber-600/10 text-amber-300 rounded-2xl border border-amber-400/20 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-black tracking-tight">Topic Sparks Administration</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Story Starters
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Curate and maintain thought-provoking spark questions organized by story topics. These prompts appear across member storycrafting workspaces to inspire authentic personal storytelling.
            </p>
          </div>
        </div>

        {/* Quick Stats & Controls */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sparks</div>
            <div className="text-lg font-black text-amber-400 font-mono">{sparks.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Topics</div>
            <div className="text-lg font-black text-blue-300 font-mono">{topics.length}</div>
          </div>
          <button
            onClick={loadData}
            title="Refresh Sparks"
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-2xl cursor-pointer transition-all active:scale-95 shadow-inner"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-medium border ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="flex-grow">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="cursor-pointer hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & TOPIC PILLS BAR */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-sm space-y-4">
        {/* Search & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search spark questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EFECE7] text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAdd()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/15 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Spark Question</span>
            </button>
          </div>
        </div>

        {/* Topic Selector Pills */}
        <div className="pt-2 border-t border-[#F2EFEB]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Topic:
            </span>

            {/* All Topics Pill */}
            <button
              onClick={() => setSelectedTopicId('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedTopicId === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-[#EFECE7] text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Topics</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedTopicId === 'ALL' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {sparks.length}
              </span>
            </button>

            {/* Topic Specific Pills */}
            {topics.map((t) => {
              const count = sparkCountByTopic[t.topicId] || 0;
              const isSelected = selectedTopicId === t.topicId;
              return (
                <button
                  key={t.topicId}
                  onClick={() => setSelectedTopicId(t.topicId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white border border-[#EFECE7] text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span>{t.topicName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SPARKS LISTING */}
      <div className="bg-white border border-[#EFECE7] rounded-3xl shadow-sm overflow-hidden flex flex-col p-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F2EFEB]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold font-serif text-slate-800">
              {selectedTopicId === 'ALL' 
                ? 'All Story Spark Questions' 
                : `${topicMap.get(selectedTopicId)?.topicFullName || topicMap.get(selectedTopicId)?.topicName || 'Topic'} Sparks`}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredSparks.length} {filteredSparks.length === 1 ? 'question' : 'questions'})
            </span>
          </div>

          {selectedTopicId !== 'ALL' && (
            <button
              onClick={() => handleOpenAdd(selectedTopicId)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to this topic</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Loading topic spark questions...</span>
          </div>
        ) : filteredSparks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No spark questions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {searchQuery 
                ? `No questions matched your search "${searchQuery}".` 
                : `There are currently no spark questions configured for this topic.`}
            </p>
            <button
              onClick={() => handleOpenAdd(selectedTopicId !== 'ALL' ? selectedTopicId : undefined)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Spark Question</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSparks.map((spark, idx) => {
              const topic = topicMap.get(spark.topicId);
              const charCount = spark.sparkQuestion?.length || 0;

              return (
                <motion.div
                  key={spark.sparkId || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.02 }}
                  className="bg-[#FAF9F7] hover:bg-white border border-[#EFECE7] hover:border-slate-300 rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Topic Badge & Meta */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        <BookOpen className="w-3 h-3" />
                        {topic?.topicName || 'Topic'}
                      </span>
                      <span className={`text-[10px] font-mono font-medium ${
                        charCount > 110 ? 'text-amber-600 font-bold' : 'text-slate-400'
                      }`}>
                        {charCount}/120 chars
                      </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-xs font-serif font-bold text-slate-800 leading-relaxed group-hover:text-slate-950">
                      "{spark.sparkQuestion}"
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-4 pt-3 border-t border-[#ECE8E1] flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">
                      ID: {spark.sparkId.substring(0, 8)}...
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(spark)}
                        title="Edit Question"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingSpark(spark)}
                        title="Delete Question"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- ADD / EDIT SPARK MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="absolute inset-0 cursor-default" onClick={() => setIsFormOpen(false)}></div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-lg w-full z-10 overflow-hidden flex flex-col relative"
            >
              {/* Modal Header */}
              <div className="bg-[#122347] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm">
                      {editingSpark ? 'Edit Topic Spark Question' : 'Add New Topic Spark Question'}
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Story starter prompt question (maximum 120 characters)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveSpark} className="p-6 space-y-4">
                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Story Topic <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTopicId}
                    onChange={(e) => setFormTopicId(e.target.value)}
                    required
                    className="w-full bg-[#FAF9F7] border border-[#EFECE7] text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                  >
                    <option value="" disabled>Select a Story Topic</option>
                    {topics.map((t) => (
                      <option key={t.topicId} value={t.topicId}>
                        {t.topicName} {t.topicFullName ? `— ${t.topicFullName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      Spark Question Text <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono ${
                      formQuestion.length > 120 ? 'text-rose-600 font-bold' : formQuestion.length > 105 ? 'text-amber-600 font-bold' : 'text-slate-400'
                    }`}>
                      {formQuestion.length}/120 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    maxLength={120}
                    placeholder="e.g. What was your favorite childhood tradition with your grandparents?"
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    className="w-full bg-[#FAF9F7] border border-[#EFECE7] text-slate-800 text-xs font-serif rounded-xl p-3.5 focus:outline-none focus:border-blue-500 shadow-xs resize-y leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    Tip: Ask open-ended, sensory-rich questions that prompt warm, narrative storytelling.
                  </p>
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-[#EFECE7] flex items-center justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-[#EFECE7] bg-white text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formQuestion.trim() || !formTopicId || formQuestion.length > 120}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-blue-500/15 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{editingSpark ? 'Update Spark' : 'Create Spark'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <AnimatePresence>
        {deletingSpark && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setDeletingSpark(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-sm w-full z-10 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-serif font-black text-slate-800">Delete Spark Question</h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete this spark question?
              </p>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs font-serif italic text-slate-700">
                "{deletingSpark.sparkQuestion}"
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 select-none">
                <button
                  onClick={() => setDeletingSpark(null)}
                  className="px-4 py-2 border border-[#EFECE7] bg-white text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 cursor-pointer transition-colors shadow-md shadow-rose-500/10 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminComponentTag name="TopicSparksAdmin" />
    </div>
  );
}

export { AdminTopicSparksFeature as TopicSparksAdmin, AdminTopicSparksFeature as AdminTopicSparksPage };
