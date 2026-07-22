/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { chatApi } from '@/src/services/api';

interface Message {
  sender: 'cassie' | 'user';
  text: string;
}

interface StoryMatePanelProps {
  memberName?: string;
  onClose?: () => void;
}

export default function StoryMatePanel({ memberName = 'Eleanor', onClose }: StoryMatePanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'cassie',
      text: `Hi ${memberName}! I'm Cassie, your Story Mate. I'm here to help you capture your memories and shape your Introduction. What would you like to tell me about yourself today?`
    }
  ]);
  
  // Persistent threadId for the session
  const [threadId] = useState(() => {
    const saved = sessionStorage.getItem('story_mate_thread_id');
    if (saved) return saved;
    const newId = 'thread_' + Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem('story_mate_thread_id', newId);
    return newId;
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setLoading(true);

    try {
      const result = await chatApi.sendMessage(userText, threadId, memberName);
      setMessages((prev) => [...prev, { sender: 'cassie', text: result.response }]);
    } catch (error) {
      console.warn("AI API backend offline or error, falling back to simulation:", error);
      
      // Simulated Cassie response fallback
      setTimeout(() => {
        let cassieReply = '';
        const lowercaseUser = userText.toLowerCase();

        if (lowercaseUser.includes('childhood') || lowercaseUser.includes('kid') || lowercaseUser.includes('grow up')) {
          cassieReply = `Growing up by the water is such a sensory experience, ${memberName}. Can you recall specific smells or sounds from your childhood home that still stay with you?`;
        } else if (lowercaseUser.includes('grandfather') || lowercaseUser.includes('harold')) {
          cassieReply = "Your grandfather Harold sounds like an anchor in your early years. What did it feel like sitting in silence with him while mending nets?";
        } else if (lowercaseUser.includes('school') || lowercaseUser.includes('teach') || lowercaseUser.includes('portland')) {
          cassieReply = `Transitioning from Coos Bay to teaching in Portland must have been a major milestone. How did those coastal lessons influence your classroom?`;
        } else {
          cassieReply = "That's a beautiful detail to reflect on. Let's think about how to write that into this chapter. What other sights or emotions stood out to you in that moment?";
        }

        setMessages((prev) => [...prev, { sender: 'cassie', text: cassieReply }]);
        setLoading(false);
      }, 1000);
      return; // prevent setting loading to false too early
    }
    setLoading(false);
  };

  return (
    <div id="story-mate-panel" className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-3.5">
      <div className="flex items-center justify-between pb-1 border-b border-[#EFECE7]">
        <div className="flex items-center gap-2">
          {/* Headshot thumbnail container */}
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white font-mono shrink-0">
            C
          </div>
          <div>
            <h3 className="font-serif text-xs font-bold text-slate-800">
              Story Mate
            </h3>
            <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">
              with Cassie
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-450 uppercase font-mono">
            <Sparkles className="w-3 h-3 text-slate-500 shrink-0" />
            <span>Co-Writer Mode</span>
          </div>
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

      {/* Message feed log container */}
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1 font-serif text-xs scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-1 p-3 rounded-2xl max-w-[85%] ${
              msg.sender === 'cassie'
                ? 'bg-slate-50 border border-slate-100 text-slate-750 self-start'
                : 'bg-blue-600 text-white self-end ml-auto'
            }`}
          >
            <div className="font-sans text-[8px] font-bold uppercase tracking-wider text-slate-400">
              {msg.sender === 'cassie' ? 'Cassie' : 'You'}
            </div>
            <p className="leading-relaxed">{msg.text}</p>
          </div>
        ))}

        {/* Premium Loading Typing Indicator */}
        {loading && (
          <div className="flex flex-col gap-1 p-3 rounded-2xl max-w-[85%] bg-slate-50 border border-slate-100 text-slate-750 self-start animate-pulse">
            <div className="font-sans text-[8px] font-bold uppercase tracking-wider text-slate-400">
              Cassie is typing
            </div>
            <div className="flex gap-1 items-center mt-1 py-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
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
          placeholder={loading ? "Cassie is typing..." : "Share a memory or ask Cassie for a prompt…"}
          className="flex-1 bg-white border border-[#EFECE7] rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-350 transition-colors font-serif shadow-inner disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !chatInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl p-2.5 cursor-pointer disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
