import React from 'react';
import { RefreshCw } from 'lucide-react';
import HeaderBackgroundCarousel from '@/src/components/HeaderBackgroundCarousel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import type { MailFolderMeta } from './MailFoldersMenu';

const MAIL_CAROUSEL_IMAGES = [
  '/carousel_friends_family.jpg',
  '/storybook_friends_connection.jpg',
  '/carousel_shared_memories.jpg',
  '/carousel_your_story.jpg',
];

interface MailFolderHeaderProps {
  folder: MailFolderMeta;
  loading: boolean;
  onSync: () => void;
}

export const MailFolderHeader: React.FC<MailFolderHeaderProps> = ({
  folder,
  loading,
  onSync,
}) => {
  const Icon = folder.Icon;

  return (
    <div className="relative">
      <HeaderBackgroundCarousel images={MAIL_CAROUSEL_IMAGES}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                {folder.label}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {folder.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSync}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200 text-slate-700 text-xs font-sans font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </HeaderBackgroundCarousel>

      <AdminComponentTag name="MailFolderHeader" />
    </div>
  );
};
