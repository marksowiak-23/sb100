import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Sparkles } from 'lucide-react';
import { Panel, PanelCreate } from '@/src/services/api';
import { CdSelect } from '@/src/components/CdSelect';
import { DynamicPanelCard } from '@/src/components/DynamicPanelCard';
import { useModalA11y } from '@/src/hooks/useModalA11y';

interface PanelEditorModalProps {
  isOpen: boolean;
  panel: Panel | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: PanelCreate, existingId?: string) => Promise<void>;
}

const toLocalDatetimeInput = (iso?: string | null): string => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

export const PanelEditorModal: React.FC<PanelEditorModalProps> = ({
  isOpen,
  panel,
  saving,
  onClose,
  onSave,
}) => {
  const [panelKey, setPanelKey] = useState('');
  const [panelLocationCd, setPanelLocationCd] = useState('GLOBAL_TOP');
  const [panelStyleCd, setPanelStyleCd] = useState('INFO');
  const [panelTitle, setPanelTitle] = useState('');
  const [panelBodyText, setPanelBodyText] = useState('');
  const [panelCtaLabel, setPanelCtaLabel] = useState('');
  const [panelCtaTarget, setPanelCtaTarget] = useState('');
  const [panelActiveFlag, setPanelActiveFlag] = useState(false);
  const [panelDismissibleFlag, setPanelDismissibleFlag] = useState(true);
  const [panelAudienceCd, setPanelAudienceCd] = useState('ALL');
  const [panelDisplayOrder, setPanelDisplayOrder] = useState(100);
  const [panelStartAt, setPanelStartAt] = useState('');
  const [panelEndAt, setPanelEndAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useModalA11y({ isOpen, onClose });

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    if (panel) {
      setPanelKey(panel.panelKey || '');
      setPanelLocationCd(panel.panelLocationCd || 'GLOBAL_TOP');
      setPanelStyleCd(panel.panelStyleCd || 'INFO');
      setPanelTitle(panel.panelTitle || '');
      setPanelBodyText(panel.panelBodyText || '');
      setPanelCtaLabel(panel.panelCtaLabel || '');
      setPanelCtaTarget(panel.panelCtaTarget || '');
      setPanelActiveFlag(Boolean(panel.panelActiveFlag));
      setPanelDismissibleFlag(panel.panelDismissibleFlag !== false);
      setPanelAudienceCd(panel.panelAudienceCd || 'ALL');
      setPanelDisplayOrder(panel.panelDisplayOrder ?? 100);
      setPanelStartAt(toLocalDatetimeInput(panel.panelStartAt));
      setPanelEndAt(toLocalDatetimeInput(panel.panelEndAt));
    } else {
      setPanelKey('');
      setPanelLocationCd('GLOBAL_TOP');
      setPanelStyleCd('INFO');
      setPanelTitle('');
      setPanelBodyText('');
      setPanelCtaLabel('');
      setPanelCtaTarget('');
      setPanelActiveFlag(false);
      setPanelDismissibleFlag(true);
      setPanelAudienceCd('ALL');
      setPanelDisplayOrder(100);
      setPanelStartAt('');
      setPanelEndAt('');
    }
  }, [isOpen, panel]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedKey = panelKey.trim().toUpperCase().replace(/\s+/g, '_');
    if (!formattedKey) {
      setFormError('Panel Key is required (e.g. SPRING_PROMO).');
      return;
    }
    if (!panelBodyText.trim()) {
      setFormError('Body Text is required.');
      return;
    }
    if (panelStartAt && panelEndAt && new Date(panelStartAt) > new Date(panelEndAt)) {
      setFormError('Schedule End time must be after Start time.');
      return;
    }

    const payload: PanelCreate = {
      panelKey: formattedKey,
      panelLocationCd: panelLocationCd || 'GLOBAL_TOP',
      panelStyleCd: panelStyleCd || 'INFO',
      panelTitle: panelTitle.trim() || null,
      panelBodyText: panelBodyText.trim(),
      panelCtaLabel: panelCtaLabel.trim() || null,
      panelCtaTarget: panelCtaTarget.trim() || null,
      panelActiveFlag,
      panelDismissibleFlag,
      panelAudienceCd: panelAudienceCd || 'ALL',
      panelDisplayOrder: Number.isFinite(Number(panelDisplayOrder)) ? Number(panelDisplayOrder) : 100,
      panelStartAt: panelStartAt ? new Date(panelStartAt).toISOString() : null,
      panelEndAt: panelEndAt ? new Date(panelEndAt).toISOString() : null,
      panelUpdatedBy: 'AdminUI',
    };

    try {
      await onSave(payload, panel?.panelId);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save panel.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={panel ? 'Edit Messaging Panel' : 'Create Messaging Panel'}
    >
      <div className="bg-white border border-[#EFECE7] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FDFCFB] border-b border-[#EFECE7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                {panel ? `Edit Panel: ${panel.panelKey}` : 'Create Messaging Panel'}
              </h2>
              <p className="text-xs text-slate-500 font-serif">
                Configure placement, style, schedule, and preview how members will see it.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Live Visual Preview */}
          <div className="bg-[#F6F3ED] border border-[#E7E2D8] rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Live Preview ({panelLocationCd})</span>
            </div>
            <DynamicPanelCard
              panel={{
                panelStyleCd,
                panelTitle: panelTitle.trim() || null,
                panelBodyText: panelBodyText.trim() || 'Your panel message preview will appear here as you type...',
                panelCtaLabel: panelCtaLabel.trim() || null,
                panelCtaTarget: panelCtaTarget.trim() || (panelCtaLabel.trim() ? '#' : null),
                panelDismissibleFlag,
              }}
              onDismiss={panelDismissibleFlag ? () => {} : undefined}
            />
          </div>

          {formError && (
            <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-serif font-semibold">
              {formError}
            </div>
          )}

          {/* Key & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">
                Panel Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={panelKey}
                onChange={(e) => setPanelKey(e.target.value)}
                placeholder="e.g. SPRING_CREDITS_PROMO"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">
                Display Order
              </label>
              <input
                type="number"
                value={panelDisplayOrder}
                onChange={(e) => setPanelDisplayOrder(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Location, Style, Audience via CdSelect */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">Site Location</label>
              <CdSelect
                tag="PANEL_LOCATION"
                value={panelLocationCd}
                onChange={(val) => setPanelLocationCd(val)}
                includeEmptyOption={false}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">Style Theme</label>
              <CdSelect
                tag="PANEL_STYLE"
                value={panelStyleCd}
                onChange={(val) => setPanelStyleCd(val)}
                includeEmptyOption={false}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">Target Audience</label>
              <CdSelect
                tag="PANEL_AUDIENCE"
                value={panelAudienceCd}
                onChange={(val) => setPanelAudienceCd(val)}
                includeEmptyOption={false}
              />
            </div>
          </div>

          {/* Title & Body Text */}
          <div className="space-y-1">
            <label className="block text-xs font-serif font-bold text-slate-700">
              Heading Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              placeholder="e.g. New Feature: Printed Hardcover StoryBooks"
              className="w-full px-3 py-2 text-sm font-serif bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-serif font-bold text-slate-700">
              Body Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={panelBodyText}
              onChange={(e) => setPanelBodyText(e.target.value)}
              placeholder="Write a clear, helpful message for members..."
              className="w-full px-3 py-2 text-sm font-serif bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Optional CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">
                CTA Button Label <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={panelCtaLabel}
                onChange={(e) => setPanelCtaLabel(e.target.value)}
                placeholder="e.g. Explore Credits"
                className="w-full px-3 py-2 text-xs font-serif bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">
                CTA Target <span className="text-slate-400 font-normal">(SPA tab or https:// URL)</span>
              </label>
              <input
                type="text"
                value={panelCtaTarget}
                onChange={(e) => setPanelCtaTarget(e.target.value)}
                placeholder="e.g. mbrAccountPage or https://realbackstory.com"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional Schedule Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">
                Schedule Start <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={panelStartAt}
                onChange={(e) => setPanelStartAt(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">
                Schedule End <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={panelEndAt}
                onChange={(e) => setPanelEndAt(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={panelActiveFlag}
                onChange={(e) => setPanelActiveFlag(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-xs font-serif font-bold text-slate-700">
                Active (publish immediately when within schedule)
              </span>
            </label>

            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={panelDismissibleFlag}
                onChange={(e) => setPanelDismissibleFlag(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-xs font-serif font-bold text-slate-700">
                Allow members to dismiss
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-serif font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-serif font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : panel ? 'Save Changes' : 'Create Panel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
