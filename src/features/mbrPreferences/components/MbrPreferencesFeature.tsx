/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Save, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Feather, 
  Sliders, 
  Moon, 
  Sun, 
  Laptop, 
  Bell, 
  FileText 
} from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface MbrPreferencesFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

interface WriterPersona {
  chWriterId: string;
  chWriterName: string;
  chWriterDesc: string;
  chWriterPrompt: string;
  chWriterActInd: boolean;
}

const FALLBACK_PERSONAS: WriterPersona[] = [
  {
    chWriterId: 'w1',
    chWriterName: 'Everyday Eddie',
    chWriterDesc: 'Common & Informal',
    chWriterPrompt: 'Use the “Everyday Eddie” writing mode. Write in a casual, conversational style with simple language and a friendly tone. Avoid jargon. Keep explanations easy, relatable, and down to earth, like a helpful friend talking over coffee.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w2',
    chWriterName: 'Clarity Consultant',
    chWriterDesc: 'Professional',
    chWriterPrompt: 'Use a “Clarity Consultant” writing mode. Write in a professional, structured, and polished style. Maintain a confident, neutral tone. Prioritize clarity, accuracy, and efficiency. Avoid slang and emotional language. Format content cleanly with logical transitions.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w3',
    chWriterName: 'Casual Chuckles',
    chWriterDesc: 'Common + Humor',
    chWriterPrompt: 'Use a “Casual Chuckles” writing mode. Write in a conversational style with light humor, friendly sarcasm, and playful metaphors. Keep the message clear but add personality. Make the reader smile without distracting from the main point.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w4',
    chWriterName: 'The Polished Guide',
    chWriterDesc: 'Professional + Warm',
    chWriterPrompt: 'Use a “Polished Guide” writing mode. Write in a professional yet approachable style. Maintain a warm, encouraging tone. Blend clarity with empathy. Offer guidance that feels supportive, respectful, and easy to follow.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w5',
    chWriterName: 'The Story Crafter',
    chWriterDesc: 'Creative & Expressive',
    chWriterPrompt: 'Use a “Story Crafter” writing mode. Write in a narrative, descriptive, and imaginative style. Use sensory detail, metaphor, and emotional depth. Make the content feel alive, atmospheric, and engaging.',
    chWriterActInd: true
  }
];

