/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, X, Loader2, CheckCircle2, MessageSquare, Tag, Users } from 'lucide-react';
import { taskApi, GroupGlobal, GroupCustom, LookupCode } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface MbrConnectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: {
    mbrId: string;
    mbrFirstName?: string;
    mbrLastName?: string;
    name?: string;
    mbrLivesCityState?: string;
    mbrProfilePic?: string;
  };
  viewerMbrId?: string | null;
  onSuccess?: () => void;
}

export type SbConnectModalProps = MbrConnectPanelProps;
export type mbrConnectPanelProps = MbrConnectPanelProps;

export default function MbrConnectPanel({
  isOpen,
  onClose,
  targetMember,
  viewerMbrId: propViewerMbrId,
  onSuccess
}: MbrConnectPanelProps) {
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [reasonCodes, setReasonCodes] = useState<LookupCode[]>([]);
  const [selectedReasonCd, setSelectedReasonCd] = useState<string>('FRIEND');
  const [groups, setGroups] = useState<{ grpId: string; grpName: string }[]>([]);
  const [selectedGrpId, setSelectedGrpId] = useState<string>('');
  const [contactMsg, setContactMsg] = useState<string>('');

  // Resolved viewer member info
  const [resolvedViewerId, setResolvedViewerId] = useState<string | null>(propViewerMbrId || null);
  const [viewerEmail, setViewerEmail] = useState<string>('');

  // Load lookup codes, groups, and viewer info when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setSuccess(false);
    setContactMsg('');
    setLoadingInitial(true);

    const initModal = async () => {
      try {
        // 1. Resolve viewer mbrId
        let viewerId = propViewerMbrId || null;
        let vEmail = '';

        const storedMbr = sessionStorage.getItem('sb_current_mbr');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId) viewerId = parsed.mbrId;
            if (parsed.mbrEmailAddress) vEmail = parsed.mbrEmailAddress;
          } catch {}
        }

        if (!viewerId) {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              if (u.user_id) {
                const profile = await taskApi.getMemberByUserId(u.user_id);
                if (profile?.mbrId) viewerId = profile.mbrId;
                if (profile?.mbrEmailAddress) vEmail = profile.mbrEmailAddress;
              }
            } catch (e) {
              console.warn("Could not resolve viewer profile for connect modal:", e);
            }
          }
        }

        setResolvedViewerId(viewerId);
        setViewerEmail(vEmail);

        // 2. Fetch reason codes and groups in parallel
        const [fetchedCodes, globals, customs] = await Promise.all([
          taskApi.getLookupCodes('mbrContactReasonCd').catch(() => []),
          taskApi.getGroupsGlobal().catch(() => []),
          viewerId ? taskApi.getGroupsCustom(viewerId).catch(() => []) : Promise.resolve([])
        ]);

        // Fallback reason codes if empty
        const defaultCodes: LookupCode[] = [
          { cdId: 'r1', cdTag: 'mbrContactReasonCd', cdValue: 'FRIEND', cdLabel: 'Friends' },
          { cdId: 'r2', cdTag: 'mbrContactReasonCd', cdValue: 'FAMILY', cdLabel: 'Family' },
          { cdId: 'r3', cdTag: 'mbrContactReasonCd', cdValue: 'WORK', cdLabel: 'Work' },
          { cdId: 'r4', cdTag: 'mbrContactReasonCd', cdValue: 'OTHER', cdLabel: 'Other' }
        ];

        const codes = (fetchedCodes && fetchedCodes.length > 0) ? fetchedCodes : defaultCodes;
        setReasonCodes(codes);
        if (codes.length > 0) {
          setSelectedReasonCd(codes[0].cdValue);
        }

        // Combine global and custom groups (excluding Public group)
        const defaultGroups = [
          { grpId: 'g1', grpName: 'Family' },
          { grpId: 'g2', grpName: 'Friends' },
          { grpId: 'g3', grpName: 'Work' }
        ];

        const rawGlobals = globals && globals.length > 0 ? globals : defaultGroups;
        const filteredGlobals = rawGlobals.filter(g => g.grpName?.trim().toLowerCase() !== 'public');

        const allG = [
          ...filteredGlobals.map(g => ({ grpId: g.grpId, grpName: g.grpName })),
          ...(customs || []).filter(c => c.grpName?.trim().toLowerCase() !== 'public').map(c => ({ grpId: c.grpId, grpName: `${c.grpName} (Custom)` }))
        ];

        setGroups(allG);
        if (allG.length > 0) {
          setSelectedGrpId(allG[0].grpId);
        }
      } catch (err: any) {
        console.error("Error initializing connect modal:", err);
      } finally {
        setLoadingInitial(false);
      }
    };

    initModal();
  }, [isOpen, propViewerMbrId]);

  // Handle Save / Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedViewerId) {
      setError("Please log in with a valid member profile to send a connection request.");
      return;
    }

    const targetMbrId = targetMember.mbrId;
    if (!targetMbrId) {
      setError("Target member ID is missing.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create record in mbrContact
      await taskApi.createMemberContact({
        mbrId: resolvedViewerId,
        mbrContactMbrId: targetMbrId,
        mbrContactReasonCd: selectedReasonCd,
        grpId: selectedGrpId || undefined,
        mbrContactMsg: contactMsg.trim() || undefined,
        mbrContactEmail: viewerEmail || undefined,
        mbrContactResponseInd: 0
      });

      setSuccess(true);
      window.dispatchEvent(new CustomEvent('invitations-updated'));
      if (onSuccess) {
        onSuccess();
      }


      // Auto close after 1.5s
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1600);
    } catch (err: any) {
      console.error("Failed to save member contact:", err);
      setError(err?.message || "Failed to submit connection request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const targetName = targetMember.mbrFirstName && targetMember.mbrLastName
    ? `${targetMember.mbrFirstName} ${targetMember.mbrLastName}`
    : (targetMember.name || targetMember.mbrFirstName || 'StoryBook Member');

  const targetInitials = (targetMember.mbrFirstName?.[0] || '') + (targetMember.mbrLastName?.[0] || '') || 'SB';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Window Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-[#EFECE7] flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-transparent to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs shrink-0">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-850">
                  Connect with Member
                </h3>
                <p className="text-xs text-slate-400 font-serif">
                  Send a connection inquiry and request
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body / Form */}
          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
            {/* Target Member Profile Highlight */}
            <div className="flex items-center gap-3.5 p-3.5 bg-white border border-[#EFECE7] rounded-2xl shadow-2xs">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#EFECE7] bg-slate-100 flex items-center justify-center">
                {targetMember.mbrProfilePic ? (
                  <img
                    src={targetMember.mbrProfilePic}
                    alt={targetName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif font-bold text-slate-600 text-sm">{targetInitials}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-slate-800 text-sm truncate">{targetName}</h4>
                {targetMember.mbrLivesCityState && (
                  <p className="text-xs text-slate-400 truncate">{targetMember.mbrLivesCityState}</p>
                )}
              </div>
            </div>

            {loadingInitial ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-serif">Loading connection options...</span>
              </div>
            ) : success ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-emerald-600 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h4 className="font-serif font-bold text-base text-emerald-800">Connection Request Sent!</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Your inquiry has been recorded and sent to {targetName}.
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-serif">
                    {error}
                  </div>
                )}

                {/* Field 1: Reason Code (mbrContactReasonCd) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-serif font-bold text-slate-700">
                    <Tag className="w-3.5 h-3.5 text-blue-500" />
                    <span>Connection Reason <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    value={selectedReasonCd}
                    onChange={(e) => setSelectedReasonCd(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EFECE7] rounded-xl text-xs font-serif text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs cursor-pointer"
                  >
                    {reasonCodes.map((rc) => (
                      <option key={rc.cdId || rc.cdValue} value={rc.cdValue}>
                        {rc.cdLabel || rc.cdValue} {rc.cdDesc ? `— ${rc.cdDesc}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Assign to Group (grpId) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-serif font-bold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Assign to Group</span>
                  </label>
                  <select
                    value={selectedGrpId}
                    onChange={(e) => setSelectedGrpId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EFECE7] rounded-xl text-xs font-serif text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs cursor-pointer"
                  >
                    {groups.map((g) => (
                      <option key={g.grpId} value={g.grpId}>
                        {g.grpName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Optional Contact Message (mbrContactMsg) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-serif font-bold text-slate-700">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                    <span>Personal Message <span className="text-[10px] font-normal text-slate-400">(Optional)</span></span>
                  </label>
                  <textarea
                    rows={3}
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Hello! I would like to connect with you on StoryBook..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EFECE7] rounded-xl text-xs font-serif text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs resize-none leading-relaxed"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-[#EFECE7] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-serif font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-serif font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Send Connection Request</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <AdminComponentTag name="mbrConnectPanel" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export { MbrConnectPanel, MbrConnectPanel as mbrConnectPanel, MbrConnectPanel as SbConnectModal };

