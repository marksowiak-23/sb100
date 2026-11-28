/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HelpCategoryId =
  | 'getting-started'
  | 'stories-authoring'
  | 'books-audio'
  | 'connections-messaging'
  | 'account-credits'
  | 'privacy-security';

export interface HelpFaqItem {
  id: string;
  category: HelpCategoryId;
  question: string;
  summary: string;
  steps?: string[];
  answer: string;
  tip?: string;
  tags: string[];
}

export interface HelpCategoryMeta {
  id: HelpCategoryId;
  title: string;
  subtitle: string;
  description: string;
  accentGradient: string;
  activeBox: string;
  activeIconBg: string;
  activeCheck: string;
  badgeClass: string;
}

export const HELP_CATEGORIES: HelpCategoryMeta[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    subtitle: 'Profile, Navigation & Tours',
    description: 'Learn how to personalize your BackStory profile, navigate your workspace, and make the most of guided tours.',
    accentGradient: 'from-[#13547A] to-blue-600',
    activeBox: 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs',
    activeIconBg: 'bg-[#13547A] text-white shadow-xs',
    activeCheck: 'text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'stories-authoring',
    title: 'Writing & Stories',
    subtitle: 'Drafts, StoryMate AI & Photos',
    description: 'Everything you need to capture memories, use Topic Sparks, co-write with StoryMate, and enrich stories with photos.',
    accentGradient: 'from-amber-600 to-orange-500',
    activeBox: 'bg-amber-50/90 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shadow-xs',
    activeIconBg: 'bg-amber-600 text-white shadow-xs',
    activeCheck: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'books-audio',
    title: 'Books & Audio',
    subtitle: 'Printable Books & AI Voice',
    description: 'Compile your published stories into heirloom hardcover or paperback books and create lifelike AI voice narrations.',
    accentGradient: 'from-purple-600 to-indigo-600',
    activeBox: 'bg-purple-50/90 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 shadow-xs',
    activeIconBg: 'bg-purple-600 text-white shadow-xs',
    activeCheck: 'text-purple-600 dark:text-purple-400',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'connections-messaging',
    title: 'Connections & Messaging',
    subtitle: 'Family, Groups & Private Mail',
    description: 'Connect with loved ones, organize contacts into Groups, and exchange private messages inside BackStory.',
    accentGradient: 'from-emerald-600 to-teal-500',
    activeBox: 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-xs',
    activeIconBg: 'bg-emerald-600 text-white shadow-xs',
    activeCheck: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'account-credits',
    title: 'Account & Credits',
    subtitle: 'Story, Voice & Image Credits',
    description: 'Understand how Story, Voice, and Image credits work, how to top up your balance, and how to review your ledger.',
    accentGradient: 'from-teal-600 to-cyan-600',
    activeBox: 'bg-teal-50/90 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 shadow-xs',
    activeIconBg: 'bg-teal-600 text-white shadow-xs',
    activeCheck: 'text-teal-600 dark:text-teal-400',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'privacy-security',
    title: 'Privacy & Security',
    subtitle: 'MFA, Passwords & Visibility',
    description: 'Protect your account with Email MFA and Trusted Devices, manage your password, and control who can see your stories.',
    accentGradient: 'from-indigo-600 to-slate-800',
    activeBox: 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-xs',
    activeIconBg: 'bg-indigo-600 text-white shadow-xs',
    activeCheck: 'text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
];

