import React from 'react';
import { Mail, Plus } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MailPageHeaderPanelProps {
  onCompose: () => void;
}

export const MailPageHeaderPanel: React.FC<MailPageHeaderPanelProps> = ({ onCompose }) => {
  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white shrink-0">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-white leading-tight">
            Messaging
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Private member messaging
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCompose}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-sans font-bold shadow-xs transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Compose Message</span>
      </button>

      <AdminComponentTag name="MailPageHeaderPanel" />
    </div>
  );
};
