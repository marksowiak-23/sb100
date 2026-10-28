/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  X,
  Lock,
  EyeOff,
  Printer,
  Sparkles,
  Database,
  Globe,
  Search,
  Scale,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { AdminComponentTag } from './AdminComponentTag';

export interface PrivacyModelPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SbPrivacyModalProps = PrivacyModelPanelProps;

interface PrivacySection {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function PrivacyModelPanel({ isOpen, onClose }: PrivacyModelPanelProps) {
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

  const sections: PrivacySection[] = useMemo(() => [
    {
      id: 'overview',
      title: '1. Our Privacy Commitment & Overview',
      badge: 'Commitment',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-slate-800">
            At StoryBook, your personal memories, life stories, and family photos are deeply sacred. We believe your history belongs to you and your loved ones.
          </p>
          <p>
            This Privacy Policy explains how StoryBook, Inc. (&quot;StoryBook&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, protects, and discloses personal information when you visit our website, utilize our storytelling applications, collaborate on family tribute books, interact with our AI writing companion (StoryMate), or order custom printed editions.
          </p>
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] space-y-1">
            <span className="font-bold text-emerald-900 block font-mono uppercase tracking-wider">The StoryBook Privacy Pledge</span>
            <p className="text-emerald-800 leading-normal">
              We <strong>NEVER sell your personal information or the contents of your memoirs</strong> to third-party data brokers or advertisers. Your stories, photos, and family records are never used to train open public foundation models or shared outside of authorized book creation and printing fulfillment.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      badge: 'Data Collection',
      icon: <Database className="w-4 h-4 text-blue-600" />,
      content: (
        <div className="space-y-3">
          <p>We collect information in three primary categories to provide and fulfill our services:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-800 text-xs block">Account &amp; Identity</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Name, email address, password, profile avatar, phone number, and optional biographical details you include on your profile page.
              </p>
            </div>

            <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-800 text-xs block">Memoir &amp; Book Content</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Stories, reflections, answers to question sparks, career records, relationship trees, historical photos, captions, and collaborator contributions.
              </p>
            </div>

            <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-800 text-xs block">Orders &amp; Device Data</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Billing address, shipping address, print volume specifications, order history, IP address, device type, browser settings, and cookie identifiers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      title: '3. How We Use Your Information',
      badge: 'Data Usage',
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
      content: (
        <div className="space-y-2.5 text-slate-650">
          <p>We utilize the collected information strictly for legitimate operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-750 text-xs">
            <li><strong>Digital Book Creation &amp; Editing:</strong> Storing, rendering, formatting, and indexing your chapters, topics, and photo galleries across devices.</li>
            <li><strong>AI Writing Assistance (StoryMate):</strong> Generating personalized writing sparks, suggested structure, and proofreading improvements when you explicitly prompt our AI assistant.</li>
            <li><strong>Order Fulfillment &amp; Printing:</strong> Sending your approved print files to certified regional printing and binding facilities and coordinating courier delivery.</li>
            <li><strong>Account Security &amp; Fraud Prevention:</strong> Authenticating logins, validating purchase transactions, and shielding community features from automated misuse.</li>
            <li><strong>Customer Support &amp; Updates:</strong> Sending purchase receipts, digital proofs, shipping tracking notices, and responding to help inquiries.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'protection',
      title: '4. Memoir Confidentiality & AI Privacy',
      badge: 'Story Protection',
      icon: <EyeOff className="w-4 h-4 text-purple-600" />,
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-slate-800">
            How does StoryBook protect your personal memoirs and private family history?
          </p>
          <div className="space-y-2 text-slate-650">
            <div className="p-3 bg-white border border-[#EFECE7] rounded-xl space-y-1">
              <span className="font-bold text-slate-800 text-xs block">Private by Default</span>
              <p className="text-[11px]">
                Your stories and photos remain private unless you explicitly choose to share them with approved connections, invite collaborators, or order a shared tribute book.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#EFECE7] rounded-xl space-y-1">
              <span className="font-bold text-slate-800 text-xs block">StoryMate AI Boundaries</span>
              <p className="text-[11px]">
                When you use StoryMate for story inspiration or editing, your text is processed through secure, enterprise-grade AI models under strict agreements that forbid using your inputs to train or fine-tune public models.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#EFECE7] rounded-xl space-y-1">
              <span className="font-bold text-slate-800 text-xs block">End-to-End Encryption in Transit &amp; At Rest</span>
              <p className="text-[11px]">
                All network transmissions are encrypted using modern TLS (HTTPS) standards. High-resolution photographs and memoir databases are encrypted at rest using industry-standard AES-256 protocols.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sharing',
      title: '5. Sharing with Print Partners & Third Parties',
      badge: 'Fulfillment Partners',
      icon: <Printer className="w-4 h-4 text-blue-700" />,
      content: (
        <div className="space-y-3">
          <p>
            We only disclose your personal information to third-party service providers who assist us in operating our platform and delivering physical books:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 text-xs">
            <li>
              <strong>Commercial Printing &amp; Bookbinding Facilities:</strong> When you authorize book printing, high-resolution production PDFs are transmitted to our certified regional book printers to print, bind, and inspect your hardcover volumes.
            </li>
            <li>
              <strong>Shipping &amp; Logistics Carriers:</strong> Recipient names, delivery addresses, and phone numbers are shared with couriers (e.g., FedEx, UPS, USPS, DHL) solely to ensure accurate door-to-door delivery.
            </li>
            <li>
              <strong>Secure Payment Processors:</strong> Credit card transactions are handled directly by PCI-DSS compliant payment gateways (e.g., Stripe). StoryBook never stores full card numbers or CVV codes on our servers.
            </li>
            <li>
              <strong>Legal Compliance:</strong> We may disclose information if required by law, subpoena, or to protect the safety and rights of our users and the public.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'advertising',
      title: '6. Advertising Transparency & Cookie Choices',
      badge: 'Ad Transparency',
      icon: <Lock className="w-4 h-4 text-amber-600" />,
      content: (
        <div className="space-y-3 text-slate-650">
          <p>
            As detailed in our Terms of Service, StoryBook is supported by paid user products and thoughtfully curated, privacy-preserving sponsorships:
          </p>
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1.5">
            <span className="font-bold block uppercase tracking-wider font-mono">No Sale of Personal Data</span>
            <p>
              We do not sell, rent, or trade your contact details, names, or story texts to advertisers. Advertisers simply select high-level interest groups (e.g., genealogy or creative writing), and ads are displayed without identifying who you are.
            </p>
          </div>
          <p className="text-xs">
            <strong>Managing Cookies &amp; Tracking:</strong> You can configure your browser to block or alert you about cookies. To opt out of third-party targeted advertising networks, you can visit the Network Advertising Initiative (NAI) at <span className="font-mono text-blue-700">optout.networkadvertising.org</span> or the Digital Advertising Alliance (DAA) at <span className="font-mono text-blue-700">optout.aboutads.info</span>.
          </p>
        </div>
      )
    },
    {
      id: 'rights',
      title: '7. Your Rights, Data Access & Account Deletion',
      badge: 'Global Rights',
      icon: <Scale className="w-4 h-4 text-slate-700" />,
      content: (
        <div className="space-y-3 text-slate-650">
          <p>
            Whether you reside in the European Economic Area (under GDPR), the United Kingdom, California (under CCPA/CPRA), or elsewhere, StoryBook extends universal privacy protections:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-750 text-xs">
            <li><strong>Right to Access &amp; Portability:</strong> You may request an export of all personal stories, photos, and records you have created on StoryBook.</li>
            <li><strong>Right to Correction:</strong> You can edit and update your personal information directly within your Profile and Story Editor settings at any time.</li>
            <li><strong>Right to Deletion:</strong> You may delete individual stories, photos, or your entire account. Account deletion permanently removes your active memoirs and photos from our systems within 30 to 90 days.</li>
            <li><strong>Non-Discrimination:</strong> We will never discriminate against you, alter your book quality, or deny service for exercising your statutory privacy rights.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'contact',
      title: '8. International Transfers & Contact Information',
      badge: 'Contact Us',
      icon: <Globe className="w-4 h-4 text-emerald-700" />,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-slate-650">
            StoryBook operates secure cloud systems in the United States and works with certified international printing partners. If you access the Services outside the United States, your information is processed subject to standard contractual clauses ensuring equivalent safeguards.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-[11px] text-slate-700">
            <span className="font-bold text-slate-900 font-mono uppercase tracking-wider block">Privacy Officer &amp; Inquiries</span>
            <p>If you have any questions, requests to exercise privacy rights, or feedback regarding this policy, please reach out to us:</p>
            <p className="font-semibold text-slate-800">
              Email: privacy@storybook.com • StoryBook, Inc. Data Protection Office
            </p>
          </div>
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
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 w-full shrink-0" />

            {/* Modal Header */}
            <div className="p-4 sm:p-6 pb-4 border-b border-[#EFECE7] flex items-center justify-between bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-blue-50/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-850 tracking-tight flex items-center gap-2">
                    <span>Privacy Policy</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100/70 text-emerald-800 rounded-full font-bold">
                      v2026.1
                    </span>
                  </h2>
                  <p className="font-serif text-xs text-slate-500">
                    Effective: January 1, 2026 • Safeguarding Personal Memories, Profiles &amp; Print Data
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
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Sections
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('protection')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'protection'
                      ? 'bg-purple-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Story Protection
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sharing')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'sharing'
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Print &amp; Sharing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rights')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'rights'
                      ? 'bg-slate-800 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Your Rights
                </button>
              </div>

              {/* Search Field */}
              <div className="relative min-w-[180px] sm:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter privacy terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-xs font-serif leading-relaxed">
              {filteredSections.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="font-semibold text-slate-700">No privacy topics match your search.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                    className="text-xs text-emerald-600 font-bold hover:underline"
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
              <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850 text-xs font-serif">Have questions regarding your Data or Privacy Rights?</span>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Our Data Protection Officer and Privacy Team are ready to assist you at privacy@storybook.com.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Close &amp; Return
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#EFECE7] bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-sans shrink-0">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>StoryBook, Inc. • High-Assurance Data Privacy</span>
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
      <AdminComponentTag name="privacyModelPanel" />
    </AnimatePresence>
  );
}

export { PrivacyModelPanel, PrivacyModelPanel as privacyModelPanel, PrivacyModelPanel as SbPrivacyModal };
