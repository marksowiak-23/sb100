import type { MailFolder, MbrMessageCreate, MbrMessageUpdate, MbrMessageView } from '@/src/services/api';

const SANDBOX_MAIL_KEY = 'sb_sandbox_mbr_mail';

export interface ConnectableMember {
  mbrId: string;
  displayName: string;
  profilePic?: string | null;
}

export const SANDBOX_CONNECTIONS: ConnectableMember[] = [
  { mbrId: 'm-eleanor', displayName: 'Eleanor Vance', profilePic: null },
  { mbrId: 'm-james', displayName: 'James Sterling', profilePic: null },
  { mbrId: 'm-claire', displayName: 'Claire Hartwell', profilePic: null },
  { mbrId: 'm-daniel', displayName: 'Daniel Hartwell', profilePic: null },
];

const getInitialSandboxMail = (selfMbrId: string, selfName: string): MbrMessageView[] => {
  const now = Date.now();
  return [
    {
      mbrMessageId: 'sb-msg-1',
      mbrMessageThreadId: 'sb-thread-1',
      parentMessageId: null,
      senderMbrId: 'm-eleanor',
      senderName: 'Eleanor Vance',
      senderProfilePic: null,
      mbrStoryId: null,
      messageSubject: 'Loved your latest childhood memoir chapter!',
      messageBody:
        'Hi there!\n\nI just finished reading your story about summers on the Oregon coast. The details about your grandfather teaching you to mend nets brought back so many memories of my own summers by the lake.\n\nCan’t wait to read the next chapter!',
      recipients: [
        { mbrId: selfMbrId, displayName: selfName, profilePic: null, recipientTypeCd: 'TO', isReadFlag: false },
      ],
      viewerRole: 'RECIPIENT',
      isReadFlag: false,
      readAt: null,
      isStarredFlag: true,
      isArchivedFlag: false,
      isDeletedFlag: false,
      threadCount: 1,
      messageCreatedAt: new Date(now - 2 * 3600 * 1000).toISOString(),
      messageUpdatedAt: new Date(now - 2 * 3600 * 1000).toISOString(),
    },
    {
      mbrMessageId: 'sb-msg-2',
      mbrMessageThreadId: 'sb-thread-2',
      parentMessageId: null,
      senderMbrId: 'm-james',
      senderName: 'James Sterling',
      senderProfilePic: null,
      mbrStoryId: null,
      messageSubject: 'Pacific Coast road trip photos',
      messageBody:
        'Hey everyone,\n\nI finally digitized the old photos from our Highway 1 trip! Let me know if you want me to share the album with the whole family circle before we put together our printed book.',
      recipients: [
        { mbrId: selfMbrId, displayName: selfName, profilePic: null, recipientTypeCd: 'TO', isReadFlag: true },
        { mbrId: 'm-claire', displayName: 'Claire Hartwell', profilePic: null, recipientTypeCd: 'TO', isReadFlag: true },
      ],
      viewerRole: 'RECIPIENT',
      isReadFlag: true,
      readAt: new Date(now - 20 * 3600 * 1000).toISOString(),
      isStarredFlag: false,
      isArchivedFlag: false,
      isDeletedFlag: false,
      threadCount: 1,
      messageCreatedAt: new Date(now - 24 * 3600 * 1000).toISOString(),
      messageUpdatedAt: new Date(now - 24 * 3600 * 1000).toISOString(),
    },
  ];
};

