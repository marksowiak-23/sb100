/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UnifiedGroupOption, MemberConnectionItem, ConnectionFilterType } from '../types';

interface GenerateConnectionPdfOptions {
  mbrId: string;
  mbrEmail?: string;
  groupFilter: ConnectionFilterType;
  groups: UnifiedGroupOption[];
  memberList: MemberConnectionItem[];
}

export function generateConnectionPdf({
  mbrId,
  mbrEmail,
  groupFilter,
  groups,
  memberList
}: GenerateConnectionPdfOptions): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Determine Filter Name Label
  let filterLabel = 'All Connections';
  if (groupFilter !== 'ALL' && groupFilter !== 'ASSIGNED') {
    const matchedGroup = groups.find(g => g.grpId === groupFilter);
    filterLabel = matchedGroup ? `Group: ${matchedGroup.grpName}` : 'Custom Filter';
  }

  // --- BRAND HEADER ---
  doc.setFillColor(15, 27, 53); // Deep Navy (#0F1B35)
  doc.rect(0, 0, pageWidth, 60, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('story', 36, 38);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(96, 165, 250); // Blue-400
  doc.text('book', 76, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text('Member Connections & Group Assignments Report', 125, 38);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(`Generated: ${timestamp}`, pageWidth - 36, 38, { align: 'right' });

  // --- MEMBER INFO & OVERVIEW SUB-HEADER ---
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Line 1: Member Email (above Member ID line)
  doc.setFont('helvetica', 'bold');
  doc.text('Member Email: ', 36, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(mbrEmail || 'eleanor.vance@storybook.ai', 106, 78);

  // Line 2: Member ID & Report details
  doc.setFont('helvetica', 'bold');
  doc.text('Member ID: ', 36, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(mbrId, 96, 94);

  doc.setFont('helvetica', 'bold');
  doc.text('Active Filter: ', 340, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(filterLabel, 400, 94);

  doc.setFont('helvetica', 'bold');
  doc.text('Members Listed: ', 550, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(`${memberList.length}`, 625, 94);

  // Map for fast group lookup
  const groupMap = new Map<string, UnifiedGroupOption>();
  for (const g of groups) {
    groupMap.set(g.grpId, g);
  }

  // Sort memberList by Assigned Group Name ASC, then by Member Name
  const sortedList = [...memberList].sort((a, b) => {
    const grpA = a.selectedGrpId ? (groupMap.get(a.selectedGrpId)?.grpName || 'ZZZ') : 'ZZZ_None';
    const grpB = b.selectedGrpId ? (groupMap.get(b.selectedGrpId)?.grpName || 'ZZZ') : 'ZZZ_None';
    if (grpA !== grpB) return grpA.localeCompare(grpB);
    const nameA = `${a.member.mbrFirstName || ''} ${a.member.mbrLastName || ''}`.trim();
    const nameB = `${b.member.mbrFirstName || ''} ${b.member.mbrLastName || ''}`.trim();
    return nameA.localeCompare(nameB);
  });

  // Prepare table headers and rows based on filter context
  const isSingleGroup = groupFilter !== 'ALL' && groupFilter !== 'ASSIGNED' && groupFilter !== 'UNASSIGNED';

  let headers: string[];
  let tableRows: string[][];

  if (isSingleGroup) {
    headers = ['Member Name', 'Email Address', 'Location', 'Occupation / Organization'];
    tableRows = sortedList.map(item => {
      const m = item.member;
      const fullName = `${m.mbrFirstName || ''} ${m.mbrLastName || ''}`.trim() || 'Anonymous Member';
      return [
        fullName,
        m.mbrEmailAddress || '—',
        m.mbrLivesCityState || m.mbrFromCityState || '—',
        m.mbrWorkAt || '—'
      ];
    });
  } else {
    headers = ['Assigned Group', 'Member Name', 'Email Address', 'Location', 'Occupation / Organization'];
    tableRows = sortedList.map(item => {
      const m = item.member;
      const fullName = `${m.mbrFirstName || ''} ${m.mbrLastName || ''}`.trim() || 'Anonymous Member';
      const grp = item.selectedGrpId ? groupMap.get(item.selectedGrpId) : undefined;
      const grpDisplay = grp ? `${grp.grpName}${grp.isCustom ? ' (Custom)' : ''}` : 'None (Unassigned)';

      return [
        grpDisplay,
        fullName,
        m.mbrEmailAddress || '—',
        m.mbrLivesCityState || m.mbrFromCityState || '—',
        m.mbrWorkAt || '—'
      ];
    });
  }

  // --- AUTO TABLE ---
  autoTable(doc, {
    startY: 108,
    head: [headers],
    body: tableRows.length > 0 ? tableRows : [['No members found matching this filter.', '', '', '', '']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    styles: {
      fontSize: 8,
      cellPadding: 6,
      halign: 'left',
      valign: 'middle'
    },
    columnStyles: isSingleGroup ? {
      0: { fontStyle: 'bold', cellWidth: 150 },
      1: { cellWidth: 180 },
      2: { cellWidth: 160 }
    } : {
      0: { fontStyle: 'bold', cellWidth: 140 },
      1: { fontStyle: 'bold', cellWidth: 140 },
      2: { cellWidth: 160 },
      3: { cellWidth: 140 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    didParseCell: (data) => {
      if (data.section === 'body' && !isSingleGroup && data.column.index === 0) {
        const text = String(data.cell.raw);
        if (text.includes('None (Unassigned)')) {
          data.cell.styles.textColor = [156, 163, 175]; // Slate-400
          data.cell.styles.fontStyle = 'normal';
        } else {
          data.cell.styles.textColor = [37, 99, 235]; // Blue-600
        }
      }
    }
  });

  // --- FOOTER COPYRIGHT ---
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'StoryBook Member Directory & Groups • Confidential',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 20,
    { align: 'center' }
  );

  // Save the generated PDF
  const filenameSafeFilter = filterLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`storybook-member-connections-${filenameSafeFilter}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
