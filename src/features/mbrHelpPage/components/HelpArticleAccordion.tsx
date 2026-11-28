/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { HELP_CATEGORIES, HelpFaqItem } from '../constants/helpContent';

interface HelpArticleAccordionProps {
  items: HelpFaqItem[];
  showCategoryBadge?: boolean;
}

export default function HelpArticleAccordion({
  items,
  showCategoryBadge = false,
}: HelpArticleAccordionProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() =>
    items.length > 0 ? { [items[0].id]: true } : {}
  );
  const [helpfulIds, setHelpfulIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenIds(items.length > 0 ? { [items[0].id]: true } : {});
  }, [items]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (items.length === 0) {
    return (
      <div className="relative bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-2">
        <p className="font-serif text-base font-bold text-slate-700 dark:text-slate-200">
          No matching help articles found
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Try a different keyword (like &ldquo;MFA&rdquo;, &ldquo;book&rdquo;, &ldquo;credits&rdquo;, or &ldquo;messaging&rdquo;) or browse a topic on the left.
        </p>
        <AdminComponentTag name="HelpArticleAccordion" />
      </div>
    );
  }

  return (
    <div className="relative space-y-3">
      {items.map((item) => {
        const isOpen = Boolean(openIds[item.id]);
        const catMeta = HELP_CATEGORIES.find((c) => c.id === item.category);
        const markedHelpful = Boolean(helpfulIds[item.id]);

        return (
          <div
            key={item.id}
            className={`bg-white dark:bg-slate-900 border rounded-3xl transition-all overflow-hidden ${
              isOpen
                ? 'border-blue-200/90 dark:border-blue-800/80 shadow-sm'
                : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-start justify-between gap-4 cursor-pointer group"
            >
              <div className="space-y-1 min-w-0">
                {showCategoryBadge && catMeta && (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border mb-1 ${catMeta.badgeClass}`}>
                    {catMeta.title}
                  </span>
                )}
                <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {item.question}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isOpen
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rotate-180'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed pt-3">
                      {item.answer}
                    </p>

                    {item.steps && item.steps.length > 0 && (
                      <ol className="space-y-2.5">
                        {item.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                            <span className="w-5 h-5 rounded-full bg-[#0F1B35] text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    {item.tip && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Tip: </span>
                          <span>{item.tip}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setHelpfulIds((prev) => ({ ...prev, [item.id]: true }))}
                        disabled={markedHelpful}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
                          markedHelpful
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {markedHelpful ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Thanks!</span>
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Helpful</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <AdminComponentTag name="HelpArticleAccordion" />
    </div>
  );
}
