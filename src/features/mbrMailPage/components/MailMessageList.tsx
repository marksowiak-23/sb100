import React from 'react';
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Mail,
  Star,
  Users,
  Archive,
  Trash2,
} from 'lucide-react';
import type { MailFolder, MbrMessageUpdate, MbrMessageView } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export type SortField = 'from' | 'subject' | 'received';
export type SortDir = 'asc' | 'desc';

interface MailMessageListProps {
  activeFolder: MailFolder;
  folderLabel: string;
  messages: MbrMessageView[];
  loading: boolean;
  searchQuery: string;
  unreadOnly: boolean;
  sortField: SortField;
  sortDir: SortDir;
  onSearchChange: (q: string) => void;
  onToggleUnreadOnly: () => void;
  onSortClick: (field: SortField) => void;
  onOpenMessage: (msg: MbrMessageView) => void;
  onUpdateFlag: (msg: MbrMessageView, patch: MbrMessageUpdate, toastText?: string) => void;
  getPrimaryParty: (m: MbrMessageView) => string;
}

const formatOutlookTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    const now = new Date();
    const isSameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (isSameDay) {
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    const isSameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString(
      undefined,
      isSameYear
        ? { month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: '2-digit' }
    );
  } catch {
    return '';
  }
};

export const MailMessageList: React.FC<MailMessageListProps> = ({
  activeFolder,
  folderLabel,
  messages,
  loading,
  searchQuery,
  unreadOnly,
  sortField,
  sortDir,
  onSearchChange,
  onToggleUnreadOnly,
  onSortClick,
  onOpenMessage,
  onUpdateFlag,
  getPrimaryParty,
}) => {
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Outlook-style Top Filter & Search Bar */}
      <div className="px-4 py-3 bg-[#FDFCFB] dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${folderLabel.toLowerCase()}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          {activeFolder !== 'sent' && (
            <button
              type="button"
              onClick={onToggleUnreadOnly}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold border transition-colors cursor-pointer ${
                unreadOnly
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{unreadOnly ? 'Unread Only' : 'All'}</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-400">
            {messages.length} {messages.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Outlook-Style Sortable Column Headers (From | Subject | Received) */}
      <div className="grid grid-cols-12 items-center px-3 py-2 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 select-none">
        <div className="col-span-4 sm:col-span-3 flex items-center pl-2 border-r border-slate-200/80 dark:border-slate-700 pr-2">
          <button
            type="button"
            onClick={() => onSortClick('from')}
            className="group inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <span>{activeFolder === 'sent' ? 'To' : 'From'}</span>
            <SortIndicator field="from" />
          </button>
        </div>

        <div className="col-span-5 sm:col-span-7 flex items-center px-3 border-r border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onSortClick('subject')}
            className="group inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <span>Subject</span>
            <SortIndicator field="subject" />
          </button>
        </div>

        <div className="col-span-3 sm:col-span-2 flex items-center justify-end pr-2">
          <button
            type="button"
            onClick={() => onSortClick('received')}
            className="group inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <span>{activeFolder === 'sent' ? 'Sent' : 'Received'}</span>
            <SortIndicator field="received" />
          </button>
        </div>
      </div>

      {/* Dense Scannable Outlook Rows */}
      <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-serif">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
            Loading {folderLabel.toLowerCase()}...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 px-6 text-center text-slate-400 font-serif space-y-2">
            <Mail className="w-9 h-9 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              No messages in {folderLabel}
            </p>
            <p className="text-xs max-w-xs mx-auto">
              {unreadOnly
                ? 'You are all caught up — no unread messages here.'
                : 'Click Compose Message to start a conversation with your connections.'}
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isUnread = !m.isReadFlag && activeFolder !== 'sent';
            const primaryParty = getPrimaryParty(m);

            return (
              <div
                key={m.mbrMessageId}
                onClick={() => onOpenMessage(m)}
                className={`group relative grid grid-cols-12 items-center px-3 py-2.5 cursor-pointer transition-colors ${
                  isUnread
                    ? 'bg-amber-50/45 dark:bg-amber-950/15 hover:bg-blue-50/60 dark:hover:bg-slate-800/80'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {isUnread && (
                  <span
                    className="absolute left-0 top-0.5 bottom-0.5 w-1 bg-amber-600 rounded-r-full"
                    aria-hidden="true"
                  />
                )}

                <div className="col-span-4 sm:col-span-3 flex items-center gap-1.5 pl-1 pr-2 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateFlag(m, { isStarredFlag: !m.isStarredFlag });
                    }}
                    aria-label={m.isStarredFlag ? 'Unstar message' : 'Star message'}
                    className="p-0.5 text-slate-300 hover:text-amber-500 shrink-0 cursor-pointer"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        m.isStarredFlag ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-sans truncate ${
                      isUnread
                        ? 'font-bold text-amber-900 dark:text-amber-300'
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {primaryParty}
                  </span>
                  {m.recipients.length > 1 && (
                    <Users className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </div>

                <div className="col-span-5 sm:col-span-7 px-3 min-w-0 flex items-baseline gap-2">
                  <span
                    className={`text-xs font-sans truncate shrink-0 max-w-[58%] ${
                      isUnread
                        ? 'font-bold text-amber-900 dark:text-amber-200'
                        : 'font-semibold text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {m.messageSubject}
                  </span>
                  {m.threadCount > 1 && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono shrink-0">
                      {m.threadCount}
                    </span>
                  )}
                  <span className="hidden sm:inline text-xs font-sans text-slate-400 dark:text-slate-500 truncate">
                    {m.messageBody.replace(/\s+/g, ' ')}
                  </span>
                </div>

                <div className="col-span-3 sm:col-span-2 flex items-center justify-end pr-2 gap-1">
                  <span
                    className={`text-[11px] font-sans whitespace-nowrap group-hover:hidden ${
                      isUnread
                        ? 'font-bold text-amber-800 dark:text-amber-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatOutlookTime(m.messageCreatedAt)}
                  </span>

                  <div className="hidden group-hover:flex items-center gap-1">
                    {activeFolder !== 'sent' && activeFolder !== 'trash' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateFlag(
                            m,
                            { isArchivedFlag: !m.isArchivedFlag },
                            m.isArchivedFlag ? 'Moved to Inbox' : 'Archived'
                          );
                        }}
                        title={m.isArchivedFlag ? 'Move to Inbox' : 'Archive'}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateFlag(
                          m,
                          activeFolder === 'trash' ? { isPurgedFlag: true } : { isDeletedFlag: true },
                          activeFolder === 'trash' ? 'Deleted permanently' : 'Moved to Trash'
                        );
                      }}
                      title={activeFolder === 'trash' ? 'Delete forever' : 'Move to Trash'}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AdminComponentTag name="MailMessageList" />
    </div>
  );
};
