/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, FileText, CheckCircle2 } from 'lucide-react';
import { chatApi, adminDbApi, taskApi } from '@/src/services/api';

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
}

const FALLBACK_INTENT_MAP: Record<string, { intentName: string; desc: string; inst: string; prompt: string }> = {
  sbMbrStryFamly: {
    intentName: 'Family Memories & Relationships',
    desc: 'Capture meaningful family memories, traditions, lineage, and emotional bonds.',
    inst: 'Ask sensory questions about family heritage, home atmosphere, parents, grandparents, and key family moments.',
    prompt: 'Can you share a cherished memory about a family member or a special moment you spent together?'
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
  onClose
}: StoryMatePanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferredIndex, setTransferredIndex] = useState<number | null>(null);
  const [displayFirstName, setDisplayFirstName] = useState<string>(memberName);

  // Resolve logged in member profile first name
  useEffect(() => {
    let isMounted = true;
    const resolveLoggedInMemberFirstName = async () => {
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          // 1. Check sandbox_mbr in sessionStorage
          const savedMbr = sessionStorage.getItem('sandbox_mbr');
          if (savedMbr) {
            const mbr = JSON.parse(savedMbr);
            if (mbr.mbrFirstName && isMounted) {
              setDisplayFirstName(mbr.mbrFirstName);
              return;
            }
          }
          // 2. Fetch logged in member record from DB by user_id
          if (u.user_id) {
            try {
              const mbr = await taskApi.getMemberByUserId(u.user_id);
              if (mbr && mbr.mbrFirstName && isMounted) {
                setDisplayFirstName(mbr.mbrFirstName);
                return;
              }
            } catch (e) {
              console.warn("Could not load member by user_id from DB:", e);
            }
          }
          // 3. Fallback to user session given_name or full name first word
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
        console.warn("Could not resolve logged-in member first name:", err);
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

  // Intent, Instruction, Prompt state
  const [intentRecord, setIntentRecord] = useState<any>(null);
  const [instructionText, setInstructionText] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');

  const [messages, setMessages] = useState<Message[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Lookup Intent, Hierarchical Instructions, and Prompt
  useEffect(() => {
    let isMounted = true;
    const loadAIContext = async () => {
      let resolvedIntent: any = null;
      let resolvedInst = '';
      let resolvedPrompt = '';

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
      }

      // 2. Fetch Hierarchical Instructions using chInstId
      if (resolvedIntent?.chInstId && !resolvedInst) {
        try {
          const concatData = await adminDbApi.getRecord('/chInsts', `${resolvedIntent.chInstId}/concatenated`);
          if (concatData && concatData.concatenatedInstruction) {
            resolvedInst = concatData.concatenatedInstruction;
          } else {
            const rawInst = await adminDbApi.getRecord('/chInsts', resolvedIntent.chInstId);
            if (rawInst) resolvedInst = rawInst.chInstContent || rawInst.chInstDesc || '';
          }
        } catch (e) {
          console.warn("Could not load concatenated instruction:", e);
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
            }
          }
        } catch (e) {
          console.warn("Could not load prompt for intent:", e);
        }
      }

      if (!resolvedInst) resolvedInst = (FALLBACK_INTENT_MAP[componentName] || FALLBACK_INTENT_MAP.sbMbrStryFamly).inst;
      if (!resolvedPrompt) resolvedPrompt = (FALLBACK_INTENT_MAP[componentName] || FALLBACK_INTENT_MAP.sbMbrStryFamly).prompt;

      if (isMounted) {
        setIntentRecord(resolvedIntent);
        setInstructionText(resolvedInst);
        setPromptText(resolvedPrompt);

        // Initialize starting Cassie prompt greeting
        const nameToUse = displayFirstName || memberName;
        const initialGreeting = `Hi ${nameToUse}! I'm Cassie, your StoryMate. I'm here to help you craft this story.\n\n*${resolvedPrompt}*`;
        setMessages([
          {
            sender: 'cassie',
            text: initialGreeting
          }
        ]);
      }
    };

    loadAIContext();
    return () => { isMounted = false; };
  }, [componentName, chIntentId, memberName, displayFirstName]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setLoading(true);

    const isWriteRequest = userText.toLowerCase().includes('write') || userText.toLowerCase().includes('draft') || userText.toLowerCase().includes('generate story');

    try {
      const result = await chatApi.sendMessage(
        `[Instruction: ${instructionText}] [Prompt: ${promptText}] ${userText}`,
        threadId,
        displayFirstName
      );
      
      const cassieReply = result.response;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'cassie',
          text: cassieReply,
          isDraftSnippet: isWriteRequest || cassieReply.length > 120
        }
      ]);
    } catch (error) {
      console.warn("AI API offline, using intelligent simulation:", error);

      setTimeout(() => {
        let cassieReply = '';
        const lowercaseUser = userText.toLowerCase();

        if (isWriteRequest) {
          cassieReply = `Here is a drafted story based on our conversation:\n\n"${storyTitle || 'Memoir'}: ${userText}. The vivid memories of these days remain clear and meaningful. Looking back, those experiences shaped my journey and taught me lessons that I carry with me to this day."`;
        } else if (lowercaseUser.includes('childhood') || lowercaseUser.includes('kid') || lowercaseUser.includes('grow up')) {
          cassieReply = `Growing up with those experiences is such a sensory memory, ${displayFirstName}. Applying our ${intentRecord?.chIntentName || 'intent'} focus: what specific smells, sights, or feelings do you remember most clearly?`;
        } else if (lowercaseUser.includes('family') || lowercaseUser.includes('parent') || lowercaseUser.includes('grandparent')) {
          cassieReply = `That family connection sounds like an anchor in your story. What was a specific moment or tradition you shared that stands out most?`;
        } else {
          cassieReply = `That is a wonderful detail to include. Building on our ${intentRecord?.chIntentName || 'story'} prompt: how would you like us to phrase this in your final story narrative? Say 'write story' anytime you would like me to compile our chat!`;
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: 'cassie',
            text: cassieReply,
            isDraftSnippet: isWriteRequest || lowercaseUser.includes('write')
          }
        ]);
        setLoading(false);
      }, 900);
      return;
    }
    setLoading(false);
  };

  const handleTransferToEditor = (textToTransfer: string, idx: number) => {
    // Dispatch content to StoryEditorPanel textarea
    window.dispatchEvent(
      new CustomEvent('update-story-editor-content', {
        detail: {
          content: textToTransfer,
          threadId: threadId,
          intentId: intentRecord?.chIntentId
        }
      })
    );
    setTransferredIndex(idx);
    setTimeout(() => setTransferredIndex(null), 3000);
  };

  return (
    <div id="story-mate-panel" className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.015)] flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EFECE7]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-serif text-xs font-bold text-slate-850 flex items-center gap-1.5">
              <span>StoryMate AI</span>
              {intentRecord?.chIntentName && (
                <span className="text-[9px] font-sans font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                  {intentRecord.chIntentName}
                </span>
              )}
            </h3>
            <p className="text-[9px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Assisting {displayFirstName} • Intent & Prompt Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close StoryMate Assistant"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 font-serif text-xs scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-1.5 p-3.5 rounded-2xl max-w-[90%] ${
              msg.sender === 'cassie'
                ? 'bg-slate-50 border border-slate-150 text-slate-800 self-start shadow-2xs'
                : 'bg-blue-600 text-white self-end ml-auto'
            }`}
          >
            <div className="flex items-center justify-between gap-2 font-sans text-[8px] font-bold uppercase tracking-wider text-slate-400">
              <span>{msg.sender === 'cassie' ? 'Cassie (StoryMate)' : 'You'}</span>
              {msg.sender === 'cassie' && (
                <button
                  onClick={() => handleTransferToEditor(msg.text, idx)}
                  className="flex items-center gap-1 text-[9px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded-md cursor-pointer transition-all"
                  title="Insert this output directly into Story Editor content display box"
                >
                  {transferredIndex === idx ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Editor!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 text-amber-600" />
                      <span>Write to Story Panel</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col gap-1 p-3.5 rounded-2xl max-w-[85%] bg-slate-50 border border-slate-150 text-slate-750 self-start animate-pulse">
            <div className="font-sans text-[8px] font-bold uppercase tracking-wider text-slate-400">
              Cassie is generating story narrative
            </div>
            <div className="flex gap-1 items-center mt-1 py-1">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={loading}
          placeholder={loading ? "Cassie is crafting response..." : "Ask Cassie to 'write story' or answer her prompt..."}
          className="flex-1 bg-white border border-[#EFECE7] rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-350 transition-colors font-serif shadow-inner disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !chatInput.trim()}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white rounded-xl px-3.5 py-2.5 cursor-pointer disabled:cursor-not-allowed transition-colors shadow-xs flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
