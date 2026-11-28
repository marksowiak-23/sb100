/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LifeBuoy, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { HELP_CATEGORIES, HELP_FAQ_ITEMS, HelpCategoryId } from '../constants/helpContent';
import HelpPageHeaderPanel from './HelpPageHeaderPanel';
import HelpNavigationMenu from './HelpNavigationMenu';
import HelpHeader from './HelpHeader';
import HelpArticleAccordion from './HelpArticleAccordion';
import HelpSupportTicketPanel from './HelpSupportTicketPanel';

export interface MbrHelpFeatureProps {
  isSandbox?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export default function MbrHelpFeature({ isSandbox = false, onNavigateTab }: MbrHelpFeatureProps) {
  const [activeCategory, setActiveCategory] = useState<HelpCategoryId>('getting-started');
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const countsByCategory = useMemo(() => {
    const counts = {} as Record<HelpCategoryId, number>;
    for (const cat of HELP_CATEGORIES) {
      counts[cat.id] = HELP_FAQ_ITEMS.filter((i) => i.category === cat.id).length;
    }
    return counts;
  }, []);

  const activeCategoryMeta = useMemo(
    () => HELP_CATEGORIES.find((c) => c.id === activeCategory) || HELP_CATEGORIES[0],
    [activeCategory]
  );

  const isSearching = searchQuery.trim().length > 0;

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return HELP_FAQ_ITEMS.filter((item) => item.category === activeCategory);
    }
    return HELP_FAQ_ITEMS.filter((item) => {
      const haystack = [
        item.question,
        item.summary,
        item.answer,
        item.tip || '',
        ...(item.steps || []),
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
        {/* LEFT COLUMN */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3 sm:space-y-4 lg:space-y-5">
          <HelpPageHeaderPanel />

          <HelpNavigationMenu
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              setShowSupportForm(false);
              setSearchQuery('');
            }}
            countsByCategory={countsByCategory}
          />

          {/* Need More Help Hero Card */}
          <div className="bg-gradient-to-br from-[#0F1B35] via-slate-900 to-[#13294B] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-slate-700/70 space-y-3">
            <div className="absolute -right-3 -bottom-3 opacity-10 text-amber-300 pointer-events-none">
              <LifeBuoy className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                NEED MORE HELP?
              </span>
            </div>
            <p className="text-xs font-serif text-slate-200 leading-relaxed relative z-10">
              Can&rsquo;t find the answer you&rsquo;re looking for? Our support team is happy to help.
            </p>
            <div className="space-y-1.5 relative z-10 pt-1">
              <button
                type="button"
                onClick={() => setShowSupportForm(true)}
                className={`w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  showSupportForm
                    ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-300" />
                  <span>Email Support</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('mbrSecurityPage')}
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-blue-200 transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                    <span>My Security &amp; MFA</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          {showSupportForm ? (
            <HelpSupportTicketPanel
              isSandbox={isSandbox}
              onBackToHelp={() => setShowSupportForm(false)}
              onOpenMessaging={onNavigateTab ? () => onNavigateTab('mbrMailPage') : undefined}
            />
          ) : (
            <>
              <HelpHeader
                category={activeCategoryMeta}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalMatches={visibleItems.length}
              />

              <HelpArticleAccordion
                items={visibleItems}
                showCategoryBadge={isSearching}
              />
            </>
          )}

          <div className="pt-6 flex justify-center">
            <AdminComponentTag name="MbrHelpFeature" />
          </div>
        </main>
      </div>
    </div>
  );
}
