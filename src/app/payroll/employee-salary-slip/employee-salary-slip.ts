import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// PrimeNG Imports
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputOtpModule } from 'primeng/inputotp';
import { UserService } from '../../shared/user-service';
import { TableTemplate } from '../../table-template/table-template';
import { PdfGeneratorService } from '../../shared/pdf-generator.service';

@Component({
  selector: 'app-employee-salary-slip',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BreadcrumbModule,
    ButtonModule,
    SelectModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    CardModule,
    InputOtpModule,
    TableTemplate
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employee-salary-slip.html',
  styleUrl: './employee-salary-slip.scss'
})
export class EmployeeSalarySlip implements OnInit {

  breadcrumbItems: any[] = [];
  searchForm: FormGroup;

  param: any;
  menulabel: any;
  FormName: string = '';
  FormValue: string = '';

  // Dropdown Data
  orgDrp: any[] = [];
  empDrp: any[] = [];
  monthDrp: any[] = [];

  // Table Data
  tblData: any[] = [];
  tableHeaders: any[] = [];
  isLoading: boolean = false;
  showTabledata: boolean = false;
  noDatafoundCard: boolean = false;

  // Pagination
  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  // Print & OTP
  salarySlipPrintData: any[] = [];
  printContentSafe: SafeHtml | null = null;
  printDialogVisible: boolean = false;

