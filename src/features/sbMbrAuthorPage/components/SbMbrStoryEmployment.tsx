/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface SbMbrStoryEmploymentProps {
  isSandbox: boolean;
}

interface Employment {
  mbrEmploymentId: string;
  mbrId: string;
  mbrEmployementPosition: string;         // Spelled with Employement
  mbrEmployementPositionResp?: string;    // Spelled with Employement
  mbrEmploymentCompany: string;           // Spelled with Employment
  mbrEmployementLocation?: string;        // Spelled with Employement
  mbrEmploymentTypeCd?: string;           // Spelled with Employment
  mbrEmploymentStartDate?: string;       // Spelled with Employment
  mbrEmploymentEndDate?: string;         // Spelled with Employment
  mbrEmploymentDescription?: string;     // Spelled with Employment
}

const TYPE_OPTIONS = [
  { cdValue: 'Full-time', cdDesc: 'Full-time' },
  { cdValue: 'Part-time', cdDesc: 'Part-time' },
  { cdValue: 'Contract', cdDesc: 'Contract' },
  { cdValue: 'Seasonal', cdDesc: 'Seasonal' },
  { cdValue: 'Internship', cdDesc: 'Internship' }
];

const SANDBOX_EMPLOYMENT: Employment[] = [
  {
    mbrEmploymentId: 'emp1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrEmployementPosition: 'Elementary School Teacher',
    mbrEmployementPositionResp: 'Taught fourth and fifth grade classes, developed curriculum plans, and coordinated parent-teacher committees.',
    mbrEmploymentCompany: 'Lincoln Elementary School',
    mbrEmployementLocation: 'Portland, OR',
    mbrEmploymentTypeCd: 'Full-time',
    mbrEmploymentStartDate: '1985-09-01',
    mbrEmploymentEndDate: '1992-06-15',
    mbrEmploymentDescription: 'Fostered a creative learning environment. Introduced a young historians workshop.'
  },
  {
    mbrEmploymentId: 'emp2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrEmployementPosition: 'Freelance Writer & Editor',
    mbrEmployementPositionResp: 'Write local historical memoir columns and provide developmental editing for local authors.',
    mbrEmploymentCompany: 'Self-Employed',
    mbrEmployementLocation: 'Portland, OR',
    mbrEmploymentTypeCd: 'Part-time',
    mbrEmploymentStartDate: '1992-09-01',
    mbrEmploymentEndDate: '',
    mbrEmploymentDescription: 'Researching local history of Oregon and editing memoirs for family heritage books.'
  }
];

