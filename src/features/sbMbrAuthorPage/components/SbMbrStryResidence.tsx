/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface SbMbrStryResidenceProps {
  isSandbox: boolean;
}

interface Residence {
  mbrResidenceId: string;
  mbrId: string;
  mbrResidenceAddress: string;
  mbrResidenceCity: string;
  mbrResidenceState: string;
  mbrResidenceCountry: string;
  mbrResidenceStartDate: string; // YYYY-MM-DD
  mbrResidenceEndDate?: string;   // YYYY-MM-DD
  mbrResidenceBornInd: boolean;
  mbrResidenceCurrentInd: boolean;
  mbrResidenceHomeTownInd: boolean;
}

const SANDBOX_RESIDENCES: Residence[] = [
  {
    mbrResidenceId: 'r1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrResidenceAddress: '123 Ocean Drive',
    mbrResidenceCity: 'Coos Bay',
    mbrResidenceState: 'Oregon',
    mbrResidenceCountry: 'USA',
    mbrResidenceStartDate: '1961-10-14',
    mbrResidenceEndDate: '1979-06-15',
    mbrResidenceBornInd: true,
    mbrResidenceCurrentInd: false,
    mbrResidenceHomeTownInd: true
  },
  {
    mbrResidenceId: 'r2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrResidenceAddress: '742 Evergreen Terrace',
    mbrResidenceCity: 'Springfield',
    mbrResidenceState: 'Oregon',
    mbrResidenceCountry: 'USA',
    mbrResidenceStartDate: '1989-12-17',
    mbrResidenceBornInd: false,
    mbrResidenceCurrentInd: true,
    mbrResidenceHomeTownInd: false
  }
];

