import React from 'react';
import {
  ArrowLeft,
  Star,
  MailOpen,
  Archive,
  RotateCcw,
  Trash2,
  RefreshCw,
  Reply,
  ReplyAll,
  Send,
} from 'lucide-react';
import {
  MailFolder,
  MbrMessageUpdate,
  MbrMessageView,
  resolveMediaUrl,
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MailMessageReaderProps {
  activeFolder: MailFolder;
  folderLabel: string;
  selectedMessage: MbrMessageView;
  threadMessages: MbrMessageView[];
  loadingThread: boolean;
  replyMode: 'reply' | 'replyAll' | null;
  replyBody: string;
  sending: boolean;
  hasMultipleOtherParticipants: boolean;
  onBack: () => void;
  onUpdateFlag: (msg: MbrMessageView, patch: MbrMessageUpdate, toastText?: string) => void;
  onSetReplyMode: (mode: 'reply' | 'replyAll' | null) => void;
  onReplyBodyChange: (body: string) => void;
  onSubmitReply: (e: React.FormEvent) => void;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'BM';

export const MailMessageReader: React.FC<MailMessageReaderProps> = ({
  activeFolder,
  folderLabel,
  selectedMessage,
  threadMessages,
  loadingThread,
  replyMode,
  replyBody,
  sending,
  hasMultipleOtherParticipants,
  onBack,
  onUpdateFlag,
  onSetReplyMode,
  onReplyBodyChange,
  onSubmitReply,
}) => {
  return (
    <div className="relative flex-1 flex flex-col bg-[#FDFCFB] dark:bg-slate-900">
      {/* Reader Top Action Bar */}
      <div className="px-4 sm:px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-sans font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {folderLabel}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onUpdateFlag(
                selectedMessage,
                { isStarredFlag: !selectedMessage.isStarredFlag },
                selectedMessage.isStarredFlag ? 'Removed star' : 'Starred'
              )
            }
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title={selectedMessage.isStarredFlag ? 'Unstar' : 'Star'}
          >
            <Star
              className={`w-4 h-4 ${
                selectedMessage.isStarredFlag ? 'fill-amber-400 text-amber-500' : ''
              }`}
            />
          </button>

          {activeFolder !== 'sent' && activeFolder !== 'trash' && (
            <>
              <button
                type="button"
                onClick={() =>
                  onUpdateFlag(selectedMessage, { isReadFlag: false }, 'Marked as unread')
                }
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Mark as Unread"
              >
                <MailOpen className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateFlag(
                    selectedMessage,
                    { isArchivedFlag: !selectedMessage.isArchivedFlag },
                    selectedMessage.isArchivedFlag ? 'Moved to Inbox' : 'Archived'
                  )
                }
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title={selectedMessage.isArchivedFlag ? 'Move to Inbox' : 'Archive'}
              >
                <Archive className="w-4 h-4" />
              </button>
            </>
          )}

          {activeFolder === 'trash' ? (
            <>
              <button
                type="button"
                onClick={() =>
                  onUpdateFlag(selectedMessage, { isDeletedFlag: false }, 'Restored from Trash')
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-sans font-semibold text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateFlag(selectedMessage, { isPurgedFlag: true }, 'Deleted permanently')
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-sans font-semibold text-white cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Forever</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                onUpdateFlag(selectedMessage, { isDeletedFlag: true }, 'Moved to Trash')
              }
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 cursor-pointer"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subject Heading */}
      <div className="px-5 pt-4 pb-2">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-white leading-snug">
          {selectedMessage.messageSubject}
        </h2>
      </div>

      {/* Chronological Thread Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
        {loadingThread ? (
          <div className="py-12 text-center text-xs text-slate-400 font-serif">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
            Loading conversation...
          </div>
        ) : (
          threadMessages.map((msg) => {
            const avatarUrl = msg.senderProfilePic ? resolveMediaUrl(msg.senderProfilePic) : null;
            return (
              <div
                key={msg.mbrMessageId}
                className="bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={msg.senderName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(msg.senderName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-serif font-bold text-slate-800 dark:text-white truncate flex items-center gap-2">
                        <span>{msg.senderName}</span>
                        {msg.isSupportMessage && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold">
                            SUPPORT
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans truncate">
                        To: {msg.recipients.map((r) => r.displayName).join(', ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(msg.messageCreatedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="text-sm font-serif text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {msg.messageBody}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inline Reply / Reply All Box */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        {!replyMode ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSetReplyMode('reply')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
            {hasMultipleOtherParticipants && (
              <button
                type="button"
                onClick={() => onSetReplyMode('replyAll')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-sans font-bold transition-colors cursor-pointer"
              >
                <ReplyAll className="w-3.5 h-3.5" />
                <span>Reply All</span>
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmitReply} className="space-y-3">
            <div className="flex items-center justify-between text-xs font-sans text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {replyMode === 'replyAll' ? 'Replying to all participants' : 'Replying to sender'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onSetReplyMode(null);
                  onReplyBodyChange('');
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <textarea
              rows={4}
              value={replyBody}
              onChange={(e) => onReplyBodyChange(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-3.5 py-2.5 text-sm font-serif bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold transition-colors cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <AdminComponentTag name="MailMessageReader" />
    </div>
  );
};
