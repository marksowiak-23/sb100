import React, { useEffect, useMemo, useState } from 'react';
import {
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { Panel, PanelCreate, panelApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { DynamicPanelCard } from '@/src/components/DynamicPanelCard';
import { PanelEditorModal } from './PanelEditorModal';

const SANDBOX_PANELS_KEY = 'sb_sandbox_panels';

interface AdminPanelsFeatureProps {
  isSandbox?: boolean;
}

const getPanelStatus = (panel: Panel): 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE' => {
  if (!panel.panelActiveFlag) return 'INACTIVE';
  const now = Date.now();
  if (panel.panelStartAt && new Date(panel.panelStartAt).getTime() > now) return 'SCHEDULED';
  if (panel.panelEndAt && new Date(panel.panelEndAt).getTime() < now) return 'EXPIRED';
  return 'ACTIVE';
};

const loadSandboxPanels = (): Panel[] => {
  try {
    const raw = sessionStorage.getItem(SANDBOX_PANELS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const saveSandboxPanels = (items: Panel[]) => {
  try {
    sessionStorage.setItem(SANDBOX_PANELS_KEY, JSON.stringify(items));
  } catch {}
};

export const AdminPanelsFeature: React.FC<AdminPanelsFeatureProps> = ({ isSandbox = false }) => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const broadcastUpdate = () => {
    window.dispatchEvent(new CustomEvent('panels-updated'));
  };

  const loadPanels = async () => {
    setLoading(true);
    try {
      if (isSandbox) {
        setPanels(loadSandboxPanels());
      } else {
        const data = await panelApi.getAll();
        setPanels(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.warn('Could not load panels from API, falling back to Sandbox store:', err);
      setPanels(loadSandboxPanels());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPanels();
  }, [isSandbox]);

  const handleToggleActive = async (panel: Panel) => {
    const nextActive = !panel.panelActiveFlag;
    setTogglingId(panel.panelId);
    try {
      if (isSandbox) {
        const updatedList = panels.map((p) =>
          p.panelId === panel.panelId
            ? { ...p, panelActiveFlag: nextActive, panelUpdatedAt: new Date().toISOString() }
            : p
        );
        setPanels(updatedList);
        saveSandboxPanels(updatedList);
      } else {
        const updated = await panelApi.update(panel.panelId, {
          panelActiveFlag: nextActive,
          panelUpdatedBy: 'AdminUI',
        });
        setPanels((prev) => prev.map((p) => (p.panelId === panel.panelId ? updated : p)));
      }
      broadcastUpdate();
      notify('success', `${panel.panelKey} is now ${nextActive ? 'ACTIVE' : 'INACTIVE'}`);
    } catch (err: any) {
      notify('error', `Failed to update ${panel.panelKey}: ${err?.message || 'Unknown error'}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleSavePanel = async (payload: PanelCreate, existingId?: string) => {
    setSaving(true);
    try {
      if (isSandbox) {
        const now = new Date().toISOString();
        let nextList: Panel[];
        if (existingId) {
          nextList = panels.map((p) =>
            p.panelId === existingId ? { ...p, ...payload, panelUpdatedAt: now } : p
          );
        } else {
          const created: Panel = {
            ...payload,
            panelId: `sandbox-panel-${Date.now()}`,
            panelCreatedAt: now,
            panelUpdatedAt: now,
          };
          nextList = [created, ...panels];
        }
        setPanels(nextList);
        saveSandboxPanels(nextList);
      } else if (existingId) {
        const updated = await panelApi.update(existingId, payload);
        setPanels((prev) => prev.map((p) => (p.panelId === existingId ? updated : p)));
      } else {
        const created = await panelApi.create(payload);
        setPanels((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditingPanel(null);
      broadcastUpdate();
      notify('success', existingId ? `Saved changes to ${payload.panelKey}` : `Created panel ${payload.panelKey}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePanel = async (panel: Panel) => {
    if (!confirm(`Delete messaging panel '${panel.panelKey}'?`)) return;
    try {
      if (isSandbox) {
        const nextList = panels.filter((p) => p.panelId !== panel.panelId);
        setPanels(nextList);
        saveSandboxPanels(nextList);
      } else {
        await panelApi.delete(panel.panelId);
        setPanels((prev) => prev.filter((p) => p.panelId !== panel.panelId));
      }
      broadcastUpdate();
      notify('success', `Deleted panel '${panel.panelKey}'`);
    } catch (err: any) {
      notify('error', `Failed to delete: ${err?.message || 'Unknown error'}`);
    }
  };

  const locations = useMemo(() => {
    const base = [
      'ALL',
      'GLOBAL_TOP',
      'PUBLIC_HERO',
      'MBR_HOME_TOP',
      'MBR_HOME_BELOW_WELCOME',
      'MBR_AUTHOR_TOP',
      'MBR_FEED_TOP',
      'MBR_CONNECTIONS_TOP',
      'MBR_ACCOUNT_TOP',
      'MBR_PROFILE_TOP',
    ];
    for (const p of panels) {
      if (p.panelLocationCd && !base.includes(p.panelLocationCd)) {
        base.push(p.panelLocationCd);
      }
    }
    return base;
  }, [panels]);

  const filteredPanels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return panels.filter((p) => {
      if (locationFilter !== 'ALL' && p.panelLocationCd !== locationFilter) return false;
      const st = getPanelStatus(p);
      if (statusFilter !== 'ALL' && st !== statusFilter) return false;
      if (!q) return true;
      return (
        p.panelKey.toLowerCase().includes(q) ||
        (p.panelTitle || '').toLowerCase().includes(q) ||
        p.panelBodyText.toLowerCase().includes(q) ||
        p.panelLocationCd.toLowerCase().includes(q)
      );
    });
  }, [panels, locationFilter, statusFilter, searchQuery]);

  const activeCount = useMemo(
    () => panels.filter((p) => getPanelStatus(p) === 'ACTIVE').length,
    [panels]
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 relative">
      {/* Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg font-serif text-xs font-bold flex items-center gap-2.5 ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-mono font-bold tracking-wider uppercase mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Dynamic Site Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-800 tracking-tight">
            Site Messaging Panels
          </h1>
          <p className="text-xs text-slate-500 font-serif max-w-xl mt-1">
            Dynamically enable, style, target, and schedule announcement panels across BackStory. Changes take effect immediately across live slots.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void loadPanels()}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#EFECE7] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-serif font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPanel(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-serif font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Panel</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#EFECE7] rounded-2xl p-3.5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'ACTIVE', 'SCHEDULED', 'INACTIVE', 'EXPIRED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            aria-label="Filter by site location"
            className="px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === 'ALL' ? 'All Locations' : loc}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search key, title, or text..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Panels List */}
      <div className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-serif text-slate-400">
          <span>
            Showing {filteredPanels.length} of {panels.length} panels
          </span>
          <span className="font-semibold text-emerald-700">
            {activeCount} Live Active
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 font-serif text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <span>Loading site messaging panels...</span>
          </div>
        ) : filteredPanels.length === 0 ? (
          <div className="py-16 text-center font-serif text-slate-400 space-y-2">
            <Megaphone className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No messaging panels found</p>
            <p className="text-xs">Click &ldquo;New Panel&rdquo; to create your first site-wide or page-specific announcement.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPanels.map((panel) => {
              const status = getPanelStatus(panel);
              const statusPill =
                status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : status === 'SCHEDULED'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : status === 'EXPIRED'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <div
                  key={panel.panelId}
                  className="border border-slate-200/80 rounded-2xl p-4 space-y-3 bg-[#FDFCFB]"
                >
                  {/* Metadata Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {panel.panelKey}
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${statusPill}`}>
                        {status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {panel.panelLocationCd}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        <Users className="w-3 h-3 text-slate-400" />
                        {panel.panelAudienceCd}
                      </span>
                      {(panel.panelStartAt || panel.panelEndAt) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Scheduled
                        </span>
                      )}
                    </div>

                    {/* Controls: Active Toggle, Edit, Delete */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={panel.panelActiveFlag}
                        disabled={togglingId === panel.panelId}
                        onClick={() => void handleToggleActive(panel)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-60 ${
                          panel.panelActiveFlag ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={panel.panelActiveFlag ? 'Disable panel' : 'Enable panel'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                            panel.panelActiveFlag ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPanel(panel);
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-serif font-bold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeletePanel(panel)}
                        aria-label={`Delete ${panel.panelKey}`}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Live Card Preview */}
                  <DynamicPanelCard
                    panel={panel}
                    compact
                    onDismiss={panel.panelDismissibleFlag ? () => {} : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PanelEditorModal
        isOpen={modalOpen}
        panel={editingPanel}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditingPanel(null);
        }}
        onSave={handleSavePanel}
      />

      <AdminComponentTag name="AdminPanelsFeature" />
    </div>
  );
};
