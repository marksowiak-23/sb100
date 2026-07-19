/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface SbMbrActivityProps {
  isSandbox: boolean;
}

interface Activity {
  mbrActivityId: string;
  mbrId: string;
  mbrActivityName: string;
  mbrActivityDescription?: string;
  mbrActivityFrequencyCd?: string;
}

const FREQUENCY_OPTIONS = [
  { cdValue: 'DLY', cdDesc: 'Daily' },
  { cdValue: 'WKLY', cdDesc: 'Weekly' },
  { cdValue: 'MTHY', cdDesc: 'Monthly' },
  { cdValue: 'ANLY', cdDesc: 'Annually' },
  { cdValue: 'OCAS', cdDesc: 'Occasionally' }
];

const SANDBOX_ACTIVITIES: Activity[] = [
  {
    mbrActivityId: 'a1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrActivityName: 'Oil Painting',
    mbrActivityDescription: 'Creating landscape and portrait paintings using traditional oil techniques.',
    mbrActivityFrequencyCd: 'WKLY'
  },
  {
    mbrActivityId: 'a2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrActivityName: 'Daily Journaling',
    mbrActivityDescription: 'Writing morning pages and keeping track of daily thoughts and ideas.',
    mbrActivityFrequencyCd: 'DLY'
  },
  {
    mbrActivityId: 'a3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrActivityName: 'Historical Research',
    mbrActivityDescription: 'Researching local architectural history and archives.',
    mbrActivityFrequencyCd: 'MTHY'
  }
];

