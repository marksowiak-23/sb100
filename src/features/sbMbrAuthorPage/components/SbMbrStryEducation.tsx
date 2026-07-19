/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Plus, Trash2, Edit3, Save, X, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface SbMbrStryEducationProps {
  isSandbox: boolean;
}

interface Education {
  mbrEducationId: string;
  mbrID: string;
  mbrEducationInstitutionalNm: string;
  mbrEducationDegreeCd: string; // e.g., High School, Associate, Bachelor’s, Master’s, PhD, Certificate, Other
  mbrEducationDesc?: string;
  mbrEducationStartDate?: string; // YYYY-MM-DD
  mbrEducationEndDate?: string;   // YYYY-MM-DD
}

const DEGREE_OPTIONS = [
  { cdValue: 'High School', cdDesc: 'High School' },
  { cdValue: 'Associate', cdDesc: "Associate's" },
  { cdValue: "Bachelor's", cdDesc: "Bachelor's" },
  { cdValue: "Master's", cdDesc: "Master's" },
  { cdValue: 'PhD', cdDesc: 'PhD / Doctorate' },
  { cdValue: 'Certificate', cdDesc: 'Certificate' },
  { cdValue: 'Other', cdDesc: 'Other' }
];

const SANDBOX_EDUCATION: Education[] = [
  {
    mbrEducationId: 'edu1',
    mbrID: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrEducationInstitutionalNm: 'University of Oregon',
    mbrEducationDegreeCd: "Bachelor's",
    mbrEducationDesc: 'Bachelor of Arts in English Literature. Graduated Magna Cum Laude.',
    mbrEducationStartDate: '1979-09-15',
    mbrEducationEndDate: '1983-06-10'
  },
  {
    mbrEducationId: 'edu2',
    mbrID: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrEducationInstitutionalNm: 'Oregon State University',
    mbrEducationDegreeCd: 'Certificate',
    mbrEducationDesc: 'Completed Fourth and Fifth Grade Teaching Credential Program.',
    mbrEducationStartDate: '1983-09-10',
    mbrEducationEndDate: '1985-06-15'
  }
];

