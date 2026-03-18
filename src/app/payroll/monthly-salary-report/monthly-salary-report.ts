import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbModule } from 'primeng/breadcrumb';

// Services 
import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';

@Component({
  selector: 'app-monthly-salary-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    BreadcrumbModule
  ],
  providers: [MessageService, ConfirmationService, ExcelService],
  templateUrl: './monthly-salary-report.html',
  styleUrl: './monthly-salary-report.scss'
})
export class MonthlySalaryReport implements OnInit, AfterViewChecked {

  monthlySalaryReportForm: FormGroup;

  // Dropdowns
  organisation: any[] = [];
  monthDrp: any[] = [];
  Year: any[] = [];
  projectDataDrp: any[] = [];

  // Table Data
  tblData: any[] = [];
  tableHeaders: string[] = [];
  loading: boolean = false;
  noDatafoundCard: boolean = false;
  showTabledata: boolean = false;

  // UI
  breadcrumbItems: any[] = [];
  menulabel: string = '';
  FormName: string = '';
  FormValue: string = '';
  selectedItem: any = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private excelService: ExcelService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    this.monthlySalaryReportForm = this.fb.group({
      monthId: ['', Validators.required],
      orgId: ['', Validators.required],
      yearId: ['', Validators.required],
      ProjectDetails: ['']
    });
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    const param = sessionStorage.getItem("menuItem");
    if (param) {
      const paramjs = JSON.parse(param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: this.menulabel },
        { label: this.FormName }
      ];
    }

    this.loadDropdowns();
  }

  loadDropdowns() {
    this.getOrgData();
    this.getmonthData();
    this.getYearData();
    this.getProjectDrp();
  }

  get f() { return this.monthlySalaryReportForm.controls; }

  getOrgData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=ORG').subscribe({
      next: (res: any) => {
        this.organisation = res['table'];
      },
      error: (err: HttpErrorResponse) => this.handleError(err)
    });
  }

  getmonthData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=MONTH').subscribe({
      next: (res: any) => {
        this.monthDrp = res['table'];
      },
      error: (err: HttpErrorResponse) => this.handleError(err)
    });
  }

  getYearData() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblYearMaster|appUserId=${sessionStorage.getItem('userId')}`)
      .subscribe({
        next: (res: any) => {
          this.Year = res['table'];
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
  }

  getProjectDrp() {
    const districtId = sessionStorage.getItem('District');
    const userId = sessionStorage.getItem('userId');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=COSTCENTER|id=0|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          this.projectDataDrp = res['table'] || [];
        },
        error: (err: HttpErrorResponse) => this.handleError(err)
      });
  }

  onSearch() {
    if (this.monthlySalaryReportForm.invalid) {
      this.monthlySalaryReportForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Validation', detail: 'Please fill all required fields.' });
      return;
    }

    this.loading = true;
    this.showTabledata = true;
    this.noDatafoundCard = false;
    this.tblData = [];

    const f = this.monthlySalaryReportForm.value;
    const projectDetailId = f.ProjectDetails || 0;

    this.userService.getQuestionPaper(`uspGetMonthlyPrepSalaryData|orgId=${f.orgId}|month=${f.monthId}|year=${f.yearId}|projectDetailId=${projectDetailId}`)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          // IMPORTANT: Check API response structure. 
          // Previous code checked Object.keys(res).length === 0, then res['table'].
          if (!res || (Object.keys(res).length === 0) || !res['table'] || res['table'].length === 0) {
            this.noDatafoundCard = true;
          } else {
            this.tblData = res['table'];
            if (this.tblData.length > 0) {
              this.tableHeaders = Object.keys(this.tblData[0]);
            }
          }
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.handleError(err);
          this.cdr.detectChanges();
        }
      });
  }

  onReset() {
    this.monthlySalaryReportForm.reset();
    this.showTabledata = false;
    this.noDatafoundCard = false;
    this.tblData = [];
  }

  onDelete(data: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteRecord(data);
      }
    });
  }

  deleteRecord(data: any) {
    this.loading = true;
    const payload = `id=${data.id}|appUserId=${sessionStorage.getItem('userId')}`;

    this.userService.SubmitPostTypeData(`uspDeleteMonthlyPrepSalary`, payload, this.FormName).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res === "Data Saved.-success") {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Deleted successfully' });
          this.onSearch();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: res });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  exportAsXLSXCustom(): void {
    if (this.tblData.length > 0) {
      this.excelService.exportAsExcelFile(this.tblData, this.FormName.toString());
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Export', detail: 'No data to export' });
    }
  }

  handleError(err: HttpErrorResponse) {
    if (err.status === 403) {
      // this.Customvalidation.loginroute(err.status);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'An error occurred' });
    }
  }
}
