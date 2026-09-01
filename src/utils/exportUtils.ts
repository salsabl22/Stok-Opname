// src/utils/exportUtils.ts
// Utility untuk Export PDF dan Excel

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * Export data ke PDF dengan format tabel
 */
export function exportToPDF(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, any>[],
  filename?: string
) {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 22);
  doc.setTextColor(0, 0, 0);

  const head = [columns.map(c => c.header)];
  const body = rows.map(row => columns.map(c => row[c.key] ?? '-'));

  autoTable(doc, {
    head,
    body,
    startY: 27,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    margin: { left: 14, right: 14 },
  });

  const pdfFilename = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(pdfFilename);
}

/**
 * Export data ke Excel (.xlsx)
 */
export function exportToExcel(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, any>[],
  filename?: string
) {
  const headers = columns.map(c => c.header);
  const data = rows.map(row => columns.map(c => row[c.key] ?? '-'));

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Style lebar kolom
  worksheet['!cols'] = columns.map(c => ({ wch: c.width || 20 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31));

  const xlsxFilename = filename || `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, xlsxFilename);
}
