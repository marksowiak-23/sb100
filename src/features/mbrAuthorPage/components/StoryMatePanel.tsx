import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, HelpCircle, Check, Users } from 'lucide-react';
import { chatApi, adminDbApi, taskApi, resolveMediaUrl, mbrAiUsageLogApi } from '@/src/services/api';
import { AdminComponentTag, useShowComponentName } from '@/src/components/AdminComponentTag';


interface Message {
  sender: 'cassie' | 'user';
  text: string;
  isDraftSnippet?: boolean;
}

interface StoryMatePanelProps {
  memberName?: string;
  componentName?: string;
  topicId?: string;
  storyTitle?: string;
  storyContent?: string;
  mbrStoryThreadID?: string;
  chIntentId?: string;
  onClose?: () => void;
  onApplyStory?: (content: string) => void;
}

const FALLBACK_PERSONAS = [
  { chWriterId: 'f332c26a-7545-46e1-b6f0-65d04bd5f6d6', chWriterName: 'Everyday Eddie', chWriterDesc: 'Common & Informal', chWriterPrompt: 'Use the “Everyday Eddie” writing mode. Write in a casual, conversational style with simple language and a friendly tone. Avoid jargon. Keep explanations easy, relatable, and down to earth, like a helpful friend talking over coffee.', chWriterProfilePic: '/avatars/persona_everyday_eddie.jpg' },
  { chWriterId: 'a9355333-b0e7-4e35-a77e-6956fdaf889a', chWriterName: 'Clarity Consultant', chWriterDesc: 'Professional', chWriterPrompt: 'Use a “Clarity Consultant” writing mode. Write in a professional, structured, and polished style. Maintain a confident, neutral tone. Prioritize clarity, accuracy, and efficiency. Avoid slang and emotional language. Format content cleanly with logical transitions.', chWriterProfilePic: '/avatars/persona_clarity_consultant.jpg' },
  { chWriterId: 'e43f88b3-fabc-4eee-8ddd-cf8ff60c9702', chWriterName: 'Casual Chuckles', chWriterDesc: 'Common + Humor', chWriterPrompt: 'Use a “Casual Chuckles” writing mode. Write in a conversational style with light humor, friendly sarcasm, and playful metaphors. Keep the message clear but add personality. Make the reader smile without distracting from the main point.', chWriterProfilePic: '/avatars/persona_casual_chuckles.jpg' },
  { chWriterId: 'c4f87357-464b-4527-a0a4-7876b55a650c', chWriterName: 'The Polished Guide', chWriterDesc: 'Professional + Warm', chWriterPrompt: 'Use a “Polished Guide” writing mode. Write in a professional yet approachable style. Maintain a warm, encouraging tone. Blend clarity with empathy. Offer guidance that feels supportive, respectful, and easy to follow.', chWriterProfilePic: '/avatars/persona_the_polished_guide.jpg' },
  { chWriterId: 'e1c68976-ed6c-4d84-a2bc-529114866409', chWriterName: 'The Story Crafter', chWriterDesc: 'Creative & Expressive', chWriterPrompt: 'Use a “Story Crafter” writing mode. Write in a narrative, descriptive, and imaginative style. Use sensory detail, metaphor, and emotional depth. Make the content feel alive, atmospheric, and engaging.', chWriterProfilePic: '/avatars/persona_the_story_crafter.jpg' }
];

const FALLBACK_INTENT_MAP: Record<string, { intentName: string; desc: string; inst: string; prompt: string }> = {
  sbMbrStryFamly: {
    intentName: 'Family Memories & Relationships',
    desc: 'Capture meaningful family memories, traditions, lineage, and emotional bonds.',
    inst: 'Ask sensory questions about family heritage, home atmosphere, parents, grandparents, and key family moments.',
    prompt: 'Can you share a cherished memory about a family member or a special moment you spent together?'
  },
  sbMbrStryFamilyMember: {
    intentName: 'Family Member Story',
    desc: 'Capture personal stories, cherished memories, and milestones about a specific family member.',
    inst: 'Ask sensory and reflective questions focusing on the specific family member, their personality, shared experiences, and life legacy.',
    prompt: 'What special memory or story would you like to record about this family member?'
  },
  sbMbrStryResidence: {
    intentName: 'Residencies & Living Places',
    desc: 'Explore past homes, neighborhoods, sensory details of living spaces, and life transitions.',
    inst: 'Guide the storyteller through places lived, neighborhood sights and sounds, and how each home shaped them.',
    prompt: 'What is a home or neighborhood from your past that left a lasting impression on your life?'
  },
  sbMbrStryActivity: {
    intentName: 'Activities & Hobbies',
    desc: 'Record favorite pastimes, sports, creative pursuits, and passions.',
    inst: 'Encourage reflection on hobbies, passions, creative endeavors, and how they brought joy or growth.',
    prompt: 'Tell me about a hobby, sport, or creative passion that brought you deep joy.'
  },
  sbMbrStryAchievement: {
    intentName: 'Achievements & Recognition',
    desc: 'Document major milestones, awards, accomplishments, and moments of pride.',
    inst: 'Focus on personal growth, overcoming obstacles, earned honors, and milestone accomplishments.',
    prompt: 'What achievement or proud moment would you like to record in this chapter of your life?'
  },
  sbMbrStryEducation: {
    intentName: 'Education & Academic History',
    desc: 'Uncover stories from school days, inspiring teachers, studies, and learning experiences.',
    inst: 'Ask about mentors, favorite subjects, school atmospheres, friendships, and formative academic lessons.',
    prompt: 'Share a memory from your school days or a teacher who inspired your path.'
  },
  sbMbrStryEmployment: {
    intentName: 'Employment & Career',
    desc: 'Chronicling professional life, first jobs, career milestones, and workplace wisdom.',
    inst: 'Explore early work experiences, career pivots, teamwork, lessons learned, and professional growth.',
    prompt: 'What was your first job or a key career milestone you would like to describe in your story?'
  },
  SbMbrProfile: {
    intentName: 'Member Profile & Introduction',
    desc: 'Craft a compelling biography narrative, background introduction, and personal profile context.',
    inst: 'Ask engaging questions about life highlights, background, values, personal philosophy, and what stories they want to share in their profile.',
    prompt: 'Personal stories bring profiles to life! To create a vivid and engaging paragraph for your personal profile, could you tell me a bit about yourself? Consider including details like your background, unique interests or hobbies, and any memorable experiences or traits that define you.'
  },
  sbMbrProfile: {
    intentName: 'Member Profile & Introduction',
    desc: 'Craft a compelling biography narrative, background introduction, and personal profile context.',
    inst: 'Ask engaging questions about life highlights, background, values, personal philosophy, and what stories they want to share in their profile.',
    prompt: 'Personal stories bring profiles to life! To create a vivid and engaging paragraph for your personal profile, could you tell me a bit about yourself? Consider including details like your background, unique interests or hobbies, and any memorable experiences or traits that define you.'
  }
};

