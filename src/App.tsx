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
  Server
} from 'lucide-react';
import { taskApi, Task } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'greeting' | 'workspace' | 'settings'>('greeting');
  const [name, setName] = useState('');
  const [time, setTime] = useState(new Date());

  // Task API state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; database: string } | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch API health and tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await taskApi.checkHealth();
      setApiHealth(health);
      const fetchedTasks = await taskApi.getTasks();
      setTasks(fetchedTasks);
      setIsSandbox(false);
    } catch (err: any) {
      console.warn("Backend API not reachable, falling back to Sandbox Mode:", err);
      setIsSandbox(true);
      setApiHealth({ status: 'offline', database: 'disconnected' });
      
      const local = localStorage.getItem('sb100_sandbox_tasks');
      if (local) {
        setTasks(JSON.parse(local));
      } else {
        const initialTasks: Task[] = [
          {
            id: 1,
            title: 'Setup PostgreSQL connection',
            description: 'Configure DB_USER and DB_PASSWORD in sb-api/.env to connect to Cloud SQL.',
            completed: false,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Start Python FastAPI backend',
            description: 'Run the FastAPI application (e.g. using uvicorn main:app --reload) in the sb-api directory.',
            completed: false,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: 'Explore the workspace UI',
            description: 'Test adding, editing, completing, and deleting tasks here!',
            completed: true,
            created_at: new Date().toISOString()
          }
        ];
        setTasks(initialTasks);
        localStorage.setItem('sb100_sandbox_tasks', JSON.stringify(initialTasks));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSandboxTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('sb100_sandbox_tasks', JSON.stringify(updatedTasks));
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      if (isSandbox) {
        const newTask: Task = {
          id: Date.now(),
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          completed: false,
          created_at: new Date().toISOString()
        };
        const updated = [newTask, ...tasks];
        saveSandboxTasks(updated);
      } else {
        const created = await taskApi.createTask({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined
        });
        setTasks((prev) => [created, ...prev]);
      }
      setNewTitle('');
      setNewDescription('');
    } catch (err: any) {
      setError(`Failed to create task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newCompleted = !task.completed;
    try {
      if (isSandbox) {
        const updated = tasks.map((t) =>
          t.id === task.id ? { ...t, completed: newCompleted } : t
        );
        saveSandboxTasks(updated);
      } else {
        const updatedTask = await taskApi.updateTask(task.id, { completed: newCompleted });
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
      }
    } catch (err: any) {
      setError(`Failed to update task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      if (isSandbox) {
        const updated = tasks.filter((t) => t.id !== taskId);
        saveSandboxTasks(updated);
      } else {
        await taskApi.deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err: any) {
      setError(`Failed to delete task: ${err.message}`);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleSaveEdit = async (taskId: number) => {
    if (!editTitle.trim()) return;

    setIsUpdating(true);
    try {
      if (isSandbox) {
        const updated = tasks.map((t) =>
          t.id === taskId ? { ...t, title: editTitle.trim(), description: editDescription.trim() || null } : t
        );
        saveSandboxTasks(updated);
      } else {
        const updatedTask = await taskApi.updateTask(taskId, {
          title: editTitle.trim(),
          description: editDescription.trim() || null
        });
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      }
      setEditingTaskId(null);
    } catch (err: any) {
      setError(`Failed to edit task: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearSandboxTasks = () => {
    if (confirm("Are you sure you want to reset all tasks inside sandbox storage?")) {
      localStorage.removeItem('sb100_sandbox_tasks');
      loadTasks();
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

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'pending') {
      return matchesSearch && !task.completed;
    }
    if (statusFilter === 'completed') {
      return matchesSearch && task.completed;
    }
    return matchesSearch;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalTasks - completedCount;

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
            onClick={() => setActiveTab('workspace')}
            className={`py-5 px-1 cursor-pointer transition-all duration-150 ${
              activeTab === 'workspace'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'hover:text-slate-800'
            }`}
          >
            Workspace
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

          {activeTab === 'workspace' && (
            <motion.div
              key="workspace-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-5xl"
            >
              {/* Workspace Header Status Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">FastAPI Task Database</h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Endpoint: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  {isSandbox && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 animate-pulse" /> Sandbox Fallback Mode
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                      apiHealth?.database === 'connected'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    DB Connection:{' '}
                    {apiHealth?.database === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                  <button
                    onClick={loadTasks}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors duration-150"
                    title="Reload database connection"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-xl mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Quick stats and CRUD split layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Create Form & Quick Stats */}
                <div className="space-y-6">
                  {/* Task Summary Stat Panel */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Task Progress
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-2xl font-extrabold text-slate-800">{totalTasks}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
                      </div>
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                        <div className="text-2xl font-extrabold text-amber-600">{pendingCount}</div>
                        <div className="text-[10px] font-bold text-amber-400 uppercase">Pending</div>
                      </div>
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                        <div className="text-2xl font-extrabold text-emerald-600">{completedCount}</div>
                        <div className="text-[10px] font-bold text-emerald-400 uppercase">Done</div>
                      </div>
                    </div>
                  </div>

                  {/* Task Creation Form Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-blue-600" /> Add New Task
                    </h3>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Task Title *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g. Finish database schemas"
                          className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-xl border border-slate-200 outline-none py-2.5 px-3 transition-all duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-150"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Description (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          placeholder="Provide details about the task..."
                          className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-xl border border-slate-200 outline-none py-2.5 px-3 transition-all duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-150 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !newTitle.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>Create Task</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Side: Task Filter & Task List */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Search and Filters */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:max-w-xs">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 placeholder-slate-400 text-xs rounded-xl border border-slate-200 outline-none py-2.5 pl-9 pr-3 transition-all duration-150 focus:border-blue-500"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-1.5 self-stretch sm:self-auto justify-between sm:justify-start">
                      {(['all', 'pending', 'completed'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setStatusFilter(filter)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all duration-150 ${
                            statusFilter === filter
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3 min-h-[300px]">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Fetching database tasks...</span>
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="bg-white border border-slate-150 border-dashed rounded-2xl py-16 px-6 text-center shadow-sm">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
                          <Info className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-800 font-bold mb-1">No tasks found</h4>
                        <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                          {searchQuery
                            ? 'Try refining your query search or changing filters.'
                            : 'Tasks will appear here once added to the database.'}
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {filteredTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-200 ${
                              task.completed
                                ? 'border-emerald-100 bg-emerald-50/10'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {editingTaskId === task.id ? (
                              /* Inline Editing Mode */
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  maxLength={100}
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full bg-slate-50 focus:bg-white text-slate-800 text-sm font-bold rounded-xl border border-slate-200 outline-none py-2 px-3 focus:border-blue-500"
                                />
                                <textarea
                                  rows={2}
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full bg-slate-50 focus:bg-white text-slate-700 text-xs rounded-xl border border-slate-200 outline-none py-2 px-3 focus:border-blue-500 resize-none"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setEditingTaskId(null)}
                                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(task.id)}
                                    disabled={isUpdating || !editTitle.trim()}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5"
                                  >
                                    {isUpdating && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Read-only Mode */
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => handleToggleComplete(task)}
                                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                                  >
                                    {task.completed ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>
                                  <div>
                                    <h4
                                      className={`text-sm font-bold text-slate-800 ${
                                        task.completed ? 'line-through text-slate-400 font-medium' : ''
                                      }`}
                                    >
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p
                                        className={`text-xs text-slate-500 mt-1 leading-relaxed ${
                                          task.completed ? 'line-through text-slate-400/80' : ''
                                        }`}
                                      >
                                        {task.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-mono">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.created_at).toLocaleDateString([], {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 md:opacity-100 shrink-0">
                                  <button
                                    onClick={() => startEditing(task)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                                    title="Edit Task"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
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

                {/* Sandbox Management */}
                {isSandbox && (
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Sandbox Storage Management</h4>
                    <p className="text-xs text-slate-400 mb-3 leading-normal">
                      Resetting clear sandbox tasks will wipe the local storage task database clean and restore the original initialization tasks.
                    </p>
                    <button
                      onClick={clearSandboxTasks}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl transition-all"
                    >
                      Clear Sandbox Cache
                    </button>
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
              onClick={() => setActiveTab('workspace')}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Inspect Database Tasks
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


