/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MbrAcct, MbrAcctActivity, eventApi } from '@/src/services/api';

export interface GenerateAccountStatementPdfOptions {
  account: MbrAcct;
  activities: MbrAcctActivity[];
  memberName?: string;
  memberEmail?: string;
  isSandbox?: boolean;
}

export function generateAccountStatementPdf({
  account,
  activities,
  memberName = 'Valued Member',
  memberEmail,
  isSandbox = false
}: GenerateAccountStatementPdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  // Header Banner
  doc.setFillColor(15, 27, 53); // #0F1B35 navy
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Brand Title
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('StoryBook', margin, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6); // amber-600 gold
  doc.text('MEMBER ACCOUNT STATEMENT & USAGE LEDGER', margin, 58);

  // Statement Date
  const statementDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated: ${statementDate}`, pageWidth - margin, 58, { align: 'right' });

  // Member Information Card
  doc.setFillColor(250, 248, 245); // vintage ivory
  doc.setDrawColor(227, 221, 210);
  doc.roundedRect(margin, 105, pageWidth - margin * 2, 75, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('ACCOUNT HOLDER', margin + 15, 125);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${memberName}`, margin + 15, 142);
  if (memberEmail) {
    doc.text(`Email: ${memberEmail}`, margin + 15, 157);
  }
  doc.text(`Member ID: ${account.mbrId}`, margin + 15, memberEmail ? 170 : 157);

  // Summary Metrics on Right
  const rightColX = pageWidth / 2 + 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('ACCOUNT SUMMARY', rightColX, 125);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Current Credit Balance: ${account.mbrAcctCreditBalance.toLocaleString()} Credits`, rightColX, 142);
  doc.text(`Lifetime Credits Earned: ${(account.mbrAcctLifetimeCreditsEarned || 0).toLocaleString()}`, rightColX, 157);
  doc.text(`Lifetime Credits Used: ${(account.mbrAcctLifetimeCreditsUsed || 0).toLocaleString()}`, rightColX, 170);

  // Activity Ledger AutoTable
  const tableData = activities.map((act) => {
    const actDate = act.mbrAcctActivityCreatedAt
      ? new Date(act.mbrAcctActivityCreatedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '—';

    const deltaStr =
      act.creditDelta > 0
        ? `+${act.creditDelta.toLocaleString()}`
        : `${act.creditDelta.toLocaleString()}`;

    return [
      actDate,
      act.mbrAcctActivityTypeCd || 'ACTIVITY',
      act.mbrAcctActivityDesc || 'Credit adjustment',
      deltaStr,
      (act.balanceAfter ?? '—').toLocaleString()
    ];
  });

  autoTable(doc, {
    startY: 195,
    margin: { left: margin, right: margin, bottom: 40 },
    head: [['Date & Time', 'Action Code', 'Description', 'Change', 'Balance After']],
    body: tableData.length > 0 ? tableData : [['No activity recorded yet.', '', '', '', '']],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 27, 53],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 105 },
      1: { cellWidth: 105, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 55, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 70, halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const textVal = String(data.cell.raw);
        if (textVal.startsWith('+')) {
          data.cell.styles.textColor = [22, 101, 52]; // green-800
        } else if (textVal.startsWith('-')) {
          data.cell.styles.textColor = [185, 28, 28]; // red-700
        }
      }
    }
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'StoryBook Ecosystem • Confidential Member Account Statement',
      margin,
      pageHeight - 20
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 20,
      { align: 'right' }
    );
  }

  // Log statement export event
  eventApi
    .logEvent({
      eventSiteCd: 'SB',
      eventActorId: account.mbrId,
      eventActorTypeCd: 'MBR',
      eventCd: 'ACCOUNT_STATEMENT_PDF_EXPORT',
      eventDetail: `Member exported account credit statement PDF (${activities.length} ledger rows)`,
      eventTagValue: {
        creditBalance: account.mbrAcctCreditBalance,
        ledgerRows: activities.length,
        isSandbox
      }
    })
    .catch(() => {});

  return doc;
}