export const HELP_FAQ_ITEMS: HelpFaqItem[] = [
  // Getting Started
  {
    id: 'gs-profile',
    category: 'getting-started',
    question: 'How do I complete or update my BackStory profile?',
    summary: 'Add your photo, bio, hometown, and life chapters so family and friends recognize you.',
    answer: 'Your profile introduces you to your connections and anchors your personal timeline across BackStory.',
    steps: [
      'Click your avatar ("Me") in the top navigation bar and select My Profile.',
      'Upload a profile photo and fill in your introduction, hometown, and biographical details.',
      'Click Save Changes — your updates appear immediately on your Author page and Home dashboard.',
    ],
    tip: 'You can customize who sees each section of your profile at any time under Me → My Privacy.',
    tags: ['profile', 'avatar', 'bio', 'photo', 'setup'],
  },
  {
    id: 'gs-theme',
    category: 'getting-started',
    question: 'How do I change my workspace theme or writing preferences?',
    summary: 'Switch between Default, Dark, Rustic, Luxury, or Tech themes and choose your AI StoryMate persona.',
    answer: 'BackStory lets you tailor the look and feel of your writing studio to match your mood.',
    steps: [
      'Open the Me menu in the top-right corner and select My Preferences.',
      'Pick your preferred visual theme and default StoryMate writing companion.',
      'Your selection is saved automatically and applied every time you sign in.',
    ],
    tags: ['theme', 'dark mode', 'preferences', 'storymate', 'appearance'],
  },
  {
    id: 'gs-tours',
    category: 'getting-started',
    question: 'How do I replay a guided page tour?',
    summary: 'Use the interactive Tour button on major pages for a quick walkthrough.',
    answer: 'Many BackStory pages include an interactive guided tour that highlights key buttons and features step by step.',
    steps: [
      'Look for the Tour button near the top-right header of the page (for example, Account Tour on My Account).',
      'Click it to walk through each highlighted control at your own pace.',
    ],
    tags: ['tour', 'coach marks', 'walkthrough', 'onboarding', 'guide'],
  },

  // Writing & Stories
  {
    id: 'st-create',
    category: 'stories-authoring',
    question: 'How do I write and publish my first story?',
    summary: 'Start from a life topic on your Author page, write your draft, and publish when ready.',
    answer: 'Your Author page organizes your memories by meaningful life topics such as Family, Trips, Education, Career, Special Events, and Custom Topics.',
    steps: [
      'Click Author in the top navigation bar and choose a life topic.',
      'Click New Story to open the Story Editor, enter a title, and write your memory.',
      'Save as a Draft anytime while editing, or click Publish to share it with your permitted connections.',
    ],
    tip: 'Not sure where to begin? Click a Topic Spark prompt for an instant memory-jogging question.',
    tags: ['write', 'story', 'draft', 'publish', 'author', 'topic sparks'],
  },
  {
    id: 'st-storymate',
    category: 'stories-authoring',
    question: 'How does StoryMate AI co-writing work?',
    summary: 'Brainstorm details, polish prose, or expand bullet points while keeping your authentic voice.',
    answer: 'StoryMate is your built-in writing assistant inside the Story Editor. It can help you outline a memory, smooth out phrasing, or ask follow-up questions to draw out vivid details — without replacing your own voice.',
    steps: [
      'Open any story in the Story Editor and launch the StoryMate panel.',
      'Share a few notes, a rough draft, or ask StoryMate to interview you about a moment.',
      'Review any suggested paragraphs and insert or edit only what feels true to you.',
    ],
    tags: ['ai', 'storymate', 'co-writing', 'assistant', 'edit'],
  },
  {
    id: 'st-photos',
    category: 'stories-authoring',
    question: 'How do I add photos or AI-generated illustrations to a story?',
    summary: 'Upload cherished family photos or generate custom artwork right inside the editor.',
    answer: 'Visuals bring stories to life. You can upload photos from your device, select existing photos from your Albums, or use AI Story Photo Generation to illustrate a scene you no longer have a photo of.',
    steps: [
      'Inside the Story Editor, open the Photo / Media section.',
      'Upload an image from your computer or choose one from your BackStory Photo Albums.',
      'Add a caption and choose a layout style to frame your story.',
    ],
    tags: ['photos', 'images', 'albums', 'upload', 'ai photo', 'media'],
  },

  // Books & Audio
  {
    id: 'ba-book',
    category: 'books-audio',
    question: 'How do I turn my stories into a printed Story Book?',
    summary: 'Select chapters, design your cover, preview the PDF, and order a physical copy.',
    answer: 'BackStory compiles your selected stories and photos into a professionally typeset hardcover or paperback keepsake book.',
    steps: [
      'Open your Author page and launch the Story Book Generator.',
      'Choose which published stories to include, arrange chapter order, and customize the cover title and style.',
      'Generate a live PDF preview to proofread every page before placing a print order.',
    ],
    tags: ['book', 'print', 'pdf', 'hardcover', 'paperback', 'chapters'],
  },
  {
    id: 'ba-voice',
    category: 'books-audio',
    question: 'How do I create AI Voice Narration for my stories?',
    summary: 'Listen to your stories read aloud or preserve your own voice profile.',
    answer: 'Voice Narration turns your written chapters into warm audio recordings that family members can play directly from the Stories feed.',
    steps: [
      'Set up or choose a voice profile under My Profile → Voice Studio.',
      'Open a published story and click Generate Audio Narration.',
      'Once rendered, anyone with permission to read the story can press Play to listen.',
    ],
    tags: ['voice', 'audio', 'narration', 'voice clone', 'listen'],
  },

  // Connections & Messaging
  {
    id: 'cm-connect',
    category: 'connections-messaging',
    question: 'How do I connect with family and friends and organize Groups?',
    summary: 'Send connection invitations and group contacts (Family, Friends, Colleagues, or custom groups).',
    answer: 'Connections let you share private stories and exchange messages with people you trust.',
    steps: [
      'Click Connections in the top navigation bar.',
      'Search for a member by name and send a connection invitation, or accept pending invitations.',
      'Assign connections to Groups (such as Family or Close Friends) to make story privacy effortless.',
    ],
    tags: ['connections', 'friends', 'family', 'groups', 'invite'],
  },
  {
    id: 'cm-messaging',
    category: 'connections-messaging',
    question: 'How do I send a private message to one or more connections?',
    summary: 'Use the Messaging inbox to write individual or group messages to your connected members.',
    answer: 'BackStory Messaging provides a clean, Outlook-style inbox where you can message one or many connected members, reply to threads, star important notes, and organize folders (Inbox, Starred, Sent, Archive, Trash).',
    steps: [
      'Click Messaging in the top navigation bar.',
      'Click New Message, select one or more connected members in the To/CC field, add a subject and message, and click Send.',
      'Click any row in your message list to read the full conversation thread and Reply or Reply All.',
    ],
    tip: 'For your privacy, you can only send and receive messages with members you are connected with.',
    tags: ['messaging', 'mail', 'inbox', 'reply', 'thread', 'private message'],
  },

  // Account & Credits
  {
    id: 'ac-credits',
    category: 'account-credits',
    question: 'What are Story Credits, Voice Credits, and Image Credits?',
    summary: 'Each credit balance powers a different creative studio inside BackStory.',
    answer: 'New members receive complimentary starter credits upon registration. Story Credits power AI co-writing and book formatting; Voice Credits power AI audio narration; and Image Credits power AI story illustrations and Living Photos.',
    steps: [
      'Open Me → My Account to view your current balances and activity ledger.',
      'Switch between My Story Credits, My Voice Credits, and My Image Credits in the left sidebar.',
      'Select any credit package to securely top up via Stripe Checkout whenever you need more.',
    ],
    tags: ['credits', 'billing', 'stripe', 'balance', 'story credits', 'voice credits', 'image credits'],
  },

  // Privacy & Security
  {
    id: 'ps-mfa',
    category: 'privacy-security',
    question: 'How does Two-Factor Authentication (Email MFA) and Trusted Devices work?',
    summary: 'Email MFA is automatically enabled for all BackStory members, with a 30-day Trusted Device option.',
    answer: 'To keep your stories and personal memories safe, Email Two-Factor Authentication (MFA) is automatically enabled for every BackStory member — no manual setup required. Whenever you sign in from a new or unrecognized browser, BackStory emails a one-time 6-digit security code to your verified address.',
    steps: [
      'Sign in with your email and password, then enter the 6-digit code sent to your inbox.',
      'On your personal computer or phone, leave "Trust this device for 30 days" checked so you won’t be asked for a code on that browser for the next 30 days.',
      'To review your remembered browsers or revoke access anytime, open Me → My Security → My Trusted Devices.',
    ],
    tip: 'Avoid checking "Trust this device" on shared or public computers. You can revoke all trusted devices at once from My Security.',
    tags: ['mfa', '2fa', 'two-factor', 'trusted device', 'email verification', 'security'],
  },
  {
    id: 'ps-password',
    category: 'privacy-security',
    question: 'How do I change my password or recover a forgotten login?',
    summary: 'Update your password in My Security, or use Forgot username? / Forgot password? on Sign In.',
    answer: 'You can change your password anytime while signed in, or reset it securely via email if you get locked out.',
    steps: [
      'While signed in: go to Me → My Security → My Password, enter your current password and new password (8+ characters), and click Update Password.',
      'If signed out: click Forgot password? on the Sign In screen to receive a 6-digit reset code, or click Forgot username? to have your sign-in email reminded to your inbox.',
    ],
    tip: 'Check "Revoke all trusted devices" when changing your password if you ever suspect someone else used your account.',
    tags: ['password', 'change password', 'forgot password', 'forgot username', 'reset', 'login'],
  },
  {
    id: 'ps-privacy',
    category: 'privacy-security',
    question: 'Who can see my stories and personal life topics?',
    summary: 'You control visibility globally, by Group, and by individual Connection.',
    answer: 'Draft stories are always 100% private to you. When you publish a story, BackStory checks your Privacy Settings, Group permissions, and any per-connection overrides so only the people you choose can read it.',
    steps: [
      'Open Me → My Privacy to configure default visibility for your profile, topics, and stories.',
      'Use individual Story or Album privacy settings whenever you want a specific memory shared only with a select group (such as Family).',
    ],
    tags: ['privacy', 'visibility', 'permissions', 'private', 'public', 'memorial'],
  },
];