export default function SbMbrStryResidence({ isSandbox }: SbMbrStryResidenceProps) {
  // --- STATE VARIABLES ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [residenceList, setResidenceList] = useState<Residence[]>([]);
  const [editList, setEditList] = useState<Residence[]>([]);
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

      // 2. Load residence records
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_residences');
        let allResidences: Residence[] = [];
        if (saved) {
          allResidences = JSON.parse(saved);
        } else {
          allResidences = SANDBOX_RESIDENCES.map(r => ({
            ...r,
            mbrId: currentMbrId
          }));
          sessionStorage.setItem('sandbox_residences', JSON.stringify(allResidences));
        }
        const filtered = allResidences.filter((r) => r.mbrId === currentMbrId);
        setResidenceList(filtered);
      } else {
        const dbResidences = await taskApi.getResidences(currentMbrId);
        setResidenceList(dbResidences);
      }
    } catch (err: any) {
      setError(`Failed to load residences: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- BUTTON ACTIONS ---
  const handleStartEdit = () => {
    setEditList([...residenceList]);
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
    const newRow: Residence = {
      mbrResidenceId: tempId,
      mbrId: mbrId,
      mbrResidenceAddress: '',
      mbrResidenceCity: '',
      mbrResidenceState: '',
      mbrResidenceCountry: 'USA',
      mbrResidenceStartDate: new Date().toISOString().split('T')[0],
      mbrResidenceEndDate: '',
      mbrResidenceBornInd: false,
      mbrResidenceCurrentInd: false,
      mbrResidenceHomeTownInd: false
    };
    setEditList([...editList, newRow]);
  };

  const handleDeleteRow = (mbrResidenceId: string) => {
    setEditList(editList.filter((item) => item.mbrResidenceId !== mbrResidenceId));
    if (!mbrResidenceId.startsWith('temp_')) {
      setDeletedIds([...deletedIds, mbrResidenceId]);
    }
  };

  const handleFieldChange = (mbrResidenceId: string, field: keyof Residence, value: any) => {
    setEditList((prevList) =>
      prevList.map((item) => {
        // If this is the row being updated
        if (item.mbrResidenceId === mbrResidenceId) {
          const updatedItem = { ...item, [field]: value };
          // If setting current indicator to true, reset the end date
          if (field === 'mbrResidenceCurrentInd' && value === true) {
            updatedItem.mbrResidenceEndDate = '';
          }
          return updatedItem;
        }

        // Mutual exclusivity: if setting an indicator to true on one row, clear it on all other rows
        if (
          value === true &&
          (field === 'mbrResidenceCurrentInd' ||
            field === 'mbrResidenceBornInd' ||
            field === 'mbrResidenceHomeTownInd')
        ) {
          return { ...item, [field]: false };
        }

        return item;
      })
    );
  };

  // --- SAVE OPERATION ---
  const handleSaveChanges = async () => {
    // Basic validation
    for (const item of editList) {
      if (
        !item.mbrResidenceCity.trim() ||
        !item.mbrResidenceState.trim() ||
        !item.mbrResidenceCountry.trim() ||
        !item.mbrResidenceStartDate
      ) {
        setError("City, State, Country, and Start Date are required for all residence rows.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_residences');
        let allRes: Residence[] = [];
        if (saved) {
          allRes = JSON.parse(saved);
        }
        const otherMembersResidences = allRes.filter((r) => r.mbrId !== mbrId);
        const updatedList = [...otherMembersResidences, ...editList];
        
        sessionStorage.setItem('sandbox_residences', JSON.stringify(updatedList));
        setResidenceList(editList);
        setSuccessMsg("Residence records updated in Sandbox mode successfully!");
        setIsEditing(false);
      } else {
        // 1. Process deletes
        for (const deleteId of deletedIds) {
          await taskApi.deleteResidence(deleteId);
        }

        // 2. Process creates and updates
        for (const item of editList) {
          const payload = {
            mbrId: mbrId,
            mbrResidenceAddress: item.mbrResidenceAddress?.trim() || null,
            mbrResidenceCity: item.mbrResidenceCity.trim(),
            mbrResidenceState: item.mbrResidenceState.trim(),
            mbrResidenceCountry: item.mbrResidenceCountry.trim(),
            mbrResidenceStartDate: item.mbrResidenceStartDate,
            mbrResidenceEndDate: item.mbrResidenceEndDate || undefined,
            mbrResidenceBornInd: item.mbrResidenceBornInd,
            mbrResidenceCurrentInd: item.mbrResidenceCurrentInd,
            mbrResidenceHomeTownInd: item.mbrResidenceHomeTownInd
          };

          if (item.mbrResidenceId.startsWith('temp_')) {
            await taskApi.createResidence(payload);
          } else {
            await taskApi.updateResidence(item.mbrResidenceId, payload);
          }
        }

        // 3. Reload from database
        const dbResidences = await taskApi.getResidences(mbrId);
        setResidenceList(dbResidences);
        setSuccessMsg("Residence records updated in database successfully!");
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper for formatting date strings
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatRange = (start: string, end?: string, current?: boolean) => {
    const startFmt = formatDate(start);
    if (current) {
      return `${startFmt} – Present`;
    }
    if (end) {
      return `${startFmt} – ${formatDate(end)}`;
    }
    return startFmt;
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
      
      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 text-emerald-700 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest font-mono">
              {isEditing ? 'Status: Editing' : 'Status: Draft'}
            </span>
            <h2 className="font-serif text-lg font-bold text-slate-800">Residencies</h2>
          </div>
        </div>

        {/* Toggle Mode Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', { detail: { topicId: 'residencies', topicTitle: 'Residencies', componentName: 'sbMbrStryResidence' } }))}
              className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Story Editor"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-story-mate'))}
              className="p-2.5 text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="StoryMate AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>
            <button
              onClick={() => alert('Opening Privacy settings for residences...')}
              className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Privacy settings"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleStartEdit}
              disabled={loading}
              title="Edit Residences"
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
          <span className="text-xs font-medium">Loading residences...</span>
        </div>
      ) : !isEditing ? (
        /* DISPLAY MODE: Premium Card Grid */
        residenceList.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-serif text-slate-500 italic">No residences registered.</p>
            <button
              onClick={handleStartEdit}
              className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Residences
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {residenceList.map((res) => (
              <div
                key={res.mbrResidenceId}
                className="bg-white border border-[#EFECE7] rounded-2xl p-4 flex flex-col gap-2.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.015)] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm font-bold text-slate-805 truncate leading-snug">
                      {res.mbrResidenceAddress}
                    </h3>
                    <p className="text-xs text-slate-500 font-serif mt-0.5 truncate">
                      {res.mbrResidenceCity}, {res.mbrResidenceState}, {res.mbrResidenceCountry}
                    </p>
                  </div>
                  <div className="p-1.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1.5 pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-mono text-slate-450 font-bold">
                    {formatRange(res.mbrResidenceStartDate, res.mbrResidenceEndDate, res.mbrResidenceCurrentInd)}
                  </span>
                  
                  {/* Indicators Badging */}
                  <div className="flex items-center gap-1 shrink-0">
                    {res.mbrResidenceBornInd && (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded uppercase tracking-wider font-mono">
                        Born
                      </span>
                    )}
                    {res.mbrResidenceHomeTownInd && (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold bg-violet-50 text-violet-700 border border-violet-100/50 rounded uppercase tracking-wider font-mono">
                        Hometown
                      </span>
                    )}
                    {res.mbrResidenceCurrentInd && (
                      <span className="px-1.5 py-0.5 text-[8px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50 rounded uppercase tracking-wider font-mono">
                        Current
                      </span>
                    )}
                  </div>
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
                  <th className="py-2.5 px-2">Address</th>
                  <th className="py-2.5 px-2">City</th>
                  <th className="py-2.5 px-2">State</th>
                  <th className="py-2.5 px-2">Country</th>
                  <th className="py-2.5 px-2">Start Date</th>
                  <th className="py-2.5 px-2">End Date</th>
                  <th className="py-2.5 px-2 text-center">Born</th>
                  <th className="py-2.5 px-2 text-center">Hometown</th>
                  <th className="py-2.5 px-2 text-center">Current</th>
                  <th className="py-2.5 px-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editList.map((item) => (
                  <tr key={item.mbrResidenceId} className="group hover:bg-slate-50/30 transition-colors">
                    
                    {/* Address */}
                    <td className="py-3 px-2 min-w-[140px]">
                      <input
                        type="text"
                        value={item.mbrResidenceAddress || ''}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceAddress', e.target.value)
                        }
                        placeholder="Street Address"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* City */}
                    <td className="py-3 px-2 min-w-[100px]">
                      <input
                        type="text"
                        value={item.mbrResidenceCity}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceCity', e.target.value)
                        }
                        placeholder="City"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* State */}
                    <td className="py-3 px-2 min-w-[100px]">
                      <input
                        type="text"
                        value={item.mbrResidenceState}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceState', e.target.value)
                        }
                        placeholder="State"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Country */}
                    <td className="py-3 px-2 min-w-[80px]">
                      <input
                        type="text"
                        value={item.mbrResidenceCountry}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceCountry', e.target.value)
                        }
                        placeholder="Country"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Start Date */}
                    <td className="py-3 px-2 min-w-[120px]">
                      <input
                        type="date"
                        value={item.mbrResidenceStartDate}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceStartDate', e.target.value)
                        }
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2 focus:border-slate-800"
                      />
                    </td>

                    {/* End Date */}
                    <td className="py-3 px-2 min-w-[120px]">
                      <input
                        type="date"
                        value={item.mbrResidenceEndDate || ''}
                        disabled={item.mbrResidenceCurrentInd}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceEndDate', e.target.value || '')
                        }
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2 focus:border-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </td>

                    {/* Born Indicator */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.mbrResidenceBornInd}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceBornInd', e.target.checked)
                        }
                        className="w-4 h-4 text-blue-650 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Hometown Indicator */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.mbrResidenceHomeTownInd}
                        onChange={(e) =>
                          handleFieldChange(item.mbrResidenceId, 'mbrResidenceHomeTownInd', e.target.checked)
                        }
                        className="w-4 h-4 text-blue-650 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Current Indicator */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.mbrResidenceCurrentInd}
                        onChange={(e) => handleFieldChange(item.mbrResidenceId, 'mbrResidenceCurrentInd', e.target.checked)}
                        className="w-4 h-4 text-blue-650 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteRow(item.mbrResidenceId)}
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

          {/* Add Residence Button */}
          <button
            onClick={handleAddRow}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Residence</span>
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