export const loadSandboxMail = (selfMbrId: string, selfName: string): MbrMessageView[] => {
  try {
    const raw = sessionStorage.getItem(SANDBOX_MAIL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = getInitialSandboxMail(selfMbrId, selfName);
  try {
    sessionStorage.setItem(SANDBOX_MAIL_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
};

export const saveSandboxMail = (items: MbrMessageView[]) => {
  try {
    sessionStorage.setItem(SANDBOX_MAIL_KEY, JSON.stringify(items));
  } catch {}
};

export const filterSandboxFolder = (items: MbrMessageView[], folder: MailFolder, q?: string): MbrMessageView[] => {
  const query = (q || '').toLowerCase().trim();
  return items
    .filter((m) => {
      if (folder === 'inbox') return m.viewerRole !== 'SENDER' && !m.isDeletedFlag && !m.isArchivedFlag;
      if (folder === 'sent') return m.viewerRole !== 'RECIPIENT' && !m.isDeletedFlag;
      if (folder === 'starred') return m.isStarredFlag && !m.isDeletedFlag;
      if (folder === 'archive') return m.viewerRole !== 'SENDER' && m.isArchivedFlag && !m.isDeletedFlag;
      if (folder === 'trash') return m.isDeletedFlag;
      return false;
    })
    .filter((m) => {
      if (!query) return true;
      return (
        m.messageSubject.toLowerCase().includes(query) ||
        m.messageBody.toLowerCase().includes(query) ||
        m.senderName.toLowerCase().includes(query) ||
        m.recipients.some((r) => r.displayName.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => new Date(b.messageCreatedAt).getTime() - new Date(a.messageCreatedAt).getTime());
};

export const sendSandboxMail = (
  selfMbrId: string,
  selfName: string,
  payload: MbrMessageCreate,
  knownContacts: ConnectableMember[]
): MbrMessageView => {
  const all = loadSandboxMail(selfMbrId, selfName);
  const now = new Date().toISOString();
  const id = `sb-msg-${Date.now()}`;
  const threadId = payload.mbrMessageThreadId || id;
  const lookup = new Map(knownContacts.map((c) => [c.mbrId, c]));
  const recipients = [
    ...payload.recipientMbrIds.map((rid) => ({
      mbrId: rid,
      displayName: lookup.get(rid)?.displayName || 'Connected Member',
      profilePic: lookup.get(rid)?.profilePic || null,
      recipientTypeCd: 'TO',
      isReadFlag: false,
    })),
    ...(payload.ccMbrIds || []).map((rid) => ({
      mbrId: rid,
      displayName: lookup.get(rid)?.displayName || 'Connected Member',
      profilePic: lookup.get(rid)?.profilePic || null,
      recipientTypeCd: 'CC',
      isReadFlag: false,
    })),
  ];

  const created: MbrMessageView = {
    mbrMessageId: id,
    mbrMessageThreadId: threadId,
    parentMessageId: payload.parentMessageId || null,
    senderMbrId: selfMbrId,
    senderName: selfName,
    senderProfilePic: null,
    mbrStoryId: payload.mbrStoryId || null,
    messageSubject: payload.messageSubject.trim(),
    messageBody: payload.messageBody.trim(),
    recipients,
    viewerRole: 'SENDER',
    isReadFlag: true,
    readAt: now,
    isStarredFlag: false,
    isArchivedFlag: false,
    isDeletedFlag: false,
    threadCount: all.filter((m) => m.mbrMessageThreadId === threadId).length + 1,
    messageCreatedAt: now,
    messageUpdatedAt: now,
  };

  saveSandboxMail([created, ...all]);
  return created;
};

export const updateSandboxMailFlags = (
  selfMbrId: string,
  selfName: string,
  messageId: string,
  patch: MbrMessageUpdate
): MbrMessageView[] => {
  const all = loadSandboxMail(selfMbrId, selfName);
  const next = patch.isPurgedFlag
    ? all.filter((m) => m.mbrMessageId !== messageId)
    : all.map((m) =>
        m.mbrMessageId === messageId
          ? {
              ...m,
              isReadFlag: patch.isReadFlag !== undefined ? patch.isReadFlag : m.isReadFlag,
              isStarredFlag: patch.isStarredFlag !== undefined ? patch.isStarredFlag : m.isStarredFlag,
              isArchivedFlag: patch.isArchivedFlag !== undefined ? patch.isArchivedFlag : m.isArchivedFlag,
              isDeletedFlag: patch.isDeletedFlag !== undefined ? patch.isDeletedFlag : m.isDeletedFlag,
              messageUpdatedAt: new Date().toISOString(),
            }
          : m
      );
  saveSandboxMail(next);
  return next;
};
