import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';

import { Customvalidation } from '../../shared/Validation';
import { UserService } from '../../shared/user-service';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-reimbursement-bank-details',
  standalone: true,
  imports: [CommonModule, FormsModule,
    BreadcrumbModule, TableModule,
    TableTemplate, ButtonModule,
    TabsModule, SelectModule,
    CardModule,
    CheckboxModule],
  templateUrl: './reimbursement-bank-details.html',
  styleUrl: './reimbursement-bank-details.scss',
})
export class ReimbursementBankDetails implements OnInit {
  // Header / breadcrumb
  breadcrumbItems: any[] = [
    { label: 'Home', routerLink: '/home', title: 'Home' },
    { label: 'Reports', routerLink: '/reports', title: 'Reports' },
    { label: 'Reimbursement Bank Details', title: 'Reimbursement Bank Details' },
  ];

  // Top tabs (Pending / Completed)
  tabs: any[] = [
    { title: 'Pending', value: '0' },
    { title: 'Completed', value: '1' },
  ];

  currentTab: 'pending' | 'completed' = 'pending';

  // API / meta
  param: string = '';
  menulabel: string = '';
  formlable: string = 'Reimbursement Bank Details';
  currentRole: number = 0;

  // Data
  pendingData: any[] = [];
  completedData: any[] = [];

  // Table-template helpers
  isLoading: boolean = false;

  // Bank dropdown (for export + settlement)
  travelByDrp: any[] = [];
  selectedBankForPayment: string = '';
  selectedBankCustomerNo: string = '';

  // Row selection (for bank export / settlement)
  selectedRows: Set<any> = new Set<any>();
  selectAllRows: boolean = false;

  // Columns for table-template
  pendingDataColumns: TableColumn[] = [
    { key: 'checkbox', header: '', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'empName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'empCode', header: 'Employee Code', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'amount', header: 'Amount', isVisible: true, isSortable: false },
    { key: 'bankName', header: 'Bank Name', isVisible: true, isSortable: false },
    { key: 'accountNo', header: 'Account Number', isVisible: true, isSortable: false },
    { key: 'ifsc', header: 'IFSC Code', isVisible: true, isSortable: false },
  ];

  completedDataColumns: TableColumn[] = [
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'empName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'empCode', header: 'Employee Code', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'amount', header: 'Amount', isVisible: true, isSortable: false },
    { key: 'bankName', header: 'Bank Name', isVisible: true, isSortable: false },
    { key: 'accountNo', header: 'Account Number', isVisible: true, isSortable: false },
    { key: 'ifsc', header: 'IFSC Code', isVisible: true, isSortable: false },
  ];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private Customvalidation: Customvalidation
  ) { }

  ngOnInit(): void {
    // Menu / header info
    this.param = sessionStorage.getItem('menuItem') || '{}';
    try {
      const paramjs = JSON.parse(this.param);
      this.menulabel = paramjs.menu || this.menulabel;
      this.formlable = paramjs.formName || this.formlable;
    } catch {
      // ignore parse error – keep defaults
    }

    this.currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;

    this.loadPendingData();
    this.loadCompletedData();
    this.getBankDrp();
  }

  // p-tabs change – also reload data on tab click
  onChangeTab(event: any): void {
    const value = event?.value;
    this.currentTab = value === '1' ? 'completed' : 'pending';

    if (this.currentTab === 'pending') {
      this.loadPendingData();
    } else if (this.currentTab === 'completed') {
      this.loadCompletedData();
    }
  }

  // ---------- DATA LOAD ----------

