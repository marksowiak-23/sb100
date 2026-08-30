/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Calendar, 
  User, 
  Heart, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { mbrSettingsApi, MbrSettings } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MbrProfileDisplaySettingsPanelProps {
  isSandbox: boolean;
  mbrId: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

interface DisplaySettingItem {
  key: keyof Omit<MbrSettings, 'mbrSettingsId' | 'mbrId' | 'mbrSettingsCreatedAt' | 'mbrSettingsUpdatedAt'>;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'public' | 'demographics' | 'background' | 'media';
  recommended?: boolean;
}

const DISPLAY_SETTINGS_SCHEMA: DisplaySettingItem[] = [
  {
    key: 'mbrSettingsAllowPublicFlag',
    title: 'Public Profile Visibility',
    description: 'Allow public visitors and guests to search and view your member card and public stories.',
    icon: Globe,
    category: 'public',
    recommended: true
  },
  {
    key: 'mbrSettingsShowBirthYr',
    title: 'Show Birth Year',
    description: 'Display your birth year on your member profile header and story author cards.',
    icon: Calendar,
    category: 'demographics'
  },
  {
    key: 'mbrSettingsShowGender',
    title: 'Show Gender',
    description: 'Display your gender identification on your member profile demographics.',
    icon: User,
    category: 'demographics'
  },
  {
    key: 'mbrSettingsShowRelationship',
    title: 'Show Relationship Status',
    description: 'Display your relationship or marital status on your public profile.',
    icon: Heart,
    category: 'demographics'
  },
  {
    key: 'mbrSettingsShowTown',
    title: 'Show Hometown & Current Town',
    description: 'Display your hometown origin and current living location on your profile.',
    icon: MapPin,
    category: 'background'
  },
  {
    key: 'mbrSettingsShowWorksAt',
    title: 'Show Workplace & Employer',
    description: 'Display your current job title, workplace, or employer details.',
    icon: Briefcase,
    category: 'background'
  },
  {
    key: 'mbrSettingsShowStudiedAt',
    title: 'Show Education & Alma Mater',
    description: 'Display your university, college, school, or degrees earned.',
    icon: GraduationCap,
    category: 'background'
  },
  {
    key: 'mbrSettingsShowIntroduction',
    title: 'Show Biography & Introduction',
    description: 'Display your personal introductory story and life narrative biography.',
    icon: FileText,
    category: 'media',
    recommended: true
  },
  {
    key: 'mbrSettingsShowPhotoGallery',
    title: 'Show Member Photo Gallery',
    description: 'Display your uploaded member photo gallery collection to profile viewers.',
    icon: ImageIcon,
    category: 'media',
    recommended: true
  }
];

const DEFAULT_SETTINGS: Omit<MbrSettings, 'mbrSettingsCreatedAt' | 'mbrSettingsUpdatedAt'> = {
  mbrSettingsId: '',
  mbrId: '',
  mbrSettingsAllowPublicFlag: true,
  mbrSettingsShowBirthYr: true,
  mbrSettingsShowGender: true,
  mbrSettingsShowRelationship: true,
  mbrSettingsShowTown: true,
  mbrSettingsShowWorksAt: true,
  mbrSettingsShowStudiedAt: true,
  mbrSettingsShowIntroduction: true,
  mbrSettingsShowPhotoGallery: true
};

export default function MbrProfileDisplaySettingsPanel({
  isSandbox,
  mbrId,
  onDirtyChange
}: MbrProfileDisplaySettingsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<Omit<MbrSettings, 'mbrSettingsCreatedAt' | 'mbrSettingsUpdatedAt'>>({
    ...DEFAULT_SETTINGS,
    mbrId: mbrId || ''
  });

  const [initialSettings, setInitialSettings] = useState<typeof settings | null>(null);

  // Compute dirty status
  const isDirty = useMemo(() => {
    if (!initialSettings) return false;
    return (
      settings.mbrSettingsAllowPublicFlag !== initialSettings.mbrSettingsAllowPublicFlag ||
      settings.mbrSettingsShowBirthYr !== initialSettings.mbrSettingsShowBirthYr ||
      settings.mbrSettingsShowGender !== initialSettings.mbrSettingsShowGender ||
      settings.mbrSettingsShowRelationship !== initialSettings.mbrSettingsShowRelationship ||
      settings.mbrSettingsShowTown !== initialSettings.mbrSettingsShowTown ||
      settings.mbrSettingsShowWorksAt !== initialSettings.mbrSettingsShowWorksAt ||
      settings.mbrSettingsShowStudiedAt !== initialSettings.mbrSettingsShowStudiedAt ||
      settings.mbrSettingsShowIntroduction !== initialSettings.mbrSettingsShowIntroduction ||
      settings.mbrSettingsShowPhotoGallery !== initialSettings.mbrSettingsShowPhotoGallery
    );
  }, [settings, initialSettings]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Load settings on mount or when mbrId/isSandbox changes
  useEffect(() => {
    loadSettings();
  }, [mbrId, isSandbox]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!mbrId) {
      setLoading(false);
      return;
    }

    if (isSandbox) {
      // Sandbox mode: read from sessionStorage
      const sandboxKey = `sandbox_settings_${mbrId}`;
      const saved = sessionStorage.getItem(sandboxKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          setInitialSettings(parsed);
        } catch {
          const fresh = { ...DEFAULT_SETTINGS, mbrId, mbrSettingsId: 'sandbox-settings-id' };
          setSettings(fresh);
          setInitialSettings(fresh);
        }
      } else {
        const fresh = { ...DEFAULT_SETTINGS, mbrId, mbrSettingsId: 'sandbox-settings-id' };
        setSettings(fresh);
        setInitialSettings(fresh);
      }
      setLoading(false);
      return;
    }

    // Live Database mode: fetch from sb-api
    try {
      const data = await mbrSettingsApi.getMemberSettings(mbrId);
      if (data) {
        const loaded: typeof settings = {
          mbrSettingsId: data.mbrSettingsId,
          mbrId: data.mbrId,
          mbrSettingsAllowPublicFlag: data.mbrSettingsAllowPublicFlag,
          mbrSettingsShowBirthYr: data.mbrSettingsShowBirthYr,
          mbrSettingsShowGender: data.mbrSettingsShowGender,
          mbrSettingsShowRelationship: data.mbrSettingsShowRelationship,
          mbrSettingsShowTown: data.mbrSettingsShowTown,
          mbrSettingsShowWorksAt: data.mbrSettingsShowWorksAt,
          mbrSettingsShowStudiedAt: data.mbrSettingsShowStudiedAt,
          mbrSettingsShowIntroduction: data.mbrSettingsShowIntroduction,
          mbrSettingsShowPhotoGallery: data.mbrSettingsShowPhotoGallery
        };
        setSettings(loaded);
        setInitialSettings(loaded);
      }
    } catch (err: any) {
      // If 404, we initialize a fresh state to be saved upon user action
      if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
        const fresh: typeof settings = {
          ...DEFAULT_SETTINGS,
          mbrId
        };
        setSettings(fresh);
        setInitialSettings(fresh);
      } else {
        console.error("Error loading member settings:", err);
        setError(`Failed to retrieve member display settings: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof Omit<MbrSettings, 'mbrSettingsId' | 'mbrId' | 'mbrSettingsCreatedAt' | 'mbrSettingsUpdatedAt'>) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSetAll = (value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      mbrSettingsAllowPublicFlag: value,
      mbrSettingsShowBirthYr: value,
      mbrSettingsShowGender: value,
      mbrSettingsShowRelationship: value,
      mbrSettingsShowTown: value,
      mbrSettingsShowWorksAt: value,
      mbrSettingsShowStudiedAt: value,
      mbrSettingsShowIntroduction: value,
      mbrSettingsShowPhotoGallery: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mbrId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    if (isSandbox) {
      // Save to sessionStorage
      const sandboxKey = `sandbox_settings_${mbrId}`;
      sessionStorage.setItem(sandboxKey, JSON.stringify(settings));
      setInitialSettings(settings);
      setSuccess("Display settings saved successfully in Sandbox Mode!");
      setSaving(false);
      return;
    }

    try {
      let saved: MbrSettings;
      if (settings.mbrSettingsId) {
        // Update existing
        saved = await mbrSettingsApi.updateMemberSettings(settings.mbrSettingsId, {
          mbrSettingsAllowPublicFlag: settings.mbrSettingsAllowPublicFlag,
          mbrSettingsShowBirthYr: settings.mbrSettingsShowBirthYr,
          mbrSettingsShowGender: settings.mbrSettingsShowGender,
          mbrSettingsShowRelationship: settings.mbrSettingsShowRelationship,
          mbrSettingsShowTown: settings.mbrSettingsShowTown,
          mbrSettingsShowWorksAt: settings.mbrSettingsShowWorksAt,
          mbrSettingsShowStudiedAt: settings.mbrSettingsShowStudiedAt,
          mbrSettingsShowIntroduction: settings.mbrSettingsShowIntroduction,
          mbrSettingsShowPhotoGallery: settings.mbrSettingsShowPhotoGallery
        });
      } else {
        // Create new
        saved = await mbrSettingsApi.createMemberSettings({
          mbrId,
          mbrSettingsAllowPublicFlag: settings.mbrSettingsAllowPublicFlag,
          mbrSettingsShowBirthYr: settings.mbrSettingsShowBirthYr,
          mbrSettingsShowGender: settings.mbrSettingsShowGender,
          mbrSettingsShowRelationship: settings.mbrSettingsShowRelationship,
          mbrSettingsShowTown: settings.mbrSettingsShowTown,
          mbrSettingsShowWorksAt: settings.mbrSettingsShowWorksAt,
          mbrSettingsShowStudiedAt: settings.mbrSettingsShowStudiedAt,
          mbrSettingsShowIntroduction: settings.mbrSettingsShowIntroduction,
          mbrSettingsShowPhotoGallery: settings.mbrSettingsShowPhotoGallery
        });
      }

      const updatedState: typeof settings = {
        mbrSettingsId: saved.mbrSettingsId,
        mbrId: saved.mbrId,
        mbrSettingsAllowPublicFlag: saved.mbrSettingsAllowPublicFlag,
        mbrSettingsShowBirthYr: saved.mbrSettingsShowBirthYr,
        mbrSettingsShowGender: saved.mbrSettingsShowGender,
        mbrSettingsShowRelationship: saved.mbrSettingsShowRelationship,
        mbrSettingsShowTown: saved.mbrSettingsShowTown,
        mbrSettingsShowWorksAt: saved.mbrSettingsShowWorksAt,
        mbrSettingsShowStudiedAt: saved.mbrSettingsShowStudiedAt,
        mbrSettingsShowIntroduction: saved.mbrSettingsShowIntroduction,
        mbrSettingsShowPhotoGallery: saved.mbrSettingsShowPhotoGallery
      };

      setSettings(updatedState);
      setInitialSettings(updatedState);
      setSuccess("Profile display settings updated successfully in sbDB100!");
    } catch (err: any) {
      console.error("Error saving display settings:", err);
      setError(`Failed to save display settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { id: 'public', label: 'Public Access & Discovery', icon: Globe },
    { id: 'demographics', label: 'Basic Demographics Visibility', icon: User },
    { id: 'background', label: 'Places, Career & Education', icon: MapPin },
    { id: 'media', label: 'Biography & Photo Gallery', icon: Sparkles }
  ];

  if (loading) {
    return (
      <div className="w-full min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400 font-serif">Retrieving profile display settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Global Quick Action Toggles */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">Profile Display Preferences</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure item visibility for public view and member searches.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSetAll(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          >
            Show All
          </button>
          <button
            type="button"
            onClick={() => handleSetAll(false)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs font-serif leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-serif leading-relaxed"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* Settings Sections Grouped by Category */}
      <form onSubmit={handleSave} className="space-y-8">
        {categories.map((cat) => {
          const items = DISPLAY_SETTINGS_SCHEMA.filter((item) => item.category === cat.id);
          const CatIcon = cat.icon;

          return (
            <div key={cat.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CatIcon className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white tracking-tight">{cat.label}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3.5 pt-1">
                {items.map((item) => {
                  const ItemIcon = item.icon;
                  const isChecked = Boolean(settings[item.key]);

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggle(item.key)}
                      className={`group flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-85'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-blue-100/70 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
                            {item.recommended && (
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800 rounded-md">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      {/* Custom Toggle Switch */}
                      <div className="shrink-0 pt-1">
                        <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                          isChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}>
                          <motion.div 
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className={`bg-white w-4 h-4 rounded-full shadow-sm ${
                              isChecked ? 'ml-5' : 'ml-0'
                            }`} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (initialSettings) {
                setSettings(initialSettings);
              }
            }}
            disabled={!isDirty || saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
              isDirty && !saving
                ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs'
                : 'opacity-40 pointer-events-none text-slate-400 border border-transparent'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Unsaved Changes</span>
          </button>

          <button
            type="submit"
            disabled={!isDirty || saving}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-200 cursor-pointer shadow-md ${
              isDirty && !saving
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-98'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Display Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      <AdminComponentTag name="MbrProfileDisplaySettingsPanel" />
    </div>
  );
}
