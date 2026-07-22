/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Search, Plus, Edit2, Trash2, 
  ChevronLeft, ChevronRight, X, AlertTriangle, 
  Check, Loader2, RefreshCw
} from 'lucide-react';
import { adminDbApi } from '@/src/services/api';

// Definition of a table field
interface TableField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'uuid';
  required: boolean;
  placeholder?: string;
}

// Definition of a table schema
interface TableDefinition {
  id: string;
  name: string;
  endpoint: string;
  primaryKey: string;
  searchField: string; // The field to search in the frontend filter
  fields: TableField[];
}

// All 12 tables mapped with their respective columns, endpoints, and data types
const TABLES: TableDefinition[] = [
  {
    id: 'users',
    name: 'Users',
    endpoint: '/users',
    primaryKey: 'user_id',
    searchField: 'username',
    fields: [
      { name: 'username', label: 'Username', type: 'string', required: true, placeholder: 'e.g. johndoe' },
      { name: 'email', label: 'Email', type: 'string', required: true, placeholder: 'e.g. john@example.com' },
      { name: 'is_active', label: 'Active Status', type: 'boolean', required: true }
    ]
  },
  {
    id: 'mbrs',
    name: 'Member Profiles',
    endpoint: '/mbrs',
    primaryKey: 'mbrId',
    searchField: 'mbrLastName',
    fields: [
      { name: 'mbrFirstName', label: 'First Name', type: 'string', required: true },
      { name: 'mbrLastName', label: 'Last Name', type: 'string', required: true },
      { name: 'mbrMiddleName', label: 'Middle Name', type: 'string', required: false },
      { name: 'mbrBirthDate', label: 'Birth Date', type: 'date', required: false },
      { name: 'mbrDeathDate', label: 'Death Date', type: 'date', required: false },
      { name: 'mbrGenderCd', label: 'Gender Code', type: 'string', required: false },
      { name: 'mbrBiography', label: 'Biography', type: 'string', required: false },
      { name: 'mbrProfilePic', label: 'Profile Picture URL', type: 'string', required: false },
      { name: 'user_id', label: 'Associated User ID (UUID)', type: 'uuid', required: false }
    ]
  },
  {
    id: 'mbr_families',
    name: 'Member Families',
    endpoint: '/mbr-families',
    primaryKey: 'mbrFamilyId',
    searchField: 'mbrFamilyLastNm',
    fields: [
      { name: 'mbrId', label: 'Member ID (UUID)', type: 'uuid', required: true },
      { name: 'mbrFamilyRelationshipCd', label: 'Relationship Code', type: 'string', required: true },
      { name: 'mbrFamilyFirstNm', label: 'First Name', type: 'string', required: true },
      { name: 'mbrFamilyMiddleNm', label: 'Middle Name', type: 'string', required: false },
      { name: 'mbrFamilyLastNm', label: 'Last Name', type: 'string', required: true }
    ]
  },
  {
    id: 'cds',
    name: 'Lookup Codes',
    endpoint: '/cds',
    primaryKey: 'cdId',
    searchField: 'cdTag',
    fields: [
      { name: 'cdTag', label: 'Code Tag', type: 'string', required: true, placeholder: 'e.g. RELATIONSHIP' },
      { name: 'cdValue', label: 'Code Value', type: 'string', required: true, placeholder: 'e.g. SPOUSE' },
      { name: 'cdSortOrder', label: 'Sort Order', type: 'number', required: false },
      { name: 'cdDesc', label: 'Description', type: 'string', required: false }
    ]
  },
  {
    id: 'mbr_residences',
    name: 'Member Residences',
    endpoint: '/mbr-residences',
    primaryKey: 'mbrResidenceId',
    searchField: 'mbrResidenceCity',
    fields: [
      { name: 'mbrId', label: 'Member ID (UUID)', type: 'uuid', required: true },
      { name: 'mbrResidenceAddress', label: 'Address', type: 'string', required: false },
      { name: 'mbrResidenceCity', label: 'City', type: 'string', required: true },
      { name: 'mbrResidenceState', label: 'State', type: 'string', required: true },
      { name: 'mbrResidenceCountry', label: 'Country', type: 'string', required: true },
      { name: 'mbrResidenceStartDate', label: 'Start Date', type: 'date', required: true },
      { name: 'mbrResidenceEndDate', label: 'End Date', type: 'date', required: false },
      { name: 'mbrResidenceBornInd', label: 'Born In Town', type: 'boolean', required: true },
      { name: 'mbrResidenceCurrentInd', label: 'Current Residence', type: 'boolean', required: true },
      { name: 'mbrResidenceHomeTownInd', label: 'Home Town', type: 'boolean', required: true }
    ]
  },
  {
    id: 'mbr_activities',
    name: 'Member Activities',
    endpoint: '/mbr-activities',
    primaryKey: 'mbrActivityId',
    searchField: 'mbrActivityName',
    fields: [
      { name: 'mbrId', label: 'Member ID (UUID)', type: 'uuid', required: true },
      { name: 'mbrActivityName', label: 'Activity Name', type: 'string', required: true },
      { name: 'mbrActivityDescription', label: 'Description', type: 'string', required: false },
      { name: 'mbrActivityFrequencyCd', label: 'Frequency Code', type: 'string', required: false }
    ]
  },
  {
    id: 'mbr_achievements',
    name: 'Member Achievements',
    endpoint: '/mbr-achievements',
    primaryKey: 'mbrAchievementId',
    searchField: 'mbrAchievementTitle',
    fields: [
      { name: 'mbrId', label: 'Member ID (UUID)', type: 'uuid', required: true },
      { name: 'mbrAchievementTitle', label: 'Title', type: 'string', required: true },
      { name: 'mbrAchievementDescription', label: 'Description', type: 'string', required: false },
      { name: 'mbrAchievementDate', label: 'Achievement Date', type: 'date', required: false }
    ]
  },
  {
    id: 'mbr_educations',
    name: 'Member Educations',
    endpoint: '/mbr-educations',
    primaryKey: 'mbrEducationId',
    searchField: 'mbrEducationInstitutionalNm',
    fields: [
      { name: 'mbrID', label: 'Member ID (UUID)', type: 'uuid', required: true },
      { name: 'mbrEducationInstitutionalNm', label: 'School Name', type: 'string', required: true },
      { name: 'mbrEducationDegreeCd', label: 'Degree Code', type: 'string', required: true },
      { name: 'mbrEducationDesc', label: 'Description/Field of Study', type: 'string', required: false },
      { name: 'mbrEducationStartDate', label: 'Start Date', type: 'date', required: false },
      { name: 'mbrEducationEndDate', label: 'End Date', type: 'date', required: false }
    ]
  },
  {
    id: 'mbr_employments',
    name: 'Member Employments',
    endpoint: '/mbr-employments',
    primaryKey: 'mbrEmploymentId',
    searchField: 'mbrEmploymentCompany',
    fields: [
      { name: 'mbrId', label: 'Member ID (UUID)', type: 'uuid', required: true },
      { name: 'mbrEmployementPosition', label: 'Job Title', type: 'string', required: true },
      { name: 'mbrEmployementPositionResp', label: 'Responsibilities', type: 'string', required: false },
      { name: 'mbrEmploymentCompany', label: 'Company Name', type: 'string', required: true },
      { name: 'mbrEmployementLocation', label: 'Location', type: 'string', required: false },
      { name: 'mbrEmploymentTypeCd', label: 'Employment Type Code', type: 'string', required: false },
      { name: 'mbrEmploymentStartDate', label: 'Start Date', type: 'date', required: false },
      { name: 'mbrEmploymentEndDate', label: 'End Date', type: 'date', required: false },
      { name: 'mbrEmploymentDescription', label: 'Job Description', type: 'string', required: false }
    ]
  },
  {
    id: 'chInsts',
    name: 'Chatbot Instructions',
    endpoint: '/chInsts',
    primaryKey: 'chInstId',
    searchField: 'chInstName',
    fields: [
      { name: 'chInstName', label: 'Instruction Name', type: 'string', required: true },
      { name: 'chInstContent', label: 'Content (System Prompts)', type: 'string', required: true },
      { name: 'chInstActInd', label: 'Active Indicator', type: 'boolean', required: true },
      { name: 'chInstParentId', label: 'Parent ID (UUID)', type: 'uuid', required: false }
    ]
  },
  {
    id: 'chIntents',
    name: 'Chatbot Intents',
    endpoint: '/chIntents',
    primaryKey: 'chIntentId',
    searchField: 'chIntentName',
    fields: [
      { name: 'chIntentName', label: 'Intent Name', type: 'string', required: true },
      { name: 'chIntentDesc', label: 'Description', type: 'string', required: false },
      { name: 'chIntentActInd', label: 'Active Indicator', type: 'boolean', required: true },
      { name: 'chInstId', label: 'Instruction ID (UUID)', type: 'uuid', required: false }
    ]
  },
  {
    id: 'chPrompts',
    name: 'Chatbot Prompts',
    endpoint: '/chPrompts',
    primaryKey: 'chPromptId',
    searchField: 'chPromptName',
    fields: [
      { name: 'chPromptName', label: 'Prompt Name', type: 'string', required: true },
      { name: 'chPromptContent', label: 'Prompt Content', type: 'string', required: false },
      { name: 'chPromptActInd', label: 'Active Indicator', type: 'boolean', required: true },
      { name: 'chPromptVersion', label: 'Version', type: 'number', required: true },
      { name: 'chIntentId', label: 'Intent ID (UUID)', type: 'uuid', required: true }
    ]
  },
  {
    id: 'mbr_stories',
    name: 'Member Stories',
    endpoint: '/mbr-stories',
    primaryKey: 'mbrStoryId',
    searchField: 'mbrStoryTitle',
    fields: [
      { name: 'mbrMbrId', label: 'Member ID (UUID)', type: 'uuid', required: true },
      { name: 'mbrStoryTypeCd', label: 'Story Type Code', type: 'string', required: true },
      { name: 'mbrStoryPublishStatusCd', label: 'Publish Status Code', type: 'string', required: true },
      { name: 'mbrStoryTitle', label: 'Title', type: 'string', required: true },
      { name: 'mbrStoryContent', label: 'Content', type: 'string', required: false },
      { name: 'mbrStoryVersion', label: 'Version', type: 'number', required: true },
      { name: 'mbrStoryStartDate', label: 'Start Date', type: 'date', required: false },
      { name: 'mbrStoryEndDate', label: 'End Date', type: 'date', required: false },
      { name: 'mbrStoryThreadID', label: 'Story Thread ID', type: 'string', required: false },
      { name: 'chIntentId', label: 'Chatbot Intent ID (UUID)', type: 'uuid', required: false }
    ]
  }
];