  loadPendingData(): void {
    this.isLoading = true;
    const appUserId = sessionStorage.getItem('userId');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService
      .getQuestionPaper(
        `uspGetPaymentSettlementData|appUserId=${appUserId}|appUserRole=${roleId}|processed=0`
      )
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          if (!res || Object.keys(res).length === 0) {
            this.pendingData = [];
          } else {
            this.pendingData = (res['table'] || []).map((row: any, idx: number) => ({
              ...row,
              sno: idx + 1,
            }));
          }

          // Reset selection whenever data reloads
          this.resetSelection();
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load pending payments',
            });
          }
          this.pendingData = [];
          this.resetSelection();
        }
      );
  }

  loadCompletedData(): void {
    const appUserId = sessionStorage.getItem('userId');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService
      .getQuestionPaper(
        `uspGetPaymentSettlementData|appUserId=${appUserId}|appUserRole=${roleId}|processed=1`
      )
      .subscribe(
        (res: any) => {
          if (!res || Object.keys(res).length === 0) {
            this.completedData = [];
          } else {
            this.completedData = (res['table'] || []).map((row: any, idx: number) => ({
              ...row,
              sno: idx + 1,
            }));
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load completed payments',
            });
          }
          this.completedData = [];
        }
      );
  }

  // ---------- SIMPLE COUNTS (for any legacy bindings) ----------

  getPendingCount(): number {
    return this.pendingData?.length || 0;
  }

  getCompletedCount(): number {
    return this.completedData?.length || 0;
  }

  // ---------- SELECTION HELPERS (pending table) ----------

  onRowSelectChange(item: any, selected: boolean): void {
    if (!item) return;

    if (selected) {
      this.selectedRows.add(item);
    } else {
      this.selectedRows.delete(item);
    }

    this.updateSelectAllState();
  }

  onSelectAllChange(selectAll: boolean): void {
    this.selectAllRows = selectAll;
    this.selectedRows.clear();

    if (selectAll) {
      this.pendingData.forEach((row: any) => this.selectedRows.add(row));
    }
  }

  updateSelectAllState(): void {
    if (!this.pendingData || this.pendingData.length === 0) {
      this.selectAllRows = false;
      return;
    }

    this.selectAllRows = this.pendingData.every((row: any) => this.selectedRows.has(row));
  }

  getSelectedRows(): any[] {
    return Array.from(this.selectedRows);
  }

  resetSelection(): void {
    this.selectedRows.clear();
    this.selectAllRows = false;
  }

  // ---------- BANK DROPDOWN ----------

  getBankDrp(): void {
    const userId = sessionStorage.getItem('userId');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `uspGetBankForPayment|action=BANK|appUserId=${userId}|appUserRole=${roleId}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        this.travelByDrp = res?.table || [];
      },
      error: (_err: HttpErrorResponse) => {
        this.travelByDrp = [];
      },
    });
  }

  // Call this on bank dropdown change (after user selects a bank)
  onBankSelectionChanged(): void {
    if (this.selectedRows.size === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select at least one row',
      });
      return;
    }

    if (!this.selectedBankForPayment) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a bank',
      });
      return;
    }

    // Set customer no for selected bank (needed for some formats)
    this.setSelectedBankCustomerNo(this.selectedBankForPayment);

    // 1) Export Excel
    this.exportSelectedAsExcel();

    // 2) Process payment in backend (without extra reload step)
    setTimeout(() => {
      this.processPaymentWithoutReload();
    }, 200);
  }

  private setSelectedBankCustomerNo(bankValue: string): void {
    const bank = this.travelByDrp.find((b: any) => String(b.drpValue) === String(bankValue));
    this.selectedBankCustomerNo = bank?.customerNo || '';
  }

  // ---------- PAYMENT SETTLEMENT ----------

  processPaymentWithoutReload(): void {
    if (this.selectedRows.size === 0) {
      return;
    }

    if (!this.selectedBankForPayment) {
      return;
    }

    const selectedData: any[] = [];
    this.selectedRows.forEach((item: any) => {
      const rowData = { ...item, selectedBank: this.selectedBankForPayment };
      selectedData.push(rowData);
    });

    const jsonData = JSON.stringify(selectedData);
    const userId = sessionStorage.getItem('userId');
    const raw = `downloadJson=${jsonData}|appUserId=${userId}|appUserRole=${this.currentRole}`;

    this.isLoading = true;
    this.userService
      .SubmitPostTypeData('uspPostPaymentSettlementData', raw, this.formlable)
      .subscribe(
        (res: any) => {
          const responseStr = String(res || '').trim();

          if (
            responseStr === 'Data Saved.-success' ||
            responseStr.toLowerCase().includes('success')
          ) {
            setTimeout(() => {
              this.isLoading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Payment settlement processed and Excel downloaded successfully!',
              });
              this.resetSelection();
              this.selectedBankForPayment = '';
              this.loadPendingData();
              this.loadCompletedData();
            }, 1500);
          } else {
            setTimeout(() => {
              this.isLoading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: responseStr || 'Error processing payment settlement',
              });
            }, 1500);
          }
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'An error occurred while processing payment',
            });
          }
        }
      );
  }

  // ---------- EXCEL EXPORT (BANK-SPECIFIC FORMATS) ----------

  exportSelectedAsExcel(): void {
    if (this.selectedRows.size === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select at least one row to export',
      });
      return;
    }

    if (!this.selectedBankForPayment) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a bank before exporting',
      });
      return;
    }

    const bankName = this.getBankNameFromValue(this.selectedBankForPayment);

    const selectedData: any[] = [];
    this.selectedRows.forEach((item: any) => {
      const rowData: any = {
        empName: item.empName || item.employeeName || '',
        empCode: item.empCode || item.employeeCode || '',
        accountNo: item.accountNo || item.account || '',
        amount: item.amount || item.disbursedAmt || 0,
        ifsc: item.ifsc || '',
        bankName: item.bankName || '',
        branchName: item.branchName || '',
        email: item.email || '',
        personalMobileNo: item.personalMobileNo || '',
        companyName: item.companyName || '',
        purpose: item.purpose || '',
        transactionDate: item.transactionDate || null,
        ...item,
      };
      selectedData.push(rowData);
    });

    const formattedData = this.formatDataForBank(selectedData, bankName, this.selectedBankForPayment);
    this.downloadTableAsExcel(formattedData, bankName);
  }

  private downloadTableAsExcel(data: any[], bankName: string): void {
    if (!data || data.length === 0) return;

    const isArrayFormat = Array.isArray(data[0]);

    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Sheet1</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            mso-displayed-decimal-separator: "\\.";
            mso-displayed-thousand-separator: "\\,";
          }
          th {
            background-color: #2E86C1;
            color: white;
            font-weight: bold;
            padding: 8px;
            text-align: center;
            border: 1px solid #1B4F72;
          }
          td {
            padding: 6px;
            border: 1px solid #ddd;
            text-align: left;
            mso-number-format: "\\@";
            white-space: normal;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .text-cell {
            mso-number-format: "\\@";
          }
        </style>
      </head>
      <body>
        <table border="1">
    `;

    if (isArrayFormat) {
      tableHTML += '<tbody>';

      data.forEach((row) => {
        tableHTML += '<tr>';
        row.forEach((cell: any) => {
          const value = cell || '';
          tableHTML += `<td class="text-cell" style="mso-number-format:'\\@';">${this.escapeExcelValue(
            value
          )}</td>`;
        });
        tableHTML += '</tr>';
      });
    } else {
      tableHTML += '<thead><tr>';
      const headers = Object.keys(data[0]);
      headers.forEach((header) => {
        tableHTML += `<th>${this.escapeExcelValue(header)}</th>`;
      });

      tableHTML += '</tr></thead><tbody>';

      data.forEach((row) => {
        tableHTML += '<tr>';
        headers.forEach((header) => {
          const value = row[header] || '';
          tableHTML += `<td class="text-cell" style="mso-number-format:'\\@';">${this.escapeExcelValue(
            value
          )}</td>`;
        });
        tableHTML += '</tr>';
      });
    }

    tableHTML += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Add BOM to preserve UTF-8 / special chars
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + tableHTML], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const formName = this.formlable || 'ReimbursementBankDetails';
    const displayBankName = bankName || 'Unknown Bank';
    const sanitizedBankName = displayBankName.replace(/\s+/g, '_');
    const timestamp = new Date().getTime();
    const fileName = `${formName}_${sanitizedBankName}_${timestamp}.xls`;

    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Selected records exported for ${displayBankName}`,
    });
  }

  private escapeExcelValue(value: any): string {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);
    return stringValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getBankNameFromValue(bankValue: any): string {
    if (!bankValue || !this.travelByDrp || this.travelByDrp.length === 0) {
      return 'Unknown Bank';
    }

    const bank = this.travelByDrp.find((option: any) => String(option.drpValue) === String(bankValue));
    return bank?.drpOption || 'Unknown Bank';
  }

  // ---------- BANK-SPECIFIC FORMATTERS ----------

  formatDataForBank(data: any[], bankName: string, _bankCode: string): any[] {
    const normalizedBankName = bankName.toUpperCase().trim();

    const hdfcLikeBanks = ['HDFC BANK'];
    const yesBanks = ['YES BANK'];
    const kotakBanks = ['KOTAK MAHINDRA BANK LIMITED'];

    const isHDFCLike = hdfcLikeBanks.some((b) => normalizedBankName.includes(b.toUpperCase()));
    const isYesBank = yesBanks.some((b) => normalizedBankName.includes(b.toUpperCase()));
    const isKotakBank = kotakBanks.some((b) => normalizedBankName.includes(b.toUpperCase()));

    if (isHDFCLike) {
      return this.formatForHDFCLikeBanks(data, normalizedBankName);
    } else if (isYesBank) {
      return this.formatForYesBank(data, normalizedBankName);
    } else if (isKotakBank) {
      return this.formatForKotakBank(data, normalizedBankName);
    } else {
      return this.formatForOtherBanks(data, bankName);
    }
  }

  formatForKotakBank(data: any[], _bankName: string): any[] {
    const formattedData: any[] = [];

    data.forEach((row) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const cleanedName = this.cleanBeneficiaryName(row.empName || '');
      const nameEmpCodeField = `${cleanedName} ${row.empCode || ''}`.trim();

      const formattedRow = [
        this.selectedBankCustomerNo || '',
        'VENPAY',
        'NEFT',
        '',
        formattedDate,
        '',
        row.accountNo || '',
        this.parseAmount(row.amount),
        'M',
        '',
        nameEmpCodeField,
        '',
        row.ifsc || '',
        row.personalMobileNo || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        nameEmpCodeField,
        nameEmpCodeField,
      ];

      formattedData.push(formattedRow);
    });

    return formattedData;
  }

  formatForYesBank(data: any[], _bankName: string): any[] {
    const formattedData: any[] = [];

    // YES bank templates often start with a blank row
    formattedData.push(new Array(14).fill(''));

    data.forEach((row) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const cleanedName = this.cleanBeneficiaryName(row.empName || '');
      const apiDate = row.transactionDate
        ? this.formatDateForYesBank(row.transactionDate)
        : formattedDate;
      const nameDateField = `${cleanedName}  ${apiDate}`;

      const formattedRow = [
        'D',
        'N06',
        this.selectedBankCustomerNo || '',
        row.companyName || '',
        '',
        '',
        '',
        row.ifsc || '',
        row.accountNo || '',
        cleanedName,
        '',
        '',
        '',
        '',
        nameDateField,
        apiDate,
        this.parseAmount(row.amount),
        cleanedName,
      ];

      formattedData.push(formattedRow);
    });

    return formattedData;
  }

  formatForHDFCLikeBanks(data: any[], _bankName: string): any[] {
    return data.map((row, index) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const transactionType = 'N';

      const formattedRow = {
        'Transaction Type (N – NFET, R – RTGS & I - Fund Transfer in HDFC Bank account)': transactionType,
        'Beneficiary Code': row.empCode || '',
        'Beneficiary Account Number': row.accountNo || '',
        'Instrument Amount': this.parseAmount(row.amount),
        'Beneficiary Name': this.cleanBeneficiaryName(row.empName || ''),
        'Drawee Location': '',
        'Print Location': '',
        'Bene Address 1': '',
        'Bene Address 2': '',
        'Bene Address 3': '',
        'Bene Address 4': '',
        'Bene Address 5': '',
        'Instruction Reference Number': `REF${currentDate.getTime()}${index}`,
        'Customer Reference Number': (row.purpose || '').substring(0, 20),
        'Payment details 1': '',
        'Payment details 2': '',
        'Payment details 3': '',
        'Payment details 4': '',
        'Payment details 5': '',
        'Payment details 6': '',
        'Payment details 7': '',
        'Cheque Number': '',
        'Chq / Trn Date': formattedDate,
        'MICR Number': '',
        'IFSC Code': row.ifsc || '',
        'Bene Bank Name': row.bankName || '',
        'Bene Bank Branch Name': row.branchName || '',
        'Beneficiary email id': row.email || '',
      };
      return formattedRow;
    });
  }

  formatForOtherBanks(data: any[], _bankName: string): any[] {
    return data.map((row, index) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      return {
        'S.No': index + 1,
        'Employee Name': row.empName || row.employeeName || '',
        'Employee Code': row.empCode || row.employeeCode || '',
        Purpose: row.purpose || '',
        Amount: this.parseAmount(row.amount || row.disbursedAmt || 0),
        'Bank Name': row.bankName || '',
        'Account Number': row.accountNo || row.account || '',
        'IFSC Code': row.ifsc || '',
        'Transaction Date': formattedDate,
      };
    });
  }

  private formatDateForYesBank(dateString: any): string {
    if (!dateString) {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  cleanBeneficiaryName(name: string): string {
    if (!name) return '';

    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 40);
  }

  parseAmount(amount: any): number {
    if (typeof amount === 'number') {
      return amount;
    }
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}
