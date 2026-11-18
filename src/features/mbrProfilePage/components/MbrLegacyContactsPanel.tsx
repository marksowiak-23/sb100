/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartHandshake, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Phone, 
  Mail, 
  X, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  User
} from 'lucide-react';
import { taskApi, mbrMemorialContactApi, MbrMemorialContact } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { CdSelect } from '@/src/components/CdSelect';
import { useCodes } from '@/src/context/CodeContext';

interface MbrLegacyContactsPanelProps {
  isSandbox: boolean;
  mbrId: string | null;
  memberName?: string;
}

// Fallback seed data for Sandbox / Demo mode
const SANDBOX_SEED_CONTACTS: Partial<MbrMemorialContact>[] = [
  {
    mbrMemorialContactId: 'sb-seed-mc-001',
    contactFirstName: 'Sarah',
    contactLastName: 'Jenkins',
    contactEmail: 'sarah.jenkins@example.com',
    contactPhone: '+1 (555) 234-5678',
    contactRelationshipCd: 'SPOUSE',
    contactPriorityOrder: 1,
    contactStatusCd: 'CONFIRMED',
    allowStoryPublishFlag: true,
    allowStoryEditFlag: true,
    allowPhotoManageFlag: true,
    allowBookOrderFlag: true,
    allowDownloadArchiveFlag: true,
    personalMessage: 'Sarah, please ensure our travel memories and childhood stories are compiled for the family storybook.',
    contactNotifiedDt: '2026-10-12T14:30:00Z',
    contactConfirmedDt: '2026-10-13T09:15:00Z',
    mbrMemorialContactCreatedAt: '2026-10-12T14:20:00Z',
    mbrMemorialContactUpdatedAt: '2026-10-13T09:15:00Z'
  },
  {
    mbrMemorialContactId: 'sb-seed-mc-002',
    contactFirstName: 'David',
    contactLastName: 'Miller',
    contactEmail: 'dmiller.estate@example.com',
    contactPhone: '+1 (555) 876-5432',
    contactRelationshipCd: 'EXECUTOR',
    contactPriorityOrder: 2,
    contactStatusCd: 'DESIGNATED',
    allowStoryPublishFlag: true,
    allowStoryEditFlag: false,
    allowPhotoManageFlag: true,
    allowBookOrderFlag: true,
    allowDownloadArchiveFlag: true,
    personalMessage: 'David is our family attorney and alternate memorial custodian.',
    contactNotifiedDt: '2026-11-01T10:00:00Z',
    mbrMemorialContactCreatedAt: '2026-11-01T09:50:00Z',
    mbrMemorialContactUpdatedAt: '2026-11-01T10:00:00Z'
  }
];

