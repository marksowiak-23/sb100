/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, ChevronDown, ChevronUp, BookOpen, Shield, Home, Users, MessageSquare, Bell, CheckCircle2, MessageCircle } from 'lucide-react';
import { taskApi, resolveMediaUrl } from '@/src/services/api';
import { userManager } from '@/src/services/userManager';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import SessionTimeoutPanel from '@/src/components/sessionTimeoutPanel';
import { useSessionTimeout } from '@/src/hooks/useSessionTimeout';

// Restrict values for the tab parameter.
type TabType =
  | 'workspace'
  | 'adminConnectionsPage'
  | 'admin-connections'
  | 'settings'
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
  | 'mbrProfilePage'
  | 'mbrProfile'
  | 'mbrPreferencesPage'
  | 'mbrPreferences'
  | 'mbrPrivacySettingsPage'
  | 'mbrPrivacy'
  | 'mbrConnectionPage'
  | 'mbrConnections'
  | 'mbrLogonPage'
  | 'sbMbrLogon'
  | 'mbrRegistrationPage'
  | 'sbMbrRegister'
  | 'adminDbPage'
  | 'admin-db'
  | 'adminCachePage'
  | 'adminCacheManagement'
  | 'adminMediaPage'
  | 'adminMedia'
  | 'adminProperties'
  | 'adminSystemProperties';

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
  const [isMessagingOpen, setIsMessagingOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = React.useState(true);
  const [profilePic, setProfilePic] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string>('StoryBook Member');
  const [invitationCount, setInvitationCount] = React.useState<number>(0);

  const isPublicView =
    activeTab === 'publicPage' ||
    activeTab === 'sbPublicPage' ||
    activeTab === 'mbrLogonPage' ||
    activeTab === 'sbMbrLogon' ||
    activeTab === 'mbrRegistrationPage' ||
    activeTab === 'sbMbrRegister';

  const isMemberLoggedIn = Boolean(
    !isPublicView ||
    sessionStorage.getItem('user') ||
    sessionStorage.getItem('sb_current_mbr')
  ) && !isPublicView;

  const handleSessionTimeout = React.useCallback(() => {
    userManager.userLogout();
    setProfilePic(null);
    setUserName('StoryBook Member');
    setActiveTab('publicPage');
    setDropdownOpen(false);
  }, [setActiveTab]);

  const {
    isWarningOpen,
    remainingSeconds,
    renewSession
  } = useSessionTimeout({
    isLoggedIn: isMemberLoggedIn,
    onTimeout: handleSessionTimeout,
    defaultTimeoutMinutes: 30
  });

  React.useEffect(() => {
    const loadProfilePic = async () => {
      const userStr = sessionStorage.getItem('user');
      const storedMbr = sessionStorage.getItem('sb_current_mbr');
      if (!userStr && !storedMbr) {
        setProfilePic(null);
        return;
      }
      try {
        if (storedMbr) {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrFirstName) {
            setUserName(`${parsed.mbrFirstName} ${parsed.mbrLastName || ''}`.trim());
          }
          if (parsed.mbrProfilePic) {
            setProfilePic(resolveMediaUrl(parsed.mbrProfilePic));
          }
        }
        if (userStr) {
          const u = JSON.parse(userStr);
          if (isSandbox) {
            const savedMbr = sessionStorage.getItem('sandbox_mbr');
            if (savedMbr) {
              const mbr = JSON.parse(savedMbr);
              setProfilePic(mbr.mbrProfilePic || null);
              if (mbr.mbrFirstName) setUserName(`${mbr.mbrFirstName} ${mbr.mbrLastName || ''}`.trim());
            } else {
              setProfilePic('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format');
            }
          } else {
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile) {
              if (mbrProfile.mbrFirstName) setUserName(`${mbrProfile.mbrFirstName} ${mbrProfile.mbrLastName || ''}`.trim());
              const cachedPic = sessionStorage.getItem(`session_pic_${mbrProfile.mbrId}`);
              const resolved = resolveMediaUrl(cachedPic || mbrProfile.mbrProfilePic);
              setProfilePic(resolved || null);
            }
          }
        }
      } catch (e) {
        console.warn("Could not retrieve profile pic for header:", e);
      }
    };
    
    loadProfilePic();
  }, [isSandbox, activeTab]);

  const loadInvitationCount = React.useCallback(async () => {
    try {
      const userStr = sessionStorage.getItem('user');
      const storedMbr = sessionStorage.getItem('sb_current_mbr');
      if (!userStr && !storedMbr && isPublicView) {
        setInvitationCount(0);
        return;
      }

      let currentMbrId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0'; // fallback
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrId) currentMbrId = parsed.mbrId;
        } catch {}
      } else if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) {
            currentMbrId = mbrProfile.mbrId;
          }
        } catch {}
      }

      if (isSandbox) {
        const rawContactsStr = sessionStorage.getItem(`sandbox_mbr_contacts_${currentMbrId}`);
        if (rawContactsStr) {
          const rawContacts: any[] = JSON.parse(rawContactsStr);
          const pending = rawContacts.filter(c => (c.mbrContactMbrId === currentMbrId || c.mbrId !== currentMbrId) && c.mbrContactResponseInd !== 1);
          setInvitationCount(pending.length);
        } else {
          // Default initial mock invitations for Sandbox
          setInvitationCount(2);
        }
      } else {
        const incoming = await taskApi.getMemberContactsByRecipient(currentMbrId);
        const pending = (incoming || []).filter(c => c.mbrContactResponseInd !== 1);
        setInvitationCount(pending.length);
      }
    } catch (e) {
      console.warn("Could not load contact invitation count:", e);
    }
  }, [isSandbox, isPublicView]);

  React.useEffect(() => {
    loadInvitationCount();

    const handleUpdate = () => {
      loadInvitationCount();
    };

    window.addEventListener('invitations-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('invitations-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadInvitationCount]);

  const handleLogoClick = () => {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      setActiveTab('mbrHomePage');
    } else {
      setActiveTab('publicPage');
    }
  };

  return (
    <div
      id="app-container"
      className="min-h-screen w-full flex flex-col bg-[#FAF8F5] text-slate-800 font-sans select-none overflow-x-clip relative"
    >
      {/* --- HEADER SECTION --- */}
      <header
        id="app-header"
        className="sticky top-0 h-16 px-4 sm:px-6 md:px-8 flex items-center justify-between bg-[#0F1B35] border-b border-slate-900 shadow-md z-50"
      >
        {/* Logo and branding */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-3 text-left bg-transparent border-0 p-0 cursor-pointer group focus:outline-none shrink-0 mr-4"
          title={isMemberLoggedIn ? "Go to Member Home" : "Go to Home"}
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center border border-blue-400/20 shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-black text-xl tracking-tight text-white flex items-center gap-0.5 group-hover:opacity-95 transition-opacity">
            story<span className="text-blue-400 font-sans font-light">book</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></span>
          </span>
        </button>


        {/* --- HEADER CONTROLS --- */}
        <div className="flex items-center gap-3 sm:gap-6 h-full">
          {/* --- LOGGED-IN HEADER NAVIGATION (Home, My Network, Messaging, Notifications, Me) --- */}
          {isMemberLoggedIn ? (
            <nav className="flex items-center h-full gap-0.5 sm:gap-2 md:gap-4">
            {/* 1. Home */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('mbrHomePage');
                setDropdownOpen(false);
                setIsMessagingOpen(false);
                setIsNotificationsOpen(false);
              }}
              className={`h-full flex flex-col items-center justify-center min-w-[52px] sm:min-w-[64px] px-2 relative transition-all cursor-pointer group ${
                activeTab === 'mbrHomePage' || activeTab === 'sbMbrHomePage'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-200 hover:text-white border-b-2 border-transparent font-medium'
              }`}
              title="Member Home"
            >
              <Home className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform" />
              <span className="text-[11px] font-sans tracking-tight leading-none">Home</span>
            </button>

            {/* 2. Author */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('mbrAuthorPage');
                setDropdownOpen(false);
                setIsMessagingOpen(false);
                setIsNotificationsOpen(false);
              }}
              className={`h-full flex flex-col items-center justify-center min-w-[52px] sm:min-w-[64px] px-2 relative transition-all cursor-pointer group ${
                activeTab === 'mbrAuthorPage' || activeTab === 'sbMbrAuthorPage'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-200 hover:text-white border-b-2 border-transparent font-medium'
              }`}
              title="Author Page"
            >
              <BookOpen className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform" />
              <span className="text-[11px] font-sans tracking-tight leading-none">Author</span>
            </button>

            {/* 3. Connections */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('mbrConnections');
                setDropdownOpen(false);
                setIsMessagingOpen(false);
                setIsNotificationsOpen(false);
              }}
              className={`h-full flex flex-col items-center justify-center min-w-[52px] sm:min-w-[64px] px-2 relative transition-all cursor-pointer group ${
                activeTab === 'mbrConnections'
                  ? 'text-white border-b-2 border-white font-bold'
                  : 'text-slate-200 hover:text-white border-b-2 border-transparent font-medium'
              }`}
              title={invitationCount > 0 ? `Connections & Groups (${invitationCount} pending invitation${invitationCount > 1 ? 's' : ''})` : "Connections & Groups"}
            >
              <div className="relative">
                <Users className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform" />
                {invitationCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white font-mono text-[9.5px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0F1B35] shadow-xs"
                    title={`${invitationCount} pending invitation${invitationCount > 1 ? 's' : ''} waiting for you`}
                  >
                    {invitationCount > 99 ? '99+' : invitationCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-sans tracking-tight leading-none">Connections</span>
            </button>

            {/* 3. Messaging */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                onClick={() => {
                  setIsMessagingOpen(!isMessagingOpen);
                  setIsNotificationsOpen(false);
                  setDropdownOpen(false);
                }}
                className={`h-full flex flex-col items-center justify-center min-w-[52px] sm:min-w-[64px] px-2 relative transition-all cursor-pointer group ${
                  isMessagingOpen
                    ? 'text-white border-b-2 border-white font-bold'
                    : 'text-slate-200 hover:text-white border-b-2 border-transparent font-medium'
                }`}
                title="Messaging"
              >
                <div className="relative">
                  <MessageSquare className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform" />
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0F1B35]" />
                </div>
                <span className="text-[11px] font-sans tracking-tight leading-none">Messaging</span>
              </button>

              {/* Messaging Popover Panel */}
              {isMessagingOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsMessagingOpen(false)}
                  />
                  <div className="absolute right-0 top-16 w-80 bg-[#0F1B35] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <h4 className="font-serif font-bold text-xs text-white">Messaging</h4>
                      </div>
                      <span className="text-[10px] text-blue-400 font-medium">New Chat</span>
                    </div>

                    <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                      <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                          EV
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-slate-200 truncate">Eleanor Vance</h5>
                            <span className="text-[9px] text-slate-400 font-mono">2h ago</span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">Loved your latest childhood memoir chapter!</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                          JS
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-slate-200 truncate">James Sterling</h5>
                            <span className="text-[9px] text-slate-400 font-mono">1d ago</span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate">Added new photos from the Pacific Coast trip.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/80 border-t border-slate-800 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMessagingOpen(false);
                          setActiveTab('mbrHomePage');
                        }}
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        View all in Member Workspace →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. Notifications */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsMessagingOpen(false);
                  setDropdownOpen(false);
                }}
                className={`h-full flex flex-col items-center justify-center min-w-[52px] sm:min-w-[64px] px-2 relative transition-all cursor-pointer group ${
                  isNotificationsOpen
                    ? 'text-white border-b-2 border-white font-bold'
                    : 'text-slate-200 hover:text-white border-b-2 border-transparent font-medium'
                }`}
                title="Notifications"
              >
                <div className="relative">
                  <Bell className="w-5 h-5 mb-0.5 group-hover:scale-105 transition-transform" />
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white font-mono text-[9.5px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0F1B35] shadow-xs"
                    title="3 new notifications"
                  >
                    3
                  </span>
                </div>
                <span className="text-[11px] font-sans tracking-tight leading-none">Notifications</span>
              </button>

              {/* Notifications Popover Panel */}
              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-16 w-80 bg-[#0F1B35] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-400" />
                        <h4 className="font-serif font-bold text-xs text-white">Notifications</h4>
                      </div>
                      <span className="text-[10px] text-slate-300">3 unread</span>
                    </div>

                    <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                      <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-start gap-2.5">
                        <Users className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-200 leading-snug">
                            <strong className="text-white">Eleanor Vance</strong> accepted your connection request.
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">15m ago</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-start gap-2.5">
                        <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-200 leading-snug">
                            <strong className="text-white">James Sterling</strong> published a new story chapter.
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">2h ago</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-200 leading-snug">
                            Your profile story was updated successfully.
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">1d ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 5. Me / Account Dropdown */}
            <div className="relative h-full flex items-center pl-1 sm:pl-2 border-l border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(!isDropdownOpen);
                  setIsMessagingOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className={`h-full flex flex-col items-center justify-center min-w-[52px] sm:min-w-[58px] px-2 relative transition-all cursor-pointer group ${
                  isDropdownOpen || ['mbrProfilePage', 'mbrProfile', 'mbrPreferencesPage', 'mbrPreferences', 'mbrPrivacySettingsPage', 'mbrPrivacy', 'mbrConnectionPage', 'mbrConnections'].includes(activeTab)
                    ? 'text-white border-b-2 border-white font-bold'
                    : 'text-slate-200 hover:text-white border-b-2 border-transparent font-medium'
                }`}
                title="Account Menu"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-500 mb-0.5 flex items-center justify-center bg-slate-800 shrink-0 group-hover:border-white transition-colors">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Me"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-slate-200" />
                  )}
                </div>
                <span className="text-[11px] font-sans tracking-tight leading-none flex items-center gap-0.5">
                  Me <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              {isDropdownOpen && (
                <>
                  {/* Backdrop overlay for closing on click outside */}
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-16 w-52 bg-[#0F1B35] border border-slate-800 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden">
                    {/* User Mini Card */}
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shrink-0 flex items-center justify-center">
                          {profilePic ? (
                            <img src={profilePic} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate font-serif">{userName}</h4>
                          <p className="text-[10px] text-blue-400">View & Edit Profile</p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('mbrProfilePage');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'mbrProfilePage' || activeTab === 'mbrProfile'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      My Profile
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('mbrPreferencesPage');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'mbrPreferencesPage' || activeTab === 'mbrPreferences'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      My Preferences
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('mbrPrivacySettingsPage');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeTab === 'mbrPrivacySettingsPage' || activeTab === 'mbrPrivacy'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      My Privacy
                    </div>
                    <div
                      onClick={() => {
                        setActiveTab('mbrConnectionPage');
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                        activeTab === 'mbrConnectionPage' || activeTab === 'mbrConnections'
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>My Connections</span>
                      {invitationCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[9.5px] font-mono font-bold bg-rose-600 text-white rounded-full leading-none">
                          {invitationCount}
                        </span>
                      )}
                    </div>

                    {/* Administrator Nested Menu Group */}
                    <div className="border-t border-slate-800/80 my-1 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAdminMenuOpen(!isAdminMenuOpen);
                        }}
                        className="w-full px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-blue-400" />
                          <span>Administrator</span>
                        </div>
                        {isAdminMenuOpen ? (
                          <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
                        )}
                      </button>

                      {isAdminMenuOpen && (
                        <div className="pl-3 border-l border-slate-700/60 ml-4 my-1 space-y-0.5">
                          <div
                            onClick={() => {
                              setActiveTab('adminAccountsPage');
                              setDropdownOpen(false);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                              activeTab === 'adminAccountsPage' || activeTab === 'admin-accounts' || activeTab === 'account-settings'
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Account Settings
                          </div>
                          <div
                            onClick={() => {
                              setActiveTab('adminConnectionsPage');
                              setDropdownOpen(false);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                              activeTab === 'adminConnectionsPage' || activeTab === 'admin-connections' || activeTab === 'settings'
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Connection Settings
                          </div>
                          <div
                            onClick={() => {
                              setActiveTab('adminDbPage');
                              setDropdownOpen(false);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                              activeTab === 'adminDbPage' || activeTab === 'admin-db'
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Database Admin
                          </div>
                          <div
                            onClick={() => {
                              setActiveTab('adminCachePage');
                              setDropdownOpen(false);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                              activeTab === 'adminCachePage' || activeTab === 'adminCacheManagement'
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Cache Management
                          </div>
                          <div
                            onClick={() => {
                              setActiveTab('adminMediaPage');
                              setDropdownOpen(false);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                              activeTab === 'adminMediaPage' || activeTab === 'adminMedia'
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Media Storage Admin
                          </div>
                          <div
                            onClick={() => {
                              setActiveTab('adminProperties');
                              setDropdownOpen(false);
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                              activeTab === 'adminProperties' || activeTab === 'adminSystemProperties'
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            System Properties
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Logout Action Option */}
                    <div
                      onClick={() => {
                        userManager.userLogout();
                        setProfilePic(null);
                        setActiveTab('publicPage');
                        setDropdownOpen(false);
                      }}
                      className="border-t border-slate-800 mt-1 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 cursor-pointer transition-colors"
                    >
                      Logout
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>
        ) : (
          /* Public Header Navigation */
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('mbrLogonPage')}
              className="px-4 py-2 rounded-xl text-xs font-serif font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mbrRegistrationPage')}
              className="px-4 py-2 rounded-xl text-xs font-serif font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all cursor-pointer"
            >
              Sign Up
            </button>
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
              onClick={() => setActiveTab('admin-accounts')}
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

      {/* Session Inactivity Timeout Warning Modal */}
      <SessionTimeoutPanel
        isOpen={isWarningOpen && isMemberLoggedIn}
        remainingSeconds={remainingSeconds}
        onRenew={renewSession}
        onLogout={handleSessionTimeout}
      />

      <AdminComponentTag name="MainLayout" />
    </div>
  );
}
