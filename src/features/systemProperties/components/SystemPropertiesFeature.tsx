/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sliders, 
  Search, 
  RefreshCw, 
  Plus, 
  Check, 
  X, 
  Edit2, 
  Save, 
  Trash2, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  FileText,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { sysConfigApi, SysConfig } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import PageSeo from '@/src/components/PageSeo';

export default function SystemPropertiesFeature() {
  const [configs, setConfigs] = useState<SysConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeGroup, setActiveGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [savingTag, setSavingTag] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // New Property Form State
  const [newTag, setNewTag] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState('STRING');
  const [newGroup, setNewGroup] = useState('FEATURES');
  const [newDesc, setNewDesc] = useState('');

  // Load configs
  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sysConfigApi.getSysConfigs();
      setConfigs(data);
    } catch (err: any) {
      console.error('Failed to load system configs:', err);
      // Fallback
      setConfigs([
        { configId: 'cfg-1', configTag: 'FEATURE_MEMBER_REGISTRATION', configValue: 'true', configType: 'BOOLEAN', configGroup: 'FEATURES', configDesc: 'Allow new members to register publicly from the landing page', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-2', configTag: 'FEATURE_AUTO_SCROLL_PAGINATION', configValue: 'true', configType: 'BOOLEAN', configGroup: 'FEATURES', configDesc: 'Enable infinite scrolling on the public member directory', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-3', configTag: 'PUBLIC_PAGE_PAGE_SIZE', configValue: '5', configType: 'NUMBER', configGroup: 'LIMITS', configDesc: 'Number of member profile cards loaded per batch on public page', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-4', configTag: 'PUBLIC_PAGE_AUTO_SCROLL_LIMIT', configValue: '20', configType: 'NUMBER', configGroup: 'LIMITS', configDesc: 'Maximum auto-loaded members before showing Load More button', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-5', configTag: 'SYSTEM_APP_NAME', configValue: 'StoryBook', configType: 'STRING', configGroup: 'SYSTEM', configDesc: 'Application name displayed in headers, footers, and metadata', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-6', configTag: 'SUPPORT_EMAIL', configValue: 'support@storybook.ai', configType: 'STRING', configGroup: 'SYSTEM', configDesc: 'Primary support contact email', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-7', configTag: 'MAINTENANCE_MODE', configValue: 'false', configType: 'BOOLEAN', configGroup: 'SYSTEM', configDesc: 'Set to true to put the public portal into maintenance mode', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-8', configTag: 'SESSION_TIMEOUT_MINUTES', configValue: '30', configType: 'NUMBER', configGroup: 'SYSTEM', configDesc: 'Inactivity duration in minutes before user session times out', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() },
        { configId: 'cfg-9', configTag: 'SHOW_COMPONENT_NAME', configValue: 'true', configType: 'BOOLEAN', configGroup: 'UI', configDesc: 'Display React component names in the lower right-hand corner of panels', configCreatedAt: new Date().toISOString(), configUpdatedAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const showNotificationMessage = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleToggleBoolean = async (config: SysConfig) => {
    const nextVal = config.configValue.trim().toLowerCase() === 'true' ? 'false' : 'true';
    setSavingTag(config.configTag);
    try {
      const updated = await sysConfigApi.updateSysConfig(config.configTag, {
        configValue: nextVal,
        configUpdatedBy: 'AdminUI'
      });
      setConfigs(prev => prev.map(c => c.configTag === config.configTag ? updated : c));
      showNotificationMessage('success', `Updated ${config.configTag} to ${nextVal}`);
    } catch (err: any) {
      showNotificationMessage('error', `Failed to update ${config.configTag}: ${err.message}`);
    } finally {
      setSavingTag(null);
    }
  };

  const handleSaveEdit = async (configTag: string) => {
    setSavingTag(configTag);
    try {
      const updated = await sysConfigApi.updateSysConfig(configTag, {
        configValue: editValue,
        configDesc: editDesc || undefined,
        configUpdatedBy: 'AdminUI'
      });
      setConfigs(prev => prev.map(c => c.configTag === configTag ? updated : c));
      setEditingTag(null);
      showNotificationMessage('success', `Saved changes for ${configTag}`);
    } catch (err: any) {
      showNotificationMessage('error', `Failed to save: ${err.message}`);
    } finally {
      setSavingTag(null);
    }
  };

  const handleDelete = async (configTag: string) => {
    if (!confirm(`Are you sure you want to delete property tag '${configTag}'?`)) return;
    try {
      await sysConfigApi.deleteSysConfig(configTag);
      setConfigs(prev => prev.filter(c => c.configTag !== configTag));
      showNotificationMessage('success', `Deleted tag '${configTag}'`);
    } catch (err: any) {
      showNotificationMessage('error', `Failed to delete tag: ${err.message}`);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagFormatted = newTag.trim().toUpperCase().replace(/\s+/g, '_');
    if (!tagFormatted) {
      alert('Property tag name is required');
      return;
    }
    try {
      const created = await sysConfigApi.createSysConfig({
        configTag: tagFormatted,
        configValue: newValue.trim(),
        configType: newType,
        configGroup: newGroup,
        configDesc: newDesc.trim() || undefined,
        configUpdatedBy: 'AdminUI'
      });
      setConfigs(prev => [...prev, created]);
      setShowAddModal(false);
      setNewTag('');
      setNewValue('');
      setNewDesc('');
      showNotificationMessage('success', `Created new property '${tagFormatted}'`);
    } catch (err: any) {
      alert(`Failed to create property: ${err.message}`);
    }
  };

  const groups = ['ALL', 'FEATURES', 'LIMITS', 'SYSTEM', 'AUTHENTICATION', 'UI'];

  const filteredConfigs = configs.filter(c => {
    const matchesGroup = activeGroup === 'ALL' || c.configGroup?.toUpperCase() === activeGroup;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      c.configTag.toLowerCase().includes(query) ||
      (c.configDesc && c.configDesc.toLowerCase().includes(query)) ||
      c.configValue.toLowerCase().includes(query);
    return matchesGroup && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 relative">
      <PageSeo
        title="Dynamic System Configuration | StoryBook Admin"
        description="Manage runtime tag-value system configuration properties and feature flags."
      />

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg font-serif text-xs font-bold flex items-center gap-2.5 transition-all ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-blue-600 text-xs font-mono font-bold tracking-wider uppercase mb-1">
            <Sliders className="w-4 h-4" />
            <span>Runtime Dynamic Store</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-800 tracking-tight">
            System Properties & Feature Flags
          </h1>
          <p className="text-xs text-slate-500 font-serif max-w-xl mt-1">
            Properties are bootstrapped from the blueprint file at startup and persisted in Cloud SQL. Updates take effect immediately in memory without server restarts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loadConfigs}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#EFECE7] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-serif font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-serif font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#EFECE7] rounded-2xl p-3 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {groups.map(grp => (
            <button
              key={grp}
              type="button"
              onClick={() => setActiveGroup(grp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-colors cursor-pointer shrink-0 ${
                activeGroup === grp
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags or values..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-serif text-slate-400">
          <span>Active Properties ({filteredConfigs.length})</span>
          <span>In-Memory Sync: 0ms Overhead</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-serif text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <span>Loading dynamic configuration properties...</span>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="py-16 text-center font-serif text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">No properties found</p>
            <p className="text-xs">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredConfigs.map(cfg => {
              const isEditing = editingTag === cfg.configTag;
              const isSaving = savingTag === cfg.configTag;
              const isBool = cfg.configType?.toUpperCase() === 'BOOLEAN';
              const boolActive = cfg.configValue.trim().toLowerCase() === 'true';

              return (
                <div key={cfg.configTag} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Property Info */}
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {cfg.configTag}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {cfg.configType || 'STRING'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                        {cfg.configGroup || 'GENERAL'}
                      </span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className="w-full text-xs font-serif text-slate-600 border border-slate-200 rounded-lg px-2 py-1 mt-1"
                      />
                    ) : (
                      <p className="text-xs font-serif text-slate-500 leading-snug">
                        {cfg.configDesc || 'No description provided.'}
                      </p>
                    )}
                    {cfg.configUpdatedAt && (
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Updated: {new Date(cfg.configUpdatedAt).toLocaleString()} {cfg.configUpdatedBy ? `by ${cfg.configUpdatedBy}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Property Value Control */}
                  <div className="flex items-center gap-3 shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-1.5 text-xs font-mono border border-blue-400 rounded-xl bg-blue-50/30 w-44 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cfg.configTag)}
                          disabled={isSaving}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTag(null)}
                          className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isBool ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleBoolean(cfg)}
                          disabled={isSaving}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            boolActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              boolActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-700 w-12">
                          {boolActive ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl max-w-xs truncate">
                          {cfg.configValue}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTag(cfg.configTag);
                            setEditValue(cfg.configValue);
                            setEditDesc(cfg.configDesc || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cfg.configTag)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Tag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-slate-800">Add Property Tag</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-3">
              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Tag Identifier (UPPERCASE_SNAKE)
                </label>
                <input
                  type="text"
                  required
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. FEATURE_NEW_GALLERY"
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Initial Value
                </label>
                <input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. true or 15 or https://..."
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Data Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="STRING">STRING</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="NUMBER">NUMBER</option>
                    <option value="JSON">JSON</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Category Group
                  </label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="FEATURES">FEATURES</option>
                    <option value="LIMITS">LIMITS</option>
                    <option value="SYSTEM">SYSTEM</option>
                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                    <option value="UI">UI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain what this property controls..."
                  className="w-full text-xs font-serif px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-serif text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-serif font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminComponentTag name="SystemPropertiesFeature" />
    </div>
  );
}
