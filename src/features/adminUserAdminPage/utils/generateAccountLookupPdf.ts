/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User as ApiUser, eventApi } from '@/src/services/api';

export interface GenerateAccountLookupPdfOptions {
  users: ApiUser[];
  searchQuery?: string;
  isSandbox?: boolean;
}

const formatDate = (dateVal?: any): string => {
  if (!dateVal) return '-';
  try {
    const s = String(dateVal);
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    if (s.includes('T')) return s.split('T')[0];
    return s.slice(0, 10);
  } catch {
    return String(dateVal);
  }
};

export function generateAccountLookupPdf({
  users,
  searchQuery = '',
  isSandbox = false
}: GenerateAccountLookupPdfOptions): void {
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

  // --- BRAND HEADER ---
  doc.setFillColor(15, 27, 53); // Deep Navy (#0F1B35)
  doc.rect(0, 0, pageWidth, 58, 'F');

  // Accent Line
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.rect(0, 56, pageWidth, 2.5, 'F');

  // StoryBook Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('story', 36, 36);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(147, 197, 253); // Blue-300
  doc.text('book', 76, 36);

  doc.setFontSize(8.5);
  doc.setTextColor(245, 158, 11); // Amber-500
  doc.setFont('helvetica', 'bold');
  doc.text('ADMIN CONSOLE', 115, 35);

  // Document Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(226, 232, 240); // Slate-200
  doc.text('|  User Accounts & Authentication Directory', 205, 36);

  // Right-aligned Timestamp
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(`Generated: ${timestamp}`, pageWidth - 36, 36, { align: 'right' });

  // --- OVERVIEW SUB-HEADER BOX ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(36, 66, pageWidth - 72, 32, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(36, 66, pageWidth - 72, 32, 6, 6, 'S');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  // Col 1: Scope
  doc.setFont('helvetica', 'bold');
  doc.text('Report View: ', 48, 85);
  doc.setFont('helvetica', 'normal');
  doc.text('User Accounts Directory', 110, 85);

  // Col 2: Total Records
  doc.setFont('helvetica', 'bold');
  doc.text('Total Records: ', 260, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`${users.length} user${users.length === 1 ? '' : 's'}`, 328, 85);

  // Col 3: Filter Query (if active)
  if (searchQuery.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.text('Search: ', 420, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`"${searchQuery.trim()}"`, 460, 85);
  }

  // Col 4: Connection Mode
  doc.setFont('helvetica', 'bold');
  doc.text('Source: ', pageWidth - 210, 85);
  doc.setFont('helvetica', 'normal');
  if (isSandbox) {
    doc.setTextColor(217, 119, 6); // Amber-600
    doc.text('Sandbox Offline Simulation', pageWidth - 165, 85);
  } else {
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text('Live Cloud SQL (sbDB100)', pageWidth - 165, 85);
  }

  // --- PREPARE TABLE DATA ---
  const headers = [
    '#',
    'Email Address (Username)',
    'User ID (UUID)',
    'Account Type',
    'Status',
    'Registration Date',
    'Last Updated'
  ];

  const tableRows = users.map((u, idx) => {
    const regDate = formatDate(u.created_at);
    const updatedDate = formatDate(u.updated_at);
    const statusLabel = u.is_active ? 'ACTIVE' : 'INACTIVE';
    const typeLabel = (u.user_typeCd || 'MBR').toUpperCase();

    return [
      String(idx + 1),
      u.email || 'N/A',
      u.user_id || 'N/A',
      typeLabel,
      statusLabel,
      regDate,
      updatedDate
    ];
  });

  // --- RENDER AUTOTABLE ---
  autoTable(doc, {
    startY: 106,
    head: [headers],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [18, 35, 71], // Brand Dark Navy (#122347)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 5.5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 35 },
      1: { fontStyle: 'bold', cellWidth: 175 },
      2: { halign: 'center', font: 'courier', cellWidth: 190, fontSize: 7.5 },
      3: { halign: 'center', cellWidth: 80 },
      4: { halign: 'center', cellWidth: 70 },
      5: { halign: 'center', cellWidth: 85 },
      6: { halign: 'center', cellWidth: 85 }
    },
    styles: {
      fontSize: 8,
      cellPadding: 5,
      valign: 'middle',
      overflow: 'linebreak',
      lineColor: [226, 232, 240], // Slate-200
      lineWidth: 0.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    didParseCell: (dataCell) => {
      if (dataCell.section === 'body') {
        // Highlight Status
        if (dataCell.column.index === 4) {
          const val = String(dataCell.cell.raw);
          if (val === 'ACTIVE') {
            dataCell.cell.styles.textColor = [16, 185, 129]; // Emerald-600
            dataCell.cell.styles.fontStyle = 'bold';
          } else {
            dataCell.cell.styles.textColor = [225, 29, 72]; // Rose-600
            dataCell.cell.styles.fontStyle = 'bold';
          }
        }
        // Highlight Type
        if (dataCell.column.index === 3) {
          const val = String(dataCell.cell.raw);
          if (val === 'ADM' || val === 'ADMIN') {
            dataCell.cell.styles.textColor = [37, 99, 235]; // Blue-600
            dataCell.cell.styles.fontStyle = 'bold';
          } else if (val === 'AI') {
            dataCell.cell.styles.textColor = [126, 34, 206]; // Purple-700
            dataCell.cell.styles.fontStyle = 'bold';
          }
        }
      }
    },
    didDrawPage: (dataPage) => {
      const totalPages = (doc as any).internal.getNumberOfPages();
      const str = `Page ${dataPage.pageNumber} of ${totalPages}`;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'StoryBook Administration Console • User Account Directory Report • Confidential',
        36,
        pageHeight - 16
      );
      doc.text(str, pageWidth - 36, pageHeight - 16, { align: 'right' });
    }
  });

  // --- SAVE THE PDF FILE ---
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`storybook-user-accounts-${dateStr}.pdf`);

  // Log admin print-to-pdf event
  eventApi.logEvent({
    eventSiteCd: 'SB_ADMIN',
    eventActorTypeCd: 'ADM',
    eventCd: 'ACCOUNT_LOOKUP_PDF',
    eventDetail: `Admin generated User Accounts PDF report (${users.length} accounts, ${isSandbox ? 'Sandbox' : 'Live'})`,
    eventTagValue: {
      accountCount: users.length,
      searchQuery: searchQuery || undefined,
      isSandbox,
    }
  }).catch((err) => console.warn('Could not log ACCOUNT_LOOKUP_PDF event:', err));
}
