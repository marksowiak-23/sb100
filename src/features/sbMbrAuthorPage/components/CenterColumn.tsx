/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, BookOpen, Calendar, ArrowLeft, ShieldAlert, Edit2, Send, Sparkles } from 'lucide-react';

interface Message {
  sender: 'cassie' | 'user';
  text: string;
}

interface CenterColumnProps {
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
}

export default function CenterColumn({
  activeSection,
  activeContent,
  onClickBack
}: CenterColumnProps) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'cassie',
      text: "Hi Eleanor! I'm Cassie, your Story Mate. I'm here to help you capture your memories and shape your Introduction. What would you like to tell me about yourself today?"
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
        cassieReply = "Growing up by the water is such a sensory experience, Eleanor. Can you recall specific smells or sounds from your childhood home that still stay with you?";
      } else if (lowercaseUser.includes('grandfather') || lowercaseUser.includes('harold')) {
        cassieReply = "Your grandfather Harold sounds like an anchor in your early years. What did it feel like sitting in silence with him while mending nets?";
      } else if (lowercaseUser.includes('school') || lowercaseUser.includes('teach') || lowercaseUser.includes('portland')) {
        cassieReply = "Transitioning from Coos Bay to teaching in Portland must have been a major milestone. How did those coastal lessons influence your classroom?";
      } else {
        cassieReply = "That's a beautiful detail to reflect on. Let's think about how to write that into this chapter. What other sights or emotions stood out to you in that moment?";
      }

      setMessages((prev) => [...prev, { sender: 'cassie', text: cassieReply }]);
    }, 1000);
  };

  const formattedSectionTitle =
    activeSection.charAt(0).toUpperCase() + activeSection.slice(1);

  return (
    <div className="space-y-6 flex flex-col">
      
      {/* --- BACK NAVIGATION LINK --- */}
      <div>
        <button
          onClick={onClickBack}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* --- PROFILE SUMMARY CARD --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Eleanor Hartwell Profile Picture placeholder */}
            <div className="relative w-14 h-14 shrink-0">
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-350 flex items-center justify-center font-serif text-slate-700 font-bold text-xl">
                EH
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl font-black text-slate-800 tracking-tight leading-tight">
                Eleanor Hartwell
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Portland, Oregon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats metadata */}
        <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-400 tracking-wider uppercase bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 w-fit">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>14 chapters</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-250"></div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Member since March 2022</span>
          </div>
        </div>

        {/* Excerpt quote */}
        <p className="text-slate-500 font-serif leading-relaxed text-sm italic relative pl-4 border-l-2 border-slate-250">
          "Growing up in a small coastal town shaped everything I became. The salt air and fishing boats were my first teachers — long before I ever set foot in a classroom. My grandfather's hands told stories his lips never would, and I spent a childhood learning to read them."
        </p>

        {/* Category tags */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#EFECE7]">
          {['Family', 'Childhood', 'Pacific Northwest'].map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* --- ACTIVE SECTION CONTENT AREA --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
        {/* Status Draft indicator & Actions header */}
        <div className="flex items-center justify-between border-b border-[#EFECE7] pb-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Status: Draft
            </span>
            <h3 className="font-serif text-lg font-bold text-slate-800">
              {formattedSectionTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Opening Privacy settings for this draft...')}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
              title="Privacy settings"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => alert(`Simulating text editor interface for ${formattedSectionTitle}...`)}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
              title={`Edit ${formattedSectionTitle}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable text paragraphs */}
        <div className="space-y-4 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          {activeContent.map((paragraph, index) => (
            <p
              key={index}
              className="text-xs md:text-sm text-slate-650 leading-relaxed font-serif text-justify"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* --- STORY MATE PANEL --- */}
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

    </div>
  );
}
