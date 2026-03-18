import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, tap } from 'rxjs';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';


import { UserService } from '../../shared/user-service';
import { TableColumn, TableTemplate } from '../../table-template/table-template';

@Component({
  selector: 'app-bonus-accural',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    ButtonModule,
    BreadcrumbModule,
    DrawerModule,
    TooltipModule,
    SelectModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialog,
    TableTemplate,
    PopoverModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './bonus-accural.html',
  styleUrl: './bonus-accural.scss'
})
export class BonusAccural implements OnInit {

  priceListForm!: FormGroup;

  breadcrumbItems = [
    { label: 'Home', url: '/home' },
    { label: 'Compensation Benefits', url: '/compensation-benefits' },
    { label: 'Bonus Accural', url: '/bonus-accural' }
  ];

  visible = false;
  drawerSize = '60%';
  loading = false;

  FormName = '';
  FormValue: any;
  menulabel = '';
  postType = 'add';
  paramvaluedata = '';
  totalCount = 0;
  isLoading = false;

  organizationDrp: any[] = [];
  projectDrp: any[] = [];
  monthDrp: any[] = [];
  yearDrp: any[] = [];

  bonusAccrualData: any[] = [];
  searchText = '';
  pageNo = 1;
  pageSize = 10;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const param = sessionStorage.getItem('menuItem');
    if (param) {
      const paramjs = JSON.parse(param);
      this.FormName = paramjs?.formName;
      this.FormValue = paramjs?.formValue;
      this.menulabel = paramjs?.menu;
    }

