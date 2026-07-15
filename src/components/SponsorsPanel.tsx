/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bookmark, Award, Feather, ArrowUpRight } from 'lucide-react';

interface Sponsor {
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
}

export default function SponsorsPanel() {
  const sponsors: Sponsor[] = [
    {
      name: 'Heritage Press',
      category: 'Memoir printing & binding',
      description: 'Print custom leather-bound editions of your completed Storybook.',
      icon: <Bookmark className="w-5 h-5 text-amber-600" />,
      actionText: 'Get Quote'
    },
    {
      name: 'Memoir Arts Foundation',
      category: 'Non-profit arts advocate',
      description: 'Supporting legacy preservation for low-income seniors.',
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      actionText: 'Learn More'
    },
    {
      name: 'Lifetales Publishing',
      category: 'Editorial services',
      description: 'Professional ghostwriters and editors to refine your draft.',
      icon: <Feather className="w-5 h-5 text-blue-600" />,
      actionText: 'Meet Editors'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-serif text-lg font-bold text-slate-800">
          Sponsors
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Partner Program
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.name}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-slate-200 transition-all duration-200 flex flex-col gap-3.5"
          >
            {/* Header info */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                {sponsor.icon}
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-slate-800">
                  {sponsor.name}
                </h4>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                  {sponsor.category}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed">
              {sponsor.description}
            </p>

            {/* Button */}
            <button
              onClick={() => alert(`Redirecting to ${sponsor.name} sponsor page...`)}
              className="w-full flex items-center justify-center gap-1 py-2 border border-slate-150 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl transition-all duration-150"
            >
              <span>{sponsor.actionText}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