export default function SbMbrActivity({ isSandbox }: SbMbrActivityProps) {
  // --- STATE VARIABLES ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [activityList, setActivityList] = useState<Activity[]>([]);
  const [editList, setEditList] = useState<Activity[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    loadData();
  }, [isSandbox]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch logged-in user and lookup member profile ID
      let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (isSandbox) {
          const savedMbr = sessionStorage.getItem('sandbox_mbr');
          if (savedMbr) {
            const mbr = JSON.parse(savedMbr);
            currentMbrId = mbr.mbrId;
          }
        } else {
          try {
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile && mbrProfile.mbrId) {
              currentMbrId = mbrProfile.mbrId;
            }
          } catch (e) {
            console.warn("Could not retrieve member profile ID from DB, falling back to Eleanor Hartwell UUID:", e);
          }
        }
      }
      setMbrId(currentMbrId);

      // 2. Load activity records
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_activities');
        let allActivities: Activity[] = [];
        if (saved) {
          allActivities = JSON.parse(saved);
        } else {
          allActivities = SANDBOX_ACTIVITIES.map(a => ({
            ...a,
            mbrId: currentMbrId
          }));
          sessionStorage.setItem('sandbox_activities', JSON.stringify(allActivities));
        }
        const filtered = allActivities.filter((a) => a.mbrId === currentMbrId);
        setActivityList(filtered);
      } else {
        const dbActivities = await taskApi.getActivities(currentMbrId);
        setActivityList(dbActivities);
      }
    } catch (err: any) {
      setError(`Failed to load activities: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- BUTTON ACTIONS ---
  const handleStartEdit = () => {
    setEditList([...activityList]);
    setDeletedIds([]);
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleAddRow = () => {
    const tempId = `temp_${Date.now()}`;
    const newRow: Activity = {
      mbrActivityId: tempId,
      mbrId: mbrId,
      mbrActivityName: '',
      mbrActivityDescription: '',
      mbrActivityFrequencyCd: 'WKLY'
    };
    setEditList([...editList, newRow]);
  };

  const handleDeleteRow = (mbrActivityId: string) => {
    setEditList(editList.filter((item) => item.mbrActivityId !== mbrActivityId));
    if (!mbrActivityId.startsWith('temp_')) {
      setDeletedIds([...deletedIds, mbrActivityId]);
    }
  };

  const handleFieldChange = (mbrActivityId: string, field: keyof Activity, value: any) => {
    setEditList((prevList) =>
      prevList.map((item) => {
        if (item.mbrActivityId === mbrActivityId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // --- SAVE OPERATION ---
  const handleSaveChanges = async () => {
    // Basic validation
    for (const item of editList) {
      if (!item.mbrActivityName.trim()) {
        setError("Activity Name is required for all rows.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_activities');
        let allActs: Activity[] = [];
        if (saved) {
          allActs = JSON.parse(saved);
        }
        const otherMembersActs = allActs.filter((a) => a.mbrId !== mbrId);
        const updatedList = [...otherMembersActs, ...editList];
        
        sessionStorage.setItem('sandbox_activities', JSON.stringify(updatedList));
        setActivityList(editList);
        setSuccessMsg("Activity records updated in Sandbox mode successfully!");
        setIsEditing(false);
      } else {
        // 1. Process deletes
        for (const deleteId of deletedIds) {
          await taskApi.deleteActivity(deleteId);
        }

        // 2. Process creates and updates
        for (const item of editList) {
          const payload = {
            mbrId: mbrId,
            mbrActivityName: item.mbrActivityName.trim(),
            mbrActivityDescription: item.mbrActivityDescription?.trim() || null,
            mbrActivityFrequencyCd: item.mbrActivityFrequencyCd || null
          };

          if (item.mbrActivityId.startsWith('temp_')) {
            await taskApi.createActivity(payload);
          } else {
            await taskApi.updateActivity(item.mbrActivityId, payload);
          }
        }

        // 3. Reload from database
        const dbActivities = await taskApi.getActivities(mbrId);
        setActivityList(dbActivities);
        setSuccessMsg("Activity records updated in database successfully!");
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getFrequencyLabel = (cd: string | undefined) => {
    if (!cd) return 'N/A';
    const opt = FREQUENCY_OPTIONS.find(o => o.cdValue === cd);
    return opt ? opt.cdDesc : cd;
  };

  const getFrequencyBadgeColor = (cd: string | undefined) => {
    switch (cd) {
      case 'DLY': return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'WKLY': return 'bg-indigo-50 text-indigo-700 border-indigo-100/50';
      case 'MTHY': return 'bg-violet-50 text-violet-700 border-violet-100/50';
      case 'ANLY': return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'OCAS': return 'bg-slate-50 text-slate-700 border-slate-200/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
      
      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 text-indigo-700 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest font-mono">
              {isEditing ? 'Status: Editing' : 'Status: Draft'}
            </span>
            <h2 className="font-serif text-lg font-bold text-slate-800">Activities & Hobbies</h2>
          </div>
        </div>

        {/* Toggle Mode Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Opening Privacy settings for activities...')}
              className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Privacy settings"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleStartEdit}
              disabled={loading}
              title="Edit Activities"
              className="p-2.5 text-slate-500 hover:text-slate-805 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* --- NOTIFICATIONS BANNER --- */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-xl flex items-start gap-2.5"
          >
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs font-medium flex-grow">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs font-medium flex-grow">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENT WORKSPACE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
          <span className="text-xs font-medium">Loading activities...</span>
        </div>
      ) : !isEditing ? (
        /* DISPLAY MODE: Premium Card Grid */
        activityList.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-serif text-slate-500 italic">No activities or hobbies registered.</p>
            <button
              onClick={handleStartEdit}
              className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Activities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activityList.map((act) => (
              <div
                key={act.mbrActivityId}
                className="bg-white border border-[#EFECE7] rounded-2xl p-4 flex flex-col gap-2.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.015)] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-grow">
                    <h3 className="font-serif text-sm font-bold text-slate-805 truncate leading-snug">
                      {act.mbrActivityName}
                    </h3>
                    <p className="text-xs text-slate-500 font-serif mt-1.5 leading-relaxed line-clamp-2">
                      {act.mbrActivityDescription || 'No description provided.'}
                    </p>
                  </div>
                  <div className="p-1.5 bg-slate-50 border border-slate-100 text-indigo-500 rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1.5 pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    Frequency
                  </span>
                  
                  {/* Frequency Badge */}
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold border rounded uppercase tracking-wider font-mono ${getFrequencyBadgeColor(act.mbrActivityFrequencyCd)}`}>
                    {getFrequencyLabel(act.mbrActivityFrequencyCd)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* EDIT MODE: Table Input View */
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#EFECE7] text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-2">Activity/Hobby Name</th>
                  <th className="py-2.5 px-2">Frequency</th>
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editList.map((item) => (
                  <tr key={item.mbrActivityId} className="group hover:bg-slate-50/30 transition-colors">
                    
                    {/* Activity/Hobby Name */}
                    <td className="py-3 px-2 min-w-[180px]">
                      <input
                        type="text"
                        value={item.mbrActivityName}
                        onChange={(e) =>
                          handleFieldChange(item.mbrActivityId, 'mbrActivityName', e.target.value)
                        }
                        placeholder="e.g. Painting, Chess, Gardening"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                        required
                      />
                    </td>

                    {/* Frequency */}
                    <td className="py-3 px-2 min-w-[120px]">
                      <select
                        value={item.mbrActivityFrequencyCd || ''}
                        onChange={(e) =>
                          handleFieldChange(item.mbrActivityId, 'mbrActivityFrequencyCd', e.target.value || undefined)
                        }
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2 focus:border-slate-800"
                      >
                        <option value="">N/A</option>
                        {FREQUENCY_OPTIONS.map(opt => (
                          <option key={opt.cdValue} value={opt.cdValue}>
                            {opt.cdDesc}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-2 min-w-[250px]">
                      <input
                        type="text"
                        value={item.mbrActivityDescription || ''}
                        onChange={(e) =>
                          handleFieldChange(item.mbrActivityId, 'mbrActivityDescription', e.target.value)
                        }
                        placeholder="Brief description of the activity/hobby..."
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteRow(item.mbrActivityId)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Activity Button */}
          <button
            onClick={handleAddRow}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity / Hobby</span>
          </button>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFECE7]">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="px-4 py-2.5 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all duration-150 cursor-pointer disabled:opacity-50 shrink-0 border border-blue-600"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
