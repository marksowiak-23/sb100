import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Inbox,
  Send,
  Star,
  Archive,
  Trash2,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  MailFolder,
  MbrMessageCreate,
  MbrMessageUpdate,
  MbrMessageView,
  mbrMessageApi,
  taskApi,
} from '@/src/services/api';
import { userManager } from '@/src/services/userManager';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { ComposeMessageModal } from './ComposeMessageModal';
import { MailPageHeaderPanel } from './MailPageHeaderPanel';
import { MailFoldersMenu, MailFolderMeta } from './MailFoldersMenu';
import { MailFolderHeader } from './MailFolderHeader';
import { MailMessageList, SortDir, SortField } from './MailMessageList';
import { MailMessageReader } from './MailMessageReader';
import { MailRightColumn } from './MailRightColumn';
import {
  ConnectableMember,
  SANDBOX_CONNECTIONS,
  filterSandboxFolder,
  loadSandboxMail,
  sendSandboxMail,
  updateSandboxMailFlags,
} from '../utils/sandboxMail';

interface MbrMailFeatureProps {
  isSandbox: boolean;
  onClickBack?: () => void;
}

const FOLDERS: MailFolderMeta[] = [
  { id: 'inbox', label: 'Inbox', description: 'Private messages from your connected BackStory circle.', Icon: Inbox },
  { id: 'starred', label: 'Starred', description: 'Important conversations you pinned for quick access.', Icon: Star },
  { id: 'sent', label: 'Sent', description: 'Messages and replies you have sent to connections.', Icon: Send },
  { id: 'archive', label: 'Archive', description: 'Conversations saved out of your main inbox.', Icon: Archive },
  { id: 'trash', label: 'Trash', description: 'Deleted messages you can restore or remove permanently.', Icon: Trash2 },
];

