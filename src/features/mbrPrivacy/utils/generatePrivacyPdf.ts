/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Topic, Cd } from '@/src/services/api';
import { UnifiedGroup, PrivilegeCell } from '../types';

interface GeneratePrivacyPdfOptions {
  mbrId: string;
  mbrEmail?: string;
  topics: Topic[];
  groups: UnifiedGroup[];
  matrix: Record<string, PrivilegeCell>;
  privCodes: Cd[];
}

export function generatePrivacyPdf({
  mbrId,
  mbrEmail,
  topics,
  groups,
  matrix,
  privCodes
}: GeneratePrivacyPdfOptions): void {
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
  doc.text('Member Privacy & Permissions Report', 125, 38);

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

  // Line 2: Member ID & Overview counts
  doc.setFont('helvetica', 'bold');
  doc.text('Member ID: ', 36, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(mbrId, 96, 94);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Topics: ', 340, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(`${topics.length}`, 405, 94);

  doc.setFont('helvetica', 'bold');
  doc.text('Total Groups: ', 470, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(`${groups.length}`, 535, 94);

  // Helper map for code labels
  const codeLabelMap = new Map<string, string>();
  for (const c of privCodes) {
    codeLabelMap.set(c.cdValue, c.cdLabel || c.cdValue);
  }

  // --- MATRIX TABLE DATA PREPARATION ---
  const headers = ['Topic Name', ...groups.map(g => `${g.grpName}${g.isCustom ? ' (Custom)' : ''}`)];
  
  const tableRows = topics.map(topic => {
    const row = [topic.topicFullName || topic.topicName];
    for (const grp of groups) {
      const key = `${topic.topicId}_${grp.grpId}`;
      const cell = matrix[key];
      const privVal = cell?.privValueCd || 'NONE';
      const label = codeLabelMap.get(privVal) || privVal;
      row.push(label);
    }
    return row;
  });

  // --- MATRIX TABLE ---
  autoTable(doc, {
    startY: 108,
    head: [headers],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center'
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 140 }
    },
    styles: {
      fontSize: 8,
      cellPadding: 6,
      halign: 'center',
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index > 0) {
        const text = String(data.cell.raw).toUpperCase();
        if (text.includes('WRITE') || text.includes('CONTRIBUTE')) {
          data.cell.styles.textColor = [37, 99, 235]; // Blue-600
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('READ') || text.includes('VIEW ONLY')) {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald-600
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('NONE') || text.includes('NO ACCESS')) {
          data.cell.styles.textColor = [225, 29, 72]; // Rose-600
        }
      }
    }
  });

  // --- PERMISSION CODES LEGEND FOOTER ---
  const lastTableY = (doc as any).lastAutoTable?.finalY || 400;
  const legendY = Math.min(lastTableY + 24, doc.internal.pageSize.getHeight() - 70);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Permission Codes Legend:', 36, legendY);

  const legendItems = [
    { label: 'WRITE (View & Contribute)', color: [37, 99, 235] as [number, number, number] },
    { label: 'READ (View Only)', color: [16, 185, 129] as [number, number, number] },
    { label: 'NONE (No Access / Private)', color: [225, 29, 72] as [number, number, number] }
  ];

  let currentX = 165;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  for (const item of legendItems) {
    doc.setFillColor(...item.color);
    doc.circle(currentX, legendY - 2.5, 3.5, 'F');
    doc.setTextColor(...item.color);
    doc.text(item.label, currentX + 7, legendY);
    currentX += doc.getTextWidth(item.label) + 26;
  }

  // --- FOOTER COPYRIGHT ---
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'StoryBook Privacy Matrix • Confidential • Keep secure',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 20,
    { align: 'center' }
  );

  // Save the generated PDF
  doc.save(`storybook-privacy-matrix-${new Date().toISOString().slice(0, 10)}.pdf`);
}
