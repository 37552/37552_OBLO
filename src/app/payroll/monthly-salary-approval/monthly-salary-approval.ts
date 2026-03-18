import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// PrimeNG Imports
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select'; // Using SelectModule as per user's requests
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

// Services
import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';

@Component({
  selector: 'app-monthly-salary-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BreadcrumbModule,
    ButtonModule,
    TableModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    InputTextModule,
  ],
  providers: [MessageService, ConfirmationService, DatePipe, ExcelService],
  templateUrl: './monthly-salary-approval.html',
  styleUrls: ['./monthly-salary-approval.scss'],
})
export class MonthlySalaryApproval implements OnInit {
  // Breadcrumb & Menu
  breadcrumbItems: any[] = [];
  menulabel: string = '';
  FormName: string = '';
  FormValue: string = '';
  param: any;

  // Form
  monthlySalaryReportForm: FormGroup;

  // Dropdowns
  organisation: any[] = [];
  monthDrp: any[] = [];
  YearId: any[] = [];
  projectDataDrp: any[] = [];

  // Table Data
  tblData: any[] = [];
  tableHeaders: string[] = [];
  selectedProducts: any[] = []; // For checkbox selection
  selectAllChecked: boolean = false;

  // UI State
  loading: boolean = false;
  showTabledata: boolean = false;
  noDatafoundCard: boolean = false;

  constructor(
    private userService: UserService,
    private excelService: ExcelService,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {
    this.monthlySalaryReportForm = this.fb.group({
      monthId: ['', Validators.required],
      YearId: ['', Validators.required],
      organisationId: ['', Validators.required],
      projectId: [''],
    });
  }

  get f() {
    return this.monthlySalaryReportForm.controls;
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      try {
        let paramjs = JSON.parse(this.param);
        this.FormName = paramjs.formName;
        this.FormValue = paramjs.formValue;
        this.menulabel = paramjs.menu;

        this.breadcrumbItems = [
          { label: 'Home', routerLink: '/home' },
          { label: this.menulabel },
          { label: this.FormName, disabled: true },
        ];
      } catch (e) {
        console.error('Error parsing menu item', e);
      }
    }

    this.getOrgData();
    this.getmonthData();
    this.getProjectDrp();
    this.getYearData();
  }

  getOrgData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=ORG').subscribe({
      next: (res: any) => {
        this.organisation = res['table'] || [];
      },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }

  getProjectDrp() {
    const userId = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=COSTCENTER|id=0|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`,
      )
      .subscribe({
        next: (res: any) => {
          this.projectDataDrp = res['table'] || [];
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  getmonthData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=MONTH').subscribe({
      next: (res: any) => {
        this.monthDrp = res['table'] || [];
      },
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }

  getYearData() {
    this.userService
      .getQuestionPaper(
        `uspGetFillDrpDown|table=tblYearMaster|appUserId=${sessionStorage.getItem('userId')}`,
      )
      .subscribe({
        next: (res: any) => {
          this.YearId = res['table'] || [];
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  onSearch() {
    if (this.monthlySalaryReportForm.invalid) {
      this.monthlySalaryReportForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    let month = this.monthlySalaryReportForm.get('monthId')?.value;
    let orgId = this.monthlySalaryReportForm.get('organisationId')?.value;
    let year = this.monthlySalaryReportForm.get('YearId')?.value;
    let projectDetailId = this.monthlySalaryReportForm.get('projectId')?.value || 0;

    this.showTabledata = true;
    this.noDatafoundCard = false;
    this.tblData = [];
    this.selectedProducts = [];

    this.userService
      .getQuestionPaper(
        `uspGetMonthlyPrepSalaryForApproval|orgId=${orgId}|month=${month}|year=${year}|projectDetailId=${projectDetailId}`,
      )
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          if (!res || Object.keys(res).length === 0 || !res['table'] || res['table'].length === 0) {
            this.noDatafoundCard = true;
          } else {
            // Add isChk property and filter logic
            this.tblData = res['table'].map((obj: any) => ({ ...obj, isChk: false }));
            if (this.tblData.length > 0) {
              this.tableHeaders = Object.keys(this.tblData[0]).filter(
                (key) => key !== 'isChk' && key !== 'id' && key !== 'isApproved',
              );
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.handleError(err);
        },
      });
  }

  onreset() {
    this.monthlySalaryReportForm.reset();
    this.showTabledata = false;
    this.tblData = [];
    this.noDatafoundCard = false;
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.checked;
    this.tblData.forEach((row) => {
      if (!row.isApproved) {
        row.isChk = isChecked;
      }
    });
    this.selectedProducts = isChecked ? this.tblData.filter((r) => !r.isApproved) : [];
  }

  onCheckboxChange(item: any): void {
    const allCheckable = this.tblData.filter((r) => !r.isApproved);
    this.selectAllChecked = allCheckable.length > 0 && allCheckable.every((r) => r.isChk);
  }

  onSubmitCall() {
    const selectedItems = this.tblData.filter(
      (obj) => obj.isChk === true && obj.isApproved === false,
    );

    if (selectedItems.length == 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Please check at least one row',
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to Submit?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.onSubmit(selectedItems);
      },
    });
  }

  onSubmit(selectedItems: any[]) {
    this.loading = true;

    let result = selectedItems.map((obj) => obj.id).join(',');
    let query = `id=${result}|appUserId=${sessionStorage.getItem('userId')}`;

    this.userService
      .SubmitPostTypeData(`uspApproveMonthlyPrepSalary`, query, this.FormName)
      .subscribe({
        next: (datacom: any) => {
          this.loading = false;

          if (datacom != '') {
            const resultarray = datacom.split('-');
            if (resultarray[1] == 'success') {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data Saved Successfully.',
              });
              this.onSearch(); // Refresh data
            } else if (resultarray[0] == '2') {
              this.messageService.add({
                severity: 'warn',
                summary: 'Alert',
                detail: resultarray[1],
              });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: datacom });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong!',
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.handleError(err);
        },
      });
  }

  handleError(err: HttpErrorResponse) {
    if (err.status == 401) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You are not authorized!',
      });
    } else if (err.status == 403) {
      this.router.navigate(['/login']);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'An error occurred',
      });
    }
  }
  // Helpers for template to avoid arrow functions in bindings
  get allApproved(): boolean {
    return this.tblData.length > 0 && this.tblData.every((r) => r.isApproved);
  }

  get hasSelectedForApproval(): boolean {
    return this.tblData.some((r) => r.isChk && !r.isApproved);
  }
}