export default function SbMbrStoryEmployment({ isSandbox }: SbMbrStoryEmploymentProps) {
  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [employmentList, setEmploymentList] = useState<Employment[]>([]);
  const [editList, setEditList] = useState<Employment[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // --- FETCH DATA ---
  useEffect(() => {
    loadData();
  }, [isSandbox]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch parent member profile ID
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
            console.warn("Could not retrieve member profile ID, falling back to Eleanor Hartwell UUID:", e);
          }
        }
      }
      setMbrId(currentMbrId);

      // 2. Load employment records
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_employment');
        let allEmployment: Employment[] = [];
        if (saved) {
          allEmployment = JSON.parse(saved);
        } else {
          allEmployment = SANDBOX_EMPLOYMENT.map(e => ({
            ...e,
            mbrId: currentMbrId
          }));
          sessionStorage.setItem('sandbox_employment', JSON.stringify(allEmployment));
        }
        const filtered = allEmployment.filter(e => e.mbrId === currentMbrId);
        setEmploymentList(filtered);
      } else {
        const dbEmployment = await taskApi.getEmployments(currentMbrId);
        setEmploymentList(dbEmployment);
      }
    } catch (err: any) {
      setError(`Failed to load employment history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleStartEdit = () => {
    setEditList([...employmentList]);
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
    const newRow: Employment = {
      mbrEmploymentId: tempId,
      mbrId: mbrId,
      mbrEmployementPosition: '',
      mbrEmployementPositionResp: '',
      mbrEmploymentCompany: '',
      mbrEmployementLocation: '',
      mbrEmploymentTypeCd: 'Full-time',
      mbrEmploymentStartDate: new Date().toISOString().split('T')[0],
      mbrEmploymentEndDate: '',
      mbrEmploymentDescription: ''
    };
    setEditList([...editList, newRow]);
  };

  const handleDeleteRow = (mbrEmploymentId: string) => {
    setEditList(editList.filter(item => item.mbrEmploymentId !== mbrEmploymentId));
    if (!mbrEmploymentId.startsWith('temp_')) {
      setDeletedIds([...deletedIds, mbrEmploymentId]);
    }
  };

  const handleFieldChange = (mbrEmploymentId: string, field: keyof Employment, value: any) => {
    setEditList(prevList =>
      prevList.map(item => {
        if (item.mbrEmploymentId === mbrEmploymentId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // --- SAVE ---
  const handleSaveChanges = async () => {
    // Basic validation
    for (const item of editList) {
      if (!item.mbrEmploymentCompany.trim()) {
        setError("Company name is required for all employment rows.");
        return;
      }
      if (!item.mbrEmployementPosition.trim()) {
        setError("Position/Title is required for all employment rows.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_employment');
        let allEmps: Employment[] = [];
        if (saved) {
          allEmps = JSON.parse(saved);
        }
        const otherMembersEmps = allEmps.filter(e => e.mbrId !== mbrId);
        const updatedList = [...otherMembersEmps, ...editList];

        sessionStorage.setItem('sandbox_employment', JSON.stringify(updatedList));
        setEmploymentList(editList);
        setSuccessMsg("Employment history updated in Sandbox mode successfully!");
        setIsEditing(false);
      } else {
        // 1. Process deletes
        for (const deleteId of deletedIds) {
          await taskApi.deleteEmployment(deleteId);
        }

        // 2. Process creates and updates
        for (const item of editList) {
          const payload = {
            mbrId: mbrId,
            mbrEmployementPosition: item.mbrEmployementPosition.trim(),
            mbrEmployementPositionResp: item.mbrEmployementPositionResp?.trim() || null,
            mbrEmploymentCompany: item.mbrEmploymentCompany.trim(),
            mbrEmployementLocation: item.mbrEmployementLocation?.trim() || null,
            mbrEmploymentTypeCd: item.mbrEmploymentTypeCd || null,
            mbrEmploymentStartDate: item.mbrEmploymentStartDate || null,
            mbrEmploymentEndDate: item.mbrEmploymentEndDate || null,
            mbrEmploymentDescription: item.mbrEmploymentDescription?.trim() || null
          };

          if (item.mbrEmploymentId.startsWith('temp_')) {
            await taskApi.createEmployment(payload);
          } else {
            await taskApi.updateEmployment(item.mbrEmploymentId, payload);
          }
        }

        // 3. Reload from DB
        const dbEmployment = await taskApi.getEmployments(mbrId);
        setEmploymentList(dbEmployment);
        setSuccessMsg("Employment history updated in database successfully!");
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
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const getTypeBadgeColor = (type: string | undefined) => {
    switch (type) {
      case 'Full-time': return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'Part-time': return 'bg-blue-50 text-blue-700 border-blue-100/50';
      case 'Contract': return 'bg-indigo-50 text-indigo-700 border-indigo-100/50';
      case 'Seasonal': return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'Internship': return 'bg-violet-50 text-violet-700 border-violet-100/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
      
      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 text-emerald-700 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-800 leading-tight">
              Employment & Professional History
            </h3>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Work experience, positions, and companies
            </p>
          </div>
        </div>

        {!isEditing && !loading && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#EFECE7] hover:bg-slate-50 text-slate-700 hover:text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* --- STATE BANNERS --- */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs font-medium flex-grow">{error}</div>
            <button onClick={() => setError(null)} className="cursor-pointer">
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl"
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs font-medium flex-grow">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="cursor-pointer">
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VIEW MODE --- */}
      {!isEditing && (
        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
              <span className="text-xs font-medium">Loading employment history...</span>
            </div>
          ) : employmentList.length === 0 ? (
            <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-serif text-slate-500 italic">No employment records registered.</p>
              <button
                onClick={handleStartEdit}
                className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Employment
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-6 py-2">
              {employmentList.map(item => (
                <div key={item.mbrEmploymentId} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-emerald-600 border-2 border-white rounded-full group-hover:scale-125 transition-transform shadow-[0_0_0_2px_rgba(16,185,129,0.15)]" />

                  {/* Header Row */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-serif text-sm font-bold text-slate-800">
                      {item.mbrEmployementPosition}
                    </span>
                    <span className="text-xs font-serif text-slate-500 font-medium">
                      at {item.mbrEmploymentCompany}
                    </span>
                    {item.mbrEmployementLocation && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({item.mbrEmployementLocation})
                      </span>
                    )}
                    {item.mbrEmploymentTypeCd && (
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getTypeBadgeColor(item.mbrEmploymentTypeCd)}`}>
                        {item.mbrEmploymentTypeCd}
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-slate-400 font-bold ml-auto shrink-0">
                      {item.mbrEmploymentStartDate ? formatDate(item.mbrEmploymentStartDate) : 'N/A'}
                      {' – '}
                      {item.mbrEmploymentEndDate ? formatDate(item.mbrEmploymentEndDate) : 'Present'}
                    </span>
                  </div>

                  {/* Responsibilities */}
                  {item.mbrEmployementPositionResp && (
                    <p className="text-xs text-slate-600 font-serif leading-relaxed mt-1.5">
                      {item.mbrEmployementPositionResp}
                    </p>
                  )}

                  {/* Short Description */}
                  {item.mbrEmploymentDescription && (
                    <p className="text-[11px] text-slate-400 font-serif italic mt-1 leading-relaxed">
                      {item.mbrEmploymentDescription}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- EDIT MODE --- */}
      {isEditing && (
        <div className="flex flex-col gap-6">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-[#EFECE7]">
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[22%]">Company</th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[22%]">Title / Position</th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[13%]">Type</th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[13%]">Location</th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[18%]">Dates</th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[20%]">Resp. / Description</th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 text-right w-[5%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF8F5]">
                {editList.map(item => (
                  <tr key={item.mbrEmploymentId} className="group hover:bg-[#FDFCFB]/50 transition-colors">
                    
                    {/* Company */}
                    <td className="py-3 px-2 vertical-align-top">
                      <input
                        type="text"
                        value={item.mbrEmploymentCompany}
                        onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmploymentCompany', e.target.value)}
                        placeholder="e.g. Lincoln School"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800 font-medium"
                      />
                    </td>

                    {/* Position */}
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        value={item.mbrEmployementPosition}
                        onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmployementPosition', e.target.value)}
                        placeholder="e.g. Lead Teacher"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800 font-bold"
                      />
                    </td>

                    {/* Type Select */}
                    <td className="py-3 px-2">
                      <select
                        value={item.mbrEmploymentTypeCd || ''}
                        onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmploymentTypeCd', e.target.value)}
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2 focus:border-slate-800 cursor-pointer"
                      >
                        <option value="">-- Type --</option>
                        {TYPE_OPTIONS.map(opt => (
                          <option key={opt.cdValue} value={opt.cdValue}>{opt.cdDesc}</option>
                        ))}
                      </select>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        value={item.mbrEmployementLocation || ''}
                        onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmployementLocation', e.target.value)}
                        placeholder="Portland, OR"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2 focus:border-slate-800"
                      />
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={item.mbrEmploymentStartDate || ''}
                          onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmploymentStartDate', e.target.value)}
                          className="bg-white border border-[#EFECE7] rounded-lg text-[9px] outline-none py-1.5 px-1.5 focus:border-slate-800"
                        />
                        <input
                          type="date"
                          value={item.mbrEmploymentEndDate || ''}
                          onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmploymentEndDate', e.target.value)}
                          className="bg-white border border-[#EFECE7] rounded-lg text-[9px] outline-none py-1.5 px-1.5 focus:border-slate-800"
                        />
                      </div>
                    </td>

                    {/* Responsibilities & Description */}
                    <td className="py-3 px-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={item.mbrEmployementPositionResp || ''}
                          onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmployementPositionResp', e.target.value)}
                          placeholder="Responsibilities..."
                          className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-1 px-2 focus:border-slate-800"
                        />
                        <input
                          type="text"
                          value={item.mbrEmploymentDescription || ''}
                          onChange={e => handleFieldChange(item.mbrEmploymentId, 'mbrEmploymentDescription', e.target.value)}
                          placeholder="Short summary/notes..."
                          className="w-full bg-white border border-[#EFECE7] rounded-lg text-[10px] outline-none py-1 px-2 focus:border-slate-800"
                        />
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteRow(item.mbrEmploymentId)}
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

          {/* Add Row Button */}
          <button
            onClick={handleAddRow}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employment Record</span>
          </button>

          {/* Action Footer */}
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
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all duration-150 cursor-pointer disabled:opacity-50 shrink-0 border border-emerald-600"
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
