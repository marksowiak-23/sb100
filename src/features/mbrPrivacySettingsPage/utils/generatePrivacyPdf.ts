/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PrivacyReportData } from '../types';

export function generatePrivacyPdf({
  mbrId,
  mbrName,
  mbrEmail,
  enrichedStories
}: PrivacyReportData): void {
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
  doc.text('Member Story Access & Visibility Report', 125, 38);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(`Generated: ${timestamp}`, pageWidth - 36, 38, { align: 'right' });

  // --- MEMBER INFO SUB-HEADER ---
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.setFont('helvetica', 'bold');
  doc.text('Member: ', 36, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(`${mbrName} (${mbrEmail || 'eleanor.vance@storybook.ai'})`, 82, 78);

  const sharedStories = enrichedStories.filter(
    (s) => s.groupsWithAccess.length > 0 || s.membersWithAccess.length > 0
  );

  doc.setFont('helvetica', 'bold');
  doc.text('Member ID: ', 36, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(mbrId, 96, 94);

  doc.setFont('helvetica', 'bold');
  doc.text('Shared Stories: ', 340, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sharedStories.length} of ${enrichedStories.length}`, 415, 94);

  const headers = [
    'Story Title',
    'Topic',
    'Status',
    'Groups with Access',
    'Connected Members with Access'
  ];

  const tableRows = sharedStories.map((item) => {
    const grpSummary =
      item.groupsWithAccess.length > 0
        ? item.groupsWithAccess
            .map((g) => `${g.group.grpName} (${g.accessLabel})`)
            .join(', ')
        : '—';

    const mbrSummary =
      item.membersWithAccess.length > 0
        ? item.membersWithAccess
            .map((m) => `${m.member.fullName} (${m.accessLabel})`)
            .join(', ')
        : '—';

    return [
      item.story.mbrStoryTitle || 'Untitled Story',
      item.topicLabel,
      item.story.mbrStoryPublishStatusCd || 'Draft',
      grpSummary,
      mbrSummary
    ];
  });

  autoTable(doc, {
    startY: 108,
    head: [headers],
    body: tableRows.length > 0 ? tableRows : [['No stories currently shared', '—', '—', '—', '—']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 6
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 36, right: 36, bottom: 40 }
  });

  const safeEmail = (mbrEmail || 'member').split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`StoryBook_Story_Access_${safeEmail}.pdf`);
}
