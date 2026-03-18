import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { PopoverModule } from 'primeng/popover';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../shared/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { ExcelService } from '../../shared/excel.service';
import { routes } from '../../app.routes';
import { Login } from '../../login/login';
import { Router } from '@angular/router';

@Component({
  selector: 'app-monthly-salary-components',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    DrawerModule,
    InputTextModule,
    InputNumberModule,
    TableModule,
    SelectModule,
    DatePickerModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    TableTemplate,
    PopoverModule
  ],
  providers: [MessageService, ConfirmationService, DatePipe, ExcelService],
  templateUrl: './monthly-salary-components.html',
  styleUrls: ['./monthly-salary-components.scss']
})
export class MonthlySalaryComponents implements OnInit {

  /** ================= Breadcrumb ================= */
  breadcrumbItems: any[] = [];
  param: any = '';
  FormName = '';
  FormValue = '';
  menulabel = '';

  /** ================= UI ================= */
  visible = false;
  isLoading = false;
  header = '';
  headerIcon = '';
  postType: 'add' | 'update' = 'add';

  /** ================= Form ================= */
  salaryComponent!: FormGroup;

  /** ================= Dropdowns ================= */
  salaryStructureDrp: any[] = [];
  calculationOnBasicDrp: any[] = [];
  calculatedOnDrp: any[] = [];

  /** ================= Table ================= */
  viewData: any[] = [];
  selectedItem: any = null;
  totalCount: number = 0;
  pageNo: number = 1;
  pageSize: number = 10;
  searchText: string = '';

