/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Save } from 'lucide-react';
import { taskApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import BrandHeaderPanel from '@/src/components/brandHeaderPanel';
import { 
  MbrPreferencesFeatureProps, 
  PreferencesSubTab, 
  WriterPersona, 
  FALLBACK_PERSONAS 
} from '../types';
import PreferencesHeader from './PreferencesHeader';
import PreferencesNavigationMenu from './PreferencesNavigationMenu';
import StoryMatePersonaPanel from './StoryMatePersonaPanel';
import WorkspacePreferencesPanel from './WorkspacePreferencesPanel';

export default function MbrPreferencesFeature({ isSandbox, onClickBack, onDirtyChange }: MbrPreferencesFeatureProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Active sub-tab state: 'story-mate' or 'workspace'
  const [activeSubTab, setActiveSubTab] = useState<PreferencesSubTab>('story-mate');

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

  // Calculate dirty states
  const isStoryMateDirty = useMemo(() => {
    return selectedWriterId !== initialPrefs.selectedWriterId;
  }, [selectedWriterId, initialPrefs.selectedWriterId]);

  const isWorkspaceDirty = useMemo(() => {
    return (
      selectedTheme !== initialPrefs.selectedTheme ||
      notificationsInd !== initialPrefs.notificationsInd ||
      autoSaveInd !== initialPrefs.autoSaveInd
    );
  }, [selectedTheme, notificationsInd, autoSaveInd, initialPrefs]);

  const isDirty = useMemo(() => {
    return isStoryMateDirty || isWorkspaceDirty;
  }, [isStoryMateDirty, isWorkspaceDirty]);

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

      // Respect active applied theme from DOM or sessionStorage without mutating active theme
      const currentAppliedTheme = document.documentElement.getAttribute('data-theme') || sessionStorage.getItem('mbrPrefTheme') || sessionStorage.getItem('theme') || prefRecord?.mbrPrefTheme || 'Default';
      const activeTheme = (currentAppliedTheme === 'System' || currentAppliedTheme === 'Light') ? 'Default' : currentAppliedTheme;

      const defaultWriter = prefRecord?.chWriterId || writerList[0]?.chWriterId || '';
      const defaultNotif = prefRecord?.mbrPrefNotificationsInd ?? true;
      const defaultAutoSave = prefRecord?.mbrPrefAutoSaveInd ?? true;

      setMbrPrefId(prefRecord?.mbrPrefId || null);
      setSelectedWriterId(defaultWriter);
      setSelectedTheme(activeTheme);
      setNotificationsInd(defaultNotif);
      setAutoSaveInd(defaultAutoSave);

      setInitialPrefs({
        selectedWriterId: defaultWriter,
        selectedTheme: activeTheme,
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

      sessionStorage.setItem('mbrPrefTheme', selectedTheme);
      sessionStorage.setItem('theme', selectedTheme);
      document.documentElement.setAttribute('data-theme', selectedTheme);
      window.dispatchEvent(new Event('theme-changed'));

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
      
      // Auto close and return to previous page
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

  // --- CANCEL / RESET ACTION ---
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
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative animate-fade-in">
      <AdminComponentTag name="MbrPreferencesFeature.tsx" />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-serif font-medium">Loading preferences...</span>
        </div>
      ) : (
        <form onSubmit={handleSavePreferences}>
          
          {/* --- TWO-COLUMN GRID LAYOUT --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: BRAND HEADER & NAVIGATION MENU */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
              <BrandHeaderPanel />
              <PreferencesNavigationMenu
                activeSubTab={activeSubTab}
                onSelectTab={setActiveSubTab}
                isStoryMateDirty={isStoryMateDirty}
                isWorkspaceDirty={isWorkspaceDirty}
              />
            </aside>

            {/* RIGHT COLUMN: MAIN CONTENT AREA & HEADER */}
            <main className="lg:col-span-8 xl:col-span-9 min-w-0">

              {/* Top Header Navigation */}
              <PreferencesHeader
                activeSubTab={activeSubTab}
                isDirty={isDirty}
                saving={saving}
                error={error}
                success={success}
                onClickBack={onClickBack}
                onReset={handleCancel}
                onDismissError={() => setError(null)}
                onDismissSuccess={() => setSuccess(null)}
              />

              {/* Sub-Panel 1: Story Craft Assistant Persona */}
              {activeSubTab === 'story-mate' && (
                <StoryMatePersonaPanel
                  personas={personas}
                  selectedWriterId={selectedWriterId}
                  onSelectWriterId={setSelectedWriterId}
                />
              )}

              {/* Sub-Panel 2: Workspace & UI Preferences */}
              {activeSubTab === 'workspace' && (
                <WorkspacePreferencesPanel
                  selectedTheme={selectedTheme}
                  onSelectTheme={(theme) => {
                    setSelectedTheme(theme);
                    document.documentElement.setAttribute('data-theme', theme);
                    sessionStorage.setItem('mbrPrefTheme', theme);
                    sessionStorage.setItem('theme', theme);
                    window.dispatchEvent(new Event('theme-changed'));
                  }}
                  notificationsInd={notificationsInd}
                  onToggleNotifications={setNotificationsInd}
                  autoSaveInd={autoSaveInd}
                  onToggleAutoSave={setAutoSaveInd}
                />
              )}

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-serif">
                  {isDirty ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">● Unsaved preference changes</span>
                  ) : (
                    <span>All preferences saved</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-sans shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none"
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

            </main>

          </div>

        </form>
      )}

      <AdminComponentTag name="MbrPreferencesFeature" />
    </div>
  );
}
