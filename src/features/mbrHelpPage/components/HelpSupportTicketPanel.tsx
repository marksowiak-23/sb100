/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
  MessageSquare,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import {
  supportTicketApi,
  SupportTicketSummary,
  SupportAttachmentInput,
} from '@/src/services/api';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface HelpSupportTicketPanelProps {
  isSandbox?: boolean;
  onBackToHelp: () => void;
  onOpenMessaging?: () => void;
}

const SANDBOX_TICKETS_KEY = 'sb_sandbox_support_tickets';
const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const STATUS_BADGES: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-800 border-amber-200',
  WAITING_ON_MEMBER: 'bg-purple-50 text-purple-700 border-purple-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function HelpSupportTicketPanel({
  isSandbox = false,
  onBackToHelp,
  onOpenMessaging,
}: HelpSupportTicketPanelProps) {
  const [categoryCd, setCategoryCd] = useState('GENERAL_INQUIRY');
  const [priorityCd, setPriorityCd] = useState('NORMAL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);

  const [myTickets, setMyTickets] = useState<SupportTicketSummary[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentMbrId = (): string | undefined => {
    try {
      const mbrStr = sessionStorage.getItem('sb_current_mbr');
      if (mbrStr) return JSON.parse(mbrStr)?.mbrId;
    } catch {}
    return undefined;
  };

  const loadMyTickets = async () => {
    setLoadingTickets(true);
    try {
      if (isSandbox) {
        const raw = sessionStorage.getItem(SANDBOX_TICKETS_KEY);
        setMyTickets(raw ? JSON.parse(raw) : []);
      } else {
        const list = await supportTicketApi.listMyTickets();
        setMyTickets(Array.isArray(list) ? list : []);
      }
    } catch {
      setMyTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    void loadMyTickets();
  }, [isSandbox]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const incoming: File[] = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const next = [...selectedFiles];
    for (const f of incoming) {
      if (next.length >= MAX_FILES) {
        setError(`You can attach up to ${MAX_FILES} files per support request.`);
        break;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setError(`"${f.name}" exceeds the 10 MB file size limit.`);
        continue;
      }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) {
        next.push(f);
      }
    }
    setSelectedFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatedTicketNumber(null);

    if (!subject.trim() || subject.trim().length < 2) {
      setError('Please enter a subject for your support request.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Please provide details about your inquiry.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSandbox) {
        const num = `SB-${1001 + myTickets.length}`;
        const mockTicket: SupportTicketSummary = {
          ticketId: `sandbox-ticket-${Date.now()}`,
          ticketNumber: num,
          mbrId: getCurrentMbrId() || 'sandbox-mbr',
          memberName: 'Sandbox Member',
          categoryCd,
          priorityCd,
          statusCd: 'OPEN',
          subject: subject.trim(),
          description: description.trim(),
          mbrMessageThreadId: `sandbox-thread-${Date.now()}`,
          messageCount: 1,
          attachmentCount: selectedFiles.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [mockTicket, ...myTickets];
        sessionStorage.setItem(SANDBOX_TICKETS_KEY, JSON.stringify(updated));
        setMyTickets(updated);
        setCreatedTicketNumber(num);
        setSubject('');
        setDescription('');
        setSelectedFiles([]);
        return;
      }

      const mbrId = getCurrentMbrId();
      const uploadedAttachments: SupportAttachmentInput[] = [];
      for (const file of selectedFiles) {
        const uploaded = await supportTicketApi.uploadAttachment(file, mbrId);
        uploadedAttachments.push(uploaded);
      }

      const created = await supportTicketApi.createTicket({
        categoryCd: categoryCd || 'GENERAL_INQUIRY',
        priorityCd,
        subject: subject.trim(),
        description: description.trim(),
        attachments: uploadedAttachments,
      });

      setCreatedTicketNumber(created.ticketNumber);
      setSubject('');
      setDescription('');
      setSelectedFiles([]);
      await loadMyTickets();
    } catch (err: any) {
      setError(err?.message || 'Unable to submit your support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0F1B35] to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              Submit a Support Request
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our operations team will review your ticket and send replies directly to your BackStory Messaging inbox.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBackToHelp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Help Articles</span>
        </button>
      </div>

      {/* Confirmation Banner */}
      {createdTicketNumber && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Support Ticket {createdTicketNumber} Submitted!</div>
              <p className="mt-0.5">
                Our support team has received your inquiry. When an agent replies, it will appear in your{' '}
                <strong>Messaging</strong> inbox and we&rsquo;ll also notify you by email.
              </p>
            </div>
          </div>
          {onOpenMessaging && (
            <button
              type="button"
              onClick={onOpenMessaging}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer shrink-0 self-start sm:self-auto"
            >
              Open Messaging
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Support Ticket Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Topic Category <span className="text-rose-500">*</span>
            </label>
            <CdSelect
              tag="supportTicketCategory"
              value={categoryCd}
              onChange={(val) => setCategoryCd(val || 'GENERAL_INQUIRY')}
              placeholder="Select a support category..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              value={priorityCd}
              onChange={(e) => setPriorityCd(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="LOW">Low — General question</option>
              <option value="NORMAL">Normal — Standard request</option>
              <option value="HIGH">High — Affecting my work</option>
              <option value="URGENT">Urgent — Account or billing issue</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your question or issue"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            maxLength={10000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what you need help with, including any steps or details that might help our team assist you quickly..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-serif leading-relaxed"
          />
        </div>

        {/* Document Attachments */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Attachments (Optional — PDF, TXT, PNG, JPG, WebP; max 5 files, 10 MB each)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedFiles.length >= MAX_FILES}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach Document or Screenshot</span>
            </button>

            {selectedFiles.map((file, idx) => (
              <span
                key={`${file.name}-${idx}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[160px] truncate font-medium">{file.name}</span>
                <span className="text-[10px] font-mono text-blue-500">
                  ({Math.max(1, Math.round(file.size / 1024))} KB)
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-0.5 hover:text-rose-600 cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Ticket...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Support Request</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* My Submitted Tickets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>My Support Tickets ({myTickets.length})</span>
          </h2>
          {onOpenMessaging && myTickets.length > 0 && (
            <button
              type="button"
              onClick={onOpenMessaging}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>View Replies in Messaging</span>
            </button>
          )}
        </div>

        {loadingTickets ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
            Loading your support tickets...
          </div>
        ) : myTickets.length === 0 ? (
          <p className="text-xs text-slate-400 font-serif italic py-4 text-center">
            You haven&rsquo;t submitted any support tickets yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {myTickets.map((t) => (
              <div key={t.ticketId} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-blue-700 dark:text-blue-400">
                      {t.ticketNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        STATUS_BADGES[t.statusCd] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {t.statusCd.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{t.categoryCd.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                    {t.subject}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Submitted {new Date(t.createdAt).toLocaleDateString()} • {t.messageCount} message{t.messageCount === 1 ? '' : 's'}
                    {t.attachmentCount > 0 ? ` • ${t.attachmentCount} attachment${t.attachmentCount === 1 ? '' : 's'}` : ''}
                  </div>
                </div>

                {onOpenMessaging && (
                  <button
                    type="button"
                    onClick={onOpenMessaging}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Messaging</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminComponentTag name="HelpSupportTicketPanel" />
    </div>
  );
}
