/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

type TabType = 'greeting' | 'workspace' | 'settings' | 'account-settings';

interface MainLayoutProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isSandbox: boolean;
  children: React.ReactNode;
}

export default function MainLayout({
  activeTab,
  setActiveTab,
  isSandbox,
  children
}: MainLayoutProps) {
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
        {children}
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
