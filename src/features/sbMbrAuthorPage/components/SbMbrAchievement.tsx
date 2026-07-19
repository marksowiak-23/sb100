/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface SbMbrAchievementProps {
  isSandbox: boolean;
}

interface Achievement {
  mbrAchievementId: string;
  mbrId: string;
  mbrAchievementTitle: string;
  mbrAchievementDescription?: string;
  mbrAchievementDate?: string; // YYYY-MM-DD
}

const SANDBOX_ACHIEVEMENTS: Achievement[] = [
  {
    mbrAchievementId: 'ac1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrAchievementTitle: 'Pulitzer Prize in Biography',
    mbrAchievementDescription: "Awarded for the memoir 'Whispers of the Coast'.",
    mbrAchievementDate: '2018-04-16'
  },
  {
    mbrAchievementId: 'ac2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrAchievementTitle: 'Lifetime Achievement Award',
    mbrAchievementDescription: 'Presented by the Oregon Historical Society for dedication to archiving oral histories.',
    mbrAchievementDate: '2024-11-05'
  }
];

export default function SbMbrAchievement({ isSandbox }: SbMbrAchievementProps) {
  // --- STATE VARIABLES ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [achievementList, setAchievementList] = useState<Achievement[]>([]);
  const [editList, setEditList] = useState<Achievement[]>([]);
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

      // 2. Load achievement records
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_achievements');
        let allAchievements: Achievement[] = [];
        if (saved) {
          allAchievements = JSON.parse(saved);
        } else {
          allAchievements = SANDBOX_ACHIEVEMENTS.map(a => ({
            ...a,
            mbrId: currentMbrId
          }));
          sessionStorage.setItem('sandbox_achievements', JSON.stringify(allAchievements));
        }
        const filtered = allAchievements.filter((a) => a.mbrId === currentMbrId);
        setAchievementList(filtered);
      } else {
        const dbAchievements = await taskApi.getAchievements(currentMbrId);
        setAchievementList(dbAchievements);
      }
    } catch (err: any) {
      setError(`Failed to load achievements: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- BUTTON ACTIONS ---
  const handleStartEdit = () => {
    setEditList([...achievementList]);
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
    const newRow: Achievement = {
      mbrAchievementId: tempId,
      mbrId: mbrId,
      mbrAchievementTitle: '',
      mbrAchievementDescription: '',
      mbrAchievementDate: new Date().toISOString().split('T')[0]
    };
    setEditList([...editList, newRow]);
  };

  const handleDeleteRow = (mbrAchievementId: string) => {
    setEditList(editList.filter((item) => item.mbrAchievementId !== mbrAchievementId));
    if (!mbrAchievementId.startsWith('temp_')) {
      setDeletedIds([...deletedIds, mbrAchievementId]);
    }
  };

  const handleFieldChange = (mbrAchievementId: string, field: keyof Achievement, value: any) => {
    setEditList((prevList) =>
      prevList.map((item) => {
        if (item.mbrAchievementId === mbrAchievementId) {
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
      if (!item.mbrAchievementTitle.trim()) {
        setError("Achievement Title is required for all rows.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_achievements');
        let allActs: Achievement[] = [];
        if (saved) {
          allActs = JSON.parse(saved);
        }
        const otherMembersActs = allActs.filter((a) => a.mbrId !== mbrId);
        const updatedList = [...otherMembersActs, ...editList];
        
        sessionStorage.setItem('sandbox_achievements', JSON.stringify(updatedList));
        setAchievementList(editList);
        setSuccessMsg("Achievement records updated in Sandbox mode successfully!");
        setIsEditing(false);
      } else {
        // 1. Process deletes
        for (const deleteId of deletedIds) {
          await taskApi.deleteAchievement(deleteId);
        }

        // 2. Process creates and updates
        for (const item of editList) {
          const payload = {
            mbrId: mbrId,
            mbrAchievementTitle: item.mbrAchievementTitle.trim(),
            mbrAchievementDescription: item.mbrAchievementDescription?.trim() || null,
            mbrAchievementDate: item.mbrAchievementDate || null
          };

          if (item.mbrAchievementId.startsWith('temp_')) {
            await taskApi.createAchievement(payload);
          } else {
            await taskApi.updateAchievement(item.mbrAchievementId, payload);
          }
        }

        // 3. Reload from database
        const dbAchievements = await taskApi.getAchievements(mbrId);
        setAchievementList(dbAchievements);
        setSuccessMsg("Achievement records updated in database successfully!");
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
      
      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50/50 border border-amber-100 text-amber-705 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest font-mono">
              {isEditing ? 'Status: Editing' : 'Status: Draft'}
            </span>
            <h2 className="font-serif text-lg font-bold text-slate-800">Achievements & Recognition</h2>
          </div>
        </div>

        {/* Toggle Mode Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Opening Privacy settings for achievements...')}
              className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Privacy settings"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleStartEdit}
              disabled={loading}
              title="Edit Achievements"
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
          <span className="text-xs font-medium">Loading achievements...</span>
        </div>
      ) : !isEditing ? (
        /* DISPLAY MODE: Premium Card Grid */
        achievementList.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-serif text-slate-500 italic">No achievements registered.</p>
            <button
              onClick={handleStartEdit}
              className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Achievements
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievementList.map((ach) => (
              <div
                key={ach.mbrAchievementId}
                className="bg-white border border-[#EFECE7] rounded-2xl p-4 flex flex-col gap-2.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.015)] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-grow">
                    <h3 className="font-serif text-sm font-bold text-slate-805 truncate leading-snug">
                      {ach.mbrAchievementTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-serif mt-1.5 leading-relaxed line-clamp-2">
                      {ach.mbrAchievementDescription || 'No description provided.'}
                    </p>
                  </div>
                  <div className="p-1.5 bg-slate-50 border border-slate-100 text-amber-500 rounded-lg shrink-0">
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1.5 pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-wider">
                    Date
                  </span>
                  
                  <span className="text-xs font-serif text-slate-650">
                    {formatDate(ach.mbrAchievementDate)}
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
                  <th className="py-2.5 px-2">Achievement Title</th>
                  <th className="py-2.5 px-2">Date</th>
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editList.map((item) => (
                  <tr key={item.mbrAchievementId} className="group hover:bg-slate-50/30 transition-colors">
                    
                    {/* Achievement Title */}
                    <td className="py-3 px-2 min-w-[180px]">
                      <input
                        type="text"
                        value={item.mbrAchievementTitle}
                        onChange={(e) =>
                          handleFieldChange(item.mbrAchievementId, 'mbrAchievementTitle', e.target.value)
                        }
                        placeholder="e.g. Pulitzer Prize"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                        required
                      />
                    </td>

                    {/* Date */}
                    <td className="py-3 px-2 min-w-[130px]">
                      <input
                        type="date"
                        value={item.mbrAchievementDate || ''}
                        onChange={(e) =>
                          handleFieldChange(item.mbrAchievementId, 'mbrAchievementDate', e.target.value || undefined)
                        }
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2 focus:border-slate-800"
                      />
                    </td>

                    {/* Description */}
                    <td className="py-3 px-2 min-w-[250px]">
                      <input
                        type="text"
                        value={item.mbrAchievementDescription || ''}
                        onChange={(e) =>
                          handleFieldChange(item.mbrAchievementId, 'mbrAchievementDescription', e.target.value)
                        }
                        placeholder="Details or recognition context..."
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteRow(item.mbrAchievementId)}
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

          {/* Add Achievement Button */}
          <button
            onClick={handleAddRow}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement / Award</span>
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
