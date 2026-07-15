/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface Message {
  sender: 'cassie' | 'user';
  text: string;
}

interface StoryMatePanelProps {
  memberName?: string;
}

export default function StoryMatePanel({ memberName = 'Eleanor' }: StoryMatePanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'cassie',
      text: `Hi ${memberName}! I'm Cassie, your Story Mate. I'm here to help you capture your memories and shape your Introduction. What would you like to tell me about yourself today?`
    }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    // Trigger simulated Cassie response after 1 second
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
    }, 1000);
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-3.5">
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
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-450 uppercase font-mono">
          <Sparkles className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Co-Writer Mode</span>
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
                : 'bg-slate-800 text-white self-end ml-auto'
            }`}
          >
            <div className="font-sans text-[8px] font-bold uppercase tracking-wider text-slate-400">
              {msg.sender === 'cassie' ? 'Cassie' : 'You'}
            </div>
            <p className="leading-relaxed">{msg.text}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Share a memory or ask Cassie for a prompt…"
          className="flex-1 bg-white border border-[#EFECE7] rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-350 transition-colors font-serif shadow-inner"
        />
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-750 text-white rounded-xl p-2.5 cursor-pointer transition-colors shadow-sm flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
