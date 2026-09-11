/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface FamilyHeaderPanelProps {
  onClickBack?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export default function FamilyHeaderPanel({
  title = 'My Family',
  description = 'Document family relationships, spouses, parents, children, and ancestral heritage.',
  className = ''
}: FamilyHeaderPanelProps) {
  return (
    <div className={`relative mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <AdminComponentTag name="FamilyHeaderPanel.tsx" />

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/20 text-white shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { FamilyHeaderPanel, FamilyHeaderPanel as familyHeaderPanel };
