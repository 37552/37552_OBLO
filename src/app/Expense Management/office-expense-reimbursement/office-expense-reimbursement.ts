import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Imports
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';

// Services & Validators
import { UserService } from '../../shared/user-service';
import { Customvalidation, noWhitespaceValidator } from '../../shared/Validation';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { DrawerModule } from 'primeng/drawer';
import { IftaLabelModule } from 'primeng/iftalabel';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-office-expense-reimbursement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    RadioButtonModule,
    DatePickerModule,
    TableModule,
    TabsModule,
    FileUploadModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TagModule,
    InputNumberModule,
    TableTemplate,
    DrawerModule,
    IftaLabelModule,
    PopoverModule,
  ],
  providers: [DatePipe, MessageService, ConfirmationService, Customvalidation],
  templateUrl: './office-expense-reimbursement.html',
  styleUrl: './office-expense-reimbursement.scss',
})
export class OfficeExpenseReimbursement implements OnInit {
  // Forms
  reimbursementForm!: FormGroup;
  otherExpForm!: FormGroup;
  approvalForm!: FormGroup;

  // Configuration
  FormName: string = '';
  menulabel: string = '';
  postType: string = 'add'; // 'add', 'update', 'view'
  isView: boolean = true;
  activeTab: string = 'pending';
  selectedRequest: string = 'pending';
  isLoading: boolean = false;
  visible: boolean = false;
  approvalDrawerVisible: boolean = false;
  approvalHistoryVisible: boolean = false;

  // Data
  allViewTableData: any[] = [];
  paginationCountData: any = {};
  pageNoData: any[] = [];
  officeExpenseChildData: any[] = [];
  EmployeeData: any[] = [];
  requestNo: any[] = [];
  allRequestNo: any[] = []; // Store all requests for filtering and data binding
  userInfo: any;
  selectedItem: any = null;
  approalHistoryData: any = null;

  // Security/Permission
  wfLevel: string = '';
  roledata: any;
  rolDes: any;
  isApprove = false;
  isForward = false;
  isReject = false;
  isReturn = false;
  isSave = false;

  // Pagination & Search
  pageNo: number = 1;
  pageSize: number = 10;
  searchText: string = '';
  totalCount: number = 0;

  // Calculation
  totalRequestAmount: number = 0;
  totalApprovedAmount: number = 0;
  approvedPaybleAmount: number = 0;

  // Modal Visibility
  displayApprovalDialog: boolean = false;
  displayHistoryDialog: boolean = false;

  // UI State
  submitterTypeValue: string = 'Self';
  fromDateValue: Date | null = null;
  isValidremark: boolean = true;
  remarks: string = '';
  remarksError: boolean = false;
  header: string = 'Office Expense Reimbursement';
  headerIcon: string = 'pi pi-plus';
  dialogMode: 'add' | 'edit' | 'view' = 'add';
  isMaximized: boolean = false;

  // Table Tabs Configuration
  tableTabs: any[] = [
    { label: 'Pending Request', value: 'pending', icon: 'pi pi-clock' },
    { label: 'Processed Requests', value: 'processed', icon: 'pi pi-check-circle' }
  ];

  minDate: Date = new Date();
  maxDate: Date = new Date();
  minDateother: Date | null = null;
  minFromDate: Date | null = null;
  minToDate: Date | null = null;

  // File Upload
  selectedForm: any = '';
  selectedFormControl: any = '';
  selectedFolderName: string = '';
  filesToUpload: Array<File> = [];
  selectedFileNames: string[] = [];

  // Breadcrumb
  breadcrumbItems: any[] = [
    { label: 'Home', routerLink: '/home' },
    { label: 'Expense Management', routerLink: '/expense-management' },
    { label: 'Office Expense Reimbursement', title: 'Office Expense Reimbursement' },
  ];

