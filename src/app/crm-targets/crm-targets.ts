import { Component, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { TableColumn, TableTemplate } from '../table-template/table-template';
import { UserService } from '../shared/user-service';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-crm-targets',
  standalone: true,
  templateUrl: './crm-targets.html',
  styleUrls: ['./crm-targets.scss'],

  imports: [
    TableTemplate,
    ButtonModule,
    DrawerModule,
    Popover,
    Tooltip,
    ConfirmDialog,
    Toast,
    ProgressSpinner,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CheckboxModule,
    Select,
  ],

  providers: [ConfirmationService, MessageService],
})
export class CrmTargets {
  targetType: any;
  department: any;
  employee: any;
  fiscalYear: any;
  currency: any;
  paramvaluedata: string = '';
  selectedItem: any;

  onClear() {
    this.targetsForm.reset();
  }
  /** UI & Form Flags */
  visible = false;
  isLoading = true;
  isFormLoading = false;
  postType: 'add' | 'update' | 'view' = 'add';
  header = '';
  headerIcon = '';

  /** Table Data */
  data: any[] = [];
  columns: TableColumn[] = [
    
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },

    { key: 'targetType', header: 'Target Type',  isVisible: true, isSortable: false },
    { key: 'employee', header: 'Employee Name', isVisible: true, isSortable: false }, 
    { key: 'department', header: 'Department Name', isVisible: true, isSortable: false },
    { key: 'financialYear', header: 'Fiscal Year', isVisible: true, isSortable: false },

    { key: 'currency', header: 'Currency', isVisible: true, isSortable: false },
    { key: 'targetAmount', header: 'Target Amount', isVisible: true, isSortable: false }, 
    { key: 'targetStatus', header: 'Target Amount', isVisible: true, isSortable: false }, 

