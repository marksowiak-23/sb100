/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TableField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface TableDefinition {
  id: string;
  name: string;
  endpoint: string;
  primaryKey: string;
  searchField: string;
  fields: TableField[];
}

interface GenerateAdminDbPdfOptions {
  table: TableDefinition;
  data: any[];
  searchQuery?: string;
  isSandbox?: boolean;
}

// Table friendly title and description mapping
const TABLE_TITLE_MAP: Record<string, string> = {
  cd: 'System Reference Codes & Enums (cd)',
  chInst: 'AI System Instructions Configuration (chInst)',
  chIntent: 'AI Conversation Intents (chIntent)',
  chPrompt: 'AI Prompt Templates & Versions (chPrompt)',
  chWriter: 'AI Writing Personas & Styles (chWriter)',
  event: 'System Audit & Activity Events (event)',
  groupCustom: 'Member Custom Relationship Groups (groupCustom)',
  groupGlobal: 'System Global Circles & Groups (groupGlobal)',
  mbr: 'Registered Members Directory (mbr)',
  mbrTopicAchievements: 'Member Achievements & Honors (mbrTopicAchievements)',
  mbrTopicActivity: 'Member Hobbies & Activities (mbrTopicActivity)',
  mbrConnection: 'Member Direct Connections (mbrConnection)',
  mbrContact: 'Member Contact Messages & Inquiries (mbrContact)',
  mbrConnectionGrp: 'Member Group Connection Mappings (mbrConnectionGrp)',
  mbrTopicCustom: 'Member Custom Story Topics (mbrTopicCustom)',
  mbrTopicEducation: 'Member Education & Alma Maters (mbrTopicEducation)',
  mbrTopicEmployment: 'Member Career & Employment History (mbrTopicEmployment)',
  mbrTopicFamily: 'Member Family & Kinship Directory (mbrTopicFamily)',
  mbrMedia: 'Member Media & Photo Assets (mbrMedia)',
  mbrPreferences: 'Member Application Preferences (mbrPreferences)',
  mbrSettings: 'Member Profile & Privacy Settings (mbrSettings)',
  mbrTopicResidence: 'Member Residences & Hometowns (mbrTopicResidence)',
  mbrStat: 'Member Platform Metrics & Counts (mbrStat)',
  mbrStory: 'Member Stories & Memoir Archives (mbrStory)',
  mbrStoryActivity: 'Story Interaction Logs (mbrStoryActivity)',
  mbrStoryStat: 'Story Engagement & Metrics (mbrStoryStat)',
  mbrAiUsageLog: 'AI Model Token & Cost Audit Logs (mbrAiUsageLog)',
  mbrPersonalTrivia: 'Personal Trivia & Memory Snippets (mbrPersonalTrivia)',
  mbrTopicGroupPrivs: 'Topic Group Access Privileges (mbrTopicGroupPrivs)',
  sysConfig: 'System Global Configurations (sysConfig)',
  topic: 'Standard Story Topics Directory (topic)',
  user: 'User Authentication & Accounts (user)'
};

const formatShortDate = (dateVal?: any): string => {
  if (!dateVal) return '-';
  try {
    const s = String(dateVal);
    if (s.includes('T')) return s.split('T')[0];
    return s.slice(0, 10);
  } catch {
    return String(dateVal);
  }
};

const formatBoolean = (val: any): string => {
  if (val === true || val === 1 || val === '1' || val === 'true') return 'TRUE';
  if (val === false || val === 0 || val === '0' || val === 'false') return 'FALSE';
  return '-';
};

