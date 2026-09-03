/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, X, Users, Check, Shield, MapPin, Briefcase } from 'lucide-react';
import { MemberInvitationItem, UnifiedGroupOption } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface AcceptInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: MemberInvitationItem | null;
  groups: UnifiedGroupOption[];
  onConfirmAccept: (contactId: string, selectedGrpId: string) => void;
}

export default function AcceptInvitationModal({
  isOpen,
  onClose,
  invitation,
  groups,
  onConfirmAccept
}: AcceptInvitationModalProps) {
  const [chosenGrpId, setChosenGrpId] = useState<string>('');

  // Filter out 'Public' group so it is not shown as a connection group option
  const assignableGroups = groups.filter(
    (grp) => grp.grpName?.trim().toLowerCase() !== 'public'
  );

  useEffect(() => {
    if (invitation) {
      const candidateId = invitation.selectedGrpId ?? invitation.contact.grpId;
      const isValid = assignableGroups.some((g) => g.grpId === candidateId);
      setChosenGrpId(isValid ? candidateId! : assignableGroups[0]?.grpId || '');
    }
  }, [invitation, groups, isOpen]);

  if (!isOpen || !invitation) return null;

  const sender = invitation.senderMember;
  const senderName = sender
    ? `${sender.mbrFirstName || ''} ${sender.mbrLastName || ''}`.trim() || 'StoryBook Member'
    : 'StoryBook Member';
  const senderInitials = sender
    ? `${sender.mbrFirstName?.[0] || 'M'}${sender.mbrLastName?.[0] || ''}`.toUpperCase()
    : 'SB';

  const handleConfirm = () => {
    onConfirmAccept(invitation.contact.mbrContactId, chosenGrpId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 overflow-hidden text-slate-800 dark:text-white"
        >
          <AdminComponentTag name="AcceptInvitationModal.tsx" />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Accept Connection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                  Choose which group to place this member into
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sender Profile Snippet */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              {sender?.mbrProfilePic ? (
                <img src={sender.mbrProfilePic} alt={senderName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-base">{senderInitials}</span>
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white truncate">
                {senderName}
              </h4>
              {sender?.mbrLivesCityState && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{sender.mbrLivesCityState}</span>
                </p>
              )}
              {sender?.mbrWorkAt && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{sender.mbrWorkAt}</span>
                </p>
              )}
            </div>
          </div>

          {/* Group Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Select Group Assignment</span>
              </label>
              <span className="text-[11px] text-slate-400 font-sans">Controls story viewing permissions</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {assignableGroups.map((grp) => {
                const isSelected = chosenGrpId === grp.grpId;
                return (
                  <label
                    key={grp.grpId}
                    onClick={() => setChosenGrpId(grp.grpId)}
                    className={`flex items-start justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-slate-900 dark:text-white">
                          {grp.grpName}
                        </span>
                        {grp.isCustom && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                            Custom
                          </span>
                        )}
                      </div>
                      {grp.grpDescription && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-tight">
                          {grp.grpDescription}
                        </p>
                      )}
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}

              {/* Option for No Group / Unassigned */}
              <label
                onClick={() => setChosenGrpId('')}
                className={`flex items-start justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  chosenGrpId === ''
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <span className="text-xs font-serif font-bold text-slate-900 dark:text-white">
                    None (Unassigned)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-tight">
                    Connect without assigning to a specific group.
                  </p>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  chosenGrpId === ''
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {chosenGrpId === '' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </label>
            </div>
          </div>


          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-serif font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-serif font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Accept</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
