/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  ArrowUpRight, 
  Gift, 
  HeartHandshake, 
  CheckCircle2, 
  X, 
  Send,
  Mail
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface AdCard {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  title: string;
  category: string;
  description: string;
  whyItFits: string;
  highlights: string[];
  icon: React.ReactNode;
  iconBg: string;
  cardBg: string;
  cardBorder: string;
  hoverBorder: string;
  buttonText: string;
  buttonStyle: string;
}

export default function SponsorsPanel() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    placement: 'Prime Sidebar Spotlight',
    budget: '$500 - $1,500 / mo',
    message: ''
  });

  const cards: AdCard[] = [
    {
      id: 'spotlight',
      badge: '★ Featured Sponsor Slot',
      badgeColor: 'text-amber-800',
      badgeBg: 'bg-amber-100/80',
      badgeBorder: 'border-amber-300',
      title: 'Advertise Here',
      category: 'High-Attention Audience',
      description: 'Showcase your brand where readers, authors, and families invest real time reflecting on life journeys.',
      whyItFits: 'High-trust, focused reading with zero endless-feed distraction.',
      highlights: ['Multi-Page Visibility', '94% Read Engagement', 'Zero Clickbait Noise'],
      icon: <Sparkles className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-200/80',
      cardBg: 'bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20',
      cardBorder: 'border-amber-200/70',
      hoverBorder: 'hover:border-amber-400 hover:shadow-amber-100/50',
      buttonText: 'Advertise Here',
      buttonStyle: 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-600/20'
    },
    {
      id: 'keepsake',
      badge: 'Category Partner',
      badgeColor: 'text-emerald-800',
      badgeBg: 'bg-emerald-100/80',
      badgeBorder: 'border-emerald-300',
      title: 'Partner With BackStory',
      category: 'Preservation, Travel & Gifts',
      description: 'Ideal for custom binding, photography, ancestry research, and commemorative heirlooms.',
      whyItFits: 'Members are actively converting digital memories into physical gifts and books.',
      highlights: ['High Purchasing Intent', 'Keepsake Buyers', 'Exclusive Category Lock'],
      icon: <Gift className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-200/80',
      cardBg: 'bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20',
      cardBorder: 'border-emerald-200/70',
      hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-100/50',
      buttonText: 'Claim This Spot',
      buttonStyle: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-600/20'
    },
    {
      id: 'community',
      badge: 'Community Sponsor',
      badgeColor: 'text-indigo-800',
      badgeBg: 'bg-indigo-100/80',
      badgeBorder: 'border-indigo-300',
      title: 'Support Timeless Voices',
      category: 'Arts, Education & Non-Profit',
      description: 'Sponsor emerging memoirs, intergenerational oral histories, and community storytelling projects.',
      whyItFits: 'Foster lasting goodwill by championing personal history and creative arts.',
      highlights: ['Authentic Goodwill', 'Local & National Reach', 'Mission Aligned'],
      icon: <HeartHandshake className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-200/80',
      cardBg: 'bg-gradient-to-br from-indigo-50/40 via-white to-violet-50/20',
      cardBorder: 'border-indigo-200/70',
      hoverBorder: 'hover:border-indigo-400 hover:shadow-indigo-100/50',
      buttonText: 'Partner With Us',
      buttonStyle: 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-sm shadow-indigo-600/20'
    }
  ];

  const handleOpenModal = (slotName: string) => {
    setSelectedSlot(slotName);
    setFormState(prev => ({ ...prev, placement: slotName }));
    setFormSubmitted(false);
    setIsModalOpen(true);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.email.trim()) return;
    setFormSubmitted(true);
  };

  return (
    <div className="space-y-4 relative">
      {/* Header with Title */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
            Sponsors &amp; Spotlight
          </h3>
        </div>
      </div>

      {/* Visually Enticing Sponsor Cards */}
      <div className="flex flex-col gap-3.5">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`${card.cardBg} border ${card.cardBorder} rounded-2xl p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${card.hoverBorder} flex flex-col gap-3 relative group`}
          >
            {/* Top pill & category */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${card.badgeBg} ${card.badgeColor} border ${card.badgeBorder}`}>
                {card.badge}
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                {card.category}
              </span>
            </div>

            {/* Header info */}
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl border ${card.iconBg} shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-serif text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mt-1 font-sans">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Highlights Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {card.highlights.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[9.5px] font-medium text-slate-600 bg-white/80 border border-slate-200/70 px-2 py-0.5 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Action CTA Button */}
            <button
              onClick={() => handleOpenModal(card.title)}
              className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 ${card.buttonStyle} font-semibold text-xs rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]`}
            >
              <span>{card.buttonText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Direct Contact Footer Link */}
      <div className="text-center pt-1">
        <button
          onClick={() => handleOpenModal('Custom Media Kit')}
          className="text-xs text-slate-500 hover:text-amber-800 transition-colors inline-flex items-center gap-1 font-medium underline underline-offset-2"
        >
          <Mail className="w-3 h-3" />
          <span>Request Media Kit &amp; Rates</span>
        </button>
      </div>

      {/* Interactive Advertise on BackStory Inquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
                <Megaphone className="w-4 h-4" />
                <span>Partner with BackStory</span>
              </div>
              <h2 className="font-serif text-2xl font-bold mt-1 text-white">
                Advertise to High-Intent Creators
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Connect your brand with passionate storytellers, multi-generational families, and keepsake book buyers.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {formSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Inquiry Received!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Thank you for your interest in partnering with BackStory. Our partnerships director will review your details and reach out within 1 business day.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  {/* Audience highlights grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-150 text-center">
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-serif">94%</div>
                      <div className="text-[10px] text-slate-500 font-medium">Read Through</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-serif">82%</div>
                      <div className="text-[10px] text-slate-500 font-medium">Physical Book Buyers</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-serif">100%</div>
                      <div className="text-[10px] text-slate-500 font-medium">Brand-Safe Story Feed</div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Work Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="s.jenkins@brand.com"
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Company or Brand
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.company}
                        onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                        placeholder="e.g. Heirloom Bindery Co."
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Placement Interest
                      </label>
                      <select
                        value={formState.placement}
                        onChange={(e) => setFormState({ ...formState, placement: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
                      >
                        <option value="Prime Sidebar Spotlight">Prime Sidebar Spotlight</option>
                        <option value="Category Exclusive Partner">Category Exclusive Partner</option>
                        <option value="Community & Arts Sponsor">Community &amp; Arts Sponsor</option>
                        <option value="StoryBook Print Insert">StoryBook Print Keepsake Insert</option>
                        <option value="Custom Media Campaign">Custom Media Campaign</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Brief Goals or Message (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Tell us what audience or product you would like to promote..."
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">
                      Direct: <a href="mailto:partnerships@backstory.ai" className="text-amber-800 hover:underline">partnerships@backstory.ai</a>
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminComponentTag name="SponsorsPanel" />
    </div>
  );
}