export default function StoryMatePanel({
  memberName = 'Eleanor',
  componentName = 'sbMbrStryFamly',
  topicId,
  storyTitle,
  storyContent,
  mbrStoryThreadID,
  chIntentId,
  onClose,
  onApplyStory
}: StoryMatePanelProps) {
  const showComponentName = useShowComponentName();
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayFirstName, setDisplayFirstName] = useState<string>(memberName);
  const [memberProfilePic, setMemberProfilePic] = useState<string | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState<boolean>(false);
  const [showPersonaDialog, setShowPersonaDialog] = useState<boolean>(false);
  const [tempPersona, setTempPersona] = useState<any>(null);
  const [availablePersonas, setAvailablePersonas] = useState<any[]>(FALLBACK_PERSONAS);
  const [totalTokensUsed, setTotalTokensUsed] = useState<number>(0);
  const [isWritingStory, setIsWritingStory] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [resolvedMbrId, setResolvedMbrId] = useState<string>('e20986fa-0fb9-4081-ae5d-35bc8f504df0');
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);

  // Initialize and get logged-in session ID
  const getSessionId = () => {
    let sid = sessionStorage.getItem('sb_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem('sb_session_id', sid);
    }
    return sid;
  };

  // Helper to record live AI telemetry to mbrAiUsageLog
  const recordAiTelemetry = async (
    promptChars: number,
    outputChars: number,
    tokensUsed: number,
    latencyMs: number,
    isSuccess: boolean,
    statusCode = 200,
    errorMessage: string | null = null
  ) => {
    try {
      const estPromptTokens = Math.max(1, Math.ceil(promptChars / 4));
      const estCompletionTokens = Math.max(1, Math.ceil(outputChars / 4));
      const totalTokens = tokensUsed || (estPromptTokens + estCompletionTokens);
      // Pricing estimate for Gemini 2.5 Flash ($0.075/1M input, $0.30/1M output)
      const estCost = (estPromptTokens * 0.000000075) + (estCompletionTokens * 0.00000030);

      const sid = getSessionId();
      await mbrAiUsageLogApi.recordUsage({
        mbrId: resolvedMbrId,
        userId: resolvedUserId,
        sessionId: sid,
        promptTokens: estPromptTokens,
        completionTokens: estCompletionTokens,
        totalTokens,
        estimatedCostUsd: Number(estCost.toFixed(6)),
        latencyMs,
        modelName: 'gemini-2.5-flash',
        statusCode,
        isSuccess,
        errorMessage,
        metadataJson: {
          componentName,
          personaName: writerPersona?.chWriterName || 'StoryMate',
          intentName: intentName || intentRecord?.chIntentName
        }
      });
    } catch (err) {
      console.warn("Could not record AI usage telemetry:", err);
    }
  };

  // Resolve logged in member profile first name and profile pic
  useEffect(() => {
    let isMounted = true;
    const resolveLoggedInMemberFirstName = async () => {
      try {
        const storedMbr = sessionStorage.getItem('mbr');
        if (storedMbr) {
          try {
            const mbr = JSON.parse(storedMbr);
            if (mbr.mbrFirstName && isMounted) setDisplayFirstName(mbr.mbrFirstName);
            if (mbr.mbrProfilePic && isMounted) setMemberProfilePic(resolveMediaUrl(mbr.mbrProfilePic));
            if (mbr.mbrId && isMounted) setResolvedMbrId(mbr.mbrId);
          } catch {}
        }

        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.user_id && isMounted) setResolvedUserId(u.user_id);
          // 1. Check sandbox_mbr in sessionStorage
          const savedMbr = sessionStorage.getItem('sandbox_mbr');
          if (savedMbr) {
            const mbr = JSON.parse(savedMbr);
            if (mbr.mbrFirstName && isMounted) {
              setDisplayFirstName(mbr.mbrFirstName);
            }
            if (mbr.mbrProfilePic && isMounted) {
              setMemberProfilePic(resolveMediaUrl(mbr.mbrProfilePic));
            }
            if (mbr.mbrId && isMounted) {
              setResolvedMbrId(mbr.mbrId);
            }
            if (mbr.mbrFirstName) return;
          }
          // 2. Check cached session pic
          const cachedPic = sessionStorage.getItem(`session_pic_${u.user_id}`);
          if (cachedPic && isMounted) {
            setMemberProfilePic(resolveMediaUrl(cachedPic));
          }
          // 3. Fetch logged in member record from DB by user_id
          if (u.user_id) {
            try {
              const mbr = await taskApi.getMemberByUserId(u.user_id);
              if (mbr && isMounted) {
                if (mbr.mbrFirstName) setDisplayFirstName(mbr.mbrFirstName);
                if (mbr.mbrProfilePic) setMemberProfilePic(resolveMediaUrl(mbr.mbrProfilePic));
                if (mbr.mbrId) setResolvedMbrId(mbr.mbrId);
                return;
              }
            } catch (e) {
              console.warn("Could not load member by user_id from DB:", e);
            }
          }
          // 4. Fallback to user session given_name or full name first word
          if (u.given_name && isMounted) {
            setDisplayFirstName(u.given_name);
            return;
          }
          if (u.name && isMounted) {
            const first = u.name.trim().split(' ')[0];
            if (first && isMounted) {
              setDisplayFirstName(first);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not resolve logged-in member info:", err);
      }
    };

    resolveLoggedInMemberFirstName();
    return () => { isMounted = false; };
  }, [memberName]);


  // Thread ID state (preserves saved thread ID for repeat visits)
  const [threadId] = useState<string>(() => {
    if (mbrStoryThreadID) return mbrStoryThreadID;
    const saved = sessionStorage.getItem(`story_mate_thread_${componentName}`);
    if (saved) return saved;
    const newId = 'thread_' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem(`story_mate_thread_${componentName}`, newId);
    return newId;
  });

  // Intent, Instruction, Prompt, and Writer Persona state
  const [intentRecord, setIntentRecord] = useState<any>(null);
  const [intentName, setIntentName] = useState<string>('');
  const [instructionName, setInstructionName] = useState<string>('');
  const [promptName, setPromptName] = useState<string>('');
  const [instructionText, setInstructionText] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');
  const [writerPersona, setWriterPersona] = useState<any>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const hasInitializedMessagesRef = useRef<boolean>(false);
  const storyContentRef = useRef<string | undefined>(storyContent);

  useEffect(() => {
    storyContentRef.current = storyContent;
  }, [storyContent]);

  // Lookup Intent, Hierarchical Instructions, Prompt, and Member chWriter Preference
  useEffect(() => {
    let isMounted = true;
    const loadAIContext = async () => {
      let resolvedIntent: any = null;
      let resolvedInst = '';
      let resolvedPrompt = '';
      let resolvedIntentName = '';
      let resolvedInstName = '';
      let resolvedPromptName = '';
      let activeWriter: any = null;

      try {
        // 1. Fetch intents
        const intents = await adminDbApi.getTableData('/chIntents');
        if (Array.isArray(intents) && intents.length > 0) {
          if (chIntentId) {
            resolvedIntent = intents.find((i: any) => i.chIntentId === chIntentId);
          }
          if (!resolvedIntent && componentName) {
            resolvedIntent = intents.find((i: any) =>
              i.chIntentName?.toLowerCase().includes(componentName.toLowerCase()) ||
              componentName.toLowerCase().includes(i.chIntentName?.toLowerCase() || '')
            );
          }
          if (!resolvedIntent) {
            resolvedIntent = intents[0];
          }
        }
      } catch (e) {
        console.warn("Could not query /chIntents, using fallback:", e);
      }

      if (resolvedIntent) {
        resolvedIntentName = resolvedIntent.chIntentName || '';
      }

      // Fallback intent lookup if backend not present
      if (!resolvedIntent) {
        const fallback = FALLBACK_INTENT_MAP[componentName] || FALLBACK_INTENT_MAP.sbMbrStryFamly;
        resolvedIntent = {
          chIntentId: chIntentId || '98fac10e-a61f-49ff-88ec-a6cbef6542a1',
          chIntentName: fallback.intentName,
          chIntentDesc: fallback.desc,
          chInstId: '7682e6f1-a9c1-4b11-a67b-12d8a0c24bdf'
        };
        resolvedInst = fallback.inst;
        resolvedPrompt = fallback.prompt;
        resolvedIntentName = fallback.intentName;
      }

      // 2. Fetch Hierarchical Instructions using chInstId and recursively stack ancestor instructions
      if (resolvedIntent?.chInstId) {
        try {
          const concatData = await adminDbApi.getRecord('/chInsts', `${resolvedIntent.chInstId}/concatenated`);
          if (concatData) {
            if (concatData.concatenatedContent || concatData.concatenatedInstruction) {
              resolvedInst = concatData.concatenatedContent || concatData.concatenatedInstruction;
            }
            if (concatData.chInstName) {
              resolvedInstName = concatData.chInstName;
            }
          }
        } catch (e) {
          console.warn("Could not load concatenated instruction from endpoint, attempting client-side chain stacking:", e);
        }

        // If not resolved from endpoint, fetch all chInsts and recursively stack parent & ancestor instructions
        if (!resolvedInst) {
          try {
            const allInsts = await adminDbApi.getTableData('/chInsts');
            if (Array.isArray(allInsts) && allInsts.length > 0) {
              const instMap = new Map(allInsts.map((i: any) => [i.chInstId, i]));
              const chain: any[] = [];
              let curr = instMap.get(resolvedIntent.chInstId);
              const visited = new Set<string>();

              while (curr) {
                if (visited.has(curr.chInstId)) break;
                visited.add(curr.chInstId);
                chain.push(curr);
                if (!curr.chInstParentId) break;
                curr = instMap.get(curr.chInstParentId);
              }

              // Reverse so root instruction comes first, specialized child instructions merged last
              chain.reverse();
              resolvedInst = chain
                .map((i) => i.chInstContent || i.chInstDesc || '')
                .filter(Boolean)
                .join('\n\n');

              const target = instMap.get(resolvedIntent.chInstId);
              resolvedInstName = target?.chInstName || chain[chain.length - 1]?.chInstName || '';
            }
          } catch (err) {
            console.warn("Could not manually stack instruction hierarchy:", err);
          }
        }
      }

      // 3. Fetch Prompt using chIntentId
      if (resolvedIntent?.chIntentId && !resolvedPrompt) {
        try {
          const prompts = await adminDbApi.getTableData('/chPrompts');
          if (Array.isArray(prompts)) {
            const match = prompts.find((p: any) => p.chIntentId === resolvedIntent.chIntentId);
            if (match) {
              resolvedPrompt = match.chPromptContent || match.chPromptName || '';
              resolvedPromptName = match.chPromptName || '';
            }
          }
        } catch (e) {
          console.warn("Could not load prompt for intent:", e);
        }
      }

      if (!resolvedIntentName) resolvedIntentName = resolvedIntent?.chIntentName || componentName;
      if (!resolvedInstName) resolvedInstName = `${resolvedIntentName} Instructions`;
      if (!resolvedPromptName) resolvedPromptName = `${resolvedIntentName} Prompt`;
      if (!resolvedInst) resolvedInst = (FALLBACK_INTENT_MAP[componentName] || FALLBACK_INTENT_MAP.sbMbrStryFamly).inst;
      if (!resolvedPrompt) resolvedPrompt = (FALLBACK_INTENT_MAP[componentName] || FALLBACK_INTENT_MAP.sbMbrStryFamly).prompt;

      // 4. Lookup Member Preference & selected chWriter persona instructions
      try {
        let currentMbrId = '299da1e4-a233-4333-ab7c-b9ca64b6b7d4';
        const storedMbr = sessionStorage.getItem('mbr');
        const userStr = sessionStorage.getItem('user');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId) currentMbrId = parsed.mbrId;
          } catch {}
        } else if (userStr) {
          try {
            const u = JSON.parse(userStr);
            const mbr = await taskApi.getMemberByUserId(u.user_id);
            if (mbr && mbr.mbrId) currentMbrId = mbr.mbrId;
          } catch (e) {
            console.warn("Could not resolve member ID for preferences:", e);
          }
        }

        let prefRecord: any = null;
        const savedPref = sessionStorage.getItem('sandbox_mbr_preferences') || sessionStorage.getItem('mbrPreferences');
        if (savedPref) {
          try { prefRecord = JSON.parse(savedPref); } catch (e) {}
        }
        if (!prefRecord) {
          try {
            prefRecord = await taskApi.getMemberPreferences(currentMbrId);
          } catch (e) {
            console.warn("No preferences record found for member:", e);
          }
        }

        const chWriterId = prefRecord?.chWriterId;

        let writers: any[] = [];
        try {
          writers = await taskApi.getChWriters();
        } catch (e) {
          console.warn("Could not query /chWriters, using fallback personas:", e);
        }

        if (!writers || writers.length === 0) {
          writers = [
            { chWriterId: 'f332c26a-7545-46e1-b6f0-65d04bd5f6d6', chWriterName: 'Everyday Eddie', chWriterDesc: 'Common & Informal', chWriterPrompt: 'Use the “Everyday Eddie” writing mode. Write in a casual, conversational style with simple language and a friendly tone. Avoid jargon. Keep explanations easy, relatable, and down to earth, like a helpful friend talking over coffee.', chWriterProfilePic: '/avatars/persona_everyday_eddie.jpg' },
            { chWriterId: 'a9355333-b0e7-4e35-a77e-6956fdaf889a', chWriterName: 'Clarity Consultant', chWriterDesc: 'Professional', chWriterPrompt: 'Use a “Clarity Consultant” writing mode. Write in a professional, structured, and polished style. Maintain a confident, neutral tone. Prioritize clarity, accuracy, and efficiency. Avoid slang and emotional language. Format content cleanly with logical transitions.', chWriterProfilePic: '/avatars/persona_clarity_consultant.jpg' },
            { chWriterId: 'e43f88b3-fabc-4eee-8ddd-cf8ff60c9702', chWriterName: 'Casual Chuckles', chWriterDesc: 'Common + Humor', chWriterPrompt: 'Use a “Casual Chuckles” writing mode. Write in a conversational style with light humor, friendly sarcasm, and playful metaphors. Keep the message clear but add personality. Make the reader smile without distracting from the main point.', chWriterProfilePic: '/avatars/persona_casual_chuckles.jpg' },
            { chWriterId: 'c4f87357-464b-4527-a0a4-7876b55a650c', chWriterName: 'The Polished Guide', chWriterDesc: 'Professional + Warm', chWriterPrompt: 'Use a “Polished Guide” writing mode. Write in a professional yet approachable style. Maintain a warm, encouraging tone. Blend clarity with empathy. Offer guidance that feels supportive, respectful, and easy to follow.', chWriterProfilePic: '/avatars/persona_the_polished_guide.jpg' },
            { chWriterId: 'e1c68976-ed6c-4d84-a2bc-529114866409', chWriterName: 'The Story Crafter', chWriterDesc: 'Creative & Expressive', chWriterPrompt: 'Use a “Story Crafter” writing mode. Write in a narrative, descriptive, and imaginative style. Use sensory detail, metaphor, and emotional depth. Make the content feel alive, atmospheric, and engaging.', chWriterProfilePic: '/avatars/persona_the_story_crafter.jpg' }
          ];
        }

        if (writers && writers.length > 0) {
          setAvailablePersonas(writers);
        }

        if (chWriterId) {
          activeWriter = writers.find((w: any) => w.chWriterId === chWriterId);
        }
        if (!activeWriter && writers.length > 0) {
          activeWriter = writers[0];
        }
      } catch (err) {
        console.warn("Error looking up chWriter persona preference:", err);
      }

      if (isMounted) {
        setIntentRecord(resolvedIntent);
        setIntentName(resolvedIntentName);
        setInstructionName(resolvedInstName);
        setPromptName(resolvedPromptName);
        setInstructionText(resolvedInst);
        setPromptText(resolvedPrompt);
        setWriterPersona(activeWriter);

        const currentPersonaName = activeWriter?.chWriterName || 'StoryMate';
        // Initialize starting prompt greeting only once upon initial load
        if (!hasInitializedMessagesRef.current) {
          hasInitializedMessagesRef.current = true;
          const nameToUse = displayFirstName || memberName;
          const trimmedContent = storyContentRef.current?.trim();
          const contentQuote = trimmedContent
            ? (trimmedContent.length > 180 ? `${trimmedContent.slice(0, 180)}...` : trimmedContent)
            : '';
          const existingNotice = trimmedContent
            ? `\n\nI reviewed your current content:\n> "${contentQuote}"\n\nHow would you like to revise, refine, or expand your text today?`
            : `\n\n*${resolvedPrompt}*`;

          const initialGreeting = `Hi ${nameToUse}! I'm ${currentPersonaName}, your StoryMate co-writer. I'm here to help you craft, polish, and preserve your stories in my signature style.${existingNotice}`;
          setMessages([
            {
              sender: 'cassie',
              text: initialGreeting
            }
          ]);
          // Baseline context token estimation
          const initTokens = Math.ceil((initialGreeting.length + (resolvedPrompt?.length || 0) + (resolvedInst?.length || 0)) / 4);
          setTotalTokensUsed((prev) => (prev > 0 ? prev : initTokens));
        }
      }
    };

    loadAIContext();
    return () => { isMounted = false; };
  }, [componentName, chIntentId, memberName, displayFirstName]);

  const personaName = writerPersona?.chWriterName || 'StoryMate';

  const handleSelectTemporaryPersona = (persona: any) => {
    setWriterPersona(persona);
    setShowPersonaDialog(false);
    setMessages((prev) => [
      ...prev,
      {
        sender: 'cassie',
        text: `✨ Switched co-writer persona to **${persona.chWriterName}** (${persona.chWriterDesc}). I'll now assist and generate stories in this style for this session!`
      }
    ]);
  };

  // Determine if there is enough conversational context for AI to write a full paragraph or more
  const userMessages = messages.filter((m) => m.sender === 'user');
  const totalUserChars = userMessages.reduce((acc, m) => acc + m.text.trim().length, 0);
  const hasAiDraft = messages.some((m) => m.sender === 'cassie' && m.isDraftSnippet);
  const hasExistingStoryWithChat = Boolean(storyContent && storyContent.trim().length >= 20 && userMessages.length >= 1);
  const hasEnoughContent = totalUserChars >= 25 || userMessages.length >= 2 || hasAiDraft || hasExistingStoryWithChat;

  const handleWriteStoryToField = async () => {
    if (!hasEnoughContent || isWritingStory || loading) return;
    setIsWritingStory(true);
    setAppliedSuccess(false);
    const startTime = performance.now();

    // Compile conversation notes for AI synthesis
    const conversationSummary = messages
      .map((m) => `${m.sender === 'user' ? (displayFirstName || 'Member') : personaName}: ${m.text}`)
      .join('\n\n');

    const personaInstruction = writerPersona?.chWriterPrompt ? ` [Writing Persona Style: ${writerPersona.chWriterPrompt}]` : '';
    const currentContentInstruction = storyContent?.trim() ? ` [Existing Draft to incorporate or expand: "${storyContent.trim()}"]` : '';

    const writePrompt = `[Instruction: ${instructionText}] [Prompt: ${promptText}]${personaInstruction}${currentContentInstruction}
[Task: Based on all the details, reflections, notes, and conversation below, write a cohesive, engaging, and expressive story paragraph (or multi-paragraph chapter) in first-person perspective. Match the persona style: ${personaName}. Output ONLY the final polished story narrative ready to be inserted directly into the memoir story field. Do not include introductory remarks, quotes, markdown code fences, or conversational filler.]

Conversation Notes:
${conversationSummary}`;

    try {
      const result = await chatApi.sendMessage(
        writePrompt,
        threadId,
        displayFirstName
      );

      let generatedStory = result.response || '';
      // Clean any accidental quotes or preambles
      generatedStory = generatedStory
        .replace(/^Here is (your|a) (story|draft|narrative|revised draft)[^:\n]*:\s*/i, '')
        .replace(/^"(.*)"$/s, '$1')
        .trim();

      if (!generatedStory && storyContent) {
        generatedStory = storyContent;
      }

      const addedTokens = result.tokens_used || Math.ceil((writePrompt.length + generatedStory.length) / 4);
      setTotalTokensUsed((prev) => prev + addedTokens);

      // Record AI telemetry in background
      recordAiTelemetry(
        writePrompt.length,
        generatedStory.length,
        addedTokens,
        Math.round(performance.now() - startTime),
        true,
        200,
        null
      );

      // 1. Dispatch standard application event for story fields (StoryEditorPanel, MbrProfileFeature, etc.)
      window.dispatchEvent(new CustomEvent('update-story-editor-content', {
        detail: {
          content: generatedStory,
          text: generatedStory,
          threadId,
          intentId: intentRecord?.chIntentId,
          mode: 'replace'
        }
      }));

      // 2. Call callback prop if provided
      if (onApplyStory) {
        onApplyStory(generatedStory);
      }

      // 3. Add confirmation message in chat feed
      setMessages((prev) => [
        ...prev,
        {
          sender: 'cassie',
          text: `✨ I've written your story draft and inserted it directly into your story text field above!\n\nFeel free to review it or ask me for any additions or tone tweaks.`
        }
      ]);

      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 4000);
    } catch (err) {
      console.warn("AI API offline, using intelligent story synthesis:", err);

      // Record AI telemetry with error
      recordAiTelemetry(
        writePrompt.length,
        150,
        Math.ceil((writePrompt.length + 150) / 4),
        Math.round(performance.now() - startTime),
        false,
        500,
        String(err)
      );

      // Simulation fallback
      setTimeout(() => {
        const compiledUserNotes = userMessages.map((m) => m.text).join(' ');
        let synthesized = '';

        if (storyContent?.trim()) {
          synthesized = `${storyContent.trim()}\n\n${compiledUserNotes}. Reflecting on these moments gives deeper context to my journey, capturing both where I have been and the memories I carry forward.`;
        } else {
          synthesized = `${storyTitle ? `${storyTitle}: ` : ''}${compiledUserNotes}. Looking back, these vivid memories remain deeply meaningful, capturing the essence of the experiences and people that shaped this chapter of my life.`;
        }

        const simTokens = Math.ceil((writePrompt.length + synthesized.length) / 4);
        setTotalTokensUsed((prev) => prev + simTokens);

        window.dispatchEvent(new CustomEvent('update-story-editor-content', {
          detail: {
            content: synthesized,
            text: synthesized,
            threadId,
            intentId: intentRecord?.chIntentId,
            mode: 'replace'
          }
        }));

        if (onApplyStory) {
          onApplyStory(synthesized);
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'cassie',
            text: `✨ I've synthesized our conversation into a complete story narrative and updated the story text field above! Feel free to review it or continue chatting with me to refine any section.`
          }
        ]);

        setAppliedSuccess(true);
        setTimeout(() => setAppliedSuccess(false), 4000);
        setIsWritingStory(false);
      }, 800);
      return;
    } finally {
      setIsWritingStory(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!chatInput.trim() || loading) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setLoading(true);
    const startTime = performance.now();

    const isWriteRequest = userText.toLowerCase().includes('write') || userText.toLowerCase().includes('draft') || userText.toLowerCase().includes('generate story') || userText.toLowerCase().includes('revise');
    const personaInstruction = writerPersona?.chWriterPrompt ? ` [Writing Persona Style: ${writerPersona.chWriterPrompt}]` : '';
    const currentContentInstruction = storyContent?.trim() ? ` [Current Content: "${storyContent.trim()}"]` : '';
    const fullPrompt = `[Instruction: ${instructionText}] [Prompt: ${promptText}]${personaInstruction}${currentContentInstruction} ${userText}`;

    try {
      const result = await chatApi.sendMessage(
        fullPrompt,
        threadId,
        displayFirstName
      );
      
      const aiReply = result.response;
      const addedTokens = result.tokens_used || Math.ceil(((instructionText?.length || 0) + (promptText?.length || 0) + userText.length + aiReply.length) / 4);
      setTotalTokensUsed((prev) => prev + addedTokens);

      // Record AI telemetry in background
      recordAiTelemetry(
        fullPrompt.length,
        aiReply.length,
        addedTokens,
        Math.round(performance.now() - startTime),
        true,
        200,
        null
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'cassie',
          text: aiReply,
          isDraftSnippet: isWriteRequest || aiReply.length > 120
        }
      ]);
    } catch (error) {
      console.warn("AI API offline, using intelligent simulation:", error);

      // Record AI telemetry with error
      recordAiTelemetry(
        fullPrompt.length,
        120,
        Math.ceil((fullPrompt.length + 120) / 4),
        Math.round(performance.now() - startTime),
        false,
        500,
        String(error)
      );

      setTimeout(() => {
        let aiReply = '';
        const lowercaseUser = userText.toLowerCase();
        const personaStyleNotice = writerPersona?.chWriterName ? ` (${writerPersona.chWriterName} mode)` : '';

        if (isWriteRequest) {
          if (storyContent?.trim()) {
            aiReply = `Here is a revised draft incorporating your current text and feedback${personaStyleNotice}:\n\n"${storyContent.trim()}\n\n${userText}. Reflecting on these experiences gives deeper context to my journey, capturing both where I have been and the memories I carry forward."`;
          } else {
            aiReply = `Here is a drafted story based on our conversation${personaStyleNotice}:\n\n"${storyTitle || 'Memoir'}: ${userText}. The vivid memories of these days remain clear and meaningful. Looking back, those experiences shaped my journey and taught me lessons that I carry with me to this day."`;
          }
        } else if (lowercaseUser.includes('childhood') || lowercaseUser.includes('kid') || lowercaseUser.includes('grow up')) {
          aiReply = `Growing up with those experiences is such a sensory memory, ${displayFirstName}. Applying our ${intentRecord?.chIntentName || 'intent'} focus${personaStyleNotice}: what specific smells, sights, or feelings do you remember most clearly?`;
        } else if (lowercaseUser.includes('family') || lowercaseUser.includes('parent') || lowercaseUser.includes('grandparent')) {
          aiReply = `That family connection sounds like an anchor in your story${personaStyleNotice}. What was a specific moment or tradition you shared that stands out most?`;
        } else {
          aiReply = `That is a wonderful detail to include. Building on your current text${personaStyleNotice}: how would you like us to phrase this in your updated narrative? Say 'write story' or 'revise' anytime you would like me to compile our draft!`;
        }

        const simTokens = Math.ceil((userText.length + aiReply.length + 60) / 4);
        setTotalTokensUsed((prev) => prev + simTokens);

        setMessages((prev) => [
          ...prev,
          {
            sender: 'cassie',
            text: aiReply,
            isDraftSnippet: isWriteRequest || lowercaseUser.includes('write')
          }
        ]);
        setLoading(false);
      }, 900);
      return;
    }
    setLoading(false);
  };


  return (
    <div id="story-mate-panel" className="bg-[#FAF9F6] dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3.5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF] dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          {writerPersona?.chWriterProfilePic ? (
            <img
              src={writerPersona.chWriterProfilePic}
              alt={personaName}
              className="w-8 h-8 rounded-full object-cover border border-amber-300 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
          <div>
            <h3 className="font-serif text-xs font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
              <span>{personaName}</span>
            </h3>
            <p className="text-[9px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Assisting {displayFirstName} • Style: {personaName}{writerPersona?.chWriterDesc ? ` (${writerPersona.chWriterDesc})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTempPersona(writerPersona);
              setShowPersonaDialog(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-[10.5px] font-semibold transition-all cursor-pointer shadow-2xs"
            title="Temporarily change StoryMate persona for this story"
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>Change StoryMate</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpDialog(true)}
            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="How to chat with StoryMate"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close StoryMate Assistant"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed (Height increased by 25% from max-h-64 to max-h-80 min-h-[220px]) */}
      <div className="space-y-3.5 max-h-80 min-h-[220px] overflow-y-auto pr-1 font-serif text-xs scrollbar-thin">
        {messages.map((msg, idx) => {
          const isAi = msg.sender === 'cassie';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2 max-w-[78%] sm:max-w-[75%] ${
                isAi ? 'self-start' : 'self-end ml-auto flex-row-reverse'
              }`}
            >
              {/* Profile Picture Avatar */}
              {isAi ? (
                writerPersona?.chWriterProfilePic ? (
                  <img
                    src={writerPersona.chWriterProfilePic}
                    alt={personaName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )
              ) : (
                memberProfilePic ? (
                  <img
                    src={memberProfilePic}
                    alt={displayFirstName}
                    className="w-7 h-7 rounded-full object-cover border border-blue-200 dark:border-blue-700 shadow-2xs shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                    {displayFirstName.charAt(0)}
                  </div>
                )
              )}

              {/* Message Bubble with non-rounded corner nearest profile image */}
              <div
                className={`flex flex-col gap-1 px-3.5 py-2.5 shadow-xs transition-all w-fit max-w-full ${
                  isAi
                    ? 'bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-2xl rounded-tl-none'
                    : 'bg-blue-600 border border-blue-600 text-white rounded-2xl rounded-tr-none'
                }`}
              >
                <div className={`flex items-center justify-between gap-2 font-sans text-[8.5px] font-bold uppercase tracking-wider ${
                  isAi ? 'text-slate-400 dark:text-slate-400' : 'text-blue-100'
                }`}>
                  <span>{isAi ? `${personaName} (StoryMate)` : displayFirstName}</span>
                </div>
                <p className={`leading-relaxed whitespace-pre-line text-xs ${isAi ? 'text-slate-800 dark:text-slate-200 font-serif' : 'text-white font-sans'}`}>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2 max-w-[78%] sm:max-w-[75%] self-start animate-pulse">
            {writerPersona?.chWriterProfilePic ? (
              <img
                src={writerPersona.chWriterProfilePic}
                alt={personaName}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="flex flex-col gap-1 px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-xs">
              <div className="font-sans text-[8.5px] font-bold uppercase tracking-wider text-slate-400">
                {personaName} is crafting narrative...
              </div>
              <div className="flex gap-1 items-center mt-1 py-0.5">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Divider Line & Light Grey Shaded Bottom Tray for Input & Controls */}
      <div className="pt-3 pb-2.5 -mx-5 -mb-5 px-5 bg-[#F1F3F5] dark:bg-slate-950/70 border-t border-[#E2E5E9] dark:border-slate-800 rounded-b-3xl flex flex-col gap-2.5">
        {/* Write Story Action Strip */}
        <div className="flex items-center justify-between gap-2 pb-0.5 flex-wrap">
          <button
            type="button"
            onClick={handleWriteStoryToField}
            disabled={!hasEnoughContent || isWritingStory || loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              hasEnoughContent
                ? 'bg-amber-600 hover:bg-amber-700 active:scale-98 text-white shadow-amber-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40 opacity-70'
            }`}
            title={
              hasEnoughContent
                ? `Have ${personaName} generate the story directly into the text field above`
                : `Share a few more thoughts with ${personaName} so AI has enough content to generate your story`
            }
          >
            {isWritingStory ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating story...</span>
              </>
            ) : appliedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Story Generated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Generate Story</span>
              </>
            )}
          </button>

          {!hasEnoughContent ? (
            <span className="text-[10px] font-sans text-slate-400 dark:text-slate-500 italic select-none">
              💬 Chat a bit more to enable AI story generation
            </span>
          ) : (
            <span className="text-[10px] font-sans text-amber-700 dark:text-amber-400 font-medium select-none">
              ✨ Ready to generate story!
            </span>
          )}
        </div>

        {/* Input Bar Form */}
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSendMessage(e); }} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSendMessage(e);
              }
            }}
            disabled={loading}
            placeholder={loading ? `${personaName} is crafting response...` : `Tell ${personaName} about your story...`}
            className="flex-1 bg-white dark:bg-slate-900 border border-[#D9DDE2] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-750 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors font-serif shadow-inner disabled:opacity-50"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSendMessage(e);
            }}
            disabled={loading || !chatInput.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl px-3.5 py-2.5 cursor-pointer disabled:cursor-not-allowed transition-colors shadow-xs flex items-center justify-center shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Admin Metadata when SHOW_COMPONENT_NAME is TRUE */}
        {showComponentName && (
          <div className="pt-1.5 border-t border-[#E2E5E9] dark:border-slate-800/80 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-mono text-slate-500 pr-28 select-none">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Intent:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700" title={intentName || intentRecord?.chIntentName}>
                {intentName || intentRecord?.chIntentName || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Prompt:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700" title={promptName}>
                {promptName || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Instruction:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700" title={instructionName}>
                {instructionName || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-400 uppercase text-[9px]">Token Usage:</span>
              <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-50/90 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/80 dark:border-amber-800" title={`Total cumulative AI tokens used in this chat session: ${totalTokensUsed.toLocaleString()}`}>
                {totalTokensUsed.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <AdminComponentTag name="StoryMatePanel" />

      {/* Help Dialog Modal */}
      {showHelpDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowHelpDialog(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-lg w-full max-h-[85vh] p-6 relative flex flex-col gap-4 text-slate-800 dark:text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                {writerPersona?.chWriterProfilePic ? (
                  <img
                    src={writerPersona.chWriterProfilePic}
                    alt={personaName}
                    className="w-8 h-8 rounded-full object-cover border border-amber-300 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                    Chatting with {personaName}
                  </h3>
                  <p className="text-[11px] font-sans text-slate-400">
                    Your StoryMate AI co-writer guide & tips
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="space-y-4 text-xs leading-relaxed font-sans text-slate-650 dark:text-slate-300 overflow-y-auto pr-1 max-h-[60vh] scrollbar-thin">
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-xl text-amber-900 dark:text-amber-200 font-medium">
                💡 <span className="font-semibold">No need for complete or well-written sentences!</span> You can simply chat casually or share quick notes.
              </div>

              <p>
                Feel free to feed <strong>short statements, bullet points, memory fragments, or raw keywords</strong> to {personaName}. You don't have to worry about grammar, punctuation, or formatting.
              </p>

              {/* Quick Input Examples */}
              <div className="space-y-2">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Quick examples you can try:
                </div>
                <ul className="space-y-1.5 pl-0.5">
                  <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700/60">
                    <span className="text-amber-600 font-bold shrink-0">💬</span>
                    <span><em>"I'm a family man who enjoys entertaining family and friends"</em></span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700/60">
                    <span className="text-amber-600 font-bold shrink-0">💬</span>
                    <span><em>"Grandpa's red canoe, early morning fog, catching bass at sunset"</em></span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700/60">
                    <span className="text-amber-600 font-bold shrink-0">💬</span>
                    <span><em>"First summer job at 16, bakery 4am shift, learned hard work"</em></span>
                  </li>
                </ul>
              </div>

              {/* Tips & Tricks Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tips &amp; Tricks for Best Results</span>
                </div>

                <div className="space-y-2 text-[11.5px]">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                    <div className="font-semibold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                      <span>🔄</span>
                      <span>1. Simply Say "Rewrite"</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 pl-5 text-[11px] leading-relaxed">
                      You can simply tell your StoryMate to <em>"rewrite"</em>, <em>"give me another version"</em>, or <em>"try a different angle"</em>, and it will immediately generate a fresh draft.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                    <div className="font-semibold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                      <span>🎭</span>
                      <span>2. Change Personas On the Fly</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 pl-5 text-[11px] leading-relaxed">
                      Click <strong>Change StoryMate</strong> in the header to switch to any writing persona (such as <em>Everyday Eddie</em>, <em>Casual Chuckles</em>, or <em>The Story Crafter</em>) and regenerate your story in a whole new tone.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                    <div className="font-semibold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                      <span>🎨</span>
                      <span>3. Direct the Tone &amp; Sensory Details</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 pl-5 text-[11px] leading-relaxed">
                      Ask your StoryMate for specific adjustments like <em>"focus more on what it smelled and felt like"</em>, <em>"make it more humorous"</em>, or <em>"keep it brief and heartfelt"</em>.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                    <div className="font-semibold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>4. One-Click "Generate Story"</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 pl-5 text-[11px] leading-relaxed">
                      Once you've chatted a few memories, click the amber <strong>Generate Story</strong> button to compile and write your story directly into the story field above.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150 dark:border-slate-700/60 space-y-1">
                    <div className="font-semibold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                      <span>🧩</span>
                      <span>5. Build Step-by-Step</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 pl-5 text-[11px] leading-relaxed">
                      You don't need to share everything at once. Feed one memory at a time and ask StoryMate to weave each new detail into your expanding memoir draft.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-[10.5px] text-slate-400 font-sans">
                {personaName} is ready to help you write.
              </span>
              <button
                type="button"
                onClick={() => setShowHelpDialog(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Got It, Let's Write!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change StoryMate Persona Modal Dialog */}
      {showPersonaDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowPersonaDialog(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-xl w-full max-h-[85vh] p-6 relative flex flex-col gap-4 text-slate-800 dark:text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                    Change StoryMate Co-Writer
                  </h3>
                  <p className="text-[11px] font-sans text-slate-400">
                    Select a persona for this story session (does not update account preferences).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPersonaDialog(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Persona Cards List */}
            <div className="space-y-3 overflow-y-auto pr-1 max-h-[56vh] scrollbar-thin">
              {availablePersonas.map((persona) => {
                const isSelected = (tempPersona?.chWriterId === persona.chWriterId) || (tempPersona?.chWriterName === persona.chWriterName);
                const isCurrentActive = (writerPersona?.chWriterId === persona.chWriterId) || (writerPersona?.chWriterName === persona.chWriterName);
                return (
                  <div
                    key={persona.chWriterId || persona.chWriterName}
                    onClick={() => setTempPersona(persona)}
                    className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {persona.chWriterProfilePic ? (
                          <img
                            src={persona.chWriterProfilePic}
                            alt={persona.chWriterName}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                            {persona.chWriterName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-serif text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{persona.chWriterName}</span>
                            {isCurrentActive && (
                              <span className="text-[8.5px] font-sans font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 rounded-full">
                                Currently Active
                              </span>
                            )}
                          </h4>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded-full">
                            {persona.chWriterDesc}
                          </span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-500 text-white' : 'border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Tone Prompt Instruction */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <p className="text-[11px] font-serif text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{persona.chWriterPrompt}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer with Save & Cancel Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10.5px] text-slate-400 font-sans">
                💡 Applies immediately to this story session.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPersonaDialog(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempPersona) {
                      handleSelectTemporaryPersona(tempPersona);
                    } else {
                      setShowPersonaDialog(false);
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
