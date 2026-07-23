/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, ChevronDown, BookOpen } from 'lucide-react';
import { taskApi } from '@/src/services/api';

// Restrict values for the tab parameter.
type TabType = 'greeting' | 'workspace' | 'settings' | 'account-settings' | 'sbPublicPage' | 'sbMbrHomePage' | 'sbMbrStoryPage' | 'sbMbrAuthorPage' | 'mbrProfile' | 'sbMbrLogon' | 'db-admin' | 'adminCacheManagement';

// Define the interface (contract) for the props this component expects to receive.
// React components receive data from their parent component via "props" (properties).
interface MainLayoutProps {
  // The value of the active tab.
  activeTab: TabType;
  // A callback function supplied by the parent to update its state when a tab is clicked.
  setActiveTab: (tab: TabType) => void;
  // State representing sandbox environment vs live DB.
  isSandbox: boolean;
  // The child components to render within the layout.
  children: React.ReactNode;
}

/**
 * MainLayout Component
 * Serves as the structural wrapper (shell) for the application.
 * It displays the top navigation header and bottom status footer while displaying nested screen contents in the center.
 */
export default function MainLayout({
  activeTab,
  setActiveTab,
  isSandbox,
  children
}: MainLayoutProps) {
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);
  const [profilePic, setProfilePic] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadProfilePic = async () => {
      const userStr = sessionStorage.getItem('user');
      if (!userStr) {
        setProfilePic(null);
        return;
      }
      try {
        const u = JSON.parse(userStr);
        if (isSandbox) {
          const savedMbr = sessionStorage.getItem('sandbox_mbr');
          if (savedMbr) {
            const mbr = JSON.parse(savedMbr);
            setProfilePic(mbr.mbrProfilePic || null);
          } else {
            setProfilePic('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format');
          }
        } else {
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile) {
            const cachedPic = sessionStorage.getItem(`session_pic_${mbrProfile.mbrId}`);
            setProfilePic(cachedPic || mbrProfile.mbrProfilePic || null);
          }
        }
      } catch (e) {
        console.warn("Could not retrieve profile pic for header:", e);
      }
    };
    
    loadProfilePic();
  }, [isSandbox, activeTab]);

  return (
    <div
      id="app-container"
      className="min-h-screen w-full flex flex-col bg-[#FAF8F5] text-slate-800 font-sans select-none overflow-x-clip"
    >
      {/* --- HEADER SECTION --- */}
      <header
        id="app-header"
        className="sticky top-0 h-16 px-6 md:px-8 flex items-center justify-between bg-[#0F1B35] border-b border-slate-900 shadow-md z-50"
      >
        {/* Logo and branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center border border-blue-400/20 shadow-md shadow-blue-500/10">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-black text-xl tracking-tight text-white flex items-center gap-0.5">
            story<span className="text-blue-400 font-sans font-light">book</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></span>
          </span>
        </div>


        {/* --- STATUS INDICATOR & ACCOUNT MENU --- */}
        <div className="flex items-center gap-6">
          {/* Member Profile Thumbnail */}
          {activeTab !== 'sbPublicPage' && (
            <button
              onClick={() => setActiveTab('mbrProfile')}
              className="w-8 h-8 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-md bg-slate-900"
              title="Edit Profile"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-305" />
              )}
            </button>
          )}

          {/* Account Dropdown Menu */}
          {activeTab !== 'sbPublicPage' && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-serif transition-all duration-150 cursor-pointer border ${
                  isDropdownOpen
                    ? 'bg-white/10 text-white border-white/10'
                    : 'text-slate-300 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Backdrop overlay for closing on click outside */}
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-[#0F1B35] border border-slate-800 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden">
                    <div
                      onClick={() => {
                        setActiveTab('mbrProfile');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'mbrProfile'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      Member Profile
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('account-settings');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'account-settings'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      Account Settings
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('db-admin');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'db-admin'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      Database Admin
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('adminCacheManagement');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'adminCacheManagement'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      Cache Management
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('settings');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'settings'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      Settings
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('greeting');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'greeting'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      Greeting Screen
                    </div>
                    
                    {/* Logout Action Option */}
                    <div
                      onClick={() => {
                        setActiveTab('sbPublicPage');
                        setDropdownOpen(false);
                      }}
                      className="border-t border-slate-800 mt-1 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 cursor-pointer transition-colors"
                    >
                      Logout
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
              Backend Status
            </div>
            <div
              className={`text-xs font-semibold flex items-center gap-1.5 justify-end ${
                isSandbox ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSandbox ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'
                }`}
              ></span>
              {isSandbox ? 'Sandbox Mode' : 'API Connected'}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN PORTVIEW (Content Injection Area) --- */}
      {/* We render {children} here. React inserts whatever children elements were nested within the layout container. */}
      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-16 px-6 md:px-12 max-w-7xl w-full mx-auto">
        {children}
      </main>

      {/* --- FOOTER STATUS BAR --- */}
      <footer
        id="app-footer"
        className="h-12 bg-[#2E2C2A] text-slate-350 px-6 md:px-8 flex items-center justify-between text-xs font-medium border-t border-[#3E3C3A]"
      >
        <div className="flex items-center gap-6">
          <span className="text-slate-400">Node Environment OK</span>
          <div className="flex gap-4">
            <span className="text-emerald-400 font-semibold">● 0 Warnings</span>
            <span
              onClick={() => setActiveTab('account-settings')}
              className="text-slate-300 hover:text-white underline cursor-pointer font-serif"
            >
              Inspect Database User Accounts
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>localhost:3000</span>
          <div className="w-3 h-3 bg-blue-500/20 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-slate-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
