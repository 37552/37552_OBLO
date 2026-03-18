// src/app/shared/imprestpdf.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ImprestPdfService {

  constructor() { }

  private formatNumber(value: any): string {
    if (value === null || value === undefined) return '0.00';
    const n = Number(value);
    if (!isFinite(n)) return '0.00';
    return n.toFixed(2);
  }

  private parseBalance(balanceStr: any): { value: number, isCredit: boolean } {
    if (!balanceStr) return { value: 0, isCredit: false };
    const str = String(balanceStr).trim();
    if (!isNaN(Number(str))) {
      const num = Number(str);
      return { value: Math.abs(num), isCredit: num >= 0 };
    }

    if (str.toLowerCase().includes('cr')) {
      const numValue = Number(str.replace(/[^0-9.-]/g, ''));
      return { value: Math.abs(numValue), isCredit: true };
    }

    const numValue = Number(str.replace(/[^0-9.-]/g, ''));
    return { value: Math.abs(numValue), isCredit: false };
  }

  private formatBalanceDisplay(balanceValue: any): string {
    if (balanceValue === null || balanceValue === undefined) {
      return '0.00';
    }

    const { value, isCredit } = this.parseBalance(balanceValue);
    const formatted = this.formatNumber(value);

    if (value === 0) {
      return formatted;
    }

    return isCredit ? `${formatted} Cr` : `${formatted} Dr`;
  }

  downloadImprestPdf(
    orgInfo: any, summaryData: any, imprestDetails: any[], p0: string, p1: string, p2: string, formattedFromDate: string, formattedToDate: string, totals: { totalDebit?: number; totalCredit?: number; } = {}, fileName = 'Imprest_Group_Summary', dateFrom?: string, dateTo?: string) {
    const orientation = 'portrait';
    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = 'Imprest';
    const subtitle = 'Group Summary';
    const dateRangeStr = (dateFrom || dateTo)
      ? `${dateFrom ? dateFrom : ''}${dateFrom && dateTo ? ' to ' : ''}${dateTo ? dateTo : ''}`
      : '';

    let currentPage = 1;

    // Fixed header structure with proper column alignment
    const head = [
      [
        { content: 'Name', rowSpan: 2, styles: { halign: 'left', fontStyle: 'bold' } },
        { content: 'Code', rowSpan: 2, styles: { halign: 'left', fontStyle: 'bold' } },
        { content: 'Purpose', rowSpan: 2, styles: { halign: 'left', fontStyle: 'bold' } },
        { content: 'Opening\nBalance', rowSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: 'Transactions', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: 'Closing\nBalance', rowSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }
      ],
      [
        { content: 'Debit', styles: { halign: 'right', fontStyle: 'bold' } },
        { content: 'Credit', styles: { halign: 'right', fontStyle: 'bold' } }
      ]
    ];

    const body: any[] = [];

    // Summary row - now properly aligned with 7 columns
    if (summaryData) {
      body.push([
        { content: 'Imprest - MS', styles: { halign: 'left', fontStyle: 'bold' } },
        { content: '', styles: { halign: 'left' } },
        { content: '', styles: { halign: 'left' } },
        { content: this.formatBalanceDisplay(summaryData.opBalance), styles: { halign: 'right' } },
        { content: this.formatNumber(summaryData.dR_Amount), styles: { halign: 'right' } },
        { content: this.formatNumber(summaryData.cR_Amount), styles: { halign: 'right' } },
        { content: this.formatBalanceDisplay(summaryData.closingBalance), styles: { halign: 'right' } }
      ]);
    }

    // Detail rows
    if (imprestDetails && Array.isArray(imprestDetails) && imprestDetails.length > 0) {
      imprestDetails.forEach((r: any, index: number) => {
        body.push([
          { content: r.name ?? '', styles: { halign: 'left' } },
          { content: r.empCode ?? '', styles: { halign: 'left' } },
          { content: r.purpose ?? '', styles: { halign: 'left' } },
          { content: this.formatBalanceDisplay(r.opBalance), styles: { halign: 'right' } },
          { content: this.formatNumber(r.dR_Amount), styles: { halign: 'right' } },
          { content: this.formatNumber(r.cR_Amount), styles: { halign: 'right' } },
          { content: this.formatBalanceDisplay(r.closingBalance), styles: { halign: 'right' } }
        ]);
      });
    }

    // Calculate totals
    if (totals.totalDebit == null) {
      totals.totalDebit = (imprestDetails || []).reduce((s: number, x: any) => s + (Number(x.dR_Amount) || 0), 0);
      if (summaryData && summaryData.dR_Amount) {
        totals.totalDebit += Number(summaryData.dR_Amount) || 0;
      }
    }
    if (totals.totalCredit == null) {
      totals.totalCredit = (imprestDetails || []).reduce((s: number, x: any) => s + (Number(x.cR_Amount) || 0), 0);
      if (summaryData && summaryData.cR_Amount) {
        totals.totalCredit += Number(summaryData.cR_Amount) || 0;
      }
    }

    const estimateHeaderHeight = () => {
      let h = 30;
      if (orgInfo && orgInfo.orgName) {
        h += 12 + 6;
        if (orgInfo.address) {
          const addressLines = String(orgInfo.address).split(',');
          h += addressLines.length * (8 + 4);
        }
        if (orgInfo.serviceTax) h += 8 + 4;
        if (orgInfo.category) h += 8 + 4;
        if (orgInfo.panNo) h += 8 + 4;
        if (orgInfo.cin) h += 8 + 4;
      }
      h += 10 + 6;
      h += 9 + 6;
      if (dateRangeStr) h += 8 + 4;
      h += 30;
      return h;
    };

    const headerSpace = estimateHeaderHeight();

    autoTable(doc, {
      startY: headerSpace,
      margin: { top: headerSpace, left: 35, right: 25 },
      head,
      body,
      theme: 'plain',
      tableWidth: 'auto',
      styles: {
        fontSize: 8,
        cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
        valign: 'top',
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        minCellHeight: 18,
        overflow: 'linebreak',
        lineHeight: 1.3
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        halign: 'center',
        fontStyle: 'bold',
        lineWidth: { top: 0.5, right: 0, bottom: 0.5, left: 0 },
        minCellHeight: 20,
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 }
      },
      bodyStyles: {
        lineWidth: 0,
        minCellHeight: 18
      },
      didDrawCell: (data: any) => {
        const { row, column, cell } = data;
        const doc = data.doc;

        // Draw left border for first column
        if (column.index === 0) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
        }

        // Draw right border for last column
        if (column.index === 6) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        }

        // Draw bottom border for last row only
        if (data.section === 'body' && row.index === data.table.body.length - 1) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
        }
      },
      columnStyles: {
        0: { cellWidth: 70, halign: 'left', valign: 'top' },
        1: { cellWidth: 45, halign: 'left', valign: 'top' },
        2: { cellWidth: 150, halign: 'left', valign: 'top' },
        3: { cellWidth: 55, halign: 'right', valign: 'top' },
        4: { cellWidth: 55, halign: 'right', valign: 'top' },
        5: { cellWidth: 55, halign: 'right', valign: 'top' },
        6: { cellWidth: 70, halign: 'right', valign: 'top' }
      },
      didDrawPage: (data: any) => {
        const pageW = doc.internal.pageSize.getWidth();
        const drawCentered = (text: string, y: number, fontSize = 10, fontStyle: any = 'normal') => {
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', fontStyle);
          const textWidth = (doc as any).getTextWidth(text);
          const x = Math.max(40, (pageW - textWidth) / 2);
          doc.text(text, x, y);
          return y + (fontSize + 6);
        };

        let headerY = 30;

        if (orgInfo && orgInfo.orgName) {
          headerY = drawCentered(String(orgInfo.orgName), headerY, 12, 'bold');

          if (orgInfo.address) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const addressLines = String(orgInfo.address).split(',');
            addressLines.forEach(line => {
              headerY = drawCentered(line.trim(), headerY, 8, 'normal');
            });
          }
          if (orgInfo.serviceTax) headerY = drawCentered(`Service Tax # ${orgInfo.serviceTax}`, headerY, 8, 'normal');
          if (orgInfo.category) headerY = drawCentered(`Category# ${orgInfo.category}`, headerY, 8, 'normal');
          if (orgInfo.panNo) headerY = drawCentered(`Pan No. ${orgInfo.panNo}`, headerY, 8, 'normal');
          if (orgInfo.cin) headerY = drawCentered(`CIN : ${orgInfo.cin}`, headerY, 8, 'normal');
        }

        headerY = drawCentered(title, headerY, 10, 'bold');
        headerY = drawCentered(subtitle, headerY, 9, 'bold');

        if (dateRangeStr) {
          headerY = drawCentered(dateRangeStr, headerY, 8, 'normal');
        }
        headerY += 30;
        (doc as any).headerBottomY = headerY;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const pageLabel = `Page ${currentPage}`;
        const pw = (doc as any).getTextWidth(pageLabel);
        doc.text(pageLabel, pageW - 40 - pw, 30);

        currentPage++;
      }
    });

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : headerSpace;

    // Grand total block with proper alignment
    if (body && body.length > 0) {
      const grandTotalClosing = summaryData?.closingBalance || 0;
      const grandStartY = Math.max(finalY + 6, headerSpace);

      autoTable(doc, {
        startY: grandStartY,
        margin: { left: 35, right: 25, top: headerSpace },
        body: [
          [
            { content: 'Grand Total', styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } },
            { content: '', styles: { halign: 'left' } },
            { content: '', styles: { halign: 'left' } },
            { content: this.formatBalanceDisplay(summaryData?.opBalance || 0), styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } },
            { content: this.formatNumber(totals.totalDebit), styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } },
            { content: this.formatNumber(totals.totalCredit), styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } },
            { content: this.formatBalanceDisplay(grandTotalClosing), styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }
          ]
        ],
        theme: 'plain',
        styles: {
          fontSize: 8,
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          minCellHeight: 18,
          overflow: 'linebreak'
        },
        didDrawCell: (data: any) => {
          const { row, column, cell } = data;
          const doc = data.doc;

          // Draw all borders for Grand Total row
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);

          // Top border
          doc.line(cell.x, cell.y, cell.x + cell.width, cell.y);

          // Bottom border
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);

          // Left border for first column
          if (column.index === 0) {
            doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
          }

          // Right border for last column
          if (column.index === 6) {
            doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
          }
        },
        columnStyles: {
          0: { cellWidth: 70, halign: 'center' },
          1: { cellWidth: 45, halign: 'left' },
          2: { cellWidth: 150, halign: 'left' },
          3: { cellWidth: 55, halign: 'right' },
          4: { cellWidth: 55, halign: 'right' },
          5: { cellWidth: 55, halign: 'right' },
          6: { cellWidth: 70, halign: 'right' }
        }
      });
    }
    doc.save(`${fileName}.pdf`);
  }
}