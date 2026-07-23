/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Trash2, Edit3, Save, X, Plus, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface SbMbrStryFamilyProps {
  isSandbox: boolean;
}

interface FamilyMember {
  mbrFamilyId: string;
  mbrId: string;
  mbrFamilyRelationshipCd: string;
  mbrFamilyFirstNm: string;
  mbrFamilyMiddleNm?: string;
  mbrFamilyLastNm: string;
}

const SANDBOX_FAMILY: FamilyMember[] = [
  {
    mbrFamilyId: 'f1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Spouse',
    mbrFamilyFirstNm: 'Thomas',
    mbrFamilyMiddleNm: 'Allen',
    mbrFamilyLastNm: 'Hartwell'
  },
  {
    mbrFamilyId: 'f2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Son',
    mbrFamilyFirstNm: 'Daniel',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Hartwell'
  },
  {
    mbrFamilyId: 'f3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Daughter',
    mbrFamilyFirstNm: 'Claire',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Hartwell'
  },
  {
    mbrFamilyId: 'f4',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Grandfather',
    mbrFamilyFirstNm: 'Harold',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Sorenson'
  }
];

const DEFAULT_RELATIONSHIPS = [
  { cdValue: 'Fatther', cdDesc: 'Father' },
  { cdValue: 'Mother', cdDesc: 'Mother' },
  { cdValue: 'Son', cdDesc: 'Son' },
  { cdValue: 'Daughter', cdDesc: 'Daughter' },
  { cdValue: 'Grandfather', cdDesc: 'Grandfather' },
  { cdValue: 'Grandmother', cdDesc: 'Grandmother' },
  { cdValue: 'Great Grandfather', cdDesc: 'Great Grandfather' },
  { cdValue: 'Great Grandmother', cdDesc: 'Great Grandmother' },
  { cdValue: '1st Cousin', cdDesc: '1st Cousin' },
  { cdValue: 'N Cousin', cdDesc: 'N Cousin' },
  { cdValue: 'Step Son', cdDesc: 'Step Son' },
  { cdValue: 'Step Daughter', cdDesc: 'Step Daughter' }
];

