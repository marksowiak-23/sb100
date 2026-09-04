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
import { taskApi, HealthCheckResponse } from '@/src/services/api';

// Import our layouts and feature components.
import MainLayout from '@/src/layouts/MainLayout';
import { ConnectionSettings, AdminConnectionsPage } from '@/src/features/adminConnectionsPage';
import { AccountLookup, AdminAccountsPage, AdminUserAdminPage } from '@/src/features/adminUserAdminPage';
import { PublicPageFeature, SbPublicPageFeature } from '@/src/features/publicPage';
import { MbrHomePageFeature, SbMbrHomePageFeature } from '@/src/features/mbrHomePage';
import { MbrStoryPageFeature, SbMbrStoryPageFeature } from '@/src/features/mbrStoryPage';
import { MbrAuthorPageFeature, SbMbrAuthorPageFeature } from '@/src/features/mbrAuthorPage';
import { MbrLogonPageFeature, SbMbrLogonFeature } from '@/src/features/mbrLogonPage';
import { MbrRegistrationPageFeature, SbMbrRegisterFeature } from '@/src/features/mbrRegistrationPage';
import { MbrProfileFeature } from '@/src/features/mbrProfilePage';
import { MbrPreferencesFeature } from '@/src/features/mbrPreferencesPage';
import { MbrPrivacyFeature } from '@/src/features/mbrPrivacySettingsPage';
import { MbrConnectionFeature } from '@/src/features/mbrConnectionPage';
import { DbAdminFeature, AdminDbPageFeature } from '@/src/features/adminDbPage';
import { AdminCacheManagement, AdminCachePage } from '@/src/features/adminCachePage';
import { AdminMediaManagement, AdminMediaPage } from '@/src/features/adminMediaPage';
import { AdminPropertiesFeature, SystemPropertiesFeature } from '@/src/features/adminProperties';
import { AdminUserAIUsageFeature } from '@/src/features/adminUserAIUsagePage';


// Define a TypeScript type to restrict activeTab to only these string values.
type TabType =
  | 'workspace'
  | 'adminConnectionsPage'
  | 'admin-connections'
  | 'settings'
  | 'adminUserAdminPage'
  | 'adminAccountsPage'
  | 'admin-accounts'
  | 'account-settings'
  | 'publicPage'
  | 'sbPublicPage'
  | 'mbrHomePage'
  | 'sbMbrHomePage'
  | 'mbrStoryPage'
  | 'sbMbrStoryPage'
  | 'mbrAuthorPage'
  | 'sbMbrAuthorPage'
  | 'mbrLogonPage'
  | 'sbMbrLogon'
  | 'mbrRegistrationPage'
  | 'sbMbrRegister'
  | 'mbrProfilePage'
  | 'mbrProfile'
  | 'mbrPreferencesPage'
  | 'mbrPreferences'
  | 'mbrPrivacySettingsPage'
  | 'mbrPrivacy'
  | 'mbrConnectionPage'
  | 'mbrConnections'
  | 'adminDbPage'
  | 'admin-db'
  | 'adminUserAIUsagePage'
  | 'admin-user-ai-usage'
  | 'adminCachePage'
  | 'adminCacheManagement'
  | 'adminMediaPage'
  | 'adminMedia'
  | 'adminProperties'
  | 'adminSystemProperties';