  // Table Columns
  columns: TableColumn[] = [
    { key: 'actions', header: 'Action', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'componentName', header: 'Component Name', isVisible: true, isSortable: false },
    { key: 'slryStrctType', header: 'Structure Type', isVisible: true, isSortable: false },
    { key: 'percentage', header: 'Percentage', isVisible: true, isSortable: false },
    { key: 'calculatedOn', header: 'Calculated On', isVisible: true, isSortable: false },
    { key: 'calculationRate', header: 'Calculation Rate', isVisible: true, isSortable: false },
    { key: 'pf', header: 'PF', isVisible: true, isSortable: false },
    { key: 'esic', header: 'ESIC', isVisible: true, isSortable: false },
    { key: 'effectiveDate', header: 'Effective From', isVisible: true, isSortable: false }
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toast: MessageService,
    private confirmService: ConfirmationService,
    private excelService: ExcelService,
    private cdr: ChangeDetectorRef

  ) { /** Form Init */
    this.salaryComponent = this.fb.group({
      salaryStructureId: ["", Validators.required],
      name: ["", Validators.required],
      calculationOnBasic: [""],
      percentageValue: ["", Validators.pattern('^[0-9]+(\.[0-9]+)?$')],
      calculatioRate: ["", Validators.required],
      effectiveFrom: [""],
      isPf: [false],
      isEsic: [false]
    });
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      const paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;

      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: this.menulabel },
        { label: this.FormName, disabled: true }
      ];
    }

    this.getViewData(true);
  }

  get f() { return this.salaryComponent.controls; }

  showDialog(mode: 'add' | 'update', data?: any): void {
    this.getDrp();
    this.visible = true;
    this.postType = mode;

    if (mode === 'add') {
      this.header = 'Add Monthly Salary Component';
      this.headerIcon = 'pi pi-plus-circle';
      this.salaryComponent.reset({
        isPf: false,
        isEsic: false
      });
      this.selectedItem = null;
    }

    if (mode === 'update' && data) {
      this.header = 'Update Monthly Salary Component';
      this.headerIcon = 'pi pi-pencil';
      this.selectedItem = data;

      this.salaryComponent.patchValue({
        salaryStructureId: data.slryStrctTypeId,
        name: data.componentName,
        calculationOnBasic: data.calculatedOnId,
        percentageValue: data.percentage,
        calculatioRate: data.calculationRateId,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : '',
        isPf: data.pf,
        isEsic: data.esic
      });
    }
  }

  onDrawerHide(): void {
    this.visible = false;
  }

  getDrp(): void {
    this.userService
      .getQuestionPaper('uspGetEmployeeCtcDrp|action=STRUCTURE')
      .subscribe({
        next: (res: any) => {
          this.salaryStructureDrp = res.table || [];
          this.calculationOnBasicDrp = res.table1 || [];
          this.calculatedOnDrp = res.table2 || [];
        },
        error: () => {
          this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dropdowns' });
        }
      });
  }

  getViewData(showSpinner: boolean = true): void {
    if (showSpinner) this.isLoading = true;

    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';

    const query = `uspGetYearlySalaryComponentData|action=MONTHLY|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        this.viewData = res?.table1 || [];
        this.totalCount = res.table?.[0]?.totalCnt || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('API Error:', err);
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
      }
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



  onSubmit(): void {
    if (this.salaryComponent.invalid) {
      this.salaryComponent.markAllAsTouched();
      return;
    }

    this.confirmService.confirm({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.submitCall()
    });
  }

  submitCall(): void {
    this.isLoading = true;
    const form = this.salaryComponent.value;
    const effectiveFrom = form.effectiveFrom ? this.datePipe.transform(form.effectiveFrom, 'yyyy-MM-dd') : '';

    let payload =
      `slryStrctTypeId=${form.salaryStructureId}` +
      `|componentName=${form.name}` +
      `|percentage=${form.percentageValue}` +
      `|calculatedOn=${form.calculationOnBasic}` +
      `|calculationRate=${form.calculatioRate}` +
      `|effectiveDate=${effectiveFrom}` +
      `|pf=${form.isPf ? 1 : 0}` +
      `|esic=${form.isEsic ? 1 : 0}`;

    let sp = 'uspPostYearlySalaryComponent';

    if (this.postType === 'update') {
      const recordId = this.selectedItem?.id || this.selectedItem?.yearlySalaryComponentId || this.selectedItem?.salaryComponentId;

      if (!recordId) {
        this.isLoading = false;
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Record ID is missing. Cannot update.' });
        return;
      }
      sp = 'uspUpdateYearlySalaryComponent';
      payload += `|id=${recordId}|subAction=UPDATE`;
    }

    payload += `|appUserId=${sessionStorage.getItem('userId')}|action=MONTHLY`;

    this.userService.SubmitPostTypeData(sp, payload, this.FormName).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // Check API response format, assuming success based on previous pattern
        if (res && (res.includes('success') || res.includes('Success'))) {
          this.visible = false;
          this.toast.add({ severity: 'success', summary: 'Success', detail: this.postType === 'add' ? 'Data saved successfully' : 'Data updated successfully' });
          this.getViewData();
        } else {
          this.toast.add({ severity: 'warn', summary: 'Warning', detail: res || 'Unknown response' });
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.router.navigate(['/login']);
        }
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong' });
      }
    });
  }

  deleteItem(row: any, event: any): void {
    this.confirmService.confirm({
      target: event.target,
      message: 'Are you sure you want to delete?',
      header: 'Confirm Delete',
      icon: 'pi pi-trash',
      accept: () => this.deleteCall(row)
    });
  }

  deleteCall(row: any): void {
    const recordId = row?.id || row?.yearlySalaryComponentId || row?.salaryComponentId;

    if (!recordId) {
      this.toast.add({ severity: 'error', summary: 'Error', detail: 'Record ID is missing. Cannot delete.' });
      return;
    }

    const effectiveFrom = row.effectiveFrom ? this.datePipe.transform(row.effectiveFrom, 'yyyy-MM-dd') : '';
    const payload =
      `slryStrctTypeId=${row.slryStrctTypeId || 0}` +
      `|componentName=${row.componentName || ''}` +
      `|percentage=${row.percentage || 0}` +
      `|calculatedOn=${row.calculatedOnId || 0}` +
      `|calculationRate=${row.calculationRateId || 0}` +
      `|effectiveDate=${effectiveFrom}` +
      `|pf=${row.pf ? 1 : 0}` +
      `|esic=${row.esic ? 1 : 0}` +
      `|id=${recordId}` +
      `|subAction=DELETE` +
      `|appUserId=${sessionStorage.getItem('userId')}` +
      `|action=MONTHLY`;

    this.userService.SubmitPostTypeData('uspUpdateYearlySalaryComponent', payload, this.FormName).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Record deleted successfully' });
        this.getViewData();
      },
      error: () => {
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete record' });
      }
    });
  }

}
