import React from 'react';
import { Sparkles } from 'lucide-react';
import type { MailFolder } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface MailFolderMeta {
  id: MailFolder;
  label: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
}

interface MailFoldersMenuProps {
  folders: MailFolderMeta[];
  activeFolder: MailFolder;
  inboxUnreadBadge: number;
  onSelectFolder: (folder: MailFolder) => void;
}

export const MailFoldersMenu: React.FC<MailFoldersMenuProps> = ({
  folders,
  activeFolder,
  inboxUnreadBadge,
  onSelectFolder,
}) => {
  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="pb-3 mb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Folders</span>
        </h3>
      </div>

      <nav className="space-y-1.5" aria-label="Messaging Folders Navigation">
        {folders.map(({ id, label, Icon }) => {
          const isActive = activeFolder === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectFolder(id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-sans font-semibold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
              </div>

              {id === 'inbox' && inboxUnreadBadge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {inboxUnreadBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <AdminComponentTag name="MailFoldersMenu" />
    </div>
  );
};
