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
import { Subject } from 'rxjs';
import { Customvalidation } from '../../shared/Validation';
import { ImprestPdfService } from '../../shared/imprestpdf.service';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from '../../shared/user-service';
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-employee-imprest-history',
  standalone: true,
  imports: [CommonModule,
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
    BreadcrumbModule,
    DatePickerModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [DatePipe, MessageService, ConfirmationService],
  templateUrl: './employee-imprest-history.html',
  styleUrl: './employee-imprest-history.scss'
})
export class EmployeeImprestHistory implements OnInit {
  constructor(
    private userService: UserService,
    private datePipe: DatePipe,
    private PdfService: ImprestPdfService,
    private Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }


  breadcrumbItems: MenuItem[] = [
    { label: 'Home', icon: 'pi pi-home', routerLink: '/home' },
    { label: 'Reports', icon: 'pi pi-file-o', routerLink: '/reports' },
    { label: 'Employee Imprest History', icon: 'pi pi-file-o', routerLink: '/employee-imprest-history' },
  ];

  param: string = '';
  menulabel: string = '';
  formlable: string = '';

  materialRequestDrp: any[] = [];
  filterForm: FormGroup = new FormGroup({
    employeeId: new FormControl('0', [Validators.required]),
    fromDate: new FormControl(null, [Validators.required]),
    toDate: new FormControl(null, [Validators.required]),
  });

  showtableData: boolean = false;
  noDataFound: boolean = false;
  display: string = 'none';

  orgInfo: any = null;
  summaryData: any = null;
  imprestDetails: any[] = [];
  totalDebit: number = 0;
  totalCredit: number = 0;
  closingbalnce: number = 0;
  totalAmount: any = 0;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  imprestTableColumns: TableColumn[] = [
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'name', header: 'Name', isVisible: true, isSortable: false },
    { key: 'empCode', header: 'Employee Code', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'dR_Amount', header: 'Debit', isVisible: true, isSortable: false },
    { key: 'cR_Amount', header: 'Credit', isVisible: true, isSortable: false },
  ];

  imprestTableData: any[] = [];
  allImprestTableData: any[] = [];
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
          this.materialRequestDrp = res['table'] || [];
        },
        (_err: HttpErrorResponse) => {
          this.materialRequestDrp = [];
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

  transformImprestData(apiRows: any[]): any[] {
    if (!apiRows || apiRows.length === 0) return [];

    return apiRows.map((r, index) => {
      return {
        id: r.id ?? '',
        sno: index + 1,
        name: r.name ?? '',
        empCode: r.empCode ?? '',
        purpose: r.purpose ?? '',
        opBalance: Number(r.opBalance) || 0,
        dR_Amount: Number(r.dR_Amount) || 0,
        cR_Amount: Number(r.cR_Amount) || 0,
        closingBalance: r.closingBalance ?? '',
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

    this.showtableData = true;
    this.noDataFound = true;

    let query = `uspReportEmployeeImprest`;
    query += `|fromDate=${formattedFromDate}`;
    query += `|toDate=${formattedToDate}`;
    query += `|empHeadId=${employeeId}`;

    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        this.orgInfo = null;
        this.summaryData = null;
        this.imprestDetails = [];
        this.totalDebit = 0;
        this.totalCredit = 0;
        this.closingbalnce = 0;
        this.totalAmount = 0;
        this.noDataFound = true;

        if (!res || Object.keys(res).length === 0) {
          this.noDataFound = true;
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No records found for the selected filters.',
          });
          return;
        }

        if (res['table'] && res['table'].length > 0) {
          this.orgInfo = res['table'][0];
        }

        if (res['table1'] && res['table1'].length > 0) {
          this.summaryData = res['table1'][0];
        }

        if (res['table2'] && res['table2'].length > 0) {
          this.imprestDetails = this.transformImprestData(res['table2']);
          this.allImprestTableData = this.imprestDetails; // Store all data
          this.totalCount = this.allImprestTableData.length;
          this.pageNo = 1; // Reset to first page
          this.updatePaginatedData(); // Update paginated data
          this.totalDebit = this.imprestDetails.reduce(
            (s, r) => s + (Number(r.dR_Amount) || 0),
            0,
          );
          this.totalCredit = this.imprestDetails.reduce(
            (s, r) => s + (Number(r.cR_Amount) || 0),
            0,
          );
          this.closingbalnce = this.imprestDetails.reduce(
            (s, r) => s + (Number(r.cR_Amount) || 0),
            0,
          );
          this.noDataFound = false;
        } else {
          this.allImprestTableData = [];
          this.imprestTableData = [];
          this.totalCount = 0;
          this.noDataFound = true;
          this.cdr.detectChanges();
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No records found for the selected filters.',
          });
        }

        if (res['table'] && res['table'].length > 0) {
          const walletData = res['table'][0];
          this.totalAmount =
            walletData?.amt ||
            walletData?.Amount ||
            walletData?.amount ||
            this.totalAmount;
          this.cdr.detectChanges();
        }
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        this.showtableData = true;
        this.noDataFound = true;
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
      }
    );

    this.cdr.detectChanges();
  }

  confirmGeneratePDF(): void {
    if (!this.imprestDetails || this.imprestDetails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'There is no data to download as PDF.',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Download PDF',
      message: 'Do you want to download this report as PDF?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.generatePDF();
      },
    });
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
    this.imprestTableData = this.allImprestTableData.slice(start, end);
    this.cdr.detectChanges();
  }

  private generatePDF(): void {
    const { fromDate, toDate } = this.filterForm.value;

    const rawFrom = fromDate ? this.datePipe.transform(fromDate, 'dd-MMM-yyyy') : null;
    const rawTo = toDate ? this.datePipe.transform(toDate, 'dd-MMM-yyyy') : null;

    const formattedFromDate = rawFrom ?? '';
    const formattedToDate = rawTo ?? '';

    this.PdfService.downloadImprestPdf(
      this.orgInfo,
      this.summaryData,
      this.imprestDetails,
      '',
      '',
      '',
      formattedFromDate,
      formattedToDate,
      {
        totalDebit: this.totalDebit,
        totalCredit: this.totalCredit,
      },
      'Imprest Group Summary',
    );
  }
}