export default function SbMbrStryEducation({ isSandbox }: SbMbrStryEducationProps) {
  // --- STATE VARIABLES ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [editList, setEditList] = useState<Education[]>([]);
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

      // 2. Load education records
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_education');
        let allEducation: Education[] = [];
        if (saved) {
          allEducation = JSON.parse(saved);
        } else {
          allEducation = SANDBOX_EDUCATION.map(e => ({
            ...e,
            mbrID: currentMbrId
          }));
          sessionStorage.setItem('sandbox_education', JSON.stringify(allEducation));
        }
        const filtered = allEducation.filter((e) => e.mbrID === currentMbrId);
        setEducationList(filtered);
      } else {
        const dbEducation = await taskApi.getEducations(currentMbrId);
        setEducationList(dbEducation);
      }
    } catch (err: any) {
      setError(`Failed to load education records: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- BUTTON ACTIONS ---
  const handleStartEdit = () => {
    setEditList([...educationList]);
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
    const newRow: Education = {
      mbrEducationId: tempId,
      mbrID: mbrId,
      mbrEducationInstitutionalNm: '',
      mbrEducationDegreeCd: "Bachelor's",
      mbrEducationDesc: '',
      mbrEducationStartDate: new Date().toISOString().split('T')[0],
      mbrEducationEndDate: ''
    };
    setEditList([...editList, newRow]);
  };

  const handleDeleteRow = (mbrEducationId: string) => {
    setEditList(editList.filter((item) => item.mbrEducationId !== mbrEducationId));
    if (!mbrEducationId.startsWith('temp_')) {
      setDeletedIds([...deletedIds, mbrEducationId]);
    }
  };

  const handleFieldChange = (mbrEducationId: string, field: keyof Education, value: any) => {
    setEditList((prevList) =>
      prevList.map((item) => {
        if (item.mbrEducationId === mbrEducationId) {
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
      if (!item.mbrEducationInstitutionalNm.trim()) {
        setError("School/Institution Name is required for all education rows.");
        return;
      }
      if (!item.mbrEducationDegreeCd) {
        setError("Degree or Certificate Cd is required for all education rows.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_education');
        let allEdus: Education[] = [];
        if (saved) {
          allEdus = JSON.parse(saved);
        }
        const otherMembersEdus = allEdus.filter((e) => e.mbrID !== mbrId);
        const updatedList = [...otherMembersEdus, ...editList];
        
        sessionStorage.setItem('sandbox_education', JSON.stringify(updatedList));
        setEducationList(editList);
        setSuccessMsg("Education records updated in Sandbox mode successfully!");
        setIsEditing(false);
      } else {
        // 1. Process deletes
        for (const deleteId of deletedIds) {
          await taskApi.deleteEducation(deleteId);
        }

        // 2. Process creates and updates
        for (const item of editList) {
          const payload = {
            mbrID: mbrId,
            mbrEducationInstitutionalNm: item.mbrEducationInstitutionalNm.trim(),
            mbrEducationDegreeCd: item.mbrEducationDegreeCd,
            mbrEducationDesc: item.mbrEducationDesc?.trim() || null,
            mbrEducationStartDate: item.mbrEducationStartDate || null,
            mbrEducationEndDate: item.mbrEducationEndDate || null
          };

          if (item.mbrEducationId.startsWith('temp_')) {
            await taskApi.createEducation(payload);
          } else {
            await taskApi.updateEducation(item.mbrEducationId, payload);
          }
        }

        // 3. Reload from database
        const dbEducation = await taskApi.getEducations(mbrId);
        setEducationList(dbEducation);
        setSuccessMsg("Education records updated in database successfully!");
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
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const getDegreeBadgeColor = (degree: string | undefined) => {
    switch (degree) {
      case 'High School': return 'bg-slate-50 text-slate-700 border-slate-200/50';
      case 'Associate': return 'bg-blue-50 text-blue-700 border-blue-100/50';
      case "Bachelor's": return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case "Master's": return 'bg-indigo-50 text-indigo-700 border-indigo-100/50';
      case 'PhD': return 'bg-violet-50 text-violet-700 border-violet-100/50';
      case 'Certificate': return 'bg-amber-50 text-amber-700 border-amber-100/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
      
      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 border border-blue-100 text-blue-700 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-800 leading-tight">
              Education & Academic History
            </h3>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Degrees, credentials, and schools attended
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

      {/* --- BANNERS FOR STATE FEEDBACK --- */}
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

      {/* --- VIEW MODE: DISPLAY LIST --- */}
      {!isEditing && (
        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
              <span className="text-xs font-medium">Loading education history...</span>
            </div>
          ) : educationList.length === 0 ? (
            <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-serif text-slate-500 italic">No education records registered.</p>
              <button
                onClick={handleStartEdit}
                className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Education
              </button>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-6 py-2">
              {educationList.map((item) => (
                <div key={item.mbrEducationId} className="relative group">
                  {/* Bullet Node */}
                  <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full group-hover:scale-125 transition-transform shadow-[0_0_0_2px_rgba(37,99,235,0.15)]" />

                  {/* Header metadata row */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-serif text-sm font-bold text-slate-800">
                      {item.mbrEducationInstitutionalNm}
                    </span>
                    
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${getDegreeBadgeColor(item.mbrEducationDegreeCd)}`}>
                      {item.mbrEducationDegreeCd}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 font-bold ml-auto shrink-0">
                      {item.mbrEducationStartDate ? formatDate(item.mbrEducationStartDate) : 'N/A'}
                      {' – '}
                      {item.mbrEducationEndDate ? formatDate(item.mbrEducationEndDate) : 'Present'}
                    </span>
                  </div>

                  {/* Description content */}
                  {item.mbrEducationDesc && (
                    <p className="text-xs text-slate-500 font-serif leading-relaxed mt-1.5 italic">
                      {item.mbrEducationDesc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- EDIT MODE: INTERACTIVE GRID --- */}
      {isEditing && (
        <div className="flex flex-col gap-6">
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#EFECE7]">
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[35%]">
                    School / Institution
                  </th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[20%]">
                    Degree / Cert
                  </th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[25%]">
                    Dates Attended
                  </th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 w-[30%]">
                    Details / Major
                  </th>
                  <th className="pb-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 text-right w-[8%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF8F5]">
                {editList.map((item) => (
                  <tr key={item.mbrEducationId} className="group hover:bg-[#FDFCFB]/50 transition-colors">
                    
                    {/* Institution Name */}
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        value={item.mbrEducationInstitutionalNm}
                        onChange={(e) =>
                          handleFieldChange(item.mbrEducationId, 'mbrEducationInstitutionalNm', e.target.value)
                        }
                        placeholder="e.g. University of Oregon"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800 font-bold"
                      />
                    </td>

                    {/* Degree Cd Select */}
                    <td className="py-3 px-2">
                      <select
                        value={item.mbrEducationDegreeCd}
                        onChange={(e) =>
                          handleFieldChange(item.mbrEducationId, 'mbrEducationDegreeCd', e.target.value)
                        }
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800 cursor-pointer"
                      >
                        {DEGREE_OPTIONS.map(opt => (
                          <option key={opt.cdValue} value={opt.cdValue}>
                            {opt.cdDesc}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Start & End Dates */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={item.mbrEducationStartDate || ''}
                          onChange={(e) =>
                            handleFieldChange(item.mbrEducationId, 'mbrEducationStartDate', e.target.value)
                          }
                          className="w-1/2 bg-white border border-[#EFECE7] rounded-lg text-[10px] outline-none py-1.5 px-2 focus:border-slate-800"
                        />
                        <span className="text-[10px] font-mono text-slate-400 font-bold">–</span>
                        <input
                          type="date"
                          value={item.mbrEducationEndDate || ''}
                          onChange={(e) =>
                            handleFieldChange(item.mbrEducationId, 'mbrEducationEndDate', e.target.value)
                          }
                          placeholder="Present"
                          className="w-1/2 bg-white border border-[#EFECE7] rounded-lg text-[10px] outline-none py-1.5 px-2 focus:border-slate-800"
                        />
                      </div>
                    </td>

                    {/* Description Details */}
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        value={item.mbrEducationDesc || ''}
                        onChange={(e) =>
                          handleFieldChange(item.mbrEducationId, 'mbrEducationDesc', e.target.value)
                        }
                        placeholder="e.g. Major in Literature, honors..."
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Delete Icon */}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteRow(item.mbrEducationId)}
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
            <span>Add Education Record</span>
          </button>

          {/* Action Bar */}
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
