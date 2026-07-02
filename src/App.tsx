/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  User,
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Edit2,
  AlertCircle,
  Database,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  Settings as SettingsIcon,
  Info,
  Server,
  Mail,
  Copy
} from 'lucide-react';
import { taskApi, UserAccount } from './services/api';

const SANDBOX_USERS: UserAccount[] = [
  { user_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', username: 'john_doe', email: 'john.doe@example.com', is_active: true, created_at: '2026-07-01T08:00:00Z', updated_at: '2026-07-01T08:00:00Z' },
  { user_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', username: 'jane_smith', email: 'jane.smith@example.com', is_active: true, created_at: '2026-07-01T08:30:00Z', updated_at: '2026-07-01T08:30:00Z' },
  { user_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', username: 'alex_jones', email: 'alex.jones@example.com', is_active: true, created_at: '2026-07-01T09:00:00Z', updated_at: '2026-07-01T09:00:00Z' },
  { user_id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', username: 'emily_brown', email: 'emily.brown@example.com', is_active: true, created_at: '2026-07-01T09:15:00Z', updated_at: '2026-07-01T09:15:00Z' },
  { user_id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', username: 'michael_green', email: 'michael.green@example.com', is_active: false, created_at: '2026-07-01T10:00:00Z', updated_at: '2026-07-01T11:30:00Z' },
  { user_id: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', username: 'sarah_white', email: 'sarah.white@example.com', is_active: true, created_at: '2026-07-01T11:00:00Z', updated_at: '2026-07-01T11:00:00Z' },
  { user_id: 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', username: 'david_black', email: 'david.black@example.com', is_active: true, created_at: '2026-07-01T12:00:00Z', updated_at: '2026-07-01T12:00:00Z' },
  { user_id: 'b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', username: 'lisa_gray', email: 'lisa.gray@example.com', is_active: true, created_at: '2026-07-01T13:00:00Z', updated_at: '2026-07-01T13:00:00Z' },
  { user_id: 'c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', username: 'robert_taylor', email: 'robert.taylor@example.com', is_active: true, created_at: '2026-07-01T14:00:00Z', updated_at: '2026-07-01T14:00:00Z' },
  { user_id: 'd0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a', username: 'karen_wilson', email: 'karen.wilson@example.com', is_active: false, created_at: '2026-07-01T15:00:00Z', updated_at: '2026-07-01T15:30:00Z' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'greeting' | 'workspace' | 'settings' | 'account-settings'>('greeting');
  const [name, setName] = useState('');
  const [time, setTime] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; database: string } | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);

  // Account Settings state
  const [searchUsername, setSearchUsername] = useState('');
  const [searchUsersResults, setSearchUsersResults] = useState<UserAccount[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const handleSearchUsers = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    try {
      if (isSandbox) {
        const matchWildcard = (str: string, rule: string) => {
          const escapeRegex = (s: string) => s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
          const regexRule = "^" + rule.split("*").map(escapeRegex).join(".*") + "$";
          return new RegExp(regexRule, "i").test(str);
        };
        const matchUser = (username: string, query: string) => {
          if (!query) return true;
          if (query.includes('*')) {
            return matchWildcard(username, query);
          }
          return username.toLowerCase().includes(query.toLowerCase());
        };
        const results = SANDBOX_USERS.filter(u => matchUser(u.username, searchUsername.trim()));
        setSearchUsersResults(results);
      } else {
        const results = await taskApi.getUsers(searchUsername.trim() || undefined);
        setSearchUsersResults(results);
      }
    } catch (err: any) {
      setSearchError(`Failed to fetch user accounts: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'account-settings') {
      handleSearchUsers();
    }
  }, [activeTab, isSandbox]);


  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch API health on mount
  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await taskApi.checkHealth();
      setApiHealth(health);
      setIsSandbox(false);
    } catch (err: any) {
      console.warn("Backend API not reachable, falling back to Sandbox Mode:", err);
      setIsSandbox(true);
      setApiHealth({ status: 'offline', database: 'disconnected' });
    } finally {
      setLoading(false);
    }
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleReset = () => {
    setName('');
  };

  const displayName = name.trim() || 'World';

  return (
    <div
      id="app-container"
      className="min-h-screen w-full flex flex-col bg-slate-50 text-slate-900 font-sans select-none overflow-x-hidden"
    >
      {/* Header */}
      <header
        id="app-header"
        className="h-16 px-6 md:px-8 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
            <div className="w-4 h-4 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">
            ReactOS<span className="text-blue-600 italic">_</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
          <span
            onClick={() => setActiveTab('greeting')}
            className={`py-5 px-1 cursor-pointer transition-all duration-150 ${
              activeTab === 'greeting'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-800'
            }`}
          >
            Greeting Screen
          </span>

          <span
            onClick={() => setActiveTab('settings')}
            className={`py-5 px-1 cursor-pointer transition-all duration-150 ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-800'
            }`}
          >
            Settings
          </span>
          <span
            onClick={() => setActiveTab('account-settings')}
            className={`py-5 px-1 cursor-pointer transition-all duration-150 ${
              activeTab === 'account-settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-800'
            }`}
          >
            Account Settings
          </span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Backend Status
            </div>
            <div
              className={`text-xs font-semibold flex items-center gap-1.5 justify-end ${
                isSandbox ? 'text-amber-500' : 'text-emerald-500'
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

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'greeting' && (
            <motion.div
              key="greeting-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center justify-center"
            >
              {/* Dynamic Card */}
              <div
                id="greeting-card"
                className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-8 md:p-16 shadow-[0_20px_50px_rgba(148,163,184,0.12)] text-center transition-shadow duration-300"
              >
                {/* Theme Badge */}
                <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-6 uppercase tracking-widest">
                  {name.trim() ? 'System Synced' : 'Initialization Successful'}
                </div>

                {/* Dynamic Greeting Heading */}
                <div id="greeting-display" className="min-h-[140px] flex flex-col justify-center text-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={displayName}
                      initial={{ opacity: 0, scale: 0.97, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.03, y: -8 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="space-y-4"
                    >
                      <div
                        className="inline-flex items-center justify-center p-3 bg-blue-50/70 rounded-2xl"
                        id="avatar-container"
                      >
                        {name.trim() ? (
                          <User className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Sparkles className="w-6 h-6 text-blue-500 animate-spin-slow" />
                        )}
                      </div>

                      <h1
                        id="main-greeting"
                        className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tighter mb-4 leading-normal break-words"
                      >
                        Hello,{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                          {displayName}!
                        </span>
                      </h1>

                      <p id="greeting-subtitle" className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
                        {name.trim()
                          ? 'A personalized reactive screen tailored specifically for Mark.'
                          : 'Mark Sowiak, your interactive React environment is fully initialized. Start customizing by entering your name below.'}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Dynamic input integration */}
                <div id="input-container" className="mt-10 pt-8 border-t border-slate-100 space-y-4 max-w-md mx-auto">
                  <div className="space-y-2 text-left">
                    <label
                      htmlFor="name-input"
                      className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono"
                    >
                      Change Greeting Subject
                    </label>
                    <div className="relative">
                      <input
                        id="name-input"
                        type="text"
                        maxLength={20}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Type a custom name..."
                        className="w-full bg-slate-50/70 hover:bg-slate-50/90 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-2xl border border-slate-200 outline-none py-3.5 pl-11 pr-4 transition-all duration-150 font-sans shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-150"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {name && (
                      <motion.button
                        id="clear-button"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleReset}
                        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 rounded-2xl transition-all duration-150"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset to World</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Stats Grid */}
              <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
                {/* Card 1: Clock */}
                <div className="bg-white/75 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Clock</span>
                  <span className="text-xl font-mono text-slate-800">{formattedTime}</span>
                </div>

                {/* Card 2: Calendar */}
                <div className="bg-white/75 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Date</span>
                  <span className="text-lg font-mono text-slate-800">{formattedDate}</span>
                </div>

                {/* Card 3: Session Sync status */}
                <div className="bg-white/75 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Bytes</span>
                  <span className="text-xl font-mono text-slate-800">{name.trim().length} octets</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
                <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Connection Settings</h2>
                  <p className="text-xs text-slate-400">Configure connection details for the sb100 environment.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* API endpoint setting info */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                    VITE_API_URL
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-700">
                      {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded">
                      Configured
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-normal">
                    This value is configured via <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">.env.local</span>. To point to a different port or remote API, edit that file and reload the Vite client.
                  </p>
                </div>

                {/* API Mode */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                    Connection Mode
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">
                        {isSandbox ? 'Local Storage Sandbox' : 'FastAPI Connected'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {isSandbox
                          ? 'Running in sandboxed offline browser mode. Fastapi server was unreachable.'
                          : 'Successfully queried backend routes and connected to Cloud SQL database.'}
                      </span>
                    </div>
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isSandbox ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    ></span>
                  </div>
                </div>


              </div>
            </motion.div>
          )}

          {activeTab === 'account-settings' && (
            <motion.div
              key="account-settings-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-5xl space-y-8"
            >
              {/* Header Status Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Account Settings Lookup</h2>
                    <p className="text-xs text-slate-500">
                      Query and view user credentials, registration dates, and active statuses.
                    </p>
                  </div>
                </div>
                
                {/* Mode status badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                      isSandbox
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSandbox ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                    {isSandbox ? 'Sandbox Mock Data' : 'Live DB Connected'}
                  </span>
                </div>
              </div>

              {/* Search Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" /> Search User Accounts
                </h3>
                
                <form onSubmit={handleSearchUsers} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      placeholder="Enter username (e.g. john_doe, john*, *smith)..."
                      className="w-full bg-slate-50 hover:bg-slate-100/65 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-xl border border-slate-200 outline-none py-3 pl-11 pr-4 transition-all duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-150"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-200 transition-all duration-150 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
                  >
                    {searchLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Search Accounts</span>
                  </button>
                </form>

                <p className="text-[11px] text-slate-400 mt-3 leading-normal">
                  💡 Wildcard support: Use <strong>*</strong> for matching prefixes (e.g. <code>john*</code>), suffixes (e.g. <code>*smith</code>), or internal patterns. Entering plain text defaults to a partial substring search.
                </p>
              </div>

              {/* Error Banner */}
              {searchError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-xl flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-sm font-medium">{searchError}</p>
                  </div>
                  <button onClick={() => setSearchError(null)} className="text-rose-500 hover:text-rose-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Grid of Results */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-bold text-slate-500">
                    Results ({searchUsersResults.length})
                  </h3>
                </div>

                {searchLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Searching account records...</span>
                  </div>
                ) : searchUsersResults.length === 0 ? (
                  <div className="bg-white border border-slate-150 border-dashed rounded-2xl py-16 px-6 text-center shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
                      <Info className="w-6 h-6" />
                    </div>
                    <h4 className="text-slate-800 font-bold mb-1">No user accounts found</h4>
                    <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                      Try searching with different keywords or check if the backend mock accounts are seeded.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchUsersResults.map((user) => (
                      <motion.div
                        key={user.user_id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* User Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                                {user.username.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-base">{user.username}</h4>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                                    user.is_active
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Copy UUID button */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(user.user_id);
                                setCopiedUserId(user.user_id);
                                setTimeout(() => setCopiedUserId(null), 2000);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Copy user UUID"
                            >
                              {copiedUserId === user.user_id ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Email info */}
                          <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="truncate">{user.email}</span>
                          </div>

                          {/* UUID info */}
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              User UUID
                            </span>
                            <span className="font-mono text-xs text-slate-600 select-all block break-all">
                              {user.user_id}
                            </span>
                          </div>
                        </div>

                        {/* Dates info footer */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-355" />
                            <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span>Updated: {new Date(user.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Bar */}
      <footer
        id="app-footer"
        className="h-12 bg-slate-900 text-slate-400 px-6 md:px-8 flex items-center justify-between text-xs font-medium"
      >
        <div className="flex items-center gap-6">
          <span className="text-slate-500">Node Environment OK</span>
          <div className="flex gap-4">
            <span className="text-emerald-400 font-semibold">● 0 Warnings</span>
            <span
              onClick={() => setActiveTab('account-settings')}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Inspect Database User Accounts
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>localhost:3000</span>
          <div className="w-3 h-3 bg-blue-500/20 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}


