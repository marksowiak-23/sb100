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

  // Table Title Mapping for AI prompt tables
  const tableTitleMap: Record<string, string> = {
    chInst: 'AI Instructions Configuration Report (chInst)',
    chIntent: 'AI Prompt Intents Report (chIntent)',
    chPrompt: 'AI Prompt Templates Report (chPrompt)',
    chWriter: 'AI Writer Personas Report (chWriter)'
  };

  const reportTitle = tableTitleMap[table.id] || `Database Table Report: ${table.name}`;

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
  doc.text(reportTitle, 125, 38);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(`Generated: ${timestamp}`, pageWidth - 36, 38, { align: 'right' });

  // --- OVERVIEW SUB-HEADER ---
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Line 1: Table Name & Connection Context
  doc.setFont('helvetica', 'bold');
  doc.text('Table: ', 36, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(`${table.name} (${table.endpoint})`, 76, 78);

  doc.setFont('helvetica', 'bold');
  doc.text('Connection: ', 340, 78);
  doc.setFont('helvetica', 'normal');
  doc.text(isSandbox ? 'Sandbox Simulation' : 'Live GCP Cloud SQL', 412, 78);

  // Line 2: Records Count & Filter
  doc.setFont('helvetica', 'bold');
  doc.text('Records: ', 36, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.length} row${data.length === 1 ? '' : 's'}`, 84, 94);

  if (searchQuery.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.text('Search Filter: ', 200, 94);
    doc.setFont('helvetica', 'normal');
    doc.text(`"${searchQuery}" (by ${table.searchField})`, 276, 94);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Primary Key: ', 550, 94);
  doc.setFont('helvetica', 'normal');
  doc.text(table.primaryKey, 620, 94);

  // --- PREPARE HEADERS AND ROWS ACCORDING TO TABLE TYPE ---
  let headers: string[] = [];
  let tableRows: string[][] = [];
  let columnStyles: Record<number, any> = {};

  if (table.id === 'chInst') {
    headers = ['Instruction Name', 'Active', 'Parent ID', 'System Content / Instructions'];
    columnStyles = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 140 },
      1: { halign: 'center', cellWidth: 55 },
      2: { halign: 'left', cellWidth: 110, font: 'courier' },
      3: { halign: 'left', cellWidth: 'auto' }
    };
    tableRows = data.map((row) => [
      String(row.chInstName || '-'),
      row.chInstActInd === true || row.chInstActInd === 1 ? 'ACTIVE' : 'INACTIVE',
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
      row.chIntentActInd === true || row.chIntentActInd === 1 ? 'ACTIVE' : 'INACTIVE',
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
      row.chPromptActInd === true || row.chPromptActInd === 1 ? 'ACTIVE' : 'INACTIVE',
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
      row.chWriterActInd === true || row.chWriterActInd === 1 ? 'ACTIVE' : 'INACTIVE',
      String(row.chWriterProfilePic || '-'),
      String(row.chWriterPrompt || '-')
    ]);
  } else {
    // Generic fallback for any other table
    headers = ['Primary ID', ...table.fields.map((f) => f.label)];
    columnStyles = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 110, font: 'courier' }
    };
    tableRows = data.map((row) => {
      const rowArr = [String(row[table.primaryKey] || '-')];
      for (const field of table.fields) {
        const val = row[field.name];
        if (field.type === 'boolean') {
          rowArr.push(val === true || val === 1 ? 'True' : 'False');
        } else if (field.type === 'date') {
          rowArr.push(val ? String(val).split('T')[0] : '-');
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
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 6
    },
    columnStyles,
    styles: {
      fontSize: 8,
      cellPadding: 5.5,
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
      // Header repeated or footer page numbers
      const str = `Page ${dataPage.pageNumber} of ${(doc as any).internal.getNumberOfPages()}`;
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