// Helper to get initial mock data if sessionStorage is empty in sandbox mode
const getInitialMockData = (tableId: string): any[] => {
  const now = new Date().toISOString();
  switch (tableId) {
    case 'users':
      return [
        { user_id: 'e1a3c61d-389f-4318-ba28-7ee82c4fdbd1', username: 'eleanor_author', email: 'eleanor.ross@storybook.ai', is_active: true, created_at: now, updated_at: now },
        { user_id: 'b4a8e32c-39ff-43f1-a1e8-780c85c2901a', username: 'james_narrator', email: 'james@memoirhub.com', is_active: true, created_at: now, updated_at: now },
        { user_id: 'cf650da5-ef31-419b-a083-d9d1326be8ad', username: 'admin_marks', email: 'admin@storybook.ai', is_active: true, created_at: now, updated_at: now }
      ];
    case 'mbrs':
      return [
        { mbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0', user_id: 'e1a3c61d-389f-4318-ba28-7ee82c4fdbd1', mbrFirstName: 'Eleanor', mbrLastName: 'Ross', mbrMiddleName: 'Grace', mbrBirthDate: '1945-05-12', mbrGenderCd: 'Female', mbrBiography: 'Born in Chicago, Eleanor lived through the space age and taught English for 35 years.', mbrProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format', mbrCreatedAt: now, mbrUpdatedAt: now },
        { mbrId: 'f87a329c-982a-4a56-8a03-9bb54fc82341', user_id: 'b4a8e32c-39ff-43f1-a1e8-780c85c2901a', mbrFirstName: 'James', mbrLastName: 'Carter', mbrMiddleName: 'Dean', mbrBirthDate: '1952-11-20', mbrGenderCd: 'Male', mbrBiography: 'Retired mechanical engineer and grandfather of four. Enthusiast of sailing and history.', mbrProfilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format', mbrCreatedAt: now, mbrUpdatedAt: now }
      ];
    case 'cds':
      return [
        { cdId: 'a38fa492-c9a8-428a-923f-42a8b9f848ac', cdTag: 'GENDER', cdValue: 'MALE', cdSortOrder: 10, cdDesc: 'Male Category', cdCreatedAt: now, cdUpdatedAt: now },
        { cdId: 'b78a9c1e-3a8f-410a-bb72-88fb98471c2a', cdTag: 'GENDER', cdValue: 'FEMALE', cdSortOrder: 20, cdDesc: 'Female Category', cdCreatedAt: now, cdUpdatedAt: now },
        { cdId: '9fae87c6-218a-49bd-b87c-a87fb231d90a', cdTag: 'RELATIONSHIP', cdValue: 'SPOUSE', cdSortOrder: 10, cdDesc: 'Husband or Wife', cdCreatedAt: now, cdUpdatedAt: now },
        { cdId: 'd62e10a2-21af-4cbb-9273-55e1c0c1b7a2', cdTag: 'RELATIONSHIP', cdValue: 'CHILD', cdSortOrder: 20, cdDesc: 'Son or Daughter', cdCreatedAt: now, cdUpdatedAt: now }
      ];
    case 'chInsts':
      return [
        { chInstId: '7682e6f1-a9c1-4b11-a67b-12d8a0c24bdf', chInstName: 'Cassie General Base', chInstContent: 'You are Cassie, a helpful and warm co-writer chatbot.', chInstActInd: true, chInstCreatedAt: now, chInstUpdatedAt: now }
      ];
    case 'chIntents':
      return [
        { chIntentId: '98fac10e-a61f-49ff-88ec-a6cbef6542a1', chIntentName: 'Clarify Details', chIntentDesc: 'Ask the storyteller to elaborate on specific details in the scene.', chIntentActInd: true, chInstId: '7682e6f1-a9c1-4b11-a67b-12d8a0c24bdf', chIntentCreatedAt: now, chIntentUpdatedAt: now }
      ];
    case 'chPrompts':
      return [
        { chPromptId: 'd7cf92f1-f8a1-43ee-b4c8-b2a123f9ab7c', chPromptName: 'Elaborate Sensory Prompt', chPromptContent: 'Prompt focusing on sights, smells, and sounds.', chPromptActInd: true, chPromptVersion: 1, chIntentId: '98fac10e-a61f-49ff-88ec-a6cbef6542a1', chPromptCreatedAt: now, chPromptUpdatedAt: now }
      ];
    case 'mbr_stories':
      return [
        {
          mbrStoryId: 'st_fam_1',
          mbrMbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
          mbrStoryTypeCd: 'sbMbrStryFamly',
          mbrStoryPublishStatusCd: 'Draft',
          mbrStoryTitle: 'Sunday Mornings at Harold’s Dock',
          mbrStoryContent: 'Every Sunday after morning services, the family would gather near the harbor. Harold would untie the wooden skiff and take us out past the breakwater to watch the fog roll off the headlands.',
          mbrStoryVersion: 1,
          mbrStoryStartDate: '1965-06-12',
          mbrStoryCreatedAt: now,
          mbrStoryUpdatedAt: now
        }
      ];
    default:
      return [];
  }
};

interface DbAdminFeatureProps {
  isSandbox: boolean;
}

export default function DbAdminFeature({ isSandbox }: DbAdminFeatureProps) {
  // Current active table
  const [selectedTable, setSelectedTable] = useState<TableDefinition>(TABLES[0]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Dialog State (Adding or Editing a Row)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null); // null means adding a new row
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Confirm delete dialog state
  const [deletingRow, setDeletingRow] = useState<any | null>(null);

  // Load table data when selected table changes or connection status changes
  useEffect(() => {
    loadData();
    setSearchQuery('');
    setCurrentPage(1);
  }, [selectedTable, isSandbox]);

  // Temporary message dismiss timer
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSandbox) {
        // Read from sessionStorage
        const storageKey = `db_table_${selectedTable.id}`;
        const stored = sessionStorage.getItem(storageKey);
        if (stored) {
          setTableData(JSON.parse(stored));
        } else {
          const initial = getInitialMockData(selectedTable.id);
          sessionStorage.setItem(storageKey, JSON.stringify(initial));
          setTableData(initial);
        }
      } else {
        // Load from server API using the endpoint
        const data = await adminDbApi.getTableData(selectedTable.endpoint);
        setTableData(data);
      }
    } catch (err: any) {
      setError(`Failed to load data for ${selectedTable.name}: ${err.message}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered rows
  const filteredData = tableData.filter((row) => {
    if (!searchQuery.trim()) return true;
    const valueToSearch = row[selectedTable.searchField];
    if (valueToSearch === undefined || valueToSearch === null) return false;
    return String(valueToSearch).toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Opens dialog for creating a new row
  const handleAddClick = () => {
    const initialForm: Record<string, any> = {};
    selectedTable.fields.forEach((field) => {
      // Set defaults
      if (field.type === 'boolean') {
        initialForm[field.name] = false;
      } else if (field.type === 'number') {
        initialForm[field.name] = 0;
      } else {
        initialForm[field.name] = '';
      }
    });
    // For user creation, add password field since it is required in UserCreate
    if (selectedTable.id === 'users') {
      initialForm['password'] = '';
    }
    setFormData(initialForm);
    setEditingRow(null);
    setIsFormOpen(true);
  };

  // Opens dialog for editing an existing row
  const handleEditClick = (row: any) => {
    const editForm: Record<string, any> = {};
    selectedTable.fields.forEach((field) => {
      // Clean dates for inputs
      if (field.type === 'date' && row[field.name]) {
        editForm[field.name] = String(row[field.name]).split('T')[0];
      } else {
        editForm[field.name] = row[field.name] ?? '';
      }
    });
    setFormData(editForm);
    setEditingRow(row);
    setIsFormOpen(true);
  };

  // Deletion logic
  const handleDeleteConfirm = async () => {
    if (!deletingRow) return;
    setError(null);
    setLoading(true);
    const rowId = deletingRow[selectedTable.primaryKey];

    try {
      if (isSandbox) {
        const storageKey = `db_table_${selectedTable.id}`;
        const updated = tableData.filter((r) => r[selectedTable.primaryKey] !== rowId);
        sessionStorage.setItem(storageKey, JSON.stringify(updated));
        setTableData(updated);
        setSuccessMsg(`Successfully deleted record from ${selectedTable.name} (Sandbox mode)`);
      } else {
        await adminDbApi.deleteRecord(selectedTable.endpoint, rowId);
        setSuccessMsg(`Successfully deleted record from ${selectedTable.name}`);
        loadData();
      }
    } catch (err: any) {
      setError(`Failed to delete record: ${err.message}`);
    } finally {
      setLoading(false);
      setDeletingRow(null);
    }
  };

  // Handle Form Submission (Add or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Format fields correctly
    const payload: Record<string, any> = {};
    for (const field of selectedTable.fields) {
      let val = formData[field.name];

      // Type checks
      if (field.type === 'number' && val !== '') {
        payload[field.name] = Number(val);
      } else if (field.type === 'boolean') {
        payload[field.name] = Boolean(val);
      } else if (val === '' || val === undefined) {
        payload[field.name] = null;
      } else {
        payload[field.name] = val;
      }
    }

    // Special users override (allow password only on creation)
    if (selectedTable.id === 'users' && !editingRow) {
      payload['password'] = formData['password'] || 'DefaultP@ss123';
    }

    try {
      if (isSandbox) {
        const storageKey = `db_table_${selectedTable.id}`;
        const now = new Date().toISOString();
        if (editingRow) {
          // Update
          const rowId = editingRow[selectedTable.primaryKey];
          const updated = tableData.map((r) => {
            if (r[selectedTable.primaryKey] === rowId) {
              return { ...r, ...payload, updated_at: now, mbrUpdatedAt: now };
            }
            return r;
          });
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
          setTableData(updated);
          setSuccessMsg(`Successfully updated record in ${selectedTable.name} (Sandbox)`);
        } else {
          // Create
          const randomId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
          const newRecord = {
            [selectedTable.primaryKey]: randomId,
            ...payload,
            created_at: now,
            updated_at: now,
            mbrCreatedAt: now,
            mbrUpdatedAt: now
          };
          const updated = [newRecord, ...tableData];
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
          setTableData(updated);
          setSuccessMsg(`Successfully created new record in ${selectedTable.name} (Sandbox)`);
        }
        setIsFormOpen(false);
      } else {
        if (editingRow) {
          // Update via API
          const rowId = editingRow[selectedTable.primaryKey];
          await adminDbApi.updateRecord(selectedTable.endpoint, rowId, payload);
          setSuccessMsg(`Successfully updated record in ${selectedTable.name}`);
        } else {
          // Create via API
          await adminDbApi.createRecord(selectedTable.endpoint, payload);
          setSuccessMsg(`Successfully created record in ${selectedTable.name}`);
        }
        setIsFormOpen(false);
        loadData();
      }
    } catch (err: any) {
      setError(`Operation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER BAR */}
      <div className="bg-[#122347] text-white border border-slate-900 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle glass effect accent */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-white/10 text-blue-300 rounded-2xl border border-white/5 shadow-inner">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-black tracking-tight">Database Administration Center</h1>
            <p className="text-xs text-slate-300 mt-1">
              Select any of the 13 system tables to manage user accounts, storyteller profiles, chatbot states, and member stories.
            </p>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Connection Context
            </div>
            <div className={`text-xs font-semibold ${isSandbox ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isSandbox ? 'Sandbox Simulation' : 'Live GCP Cloud SQL'}
            </div>
          </div>
        </div>
      </div>

      {/* ERROR / SUCCESS TOASTS */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-700 rounded-2xl text-xs font-medium"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-grow">{error}</span>
            <button onClick={() => setError(null)} className="hover:text-rose-955 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-2xl text-xs font-medium"
          >
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="flex-grow">{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="hover:text-emerald-955 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & ACTIONS BAR */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Table Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-serif font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Table:
          </label>
          <select
            value={selectedTable.id}
            onChange={(e) => {
              const tbl = TABLES.find((t) => t.id === e.target.value);
              if (tbl) setSelectedTable(tbl);
            }}
            className="bg-white border border-[#EFECE7] text-slate-800 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm select-none"
          >
            {TABLES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Input & Add Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={`Search by ${selectedTable.searchField}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-[#EFECE7] text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <button
            onClick={handleAddClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="bg-white border border-[#EFECE7] rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {loading && tableData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Fetching table data...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Database className="w-12 h-12 text-slate-200 mb-2" />
            <span className="text-sm font-bold text-slate-600">No records found</span>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              There are no rows in {selectedTable.name} matching your active criteria. Try creating a new record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[#EFECE7] text-slate-600 font-bold uppercase tracking-wider font-mono">
                  <th className="px-5 py-3.5 select-all">Primary ID</th>
                  {selectedTable.fields.map((field) => (
                    <th key={field.name} className="px-5 py-3.5 select-none">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right select-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F3EF] text-slate-700">
                {paginatedData.map((row, idx) => {
                  const rowId = row[selectedTable.primaryKey];
                  return (
                    <tr key={rowId || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-[10px] text-slate-450 select-all truncate max-w-40" title={rowId}>
                        {rowId}
                      </td>
                      {selectedTable.fields.map((field) => {
                        let cellVal = row[field.name];
                        return (
                          <td key={field.name} className="px-5 py-4 max-w-xs truncate">
                            {field.type === 'boolean' ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cellVal ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {cellVal ? 'True' : 'False'}
                              </span>
                            ) : field.type === 'date' ? (
                              cellVal ? String(cellVal).split('T')[0] : <span className="text-slate-300">-</span>
                            ) : cellVal !== null && cellVal !== undefined ? (
                              String(cellVal)
                            ) : (
                              <span className="text-slate-305 italic text-slate-300">null</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleEditClick(row)}
                            title="Edit Record"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg cursor-pointer transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRow(row)}
                            title="Delete Record"
                            className="p-1.5 text-slate-505 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {filteredData.length > 0 && (
          <div className="bg-slate-50/50 border-t border-[#EFECE7] px-6 py-4 flex items-center justify-between text-xs text-slate-550 select-none">
            <div>
              Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-800">
                {Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{filteredData.length}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 border border-[#EFECE7] bg-white rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 border border-[#EFECE7] bg-white rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT FORM MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            {/* Modal backdrop closer */}
            <div className="absolute inset-0 cursor-default" onClick={() => setIsFormOpen(false)}></div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-lg w-full z-10 overflow-hidden flex flex-col relative"
            >
              <div className="bg-[#122347] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-300" />
                  <span className="font-serif font-bold text-sm">
                    {editingRow ? 'Edit Record' : 'Add New Record'} — {selectedTable.name}
                  </span>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {selectedTable.fields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                      {field.label}
                      {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'boolean' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`form-check-${field.name}`}
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor={`form-check-${field.name}`} className="ml-2 text-xs font-medium text-slate-600 cursor-pointer">
                          Enabled / Active
                        </label>
                      </div>
                    ) : field.type === 'date' ? (
                      <input
                        type="date"
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="bg-white border border-[#EFECE7] text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 w-full"
                      />
                    ) : selectedTable.id === 'chInsts' && field.name === 'chInstContent' ? (
                      <textarea
                        required={field.required}
                        rows={6}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="bg-white border border-[#EFECE7] text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 w-full resize-none font-mono"
                      />
                    ) : (
                      <input
                        type="text"
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="bg-white border border-[#EFECE7] text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 w-full"
                      />
                    )}
                  </div>
                ))}

                {/* For User Creation, require password input */}
                {selectedTable.id === 'users' && !editingRow && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SecretPassword123"
                      value={formData['password'] || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-white border border-[#EFECE7] text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-[#EFECE7] flex items-center justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-[#EFECE7] bg-white text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer transition-colors shadow-md shadow-blue-500/10 flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Record</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <AnimatePresence>
        {deletingRow && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setDeletingRow(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-sm w-full z-10 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-serif font-black text-slate-800">Confirm Record Deletion</h3>
              </div>

              <p className="text-xs text-slate-505 leading-relaxed">
                Are you absolutely sure you want to delete this record from the{' '}
                <span className="font-semibold text-slate-800">{selectedTable.name}</span> table? This action cannot
                be undone.
              </p>

              <div className="bg-slate-55 p-3 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-500 truncate select-all">
                ID: {deletingRow[selectedTable.primaryKey]}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 select-none">
                <button
                  onClick={() => setDeletingRow(null)}
                  className="px-4 py-2 border border-[#EFECE7] bg-white text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 cursor-pointer transition-colors shadow-md shadow-rose-500/10 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Permanently</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