export default function SbMbrStryFamily({ isSandbox }: SbMbrStryFamilyProps) {
  // --- STATE VARIABLES ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [familyList, setFamilyList] = useState<FamilyMember[]>([]);
  const [editList, setEditList] = useState<FamilyMember[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [relationshipCodes, setRelationshipCodes] = useState<any[]>(DEFAULT_RELATIONSHIPS);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    loadData();
  }, [isSandbox]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load relationship codes from DB or fallback
      if (!isSandbox) {
        try {
          const codes = await taskApi.getLookupCodes('mbrFamilyRelationsipCd');
          if (codes && codes.length > 0) {
            setRelationshipCodes(codes);
          }
        } catch (e) {
          console.warn("Could not fetch DB relationship codes, using defaults:", e);
        }
      } else {
        setRelationshipCodes(DEFAULT_RELATIONSHIPS);
      }

      // 2. Fetch logged-in user and lookup their member profile ID
      let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr && !isSandbox) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) {
            currentMbrId = mbrProfile.mbrId;
            setMbrId(currentMbrId);
          }
        } catch (e) {
          console.warn("Could not retrieve member profile ID from DB, falling back to default Eleanor Hartwell UUID:", e);
        }
      }

      // 3. Load family records
      if (isSandbox) {
        // Load from local sandbox state or sessionStorage
        const saved = sessionStorage.getItem('sandbox_family');
        if (saved) {
          setFamilyList(JSON.parse(saved));
        } else {
          setFamilyList(SANDBOX_FAMILY);
          sessionStorage.setItem('sandbox_family', JSON.stringify(SANDBOX_FAMILY));
        }
      } else {
        const dbFamily = await taskApi.getFamilyMembers(currentMbrId);
        setFamilyList(dbFamily);
      }
    } catch (err: any) {
      setError(`Failed to load family directory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- BUTTON ACTIONS ---
  const handleStartEdit = () => {
    setEditList([...familyList]);
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
    const newRow: FamilyMember = {
      mbrFamilyId: tempId,
      mbrId: mbrId,
      mbrFamilyRelationshipCd: relationshipCodes[0]?.cdValue || 'Spouse',
      mbrFamilyFirstNm: '',
      mbrFamilyMiddleNm: '',
      mbrFamilyLastNm: ''
    };
    setEditList([...editList, newRow]);
  };

  const handleDeleteRow = (mbrFamilyId: string) => {
    setEditList(editList.filter((item) => item.mbrFamilyId !== mbrFamilyId));
    if (!mbrFamilyId.startsWith('temp_')) {
      setDeletedIds([...deletedIds, mbrFamilyId]);
    }
  };

  const handleFieldChange = (mbrFamilyId: string, field: keyof FamilyMember, value: string) => {
    setEditList(
      editList.map((item) => {
        if (item.mbrFamilyId === mbrFamilyId) {
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
      if (!item.mbrFamilyFirstNm.trim() || !item.mbrFamilyLastNm.trim()) {
        setError("First Name and Last Name are required for all family members.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSandbox) {
        // Update local session storage
        sessionStorage.setItem('sandbox_family', JSON.stringify(editList));
        setFamilyList(editList);
        setSuccessMsg("Family records updated in Sandbox mode successfully!");
        setIsEditing(false);
      } else {
        // 1. Process deletes
        for (const deleteId of deletedIds) {
          await taskApi.deleteFamilyMember(deleteId);
        }

        // 2. Process creates and updates
        for (const item of editList) {
          if (item.mbrFamilyId.startsWith('temp_')) {
            // Create record
            await taskApi.createFamilyMember({
              mbrId: mbrId,
              mbrFamilyRelationshipCd: item.mbrFamilyRelationshipCd,
              mbrFamilyFirstNm: item.mbrFamilyFirstNm.trim(),
              mbrFamilyMiddleNm: item.mbrFamilyMiddleNm?.trim() || undefined,
              mbrFamilyLastNm: item.mbrFamilyLastNm.trim()
            });
          } else {
            // Update record
            await taskApi.updateFamilyMember(item.mbrFamilyId, {
              mbrId: mbrId,
              mbrFamilyRelationshipCd: item.mbrFamilyRelationshipCd,
              mbrFamilyFirstNm: item.mbrFamilyFirstNm.trim(),
              mbrFamilyMiddleNm: item.mbrFamilyMiddleNm?.trim() || undefined,
              mbrFamilyLastNm: item.mbrFamilyLastNm.trim()
            });
          }
        }

        // 3. Reload from database
        const dbFamily = await taskApi.getFamilyMembers(mbrId);
        setFamilyList(dbFamily);
        setSuccessMsg("Family records updated in database successfully!");
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper for generating avatar initials
  const getInitials = (first: string, last: string) => {
    const f = first ? first[0] : '';
    const l = last ? last[0] : '';
    return (f + l).toUpperCase() || '?';
  };

  // Helper for mapping cdValue to clean desc labels
  const getRelationLabel = (cdVal: string) => {
    const codeObj = relationshipCodes.find((c) => c.cdValue === cdVal);
    return codeObj ? codeObj.cdDesc : cdVal;
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6">
      
      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 border border-blue-100 text-blue-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest font-mono">
              {isEditing ? 'Status: Editing' : 'Status: Draft'}
            </span>
            <h2 className="font-serif text-lg font-bold text-slate-800">Family</h2>
          </div>
        </div>

        {/* Toggle Mode Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', { detail: { topicId: 'family', topicTitle: 'Family', componentName: 'sbMbrStryFamly' } }))}
              className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Story Editor"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            </button>
            <button
              onClick={() => alert('Opening Privacy settings for family members...')}
              className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Privacy settings"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleStartEdit}
              disabled={loading}
              title="Edit Family"
              className="p-2.5 text-slate-505 hover:text-slate-805 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-all duration-150 cursor-pointer disabled:opacity-50"
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
        /* Loading State */
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
          <span className="text-xs font-medium">Loading family members...</span>
        </div>
      ) : !isEditing ? (
        /* DISPLAY MODE: Premium Card Grid */
        familyList.length === 0 ? (
          <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-serif text-slate-500 italic">No family members registered.</p>
            <button
              onClick={handleStartEdit}
              className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Family Members
            </button>
          </div>
        ) : (
          <div className="max-h-[268px] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {familyList.map((member) => (
                <div
                  key={member.mbrFamilyId}
                  className="bg-white border border-[#EFECE7] rounded-2xl p-4 flex items-center gap-4 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.015)] transition-all duration-200"
                >
                  {/* Initials Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-serif font-black text-sm shrink-0">
                    {getInitials(member.mbrFamilyFirstNm, member.mbrFamilyLastNm)}
                  </div>

                  <div className="min-w-0 flex-grow">
                    <h3 className="font-serif text-sm font-bold text-slate-805 truncate leading-snug">
                      {member.mbrFamilyFirstNm}{' '}
                      {member.mbrFamilyMiddleNm ? `${member.mbrFamilyMiddleNm} ` : ''}
                      {member.mbrFamilyLastNm}
                    </h3>
                    
                    {/* Badged relationship category */}
                    <span className="inline-flex mt-1 items-center px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100/50 rounded-full uppercase tracking-wider">
                      {getRelationLabel(member.mbrFamilyRelationshipCd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        /* EDIT MODE: Form Directory Grid/Table */
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto overflow-y-auto max-h-[370px] pr-1 border border-[#EFECE7] rounded-xl">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-[#FDFCFB] z-10 border-b border-[#EFECE7] shadow-xs">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-2 bg-[#FDFCFB]">Relationship</th>
                  <th className="py-2.5 px-2 bg-[#FDFCFB]">First Name</th>
                  <th className="py-2.5 px-2 bg-[#FDFCFB]">Middle Name</th>
                  <th className="py-2.5 px-2 bg-[#FDFCFB]">Last Name</th>
                  <th className="py-2.5 px-2 text-right bg-[#FDFCFB]">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editList.map((item) => (
                  <tr key={item.mbrFamilyId} className="group hover:bg-slate-50/30 transition-colors">
                    
                    {/* Relationship Selection Dropdown */}
                    <td className="py-3 px-2 min-w-[140px]">
                      <select
                        value={item.mbrFamilyRelationshipCd}
                        onChange={(e) =>
                          handleFieldChange(item.mbrFamilyId, 'mbrFamilyRelationshipCd', e.target.value)
                        }
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      >
                        {relationshipCodes.map((code) => (
                          <option key={code.cdValue} value={code.cdValue}>
                            {code.cdDesc}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* First Name Input */}
                    <td className="py-3 px-2 min-w-[120px]">
                      <input
                        type="text"
                        value={item.mbrFamilyFirstNm}
                        onChange={(e) =>
                          handleFieldChange(item.mbrFamilyId, 'mbrFamilyFirstNm', e.target.value)
                        }
                        placeholder="First Name"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Middle Name Input */}
                    <td className="py-3 px-2 min-w-[100px]">
                      <input
                        type="text"
                        value={item.mbrFamilyMiddleNm || ''}
                        onChange={(e) =>
                          handleFieldChange(item.mbrFamilyId, 'mbrFamilyMiddleNm', e.target.value)
                        }
                        placeholder="Middle Name"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Last Name Input */}
                    <td className="py-3 px-2 min-w-[120px]">
                      <input
                        type="text"
                        value={item.mbrFamilyLastNm}
                        onChange={(e) =>
                          handleFieldChange(item.mbrFamilyId, 'mbrFamilyLastNm', e.target.value)
                        }
                        placeholder="Last Name"
                        className="w-full bg-white border border-[#EFECE7] rounded-lg text-xs outline-none py-2 px-2.5 focus:border-slate-800"
                      />
                    </td>

                    {/* Delete Icon Button */}
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteRow(item.mbrFamilyId)}
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


          {/* Add Member Row Button */}
          <button
            onClick={handleAddRow}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>

          {/* Actions Bottom Bar */}
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
