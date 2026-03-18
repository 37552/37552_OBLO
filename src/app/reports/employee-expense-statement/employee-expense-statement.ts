import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Customvalidation } from '../../shared/Validation';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from '../../shared/user-service';
import { TooltipModule } from 'primeng/tooltip';
import { ExcelService } from '../../shared/excel.service';

@Component({
  selector: 'app-employee-expense-statement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbModule,
    TableModule,
    TableTemplate,
    ButtonModule,
    TabsModule,
    SelectModule,
    CardModule,
    CheckboxModule,
    InputTextModule,
    InputNumberModule,
    IftaLabelModule,
    ReactiveFormsModule,
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [DatePipe, MessageService, ConfirmationService, ExcelService],
  templateUrl: './employee-expense-statement.html',
  styleUrl: './employee-expense-statement.scss'
})
export class EmployeeExpenseStatement implements OnInit {
  constructor(
    private userService: UserService,
    private datePipe: DatePipe,
    private Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private excelService: ExcelService,
  ) { }

  breadcrumbItems: MenuItem[] = [
    { label: 'Home', icon: 'pi pi-home', routerLink: '/home' },
    { label: 'Reports', icon: 'pi pi-file-o', routerLink: '/reports' },
    { label: 'Employee Expense Statement', icon: 'pi pi-file-o', routerLink: '/employee-expense-statement' },
  ];

  param: string = '';
  menulabel: string = '';
  formlable: string = '';

  EmployeeDrp: any[] = [];
  isSearchingEmployees: boolean = false;
  filterForm: FormGroup = new FormGroup({
    employeeId: new FormControl('0', [Validators.required]),
    fromDate: new FormControl(null, [Validators.required]),
    toDate: new FormControl(null, [Validators.required]),
  });

  showtableData: boolean = false;
  noDataFound: boolean = false;
  display: string = 'none';

  allViewTableDatawallet: any[] = [];
  filteredViewTableDatawallet: any[] = [];
  totalAmount: number = 0;