    { key: 'targetDescription', header: 'Target Description', isVisible: true, isSortable: false },
    { key: 'targetPeriodType', header: 'Target Period  Type', isVisible: true, isSortable: false },

  ];

  selectedRow: any;
  elementRefs: {} | undefined;
  paramValueData = '';

  /** Form */
  targetsForm: FormGroup;

  /** Dropdown Options */
  targetTypeList = [];

  employeeList = [];

  departmentList = [];

  fiscalYearList = [];

  currencyList = [];

  targetStatusList = [];

  targetPeriodList = [];

  /** Pagination & Sorting */
  pageNo = 1;
  pageSize = 5;
  totalCount = 0;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Employee/Department disable logic */
  isEmployeeSelected = false;
  isDepartmentSelected = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    // Inside constructor or ngOnInit: set validators for those controls
    this.targetsForm = this.fb.group({
      targetType: ['', Validators.required],
      employee: [''],
      department: [''],
      fiscalYear: ['', Validators.required],
      currency: ['', Validators.required],
      targetAmount: ['', [Validators.maxLength(9)]],
      targetStatus: ['', Validators.required],
      targetPeriod: ['', Validators.required],
      targetDescription: ['', [Validators.maxLength(150)]],
    });

  }




  /** Drawer */
  showDialog(mode: 'add' | 'view' | 'update', data?: any) {
    debugger;
    this.isFormLoading = true;
    this.visible = true;
    this.postType = mode;
    this.header =
      mode === 'add'
        ? 'Add Target Setting'
        : mode === 'update'
        ? 'Update Target Setting'
        : 'View Target Setting';
    this.headerIcon =
      mode === 'add' ? 'pi pi-plus' : mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
    if (data) this.selectedItem = data;
    if (mode !== 'add' && data) {
      

      this.targetsForm.patchValue({
        targetType: data.targetTypeId,
        employee: data.employeeId,
        department: data.departmentId,
        fiscalYear: data.financialYearId,
        currency: data.currencyId,
        targetAmount: data.targetAmount,
        targetStatus: data.targetStatusId,
        targetPeriod: data.targetPeriodTypeId,
        targetDescription: data.targetDescription,
      });

   
      if (mode === 'view') {
        this.targetsForm.disable();
      } else {
        this.targetsForm.enable();
      }

       if (mode === 'update') {
      this.targetsForm.get('targetType')?.disable();
      this.targetsForm.get('employee')?.disable();
      this.targetsForm.get('department')?.disable();
      this.targetsForm.get('fiscalYear')?.disable();

      }

    } else {
      this.targetsForm.enable();
      this.targetsForm.reset();
    }

    setTimeout(() => {
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }, 200);
  }

  onchangeType(event: any) {
this.targetsForm.get('employee')?.setValue('');
this.targetsForm.get('department')?.setValue('');

}

  onDrawerHide() {
    this.visible = false;
    this.targetsForm.reset();
    this.targetsForm.enable();
  }

  /** Table Fetch */
  getTableData(load: boolean) {
    if (load) this.isLoading = true;

    // Example API call
    let userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId
    this.userService.getQuestionPaper(`uspGetSalesTarget|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${Number(this.pageNo)}|size=${Number(this.pageSize)}|appUserRole=${userRole}`).subscribe({
      next: (res: any) => {
        debugger;
        this.data = res?.table1 || [];
        this.totalCount = res?.totalCount || 0;
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 300);
      },
      error: () => (this.isLoading = false),
    });
  }

  onNumberInput(event: any) {
  let value = event.target.value;

  // Remove non-digit characters
  value = value.replace(/[^0-9]/g, '');

  // Max 9 digits
  if (value.length > 9) {
    value = value.slice(0, 9);
  }

  event.target.value = value;
  this.targetsForm.get('targetAmount')?.setValue(value);
}


  /** Pagination */
  onPageChange(p: number) {
    this.pageNo = p;
    this.getTableData(true);
  }
  onPageSizeChange(s: number) {
    this.pageSize = s;
    this.pageNo = 1;
    this.getTableData(true);
  }
  onSearchChange(text: string) {
    this.searchText = text;
    this.pageNo = 1;
    this.getTableData(true);
  }
  onSortChange(event: any) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  /** Submit */

  ngOnInit(): void {
    this.getTableData(true);
    this.getDropdown();

  }

  getDropdown() {
    this.userService
      .getQuestionPaper(`uspGetFillDrpDown|table=tblSalesTargetTypeMaster`)
      .subscribe({
        next: (res: any) => {
          debugger;
          this.targetTypeList = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading states:', err);
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load targetTypeList.',
          });
        },
      });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblEmployeeMaster`).subscribe({
      next: (res: any) => {
        this.employeeList = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employeeList.',
        });
      },
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblDepartmentMaster`).subscribe({
      next: (res: any) => {
        this.departmentList = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departmentList.',
        });
      },
    });
    this.userService.getQuestionPaper(`uspGetMasters|action=FYYEAR|id=0`).subscribe({
      next: (res: any) => {
        this.fiscalYearList = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load fiscalYearList.',
        });
      },
    });
    this.userService.getQuestionPaper(`uspGetMasters|action=CURRENCY|id=0`).subscribe({
      next: (res: any) => {
        this.currencyList = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load currencyList.',
        });
      },
    });

    this.userService.getQuestionPaper(`uspGetMasters|action=STATUS|id=0`).subscribe({
      next: (res: any) => {
        this.targetStatusList = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load targetStatusList.',
        });
      },
    });
    this.userService
      .getQuestionPaper(`uspGetFillDrpDown|table=tblSalesTargetPeriodTypeMaster`)
      .subscribe({
        next: (res: any) => {
          this.targetPeriodList = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading states:', err);
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load targetPeriodList.',
          });
        },
      });
  }

  onSubmit() {

    debugger
    if (this.targetsForm.invalid) {
      this.targetsForm.markAllAsTouched();

      return;
    }


    let targetType = this.targetsForm.get('targetType')?.value;
    if (targetType == '10000') {
      if (this.targetsForm.get('employee')?.value == '') {

        return;
      }
    }

    if (targetType == '10001') {
      if (this.targetsForm.get('department')?.value == '') {

        return;
      }
    }

    this.paramvaluedata = '';
    let empId = this.targetsForm.get('employee')?.value || 0;
    let dept = this.targetsForm.get('department')?.value || 0;
    let fyId = this.targetsForm.get('fiscalYear')?.value;
    let currencyId = this.targetsForm.get('currency')?.value;
    let targetStatus = this.targetsForm.get('targetStatus')?.value;
    let targetAmount = this.targetsForm.get('targetAmount')?.value;
    let targetTypeId = this.targetsForm.get('targetType')?.value;
    let targetPeriodTypeId = this.targetsForm.get('targetPeriod')?.value;
    let targetDescription = this.targetsForm.get('targetDescription')?.value;

    this.paramvaluedata = `empId=${empId}|departmentId=${dept}|fyId=${fyId}|currencyId=${currencyId}|targetStatus=${targetStatus}|targetAmount=${targetAmount}|targetTypeId=${targetTypeId}|targetPeriodTypeId=${targetPeriodTypeId}|targetDescription=${targetDescription}`;

    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', this.postType);
  }

  /** Confirmation */
  openConfirmation(title: string, msg: string, type: string) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      accept: () => {
        if (type === 'add' || type === 'update') this.submitCall();
        else if (type === 'delete') this.deleteData();
      },
    });
  }

  /** API Submit Call */

  submitCall() {
    this.isFormLoading = true;
    let query = ``;
    let SP = ``;
    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    if (this.postType == 'update') {
      query = `targetId=${this.selectedItem.targetId}|${
        this.paramvaluedata
      }|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
      SP = `uspUpdateSalesTarget`;
    } else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem(
        'userId'
      )}|appUserRole=${roleID}`;
      SP = `uspPostSalesTarget`;
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');

        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail:
              this.postType === 'update'
                ? 'Data Updated Successfully.'
                : 'Data Saved Successfully.',
            life: 3000,
          });

          this.getTableData(false);
          this.onDrawerHide();
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: result[1],
            life: 3000,
          });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong. Please try again later.',
          life: 3000,
        });
      },
    });
  }

  /** Delete */
  deleteItem(row: any) {
    this.selectedItem = row;
    this.openConfirmation('Confirm', 'Are you sure want to delete?', 'delete');
  }

  deleteData() {
    this.isFormLoading = true;
    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    const query = `targetId=${this.selectedItem.targetId}|appUserId=${sessionStorage.getItem(
      'userId'
    )}|appUserRole=${roleID}`;

    this.userService.SubmitPostTypeData('uspDeleteSalesTarget', query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Deleted successfully',
          });
          this.getTableData(true);
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: result[1] });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete.' });
      },
    });
  }

  /** Validation */
  isInvalid(field: string, form: FormGroup) {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
