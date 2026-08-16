/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import the React library along with hooks we need.
// - useState: Used to store and update dynamic data (state) that triggers 
//             component re-renders when updated.
// - useEffect: Used to run side effects (fetching data, setting timers, etc.) 
//              outside of rendering.
import React, { useState, useEffect } from 'react';

// Import animation tools from motion. AnimatePresence is used to animate components when they are unmounted/removed.
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

// Import our custom API helper client.
import { taskApi } from '@/src/services/api';

// Import our layouts and feature components.
import MainLayout from '@/src/layouts/MainLayout';
import { ConnectionSettings } from '@/src/features/settings';
import { AccountLookup } from '@/src/features/account-settings';
import { SbPublicPageFeature } from '@/src/features/sbPublicPage';
import { SbMbrHomePageFeature } from '@/src/features/sbMbrHomePage';
import { SbMbrStoryPageFeature } from '@/src/features/sbMbrStoryPage';
import { SbMbrAuthorPageFeature } from '@/src/features/sbMbrAuthorPage';
import { SbMbrLogonFeature } from '@/src/features/sbMbrLogon';
import { MbrProfileFeature } from '@/src/features/mbrProfile';
import MbrPreferencesFeature from '@/src/features/mbrPreferences/components/MbrPreferencesFeature';
import DbAdminFeature from '@/src/features/db-admin/components/DbAdminFeature';
import { AdminCacheManagement } from '@/src/features/admin-cache';
import { AdminMediaManagement } from '@/src/features/admin-media';

// Define a TypeScript type to restrict activeTab to only these string values.
type TabType = 'workspace' | 'settings' | 'account-settings' | 'sbPublicPage' | 'sbMbrHomePage' | 'sbMbrStoryPage' | 'sbMbrAuthorPage' | 'sbMbrLogon' | 'mbrProfile' | 'mbrPreferences' | 'db-admin' | 'adminCacheManagement' | 'adminMedia';

