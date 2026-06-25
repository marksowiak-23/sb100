/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, RefreshCw, Clock, Calendar } from 'lucide-react';

export default function App() {
  const [name, setName] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          <span className="text-blue-600 border-b-2 border-blue-600 py-5 px-1 cursor-pointer">Greeting Screen</span>
          <span className="hover:text-slate-800 py-5 px-1 cursor-pointer transition-colors duration-150">Workspace</span>
          <span className="hover:text-slate-800 py-5 px-1 cursor-pointer transition-colors duration-150">Settings</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
            <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live Preview
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12">

        {/* Dynamic Card */}
        <motion.div
          id="greeting-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-8 md:p-16 shadow-[0_20px_50px_rgba(148,163,184,0.12)] text-center transition-shadow duration-300"
        >
          {/* Theme Badge */}
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-6 uppercase tracking-widest">
            {name.trim() ? "System Synced" : "Initialization Successful"}
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
                <div className="inline-flex items-center justify-center p-3 bg-blue-50/70 rounded-2xl" id="avatar-container">
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
                  Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{displayName}!</span>
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
                  placeholder="Type a custom blnnname..."
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
        </motion.div>

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
            <span className="text-slate-600 underline cursor-not-allowed">Inspect Assets</span>
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