    this.initForm();
    this.getViewData(true);
  }


  //     {
  //     "org": "Nobilitas Infotech Private Limited",
  //     "employee": "Mausam Tyagi",
  //     "bonusFromDate": "2025-01-01T00:00:00",
  //     "bonusToDate": "2026-02-28T00:00:00",
  //     "bonusAmount": 9718.0,
  //     "isEligible": false
  // }
  columns: TableColumn[] = [
    { key: 'actions', header: 'Action', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'org', header: 'org', isVisible: true, isSortable: true },
    { key: 'employee', header: 'employee', isVisible: true, isSortable: true },
    { key: 'bonusFromDate', header: 'bonusFromDate', isVisible: true, isSortable: true },
    { key: 'bonusToDate', header: 'bonusToDate', isVisible: true, isSortable: true },
    { key: 'bonusAmount', header: 'bonusAmount', isVisible: true, isSortable: true },
    { key: 'isEligible', header: 'isEligible', isVisible: true, isSortable: true },
  ];

  initForm() {
    this.priceListForm = this.fb.group({
      organizationId: [null, Validators.required],
      projectId: [null, Validators.required],
      fromMonthId: [null, Validators.required],
      toMonthId: [null, Validators.required],
      fromYearId: [null, Validators.required],
      toYearId: [null, Validators.required]
    });
  }

  getViewData(data: any) {
    this.userService
      .getQuestionPaper(
        `uspGetBonusAccrualData|searchText=${this.searchText}` +
        `|pageIndex=${this.pageNo}` +
        `|size=${this.pageSize}` +
        `|districtId=${sessionStorage.getItem('District')}` +
        `|appUserId=${sessionStorage.getItem('userId')}` +
        `|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`
      )
      .subscribe({
        next: (res: any) => {
          this.bonusAccrualData = res?.table1 || [];
          this.totalCount = res?.table[0]?.totalCnt || 0;
          this.bonusAccrualData.forEach((item, index) => {
            item['rowNo'] = (this.pageNo - 1) * this.pageSize + index + 1;
          });
        },
        error: err => console.error(err)
      });
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getViewData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getViewData(false);
  }


  loadDropdowns() {
    this.loading = true;
    return forkJoin({
      organizations: this.userService.getQuestionPaper(
        `uspGetFillDrpDown|table=tblOrgMaster`
      ),
      months: this.userService.getQuestionPaper(
        `uspGetFillDrpDown|table=tblMonthMaster`
      ),
      years: this.userService.getQuestionPaper(
        `uspGetFillDrpDown|table=tblYearMaster`
      ),
      projects: this.userService.getQuestionPaper(
        `uspGetExpanseMaster|action=COSTCENTER|id=0` +
        `|districtId=${sessionStorage.getItem('District')}` +
        `|appUserId=${sessionStorage.getItem('userId')}` +
        `|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`
      )
    })
      .pipe(
        finalize(() => (this.loading = false)),
        tap(res => {
          this.organizationDrp = res.organizations?.table || [];
          this.monthDrp = res.months?.table || [];
          this.yearDrp = res.years?.table || [];
          this.projectDrp = res.projects?.table || [];
        })
      );
  }

  onSubmitCall() {
    if (this.priceListForm.invalid) {
      Object.keys(this.priceListForm.controls).forEach(key => {
        const control = this.priceListForm.get(key);
        control?.markAsTouched();
        control?.markAsDirty();
        control?.updateValueAndValidity();
      });
      return;
    }

    const fromYear = +this.priceListForm.get('fromYearId')?.value!;
    const toYear = +this.priceListForm.get('toYearId')?.value!;
    const fromMonth = +this.priceListForm.get('fromMonthId')?.value!;
    const toMonth = +this.priceListForm.get('toMonthId')?.value!;

    if (toYear < fromYear || (toYear === fromYear && toMonth < fromMonth)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert!',
        detail: 'To Month/Year must be greater than or equal to From Month/Year.'
      });
      return;
    }

    this.paramvaluedata =
      `orgId=${this.priceListForm.get('organizationId')?.value}` +
      `|projectDetailId=${this.priceListForm.get('projectId')?.value}` +
      `|fromYear=${this.priceListForm.get('fromYearId')?.value}` +
      `|fromMonth=${this.priceListForm.get('fromMonthId')?.value}` +
      `|toYear=${this.priceListForm.get('toYearId')?.value}` +
      `|toMonth=${this.priceListForm.get('toMonthId')?.value}` +
      `|appUserId=${sessionStorage.getItem('userId')}`;

    this.confirmationService.confirm({
      message: 'Are you sure you want to proceed?',
      header: 'Confirm?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.submitcall();
      }
    });
  }

  submitcall() {
    if (this.loading) {
      return;
    }
    this.loading = true;

    const SP = 'uspPostEmpBonusCalculation';

    this.userService
      .SubmitPostTypeData(SP, this.paramvaluedata, this.FormName)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (datacom: any) => {
          if (datacom) {
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success' || datacom.includes('success')) {
              this.getViewData(false);
              this.visible = false;
              this.priceListForm.reset();

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data Saved Successfully.'
              });

            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: datacom
              });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong!'
            });
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'You are not authorized!' });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'An error occurred' });
          }
        }
      });
  }
  header = '';
  headerIcon = '';

  showDialog(mode: string = 'add', data: any = null) {
    this.postType = mode;
    this.visible = true;

    if (mode === 'add') {
      this.header = 'Add Bonus Accrual';
      this.headerIcon = 'pi pi-plus-circle';
      this.priceListForm.enable();
      this.priceListForm.reset();
    } else if (mode === 'view') {
      this.header = 'View Bonus Accrual';
      this.headerIcon = 'pi pi-eye';
      this.priceListForm.disable();
    }

    this.loadDropdowns().subscribe(() => {
      if (mode === 'view' && data) {
        let fromMonth = data.fromMonthId;
        let fromYear = data.fromYearId;
        let toMonth = data.toMonthId;
        let toYear = data.toYearId;

        if (!fromMonth && data.bonusFromDate) {
          const date = new Date(data.bonusFromDate);
          fromMonth = date.getMonth() + 1;
          fromYear = date.getFullYear();
        }

        if (!toMonth && data.bonusToDate) {
          const date = new Date(data.bonusToDate);
          toMonth = date.getMonth() + 1;
          toYear = date.getFullYear();
        }

        this.priceListForm.patchValue({
          organizationId: data.organizationId || data.orgId, // Try both keys
          projectId: data.projectId || data.projectDetailId,
          fromMonthId: fromMonth,
          toMonthId: toMonth,
          fromYearId: fromYear,
          toYearId: toYear
        });
      }
    });
  }


  onClose() {
    this.visible = false;
  }

  onDrawerHide() {
    this.visible = false;
  }

  toggleFullScreen() {
    this.drawerSize = this.drawerSize === '60%' ? '100%' : '60%';
  }

  onReset() {
    this.priceListForm.reset();
  }

  onSearch() {
    this.pageNo = 1;
    this.getViewData(false);
  }
}
