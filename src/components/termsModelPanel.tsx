/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  X,
  ShieldCheck,
  CreditCard,
  Megaphone,
  BookOpen,
  Printer,
  Sparkles,
  Users,
  Search,
  Check,
  Scale,
  HeartHandshake,
  UserCheck,
  QrCode,
  Link2,
  Code2,
  MessageSquare
} from 'lucide-react';
import { AdminComponentTag } from './AdminComponentTag';

export interface TermsModelPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SbTermsModalProps = TermsModelPanelProps;

interface TermSection {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function TermsModelPanel({ isOpen, onClose }: TermsModelPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sections: TermSection[] = useMemo(() => [
    {
      id: 'overview',
      title: '1. Overview & Agreement to Terms',
      badge: 'Agreement',
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-slate-800">
            Welcome to StoryBook. These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;you&quot;, &quot;your&quot;, or &quot;User&quot;) and StoryBook, Inc. (&quot;StoryBook&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
          </p>
          <p>
            These Terms govern your access to and use of StoryBook websites, mobile applications, social connection tools, memoir publishing tools, interactive community features, AI-assisted writing companions (including StoryMate), photo archives, and custom book printing services (collectively, the &quot;Services&quot;).
          </p>
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] space-y-1">
            <span className="font-bold text-blue-900 block font-mono uppercase tracking-wider">Key Agreement Summary</span>
            <p className="text-blue-800 leading-normal">
              By accessing, browsing, registering an account, connecting with other members, or purchasing services on StoryBook, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our Services.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'services',
      title: '2. The Services We Provide',
      badge: 'Platform',
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
      content: (
        <div className="space-y-3">
          <p>
            StoryBook is primarily an online storytelling website and social connection platform designed to capture, archive, and share personal life journeys, everyday reflections, and family histories:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-650">
            <li>
              <strong>Social Connection &amp; Sharing:</strong> Find and connect with family, friends, and community members, manage connection groups (Close Family, Extended Family, Friends, and Public), and share stories across social circles.
            </li>
            <li>
              <strong>Interactive Life &amp; Tribute Storybooks:</strong> Personal workspaces to collect, organize, write, and illustrate stories across life topics, from early childhood to career, relationships, travels, and milestones.
            </li>
            <li>
              <strong>StoryMate AI Writing Companion:</strong> Generative prompts, conversation-based question sparks, and formatting assistance to help inspire and structure your memoirs while maintaining full author autonomy.
            </li>
            <li>
              <strong>High-Resolution Photo Preservation:</strong> Secure digital vaults to organize family albums, portraits, and historical keepsakes.
            </li>
            <li>
              <strong>Heirloom Print Fulfillment:</strong> Premium hardcover and softcover custom-printed books, individually manufactured and shipped worldwide.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'social',
      title: '3. Social Connections, Member Interactions & Invitations',
      badge: 'Social & Connections',
      icon: <Users className="w-4 h-4 text-blue-600" />,
      content: (
        <div className="space-y-3.5">
          <p className="font-semibold text-slate-800">
            StoryBook enables members to discover others, form social connections, exchange comments, and share personal memories. The following rules govern social features:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Member-to-Member Disclaimers</span>
              </div>
              <p className="text-[11px] text-slate-650 leading-relaxed">
                StoryBook provides the platform and communication tools for social connection, but <strong>we do not accept liability for any user post, story, comment, message, or conduct</strong> originating from a member. You interact, connect, and communicate with other members solely at your own discretion.
              </p>
            </div>

            <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-800 uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>Invitations, Links &amp; QR Codes</span>
              </div>
              <p className="text-[11px] text-slate-650 leading-relaxed">
                You may share invitation links, connection invites, and QR codes generated by StoryBook for their intended purpose of connecting with genuine friends, family, and collaborators. You must not broadcast private invitation links as spam or falsely imply StoryBook endorsement.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-750">
            <span className="font-bold text-slate-900 block">External Hyperlinks in Stories:</span>
            <p>
              Users may include hyperlinks to external websites (e.g., historical archives, genealogy databases, personal blogs) within their stories or profiles. StoryBook does not endorse, verify, or take responsibility for the content, privacy practices, or availability of third-party websites.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'funding',
      title: '4. How Our Services Are Funded: User Payments & Paid Advertising',
      badge: 'Funding Model',
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      content: (
        <div className="space-y-3.5">
          <p className="font-semibold text-slate-800">
            StoryBook operates on a dual-revenue model combining paid customer products with privacy-first paid advertising and sponsorships:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Box A: Paid User Products */}
            <div className="p-4 bg-white border border-[#EFECE7] rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>4.1 Paid Products &amp; Printing</span>
              </div>
              <p className="text-slate-650 leading-relaxed">
                StoryBook offers premium paid products, including printed hardcover book packages, additional print copies, expedited shipping, extended account subscriptions beyond standard project windows, and expanded media storage tiers.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>All fees and packages are clearly displayed prior to purchase.</li>
                <li>Charges are processed securely via certified payment providers.</li>
                <li>Standard packages include full digital publishing and one hardcover print volume up to package page limits.</li>
              </ul>
            </div>

            {/* Box B: Paid Advertising & Sponsorship */}
            <div className="p-4 bg-white border border-[#EFECE7] rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                <Megaphone className="w-4 h-4 text-amber-600 shrink-0" />
                <span>4.2 Paid Advertising &amp; Sponsors</span>
              </div>
              <p className="text-slate-650 leading-relaxed">
                To keep digital tools accessible and continuously develop new features, we display sponsored content, partner advertisements, and relevant promotional offers across designated areas of our platform.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li><strong>We NEVER sell your personal data:</strong> Advertisers never receive your private identity, memoirs, or contact info.</li>
                <li>Advertisers specify target categories (e.g., family history or bookbinding enthusiasts), and our system displays ads safely.</li>
                <li>Sponsored posts and advertisements are always transparently labeled.</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-normal">
            <strong>Your Privacy In Advertising:</strong> We never use the private contents of your unpublished personal memoirs, private family letters, or intimate health/relationship notes to serve personalized third-party ads.
          </div>
        </div>
      )
    },
    {
      id: 'ownership',
      title: '5. Your Content & Intellectual Property (You Own Your Stories)',
      badge: 'Ownership & IP',
      icon: <ShieldCheck className="w-4 h-4 text-blue-700" />,
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-slate-800 text-sm">
            You retain 100% ownership of the copyright and intellectual property in the stories, reflections, and photographs you create and upload to StoryBook.
          </p>
          <p>
            Nothing in these Terms takes away your ownership rights. You are completely free to share, print, export, or publish your personal stories wherever and whenever you want.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-[11px] text-slate-700">
            <span className="font-bold text-slate-900 font-mono uppercase tracking-wider block">Limited Operating License Granted to StoryBook:</span>
            <p>
              Solely to enable us to host, format, generate digital previews, index your chapters, generate AI prompts you request, display stories to your approved connections, and manufacture and ship physical books, you grant StoryBook a non-exclusive, worldwide, royalty-free, transferable license to store, process, reproduce, and transmit your content.
            </p>
            <p className="font-semibold text-slate-800">
              This license terminates immediately when your content or account is deleted from our active systems.
            </p>
          </div>
          <p className="text-slate-650">
            <strong>Contributors &amp; Collaborators:</strong> When friends or family contribute content to your book through an invitation link, they retain ownership of their respective contributions and authorize you (the Organizer) and StoryBook to format and print their submission in your book.
          </p>
        </div>
      )
    },
    {
      id: 'platform-ip',
      title: '6. Website Intellectual Property, Anti-Scraping & Feedback',
      badge: 'Website Assets',
      icon: <Code2 className="w-4 h-4 text-slate-700" />,
      content: (
        <div className="space-y-3.5 text-slate-650">
          <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-2 shadow-2xs">
            <span className="font-bold text-slate-900 text-xs block">StoryBook Platform Property vs. User Memoirs</span>
            <p className="text-[11px] leading-relaxed">
              All copyright and rights in the StoryBook website design, layout architecture, software code, graphic artwork, prompts, question spark libraries, brand names, and logos belong exclusively to StoryBook, Inc. You are granted a limited, personal, revocable license to access and view the website for your own personal use.
            </p>
            <p className="text-[11px] font-semibold text-slate-800">
              You are strictly prohibited from using data mining robots, scraping crawlers, metatagging, framing, or mirroring StoryBook website content without our prior written permission.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
            <span className="font-bold text-slate-850 block">Product Suggestions &amp; Feedback (&quot;Comments&quot;):</span>
            <p>
              Any feedback, suggestions, reviews, or feature ideas you provide to us regarding the StoryBook website or business become the property of StoryBook. We may use such feedback to improve or promote the platform without royalty or compensation. <strong>This does not apply to personal memoirs, stories, or photos</strong>, which remain your exclusive property under Section 5.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'printing',
      title: '7. Book Production, Printing, Delivery & Guarantee',
      badge: 'Print Orders',
      icon: <Printer className="w-4 h-4 text-purple-600" />,
      content: (
        <div className="space-y-3">
          <p>
            Because each StoryBook printed edition is custom manufactured specifically for you, the following terms govern physical book production and fulfillment:
          </p>
          <div className="space-y-2 text-slate-650">
            <div className="p-3 bg-white border border-[#EFECE7] rounded-xl space-y-1">
              <span className="font-bold text-slate-800 text-xs block">Pre-Print Review &amp; Proof Approval</span>
              <p className="text-[11px]">
                You are solely responsible for reviewing your digital proof before authorizing print production. Check all spelling, grammar, captions, dates, and image placements carefully. Once print production is authorized, changes cannot be made to that print run.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#EFECE7] rounded-xl space-y-1">
              <span className="font-bold text-slate-800 text-xs block">Page Limits &amp; Overage Charges</span>
              <p className="text-[11px]">
                Standard hardcover packages include up to the designated page threshold (typically 150 pages). Books exceeding the threshold will incur standard nominal page overage fees as stated in your package breakdown prior to print submission.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#EFECE7] rounded-xl space-y-1">
              <span className="font-bold text-slate-800 text-xs block">Voluntary 30-Day Money-Back Guarantee &amp; Defect Remedy</span>
              <p className="text-[11px]">
                You may request a full refund within 30 days of purchase, provided printing has not yet been authorized. If a printed volume arrives damaged, defective in binding, or with manufacturing faults, contact us with photos within 14 days of delivery for a free prompt replacement.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'commitments',
      title: '8. Your Commitments & Community Guidelines',
      badge: 'Community Standards',
      icon: <Users className="w-4 h-4 text-amber-600" />,
      content: (
        <div className="space-y-3 text-slate-650">
          <p>
            To protect our community and ensure StoryBook remains a secure, authentic home for memories, all users must abide by the following standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-750">
            <li><strong>Age Requirement:</strong> You must be at least 13 years old to create an account or use StoryBook.</li>
            <li><strong>Accurate Information:</strong> Provide accurate information and maintain the security of your account credentials.</li>
            <li><strong>Respect Rights &amp; Privacy:</strong> Do not upload photographs, letters, or sensitive materials of third parties without proper consent or authority.</li>
            <li><strong>Prohibited Material:</strong> Do not publish defamatory, obscene, harassing, fraudulent, hateful, or unlawful materials.</li>
            <li><strong>System Integrity:</strong> You must not upload malicious code, conduct automated data scraping, or bypass platform access controls.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'legacy',
      title: '9. Legacy Contact & Memorialization',
      badge: 'Memorialization',
      icon: <HeartHandshake className="w-4 h-4 text-rose-600" />,
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-slate-800">
            Because memoirs and family history are meant to endure for generations, StoryBook provides legacy preservation protocols:
          </p>
          <p className="text-slate-650">
            You may designate a trusted individual as your <strong>Legacy Contact</strong> within your account preferences. In the event of death or incapacity, your designated Legacy Contact or verified legal representative (presenting appropriate documentation) may request limited administrative access to preserve your books, finalize printing orders, or export archives for family posterity.
          </p>
          <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-[11px] text-rose-900">
            Unless expressly authorized in writing by the account holder prior to passing, a Legacy Contact cannot modify historical stories or alter existing copyrights.
          </div>
        </div>
      )
    },
    {
      id: 'liability',
      title: '10. Disclaimers, Indemnity & Liability Limits',
      badge: 'Legal Provisions',
      icon: <Scale className="w-4 h-4 text-slate-700" />,
      content: (
        <div className="space-y-3 text-slate-650">
          <p>
            <strong>&quot;As Is&quot; Provision:</strong> We work diligently to provide reliable, beautiful software and print production. However, digital services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, express or implied.
          </p>
          <p>
            <strong>User Indemnification:</strong> By accessing and using StoryBook, you agree to indemnify, defend, and hold harmless StoryBook, Inc., its directors, officers, and employees from any claims, actions, liabilities, damages, and legal costs arising from content you publish, stories or photos you upload, or your breach of these Terms.
          </p>
          <p>
            <strong>Limitation of Liability:</strong> To the fullest extent permitted by law, StoryBook shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or data. Our aggregate liability for any claims arising from the Services shall not exceed the greater of $100 or the total amount paid by you to StoryBook in the preceding 12 months.
          </p>
          <p>
            <strong>Governing Law &amp; Jurisdiction:</strong> These Terms are governed by and construed in accordance with applicable laws without regard to conflict of law principles. Any dispute arising under these Terms shall be resolved in competent courts as specified in our detailed dispute resolution protocol.
          </p>
        </div>
      )
    }
  ], []);

  // Filter sections by search query or active category
  const filteredSections = useMemo(() => {
    let result = sections;
    if (activeTab !== 'all') {
      result = result.filter(s => s.id === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.badge.toLowerCase().includes(q)
      );
    }
    return result;
  }, [sections, activeTab, searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-default"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Top Accent Gradient Line */}
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 w-full shrink-0" />

            {/* Modal Header */}
            <div className="p-4 sm:p-6 pb-4 border-b border-[#EFECE7] flex items-center justify-between bg-gradient-to-r from-blue-50/40 via-amber-50/20 to-purple-50/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-850 tracking-tight flex items-center gap-2">
                    <span>Terms of Service</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100/70 text-blue-800 rounded-full font-bold">
                      v2026.2
                    </span>
                  </h2>
                  <p className="font-serif text-xs text-slate-500">
                    Effective: January 1, 2026 • Online Platform, Social Connections &amp; Custom Publishing
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Navigation Bar */}
            <div className="p-3 sm:px-6 sm:py-3 bg-white border-b border-[#EFECE7] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
              {/* Category Quick Jump Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Sections
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('social')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'social'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Social Connections
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('funding')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'funding'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Payments &amp; Ads
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ownership')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'ownership'
                      ? 'bg-blue-700 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Your Content &amp; IP
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('platform-ip')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'platform-ip'
                      ? 'bg-slate-800 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Website Assets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('printing')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'printing'
                      ? 'bg-purple-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Book Printing
                </button>
              </div>

              {/* Search Field */}
              <div className="relative min-w-[180px] sm:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-xs font-serif leading-relaxed">
              {filteredSections.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="font-semibold text-slate-700">No terms match your search.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                filteredSections.map((sec) => (
                  <section
                    key={sec.id}
                    id={sec.id}
                    className="p-4 sm:p-5 bg-white border border-[#EFECE7] rounded-2xl shadow-2xs space-y-3 transition-all hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                          {sec.icon}
                        </div>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-slate-850">
                          {sec.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">
                        {sec.badge}
                      </span>
                    </div>

                    <div className="text-slate-650 text-xs font-sans leading-relaxed">
                      {sec.content}
                    </div>
                  </section>
                ))
              )}

              {/* Questions & Contact Callout */}
              <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850 text-xs font-serif">Have questions regarding our Terms or Community Guidelines?</span>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Our community trust and legal team is here to assist you at support@storybook.com.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  I Understand &amp; Agree
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#EFECE7] bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-sans shrink-0">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>StoryBook, Inc. • Community &amp; Trust Assured</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <AdminComponentTag name="termsModelPanel" />
    </AnimatePresence>
  );
}

export { TermsModelPanel, TermsModelPanel as termsModelPanel, TermsModelPanel as SbTermsModal };
