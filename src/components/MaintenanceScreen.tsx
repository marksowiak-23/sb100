import React from 'react';
import { Wrench, RefreshCw, ShieldCheck } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MaintenanceScreenProps {
  onRefresh: () => void;
  onAdminSignIn: () => void;
  isChecking?: boolean;
  message?: string;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  onRefresh,
  onAdminSignIn,
  isChecking = false,
  message = 'Please check back in a few minutes.',
}) => {
  const displayMsg = message.trim() || 'Please check back in a few minutes.';
  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#1C1917] flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#FDFCFB] border border-[#E7E2D8] rounded-3xl shadow-sm p-8 sm:p-10 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Wrench className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-700">
            Scheduled Maintenance
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917]">
            We&rsquo;ll be right back
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-serif leading-relaxed">
            BackStory is currently undergoing scheduled maintenance to keep your stories safe and
            fast. {displayMsg}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isChecking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-serif font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Status...' : 'Check Again'}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-[#EFECE7] flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onAdminSignIn}
            className="inline-flex items-center gap-1.5 text-xs font-serif text-stone-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Sign In</span>
          </button>
        </div>
      </div>

      <AdminComponentTag name="MaintenanceScreen" />
    </div>
  );
};