  otpDialogVisible: boolean = false;
  otpValue: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private pdfService: PdfGeneratorService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      orgId: [null, Validators.required],
      empId: [null, Validators.required],
      monthId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;

      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: this.menulabel },
        { label: this.FormName }
      ];
    }

    this.getOrgDrp();
    this.getMonthDrp();
  }

  get f() { return this.searchForm.controls; }

  getOrgDrp() {
    this.userService.getQuestionPaper(`uspGetEmployeeCtcDrp|action=ORG`).subscribe((res: any) => {
      this.orgDrp = res['table'];
    }, (err: HttpErrorResponse) => {
      this.handleError(err);
    });
  }
  resetForm() {
    this.searchForm.reset();
  }
  getEmpDrp(event: any) {
    const orgId = event.value;
    this.userService.getQuestionPaper(`uspGetEmployeeCtcDrp|action=EMPLOYEE|orgId=${orgId}`).subscribe((res: any) => {
      this.empDrp = res['table'];
    }, (err: HttpErrorResponse) => {
      this.handleError(err);
    });
  }

  getMonthDrp() {
    this.userService.getQuestionPaper(`uspGetEmployeeCtcDrp|action=MONTH`).subscribe((res: any) => {
      this.monthDrp = res['table'];
    }, (err: HttpErrorResponse) => {
      this.handleError(err);
    });
  }

  validate() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select all required fields' });
      return;
    }

    this.getOtp();
  }

  getOtp() {
    this.isLoading = true;
    let employee = this.searchForm.get('empId')?.value;
    let organisation = this.searchForm.get('orgId')?.value;
    let data = `orgId=${organisation}|empId=${employee}|action=SLIP`;

    this.userService.SubmitPostTypeData(`uspSendSlipCode`, data, this.FormName).subscribe((res: any) => {
      this.isLoading = false;
      if (res === "Data Saved.-success") {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'OTP Sent Successfully!' });
        this.otpValue = '';
        this.otpDialogVisible = true;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res });
      }
    }, (err: HttpErrorResponse) => {
      this.isLoading = false;
      this.handleError(err);
    });
  }

  verifyOtp() {
    if (!this.otpValue || this.otpValue.length !== 6) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a valid 6-digit OTP' });
      return;
    }

    this.isLoading = true;
    let employee = this.searchForm.get('empId')?.value;
    let query = `empId=${employee}|OTP=${this.otpValue}|action=SLIP`;

    this.userService.SubmitPostTypeData(`uspVerifySlipCode`, query, this.FormName).subscribe((res: any) => {
      this.isLoading = false;
      if (res === "Data Saved.-success") {
        this.otpDialogVisible = false;
        this.getTableData();
      } else if (res === "2-Invalid OTP!") {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid OTP!' });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: res });
      }
    }, (err: HttpErrorResponse) => {
      this.isLoading = false;
      this.handleError(err);
    });
  }

  getTableData() {
    this.isLoading = true;
    this.salarySlipPrintData = [];
    this.tblData = [];
    this.showTabledata = true;
    this.noDatafoundCard = false;

    let employee = this.searchForm.get('empId')?.value;
    let organisation = this.searchForm.get('orgId')?.value;
    let month = this.searchForm.get('monthId')?.value;

    this.userService.getQuestionPaper(`uspGetEmployeeSalarySlip|orgId=${organisation}|empId=${employee}|monthId=${month}`).subscribe((res: any) => {
      this.isLoading = false;
      if (Object.keys(res).length === 0 || !res['table'] || res['table'].length === 0) {
        this.noDatafoundCard = true;
      } else {
        this.tblData = res['table'];
        this.salarySlipPrintData = res['table1'];
        if (this.tblData.length > 0) {
          this.tableHeaders = Object.keys(this.tblData[0]);
        }
      }
    }, (err: HttpErrorResponse) => {
      this.isLoading = false;
      this.handleError(err);
    });
  }

  handleError(err: HttpErrorResponse) {
    if (err.status === 403) {
      // Handle login route or error
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
    }
  }

  onOpenPrintModal() {
    if (this.tblData.length > 0 && this.salarySlipPrintData && this.salarySlipPrintData.length > 0) {
      this.generatePrintContent();
      this.printDialogVisible = true;
    } else {
      this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'No salary slip data available to print.' });
    }
  }

  getSumOfRow(data: any[], action: string) {
    return data.reduce((accumulator, currentObject) => {
      return currentObject.salaryStructure == action ? accumulator + currentObject['amount'] : accumulator;
    }, 0);
  }

  numberToWords(num: number) {
    if (num === 0) return 'zero';

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'million', 'billion'];

    let words = '';
    let i = 0;

    while (num > 0) {
      if (num % 1000 !== 0) {
        words = helper(num % 1000) + (thousands[i] ? ' ' + thousands[i] : '') + ' ' + words;
      }
      num = Math.floor(num / 1000);
      i++;
    }

    function helper(n: number): string {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + helper(n % 100) : '');
    }

    return words.trim().charAt(0).toUpperCase() + words.slice(1);
  }

  generatePrintContent() {
    let employeeData = this.tblData[0];
    let earningComponents = this.salarySlipPrintData?.filter(row => row.salaryStructure == 'Earnings') || [];
    let deductionComponents = this.salarySlipPrintData?.filter(row => row.salaryStructure == 'Deductions') || [];

    let totalEarnings = this.getSumOfRow(this.salarySlipPrintData, "Earnings");
    let totalDeductions = this.getSumOfRow(this.salarySlipPrintData, "Deductions");
    let netPay = (totalEarnings - totalDeductions).toFixed(2);

    // Create rows for earnings and deductions side-by-side
    const maxLength = Math.max(earningComponents.length, deductionComponents.length);
    let rowsHtml = '';

    for (let i = 0; i < maxLength; i++) {
      const earning = earningComponents[i];
      const deduction = deductionComponents[i];

      rowsHtml += `
            <tr>
              <td>${earning?.salaryComponent || ''}</td>
              <td style="text-align: right;">${earning ? earning.amount.toFixed(2) : ''}</td>
              <td>${deduction?.salaryComponent || ''}</td>
              <td style="text-align: right;">${deduction ? deduction.amount.toFixed(2) : ''}</td>
            </tr>
        `;
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
             ${employeeData.orgImage ? `<img src="${employeeData.orgImage}" alt="Logo" style="height: 60px; margin-bottom: 10px;">` : ''}
             <h2 style="margin: 5px 0;">${employeeData['organisation']}</h2>
             <div style="font-size: 14px;">${employeeData['orgAddress']}</div>
             <h3 style="margin-top: 15px; text-decoration: underline;">Payslip for ${employeeData['month']} ${employeeData['year']}</h3>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 5px; font-weight: bold;">Name:</td>
              <td style="padding: 5px;">${employeeData['employee']}</td>
              <td style="padding: 5px; font-weight: bold;">Employee No:</td>
              <td style="padding: 5px;">${employeeData['empCode']}</td>
            </tr>
            <tr>
              <td style="padding: 5px; font-weight: bold;">Designation:</td>
              <td style="padding: 5px;">${employeeData['designation']}</td>
              <td style="padding: 5px; font-weight: bold;">Bank Name:</td>
              <td style="padding: 5px;">${employeeData['bankName']}</td>
            </tr>
            <tr>
              <td style="padding: 5px; font-weight: bold;">Department:</td>
              <td style="padding: 5px;">${employeeData['department']}</td>
              <td style="padding: 5px; font-weight: bold;">Bank A/c No:</td>
              <td style="padding: 5px;">${employeeData['bankAcNo']}</td>
            </tr>
            <tr>
              <td style="padding: 5px; font-weight: bold;">Location:</td>
              <td style="padding: 5px;">${employeeData['location']}</td>
              <td style="padding: 5px; font-weight: bold;">PAN No:</td>
              <td style="padding: 5px;">${employeeData['panNo']}</td>
            </tr>
            <tr>
              <td style="padding: 5px; font-weight: bold;">Effective Days:</td>
              <td style="padding: 5px;">${employeeData['totalDays']}</td>
              <td style="padding: 5px; font-weight: bold;">UAN No:</td>
              <td style="padding: 5px;">${employeeData['uanNo']}</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #ccc;">
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 8px; border: 1px solid #ccc; text-align: left;">Earnings</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: right;">Amount</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: left;">Deductions</th>
              <th style="padding: 8px; border: 1px solid #ccc; text-align: right;">Amount</th>
            </tr>
            ${rowsHtml}
            <tr style="background-color: #f9f9f9; font-weight: bold;">
              <td style="padding: 8px; border: 1px solid #ccc;">Total Earnings</td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${totalEarnings.toFixed(2)}</td>
              <td style="padding: 8px; border: 1px solid #ccc;">Total Deductions</td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${totalDeductions.toFixed(2)}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; font-size: 14px; font-weight: bold;">
            Net Pay: INR ${netPay} <br>
            <span style="font-weight: normal;">(Rupees ${this.numberToWords(Number(netPay))} Only)</span>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; font-style: italic; color: #666;">
            This is a system generated payslip and does not require a signature.
          </div>
        </div>
    `;

    this.printContentSafe = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  printPoData() {
    // Logic to print the content safely
    let printContents = document.getElementById('poPrintWrapper')?.innerHTML;
    if (printContents) {
      let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
            <html>
              <head>
                <title>Print Payslip</title>
                <style>
                  body { font-family: Arial, sans-serif; }
                  table { width: 100%; border-collapse: collapse; }
                  td, th { border: 1px solid #ccc; padding: 5px; }
                  @media print {
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body onload="window.print();window.close()">${printContents}</body>
            </html>`);
        popupWin.document.close();
      }
    }
  }

  downloadProtectedPdf() {
    this.isLoading = true;
    let employeeData = this.tblData[0];
    let employeeName = employeeData['employee'];
    // Assuming password logic remains same - DOB or similar. 
    // If not available in this.tblData[0].dob, you might need to fetch or use default.
    // The previous code used this.tblData[0].dob
    const password = employeeData.dob || '123456';
    const htmlString = document.getElementById('poPrintWrapper')?.innerHTML || '';

    if (htmlString) {
      this.pdfService.generatePdfFromHtmlString(htmlString, password, employeeName);
    }

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