export default function App() {
  // --- STATE DEFINITIONS ---
  // useState returns an array with two elements: [currentValue, setterFunction].
  // React monitors state variables. When a setterFunction is called, React re-renders 
  // the component with the new value.
  
  const [activeTab, setActiveTab] = useState<TabType>('sbPublicPage');
  const [previousTab, setPreviousTab] = useState<TabType>('sbPublicPage');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('m1');
  const [logonType, setLogonType] = useState<'Google' | 'Apple'>('Google');
  
  // Tracks whether the health check network request is currently active.
  const [loading, setLoading] = useState(true);
  
  // Holds any error message strings if backend communication fails.
  const [error, setError] = useState<string | null>(null);
  
  // Stores the health check status payload returned from the backend FastAPI service.
  const [apiHealth, setApiHealth] = useState<{ status: string; database: string } | null>(null);
  
  // Determines if the app should run using offline sandbox data. If the backend is unreachable, this falls back to true.
  const [isSandbox, setIsSandbox] = useState(false);

  // Unsaved member profile changes guard state
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [showAppDiscardModal, setShowAppDiscardModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);

  const forceNavigateAway = (targetTab?: TabType) => {
    setIsProfileDirty(false);
    const dest = (targetTab && targetTab !== 'mbrProfile') ? targetTab : (previousTab && previousTab !== 'mbrProfile' ? previousTab : 'sbMbrHomePage');
    setActiveTab(dest);
  };

  const handleTabChange = (newTab: TabType) => {
    if (newTab !== activeTab && activeTab !== 'mbrProfile') {
      setPreviousTab(activeTab);
    }
    if (activeTab === 'mbrProfile' && isProfileDirty && newTab !== 'mbrProfile') {
      setPendingTab(newTab);
      setShowAppDiscardModal(true);
    } else {
      setActiveTab(newTab);
    }
  };

  // --- SIDE EFFECTS (useEffect) ---
  // useEffect runs after the component renders on the screen.
  // The second argument is a dependency array:
  // - [] (Empty array): Tells React to run this effect EXACTLY ONCE, when the component initially mounts (loads).
  useEffect(() => {
    loadHealth();

    // Synchronize application color theme (Default, Dark, Ocean, Forest)
    const applyGlobalTheme = () => {
      const savedTheme = sessionStorage.getItem('mbrPrefTheme') || sessionStorage.getItem('theme') || 'Default';
      document.documentElement.setAttribute('data-theme', savedTheme);
    };

    applyGlobalTheme();
    window.addEventListener('theme-changed', applyGlobalTheme);
    window.addEventListener('storage', applyGlobalTheme);
    return () => {
      window.removeEventListener('theme-changed', applyGlobalTheme);
      window.removeEventListener('storage', applyGlobalTheme);
    };
  }, []);

  // Helper function to query the backend health check endpoint.
  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt to hit the health check route.
      const health = await taskApi.checkHealth();
      setApiHealth(health);
      setIsSandbox(false); // Successfully reached the backend server.
    } catch (err: any) {
      // If the backend fails or times out, we catch the exception and fall back to sandbox mode.
      console.warn("Backend API not reachable, falling back to Sandbox Mode:", err);
      setIsSandbox(true);
      setApiHealth({ status: 'offline', database: 'disconnected' });
    } finally {
      setLoading(false); // Done checking health.
    }
  };

  const handleReadStory = (memberId: string) => {
    setPreviousTab(activeTab);
    setSelectedMemberId(memberId);
    setActiveTab('sbMbrStoryPage');
  };

  // --- RENDERING (JSX) ---
  // App.tsx returns JSX (HTML-like syntax inside Javascript).
  // We compose MainLayout as our primary shell structure, then render the appropriate 
  // screen inside it.
  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      isSandbox={isSandbox}
    >
      {/* App-level Unsaved Changes Discard Modal when navigating via top nav tabs */}
      <AnimatePresence>
        {showAppDiscardModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAppDiscardModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-slate-800">Unsaved Profile Changes</h3>
                <p className="text-xs text-slate-500 font-serif leading-relaxed">
                  You have modified fields on your member profile settings. If you navigate to another page now, your changes will be discarded.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppDiscardModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAppDiscardModal(false);
                    setIsProfileDirty(false);
                    if (pendingTab) {
                      setActiveTab(pendingTab);
                      setPendingTab(null);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs"
                >
                  Discard & Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* AnimatePresence coordinates transition effects between our screens. */}
      {/* mode="wait" ensures the old screen completes its fade-out before the new one fades in. */}
      <AnimatePresence mode="wait">
        {/* If the active tab is 'settings', render connection configurations */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <ConnectionSettings isSandbox={isSandbox} />
          </motion.div>
        )}

        {/* If the active tab is 'account-settings', render the user database search UI */}
        {activeTab === 'account-settings' && (
          <motion.div
            key="account-settings-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <AccountLookup isSandbox={isSandbox} />
          </motion.div>
        )}

        {/* If the active tab is 'sbPublicPage', render the three-column memoir layout */}
        {activeTab === 'sbPublicPage' && (
          <motion.div
            key="sbPublicPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbPublicPageFeature
              setActiveTab={setActiveTab}
              onClickReadStory={handleReadStory}
              onSelectLogonType={(type) => {
                setLogonType(type);
                setActiveTab('sbMbrLogon');
              }}
            />
          </motion.div>
        )}

        {/* If the active tab is 'sbMbrHomePage', render the home page dashboard */}
        {activeTab === 'sbMbrHomePage' && (
          <motion.div
            key="sbMbrHomePage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrHomePageFeature
              onClickReadStory={handleReadStory}
              onClickAuthorPage={() => {
                setPreviousTab(activeTab);
                setActiveTab('sbMbrAuthorPage');
              }}
            />
          </motion.div>
        )}

        {/* If the active tab is 'sbMbrStoryPage', render the member story biography page */}
        {activeTab === 'sbMbrStoryPage' && (
          <motion.div
            key="sbMbrStoryPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrStoryPageFeature
              memberId={selectedMemberId}
              onClickBack={() => setActiveTab(previousTab)}
            />
          </motion.div>
        )}

        {/* If the active tab is 'sbMbrAuthorPage', render the member co-writer workspace */}
        {activeTab === 'sbMbrAuthorPage' && (
          <motion.div
            key="sbMbrAuthorPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrAuthorPageFeature
              isSandbox={isSandbox}
              onClickBack={() => setActiveTab('sbMbrHomePage')}
            />
          </motion.div>
        )}
        {/* If the active tab is 'sbMbrLogon', render the secure logon screen */}
        {activeTab === 'sbMbrLogon' && (
          <motion.div
            key="sbMbrLogon-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <SbMbrLogonFeature
              logonType={logonType}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        )}
        {/* If the active tab is 'mbrProfile', render the member profile editing screen */}
        {activeTab === 'mbrProfile' && (
          <motion.div
            key="mbrProfile-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <MbrProfileFeature
              isSandbox={isSandbox}
              onClickBack={() => forceNavigateAway()}
              onDirtyChange={setIsProfileDirty}
            />
          </motion.div>
        )}
        {/* If the active tab is 'mbrPreferences', render the member preferences settings screen */}
        {activeTab === 'mbrPreferences' && (
          <motion.div
            key="mbrPreferences-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <MbrPreferencesFeature
              isSandbox={isSandbox}
              onClickBack={() => forceNavigateAway()}
              onDirtyChange={setIsProfileDirty}
            />
          </motion.div>
        )}
        {/* If the active tab is 'db-admin', render the Database Administration CRUD Center */}
        {activeTab === 'db-admin' && (
          <motion.div
            key="db-admin-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <DbAdminFeature isSandbox={isSandbox} />
          </motion.div>
        )}
        {/* If the active tab is 'adminCacheManagement', render the Admin Cache Management Page */}
        {activeTab === 'adminCacheManagement' && (
          <motion.div
            key="adminCacheManagement-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AdminCacheManagement isSandbox={isSandbox} />
          </motion.div>
        )}
        {/* If the active tab is 'adminMedia', render the Admin Media Management Page */}
        {activeTab === 'adminMedia' && (
          <motion.div
            key="adminMedia-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AdminMediaManagement isSandbox={isSandbox} />
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
