/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface GroupHeaderProps {
  success: string | null;
  error: string | null;
  onClickBack?: () => void;
}

export default function GroupHeader({
  success,
  error
}: GroupHeaderProps) {
  return (
    <div className="relative mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
      <AdminComponentTag name="GroupHeader.tsx" />

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                My Groups
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize other StoryBook members into your personal groups to control sharing and story access permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Feedback Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { GroupHeader as ConnectionHeader };