export default function App() {
  // --- STATE DEFINITIONS ---
  // useState returns an array with two elements: [currentValue, setterFunction].
  // React monitors state variables. When a setterFunction is called, React re-renders 
  // the component with the new value.
  
  const [activeTab, setActiveTab] = useState<TabType>('publicPage');
  const [previousTab, setPreviousTab] = useState<TabType>('publicPage');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('m1');
  const [targetStoryMemberId, setTargetStoryMemberId] = useState<string | null>(null);
  const [logonType, setLogonType] = useState<'Google' | 'Apple'>('Google');
  
  // Tracks whether the health check network request is currently active.
  const [loading, setLoading] = useState(true);
  
  // Holds any error message strings if backend communication fails.
  const [error, setError] = useState<string | null>(null);
  
  // Stores raw status info returned from the health API endpoint.
  const [apiHealth, setApiHealth] = useState<HealthCheckResponse | null>(null);
  
  // Flag indicating if we are running against mock local data (isSandbox === true) 
  // or a real backend API (isSandbox === false).
  const [isSandbox, setIsSandbox] = useState(true);
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [isConnectionsDirty, setIsConnectionsDirty] = useState(false);
  const [showAppDiscardModal, setShowAppDiscardModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);

  const forceNavigateAway = (targetTab?: TabType) => {
    setIsProfileDirty(false);
    setIsConnectionsDirty(false);
    const dest = (targetTab && targetTab !== 'mbrProfile' && targetTab !== 'mbrProfilePage' && targetTab !== 'mbrConnections' && targetTab !== 'mbrConnectionPage') 
      ? targetTab 
      : (previousTab && previousTab !== 'mbrProfile' && previousTab !== 'mbrProfilePage' && previousTab !== 'mbrConnections' && previousTab !== 'mbrConnectionPage' ? previousTab : 'mbrHomePage');
    setActiveTab(dest);
  };

  const handleTabChange = (newTab: TabType) => {
    if (newTab !== activeTab && activeTab !== 'mbrProfile' && activeTab !== 'mbrProfilePage' && activeTab !== 'mbrConnections' && activeTab !== 'mbrConnectionPage') {
      setPreviousTab(activeTab);
    }
    if (newTab !== 'mbrRegistrationPage' && newTab !== 'sbMbrRegister' && newTab !== 'mbrStoryPage' && newTab !== 'sbMbrStoryPage' && newTab !== 'mbrLogonPage' && newTab !== 'sbMbrLogon') {
      setTargetStoryMemberId(null);
    }
    if ((activeTab === 'mbrProfile' || activeTab === 'mbrProfilePage') && isProfileDirty && newTab !== 'mbrProfile' && newTab !== 'mbrProfilePage') {
      setPendingTab(newTab);
      setShowAppDiscardModal(true);
    } else if ((activeTab === 'mbrConnections' || activeTab === 'mbrConnectionPage') && isConnectionsDirty && newTab !== 'mbrConnections' && newTab !== 'mbrConnectionPage') {
      window.dispatchEvent(new CustomEvent('attempt-connection-navigation', { detail: { targetTab: newTab } }));
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

    // Periodically re-check backend health if initially in Sandbox mode
    const healthInterval = setInterval(() => {
      taskApi.checkHealth()
        .then((health) => {
          if (health?.status === 'healthy') {
            setApiHealth(health);
            setIsSandbox(false);
            clearInterval(healthInterval);
          }
        })
        .catch(() => {
          // Backend not ready yet, continue in Sandbox mode
        });
    }, 3000);

    // Synchronize application color theme (Default, Dark, Ocean, Forest)
    const applyGlobalTheme = () => {
      const savedTheme = sessionStorage.getItem('mbrPrefTheme') || sessionStorage.getItem('theme') || 'Default';
      document.documentElement.setAttribute('data-theme', savedTheme);
    };

    applyGlobalTheme();
    window.addEventListener('theme-changed', applyGlobalTheme);
    window.addEventListener('storage', applyGlobalTheme);
    return () => {
      clearInterval(healthInterval);
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
    if (activeTab === 'publicPage' || activeTab === 'sbPublicPage') {
      setTargetStoryMemberId(memberId);
      setActiveTab('mbrRegistrationPage');
    } else {
      setTargetStoryMemberId(null);
      setActiveTab('mbrStoryPage');
    }
  };

  useEffect(() => {
    const handleStoryEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ memberId: string }>;
      if (customEvent.detail?.memberId) {
        handleReadStory(customEvent.detail.memberId);
      }
    };
    const handleProfileEvent = () => {
      handleTabChange('mbrProfilePage');
    };
    window.addEventListener('open-member-story', handleStoryEvent);
    window.addEventListener('open-member-profile', handleProfileEvent);
    return () => {
      window.removeEventListener('open-member-story', handleStoryEvent);
      window.removeEventListener('open-member-profile', handleProfileEvent);
    };
  }, [activeTab]);

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
        {/* If the active tab is 'adminConnectionsPage', 'admin-connections' or legacy 'settings', render connection configurations */}
        {(activeTab === 'adminConnectionsPage' || activeTab === 'admin-connections' || activeTab === 'settings') && (
          <motion.div
            key="adminConnectionsPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <ConnectionSettings isSandbox={isSandbox} />
          </motion.div>
        )}

        {/* If the active tab is 'adminUserAdminPage', 'adminAccountsPage', 'admin-accounts' or legacy 'account-settings', render the user database search UI */}
        {(activeTab === 'adminUserAdminPage' || activeTab === 'adminAccountsPage' || activeTab === 'admin-accounts' || activeTab === 'account-settings') && (
          <motion.div
            key="adminUserAdminPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <AccountLookup isSandbox={isSandbox} setActiveTab={setActiveTab} />
          </motion.div>
        )}

        {/* If the active tab is 'publicPage' or legacy 'sbPublicPage', render the three-column memoir layout */}
        {(activeTab === 'publicPage' || activeTab === 'sbPublicPage') && (
          <motion.div
            key="publicPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <PublicPageFeature
              setActiveTab={(tab) => {
                setTargetStoryMemberId(null);
                handleTabChange(tab);
              }}
              onClickReadStory={handleReadStory}
              onSelectLogonType={(type) => {
                setTargetStoryMemberId(null);
                setLogonType(type);
                setActiveTab('mbrLogonPage');
              }}
            />
          </motion.div>
        )}

        {/* If the active tab is 'mbrHomePage' or legacy 'sbMbrHomePage', render the home page dashboard */}
        {(activeTab === 'mbrHomePage' || activeTab === 'sbMbrHomePage') && (
          <motion.div
            key="mbrHomePage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <MbrHomePageFeature
              onClickReadStory={handleReadStory}
              onClickAuthorPage={() => {
                setPreviousTab(activeTab);
                setActiveTab('mbrAuthorPage');
              }}
            />
          </motion.div>
        )}

        {/* If the active tab is 'mbrStoryPage' or legacy 'sbMbrStoryPage', render the member story biography page */}
        {(activeTab === 'mbrStoryPage' || activeTab === 'sbMbrStoryPage') && (
          <motion.div
            key="mbrStoryPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <MbrStoryPageFeature
              memberId={selectedMemberId}
              onClickBack={() => setActiveTab('mbrHomePage')}
            />
          </motion.div>
        )}

        {/* If the active tab is 'mbrAuthorPage' or legacy 'sbMbrAuthorPage', render the member co-writer workspace */}
        {(activeTab === 'mbrAuthorPage' || activeTab === 'sbMbrAuthorPage') && (
          <motion.div
            key="mbrAuthorPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <MbrAuthorPageFeature
              isSandbox={isSandbox}
              onClickBack={() => setActiveTab('mbrHomePage')}
              onClickAuthorProfile={() => handleTabChange('mbrProfilePage')}
            />
          </motion.div>
        )}
        {/* If the active tab is 'mbrLogonPage' or legacy 'sbMbrLogon', render the secure logon screen */}
        {(activeTab === 'mbrLogonPage' || activeTab === 'sbMbrLogon') && (
          <motion.div
            key="mbrLogonPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <MbrLogonPageFeature
              setActiveTab={setActiveTab}
              targetStoryMemberId={targetStoryMemberId}
            />
          </motion.div>
        )}
        {/* If the active tab is 'mbrRegistrationPage' or legacy 'sbMbrRegister', render the member registration screen */}
        {(activeTab === 'mbrRegistrationPage' || activeTab === 'sbMbrRegister') && (
          <motion.div
            key="mbrRegistrationPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <MbrRegistrationPageFeature
              setActiveTab={setActiveTab}
              targetStoryMemberId={targetStoryMemberId}
            />
          </motion.div>
        )}
        {/* If the active tab is 'mbrProfilePage' or legacy 'mbrProfile', render the member profile editing screen */}
        {(activeTab === 'mbrProfilePage' || activeTab === 'mbrProfile') && (
          <motion.div
            key="mbrProfilePage-view"
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
        {/* If the active tab is 'mbrPreferencesPage' or legacy 'mbrPreferences', render the member preferences settings screen */}
        {(activeTab === 'mbrPreferencesPage' || activeTab === 'mbrPreferences') && (
          <motion.div
            key="mbrPreferencesPage-view"
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
        {/* If the active tab is 'mbrPrivacySettingsPage' or legacy 'mbrPrivacy', render the member privacy & permissions settings screen */}
        {(activeTab === 'mbrPrivacySettingsPage' || activeTab === 'mbrPrivacy') && (
          <motion.div
            key="mbrPrivacySettingsPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <MbrPrivacyFeature
              isSandbox={isSandbox}
              onClickBack={() => forceNavigateAway()}
              onDirtyChange={setIsProfileDirty}
            />
          </motion.div>
        )}
        {/* If the active tab is 'mbrConnectionPage' or legacy 'mbrConnections', render the member connections & group assignment screen */}
        {(activeTab === 'mbrConnectionPage' || activeTab === 'mbrConnections') && (
          <motion.div
            key="mbrConnectionPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex justify-center"
          >
            <MbrConnectionFeature
              isSandbox={isSandbox}
              onClickBack={() => forceNavigateAway()}
              onDirtyChange={setIsConnectionsDirty}
              onNavigate={handleTabChange}
            />
          </motion.div>
        )}
        {/* If the active tab is 'adminDbPage' or legacy 'admin-db', render the Database Administration CRUD Center */}
        {(activeTab === 'adminDbPage' || activeTab === 'admin-db') && (
          <motion.div
            key="adminDbPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <DbAdminFeature isSandbox={isSandbox} />
          </motion.div>
        )}
        {/* If the active tab is 'adminUserAIUsagePage' or 'admin-user-ai-usage', render the AI Token & Compute Analytics Feature */}
        {(activeTab === 'adminUserAIUsagePage' || activeTab === 'admin-user-ai-usage') && (
          <motion.div
            key="adminUserAIUsagePage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AdminUserAIUsageFeature isSandbox={isSandbox} />
          </motion.div>
        )}
        {/* If the active tab is 'adminCachePage' or legacy 'adminCacheManagement', render the Admin Cache Management Page */}

        {(activeTab === 'adminCachePage' || activeTab === 'adminCacheManagement') && (
          <motion.div
            key="adminCachePage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AdminCacheManagement isSandbox={isSandbox} />
          </motion.div>
        )}
        {/* If the active tab is 'adminMediaPage' or legacy 'adminMedia', render the Admin Media Management Page */}
        {(activeTab === 'adminMediaPage' || activeTab === 'adminMedia') && (
          <motion.div
            key="adminMediaPage-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AdminMediaManagement isSandbox={isSandbox} />
          </motion.div>
        )}
        {/* If the active tab is 'adminProperties' or legacy 'adminSystemProperties', render the Dynamic System Properties Page */}
        {(activeTab === 'adminProperties' || activeTab === 'adminSystemProperties') && (
          <motion.div
            key="adminProperties-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <AdminPropertiesFeature />
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );

}
