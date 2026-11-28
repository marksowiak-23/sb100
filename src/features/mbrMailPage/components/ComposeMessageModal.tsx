import React, { useEffect, useMemo, useState } from 'react';
import { X, Send, Search, Users, UserPlus, Check } from 'lucide-react';
import { MbrMessageCreate, resolveMediaUrl } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { useModalA11y } from '@/src/hooks/useModalA11y';
import type { ConnectableMember } from '../utils/sandboxMail';

interface ComposeMessageModalProps {
  isOpen: boolean;
  connections: ConnectableMember[];
  initialRecipients?: ConnectableMember[];
  initialSubject?: string;
  sending: boolean;
  onClose: () => void;
  onSend: (payload: MbrMessageCreate) => Promise<void>;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'BM';

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  isOpen,
  connections,
  initialRecipients = [],
  initialSubject = '',
  sending,
  onClose,
  onSend,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useModalA11y({ isOpen, onClose });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(initialRecipients.map((r) => r.mbrId));
    setSubject(initialSubject || '');
    setBody('');
    setRecipientQuery('');
    setError(null);
    setShowPicker(initialRecipients.length === 0);
  }, [isOpen, initialRecipients, initialSubject]);

  const connectionMap = useMemo(() => {
    const m = new Map<string, ConnectableMember>();
    for (const c of connections) m.set(c.mbrId, c);
    for (const r of initialRecipients) {
      if (!m.has(r.mbrId)) m.set(r.mbrId, r);
    }
    return m;
  }, [connections, initialRecipients]);

  const filteredConnections = useMemo(() => {
    const q = recipientQuery.toLowerCase().trim();
    return connections.filter((c) => !q || c.displayName.toLowerCase().includes(q));
  }, [connections, recipientQuery]);

  if (!isOpen) return null;

  const toggleRecipient = (mbrId: string) => {
    setSelectedIds((prev) =>
      prev.includes(mbrId) ? prev.filter((id) => id !== mbrId) : [...prev, mbrId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError('Please select at least one connected member to message.');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a subject line.');
      return;
    }
    if (!body.trim()) {
      setError('Please write a message before sending.');
      return;
    }
    setError(null);
    try {
      await onSend({
        recipientMbrIds: selectedIds,
        messageSubject: subject.trim(),
        messageBody: body.trim(),
      });
    } catch (err: any) {
      setError(err?.message || 'Could not send message.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Compose New Message"
    >
      <div className="relative bg-white border border-[#EFECE7] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FDFCFB] border-b border-[#EFECE7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-800">New Message</h2>
              <p className="text-xs text-slate-500 font-serif">
                Send a private note to one or more of your BackStory connections.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close compose dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-serif font-semibold">
              {error}
            </div>
          )}

          {/* Multi-Recipient Chip Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold text-slate-700">
                To <span className="text-slate-400 font-normal">({selectedIds.length} selected)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPicker((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-serif font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showPicker ? 'Hide Connections' : 'Add Recipients'}</span>
              </button>
            </div>

            {/* Selected Recipient Chips */}
            <div className="min-h-[42px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center gap-1.5">
              {selectedIds.length === 0 ? (
                <span className="text-xs text-slate-400 font-serif">
                  Choose one or more connected members below...
                </span>
              ) : (
                selectedIds.map((id) => {
                  const member = connectionMap.get(id);
                  const label = member?.displayName || 'Connected Member';
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-serif font-semibold"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => toggleRecipient(id)}
                        aria-label={`Remove ${label}`}
                        className="p-0.5 rounded-full hover:bg-blue-200/70 text-blue-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>

            {/* Searchable Connections Dropdown */}
            {showPicker && (
              <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={recipientQuery}
                    onChange={(e) => setRecipientQuery(e.target.value)}
                    placeholder="Search your connections..."
                    className="w-full text-xs bg-transparent focus:outline-none font-sans"
                  />
                  {connections.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIds(
                          selectedIds.length === connections.length
                            ? []
                            : connections.map((c) => c.mbrId)
                        )
                      }
                      className="text-[11px] font-serif font-semibold text-blue-600 hover:underline shrink-0 cursor-pointer"
                    >
                      {selectedIds.length === connections.length ? 'Clear All' : 'Select All'}
                    </button>
                  )}
                </div>

                <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                  {filteredConnections.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-serif flex flex-col items-center gap-1">
                      <Users className="w-5 h-5 text-slate-300" />
                      <span>
                        {connections.length === 0
                          ? 'You have no connected members yet. Connect with friends or family first.'
                          : 'No matching connections found.'}
                      </span>
                    </div>
                  ) : (
                    filteredConnections.map((c) => {
                      const checked = selectedIds.includes(c.mbrId);
                      const avatarUrl = c.profilePic ? resolveMediaUrl(c.profilePic) : null;
                      return (
                        <button
                          key={c.mbrId}
                          type="button"
                          onClick={() => toggleRecipient(c.mbrId)}
                          className={`w-full px-3 py-2 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                            checked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={c.displayName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                                {getInitials(c.displayName)}
                              </div>
                            )}
                            <span className="text-xs font-serif font-semibold text-slate-800 truncate">
                              {c.displayName}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                              checked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="block text-xs font-serif font-bold text-slate-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="What is this message about?"
              className="w-full px-3.5 py-2 text-sm font-serif bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1">
            <label className="block text-xs font-serif font-bold text-slate-700">Message</label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="w-full px-3.5 py-2.5 text-sm font-serif bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 leading-relaxed"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-serif font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-serif font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : selectedIds.length > 1 ? `Send to ${selectedIds.length} Members` : 'Send Message'}</span>
            </button>
          </div>
        </form>
        <AdminComponentTag name="ComposeMessageModal" />
      </div>
    </div>
  );
};