export const MbrMailFeature: React.FC<MbrMailFeatureProps> = ({ isSandbox }) => {
  const storedMbr = userManager.getStoredMember();
  const selfMbrId = storedMbr?.mbrId || 'm-self';
  const selfName =
    [storedMbr?.mbrFirstName, storedMbr?.mbrLastName].filter(Boolean).join(' ').trim() ||
    'BackStory Member';

  const [activeFolder, setActiveFolder] = useState<MailFolder>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('received');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const [messages, setMessages] = useState<MbrMessageView[]>([]);
  const [inboxUnreadBadge, setInboxUnreadBadge] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<MbrMessageView | null>(null);
  const [threadMessages, setThreadMessages] = useState<MbrMessageView[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);

  const [connections, setConnections] = useState<ConnectableMember[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInitialRecipients, setComposeInitialRecipients] = useState<ConnectableMember[]>([]);
  const [composeInitialSubject, setComposeInitialSubject] = useState('');
  const [sending, setSending] = useState(false);

  const [replyMode, setReplyMode] = useState<'reply' | 'replyAll' | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3200);
  };

  const broadcastMailUpdated = () => {
    window.dispatchEvent(new CustomEvent('mbr-mail-updated'));
  };

  const openCompose = () => {
    setComposeInitialRecipients([]);
    setComposeInitialSubject('');
    setComposeOpen(true);
  };

  const handleSelectFolder = (folder: MailFolder) => {
    setActiveFolder(folder);
    setSelectedMessage(null);
    setThreadMessages([]);
    setReplyMode(null);
  };

  // Load connected members once for the multi-recipient Compose picker
  useEffect(() => {
    let mounted = true;
    const loadConnections = async () => {
      if (isSandbox) {
        if (mounted) setConnections(SANDBOX_CONNECTIONS);
        return;
      }
      try {
        const [outgoing, incoming, allMembers] = await Promise.all([
          taskApi.getMemberConnections({ mbrId: selfMbrId, limit: 200 }),
          taskApi.getMemberConnections({ connectedMbrId: selfMbrId, limit: 200 }),
          taskApi.getMembers(),
        ]);
        const connectedIds = new Set<string>();
        for (const c of outgoing || []) {
          if (c.mbrConnectionMbrId && c.mbrConnectionMbrId !== selfMbrId) {
            connectedIds.add(c.mbrConnectionMbrId);
          }
        }
        for (const c of incoming || []) {
          if (c.mbrId && c.mbrId !== selfMbrId) {
            connectedIds.add(c.mbrId);
          }
        }
        const mbrList = (allMembers || [])
          .filter((m) => connectedIds.has(m.mbrId))
          .map((m) => ({
            mbrId: m.mbrId,
            displayName:
              [m.mbrFirstName, m.mbrLastName].filter(Boolean).join(' ').trim() ||
              'BackStory Member',
            profilePic: m.mbrProfilePic || null,
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        if (mounted) setConnections(mbrList);
      } catch (err) {
        console.warn('Could not load member connections for mail picker:', err);
        if (mounted) setConnections([]);
      }
    };
    void loadConnections();
    return () => {
      mounted = false;
    };
  }, [isSandbox, selfMbrId]);

  const loadFolder = useCallback(
    async (folder: MailFolder, query: string) => {
      setLoading(true);
      try {
        if (isSandbox) {
          const all = loadSandboxMail(selfMbrId, selfName);
          const inboxItems = filterSandboxFolder(all, 'inbox', '');
          setInboxUnreadBadge(inboxItems.filter((m) => !m.isReadFlag).length);
          setMessages(filterSandboxFolder(all, folder, query));
        } else {
          const [list, summary] = await Promise.all([
            mbrMessageApi.getFolder(folder, query),
            mbrMessageApi.getUnreadSummary().catch(() => null),
          ]);
          setMessages(Array.isArray(list) ? list : []);
          if (summary && typeof summary.unreadCount === 'number') {
            setInboxUnreadBadge(summary.unreadCount);
          }
        }
      } catch (err) {
        console.warn('Could not load mail folder, using sandbox fallback:', err);
        const all = loadSandboxMail(selfMbrId, selfName);
        setInboxUnreadBadge(filterSandboxFolder(all, 'inbox', '').filter((m) => !m.isReadFlag).length);
        setMessages(filterSandboxFolder(all, folder, query));
      } finally {
        setLoading(false);
      }
    },
    [isSandbox, selfMbrId, selfName]
  );

  useEffect(() => {
    void loadFolder(activeFolder, searchQuery);
  }, [activeFolder, searchQuery, loadFolder]);

  useEffect(() => {
    const onOpenCompose = (e: Event) => {
      const detail = (e as CustomEvent<{ recipients?: ConnectableMember[]; subject?: string }>).detail;
      setComposeInitialRecipients(detail?.recipients || []);
      setComposeInitialSubject(detail?.subject || '');
      setComposeOpen(true);
    };
    window.addEventListener('open-compose-mail', onOpenCompose);
    return () => window.removeEventListener('open-compose-mail', onOpenCompose);
  }, []);

  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'received' ? 'desc' : 'asc');
    }
  };

  const getPrimaryParty = useCallback(
    (m: MbrMessageView) =>
      activeFolder === 'sent'
        ? m.recipients.map((r) => r.displayName).join(', ') || 'Recipients'
        : m.senderName,
    [activeFolder]
  );

  const displayedMessages = useMemo(() => {
    const base = unreadOnly && activeFolder !== 'sent'
      ? messages.filter((m) => !m.isReadFlag)
      : messages;

    return [...base].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'from') {
        cmp = getPrimaryParty(a).localeCompare(getPrimaryParty(b), undefined, { sensitivity: 'base' });
      } else if (sortField === 'subject') {
        cmp = (a.messageSubject || '').localeCompare(b.messageSubject || '', undefined, { sensitivity: 'base' });
      } else {
        cmp = new Date(a.messageCreatedAt).getTime() - new Date(b.messageCreatedAt).getTime();
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [messages, unreadOnly, activeFolder, sortField, sortDir, getPrimaryParty]);

  const openThread = async (msg: MbrMessageView) => {
    setSelectedMessage(msg);
    setReplyMode(null);
    setReplyBody('');
    setLoadingThread(true);
    try {
      const wasUnread = !msg.isReadFlag && activeFolder !== 'sent';
      if (isSandbox) {
        if (!msg.isReadFlag) {
          updateSandboxMailFlags(selfMbrId, selfName, msg.mbrMessageId, { isReadFlag: true });
        }
        const all = loadSandboxMail(selfMbrId, selfName);
        const thread = all
          .filter((m) => m.mbrMessageThreadId === msg.mbrMessageThreadId)
          .sort((a, b) => new Date(a.messageCreatedAt).getTime() - new Date(b.messageCreatedAt).getTime());
        setThreadMessages(thread);
        setMessages((prev) =>
          prev.map((m) => (m.mbrMessageId === msg.mbrMessageId ? { ...m, isReadFlag: true } : m))
        );
      } else {
        const thread = await mbrMessageApi.getThread(msg.mbrMessageThreadId);
        setThreadMessages(Array.isArray(thread) ? thread : [msg]);
        setMessages((prev) =>
          prev.map((m) =>
            m.mbrMessageThreadId === msg.mbrMessageThreadId ? { ...m, isReadFlag: true } : m
          )
        );
      }
      if (wasUnread) {
        setInboxUnreadBadge((c) => Math.max(0, c - 1));
      }
      broadcastMailUpdated();
    } catch {
      setThreadMessages([msg]);
    } finally {
      setLoadingThread(false);
    }
  };

  const handleComposeSend = async (payload: MbrMessageCreate) => {
    setSending(true);
    try {
      if (isSandbox) {
        sendSandboxMail(selfMbrId, selfName, payload, connections);
      } else {
        await mbrMessageApi.send(payload);
      }
      setComposeOpen(false);
      broadcastMailUpdated();
      notify(
        'success',
        `Message sent to ${payload.recipientMbrIds.length} member${payload.recipientMbrIds.length > 1 ? 's' : ''}`
      );
      if (activeFolder === 'sent') {
        void loadFolder('sent', searchQuery);
      }
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyBody.trim() || !replyMode) return;
    const latest = threadMessages[threadMessages.length - 1] || selectedMessage;

    const targetSet = new Set<string>();
    if (latest.senderMbrId && latest.senderMbrId !== selfMbrId) {
      targetSet.add(latest.senderMbrId);
    }
    if (replyMode === 'replyAll' || targetSet.size === 0) {
      for (const r of latest.recipients) {
        if (r.mbrId !== selfMbrId) targetSet.add(r.mbrId);
      }
    }
    const supportTicketId =
      latest.supportTicketId ||
      threadMessages.find((m) => m.supportTicketId)?.supportTicketId ||
      undefined;
    const recipientMbrIds = Array.from(targetSet);
    if (recipientMbrIds.length === 0 && !supportTicketId) {
      notify('error', 'No other participants to reply to on this thread.');
      return;
    }

    const subj = latest.messageSubject.toLowerCase().startsWith('re:')
      ? latest.messageSubject
      : `Re: ${latest.messageSubject}`;

    setSending(true);
    try {
      const payload: MbrMessageCreate = {
        recipientMbrIds,
        messageSubject: subj,
        messageBody: replyBody.trim(),
        mbrMessageThreadId: latest.mbrMessageThreadId,
        parentMessageId: latest.mbrMessageId,
        supportTicketId,
      };
      let created: MbrMessageView;
      if (isSandbox) {
        created = sendSandboxMail(selfMbrId, selfName, payload, connections);
      } else {
        created = await mbrMessageApi.send(payload);
      }
      setThreadMessages((prev) => [...prev, created]);
      setReplyBody('');
      setReplyMode(null);
      broadcastMailUpdated();
      notify('success', replyMode === 'replyAll' ? 'Reply All sent' : 'Reply sent');
    } catch (err: any) {
      notify('error', err?.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateFlag = async (msg: MbrMessageView, patch: MbrMessageUpdate, toastText?: string) => {
    try {
      if (isSandbox) {
        updateSandboxMailFlags(selfMbrId, selfName, msg.mbrMessageId, patch);
      } else {
        await mbrMessageApi.updateFlags(msg.mbrMessageId, patch);
      }
      broadcastMailUpdated();
      if (toastText) notify('success', toastText);

      await loadFolder(activeFolder, searchQuery);
      if (patch.isDeletedFlag || patch.isArchivedFlag || patch.isPurgedFlag || patch.isReadFlag === false) {
        setSelectedMessage(null);
        setThreadMessages([]);
      } else if (selectedMessage?.mbrMessageId === msg.mbrMessageId) {
        setSelectedMessage((prev) => (prev ? { ...prev, ...patch } : null));
      }
    } catch (err: any) {
      notify('error', err?.message || 'Could not update message.');
    }
  };

  const activeFolderMeta = FOLDERS.find((f) => f.id === activeFolder) || FOLDERS[0];
  const latestInThread = threadMessages[threadMessages.length - 1] || selectedMessage;
  const hasMultipleOtherParticipants = useMemo(() => {
    if (!latestInThread) return false;
    const others = new Set<string>();
    if (latestInThread.senderMbrId !== selfMbrId) others.add(latestInThread.senderMbrId);
    for (const r of latestInThread.recipients) {
      if (r.mbrId !== selfMbrId) others.add(r.mbrId);
    }
    return others.size > 1;
  }, [latestInThread, selfMbrId]);

  return (
    <div className="max-w-7xl w-full mx-auto relative">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg font-serif text-xs font-bold flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Mobile Folder Bar (< lg) */}
      <div className="lg:hidden mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {FOLDERS.map(({ id, label, Icon }) => {
              const isActive = activeFolder === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectFolder(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold shrink-0 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  {id === 'inbox' && inboxUnreadBadge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'}`}>
                      {inboxUnreadBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={openCompose}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* 3-Column Connections-Style Grid: Left (3) | Center (6) | Right (3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <MailPageHeaderPanel onCompose={openCompose} />
          <MailFoldersMenu
            folders={FOLDERS}
            activeFolder={activeFolder}
            inboxUnreadBadge={inboxUnreadBadge}
            onSelectFolder={handleSelectFolder}
          />
        </aside>

        {/* CENTER COLUMN */}
        <main className="lg:col-span-6 min-w-0 space-y-5">
          <MailFolderHeader
            folder={activeFolderMeta}
            loading={loading}
            onSync={() => void loadFolder(activeFolder, searchQuery)}
          />

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden min-h-[540px] flex flex-col">
            {!selectedMessage ? (
              <MailMessageList
                activeFolder={activeFolder}
                folderLabel={activeFolderMeta.label}
                messages={displayedMessages}
                loading={loading}
                searchQuery={searchQuery}
                unreadOnly={unreadOnly}
                sortField={sortField}
                sortDir={sortDir}
                onSearchChange={setSearchQuery}
                onToggleUnreadOnly={() => setUnreadOnly((v) => !v)}
                onSortClick={handleSortClick}
                onOpenMessage={(m) => void openThread(m)}
                onUpdateFlag={(m, patch, toastText) => void handleUpdateFlag(m, patch, toastText)}
                getPrimaryParty={getPrimaryParty}
              />
            ) : (
              <MailMessageReader
                activeFolder={activeFolder}
                folderLabel={activeFolderMeta.label}
                selectedMessage={selectedMessage}
                threadMessages={threadMessages}
                loadingThread={loadingThread}
                replyMode={replyMode}
                replyBody={replyBody}
                sending={sending}
                hasMultipleOtherParticipants={hasMultipleOtherParticipants}
                onBack={() => {
                  setSelectedMessage(null);
                  setThreadMessages([]);
                  setReplyMode(null);
                }}
                onUpdateFlag={(m, patch, toastText) => void handleUpdateFlag(m, patch, toastText)}
                onSetReplyMode={setReplyMode}
                onReplyBodyChange={setReplyBody}
                onSubmitReply={(e) => void handleQuickReply(e)}
              />
            )}
          </div>
        </main>

        {/* RIGHT COLUMN */}
        <aside className="hidden lg:block lg:col-span-3">
          <MailRightColumn />
        </aside>
      </div>

      <ComposeMessageModal
        isOpen={composeOpen}
        connections={connections}
        initialRecipients={composeInitialRecipients}
        initialSubject={composeInitialSubject}
        sending={sending}
        onClose={() => setComposeOpen(false)}
        onSend={handleComposeSend}
      />

      <AdminComponentTag name="MbrMailFeature" />
    </div>
  );
};
