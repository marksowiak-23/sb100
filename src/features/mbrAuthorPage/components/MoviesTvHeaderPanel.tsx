/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MoviesTvHeaderPanelProps {
  onClickBack?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export default function MoviesTvHeaderPanel({
  title = 'My Movies & TV',
  description = 'Capture memorable stories about your favorite films, cinema experiences, television shows, and the stories on screen that touched your life.',
  className = ''
}: MoviesTvHeaderPanelProps) {
  return (
    <div className={`relative mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <AdminComponentTag name="MoviesTvHeaderPanel.tsx" />

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20 text-white shrink-0">
              <Film className="w-5 h-5" />
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

export { MoviesTvHeaderPanel, MoviesTvHeaderPanel as moviesTvHeaderPanel };