export default function MbrPreferencesFeature({ isSandbox, onClickBack, onDirtyChange }: MbrPreferencesFeatureProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [mbrPrefId, setMbrPrefId] = useState<string | null>(null);
  const [personas, setPersonas] = useState<WriterPersona[]>([]);
  
  // Selected preference options state
  const [selectedWriterId, setSelectedWriterId] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('System');
  const [notificationsInd, setNotificationsInd] = useState<boolean>(true);
  const [autoSaveInd, setAutoSaveInd] = useState<boolean>(true);

  // Initial reference state for dirty comparison
  const [initialPrefs, setInitialPrefs] = useState({
    selectedWriterId: '',
    selectedTheme: 'System',
    notificationsInd: true,
    autoSaveInd: true
  });

  // Calculate form dirty state
  const isDirty = useMemo(() => {
    return (
      selectedWriterId !== initialPrefs.selectedWriterId ||
      selectedTheme !== initialPrefs.selectedTheme ||
      notificationsInd !== initialPrefs.notificationsInd ||
      autoSaveInd !== initialPrefs.autoSaveInd
    );
  }, [selectedWriterId, selectedTheme, notificationsInd, autoSaveInd, initialPrefs]);

  // Sync dirty state with parent handler
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Handle unload browser protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Load preferences and writer personas on mount
  useEffect(() => {
    loadPreferences();
  }, [isSandbox]);

  const loadPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Writer Personas
      let writerList: WriterPersona[] = [];
      try {
        if (!isSandbox) {
          writerList = await taskApi.getChWriters();
        }
      } catch (e) {
        console.warn("Could not fetch DB chWriters, using fallback personas:", e);
      }
      if (!writerList || writerList.length === 0) {
        writerList = FALLBACK_PERSONAS;
      }
      setPersonas(writerList);

      // 2. Fetch logged-in user profile ID
      let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr && !isSandbox) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) {
            currentMbrId = mbrProfile.mbrId;
          }
        } catch (e) {
          console.warn("Could not retrieve member ID, falling back to default:", e);
        }
      }
      setMbrId(currentMbrId);

      // 3. Fetch Member Preferences Record
      let prefRecord: any = null;
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_mbr_preferences');
        if (saved) {
          prefRecord = JSON.parse(saved);
        }
      } else {
        try {
          prefRecord = await taskApi.getMemberPreferences(currentMbrId);
        } catch (e) {
          console.log("No existing preferences record found, initializing defaults.");
        }
      }

      const defaultWriter = prefRecord?.chWriterId || writerList[0]?.chWriterId || '';
      const defaultTheme = prefRecord?.mbrPrefTheme || 'System';
      const defaultNotif = prefRecord?.mbrPrefNotificationsInd ?? true;
      const defaultAutoSave = prefRecord?.mbrPrefAutoSaveInd ?? true;

      setMbrPrefId(prefRecord?.mbrPrefId || null);
      setSelectedWriterId(defaultWriter);
      setSelectedTheme(defaultTheme);
      setNotificationsInd(defaultNotif);
      setAutoSaveInd(defaultAutoSave);

      setInitialPrefs({
        selectedWriterId: defaultWriter,
        selectedTheme: defaultTheme,
        notificationsInd: defaultNotif,
        autoSaveInd: defaultAutoSave
      });

    } catch (err: any) {
      setError(`Failed to load member preferences: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE OPERATION ---
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        mbrId: mbrId,
        chWriterId: selectedWriterId || null,
        mbrPrefTheme: selectedTheme,
        mbrPrefNotificationsInd: notificationsInd,
        mbrPrefAutoSaveInd: autoSaveInd,
        mbrPrefJson: null
      };

      if (isSandbox) {
        const updatedPref = { ...payload, mbrPrefId: mbrPrefId || 'sandbox-pref-id' };
        sessionStorage.setItem('sandbox_mbr_preferences', JSON.stringify(updatedPref));
        setMbrPrefId(updatedPref.mbrPrefId);
      } else {
        const res = await taskApi.saveMemberPreferences(mbrPrefId, payload);
        if (res.mbrPrefId) {
          setMbrPrefId(res.mbrPrefId);
        }
      }

      const newInit = {
        selectedWriterId,
        selectedTheme,
        notificationsInd,
        autoSaveInd
      };
      setInitialPrefs(newInit);
      setSuccess("Member preferences saved successfully!");

      if (onDirtyChange) {
        onDirtyChange(false);
      }
      
      // Auto close and return to previous page without prompt
      setTimeout(() => {
        onClickBack();
      }, 100);

    } catch (err: any) {
      console.error("Error saving member preferences:", err);
      setError(`Failed to save preferences: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- CANCEL ACTION ---
  const handleCancel = () => {
    setSelectedWriterId(initialPrefs.selectedWriterId);
    setSelectedTheme(initialPrefs.selectedTheme);
    setNotificationsInd(initialPrefs.notificationsInd);
    setAutoSaveInd(initialPrefs.autoSaveInd);

    if (onDirtyChange) {
      onDirtyChange(false);
    }
    setTimeout(() => {
      onClickBack();
    }, 0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClickBack}
            className="p-2.5 bg-white border border-[#EFECE7] text-slate-600 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-slate-800">Member Preferences</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                {isSandbox ? 'Sandbox Mode' : 'sbDB100 Live'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-serif leading-relaxed mt-0.5">
              Customize your default story craft writing assistant persona and application workspace settings.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications Banner */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-serif leading-relaxed flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-serif leading-relaxed flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          <span className="text-xs font-serif font-medium">Loading preferences...</span>
        </div>
      ) : (
        <form onSubmit={handleSavePreferences} className="space-y-8">

          {/* --- PANEL 1: WRITER PERSONA PREFERENCE --- */}
          <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)]">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#EFECE7]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl">
                  <Feather className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-slate-800">Story Craft Assistant Persona</h3>
                  <p className="text-[11px] text-slate-450 font-serif leading-snug">
                    Select your preferred writing persona to guide AI co-authoring tone, vocabulary, and narrative style.
                  </p>
                </div>
              </div>
            </div>

            {/* Persona Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map((persona) => {
                const isSelected = selectedWriterId === persona.chWriterId;
                return (
                  <div
                    key={persona.chWriterId}
                    onClick={() => setSelectedWriterId(persona.chWriterId)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white border-[#EFECE7] hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header line: Name + Desc Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-slate-800">{persona.chWriterName}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60 rounded-full">
                          {persona.chWriterDesc}
                        </span>
                      </div>

                      {/* Selection Check Circle */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-slate-50'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Prompt Instruction Excerpt */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[11px] font-serif text-slate-600 leading-relaxed italic">
                        "{persona.chWriterPrompt}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- PANEL 2: GENERAL APPLICATION PREFERENCES --- */}
          <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)]">
            
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE7]">
              <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-800">Workspace & UI Preferences</h3>
                <p className="text-[11px] text-slate-450 font-serif leading-snug">
                  Manage application display theme, notifications, and editor auto-save behaviors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Theme Preference Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                  Application Display Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'System', label: 'System', icon: Laptop },
                    { id: 'Light', label: 'Light', icon: Sun },
                    { id: 'Dark', label: 'Dark', icon: Moon }
                  ].map((t) => {
                    const Icon = t.icon;
                    const isThemeSelected = selectedTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTheme(t.id)}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer ${
                          isThemeSelected
                            ? 'bg-white border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-[#EFECE7] text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles Column */}
              <div className="space-y-4 pt-1">
                
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between p-3 bg-white border border-[#EFECE7] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <div>
                      <h5 className="text-xs font-serif font-bold text-slate-700">App Notifications</h5>
                      <p className="text-[10px] text-slate-400 font-serif">Receive activity & story edit updates</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsInd}
                    onChange={(e) => setNotificationsInd(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Auto-Save Toggle */}
                <div className="flex items-center justify-between p-3 bg-white border border-[#EFECE7] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                      <h5 className="text-xs font-serif font-bold text-slate-700">Story Auto-Save</h5>
                      <p className="text-[10px] text-slate-400 font-serif">Automatically save story drafts while typing</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSaveInd}
                    onChange={(e) => setAutoSaveInd(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* --- BOTTOM ACTIONS BAR --- */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EFECE7]">
            <div className="text-xs text-slate-400 font-serif">
              {isDirty ? (
                <span className="text-amber-600 font-medium">● Unsaved preference changes</span>
              ) : (
                <span>All preferences saved</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-2.5 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold font-serif transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-serif shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Preferences</span>
              </button>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