  // Table Columns
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No.', isVisible: true, isSortable: false },
    { key: 'serialNo', header: 'Serial No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request No', isVisible: true, isSortable: false },
    { key: 'empName', header: 'Name', isVisible: true, isSortable: false },
    { key: 'designation', header: 'Designation', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'organization', header: 'Organization', isVisible: true, isSortable: false },
    { key: 'expensePurpose', header: 'Expense Purpose', isVisible: true, isSortable: false },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private customValidation: Customvalidation,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private route: ActivatedRoute
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSessionData();
    this.getPermission();
    this.getViewData(true);
    this.getEmployeeData();
    this.getEmployeeDataForOther();
  }

  // --- Form Initialization ---
  private initializeForms() {
    this.reimbursementForm = this.fb.group({
      name: [{ value: '', disabled: true }],
      designation: [{ value: '', disabled: true }],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      expensePurpose: ['', [Validators.required, noWhitespaceValidator()]],
      imprest: [null],
      other: ['Self', Validators.required],
      EmployeeDataforother: [''],
      requestnumber: ['', Validators.required],
    });

    // Subscribe to fromDate changes to update minToDate
    this.reimbursementForm.get('fromDate')?.valueChanges.subscribe((fromDate: Date | null) => {
      if (fromDate) {
        this.minToDate = new Date(fromDate);
        // If toDate is already selected and is before fromDate, reset it
        const toDate = this.reimbursementForm.get('toDate')?.value;
        if (toDate && new Date(toDate) < new Date(fromDate)) {
          this.reimbursementForm.patchValue({ toDate: null }, { emitEvent: false });
        }
      } else {
        this.minToDate = null;
      }
    });

    // Subscribe to requestnumber changes to bind data
    this.reimbursementForm.get('requestnumber')?.valueChanges.subscribe((value) => {
      if (value !== undefined && value !== null && value !== '') {
        this.onRequestNumberChange(value);
      }
    });

    this.otherExpForm = this.fb.group({
      text: ['', [Validators.required, noWhitespaceValidator()]],
      expenseDate: ['', Validators.required],
      amount: [null, Validators.required],
      attachment: ['', Validators.required],
    });

    this.approvalForm = this.fb.group({
      approvalRemarks: ['', Validators.required],
      bankDetails: this.fb.array([]),
    });
  }

  get bankDetails(): FormArray {
    return this.approvalForm.get('bankDetails') as FormArray;
  }

  // --- Core API Methods ---
  getViewData(showSpinner: boolean = true) {
    try {
      if (showSpinner) {
        this.isLoading = true;
      }

      const procedure = this.selectedRequest === 'pending' ? 'uspGetOfficeExpDetail' : 'uspGetProcessedOfficeExpDetail';
      const query = `${procedure}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${this.roledata}`;

      this.userService.getQuestionPaper(query).subscribe({
        next: (res: any) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            if (res && res['table1']) {
              this.allViewTableData = [...res['table1']];
              this.totalCount = res['table']?.[0]?.totalCnt || 0;
              this.pageNoData = res['table2'] || [];

              this.allViewTableData.forEach(e => {
                e.approvalDetail = JSON.parse(e.approvalDetail || '[]');
              });
            } else {
              this.allViewTableData = [];
              this.totalCount = 0;
            }
            this.cd.detectChanges();
          });
        },
        error: (err: HttpErrorResponse) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.handleError(err);
            this.cd.detectChanges();
          });
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Unexpected error:', error);
    }
  }

  getPermission() {
    const query = `uspGetPermissionByactivity_role|actitvityName=${this.FormName}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${this.roledata}`;
    this.userService.getQuestionPaper(query).subscribe((res: any) => {
      if (res['table']?.length > 0) {
        const p = res['table'][0];
        this.wfLevel = (p.text || '').toLowerCase();
        this.isApprove = p.wfApprove;
        this.isForward = p.wfForword;
        this.isReject = p.wfReject;
        this.isReturn = p.wfReturn;
        this.isSave = p.wfSave;
      }
    });
  }

  getEmployeeData(userId?: string) {
    const uid = userId || sessionStorage.getItem('userId');
    this.userService.getQuestionPaper(`uspGetPersonalInfoHome|UserId=${uid}`).subscribe((res: any) => {
      this.userInfo = res['table'][0];
      if (this.postType !== 'view') {
        this.reimbursementForm.patchValue({
          name: this.userInfo?.name,
          designation: this.userInfo?.designation,
        });
      }
    });
  }

  loadRequestNumbers() {
    const submitType = this.reimbursementForm.get('other')?.value;
    let empHeadId = '';

    if (submitType === 'Self') {
      empHeadId = sessionStorage.getItem('UserIdToken') || sessionStorage.getItem('userId') || '';
    } else {
      // Handle "Other" - get employee ID from dropdown
      const rawValue = this.reimbursementForm.get('EmployeeDataforother')?.value || '';
      if (rawValue) {
        // Find the employee from EmployeeData array using drpValue
        const selectedUser = this.EmployeeData.find((user) => user.drpValue === Number(rawValue));

        if (selectedUser && selectedUser.userId) {
          // Use userId from the employee data
          empHeadId = selectedUser.userId.toString();
        } else if (rawValue.toString().includes('-')) {
          // Fallback: if value contains '-', split it
          empHeadId = rawValue.toString().split('-')[1];
        } else {
          // If it's already a userId, use it directly
          empHeadId = rawValue.toString();
        }
      }
    }

    if (!empHeadId) return;

    const appUserId = sessionStorage.getItem('userId') || '';

    this.userService
      .getQuestionPaper(
        `uspGetExpenseMasters|action=OFFICEREQNO|type=${submitType}|empHeadId=${empHeadId}|appUserId=${appUserId}`
      )
      .subscribe((res: any) => {
        this.allRequestNo = res['table'] || [];
        this.requestNo = [...this.allRequestNo]; // Copy all requests to requestNo for dropdown
        this.cd.detectChanges();
      });
  }

  // --- Logic & Events ---
  addExpenseRow() {
    if (this.otherExpForm.invalid) {
      this.otherExpForm.markAllAsTouched();
      return;
    }
    const row = {
      ...this.otherExpForm.value,
      expenseDate: this.datePipe.transform(this.otherExpForm.value.expenseDate, 'yyyy-MM-dd'),
      id: 0,
    };
    this.officeExpenseChildData.push(row);
    this.otherExpForm.reset();
  }

  onSaveSubmit() {
    if (this.reimbursementForm.invalid || this.officeExpenseChildData.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields and add at least one expense.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to submit this reimbursement?',
      accept: () => {
        this.isLoading = true;
        const formVal = this.reimbursementForm.getRawValue();
        const payload = `expensePurpose=${formVal.expensePurpose}|empId=${this.userInfo?.employeeId
          }|requestId=${formVal.requestnumber}|imprest=${formVal.imprest || 0
          }|fromDate=${this.datePipe.transform(
            formVal.fromDate,
            'yyyy-MM-dd'
          )}|toDate=${this.datePipe.transform(formVal.toDate, 'yyyy-MM-dd')}|submitFor=${formVal.other
          }|SubmitFrom=Office Expense|OfficeExpanseDetail=${JSON.stringify(this.officeExpenseChildData)}`;

        const sp =
          this.postType === 'update'
            ? 'uspPostUpdateOfficeExpanseDetail'
            : 'uspPostOfficeExpanseReimbursement';
        const finalQuery = `activity=${this.FormName}|${this.postType === 'update' ? 'id=' + this.selectedItem.id + '|' : ''
          }${payload}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${this.roledata}`;

        this.userService.SubmitPostTypeData(sp, finalQuery, this.FormName).subscribe((res: any) => {
          if (res.includes('success')) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Data Saved Successfully',
            });
            this.gotoView();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: res });
          }
          this.isLoading = false;
        });
      },
    });
  }

  // --- Approval Flow ---
  openApprovalModal(item: any) {
    this.selectedItem = item;
    this.officeExpenseChildData = item.officeExpDetail
      ? typeof item.officeExpDetail === 'string'
        ? JSON.parse(item.officeExpDetail)
        : item.officeExpDetail
      : [];

    // Initialize approved amounts if not present
    this.officeExpenseChildData.forEach((item: any) => {
      if (!item.approvedAmount) item.approvedAmount = item.amount || 0;
      if (!item.savedAmount) item.savedAmount = item.approvedAmount || 0;
    });

    this.totalRequestAmount = this.getTotalAmount('amount');
    this.totalApprovedAmount = this.getTotalAmount('approvedAmount');
    this.approvedPaybleAmount = this.totalApprovedAmount - (this.selectedItem.imprest || 0);
    this.remarks = '';
    this.isValidremark = true;
    this.remarksError = false;

    if (this.roledata == 86) {
      // Accountant/Finance Role
      this.addBankRow();
    }

    this.approvalDrawerVisible = true;
  }

  submitApproval(action: string) {
    const remark = this.approvalForm.get('approvalRemarks')?.value;
    if (!remark) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required',
        detail: 'Please enter remarks',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this request?`,
      accept: () => {
        this.isLoading = true;
        const statusId = this.getStatusId(action);
        const query = `activity=${this.FormName}|id=${this.selectedItem.id
          }|wfStatusId=${statusId}|approvalRemarks=${remark}|otherExpDetail=${JSON.stringify(
            this.officeExpenseChildData
          )}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${this.roledata}`;

        this.userService
          .SubmitPostTypeData('uspPostOfficeReimbursementApproval', query, this.FormName)
          .subscribe((res: any) => {
            if (res.includes('success')) {
              this.displayApprovalDialog = false;
              this.getViewData(false);
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Request ${action}ed`,
              });
            }
            this.isLoading = false;
          });
      },
    });
  }

  // --- Helpers ---
  private loadSessionData() {
    const menu = JSON.parse(sessionStorage.getItem('menuItem') || '{}');
    this.FormName = menu.formName;
    this.menulabel = menu.menu;

    const role = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    this.roledata = Number(role.roleId);
    this.rolDes = role.rolDes;
  }

  getStatusId(action: string): number {
    const codes: { [key: string]: number } = { Approve: 1, Forward: 6, Reject: 3, Return: 4 };
    return codes[action] || 0;
  }

  private handleError(err: HttpErrorResponse) {
    this.isLoading = false;
    if (err.status === 403) this.customValidation.loginroute(err.status);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
  }

  gotoView() {
    this.isView = true;
    this.postType = 'add';
    this.reimbursementForm.reset({ other: 'Self' });
    this.officeExpenseChildData = [];
    this.getViewData(true);
  }

  gotoAdd() {
    this.isView = false;
    this.postType = 'add';
  }

  addBankRow() {
    const group = this.fb.group({
      bankName: ['', Validators.required],
      account: ['', Validators.required],
      ifscCode: ['', Validators.required],
      panDetails: ['', Validators.required],
    });
    this.bankDetails.push(group);
  }

  getEmployeeDataForOther() {
    this.userService
      .getQuestionPaper(
        `uspGetFillDrpDown|table=reportingUser|appUserId=${sessionStorage.getItem('userId')}`
      )
      .subscribe((res: any) => {
        this.EmployeeData = res['table'] || [];
      });
  }

  // --- Missing Methods ---

  // Form Getters
  get f() {
    return this.reimbursementForm.controls;
  }

  get f1() {
    return this.otherExpForm.controls;
  }

  // Drawer & Dialog Methods
  showDialog(mode: 'add' | 'edit' | 'view', data?: any): void {
    this.dialogMode = mode;
    this.postType = mode === 'edit' ? 'update' : mode;
    this.visible = true;
    this.isMaximized = false;

    if (mode === 'add') {
      this.header = ' Add ' + this.FormName;
      this.headerIcon = 'pi pi-plus';
      // Reset date constraints
      this.minFromDate = null;
      this.minToDate = null;
      this.clearForms();
      this.onToggleSubmitter({ value: 'Self' });
    } else if (data && (mode === 'edit' || mode === 'view')) {
      this.header = mode === 'view' ? 'View Request' : 'Edit Request';
      this.headerIcon = mode === 'view' ? 'pi pi-eye' : 'pi pi-pencil';
      this.getViewDetails(data, mode);
    }
  }

  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
  }

  getDrawerWidth(): string {
    return this.isMaximized ? '100%' : '60%';
  }

  clearForms() {
    this.reimbursementForm.reset();
    this.otherExpForm.reset();
    this.officeExpenseChildData = [];
    this.selectedItem = null;
    this.postType = 'add';
    this.reimbursementForm.patchValue({ other: 'Self' });
    this.submitterTypeValue = 'Self';
    // Reset date constraints
    this.minFromDate = null;
    this.minToDate = null;
  }

  onResetForm() {
    // Reset forms but keep postType and selectedItem
    const currentPostType = this.postType;
    const currentSubmitterType = this.reimbursementForm.get('other')?.value || 'Self';

    this.reimbursementForm.reset();
    this.otherExpForm.reset();
    this.officeExpenseChildData = [];

    // Restore postType and submitter type
    this.postType = currentPostType;
    this.reimbursementForm.patchValue({ other: currentSubmitterType });
    this.submitterTypeValue = currentSubmitterType;

    // Reset date constraints
    this.minFromDate = null;
    this.minToDate = null;

    // Clear request numbers
    this.requestNo = [];
    this.allRequestNo = [];

    // If Self, reload employee data
    if (currentSubmitterType === 'Self') {
      this.getEmployeeData();
      this.loadRequestNumbers();
    } else {
      // For Other, clear employee selection and reload when employee is selected
      this.reimbursementForm.patchValue({ EmployeeDataforother: '' });
    }

    this.cd.detectChanges();
  }

  onDrawerHide() {
    this.visible = false;
    this.reimbursementForm.reset();
    this.selectedItem = null;
    this.getViewData(false);
  }

  // View Details
  getViewDetails(data: any, type: string) {
    try {
      this.isLoading = true;
      this.selectedItem = data;
      this.postType = type === 'edit' ? 'update' : type;
      this.submitterTypeValue = data.submitFor || 'Self';

      // Parse child data
      try {
        this.officeExpenseChildData = data.officeExpDetail
          ? typeof data.officeExpDetail === 'string'
            ? JSON.parse(data.officeExpDetail)
            : data.officeExpDetail
          : [];
      } catch (e) {
        console.error('Error parsing officeExpDetail:', e);
        this.officeExpenseChildData = [];
      }

      const patchData: any = {
        name: data.empName,
        designation: data.designation,
        requestnumber: data.requestId || '',
        fromDate: data.fromDate ? new Date(data.fromDate) : '',
        toDate: data.toDate ? new Date(data.toDate) : '',
        expensePurpose: data.expensePurpose || '',
        imprest: data.imprest || '',
        other: this.submitterTypeValue,
      };

      if (this.submitterTypeValue === 'Self') {
        this.onToggleSubmitter({ value: 'Self' });
      } else {
        const empId = data.empId || '';
        this.reimbursementForm.get('EmployeeDataforother')?.setValue(empId);
        this.onToggleSubmitter({ value: 'Other' });
      }

      setTimeout(() => {
        this.reimbursementForm.patchValue(patchData, { emitEvent: false });

        if (type === 'view') {
          this.reimbursementForm.disable({ emitEvent: false });
          this.otherExpForm.disable({ emitEvent: false });
        }

        if (type === 'update' || type === 'edit') {
          this.reimbursementForm.enable({ emitEvent: false });
          this.reimbursementForm.get('name')?.disable({ emitEvent: false });
          this.reimbursementForm.get('designation')?.disable({ emitEvent: false });
          this.otherExpForm.enable({ emitEvent: false });
        }

        this.minDate = data.fromDate ? new Date(data.fromDate) : new Date();
        this.maxDate = data.toDate ? new Date(data.toDate) : new Date();

        // Set minToDate based on fromDate when loading data for edit
        if (data.fromDate) {
          this.minToDate = new Date(data.fromDate);
          this.minFromDate = new Date(data.fromDate);
        }

        this.isLoading = false;
        this.cd.detectChanges();
      }, 500);
    } catch (error) {
      this.isLoading = false;
      console.error('Error occurred in getViewDetails:', error);
    }
  }

  // Tab & Pagination
  onChangeRequestTab(request: string) {
    if (this.selectedRequest === request) return;

    this.ngZone.run(() => {
      this.selectedRequest = request;
      this.activeTab = request;
      this.searchText = '';
      this.pageNo = 1;
      this.allViewTableData = [];
      this.paginationCountData = {};
      this.cd.detectChanges();
      this.getViewData(true);
    });
  }

  onPagesizeChange() {
    this.getViewData(true);
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchClick() {
    this.getViewData(false);
  }

  onSearchChange(searchText: string) {
    this.searchText = searchText;
    this.pageNo = 1;
    this.getViewData(false);
  }

  onPaginationChange(page: number) {
    this.pageNo = page;
    this.getViewData(true);
  }

  onPageChange(page: number) {
    this.pageNo = page;
    this.getViewData(true);
  }

  // Add/Edit Actions
  onAdd() {
    this.reimbursementForm.enable();
    this.reimbursementForm.get('name')?.disable();
    this.reimbursementForm.get('designation')?.disable();
    this.postType = 'add';
    this.showDialog('add');
  }

  // More Options
  moreOptions(data: any) {
    const rowNo = data?.rowNo || data;
    if (this.selectedRequest == 'pending') {
      const element = document.getElementById('cus_pending' + rowNo);
      const allElements = document.querySelectorAll('.custom-actionBtns');
      allElements.forEach((el) => {
        if (el.id !== 'cus_pending' + rowNo) {
          (el as HTMLElement).style.display = 'none';
        }
      });
      if (element) {
        element.style.display = element.style.display === 'block' ? 'none' : 'block';
      }
    } else {
      const element = document.getElementById('cus_proceed' + rowNo);
      const allElements = document.querySelectorAll('.custom-actionBtns');
      allElements.forEach((el) => {
        if (el.id !== 'cus_proceed' + rowNo) {
          (el as HTMLElement).style.display = 'none';
        }
      });
      if (element) {
        element.style.display = element.style.display === 'block' ? 'none' : 'block';
      }
    }
  }

  // Item Actions
  onItemAction(item: any, action: string) {
    if (action === 'Deleted') {
      this.confirmDelete(item);
    }
  }

  confirmDelete(item: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this record (${item.serialNo || item.reqNo})?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteRecords(item.id);
      },
    });
  }

  // Check if current user can perform approval actions
  canUserApprove(item: any): boolean {
    if (!item?.approvalDetail) return false;
    let approvals: any[] = [];
    try {
      approvals = Array.isArray(item.approvalDetail)
        ? item.approvalDetail
        : JSON.parse(item.approvalDetail || '[]');
    } catch (e) {
      return false;
    }

    // Find pending approval for current user's role
    const currentRoleName = this.rolDes || '';
    const pendingApproval = approvals.find(
      (app: any) => app.WfStatus === 'Pending' && app.role === currentRoleName
    );

    return !!pendingApproval;
  }

  // Check if user can see approve button
  canShowApprove(item: any): boolean {
    return this.canUserApprove(item) && this.isApprove;
  }

  // Check if user can see forward button
  canShowForward(item: any): boolean {
    // Prevent forward if current status is 6 (wfStatusId = 6)
    const currentWfStatusId = item?.wfStatusId || item?.statusId || item?.wfStatus;
    if (currentWfStatusId === 6 || currentWfStatusId === '6') {
      return false;
    }
    if (item.isManagerForwarded) return false;
    return this.canUserApprove(item) && this.isForward;
  }

  // Check if user can see reject button
  canShowReject(item: any): boolean {
    return this.canUserApprove(item) && this.isReject;
  }

  // Check if user can see return button
  canShowReturn(item: any): boolean {
    return this.canUserApprove(item) && this.isReturn;
  }

  deleteRecords(id: any) {
    this.isLoading = true;
    this.userService
      .SubmitPostTypeData(
        'uspPostDeleteOfficeExpReimb',
        `action=DELEXP|id=${id}|appUserId=${sessionStorage.getItem('userId')}`,
        this.FormName
      )
      .subscribe(
        (data: any) => {
          if (data != '') {
            var resultarray = data.split('-');
            if (resultarray[1] == 'success') {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Record deleted successfully.',
              });
              this.getViewData(false);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: resultarray[1] || 'Data cannot be deleted.',
              });
            }
          }
          this.isLoading = false;
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.handleError(err);
        }
      );
  }

  // Add Row
  AddRow() {
    if (this.otherExpForm.invalid) {
      this.otherExpForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill required fields',
      });
      return;
    }

    const val = this.otherExpForm.value;
    const rowData = {
      text: val.text,
      expenseDate: this.datePipe.transform(val.expenseDate, 'yyyy-MM-dd') || '',
      amount: val.amount || 0,
      attachment: val.attachment || '',
      id: 0,
    };
    this.officeExpenseChildData.push(rowData);
    this.otherExpForm.reset();
  }

  deleteChildTableRow(arrayName: string, index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this item?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const arr = this[arrayName as keyof this] as any[];
        if (Array.isArray(arr)) {
          arr.splice(index, 1);
        }
      },
    });
  }

  // Submit
  OnSubmitModal() {
    this.updateValidatorsBasedOnSubmitType();
    if (this.reimbursementForm.invalid) {
      this.reimbursementForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields',
      });
      return;
    }

    if (this.officeExpenseChildData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Please add at least one expense detail!',
      });
      return;
    }

    this.onSaveSubmit();
  }

  updateValidatorsBasedOnSubmitType() {
    if (this.dialogMode === 'view') return;
    const employeeDataCtrl = this.reimbursementForm.get('EmployeeDataforother');

    if (this.submitterTypeValue === 'Other') {
      employeeDataCtrl?.setValidators([Validators.required]);
    } else {
      employeeDataCtrl?.clearValidators();
    }

    employeeDataCtrl?.updateValueAndValidity();
  }

  // Approval Actions
  OnSubmitAction(action: string) {
    const allArrays = [...this.officeExpenseChildData];
    const hasAnyEmptyApprovedAmount = allArrays.some((obj) => obj.approvedAmount === '');
    if (hasAnyEmptyApprovedAmount) {
      this.remarksError = true;
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please enter approved amount for all items',
      });
      return;
    }
    this.remarksError = false;

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this request?`,
      header: 'Confirm?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.submitApprovalAction(action);
      },
    });
  }

  submitApprovalAction(action: string) {
    this.isLoading = true;
    const query = `activity=${this.FormName}|id=${this.selectedItem?.id
      }|wfStatusId=${this.getStatusId(action)}|approvedAmount=${this.totalApprovedAmount}|approvalRemarks=${this.remarks
      }|otherExpDetail=${JSON.stringify(
        this.officeExpenseChildData
      )}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${this.roledata}`;

    this.userService.SubmitPostTypeData('uspPostOfficeReimbursementApproval', query, this.FormName).subscribe(
      (datacom: any) => {
        this.isLoading = false;
        if (datacom != '' && datacom.includes('-success')) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Request ${action}ed successfully.`,
          });
          this.closeDataDialog();
          this.getViewData(false);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: datacom || 'Something went wrong!',
          });
        }
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleError(err);
      }
    );
  }

  closeDataDialog() {
    this.approvalDrawerVisible = false;
    this.approvalHistoryVisible = false;
    this.selectedItem = null;
  }

  // Approval History
  openApprovalHistoryModal(data: any) {
    this.approalHistoryData = data;
    if (this.approalHistoryData && this.approalHistoryData.approvalDetail) {
      if (typeof this.approalHistoryData.approvalDetail === 'string') {
        try {
          this.approalHistoryData.approvalDetail = JSON.parse(this.approalHistoryData.approvalDetail);
        } catch (e) {
          console.error('Error parsing approvalDetail:', e);
        }
      }
    }
    this.approvalHistoryVisible = true;
  }

  closeApprovalHistoryModal() {
    this.approvalHistoryVisible = false;
    this.approalHistoryData = null;
  }

  // File Upload
  fileupload(formName: string, controlName: string, folderName: string) {
    this.selectedForm = formName;
    this.selectedFormControl = controlName;
    this.selectedFolderName = folderName;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadFiles([file]);
      }
    };
    input.click();
  }

  uploadFiles(files: File[]) {
    try {
      this.isLoading = true;
      if (files.length > 0) {
        this.userService.MastrtfileuploadNew(files, this.selectedFolderName).subscribe(
          (datacom: any) => {
            const resultarray = datacom.split('-');
            if (resultarray[0] == '1') {
              this.isLoading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'File Uploaded!',
              });
              this.selectedFileNames = [];
              this.filesToUpload = [];
              this.selectedFolderName = '';
              const form = this[this.selectedForm as keyof this] as FormGroup;
              form.patchValue({
                [this.selectedFormControl]: resultarray[1].toString(),
              });
            } else {
              this.isLoading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: resultarray[1].toString(),
              });
            }
          },
          (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.handleError(err);
          }
        );
      }
    } catch (error) {
      this.isLoading = false;
      console.log('error occurred while upload file', error);
    }
  }

  viewAttachment(path: string) {
    if (path) {
      window.open('https://elocker.nobilitasinfotech.com/' + path, '_blank');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'File not Exist!',
      });
    }
  }

  removeAttachment(formName: string, controlName: string) {
    const form = this[formName as keyof this] as FormGroup;
    form.patchValue({
      [controlName]: '',
    });
  }

  // Date Transform
  transformDate(newDate: any, formName: string, controlName: string) {
    const formattedDate = this.datePipe.transform(newDate.value, 'yyyy-MM-dd');
    const form = this[formName as keyof this] as FormGroup;
    form.patchValue({
      [controlName]: formattedDate,
    });
  }

  onChangeFromDate(event: any): void {
    const selectedDate = event.value || event;
    if (selectedDate) {
      // Set minToDate to the selected fromDate
      this.minToDate = new Date(selectedDate);
      // Update minFromDate to disable dates before selected date in fromDate picker
      this.minFromDate = new Date(selectedDate);

      // If toDate is already selected and is before fromDate, reset it
      const toDate = this.reimbursementForm.get('toDate')?.value;
      if (toDate && new Date(toDate) < new Date(selectedDate)) {
        this.reimbursementForm.patchValue({ toDate: null }, { emitEvent: false });
      }
    }
    this.minDate = selectedDate;
    this.fromDateValue = selectedDate;
  }

  // Employee Change
  onEmployeeChange(event?: any): void {
    const selectedDrpValue =
      event?.value || this.reimbursementForm.get('EmployeeDataforother')?.value || '';
    const selectedUser = this.EmployeeData.find(
      (user) => user.drpValue === Number(selectedDrpValue)
    );
    const selectedUserId = selectedUser ? selectedUser.userId : '';
    if (selectedUserId) {
      this.getEmployeeData(selectedUserId);
    }
    this.loadRequestNumbers();
  }

  // Approval Value Changes
  onChangeValue(event: any, item: any, field: string) {
    const value = event.target.value;
    item[field] = value;

    if (field === 'approvedAmount') {
      this.totalApprovedAmount = this.getTotalAmount('approvedAmount');
      this.approvedPaybleAmount = this.totalApprovedAmount - (this.selectedItem?.imprest || 0);
    }
    this.cd.detectChanges();
  }

  onChangeApprovedAmount(event: any) {
    const value = parseFloat(event.target.value) || 0;
    this.totalApprovedAmount = value;
    this.approvedPaybleAmount = this.totalApprovedAmount - (this.selectedItem?.imprest || 0);
    this.cd.detectChanges();
  }

  onRemarksChange(event: any) {
    this.remarks = event.target.value;
    this.isValidremark = this.remarks.trim().length > 0;
    this.remarksError = !this.isValidremark;
  }

  getTotalAmount(key: string) {
    const allArrays = [...this.officeExpenseChildData];
    const totalAmount = allArrays.reduce((acc, obj) => {
      const amount = parseFloat(obj[key]) || 0;
      return acc + amount;
    }, 0);
    return totalAmount;
  }

  // Print
  print(data: any) {
    setTimeout(() => {
      let expenseData: any[] = [];
      let approvalData: any[] = [];

      const fromDateFormatted = data.fromDate
        ? this.datePipe.transform(data.fromDate, 'yyyy-MM-dd')
        : '-';
      const toDateFormatted = data.toDate
        ? this.datePipe.transform(data.toDate, 'yyyy-MM-dd')
        : '-';

      try {
        expenseData = data.officeExpDetail ? JSON.parse(data.officeExpDetail) : [];
        approvalData = Array.isArray(data.approvalDetail) ? data.approvalDetail : [];
      } catch (e) {
        console.error('Error parsing data:', e);
      }

      const totalRequestAmount = expenseData.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );

      const totalApprovedAmount = expenseData.reduce((sum, item) => {
        return sum + (Number(item.approvedAmount) || 0);
      }, 0);

      const approvedPaybleAmount = totalApprovedAmount - (data.imprest || 0);

      const formatAmt = (amt: any) => (amt != null ? Number(amt).toFixed(2) : '-');

      let expenseHTML = expenseData.length
        ? `
        <h3>Expense Details</h3>
        <table>
          <tr>
            <th>Expense Name</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
          ${expenseData
          .map(
            (item) => `
          <tr>
            <td>${item.text || '-'}</td>
            <td>${item.expenseDate || '-'}</td>
            <td>${formatAmt(item.amount)}</td>
          </tr>`
          )
          .join('')}
        </table>`
        : '';

      let approvalHTML = approvalData.length
        ? `
        <div class="print-section">
          <table cellspacing="0" cellpadding="10" style="width: 100%; border: 1px solid #000; border-collapse: collapse; text-align: center;">
            <tr>
              <td colspan="${approvalData.length}" style="text-align: left; font-weight: bold; padding-bottom: 20px; border: none;">
                ${data.organization || '-'}
              </td>
            </tr>
            <tr>
              <td style="border: none;">User</td>
              <td style="border: none;">Manager</td>
              <td style="border: none;">ACCTS./Finance</td>
            </tr>
            <tr>
              ${approvalData
          .map(
            (item, index) => `
                <td style="border: none; padding-top: 5px;">
                  ${index === 0 ? item.employee || '-' : item.approvedBy || '-'}
                </td>
              `
          )
          .join('')}
            </tr>
          </table>
        </div>`
        : '';

      const printContents = `
        <html>
        <head>
        <title>Office Expense Reimbursement</title>
           <style>
            @media print {
              .print-button-container {
                display: none;
              }
            }
            @page {
              margin: 15mm 15mm 15mm 15mm;
              size: auto;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 40px 25px 25px 25px;
              padding-top: 20px;
              font-size: 13px;
            }
            h1, h2 {
              margin: 0;
              padding: 0;
              text-align: center;
              text-transform: uppercase;
              font-size: 20px;
            }
            h3 {
              margin-top: 30px;
              page-break-after: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 13px;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f2f2f2;
            }
           </style>
          </head>
        <body>
          <h1>Office Expense Reimbursement</h1>
          <h2>(Document No: ${data.serialNo})</h2>
          <br/>
          <table>
            <tr><td><strong>Name:</strong></td><td>${data.empName || '-'}</td>
                <td><strong>Designation:</strong></td><td>${data.designation || '-'}</td></tr>
            <tr><td><strong>From Date:</strong></td><td>${fromDateFormatted}</td>
                <td><strong>To Date:</strong></td><td>${toDateFormatted}</td></tr>
            <tr><td><strong>Purpose:</strong></td><td>${data.expensePurpose || '-'}</td>
                <td><strong>Imprest:</strong></td><td>${formatAmt(data.imprest)}</td></tr>
          </table>
          ${expenseHTML}
          <table>
            <tr>
              <th>Total Requested Amount</th>
              <th>${formatAmt(totalRequestAmount)}</th>
            </tr>
            <tr>
              <th>Disbursed Amount</th>
              <th>${formatAmt(data.imprest)}</th>
            </tr>
            <tr>
              <th>Net Payable/Recoverable</th>
              <th>${formatAmt(totalRequestAmount - data.imprest)}</th>
            </tr>
          </table>
          ${approvalHTML}
        </body>
        </html>
      `;

      const width = Math.round(window.screen.availWidth * 0.7);
      const height = Math.round(window.screen.availHeight * 0.8);
      const left = Math.round((window.screen.availWidth - width) / 2);
      const top = Math.round((window.screen.availHeight - height) / 2);

      const popupWin = window.open(
        '',
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,location=no,status=no`
      );

      if (popupWin && popupWin.document) {
        popupWin.document.open();
        popupWin.document.write(printContents);
        popupWin.document.close();
      }
    }, 500);
  }

  // Update onToggleSubmitter to handle event object
  onToggleSubmitter(event: any) {
    // Get value from event first (PrimeNG radio button passes value in event.value)
    const eventValue = event?.value || event;
    // Also get from form control as fallback
    const formValue = this.reimbursementForm.get('other')?.value;
    const selectedValue = eventValue || formValue || 'Self';

    // Set submitterTypeValue immediately
    this.submitterTypeValue = selectedValue;

    const selectedOtherEmpId = this.reimbursementForm.get('EmployeeDataforother')?.value;

    // Clear request number
    this.requestNo = [];
    this.allRequestNo = [];
    this.reimbursementForm.get('requestnumber')?.setValue('');
    this.reimbursementForm.get('requestnumber')?.markAsUntouched();
    this.reimbursementForm.get('requestnumber')?.updateValueAndValidity();

    if (selectedValue === 'Self') {
      this.reimbursementForm.patchValue(
        {
          other: selectedValue,
          EmployeeDataforother: '',
        },
        { emitEvent: false }
      );
      this.getEmployeeData();
      this.loadRequestNumbers();
    } else {
      // "Other" selected
      this.reimbursementForm.patchValue(
        {
          other: selectedValue,
          EmployeeDataforother: selectedOtherEmpId || '',
        },
        { emitEvent: false }
      );

      // If employee is already selected, call API immediately
      if (selectedOtherEmpId) {
        const selectedUser = this.EmployeeData.find(
          (user) => user.drpValue === Number(selectedOtherEmpId)
        );
        const selectedUserId = selectedUser ? selectedUser.userId : '';
        if (selectedUserId) {
          this.getEmployeeData(selectedUserId);
        }
        this.loadRequestNumbers();
      } else {
        // Clear name and designation when switching to Other without employee
        this.reimbursementForm.patchValue({
          name: '',
          designation: '',
        }, { emitEvent: false });
      }
    }

    this.updateValidatorsBasedOnSubmitType();
    // Force change detection
    this.cd.detectChanges();
  }

  // Handle request number change to bind data
  onRequestNumberChange(value: any) {
    // Don't bind data in view mode
    if (this.postType === 'view') {
      return;
    }

    const searchArray = this.allRequestNo && this.allRequestNo.length > 0 ? this.allRequestNo : this.requestNo;

    if (searchArray && Array.isArray(searchArray) && value) {
      const matched = searchArray.find((item) => item.drpValue === Number(value));
      if (matched) {
        const parseLocalDate = (dateStr: string): Date | null => {
          if (!dateStr) return null;
          try {
            const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
            return new Date(year, month - 1, day);
          } catch (e) {
            return null;
          }
        };

        const fromDate = matched.fromDate ? parseLocalDate(matched.fromDate) : null;
        const toDate = matched.toDate ? parseLocalDate(matched.toDate) : null;

        // Update minToDate based on fromDate
        if (fromDate) {
          this.minToDate = new Date(fromDate);
          this.minFromDate = new Date(fromDate);
        }

        setTimeout(() => {
          this.reimbursementForm.patchValue({
            imprest: matched.approvedImprest || matched.imprest || '',
            expensePurpose: matched.purpose || matched.expensePurpose || '',
            fromDate: fromDate,
            toDate: toDate,
          }, { emitEvent: false });

          // In add mode, enable fields so user can modify auto-filled values
          if (this.postType === 'add') {
            this.reimbursementForm.enable({ emitEvent: false });
            this.reimbursementForm.get('name')?.disable({ emitEvent: false });
            this.reimbursementForm.get('designation')?.disable({ emitEvent: false });
          }
        }, 400);

        this.reimbursementForm.updateValueAndValidity({
          emitEvent: false,
        });
      }
    }
  }
}