export function generateAdminDbPdf({
  table,
  data,
  searchQuery = '',
  isSandbox = false
}: GenerateAdminDbPdfOptions): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const reportTitle = TABLE_TITLE_MAP[table.id] || `Database Table Report: ${table.name}`;

  // --- BRAND HEADER ---
  doc.setFillColor(15, 27, 53); // Deep Navy (#0F1B35)
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Accent Line
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.rect(0, 58, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('story', 36, 38);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(96, 165, 250); // Blue-400
  doc.text('book', 76, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(226, 232, 240); // Slate-200
  doc.text(`|  ${reportTitle}`, 122, 38);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(`Generated: ${timestamp}`, pageWidth - 36, 38, { align: 'right' });

  // --- OVERVIEW SUB-HEADER ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(36, 68, pageWidth - 72, 32, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, 68, pageWidth - 72, 32, 6, 6, 'S');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Col 1: Table & Endpoint
  doc.setFont('helvetica', 'bold');
  doc.text('Table: ', 48, 87);
  doc.setFont('helvetica', 'normal');
  doc.text(`${table.name} (${table.endpoint})`, 82, 87);

  // Col 2: Records
  doc.setFont('helvetica', 'bold');
  doc.text('Records: ', 260, 87);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.length} row${data.length === 1 ? '' : 's'}`, 308, 87);

  // Col 3: Filter (if active)
  if (searchQuery.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.text('Filter: ', 390, 87);
    doc.setFont('helvetica', 'normal');
    doc.text(`"${searchQuery}" (${table.searchField})`, 425, 87);
  }

  // Col 4: Connection
  doc.setFont('helvetica', 'bold');
  doc.text('Connection: ', pageWidth - 210, 87);
  doc.setFont('helvetica', 'normal');
  if (isSandbox) {
    doc.setTextColor(217, 119, 6); // Amber-600
    doc.text('Sandbox Simulation', pageWidth - 145, 87);
  } else {
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text('Live GCP Cloud SQL', pageWidth - 145, 87);
  }

  // --- TABLE SPECIFIC CONFIGURATIONS ---
  let headers: string[] = [];
  let tableRows: string[][] = [];
  let columnStyles: Record<number, any> = {};
  let baseFontSize = 8;
  let cellPadding = 5;

  if (table.id === 'user') {
    headers = ['User ID (UUID)', 'Email Address', 'Status', 'Password Hash', 'Created At'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 170 },
      1: { fontStyle: 'bold', cellWidth: 180 },
      2: { halign: 'center', cellWidth: 65 },
      3: { font: 'courier', cellWidth: 180 },
      4: { halign: 'center', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.user_id || '-'),
      String(row.email || '-'),
      formatBoolean(row.is_active),
      row.password_hash ? String(row.password_hash).slice(0, 24) + '...' : '-',
      formatShortDate(row.created_at)
    ]);
  } else if (table.id === 'mbr') {
    headers = ['Member ID', 'Full Name', 'Birth Date', 'Gender', 'Location (Lives / From)', 'Work / Study', 'Email', 'Introduction'];
    baseFontSize = 7.5;
    columnStyles = {
      0: { font: 'courier', cellWidth: 100 },
      1: { fontStyle: 'bold', cellWidth: 110 },
      2: { halign: 'center', cellWidth: 65 },
      3: { halign: 'center', cellWidth: 45 },
      4: { cellWidth: 95 },
      5: { cellWidth: 95 },
      6: { cellWidth: 110 },
      7: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => {
      const name = [row.mbrFirstName, row.mbrMiddleName, row.mbrLastName].filter(Boolean).join(' ') || '-';
      const loc = [row.mbrLivesCityState, row.mbrFromCityState ? `(from ${row.mbrFromCityState})` : ''].filter(Boolean).join(' ');
      const workStudy = [row.mbrWorkAt, row.mbrStudiedAt].filter(Boolean).join(' / ') || '-';
      return [
        String(row.mbrId || '-'),
        name,
        formatShortDate(row.mbrBirthDate),
        String(row.mbrGenderCd || '-'),
        loc || '-',
        workStudy,
        String(row.mbrEmailAddress || '-'),
        String(row.mbrIntroduction || '-')
      ];
    });
  } else if (table.id === 'mbrStory') {
    headers = ['Story ID', 'Member ID', 'Topic / Type', 'Status', 'Ver', 'Title', 'Date Range', 'Story Content Preview'];
    baseFontSize = 7.5;
    columnStyles = {
      0: { font: 'courier', cellWidth: 95 },
      1: { font: 'courier', cellWidth: 95 },
      2: { cellWidth: 85 },
      3: { halign: 'center', cellWidth: 60 },
      4: { halign: 'center', cellWidth: 30 },
      5: { fontStyle: 'bold', cellWidth: 110 },
      6: { halign: 'center', cellWidth: 70 },
      7: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrStoryId || '-'),
      String(row.mbrMbrId || '-'),
      `${row.mbrStoryTopicName || '-'} (${row.mbrStoryTypeCd || '-'})`,
      String(row.mbrStoryPublishStatusCd || 'DRAFT').toUpperCase(),
      String(row.mbrStoryVersion ?? '1'),
      String(row.mbrStoryTitle || '-'),
      [formatShortDate(row.mbrStoryStartDate), formatShortDate(row.mbrStoryEndDate)].filter((d) => d !== '-').join(' to ') || '-',
      String(row.mbrStoryContent || '-')
    ]);
  } else if (table.id === 'mbrTopicFamily') {
    headers = ['Family ID', 'Member ID', 'Relationship', 'First Name', 'Middle Name', 'Last Name', 'Birth Date'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 120 },
      1: { font: 'courier', cellWidth: 120 },
      2: { fontStyle: 'bold', halign: 'left', cellWidth: 110 },
      3: { cellWidth: 100 },
      4: { cellWidth: 80 },
      5: { fontStyle: 'bold', cellWidth: 100 },
      6: { halign: 'center', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrFamilyId || '-'),
      String(row.mbrId || '-'),
      String(row.mbrFamilyRelationshipCd || '-'),
      String(row.mbrFamilyFirstNm || '-'),
      String(row.mbrFamilyMiddleNm || '-'),
      String(row.mbrFamilyLastNm || '-'),
      formatShortDate(row.mbrFamilyBirthDt)
    ]);
  } else if (table.id === 'mbrTopicResidence') {
    headers = ['Residence ID', 'Member ID', 'City', 'State', 'Country', 'Start Date', 'End Date', 'Current', 'Home Town', 'Born'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 110 },
      1: { font: 'courier', cellWidth: 110 },
      2: { fontStyle: 'bold', cellWidth: 100 },
      3: { cellWidth: 70 },
      4: { cellWidth: 70 },
      5: { halign: 'center', cellWidth: 65 },
      6: { halign: 'center', cellWidth: 65 },
      7: { halign: 'center', cellWidth: 45 },
      8: { halign: 'center', cellWidth: 50 },
      9: { halign: 'center', cellWidth: 40 }
    };
    tableRows = data.map((row) => [
      String(row.mbrResidenceId || '-'),
      String(row.mbrId || '-'),
      String(row.mbrResidenceCity || '-'),
      String(row.mbrResidenceState || '-'),
      String(row.mbrResidenceCountry || '-'),
      formatShortDate(row.mbrResidenceStartDate),
      formatShortDate(row.mbrResidenceEndDate),
      formatBoolean(row.mbrResidenceCurrentInd),
      formatBoolean(row.mbrResidenceHomeTownInd),
      formatBoolean(row.mbrResidenceBornInd)
    ]);
  } else if (table.id === 'mbrTopicEducation') {
    headers = ['Education ID', 'Member ID', 'Institution Name', 'Degree / Credential', 'Start Date', 'End Date', 'Field / Description'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 110 },
      1: { font: 'courier', cellWidth: 110 },
      2: { fontStyle: 'bold', cellWidth: 140 },
      3: { cellWidth: 90 },
      4: { halign: 'center', cellWidth: 65 },
      5: { halign: 'center', cellWidth: 65 },
      6: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrEducationId || '-'),
      String(row.mbrID || row.mbrId || '-'),
      String(row.mbrEducationInstitutionalNm || '-'),
      String(row.mbrEducationDegreeCd || '-'),
      formatShortDate(row.mbrEducationStartDate),
      formatShortDate(row.mbrEducationEndDate),
      String(row.mbrEducationDesc || '-')
    ]);
  } else if (table.id === 'mbrTopicEmployment') {
    headers = ['Employment ID', 'Member ID', 'Company', 'Position / Job Title', 'Location', 'Type', 'Start Date', 'End Date', 'Description'];
    baseFontSize = 7.5;
    columnStyles = {
      0: { font: 'courier', cellWidth: 95 },
      1: { font: 'courier', cellWidth: 95 },
      2: { fontStyle: 'bold', cellWidth: 110 },
      3: { cellWidth: 100 },
      4: { cellWidth: 70 },
      5: { cellWidth: 50 },
      6: { halign: 'center', cellWidth: 55 },
      7: { halign: 'center', cellWidth: 55 },
      8: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrEmploymentId || '-'),
      String(row.mbrId || '-'),
      String(row.mbrEmploymentCompany || '-'),
      String(row.mbrEmployementPosition || '-'),
      String(row.mbrEmployementLocation || '-'),
      String(row.mbrEmploymentTypeCd || '-'),
      formatShortDate(row.mbrEmploymentStartDate),
      formatShortDate(row.mbrEmploymentEndDate),
      String(row.mbrEmploymentDescription || row.mbrEmployementPositionResp || '-')
    ]);
  } else if (table.id === 'mbrTopicActivity') {
    headers = ['Activity ID', 'Member ID', 'Activity Name', 'Frequency', 'Activity Description'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 120 },
      1: { font: 'courier', cellWidth: 120 },
      2: { fontStyle: 'bold', cellWidth: 140 },
      3: { halign: 'center', cellWidth: 80 },
      4: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrActivityId || '-'),
      String(row.mbrId || '-'),
      String(row.mbrActivityName || '-'),
      String(row.mbrActivityFrequencyCd || '-'),
      String(row.mbrActivityDescription || '-')
    ]);
  } else if (table.id === 'mbrTopicAchievements') {
    headers = ['Achievement ID', 'Member ID', 'Achievement Title', 'Date', 'Description / Honors'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 120 },
      1: { font: 'courier', cellWidth: 120 },
      2: { fontStyle: 'bold', cellWidth: 150 },
      3: { halign: 'center', cellWidth: 70 },
      4: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrAchievementId || '-'),
      String(row.mbrId || '-'),
      String(row.mbrAchievementTitle || '-'),
      formatShortDate(row.mbrAchievementDate),
      String(row.mbrAchievementDescription || '-')
    ]);
  } else if (table.id === 'mbrTopicCustom') {
    headers = ['Custom Topic ID', 'Member ID', 'Custom Topic Name', 'Description & Theme Details'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 125 },
      1: { font: 'courier', cellWidth: 125 },
      2: { fontStyle: 'bold', cellWidth: 150 },
      3: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrCustomTopicId || '-'),
      String(row.mbrId || '-'),
      String(row.mbrCustomTopicName || '-'),
      String(row.mbrCustomTopicDesc || '-')
    ]);
  } else if (table.id === 'mbrMedia') {
    headers = ['Media ID', 'Member ID', 'Subordinate ID', 'Category', 'MIME Type', 'Cloud Media Path / URL', 'Caption / Description'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 95 },
      1: { font: 'courier', cellWidth: 95 },
      2: { font: 'courier', cellWidth: 95 },
      3: { fontStyle: 'bold', cellWidth: 70 },
      4: { cellWidth: 65 },
      5: { cellWidth: 150, font: 'courier' },
      6: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.mbrMediaId || '-'),
      String(row.mbrId || '-'),
      String(row.mbrMediaSubordinateId || '-'),
      String(row.mbrMediaCategoryCd || '-'),
      String(row.mbrMediaMimeType || '-'),
      String(row.mbrMediaPath || '-'),
      String(row.mbrMediaDescription || row.mbrMediaOriginalFilename || '-')
    ]);
  } else if (table.id === 'mbrSettings') {
    headers = ['Settings ID', 'Member ID', 'Public', 'Birth Yr', 'Gender', 'Relation', 'Town', 'Works', 'Studies', 'Intro', 'Gallery'];
    baseFontSize = 7.5;
    columnStyles = {
      0: { font: 'courier', cellWidth: 110 },
      1: { font: 'courier', cellWidth: 110 },
      2: { halign: 'center', cellWidth: 45 },
      3: { halign: 'center', cellWidth: 45 },
      4: { halign: 'center', cellWidth: 45 },
      5: { halign: 'center', cellWidth: 45 },
      6: { halign: 'center', cellWidth: 45 },
      7: { halign: 'center', cellWidth: 45 },
      8: { halign: 'center', cellWidth: 45 },
      9: { halign: 'center', cellWidth: 45 },
      10: { halign: 'center', cellWidth: 45 }
    };
    tableRows = data.map((row) => [
      String(row.mbrSettingsId || '-'),
      String(row.mbrId || '-'),
      formatBoolean(row.mbrSettingsAllowPublicFlag),
      formatBoolean(row.mbrSettingsShowBirthYr),
      formatBoolean(row.mbrSettingsShowGender),
      formatBoolean(row.mbrSettingsShowRelationship),
      formatBoolean(row.mbrSettingsShowTown),
      formatBoolean(row.mbrSettingsShowWorksAt),
      formatBoolean(row.mbrSettingsShowStudiedAt),
      formatBoolean(row.mbrSettingsShowIntroduction),
      formatBoolean(row.mbrSettingsShowPhotoGallery)
    ]);
  } else if (table.id === 'mbrPreferences') {
    headers = ['Preference ID', 'Member ID', 'Writer Persona ID', 'Theme', 'Notifications', 'Auto-Save', 'Custom Preferences (JSON)'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 110 },
      1: { font: 'courier', cellWidth: 110 },
      2: { font: 'courier', cellWidth: 110 },
      3: { cellWidth: 70 },
      4: { halign: 'center', cellWidth: 65 },
      5: { halign: 'center', cellWidth: 60 },
      6: { cellWidth: 'auto', font: 'courier' }
    };
    tableRows = data.map((row) => [
      String(row.mbrPrefId || '-'),
      String(row.mbrId || '-'),
      String(row.chWriterId || '-'),
      String(row.mbrPrefTheme || 'System'),
      formatBoolean(row.mbrPrefNotificationsInd),
      formatBoolean(row.mbrPrefAutoSaveInd),
      String(row.mbrPrefJson || '-')
    ]);
  } else if (table.id === 'mbrAiUsageLog') {
    headers = ['Log ID', 'Member ID', 'Session ID', 'Date', 'Model', 'Reqs', 'Prompt Tkns', 'Compl Tkns', 'Cost ($)', 'Latency'];
    baseFontSize = 7.5;
    columnStyles = {
      0: { font: 'courier', cellWidth: 90 },
      1: { font: 'courier', cellWidth: 90 },
      2: { font: 'courier', cellWidth: 90 },
      3: { halign: 'center', cellWidth: 60 },
      4: { cellWidth: 90 },
      5: { halign: 'right', cellWidth: 35 },
      6: { halign: 'right', cellWidth: 55 },
      7: { halign: 'right', cellWidth: 55 },
      8: { halign: 'right', cellWidth: 55 },
      9: { halign: 'right', cellWidth: 50 }
    };
    tableRows = data.map((row) => [
      String(row.mbrAiUsageLogId || '-'),
      String(row.mbrId || '-'),
      String(row.sessionId || '-'),
      formatShortDate(row.sessionDate),
      String(row.lastModelName || 'gemini-2.5-flash'),
      String(row.requestCount ?? '1'),
      String(row.promptTokens ?? '0'),
      String(row.completionTokens ?? '0'),
      `$${Number(row.estimatedCostUsd || 0).toFixed(4)}`,
      `${row.totalLatencyMs || row.lastLatencyMs || 0}ms`
    ]);
  } else if (table.id === 'cd') {
    headers = ['Code ID', 'Tag / Group', 'Value', 'Label', 'Sort Order', 'Description'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 100 },
      1: { fontStyle: 'bold', cellWidth: 120 },
      2: { fontStyle: 'bold', cellWidth: 100, font: 'courier' },
      3: { cellWidth: 110 },
      4: { halign: 'center', cellWidth: 60 },
      5: { cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.cdId || '-'),
      String(row.cdTag || '-'),
      String(row.cdValue || '-'),
      String(row.cdLabel || '-'),
      String(row.cdSortOrder ?? '-'),
      String(row.cdDesc || '-')
    ]);
  } else if (table.id === 'event') {
    headers = ['Event ID', 'Site', 'Actor ID', 'Actor Type', 'Event Code', 'Event Detail', 'Tag Value (JSON)'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 100 },
      1: { halign: 'center', cellWidth: 40 },
      2: { font: 'courier', cellWidth: 100 },
      3: { halign: 'center', cellWidth: 65 },
      4: { fontStyle: 'bold', cellWidth: 100 },
      5: { cellWidth: 130 },
      6: { cellWidth: 'auto', font: 'courier' }
    };
    tableRows = data.map((row) => [
      String(row.eventId || '-'),
      String(row.eventSiteCd || 'SB'),
      String(row.eventActorId || '-'),
      String(row.eventActorTypeCd || '-'),
      String(row.eventCd || '-'),
      String(row.eventDetail || '-'),
      String(row.eventTagValue || '-')
    ]);
  } else if (table.id === 'sysConfig') {
    headers = ['Config ID', 'Config Tag / Key', 'Type', 'Group', 'Value', 'Description', 'Updated By'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 90 },
      1: { fontStyle: 'bold', cellWidth: 140, font: 'courier' },
      2: { halign: 'center', cellWidth: 60 },
      3: { cellWidth: 70 },
      4: { font: 'courier', cellWidth: 110 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 75 }
    };
    tableRows = data.map((row) => [
      String(row.configId || '-'),
      String(row.configTag || '-'),
      String(row.configType || '-'),
      String(row.configGroup || '-'),
      String(row.configValue || '-'),
      String(row.configDesc || '-'),
      String(row.configUpdatedBy || '-')
    ]);
  } else if (table.id === 'chInst') {
    headers = ['Instruction Name', 'Active', 'Parent ID', 'System Content / Instructions'];
    columnStyles = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 140 },
      1: { halign: 'center', cellWidth: 55 },
      2: { halign: 'left', cellWidth: 110, font: 'courier' },
      3: { halign: 'left', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.chInstName || '-'),
      formatBoolean(row.chInstActInd),
      String(row.chInstParentId || '(None)'),
      String(row.chInstContent || '-')
    ]);
  } else if (table.id === 'chIntent') {
    headers = ['Intent Name', 'Active', 'Instruction ID (UUID)', 'Intent Description'];
    columnStyles = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 150 },
      1: { halign: 'center', cellWidth: 55 },
      2: { halign: 'left', cellWidth: 160, font: 'courier' },
      3: { halign: 'left', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.chIntentName || '-'),
      formatBoolean(row.chIntentActInd),
      String(row.chInstId || '-'),
      String(row.chIntentDesc || '-')
    ]);
  } else if (table.id === 'chPrompt') {
    headers = ['Prompt Name', 'Ver', 'Active', 'Intent ID (UUID)', 'Prompt Template Content'];
    columnStyles = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 140 },
      1: { halign: 'center', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 55 },
      3: { halign: 'left', cellWidth: 140, font: 'courier' },
      4: { halign: 'left', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.chPromptName || '-'),
      String(row.chPromptVersion ?? '1'),
      formatBoolean(row.chPromptActInd),
      String(row.chIntentId || '-'),
      String(row.chPromptContent || '-')
    ]);
  } else if (table.id === 'chWriter') {
    headers = ['Persona Name', 'Description', 'Active', 'Avatar URL', 'System Persona Prompt'];
    columnStyles = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 110 },
      1: { halign: 'left', cellWidth: 110 },
      2: { halign: 'center', cellWidth: 50 },
      3: { halign: 'left', cellWidth: 110, font: 'courier' },
      4: { halign: 'left', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.chWriterName || '-'),
      String(row.chWriterDesc || '-'),
      formatBoolean(row.chWriterActInd),
      String(row.chWriterProfilePic || '-'),
      String(row.chWriterPrompt || '-')
    ]);
  } else if (table.id === 'topic') {
    headers = ['Topic ID', 'Topic Name', 'Full Descriptive Name', 'Sort Order', 'Chatbot Intent ID (UUID)'];
    columnStyles = {
      0: { font: 'courier', cellWidth: 120 },
      1: { fontStyle: 'bold', cellWidth: 140 },
      2: { cellWidth: 190 },
      3: { halign: 'center', cellWidth: 70 },
      4: { font: 'courier', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.topicId || '-'),
      String(row.topicName || '-'),
      String(row.topicFullName || '-'),
      String(row.topicSortOrder ?? '-'),
      String(row.chIntentId || '-')
    ]);
  } else {
    // Dynamic universal fallback for any remaining / newly added tables
    headers = ['Primary ID', ...table.fields.map((f) => f.label)];
    if (headers.length > 8) {
      baseFontSize = 7;
      cellPadding = 4;
    }
    columnStyles = {
      0: { font: 'courier', cellWidth: 100 }
    };
    tableRows = data.map((row) => {
      const rowArr = [String(row[table.primaryKey] || '-')];
      for (const field of table.fields) {
        const val = row[field.name];
        if (field.type === 'boolean') {
          rowArr.push(formatBoolean(val));
        } else if (field.type === 'date') {
          rowArr.push(formatShortDate(val));
        } else if (typeof val === 'object' && val !== null) {
          rowArr.push(JSON.stringify(val));
        } else if (val !== null && val !== undefined) {
          rowArr.push(String(val));
        } else {
          rowArr.push('-');
        }
      }
      return rowArr;
    });
  }

  // --- RENDER AUTOTABLE ---
  autoTable(doc, {
    startY: 108,
    head: [headers],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [18, 35, 71], // Brand Dark Navy (#122347)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: baseFontSize + 0.5,
      halign: 'left',
      cellPadding: cellPadding + 1.5
    },
    columnStyles,
    styles: {
      fontSize: baseFontSize,
      cellPadding: cellPadding,
      valign: 'top',
      overflow: 'linebreak',
      lineColor: [226, 232, 240], // Slate-200
      lineWidth: 0.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    didParseCell: (dataCell) => {
      if (dataCell.section === 'body') {
        const text = String(dataCell.cell.raw).toUpperCase();
        if (text === 'ACTIVE' || text === 'TRUE') {
          dataCell.cell.styles.textColor = [16, 185, 129]; // Emerald-600
          dataCell.cell.styles.fontStyle = 'bold';
        } else if (text === 'INACTIVE' || text === 'FALSE') {
          dataCell.cell.styles.textColor = [225, 29, 72]; // Rose-600
          dataCell.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: (dataPage) => {
      const totalPages = (doc as any).internal.getNumberOfPages();
      const str = `Page ${dataPage.pageNumber} of ${totalPages}`;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'StoryBook Administration Console • Confidential Database Report',
        36,
        pageHeight - 16
      );
      doc.text(str, pageWidth - 36, pageHeight - 16, { align: 'right' });
    }
  });

  // Save the generated PDF file
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`storybook-db-${table.id}-${dateStr}.pdf`);
}