  expenseTableColumns: TableColumn[] = [
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'date', header: 'Date', isVisible: true, isSortable: false },
    { key: 'refNo', header: 'Ref No', isVisible: true, isSortable: false },
    { key: 'amount', header: 'Amount', isVisible: true, isSortable: false },
  ];

  expenseTableData: any[] = [];
  allExpenseTableData: any[] = [];

  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') || '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.formlable = paramjs.formName;
    this.getDrpData();
  }

  getDrpData() {
    this.userService
      .getQuestionPaper(
        `uspGetFillDrpDown|table=tblEmployeeMaster|appUserId=${sessionStorage.getItem('userId')}`,
      )
      .subscribe(
        (res: any) => {
          this.EmployeeDrp = res['table'];
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 1000);
        },
        (err: HttpErrorResponse) => {
          this.EmployeeDrp = [];
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
          this.cdr.detectChanges();
        }
      );
  }

  onFromDateSelected(date: Date) {
    const fromDate = date;
    this.filterForm.patchValue({ fromDate });

    const toDate = this.filterForm.get('toDate')?.value;
    if (toDate && fromDate && toDate < fromDate) {
      this.filterForm.patchValue({ toDate: null });
    }
  }

  onToDateSelected(date: Date) {
    const toDate = date;
    this.filterForm.patchValue({ toDate });
  }

  transformWalletData(apiData: any[]): any[] {
    if (!apiData || apiData.length === 0) return [];

    return apiData.map((item, index) => {
      return {
        sno: index + 1,
        purpose: item.purpose || '',
        amount: Number(item.amount) || 0,
        refNo: item.refNo || '',
        date: item.date || '',
      };
    });
  }

  getFilterData(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields.',
      });
      return;
    }

    const { employeeId, fromDate, toDate } = this.filterForm.value;

    const formattedFromDate = fromDate
      ? this.datePipe.transform(fromDate, 'yyyy-MM-dd')
      : '';
    const formattedToDate = toDate
      ? this.datePipe.transform(toDate, 'yyyy-MM-dd')
      : '';

    if (!employeeId || employeeId === '0' || employeeId === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please select an Employee.',
      });
      return;
    }

    if (!formattedFromDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please select From Date.',
      });
      return;
    }

    if (!formattedToDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please select To Date.',
      });
      return;
    }

    if (formattedFromDate && formattedToDate && new Date(formattedFromDate) > new Date(formattedToDate)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'From Date cannot be greater than To Date.',
      });
      return;
    }

    let selectedOption = this.EmployeeDrp.find(
      (option) => option.drpValue == employeeId,
    );
    let extractedUserId = sessionStorage.getItem('userId');

    if (selectedOption && selectedOption.drpOption) {
      const drpOptionParts = selectedOption.drpOption.split('-');
      if (drpOptionParts.length > 1) {
        extractedUserId = drpOptionParts[1].trim();
      }
    } else if (employeeId && employeeId !== '0') {
      extractedUserId = String(employeeId);
    }

    this.showtableData = true;
    this.noDataFound = true;
    let query = `uspGetEmployeeWallet|appUserId=${extractedUserId}|action=WALLET`;
    query += `|dateFrom=${formattedFromDate}`;
    query += `|dateTo=${formattedToDate}`;

    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        if (!res || !res['table'] || res['table'].length === 0) {
          this.totalAmount = 0;
        } else {
          const walletData = res['table'][0];
          this.totalAmount =
            walletData?.amt || walletData?.Amount || walletData?.amount || 0;
        }
      },
      (err: HttpErrorResponse) => {
        this.totalAmount = 0;
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
          this.messageService.add({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Your session has expired. Please login again.',
          });
        }
      },
    );
    let query1 = `uspGetEmployeeWallet|appUserId=${extractedUserId}|action=WALLETDETAIL`;
    query1 += `|dateFrom=${formattedFromDate}`;
    query1 += `|dateTo=${formattedToDate}`;

    this.userService.getQuestionPaper(query1).subscribe(
      (res: any) => {
        if (!res || !res['table'] || res['table'].length === 0) {
          this.showtableData = true;
          this.allViewTableDatawallet = [];
          this.filteredViewTableDatawallet = [];
          this.allExpenseTableData = [];
          this.expenseTableData = [];
          this.totalCount = 0;
          this.noDataFound = true;
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No records found for the selected filters.',
          });
        } else {
          this.showtableData = true;
          this.allViewTableDatawallet = this.transformWalletData(res['table']);
          this.filteredViewTableDatawallet = [...this.allViewTableDatawallet];
          this.allExpenseTableData = this.allViewTableDatawallet;
          this.totalCount = this.allExpenseTableData.length;
          this.pageNo = 1; // Reset to first page
          this.updatePaginatedData();
          this.noDataFound = false;
        }
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        this.showtableData = true;
        this.noDataFound = true;
        this.allExpenseTableData = [];
        this.expenseTableData = [];
        this.totalCount = 0;
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
          this.messageService.add({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Your session has expired. Please login again.',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to load data.',
          });
        }
        this.cdr.detectChanges();
      },
    );
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.updatePaginatedData();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1; // Reset to first page
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const start = (this.pageNo - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.expenseTableData = this.allExpenseTableData.slice(start, end);
    this.cdr.detectChanges();
  }

  confirmExportExcel(): void {
    if (!this.allExpenseTableData || this.allExpenseTableData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to export.',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Export Excel',
      message: 'Do you want to export this report as Excel?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.exportAsXLSX();
      },
    });
  }

  private exportAsXLSX(): void {
    const { employeeId } = this.filterForm.value;

    if (!employeeId || employeeId === '0' || employeeId === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please select an Employee.',
      });
      return;
    }

    let selectedOption = this.EmployeeDrp.find(
      (option) => option.drpValue == employeeId,
    );
    let extractedUserId = sessionStorage.getItem('userId');

    if (selectedOption && selectedOption.drpOption) {
      const drpOptionParts = selectedOption.drpOption.split('-');
      if (drpOptionParts.length > 1) {
        extractedUserId = drpOptionParts[1].trim();
      }
    } else if (employeeId && employeeId !== '0') {
      extractedUserId = String(employeeId);
    }

    const { fromDate, toDate } = this.filterForm.value;
    const formattedFromDate = fromDate
      ? this.datePipe.transform(fromDate, 'yyyy-MM-dd')
      : '';
    const formattedToDate = toDate
      ? this.datePipe.transform(toDate, 'yyyy-MM-dd')
      : '';

    const query1 = `uspGetEmployeeWallet|appUserId=${extractedUserId}|action=WALLETDETAIL|dateFrom=${formattedFromDate}|dateTo=${formattedToDate}`;
    this.userService.getQuestionPaper(query1).subscribe(
      (res: any) => {
        if (!res || !res['table'] || res['table'].length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No data available to export.',
          });
        } else {
          const exportData = this.transformWalletData(res['table']);
          const fileName = this.formlable || 'Employee Expense Statement';
          this.excelService.exportAsExcelFile(exportData, fileName);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Excel file exported successfully.',
          });
        }
      },
      (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
          this.messageService.add({
            severity: 'error',
            summary: 'Unauthorized',
            detail: 'Your session has expired. Please login again.',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to export data.',
          });
        }
      },
    );
  }
}