export default function MbrLegacyContactsPanel({
  isSandbox,
  mbrId,
  memberName = 'Member'
}: MbrLegacyContactsPanelProps) {
  const { getCodeLabel } = useCodes();

  // Contact list state
  const [contacts, setContacts] = useState<MbrMemorialContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<MbrMemorialContact | null>(null);
  const [savingContact, setSavingContact] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    contactRelationshipCd: 'SPOUSE',
    contactPriorityOrder: 1,
    contactStatusCd: 'DESIGNATED',
    allowStoryPublishFlag: true,
    allowStoryEditFlag: false,
    allowPhotoManageFlag: true,
    allowBookOrderFlag: true,
    allowDownloadArchiveFlag: true,
    personalMessage: ''
  });

  // Delete confirmation state
  const [deleteConfirmContact, setDeleteConfirmContact] = useState<MbrMemorialContact | null>(null);
  const [deletingContact, setDeletingContact] = useState(false);

  const sandboxKey = useMemo(() => `sb_sandbox_memorial_contacts_${mbrId || 'default'}`, [mbrId]);

  // Load contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSandbox) {
        const stored = sessionStorage.getItem(sandboxKey);
        if (stored) {
          try {
            setContacts(JSON.parse(stored));
          } catch {
            setContacts(SANDBOX_SEED_CONTACTS as MbrMemorialContact[]);
          }
        } else {
          setContacts(SANDBOX_SEED_CONTACTS as MbrMemorialContact[]);
          sessionStorage.setItem(sandboxKey, JSON.stringify(SANDBOX_SEED_CONTACTS));
        }
      } else {
        if (mbrId) {
          const data = await mbrMemorialContactApi.getMemberMemorialContacts(mbrId);
          setContacts(data || []);
        } else {
          setContacts([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load memorial contacts:', err);
      setError(err?.message || 'Failed to load legacy contacts');
    } finally {
      setLoading(false);
    }
  }, [isSandbox, mbrId, sandboxKey]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Save Sandbox changes
  const persistSandbox = (updated: MbrMemorialContact[]) => {
    sessionStorage.setItem(sandboxKey, JSON.stringify(updated));
    setContacts(updated);
  };

  // Open modal for new contact
  const handleOpenAddModal = () => {
    setEditingContact(null);
    setModalError(null);
    const nextPriority = contacts.length > 0 
      ? Math.max(...contacts.map(c => c.contactPriorityOrder || 1)) + 1 
      : 1;

    setFormData({
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '',
      contactRelationshipCd: 'SPOUSE',
      contactPriorityOrder: nextPriority,
      contactStatusCd: 'DESIGNATED',
      allowStoryPublishFlag: true,
      allowStoryEditFlag: false,
      allowPhotoManageFlag: true,
      allowBookOrderFlag: true,
      allowDownloadArchiveFlag: true,
      personalMessage: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing contact
  const handleOpenEditModal = (contact: MbrMemorialContact) => {
    setEditingContact(contact);
    setModalError(null);
    setFormData({
      contactFirstName: contact.contactFirstName || '',
      contactLastName: contact.contactLastName || '',
      contactEmail: contact.contactEmail || '',
      contactPhone: contact.contactPhone || '',
      contactRelationshipCd: contact.contactRelationshipCd || 'OTHER',
      contactPriorityOrder: contact.contactPriorityOrder || 1,
      contactStatusCd: contact.contactStatusCd || 'DESIGNATED',
      allowStoryPublishFlag: contact.allowStoryPublishFlag ?? true,
      allowStoryEditFlag: contact.allowStoryEditFlag ?? false,
      allowPhotoManageFlag: contact.allowPhotoManageFlag ?? true,
      allowBookOrderFlag: contact.allowBookOrderFlag ?? true,
      allowDownloadArchiveFlag: contact.allowDownloadArchiveFlag ?? true,
      personalMessage: contact.personalMessage || ''
    });
    setIsModalOpen(true);
  };

  // Save Contact (Create or Update)
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    // Validation
    if (!formData.contactFirstName.trim() || !formData.contactLastName.trim()) {
      setModalError('First and last name are required.');
      return;
    }
    const normalizedEmail = formData.contactEmail.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setModalError('Please enter a valid email address.');
      return;
    }

    // Client-side duplicate check
    const isDuplicate = contacts.some(c => 
      c.contactEmail?.trim().toLowerCase() === normalizedEmail &&
      (!editingContact || c.mbrMemorialContactId !== editingContact.mbrMemorialContactId)
    );
    if (isDuplicate) {
      setModalError(`A legacy contact with email "${formData.contactEmail.trim()}" has already been added.`);
      return;
    }

    setSavingContact(true);
    try {
      if (isSandbox) {
        if (editingContact) {
          // Update sandbox item
          const updated = contacts.map(c => {
            if (c.mbrMemorialContactId === editingContact.mbrMemorialContactId) {
              return {
                ...c,
                ...formData,
                contactEmail: normalizedEmail,
                mbrMemorialContactUpdatedAt: new Date().toISOString()
              };
            }
            return c;
          });
          persistSandbox(updated);
          setSuccess(`Updated legacy contact ${formData.contactFirstName} ${formData.contactLastName}.`);
        } else {
          // Add sandbox item
          const newContact: MbrMemorialContact = {
            mbrMemorialContactId: `sb-mc-${Date.now()}`,
            mbrId: mbrId || 'sandbox-mbr-id',
            ...formData,
            contactEmail: normalizedEmail,
            mbrMemorialContactCreatedAt: new Date().toISOString(),
            mbrMemorialContactUpdatedAt: new Date().toISOString()
          };
          const updated = [...contacts, newContact];
          persistSandbox(updated);
          setSuccess(`Added ${formData.contactFirstName} ${formData.contactLastName} as a legacy contact.`);
        }
      } else {
        if (editingContact) {
          // Live API update
          await mbrMemorialContactApi.updateMemberMemorialContact(editingContact.mbrMemorialContactId, {
            contactFirstName: formData.contactFirstName.trim(),
            contactLastName: formData.contactLastName.trim(),
            contactEmail: normalizedEmail,
            contactPhone: formData.contactPhone.trim() || null,
            contactRelationshipCd: formData.contactRelationshipCd,
            contactPriorityOrder: Number(formData.contactPriorityOrder) || 1,
            contactStatusCd: formData.contactStatusCd,
            allowStoryPublishFlag: formData.allowStoryPublishFlag,
            allowStoryEditFlag: formData.allowStoryEditFlag,
            allowPhotoManageFlag: formData.allowPhotoManageFlag,
            allowBookOrderFlag: formData.allowBookOrderFlag,
            allowDownloadArchiveFlag: formData.allowDownloadArchiveFlag,
            personalMessage: formData.personalMessage.trim() || null
          });
          setSuccess(`Updated legacy contact ${formData.contactFirstName} ${formData.contactLastName}.`);
        } else {
          // Live API create
          if (!mbrId) throw new Error('Missing member ID for creating contact.');
          await mbrMemorialContactApi.createMemberMemorialContact({
            mbrId: mbrId,
            contactFirstName: formData.contactFirstName.trim(),
            contactLastName: formData.contactLastName.trim(),
            contactEmail: normalizedEmail,
            contactPhone: formData.contactPhone.trim() || null,
            contactRelationshipCd: formData.contactRelationshipCd,
            contactPriorityOrder: Number(formData.contactPriorityOrder) || 1,
            contactStatusCd: formData.contactStatusCd,
            allowStoryPublishFlag: formData.allowStoryPublishFlag,
            allowStoryEditFlag: formData.allowStoryEditFlag,
            allowPhotoManageFlag: formData.allowPhotoManageFlag,
            allowBookOrderFlag: formData.allowBookOrderFlag,
            allowDownloadArchiveFlag: formData.allowDownloadArchiveFlag,
            personalMessage: formData.personalMessage.trim() || null
          });
          setSuccess(`Added ${formData.contactFirstName} ${formData.contactLastName} as a legacy contact.`);
        }
        await fetchContacts();
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to save memorial contact:', err);
      const rawMsg = err?.message || '';
      if (
        rawMsg.toLowerCase().includes('uq_mbrmemorialcontact_mbr_email') ||
        rawMsg.toLowerCase().includes('duplicate key') ||
        rawMsg.toLowerCase().includes('unique constraint') ||
        rawMsg.toLowerCase().includes('already exists') ||
        rawMsg.toLowerCase().includes('already been added')
      ) {
        setModalError(`A legacy contact with email "${formData.contactEmail.trim()}" has already been added.`);
      } else {
        setModalError(rawMsg || 'Failed to save legacy contact.');
      }
    } finally {
      setSavingContact(false);
    }
  };

  // Delete Contact
  const handleDeleteContact = async () => {
    if (!deleteConfirmContact) return;
    setDeletingContact(true);

    try {
      if (isSandbox) {
        const updated = contacts.filter(c => c.mbrMemorialContactId !== deleteConfirmContact.mbrMemorialContactId);
        persistSandbox(updated);
        setSuccess(`Removed ${deleteConfirmContact.contactFirstName} ${deleteConfirmContact.contactLastName} from legacy contacts.`);
      } else {
        await mbrMemorialContactApi.deleteMemberMemorialContact(deleteConfirmContact.mbrMemorialContactId);
        setSuccess(`Removed ${deleteConfirmContact.contactFirstName} ${deleteConfirmContact.contactLastName} from legacy contacts.`);
        await fetchContacts();
      }
      setDeleteConfirmContact(null);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to delete contact:', err);
      setError(err?.message || 'Failed to delete legacy contact.');
    } finally {
      setDeletingContact(false);
    }
  };

  // Sort contacts by priority order
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => (a.contactPriorityOrder || 1) - (b.contactPriorityOrder || 1));
  }, [contacts]);

  return (
    <div className="space-y-6">
      <AdminComponentTag name="MbrLegacyContactsPanel.tsx" />

      {/* --- HERO / EXPLANATION BANNER --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-amber-100/20 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-serif font-bold border border-amber-200/80 dark:border-amber-800/80">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Memorialization & Memoir Guardianship</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
              My Legacy Contacts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              Designate trusted family members, executors, or close friends to maintain your life stories, 
              photo archives, and memorial storybook orders when you are no longer able to do so.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchContacts}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-serif font-semibold transition-all shadow-xs cursor-pointer"
              title="Refresh contacts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-serif font-bold transition-all shadow-sm shadow-amber-600/20 hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK TOASTS --- */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-serif flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccess(null)}
              className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-serif flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTACTS LIST CONTAINER --- */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-serif font-semibold">Loading legacy contacts...</span>
        </div>
      ) : sortedContacts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
              No Legacy Contacts Added Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Safeguard your family memoirs and photographs. Add your first legacy contact to ensure your stories live on for future generations.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-serif font-bold transition-all shadow-sm shadow-amber-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedContacts.map((contact) => {
            const relationshipLabel = getCodeLabel('contactRelationshipCd', contact.contactRelationshipCd, contact.contactRelationshipCd);

            return (
              <div
                key={contact.mbrMemorialContactId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header row: Contact info & actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                          {contact.contactFirstName} {contact.contactLastName}
                        </h4>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          {relationshipLabel}
                        </span>
                      </div>

                      {/* Contact metadata: Email and Phone */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-sans">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.contactEmail}</span>
                        </div>
                        {contact.contactPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{contact.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Action buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(contact)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Contact"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmContact(contact)}
                      className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Personal Message Preview if exists */}
                {contact.personalMessage && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 text-xs font-serif text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Private Guidance for Custodian</span>
                      </div>
                      <p className="italic font-sans text-slate-600 dark:text-slate-300">
                        "{contact.personalMessage}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD / EDIT CONTACT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                      {editingContact ? 'Edit Contact' : 'Add Contact'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Specify contact details and relationship.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Error Banner */}
              {modalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-serif flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={handleSaveContact} className="space-y-5">
                {/* Section 1: Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactFirstName}
                      onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                      placeholder="e.g. Sarah"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactLastName}
                      onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                      placeholder="e.g. Jenkins"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="contact@example.com"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-serif font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Section 2: Relationship */}
                <div className="pt-2">
                  <label className="block text-xs font-serif font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Relationship
                  </label>
                  <CdSelect
                    tag="contactRelationshipCd"
                    value={formData.contactRelationshipCd}
                    onChange={(val) => setFormData({ ...formData, contactRelationshipCd: val })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>

                {/* Section 3: Personal Message */}
                <div className="pt-2">
                  <label className="block text-xs font-serif font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Personal Message / Guidance for Custodian
                  </label>
                  <textarea
                    rows={3}
                    value={formData.personalMessage}
                    onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
                    placeholder="Write a private note or legacy guidance visible only to this contact (e.g. specific stories you want published or print book instructions)..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={savingContact}
                    className="px-4 py-2 rounded-xl text-xs font-serif font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingContact}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-serif font-bold transition-all shadow-sm shadow-amber-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {savingContact && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AnimatePresence>
        {deleteConfirmContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                  Remove Legacy Contact?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirmContact.contactFirstName} {deleteConfirmContact.contactLastName}</strong> as a legacy custodian? They will no longer have memorial stewardship access to your stories or media.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmContact(null)}
                  disabled={deletingContact}
                  className="px-4 py-2 rounded-xl text-xs font-serif font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteContact}
                  disabled={deletingContact}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-serif font-bold transition-all shadow-sm shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                >
                  {deletingContact && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Remove Contact</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
