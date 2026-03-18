import { ChangeDetectorRef, Component, OnInit, NgZone, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../shared/user-service';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Customvalidation, noWhitespaceValidator } from '../../shared/Validation';
import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { PopoverModule } from 'primeng/popover';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-tour-reimbursement',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    DrawerModule,
    DialogModule,
    FormsModule,
    SelectModule,
    IftaLabelModule,
    RadioButtonModule,
    DatePickerModule,
    TableModule,
    TabsModule,
    FileUploadModule,
    ToastModule,
    ConfirmDialog,
    TableTemplate,
    PopoverModule,
  ],
  providers: [DatePipe, MessageService, ConfirmationService, Customvalidation],
  templateUrl: './tour-reimbursement.html',
  styleUrl: './tour-reimbursement.scss',
})
export class TourReimbursement implements OnInit {
  @ViewChildren('submitType,fromDatePicker,toDatePicker,travelTo,TravelFrom,expensePurpose,expenseTypeId,requestnumber,travelById,imprest,other,EmployeeDataforother') formFields!: QueryList<ElementRef>;

  // ================= UI State =================
  visible: boolean = false;
  approvalDrawerVisible: boolean = false;
  showHistoryInDialog: boolean = false;
  minDateother: Date | null = null;
  minDate = new Date();
  maxDate = new Date();

  /** Main form From/To date range - used to restrict child section date pickers (Fare, Lodging, Food, Laundry, Other). */
  get mainFormFromDate(): Date | null {
    const v = this.reimbursementForm?.get('fromDate')?.value;
    if (v == null) return null;
    return v instanceof Date ? v : new Date(v);
  }
  get mainFormToDate(): Date | null {
    const v = this.reimbursementForm?.get('toDate')?.value;
    if (v == null) return null;
    return v instanceof Date ? v : new Date(v);
  }
  postType: string = 'add';
  isConveyanceType: boolean = false;
  isLoading: boolean = false;
  selectedItem: any = null;

  // ================= User & Role Data =================
  currentRole: number = 0;
  roledata: number = 0;
  rolDes: string = '';
  userId: string = '';
  userInfo: any;
  submitterTypeValue: string = 'Self';
  selectedEmployeeId: string = '';
  appuserid: string = '';

  // ================= Forms =================
  reimbursementForm!: FormGroup;
  conveyanceForm!: FormGroup;
  lodgingForm!: FormGroup;
  foodForm!: FormGroup;
  laundryForm!: FormGroup;
  otherExpForm!: FormGroup;
  approvalForm!: FormGroup;

  // ================= Dropdown Data =================
  requestNo: any[] = [];
  allRequestNo: any[] = []; // Store all requests for filtering
  EmployeeData: any[] = []; // Reporting Users
  travelByDrpAll: any[] = []; // Travel Modes
  expenseTypeDrp: any[] = [];

  // ================= Table Data (Child Arrays) =================
  conveyanceChildData: any[] = [];
  lodgingChildData: any[] = [];
  foodExpChildData: any[] = [];
  laundryChildData: any[] = [];
  otherExpenseChildData: any[] = [];

  // ================= View Data & Pagination =================
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];
  pageNoData: any[] = [];
  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  searchText: string = '';
  selectedRequest: string = 'pending';
  showDeleteBtn: boolean = false;
  showActiveBtn: boolean = false;

  // ================= Approval Workflow =================
  wfLevel: string = '';
  isApprove: boolean = false;
  isForward: boolean = false;
  isReject: boolean = false;
  isReturn: boolean = false;
  isSave: boolean = false;
  selectedAction: any = null;
  totalRequestAmount: number = 0;
  requestPaybleAmount: number = 0;
  totalApprovedAmount: number = 0;
  approvedPaybleAmount: number = 0;
  isValidremark: boolean = true;
  remarks: string = '';
  remarksError: boolean = false;
  isValidApprovedAmount: boolean = true;
  approvedAmountError: boolean = false;
  status: any;
  approalHistoryData: any = null;
  approvalHistoryVisible: boolean = false;
  historyFoodDetails: any[] = []; // For food expense history in approval modal

  // ================= Bank Details =================
  parsedBankDetails: any[] = [];

  // ================= File Upload =================
  selectedForm: any = '';
  selectedFormControl: any = '';
  selectedFolderName: string = '';
  filesToUpload: Array<File> = [];
  selectedFileNames: string[] = [];

  // ================= Other =================
  selectedConveyaceType: string = 'Fare';
  selectedTable = '';
  selectedIndex: number | null = null;
  paramvaluedata: any = '';
  FormName: string = 'TourReimbursement';
  FormValue: string = '';
  menulabel: string = '';
  isView: boolean = true;
  currentDate = new Date();
  stateDrp: any[] = [];
  cityDrp: any[] = [];
  selectedRequestStateId: number | undefined = undefined;
  selectedRequestDistrictId: number | undefined = undefined;
  selectedRequestManagerImprest: number | undefined = undefined;
  lodgingMaxAmount: number | undefined = undefined;
  foodMaxAmount: number | undefined = undefined;

  breadcrumbItems: any[] = [
    { label: 'Home', routerLink: '/home' },
    { label: 'Expense Management', routerLink: '/expense-management' },
    { label: 'Tour Reimbursement', title: 'Tour Reimbursement' },
  ];

  header: string = 'Reimbursement Request';
  headerIcon: string = 'pi pi-plus';
  dialogMode: 'add' | 'edit' | 'view' = 'add';
  isMaximized: boolean = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public Customvalidation: Customvalidation,
    public zone: NgZone,
    private router: Router
  ) {
    const roleStr = sessionStorage.getItem('currentRole');
    this.currentRole = roleStr ? JSON.parse(roleStr).roleId : 0;
    this.roledata = this.currentRole;
    this.rolDes = roleStr ? JSON.parse(roleStr).roleName || '' : '';
    this.userId = sessionStorage.getItem('userId') || '';
    this.initForm();
  }

  ngOnInit(): void {
    const param = sessionStorage.getItem('menuItem');
    if (param) {
      try {
        const paramjs = JSON.parse(param);
        this.FormName = paramjs.formName || 'TourReimbursement';
        this.FormValue = paramjs.formValue || '';
      } catch (e) {
        console.error('Error parsing menuItem:', e);
      }
    }

    // Initial Data Loads
    this.getPermission();
    this.getViewData(true);
    this.getExpenseTypDrp();
    this.getTravelByDrp(this.reimbursementForm.get('submitType')?.value);
    this.getEmployeeData();
    this.GetEmployeeDataForOther();
    this.getStateDrp();

    // Listeners
    this.setupFormListeners();
    this.bindRealTimeTotalKmCalculation();
  }

  initForm() {
    // 1. Main Header Form
    this.reimbursementForm = this.fb.group({
      submitType: ['', [Validators.required]],
      name: [{ value: '', disabled: true }],
      designation: [{ value: '', disabled: true }],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      travelFrom: ['', [Validators.required, noWhitespaceValidator()]],
      travelTo: ['', [Validators.required, noWhitespaceValidator()]],
      expensePurpose: ['', [Validators.required, noWhitespaceValidator()]],
      expenseTypeId: ['', [Validators.required]],
      travelById: ['', [Validators.required]],
      imprest: [''],
      other: ['', [Validators.required]],
      EmployeeDataforother: [''],
      requestnumber: ['', [Validators.required]],
    });

    // 2. Conveyance Form
    this.conveyanceForm = this.fb.group({
      expanseType: ['Fare', [Validators.required]], // Default Fare
      travelById: ['', [Validators.required]],
      text: [''], // Details/Remarks
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      startMeterRead: [''],
      endMeterRead: [''],
      totalKm: [''],
      amount: ['', [Validators.required]],
      attachment: [''], // Make optional if needed
      travelFrom: ['', [Validators.required]],
      travelTo: ['', [Validators.required]],
    });

    // 3. Lodging Form
    this.lodgingForm = this.fb.group({
      state: [undefined as number | undefined],
      city: [undefined as number | undefined],
      text: ['', [Validators.required, noWhitespaceValidator()]], // Hotel Name
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      attachment: ['', [Validators.required]],
    });

    // 4. Food Form
    this.foodForm = this.fb.group({
      state: [undefined as number | undefined],
      city: [undefined as number | undefined],
      text: ['', [Validators.required]], // Food Type
      expenseDate: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      attachment: ['', [Validators.required]],
    });

    // 5. Laundry Form
    this.laundryForm = this.fb.group({
      text: ['', [Validators.required]], // No of clothes
      expenseDate: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      attachment: ['', [Validators.required]],
    });

    // 6. Other Form
    this.otherExpForm = this.fb.group({
      text: ['', [Validators.required, noWhitespaceValidator()]], // Expense Name
      expenseDate: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      attachment: ['', [Validators.required]],
    });

    // 7. Approval Form (Bank Details)
    this.approvalForm = this.fb.group({
      bankDetails: this.fb.array([]),
    });
  }

  get bankDetails(): FormArray {
    return this.approvalForm.get('bankDetails') as FormArray;
  }

  createBankDetailForm(): FormGroup {
    return this.fb.group({
      bankName: ['', [Validators.required]],
      account: ['', [Validators.required]],
      ifscCode: ['', [Validators.required]],
      panDetails: ['', [Validators.required]],
    });
  }

  addBankAccount() {
    this.bankDetails.push(this.createBankDetailForm());
  }

  removeBankAccount(index: number) {
    if (this.bankDetails.length > 1) {
      this.bankDetails.removeAt(index);
    }
  }

  initializeBankDetailsWithData() {
    this.bankDetails.clear();
    if (this.parsedBankDetails && this.parsedBankDetails.length > 0) {
      this.parsedBankDetails.forEach((bank: any) => {
        const bankGroup = this.createBankDetailForm();
        bankGroup.patchValue({
          bankName: bank.bankName || '',
          account: bank.account || bank.accountNo || '',
          ifscCode: bank.ifscCode || bank.ifsc || '',
          panDetails: bank.panDetails || bank.pan || '',
        });
        this.bankDetails.push(bankGroup);
      });
    } else {
      this.addBankAccount();
    }
  }

  setupFormListeners() {
    const startControl = this.conveyanceForm.get('startMeterRead');
    const endControl = this.conveyanceForm.get('endMeterRead');

    if (startControl && endControl) {
      startControl.valueChanges.subscribe(() => this.calculateTotalKm());
      endControl.valueChanges.subscribe(() => this.calculateTotalKm());
    }

    this.reimbursementForm.get('submitType')?.valueChanges.subscribe((val) => {
      this.onChangeSubmitFrom(val);
      this.reimbursementForm.get('travelById')?.reset();
    });

    this.reimbursementForm.get('other')?.valueChanges.subscribe((val) => {
      if (val && val !== this.submitterTypeValue) {
        this.onToggleSubmitter({ value: val });
      }
    });

    this.reimbursementForm.get('requestnumber')?.valueChanges.subscribe((value) => {
      if (this.postType !== 'add') return;
      if (value !== undefined && value !== '') {
        this.onRequestNumberChange(value);
      } else {
        this.cityDrp = [];
        this.selectedRequestStateId = undefined;
        this.selectedRequestDistrictId = undefined;
        this.selectedRequestManagerImprest = undefined;
        this.lodgingMaxAmount = undefined;
        this.foodMaxAmount = undefined;
        this.lodgingForm?.patchValue({ state: undefined, city: undefined }, { emitEvent: false });
        this.foodForm?.patchValue({ state: undefined, city: undefined }, { emitEvent: false });
        this.cdr.detectChanges();
      }
    });
  }

  bindRealTimeTotalKmCalculation() {
    const startControl = this.conveyanceForm.get('startMeterRead');
    const endControl = this.conveyanceForm.get('endMeterRead');
    if (startControl && endControl) {
      startControl.valueChanges.subscribe(() => this.updateTotalKm());
      endControl.valueChanges.subscribe(() => this.updateTotalKm());
    }
  }

  updateTotalKm() {
    const start = +this.conveyanceForm.get('startMeterRead')?.value || 0;
    const end = +this.conveyanceForm.get('endMeterRead')?.value || 0;
    const total = end >= start ? end - start : 0;
    this.conveyanceForm.get('totalKm')?.setValue(total, { emitEvent: false });
  }

  // ================= DRAWER & DIALOG LOGIC =================

  showDialog(mode: 'add' | 'edit' | 'view', data?: any): void {
    this.dialogMode = mode;
    this.postType = mode === 'edit' ? 'update' : mode;
    this.visible = true;
    this.isMaximized = false;

    if (mode === 'add') {
      this.header = 'Add ' + this.FormName + ' Request';
      this.headerIcon = 'pi pi-plus';
      this.clearForms();
      this.onToggleSubmitter({ value: 'Self' });
    } else if (data && (mode === 'edit' || mode === 'view')) {
      this.header = mode === 'view' ? 'View ' + this.FormName + ' Request' : 'Edit ' + this.FormName + ' Request';
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
    this.conveyanceChildData = [];
    this.lodgingChildData = [];
    this.foodExpChildData = [];
    this.laundryChildData = [];
    this.otherExpenseChildData = [];
    this.selectedItem = null;
    this.postType = 'add';

    this.reimbursementForm.enable({ emitEvent: false });

    this.reimbursementForm.patchValue({
      other: '',
      submitType: 10001,
    });
    this.submitterTypeValue = 'Self';
    this.minDate = new Date();
    this.maxDate = new Date();
    this.isConveyanceType = false; // Reset to show all tabs
    this.cityDrp = [];
    this.selectedRequestStateId = undefined;
    this.selectedRequestDistrictId = undefined;
    this.selectedRequestManagerImprest = undefined;
    this.lodgingMaxAmount = undefined;
    this.foodMaxAmount = undefined;

    if (this.allRequestNo.length > 0) {
      this.filterRequestNoBySubmitType();
    }
  }

  GetEmployeeDataForOther() {
    this.userService
      .getQuestionPaper(`uspGetFillDrpDown|table=reportingUser|appUserId=${this.userId}`)
      .subscribe(
        (res: any) => {
          this.EmployeeData = res['table'];
          this.cdr.detectChanges();
        },
        (error) => console.error('Error fetching EmployeeData:', error)
      );
  }

  onToggleSubmitter(event: any): void {
    const selectedValue = this.reimbursementForm.get('other')?.value || event?.value || event;
    this.submitterTypeValue = selectedValue;
    const selectedOtherEmpId = this.reimbursementForm.get('EmployeeDataforother')?.value;
    this.requestNo = [];
    this.reimbursementForm.get('requestnumber')?.setValue('');
    this.reimbursementForm.get('requestnumber')?.markAsUntouched();
    this.reimbursementForm.get('requestnumber')?.updateValueAndValidity();

    if (selectedValue === 'Self') {
      this.selectedEmployeeId = sessionStorage.getItem('userId') || '';
      this.reimbursementForm.patchValue(
        {
          other: selectedValue,
          EmployeeDataforother: '',
        },
        { emitEvent: false }
      );
      this.getEmployeeData();
      this.Employeeuserid();
    } else {
      this.selectedEmployeeId = selectedOtherEmpId || '';
      this.reimbursementForm.patchValue(
        {
          other: selectedValue,
          EmployeeDataforother: selectedOtherEmpId || '',
        },
        { emitEvent: false }
      );

      if (selectedOtherEmpId) {
        this.getEmployeeData();
        this.Employeeuserid();
      } else {
        this.reimbursementForm.patchValue({
          name: '',
          designation: '',
        });
      }
    }

    this.updateValidatorsBasedOnSubmitType();
    this.cdr.detectChanges();
  }

  onEmployeeChange(event?: any): void {
    const selectedDrpValue =
      event?.value || this.reimbursementForm.get('EmployeeDataforother')?.value || '';
    this.selectedEmployeeId = selectedDrpValue;
    const selectedUser = this.EmployeeData.find(
      (user) => user.drpValue === Number(selectedDrpValue)
    );
    const selectedDrpOption = selectedUser ? selectedUser.drpOption : '';
    const selectedUserId = selectedUser ? selectedUser.userId : '';
    this.appuserid = selectedDrpOption;
    this.getEmployeeData(selectedUserId);
    if (this.submitterTypeValue !== 'Self') {
      this.Employeeuserid();
    }
    if (this.postType === 'update') {
      this.Employeeuserid(this.selectedItem?.requestId, this.selectedItem?.reqNo);
    }
  }

  getEmployeeData(selectedUserId?: string) {
    if (selectedUserId) {
      this.appuserid = selectedUserId;
    } else if (this.submitterTypeValue === 'Self') {
      this.appuserid = sessionStorage.getItem('userId') || '';
    } else if (this.submitterTypeValue === 'Other') {
      const rawValue = this.selectedEmployeeId || '';
      this.appuserid = rawValue.includes('-') ? rawValue.split('-')[0].trim() : rawValue;
    }

    this.userService.getQuestionPaper('uspGetPersonalInfoHome|UserId=' + this.appuserid).subscribe(
      (res: any) => {
        this.userInfo = res['table']?.[0];
        if (!this.reimbursementForm.get('name')?.value) {
          this.reimbursementForm.get('name')?.enable();
          this.reimbursementForm.get('designation')?.enable();
          this.reimbursementForm.patchValue({
            name: this.userInfo ? this.userInfo.name || this.userInfo.empnam : '',
            designation: this.userInfo ? this.userInfo.designation : '',
          });
          this.reimbursementForm.get('name')?.disable();
          this.reimbursementForm.get('designation')?.disable();
        }
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    );
  }

  Employeeuserid(requestIdToAdd?: number, reqNoToAdd?: string) {
    const selectedTypeAtCall = this.submitterTypeValue || 'Self';
    const rawValue = this.reimbursementForm.get('EmployeeDataforother')?.value || '';
    let empHeadId = '';

    if (selectedTypeAtCall === 'Self') {
      empHeadId = sessionStorage.getItem('UserIdToken') || sessionStorage.getItem('userId') || '';
    } else {
      // Handle "Other" - get employee ID from dropdown
      if (rawValue) {
        // Find the employee from EmployeeData array using drpValue
        const selectedUser = this.EmployeeData.find((user) => user.drpValue === Number(rawValue));

        if (selectedUser && selectedUser.userId) {
          // Use userId from the employee data
          empHeadId = selectedUser.userId.toString();
        } else if (rawValue.includes('-')) {
          // Handle "Name - ID" format if present
          empHeadId = rawValue.split('-')[1].trim();
        } else if (!isNaN(Number(rawValue))) {
          // If it's already a number, use it as is
          empHeadId = rawValue;
        }
      } else {
        // No employee selected yet, can't make API call
        return;
      }
    }

    if (!empHeadId) {
      return;
    }

    this.userService
      .getQuestionPaper(
        `uspGetExpenseMasters|action=TOURREQNO|type=${selectedTypeAtCall}|empHeadId=${empHeadId}|appUserId=${this.userId}`
      )
      .subscribe(
        (res: any) => {
          const table = res['table'] || [];
          const nextAll = requestIdToAdd && reqNoToAdd
            ? (table.some((item: any) => Number(item.drpValue) === Number(requestIdToAdd))
              ? table
              : [...table, { drpValue: requestIdToAdd, drpOption: reqNoToAdd }])
            : table;
          setTimeout(() => {
            this.allRequestNo = nextAll;
            this.filterRequestNoBySubmitType();
            if (requestIdToAdd && reqNoToAdd) {
              const exists = this.requestNo.some(
                (item) => Number(item.drpValue) === Number(requestIdToAdd)
              );
              if (!exists) {
                this.requestNo.push({ drpValue: requestIdToAdd, drpOption: reqNoToAdd });
              }
            }
            this.cdr.detectChanges();
          }, 0);
        },
        (error) => console.error('Error fetching tour request numbers:', error)
      );
  }

  getTravelByDrp(submitTypeValue: number | string) {
    let action = '';
    if (submitTypeValue == 10001) action = 'TRAVELTYPE';
    else if (submitTypeValue == 10003) action = 'TRAVELTYPECONVEY';
    else action = 'TRAVELTYPE'; // Default fallback

    const districtId = sessionStorage.getItem('District');

    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=${action}|id=0|appUserId=${this.userId}|districtId=${districtId}|appUserRole=${this.currentRole}`
      )
      .subscribe(
        (res: any) => {
          this.travelByDrpAll = (res['table'] || []).map((item: any) => ({
            ...item,
            drpValue: Number(item.drpValue),
          }));
          this.cdr.detectChanges();
        },
        (error) => console.error('Error fetching travelByDrp:', error)
      );
  }

  getExpenseTypDrp() {
    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=EXPANSETYPE|id=0|appUserId=${this.userId
        }|districtId=${sessionStorage.getItem('District')}|appUserRole=${this.currentRole}`
      )
      .subscribe(
        (res: any) => {
          this.expenseTypeDrp = res['table'] || [];
          this.cdr.detectChanges();
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getStateDrp(callback?: () => void) {
    this.userService.getQuestionPaper(`uspGetStateCityDrp|action=STATE|id=0`).subscribe(
      (res: any) => {
        const raw = res['table'] || [];
        this.stateDrp = raw
          .filter((r: any) => r.drpValue !== undefined && r.drpValue !== '' && typeof r.drpValue !== 'object')
          .map((r: any) => ({
            drpValue: Number(r.drpValue),
            drpOption: (r.drpOption ?? r.drpoption) ?? String(r.drpValue),
          }));
        this.cdr.detectChanges();
        callback?.();
      },
      () => {
        this.stateDrp = [];
        this.cdr.detectChanges();
        callback?.();
      }
    );
  }

  getCityDrp(stateId: number | undefined, callback?: () => void) {
    if (stateId === undefined) {
      this.cityDrp = [];
      this.cdr.detectChanges();
      callback?.();
      return;
    }
    this.userService.getQuestionPaper(`uspGetCityList|action=CITY|id=${stateId}`).subscribe(
      (res: any) => {
        const raw = res['table'] || [];
        this.cityDrp = raw
          .filter((r: any) => r.drpValue !== undefined && r.drpValue !== '' && typeof r.drpValue !== 'object')
          .map((r: any) => ({
            drpValue: Number(r.drpValue),
            drpOption: (r.drpOption ?? r.drpoption) ?? String(r.drpValue),
          }));
        this.cdr.detectChanges();
        callback?.();
      },
      () => {
        this.cityDrp = [];
        this.cdr.detectChanges();
        callback?.();
      }
    );
  }

  getCityList(stateId: number) {
    return this.userService.getQuestionPaper(`uspGetCityList|action=CITY|id=${stateId}`).pipe(
      map((res: any) => {
        const raw = res['table'] || [];
        return raw
          .filter((r: any) => r.drpValue !== undefined && r.drpValue !== '' && typeof r.drpValue !== 'object')
          .map((r: any) => ({
            drpValue: Number(r.drpValue),
            drpOption: (r.drpOption ?? r.drpoption) ?? String(r.drpValue),
          }));
      }),
      catchError(() => of([]))
    );
  }

  private enrichLodgingAndFoodStateCityNames() {
    const allItems = [...this.lodgingChildData, ...this.foodExpChildData];
    const uniqueStateIds = [...new Set(allItems.map((i: any) => i.state).filter((s: any) => s !== undefined && s !== null && s !== ''))] as number[];
    if (uniqueStateIds.length === 0) {
      this.cdr.detectChanges();
      return;
    }
    forkJoin(uniqueStateIds.map((stateId) => this.getCityList(stateId).pipe(map((cities) => ({ stateId, cities }))))).subscribe({
      next: (results) => {
        const cityMap = new Map<number, Map<number, string>>();
        results.forEach((r: { stateId: number; cities: any[] }) => {
          const m = new Map<number, string>();
          (r.cities || []).forEach((c: any) => m.set(Number(c.drpValue), c.drpOption));
          cityMap.set(r.stateId, m);
        });
        const setNames = (item: any) => {
          const stateId = item.state != null ? Number(item.state) : undefined;
          const cityId = item.city != null ? Number(item.city) : undefined;
          item.stateName = stateId != null && this.stateDrp?.length
            ? (this.stateDrp.find((s: any) => s.drpValue === stateId)?.drpOption ?? item.stateName ?? '-')
            : (item.stateName ?? '-');
          item.cityName = stateId != null && cityId != null && cityMap.has(stateId)
            ? (cityMap.get(stateId)?.get(cityId) ?? item.cityName ?? '-')
            : (item.cityName ?? '-');
        };
        this.lodgingChildData.forEach(setNames);
        this.foodExpChildData.forEach(setNames);
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges(),
    });
  }

  private getEmpHeadIdForLimit(): string {
    const type = this.submitterTypeValue || 'Self';
    if (type === 'Self') {
      return sessionStorage.getItem('UserIdToken') || sessionStorage.getItem('userId') || this.userId || '0';
    }
    const raw = this.reimbursementForm.get('EmployeeDataforother')?.value || '';
    if (!raw) return '0';
    const u = this.EmployeeData?.find((x: any) => x.drpValue === Number(raw));
    if (u?.userId) return String(u.userId);
    if (typeof raw === 'string' && raw.includes('-')) return (raw.split('-')[1]?.trim()) || '0';
    return isNaN(Number(raw)) ? '0' : String(raw);
  }

  getMaxExpenseLimit(action: 'Hotel' | 'Food', districtId: number, formContext: 'lodging' | 'food') {
    const type = (this.submitterTypeValue || 'Self').toLowerCase();
    const empHeadId = this.getEmpHeadIdForLimit();
    const q = `uspGetMaxExpenseLimit|action=${action}|type=${type}|empHeadId=${empHeadId}|districtId=${districtId}|appUserId=${this.userId}`;
    this.userService.getQuestionPaper(q).subscribe(
      (res: any) => {
        const row = Array.isArray(res['table']) && res['table'].length ? res['table'][0] : undefined;
        const raw = Boolean(row) ? (row.maxAmount ?? row.amount ?? row.limit ?? row.maxLimit ?? row.maxExpense ?? row.maxExpenseLimit) : undefined;
        const num = raw !== undefined && raw !== '' ? Number(raw) : NaN;
        const value = Number.isFinite(num) ? num : undefined;
        if (formContext === 'lodging') this.lodgingMaxAmount = value;
        else this.foodMaxAmount = value;
        this.cdr.detectChanges();
      },
      () => {
        if (formContext === 'lodging') this.lodgingMaxAmount = undefined;
        else this.foodMaxAmount = undefined;
        this.cdr.detectChanges();
      }
    );
  }

  onLodgingCityChange(event: any) {
    const cityId = event?.value ?? event;
    if (cityId !== undefined && cityId !== '' && typeof cityId !== 'object') {
      this.getMaxExpenseLimit('Hotel', Number(cityId), 'lodging');
    } else {
      this.lodgingMaxAmount = undefined;
      this.cdr.detectChanges();
    }
  }

  onFoodCityChange(event: any) {
    const cityId = event?.value ?? event;
    if (cityId !== undefined && cityId !== '' && typeof cityId !== 'object') {
      this.getMaxExpenseLimit('Food', Number(cityId), 'food');
    } else {
      this.foodMaxAmount = undefined;
      this.cdr.detectChanges();
    }
  }

  onLodgingStateChange(event: any) {
    const stateId = event?.value ?? event;
    this.getCityDrp(stateId === undefined || stateId === '' ? undefined : Number(stateId));
    this.lodgingForm.get('city')?.setValue(undefined, { emitEvent: false });
    this.cdr.detectChanges();
  }

  onFoodStateChange(event: any) {
    const stateId = event?.value ?? event;
    this.getCityDrp(stateId === undefined || stateId === '' ? undefined : Number(stateId));
    this.foodForm.get('city')?.setValue(undefined, { emitEvent: false });
    this.cdr.detectChanges();
  }

  getPermission() {
    this.userService
      .getQuestionPaper(
        `uspGetPermissionByactivity_role|actitvityName=${this.FormName}|appUserId=${this.userId}|appUserRole=${this.currentRole}`
      )
      .subscribe(
        (res: any) => {
          if (res['table']?.length !== 0) {
            this.wfLevel = (res['table'][0]['text'] || '').toLowerCase();
            console.log('wfLevel', this.wfLevel);
            this.isApprove = res['table'][0]['wfApprove'];
            this.isForward = res['table'][0]['wfForword'];
            this.isReject = res['table'][0]['wfReject'];
            this.isReturn = res['table'][0]['wfReturn'];
            this.isSave = res['table'][0]['wfSave'];
          } else {
            this.wfLevel = '';
            this.isApprove = false;
            this.isForward = false;
            this.isReject = false;
            this.isReturn = false;
            this.isSave = false;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  // 6. Handle "Submit For" Change (Tour vs Conveyance)
  onChangeSubmitFrom(value?: any) {
    const typeId = Number(this.reimbursementForm.get('submitType')?.value || value);
    this.getTravelByDrp(typeId);

    // Filter Request No dropdown based on submitType
    this.filterRequestNoBySubmitType();

    // Clear selected request number if it doesn't match the new type
    const currentRequest = this.reimbursementForm.get('requestnumber')?.value;
    if (currentRequest) {
      const selectedRequest = this.allRequestNo.find(
        (req) => Number(req.drpValue) === Number(currentRequest)
      );
      if (selectedRequest && Number(selectedRequest.requestTypeId) !== typeId) {
        this.reimbursementForm.get('requestnumber')?.setValue('');
        this.reimbursementForm.get('requestnumber')?.markAsUntouched();
      }
    }

    // Handle Tour vs Conveyance specific logic
    const travelToCtrl = this.reimbursementForm.get('travelTo');
    const expenseTypeCtrl = this.reimbursementForm.get('expenseTypeId');
    const travelByCtrl = this.reimbursementForm.get('travelById');

    if (typeId === 10003) {
      this.isConveyanceType = true;
      // In add mode, enable ALL fields - user can edit everything
      if (this.postType === 'add') {
        travelToCtrl?.enable({ emitEvent: false });
        expenseTypeCtrl?.enable({ emitEvent: false });
        travelByCtrl?.enable({ emitEvent: false });
      } else if (this.postType === 'view') {
        // In view mode, disable all fields
        travelToCtrl?.disable({ emitEvent: false });
        expenseTypeCtrl?.disable({ emitEvent: false });
        travelByCtrl?.disable({ emitEvent: false });
      } else {
        // In update mode, enable fields but follow business logic
        travelToCtrl?.disable({ emitEvent: false }); // Conveyance doesn't need travelTo
        expenseTypeCtrl?.disable({ emitEvent: false }); // Conveyance doesn't need expenseType
        travelByCtrl?.enable({ emitEvent: false }); // But travelBy is needed
      }
      this.conveyanceForm.patchValue({ expanseType: 'Conveyance' });
    } else if (typeId === 10001) {
      this.isConveyanceType = false;
      // In add mode, enable ALL fields
      if (this.postType === 'add') {
        travelToCtrl?.enable({ emitEvent: false });
        travelByCtrl?.enable({ emitEvent: false });
        expenseTypeCtrl?.enable({ emitEvent: false });
      } else if (this.postType === 'view') {
        // In view mode, disable all fields
        travelToCtrl?.disable({ emitEvent: false });
        travelByCtrl?.disable({ emitEvent: false });
        expenseTypeCtrl?.disable({ emitEvent: false });
      } else {
        // In update mode, follow business logic
        travelToCtrl?.disable({ emitEvent: false }); // Tour type doesn't need travelTo
        travelByCtrl?.disable({ emitEvent: false }); // Tour type doesn't need travelBy
        expenseTypeCtrl?.enable({ emitEvent: false });
      }
      this.conveyanceForm.patchValue({ expanseType: 'Fare' });
    } else {
      this.isConveyanceType = false;
      this.conveyanceForm.patchValue({ expanseType: 'Fare' });
      // In add mode, enable ALL fields
      if (this.postType === 'add') {
        travelToCtrl?.enable({ emitEvent: false });
        expenseTypeCtrl?.enable({ emitEvent: false });
        travelByCtrl?.enable({ emitEvent: false });
      } else if (this.postType === 'view') {
        // In view mode, disable all fields
        travelToCtrl?.disable({ emitEvent: false });
        expenseTypeCtrl?.disable({ emitEvent: false });
        travelByCtrl?.disable({ emitEvent: false });
      } else {
        // In update mode, enable all fields
        travelToCtrl?.enable({ emitEvent: false });
        expenseTypeCtrl?.enable({ emitEvent: false });
        travelByCtrl?.enable({ emitEvent: false });
      }
    }

    if (value !== undefined && this.postType === 'add') {
      this.conveyanceChildData = [];
      this.lodgingChildData = [];
      this.foodExpChildData = [];
      this.laundryChildData = [];
      this.otherExpenseChildData = [];
    }
  }

  onRequestNumberChange(value: any) {
    const searchArray =
      this.allRequestNo && this.allRequestNo.length > 0 ? this.allRequestNo : this.requestNo;

    if (searchArray && Array.isArray(searchArray)) {
      const matched = searchArray.find((item) => item.drpValue === Number(value));
      if (matched) {
        const parseLocalDate = (dateStr: string): Date => {
          const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
          return new Date(year, month - 1, day);
        };

        const fromDate = matched.fromDate ? parseLocalDate(matched.fromDate) : null;
        const toDate = matched.toDate ? parseLocalDate(matched.toDate) : null;

        this.minDateother = fromDate;
        const submitTypeId = matched.requestTypeId || '';
        this.getTravelByDrp(submitTypeId);

        const stateId = matched.stateId !== undefined && matched.stateId !== '' && typeof matched.stateId !== 'object' ? Number(matched.stateId) : undefined;
        const districtId = matched.districtId !== undefined && matched.districtId !== '' && typeof matched.districtId !== 'object' ? Number(matched.districtId) : undefined;
        this.selectedRequestStateId = stateId;
        this.selectedRequestDistrictId = districtId;
        const mgr = matched.managerImprest !== undefined && matched.managerImprest !== '' && typeof matched.managerImprest !== 'object' ? Number(matched.managerImprest) : undefined;
        this.selectedRequestManagerImprest = Number.isFinite(mgr) ? mgr : undefined;

        this.getCityDrp(stateId, () => {
          setTimeout(() => {
            this.reimbursementForm.patchValue({
              imprest: matched.approvedImprest ?? matched.managerImprest ?? '',
              expensePurpose: matched.purpose || '',
              fromDate: fromDate,
              toDate: toDate,
              travelFrom: matched.travelSource || '',
              travelTo: matched.travelDestination || '',
              submitType: submitTypeId,
              travelById: matched.travelModeId ? Number(matched.travelModeId) : '',
              expenseTypeId: matched.expenseTypeId ? Number(matched.expenseTypeId) : '',
            });
            this.lodgingForm.patchValue({ state: stateId, city: undefined }, { emitEvent: false });
            this.foodForm.patchValue({ state: stateId, city: undefined }, { emitEvent: false });
            this.onChangeSubmitFrom(true);

            if (this.postType === 'add') {
              this.reimbursementForm.enable({ emitEvent: false });
            } else {
              this.reimbursementForm.enable({ emitEvent: false });
              this.disableControls(
                'submitType',
                'imprest',
                'expensePurpose',
                'fromDate',
                'name',
                'designation',
                'travelFrom'
              );
              if (submitTypeId === 10001) {
                this.enableControls('travelTo', 'expenseTypeId', 'travelById');
              } else {
                this.disableControls('travelTo', 'expenseTypeId', 'travelById');
              }
            }
            this.reimbursementForm.updateValueAndValidity({ emitEvent: false });
            this.cdr.detectChanges();
          }, 100);
        });
      }
    }
  }

  enableControls(...controlNames: string[]): void {
    controlNames.forEach((name) => {
      const control = this.reimbursementForm.get(name);
      if (control) {
        control.enable({ emitEvent: false });
      }
    });
  }

  disableControls(...controlNames: string[]): void {
    controlNames.forEach((name) => {
      const control = this.reimbursementForm.get(name);
      if (control) {
        control.disable({ emitEvent: false });
      }
    });
  }

  // Filter Request No based on Submit Type (Tour = 10001, Conveyance = 10003)
  filterRequestNoBySubmitType(): void {
    const submitType = Number(this.reimbursementForm.get('submitType')?.value);

    if (submitType && this.allRequestNo.length > 0) {
      this.requestNo = this.allRequestNo.filter((req) => Number(req.requestTypeId) === submitType);
    } else if (this.allRequestNo.length > 0) {
      // If no submitType selected, show all
      this.requestNo = [...this.allRequestNo];
    } else {
      // If allRequestNo is empty, keep requestNo empty
      this.requestNo = [];
    }
    this.cdr.detectChanges();
  }

  // ================= UI HELPERS & CALCULATIONS =================

  onChangeTravelBy(event: any) {
    const val = event.value || event.target?.value; // PrimeNG dropdown event
    // Logic: Enable total KM only if Car (10004) or Bike (10002)
    if (val == 10004 || val == 10002) {
      this.conveyanceForm.get('totalKm')?.enable();
      this.conveyanceForm.get('attachment')?.clearValidators();
      this.conveyanceForm.get('attachment')?.updateValueAndValidity();
    } else if (val == 10003) {
      this.conveyanceForm.get('totalKm')?.disable();
      this.conveyanceForm.get('attachment')?.clearValidators();
      this.conveyanceForm.get('attachment')?.updateValueAndValidity();
    } else {
      this.conveyanceForm.get('totalKm')?.disable();
      this.conveyanceForm.get('attachment')?.setValidators(Validators.required);
      this.conveyanceForm.get('attachment')?.updateValueAndValidity();
    }
  }

  calculateTotalKm() {
    const start = Number(this.conveyanceForm.get('startMeterRead')?.value) || 0;
    const end = Number(this.conveyanceForm.get('endMeterRead')?.value) || 0;
    if (end > start) {
      this.conveyanceForm.get('totalKm')?.setValue(end - start, { emitEvent: false });
    } else {
      this.conveyanceForm.get('totalKm')?.setValue(0, { emitEvent: false });
    }
  }

  // ================= ADD / DELETE ROWS LOGIC =================

  AddRow(formName: string) {
    // 1. Validate Form
    const form = this[formName as keyof this] as FormGroup;
    if (form.invalid) {
      form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill required fields',
      });
      return;
    }

    const val = form.value;

    // 2. Prepare Object based on Form Name
    if (formName === 'conveyanceForm') {
      const fromDateStr = this.datePipe.transform(val.fromDate, 'yyyy-MM-dd') || '';
      const toDateStr = this.datePipe.transform(val.toDate, 'yyyy-MM-dd') || '';

      if (fromDateStr > toDateStr) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'From Date cannot be greater than To Date.',
        });
        return;
      }

      if (val.startMeterRead > val.endMeterRead) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Start Meter Reading cannot be greater than End Reading',
        });
        return;
      }

      const rowData = {
        expanseType: val.expanseType,
        travelById: val.travelById,
        travelBy: this.travelByDrpAll.find((x) => x.drpValue == val.travelById)?.drpOption || '',
        text: val.text || '',
        fromDate: fromDateStr,
        toDate: toDateStr,
        startMeterRead: val.startMeterRead || 0,
        endMeterRead: val.endMeterRead || 0,
        totalKm: val.totalKm || 0,
        amount: val.amount || 0,
        attachment: val.attachment || '',
        travelFrom: val.travelFrom || '',
        travelTo: val.travelTo || '',
        id: 0,
      };
      this.conveyanceChildData.push(rowData);
    } else if (formName === 'lodgingForm') {
      const fromDateStr = this.datePipe.transform(val.fromDate, 'yyyy-MM-dd') || '';
      const toDateStr = this.datePipe.transform(val.toDate, 'yyyy-MM-dd') || '';

      if (fromDateStr > toDateStr) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'From Date cannot be greater than To Date.',
        });
        return;
      }

      const lodgingAmt = Number(val.amount) || 0;
      const fromD = val.fromDate ? new Date(val.fromDate) : null;
      const toD = val.toDate ? new Date(val.toDate) : null;
      const oneDayMs = 1000 * 60 * 60 * 24;
      let days = 1;
      if (fromD && toD) {
        const checkin = new Date(fromD.getFullYear(), fromD.getMonth(), fromD.getDate());
        const checkout = new Date(toD.getFullYear(), toD.getMonth(), toD.getDate());
        const diffDays = Math.floor((checkout.getTime() - checkin.getTime()) / oneDayMs);
        days = Math.max(1, diffDays);
      }
      const allowedLodgingMax = Number.isFinite(this.lodgingMaxAmount) ? (this.lodgingMaxAmount ?? 0) * days : undefined;
      if (allowedLodgingMax !== undefined && lodgingAmt > allowedLodgingMax) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Lodging amount cannot exceed ₹${allowedLodgingMax} (₹${this.lodgingMaxAmount} per day × ${days} day(s)).`,
        });
        return;
      }
      if (Number.isFinite(this.selectedRequestManagerImprest) && lodgingAmt > (this.selectedRequestManagerImprest ?? 0)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Amount cannot exceed ₹${this.selectedRequestManagerImprest} (manager imprest limit per day).`,
        });
        return;
      }

      const stateName = (val.state !== undefined && val.state !== '') ? (this.stateDrp.find((s: any) => s.drpValue === val.state)?.drpOption ?? String(val.state)) : '-';
      const cityName = (val.city !== undefined && val.city !== '') ? (this.cityDrp.find((c: any) => c.drpValue === val.city)?.drpOption ?? String(val.city)) : '-';
      this.lodgingChildData.push({
        text: val.text,
        state: val.state,
        city: val.city,
        stateName,
        cityName,
        fromDate: fromDateStr,
        toDate: toDateStr,
        amount: val.amount,
        attachment: val.attachment,
        id: 0,
      });
    } else if (formName === 'foodForm') {
      const foodAmt = Number(val.amount) || 0;
      const days = 1;
      const allowedFoodMax = Number.isFinite(this.foodMaxAmount) ? (this.foodMaxAmount ?? 0) * days : undefined;
      if (allowedFoodMax !== undefined && foodAmt > allowedFoodMax) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Food amount cannot exceed ₹${allowedFoodMax} (₹${this.foodMaxAmount} per day × ${days} day(s) for this trip).`,
        });
        return;
      }
      if (Number.isFinite(this.selectedRequestManagerImprest) && foodAmt > (this.selectedRequestManagerImprest ?? 0)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Amount cannot exceed ₹${this.selectedRequestManagerImprest} (manager imprest limit per day).`,
        });
        return;
      }

      const stateName = (val.state !== undefined && val.state !== '') ? (this.stateDrp.find((s: any) => s.drpValue === val.state)?.drpOption ?? String(val.state)) : '-';
      const cityName = (val.city !== undefined && val.city !== '') ? (this.cityDrp.find((c: any) => c.drpValue === val.city)?.drpOption ?? String(val.city)) : '-';
      this.foodExpChildData.push({
        text: val.text?.label || val.text || '',
        state: val.state,
        city: val.city,
        stateName,
        cityName,
        expenseDate: this.datePipe.transform(val.expenseDate, 'yyyy-MM-dd') || '',
        amount: val.amount,
        attachment: val.attachment,
        id: 0,
      });
    } else if (formName === 'laundryForm') {
      this.laundryChildData.push({
        text: val.text,
        expenseDate: this.datePipe.transform(val.expenseDate, 'yyyy-MM-dd') || '',
        amount: val.amount,
        attachment: val.attachment,
        id: 0,
      });
    } else if (formName === 'otherExpForm') {
      this.otherExpenseChildData.push({
        text: val.text,
        expenseDate: this.datePipe.transform(val.expenseDate, 'yyyy-MM-dd') || '',
        amount: val.amount,
        attachment: val.attachment,
        id: 0,
      });
    }

    // 3. Reset Form
    form.reset();

    // 4. Restore Defaults if needed
    if (formName === 'conveyanceForm') {
      form.patchValue({ expanseType: 'Fare', travelById: '' });
    } else if (formName === 'lodgingForm') {
      if (this.stateDrp.length || this.cityDrp.length) {
        this.lodgingForm.patchValue(
          { state: this.selectedRequestStateId ?? undefined, city: undefined },
          { emitEvent: false }
        );
      }
    } else if (formName === 'foodForm') {
      if (this.stateDrp.length || this.cityDrp.length) {
        this.foodForm.patchValue(
          { state: this.selectedRequestStateId ?? undefined, city: undefined },
          { emitEvent: false }
        );
      }
      form.patchValue({ text: '' });
    }
  }

  deleteChildTableRow(arrayName: string, index: number) {
    this.openConfirmation(
      'Confirm?',
      'Are you sure you want to remove?',
      'delete',
      arrayName,
      index
    );
  }

  confirmDeleteRow(arrayName: string, index: number) {
    const arr = this[arrayName as keyof this] as any[];
    if (Array.isArray(arr)) {
      arr.splice(index, 1);
    }
  }

  // ================= MAIN SUBMIT LOGIC =================

  OnSubmitModal() {
    this.updateValidatorsBasedOnSubmitType();
    if (this.reimbursementForm.invalid) {
      this.reimbursementForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    if (
      this.conveyanceChildData.length === 0 &&
      this.lodgingChildData.length === 0 &&
      this.foodExpChildData.length === 0 &&
      this.laundryChildData.length === 0 &&
      this.otherExpenseChildData.length === 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert!',
        detail: 'Please fill any other details!',
      });
      this.paramvaluedata = '';
      return;
    }

    this.paramvaluedata = '';
    let submitTypeId = this.reimbursementForm.get('submitType')?.value;
    let submitType = this.getSubmitTypeLabel(submitTypeId);
    let fromDate = this.datePipe.transform(this.reimbursementForm.get('fromDate')?.value, 'yyyy-MM-dd') || '';
    let toDate = this.datePipe.transform(this.reimbursementForm.get('toDate')?.value, 'yyyy-MM-dd') || '';
    let travelFrom = this.reimbursementForm.get(`travelFrom`)?.value || '';
    let travelTo = this.reimbursementForm.get(`travelTo`)?.value || '';
    let expensePurpose = this.reimbursementForm.get(`expensePurpose`)?.value || '';
    let expenseTypeId = this.reimbursementForm.get(`expenseTypeId`)?.value || '';
    let travelById = this.reimbursementForm.get(`travelById`)?.value || '';
    let requestId = this.reimbursementForm.get(`requestnumber`)?.value || '';
    let imprest = this.reimbursementForm.get(`imprest`)?.value ? this.reimbursementForm.get(`imprest`)?.value : 0;
    let submitFor = this.submitterTypeValue;

    if (fromDate && toDate && fromDate > toDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'From Date cannot be greater than to To Date.',
      });
      return;
    }

    this.paramvaluedata = `expensePurpose=${expensePurpose}|requestId=${requestId}|empId=${this.userInfo ? this.userInfo.employeeId : 0}|expenseTypeId=${expenseTypeId ? expenseTypeId : 0}|travelById=${travelById ? travelById : 0}|travelFrom=${travelFrom ? travelFrom : ''}|travelTo=${travelTo ? travelTo : ''}|imprest=${imprest}|fromDate=${fromDate}|toDate=${toDate}|SubmitFrom=${submitType}|conveyenceJson=${JSON.stringify(this.conveyanceChildData)}|lodgingJson=${JSON.stringify(this.isConveyanceType ? [] : this.lodgingChildData)}|foodExpJson=${JSON.stringify(this.isConveyanceType ? [] : this.foodExpChildData)}|laundryJson=${JSON.stringify(this.isConveyanceType ? [] : this.laundryChildData)}|submitFor=${submitFor}|otherExpDetail=${JSON.stringify(this.isConveyanceType ? [] : this.otherExpenseChildData)}`;
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1');
  }

  onSubmit() {
    this.OnSubmitModal();
  }

  submitcall() {
    this.isLoading = true;
    let query = '';
    let SP = '';

    if (this.postType == 'update') {
      query = `activity=${this.FormName}|id=${this.selectedItem?.id}|${this.paramvaluedata}|appUserId=${this.userId}|appUserRole=${this.currentRole}`;
      SP = 'uspPostUpdateExpanseDetail';
    } else {
      query = `activity=${this.FormName}|${this.paramvaluedata}|appUserId=${this.userId}|appUserRole=${this.currentRole}`;
      SP = 'uspPostExpanseReimbursement';
    }

    this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe(
      (datacom: any) => {
        this.isLoading = false;
        if (datacom != '') {
          const resultarray = datacom.split('-');
          if (resultarray[1] == 'success') {
            this.getViewData(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail:
                this.postType == 'update'
                  ? 'Data Updated Successfully.'
                  : 'Data Saved Successfully.',
            });
            this.visible = false;
            if (this.postType !== 'update') {
              this.clearForms();
            }
          } else if (resultarray[0] == '2') {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: resultarray[1],
            });
          } else if (datacom == 'Error occured while processing data!--error') {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Something went wrong!',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: datacom,
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Something went wrong!',
          });
        }
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status == 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'You are not authorized!',
          });
        } else if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message?.toString() || 'Server Error',
          });
        }
      }
    );
  }

  updateValidatorsBasedOnSubmitType() {
    if (this.dialogMode === 'view') return;
    const travelToCtrl = this.reimbursementForm.get('travelTo');
    const travelByIdCtrl = this.reimbursementForm.get('travelById');
    const expenseTypeIdCtrl = this.reimbursementForm.get('expenseTypeId');
    const employeeDataCtrl = this.reimbursementForm.get('EmployeeDataforother');
    const submitTypeValue = this.reimbursementForm.get('submitType')?.value;
    const submitTypeNum = Number(submitTypeValue);

    if (submitTypeNum === 10001) {
      travelToCtrl?.setValidators([Validators.required, noWhitespaceValidator()]);
      travelByIdCtrl?.setValidators([Validators.required]);
      expenseTypeIdCtrl?.setValidators([Validators.required]);
    } else {
      travelToCtrl?.clearValidators();
      travelByIdCtrl?.clearValidators();
      expenseTypeIdCtrl?.clearValidators();
    }

    if (this.submitterTypeValue === 'Other') {
      employeeDataCtrl?.setValidators([Validators.required]);
    } else {
      employeeDataCtrl?.clearValidators();
    }

    travelToCtrl?.updateValueAndValidity();
    travelByIdCtrl?.updateValueAndValidity();
    expenseTypeIdCtrl?.updateValueAndValidity();
    employeeDataCtrl?.updateValueAndValidity();
  }

  getSubmitTypeLabel(typeId: number): string {
    switch (typeId) {
      case 10001:
        return 'Tour';
      case 10003:
        return 'Conveyance';
      default:
        return '-';
    }
  }

  getSubmitTypeId(label: string): number {
    switch (label) {
      case 'Tour':
        return 10001;
      case 'Conveyance':
        return 10003;
      default:
        return 0;
    }
  }

  /** Formats a date value for display. Handles dd-MM-yyyy, yyyy-MM-dd, ISO and Date. */
  formatDateForDisplay(value: any, format: string = 'yyyy-MM-dd'): string {
    if (value == null || value === '') return '';
    if (value instanceof Date) return this.datePipe.transform(value, format) || '';
    const s = String(value).trim();
    if (!s) return '';
    const ddmmyyyy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(date.getTime()) ? s : (this.datePipe.transform(date, format) || s);
    }
    const date = new Date(s);
    return isNaN(date.getTime()) ? s : (this.datePipe.transform(date, format) || s);
  }

  /** Parses API date (ISO or dd-MM-yyyy) into a local Date for form controls. Returns null if invalid. */
  parseDateForForm(value: any): Date | null {
    if (value == null || value === '') return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const s = String(value).trim();
    if (!s) return null;
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
      const [, y, m, d] = iso;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(date.getTime()) ? null : date;
    }
    const ddmmyyyy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(s);
    return isNaN(date.getTime()) ? null : date;
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl = this.formFields?.find((field) =>
      field.nativeElement.classList.contains('ng-invalid')
    );
    if (firstInvalidControl) {
      firstInvalidControl.nativeElement.scrollIntoView({ behavior: 'smooth' });
      firstInvalidControl.nativeElement.focus();
    }
  }

  // ================= CONFIRMATION DIALOG =================

  openConfirmation(
    title: string,
    msg: string,
    type: string,
    arrayName?: string | number,
    index?: number
  ) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      acceptButtonStyleClass: 'p-button-warning',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        if (type === 'add' || type === 'update' || type === '1') {
          this.submitcall();
        } else if (type === 'delete') {
          if (arrayName && typeof arrayName === 'string' && index !== undefined) {
            // Delete row from child table
            this.confirmDeleteRow(arrayName, index);
          } else if (arrayName && (typeof arrayName === 'number' || !isNaN(Number(arrayName)))) {
            // Delete record by ID
            this.deleteRecords(arrayName);
          }
        } else if (type === 'approval' || type === '4') {
          this.submitApprovalAction(arrayName?.toString() || '');
        } else if (type === '2') {
          this.CustomFormActionActivesubmit(arrayName);
        } else if (type === '3') {
          if (arrayName && typeof arrayName === 'string' && index !== undefined) {
            const array = (this as any)[arrayName];
            if (Array.isArray(array)) {
              array.splice(index, 1);
            }
          }
        } else if (type === '5') {
          this.deleteRecords(arrayName);
        }
      },
    });
  }

  openConfirmDialog(title: string, msg: string, id: any, option?: string) {
    this.openConfirmation(title, msg, option || '1', id);
  }

  openAlertDialog(title: string, msg: string) {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: msg,
    });
  }

  CustomFormActionActivesubmit(id: any) {
    try {
      this.isLoading = true;
      this.userService
        .CustomFormActionActivesubmit(id, this.selectedAction, 'tblExpenseReimbursementHead', this.FormName)
        .subscribe(
          (data: any) => {
            if (data != '') {
              this.isLoading = false;
              var resultarray = data.split('-');
              if (resultarray[1] == 'success') {
                this.getViewData(false);
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success!',
                  detail: 'Data ' + this.selectedAction + ' Successfully.',
                });
                this.selectedAction = null;
                return;
              } else {
                this.isLoading = false;
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Alert!',
                  detail: 'Data cannot be ' + this.selectedAction,
                });
                this.selectedAction = null;
                return;
              }
            }
          },
          (err: HttpErrorResponse) => {
            this.isLoading = false;
            if (err.status == 401) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error!',
                detail: 'You are not authorized!',
              });
            } else if (err.status == 403) {
              this.Customvalidation.loginroute(err.status);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error!',
                detail: err.message.toString(),
              });
            }
          }
        );
    } catch (error) {
      this.isLoading = false;
      console.log('this is error', error);
    }
  }

  onItemAction(item: any, type: string) {
    let action = type == 'Deleted' ? 'Delete' : type;
    this.selectedAction = type;
    let option = type == 'Deleted' ? '5' : '2';
    this.openConfirmDialog('Confirm?', 'Are you sure you want to ' + action + '?', item.id, option);
  }

  // ================= VIEW DATA & PAGINATION =================
  formatTableData(data: any[]) {
    return data.map(row => ({
      ...row,
      fromDate: row.fromDate
        ? this.datePipe.transform(row.fromDate, 'dd-MM-yyyy')
        : '',
      toDate: row.toDate
        ? this.datePipe.transform(row.toDate, 'dd-MM-yyyy')
        : ''
    }));

  }
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No.', isVisible: true, isSortable: false },
    { key: 'wfLevel', header: 'WF Level', isVisible: true, isSortable: false },

    { key: 'serialNo', header: 'Serial No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request No', isVisible: true, isSortable: false },
    { key: 'empName', header: 'Name', isVisible: true, isSortable: false },

    { key: 'designation', header: 'Designation', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'organization', header: 'Organization', isVisible: true, isSortable: false },
    { key: 'expensePurpose', header: 'Expense Purpose', isVisible: true, isSortable: false },

    { key: 'submitFor', header: 'Submit For', isVisible: true, isSortable: false },
    { key: 'expanseType', header: 'Expense Type', isVisible: true, isSortable: false },
    { key: 'travelFrom', header: 'Travel From', isVisible: true, isSortable: false },
    { key: 'travelTo', header: 'Travel To', isVisible: true, isSortable: false },
    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
    { key: 'travelBy', header: 'Travel By', isVisible: true, isSortable: false },
    { key: 'imprest', header: 'Imprest', isVisible: true, isSortable: false },
    { key: 'approvedStatus', header: 'Status', isVisible: true, isSortable: false },
  ];

  getViewData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }
      let procedure =
        this.selectedRequest == 'pending' ? 'uspGetTourExpDetail' : 'uspGetProcessedTourExpDetail';
      this.userService
        .getQuestionPaper(
          `${procedure}|searchText=${this.searchText}|pageIndex=${Number(this.pageNo)}|size=${this.pageSize
          }|districtId=${sessionStorage.getItem('District')}|appUserId=${this.userId}|appUserRole=${this.currentRole
          }`
        )
        .subscribe(
          (res: any) => {
            this.isLoading = false;
            if (Object.keys(res).length > 0) {
              this.showDeleteBtn = false;
              this.showActiveBtn = false;
              this.allViewTableData = this.formatTableData(res['table1'] || []);
              this.paginationCountData = res['table'] || [];
              this.pageNoData = res['table2'] || [];
              this.totalCount = res['table']?.[0]?.totalCnt || 0;
              if (res['table3'] && res['table3'].length) {
                this.showDeleteBtn = res['table3'][0]['deleteBtn'];
                this.showActiveBtn = res['table3'][0]['activeBtn'];
              }
              this.allViewTableData.map((e) => {
                e.approvalDetail = JSON.parse(e?.approvalDetail ? e.approvalDetail : '[]');
                e.isManagerForwarded = this.hasManagerForwarded(e.approvalDetail);
              });
            }
            this.cdr.detectChanges();
          },
          (err: HttpErrorResponse) => {
            this.isLoading = false;
            if (err.status == 403 || err.status == 401) {
              this.Customvalidation.loginroute(err.status);
              console.log('err', err);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error!',
                detail: 'Failed to load data.',
              });
            }
            this.router.navigate(['/login']);
          }
        );
    } catch (error) {
      this.isLoading = false;
      console.error('Unexpected error:', error);
    }
    this.cdr.detectChanges();
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

  deleteRecords(id: any) {
    this.isLoading = true;
    try {
      this.userService
        .SubmitPostTypeData(
          'uspPostDeleteExpanseReimb',
          `action=DELEXP|id=${id}|appUserId=${sessionStorage.getItem('userId')}`,
          this.FormName
        )
        .subscribe(
          (data: any) => {
            if (data != '') {
              this.selectedAction = null;
              var resultarray = data.split('-');
              if (resultarray[1] == 'success') {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Record deleted successfully.',
                });
                this.getViewData(false);
              } else if (resultarray[0] == '2') {
                setTimeout(() => {
                  this.isLoading = false;
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Alert!',
                    detail: resultarray[1],
                  });
                }, 1000);
              } else {
                setTimeout(() => {
                  this.isLoading = false;
                  this.messageService.add({
                    severity: 'warn',
                    summary: 'Alert!',
                    detail: 'Data cannot be deleted.',
                  });
                }, 1000);
              }
            }
          },
          (err: HttpErrorResponse) => {
            this.isLoading = false;
            if (err.status == 401) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error!',
                detail: 'You are not authorized!',
              });
            } else if (err.status == 403) {
              this.Customvalidation.loginroute(err.status);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error!',
                detail: err.message.toString(),
              });
            }
          }
        );
    } catch (error) {
      this.isLoading = false;
    }
  }

  confirmDelete(item: any) {
    this.openConfirmation(
      'Confirm Delete',
      `Are you sure you want to delete this record (${item.serialNo || item.reqNo})?`,
      'delete',
      item.id
    );
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

  onChangeRequestTab(request: string) {
    this.selectedRequest = request;
    this.searchText = '';
    this.pageNo = 1;
    this.allViewTableData = [];
    this.paginationCountData = [];
    this.pageNoData = [];
    this.getViewData(true);
    this.cdr.detectChanges();
  }

  getViewDetails(data: any, type: string) {
    try {
      this.isLoading = true;
      this.selectedItem = data;
      this.postType = type === 'edit' ? 'update' : type;
      this.submitterTypeValue = data.submitFor || 'Self';

      // Parse child data arrays FIRST - before any form operations
      try {
        this.conveyanceChildData = data.conveyenceDetail
          ? typeof data.conveyenceDetail === 'string'
            ? JSON.parse(data.conveyenceDetail)
            : data.conveyenceDetail
          : [];
      } catch (e) {
        console.error('Error parsing conveyanceDetail:', e);
        this.conveyanceChildData = [];
      }

      try {
        this.lodgingChildData = data.laudgingDetail
          ? typeof data.laudgingDetail === 'string'
            ? JSON.parse(data.laudgingDetail)
            : data.laudgingDetail
          : [];
      } catch (e) {
        console.error('Error parsing laudgingDetail:', e);
        this.lodgingChildData = [];
      }

      try {
        this.foodExpChildData = data.foofExpDetail
          ? typeof data.foofExpDetail === 'string'
            ? JSON.parse(data.foofExpDetail)
            : data.foofExpDetail
          : [];
      } catch (e) {
        console.error('Error parsing foofExpDetail:', e);
        this.foodExpChildData = [];
      }

      try {
        this.laundryChildData = data.laundryExpDetail
          ? typeof data.laundryExpDetail === 'string'
            ? JSON.parse(data.laundryExpDetail)
            : data.laundryExpDetail
          : [];
      } catch (e) {
        console.error('Error parsing laundryExpDetail:', e);
        this.laundryChildData = [];
      }

      try {
        this.otherExpenseChildData = data.otherExpDetail
          ? typeof data.otherExpDetail === 'string'
            ? JSON.parse(data.otherExpDetail)
            : data.otherExpDetail
          : [];
      } catch (e) {
        console.error('Error parsing otherExpDetail:', e);
        this.otherExpenseChildData = [];
      }

      this.getStateDrp(() => this.enrichLodgingAndFoodStateCityNames());

      setTimeout(() => {
        if (data.requestId != null && (data.reqNo || data.serialNo)) {
          const reqNoLabel = data.reqNo || data.serialNo || String(data.requestId);
          const existsInAll = this.allRequestNo.some(
            (item: any) => Number(item.drpValue) === Number(data.requestId)
          );
          if (!existsInAll) {
            this.allRequestNo = [...this.allRequestNo, { drpValue: Number(data.requestId), drpOption: reqNoLabel }];
          }
        }
        this.Employeeuserid(data.requestId, data.reqNo || data.serialNo);
      }, 0);

      const patchData: any = {
        submitType: this.getSubmitTypeId(data.submitFrom) || '',
        name: data.empName || '',
        designation: data.designation || '',
        requestnumber: data.requestId != null ? Number(data.requestId) : '',
        fromDate: this.parseDateForForm(data.fromDate),
        toDate: this.parseDateForForm(data.toDate),
        travelTo: data.travelTo || '',
        expensePurpose: data.expensePurpose || '',
        expenseTypeId: data.expenseTypeId != null ? Number(data.expenseTypeId) : '',
        travelById: data.travelById != null ? Number(data.travelById) : '',
        imprest: data.imprest != null && data.imprest !== '' ? data.imprest : '',
        travelFrom: data.travelFrom || '',
        other: this.submitterTypeValue,
      };

      const submitTypeValue = this.getSubmitTypeId(data.submitFrom);

      // Set isConveyanceType based on submitType for view mode BEFORE patching form
      if (submitTypeValue === 10003) {
        this.isConveyanceType = true;
      } else {
        this.isConveyanceType = false;
      }

      this.getTravelByDrp(submitTypeValue);

      if (this.submitterTypeValue === 'Self') {
        this.onToggleSubmitter({ value: 'Self' });
        patchData.name = data.empName;
      } else {
        const empId = data.empId || '';
        const empHeadId = data.empHeadId || '';
        this.selectedEmployeeId = `${empHeadId}`;
        this.reimbursementForm.get('EmployeeDataforother')?.setValue(this.selectedEmployeeId);
        patchData.name = data.empName || '';
        patchData.designation = data.designation || '';
        this.onToggleSubmitter({ value: 'Other' });
      }

      setTimeout(() => {
        // Patch form first with emitEvent: false to prevent onChangeSubmitFrom from clearing data
        this.reimbursementForm.patchValue(patchData, { emitEvent: false });

        // Manually set form control states without triggering change events
        const travelToCtrl = this.reimbursementForm.get('travelTo');
        const expenseTypeCtrl = this.reimbursementForm.get('expenseTypeId');
        const travelByCtrl = this.reimbursementForm.get('travelById');

        if (submitTypeValue === 10003) {
          // Conveyance type
          this.isConveyanceType = true;
          this.conveyanceForm.patchValue({ expanseType: 'Conveyance' }, { emitEvent: false });
          if (this.postType !== 'view') {
            travelToCtrl?.disable({ emitEvent: false });
            expenseTypeCtrl?.disable({ emitEvent: false });
            travelByCtrl?.disable({ emitEvent: false });
          }
        } else if (submitTypeValue === 10001) {
          // Tour type
          this.isConveyanceType = false;
          this.conveyanceForm.patchValue({ expanseType: 'Fare' }, { emitEvent: false });
          if (this.postType !== 'view') {
            travelToCtrl?.disable({ emitEvent: false });
            travelByCtrl?.disable({ emitEvent: false });
          }
        } else {
          this.isConveyanceType = false;
          this.conveyanceForm.patchValue({ expanseType: 'Fare' }, { emitEvent: false });
          if (this.postType !== 'view') {
            travelToCtrl?.enable({ emitEvent: false });
            expenseTypeCtrl?.enable({ emitEvent: false });
            travelByCtrl?.enable({ emitEvent: false });
          }
        }

        // Re-parse and set child data AFTER form is patched to ensure it's not cleared
        // Data was already parsed at the beginning, but we ensure it's set again after form operations
        // The initial parsing at lines 1442-1494 should have already set the data correctly

        if (type === 'view') {
          // Disable main form
          this.reimbursementForm.disable({ emitEvent: false });
          // Disable all child forms
          this.conveyanceForm.disable({ emitEvent: false });
          this.lodgingForm.disable({ emitEvent: false });
          this.foodForm.disable({ emitEvent: false });
          this.laundryForm.disable({ emitEvent: false });
          this.otherExpForm.disable({ emitEvent: false });
        }

        if (type === 'update' || type === 'edit') {
          // Enable main form
          this.reimbursementForm.enable({ emitEvent: false });
          this.reimbursementForm.get('name')?.disable({ emitEvent: false });
          this.reimbursementForm.get('designation')?.disable({ emitEvent: false });
          this.reimbursementForm.get('submitType')?.disable({ emitEvent: false });
          this.reimbursementForm.get('imprest')?.disable({ emitEvent: false });
          this.reimbursementForm.get('requestnumber')?.disable({ emitEvent: false });
          // Enable child forms so user can edit values
          this.conveyanceForm.enable({ emitEvent: false });
          this.lodgingForm.enable({ emitEvent: false });
          this.foodForm.enable({ emitEvent: false });
          this.laundryForm.enable({ emitEvent: false });
          this.otherExpForm.enable({ emitEvent: false });
        }

        this.minDate = data.fromDate ? new Date(data.fromDate) : new Date();
        this.maxDate = data.toDate ? new Date(data.toDate) : new Date();
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500);
    } catch (error) {
      this.isLoading = false;
      console.error('Error occurred in getViewDetails:', error);
    }
  }

  // ================= FILE UPLOAD =================

  fileupload(formName: string, controlName: string, folderName: string) {
    this.selectedForm = formName;
    this.selectedFormControl = controlName;
    this.selectedFolderName = folderName;
    // Open file upload dialog - you can implement this with PrimeNG FileUpload dialog
    // For now, using a simple file input approach
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
            if (err.status == 401) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'You are not authorized!',
              });
            } else if (err.status == 403) {
              this.Customvalidation.loginroute(err.status);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message?.toString() || 'Upload failed',
              });
            }
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

  // ================= CLEAR DATA =================

  clearData() {
    this.reimbursementForm.reset();
    this.reimbursementForm.patchValue({
      submitType: '',
      expenseTypeId: '',
      travelById: '',
    });
    this.conveyanceChildData = [];
    this.lodgingChildData = [];
    this.foodExpChildData = [];
    this.laundryChildData = [];
    this.otherExpenseChildData = [];
    this.selectedItem = null;
    this.postType = 'add';
    this.minDate = new Date();
    this.maxDate = new Date();
    setTimeout(() => {
      if (this.userInfo) {
        this.reimbursementForm.get('name')?.enable();
        this.reimbursementForm.get('designation')?.enable();
        this.reimbursementForm.patchValue({
          name: this.userInfo.name || this.userInfo.empnam || '',
          designation: this.userInfo.designation || '',
        });
        this.reimbursementForm.get('name')?.disable();
        this.reimbursementForm.get('designation')?.disable();
      }
      this.cdr.detectChanges();
    }, 100);
  }

  // ================= VIEW TABLE METHODS =================

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

  onAdd() {
    this.reimbursementForm.enable();
    this.reimbursementForm.get('name')?.disable();
    this.reimbursementForm.get('designation')?.disable();
    this.postType = 'add';
    this.showDialog('add');
  }

  gotoView() {
    this.clearData();
    this.visible = false;
    this.postType = 'add';
    this.getViewData(true);
  }

  onDrawerHide() {
    this.visible = false;
    this.reimbursementForm.reset();
    this.selectedItem = null;
    this.getViewData(false);
  }

  // ================= APPROVAL MODAL =================

  openApprovalModal(data: any) {
    this.selectedItem = data;
    this.parsedBankDetails = data.parsedBankDetails || [];
    this.conveyanceChildData = JSON.parse(data.conveyenceDetail || '[]');
    this.lodgingChildData = JSON.parse(data.laudgingDetail || '[]');
    this.foodExpChildData = JSON.parse(data.foofExpDetail || '[]');
    this.laundryChildData = JSON.parse(data.laundryExpDetail || '[]');
    this.otherExpenseChildData = JSON.parse(data.otherExpDetail || '[]');
    this.parsedBankDetails = data.bankDetails ? JSON.parse(data.bankDetails) : [];
    this.getStateDrp(() => this.enrichLodgingAndFoodStateCityNames());

    // Disable forward if current status is 6
    const currentWfStatusId = data?.wfStatusId || data?.statusId || data?.wfStatus || data?.approvedStatus;
    if (currentWfStatusId === 6 || currentWfStatusId === '6') {
      this.isForward = false;
    }

    // Initialize approved amounts if not present
    this.conveyanceChildData.forEach((item: any) => {
      if (!item.approvedAmount) item.approvedAmount = item.amount || 0;
      if (!item.savedAmount) item.savedAmount = item.approvedAmount || 0;
    });
    this.lodgingChildData.forEach((item: any) => {
      if (!item.approvedAmount) item.approvedAmount = item.amount || 0;
      if (!item.savedAmount) item.savedAmount = item.approvedAmount || 0;
    });
    this.foodExpChildData.forEach((item: any) => {
      if (!item.approvedAmount) item.approvedAmount = item.amount || 0;
      if (!item.savedAmount) item.savedAmount = item.approvedAmount || 0;
    });
    this.laundryChildData.forEach((item: any) => {
      if (!item.approvedAmount) item.approvedAmount = item.amount || 0;
      if (!item.savedAmount) item.savedAmount = item.approvedAmount || 0;
    });
    this.otherExpenseChildData.forEach((item: any) => {
      if (!item.approvedAmount) item.approvedAmount = item.amount || 0;
      if (!item.savedAmount) item.savedAmount = item.approvedAmount || 0;
    });

    if (this.currentRole == 86) {
      this.initializeBankDetailsWithData();
    }

    this.totalRequestAmount = this.getTotalAmount('amount');
    this.totalApprovedAmount = this.getTotalAmount('approvedAmount');
    this.approvedPaybleAmount = this.totalApprovedAmount - (this.selectedItem.imprest || 0);
    this.remarks = '';
    this.isValidremark = true;
    this.remarksError = false;
    this.isValidApprovedAmount = true;
    this.approvedAmountError = false;

    this.approvalDrawerVisible = true;
  }

  closeDataDialog() {
    this.approvalDrawerVisible = false;
    this.showHistoryInDialog = false;
    this.selectedItem = null;
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
  hasManagerForwarded(approvalDetail: any[]): boolean {
    if (!approvalDetail || !Array.isArray(approvalDetail)) return false;
    return approvalDetail.some((item) => item.role === 'Manager' && item.WfStatus === 'Forwarded');
  }

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

  onChangeValue(event: any, item: any, field: string) {
    const value = event.target.value;
    item[field] = value;

    if (field === 'approvedAmount') {
      this.totalApprovedAmount = this.getTotalAmount('approvedAmount');
      this.approvedPaybleAmount = this.totalApprovedAmount - (this.selectedItem?.imprest || 0);
    }
    this.cdr.detectChanges();
  }

  onChangeApprovedAmount(event: any) {
    if (this.wfLevel.toLowerCase() == 'approver') {
      const value = parseFloat(event.target.value) || 0;
      this.totalApprovedAmount = value;
      this.approvedPaybleAmount = value - (this.selectedItem?.imprest || 0);
      this.cdr.detectChanges();
    }
  }

  onRemarksChange(event: any) {
    this.remarks = event.target.value;
    this.isValidremark = this.remarks.trim().length > 0;
    this.remarksError = !this.isValidremark;
  }

  openApprovalHistoryModal(data: any) {
    this.approalHistoryData = data;
    // Parse approvalDetail if it's a string
    if (this.approalHistoryData && this.approalHistoryData.approvalDetail) {
      if (typeof this.approalHistoryData.approvalDetail === 'string') {
        try {
          this.approalHistoryData.approvalDetail = JSON.parse(this.approalHistoryData.approvalDetail);
        } catch (e) {
          console.error('Error parsing approvalDetail:', e);
        }
      }
    }
    // Parse food expense details for history
    this.historyFoodDetails = data.foofExpDetail
      ? (typeof data.foofExpDetail === 'string' ? JSON.parse(data.foofExpDetail) : data.foofExpDetail)
      : [];
    // Open the drawer
    this.approvalHistoryVisible = true;
  }

  closeApprovalHistoryModal() {
    this.approvalHistoryVisible = false;
    this.approalHistoryData = null;
    this.historyFoodDetails = [];
  }

  // Calculate approval progress percentage
  getApprovalProgress(): number {
    if (!this.approalHistoryData?.approvalDetail || !Array.isArray(this.approalHistoryData.approvalDetail)) {
      return 0;
    }
    const totalSteps = this.approalHistoryData.approvalDetail.length;
    const completedSteps = this.approalHistoryData.approvalDetail.filter(
      (item: any) => item.WfStatus !== 'Pending' && item.WfStatus !== 'Rejected'
    ).length;
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }

  // Get progress bar color
  getProgressBarColor(): string {
    const progress = this.getApprovalProgress();
    if (progress === 100) {
      return 'bg-gradient-to-r from-green-500 to-green-600';
    } else if (progress > 0) {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    }
    return 'bg-gray-300';
  }

  // Get progress text color
  getProgressColor(): string {
    const progress = this.getApprovalProgress();
    if (progress === 100) {
      return 'text-green-600';
    } else if (progress > 0) {
      return 'text-yellow-600';
    }
    return 'text-gray-600';
  }

  // Get status circle class
  getStatusCircleClass(status: string): string {
    if (status === 'Pending') {
      return 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-yellow-300';
    } else if (status === 'Rejected') {
      return 'bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-300';
    } else {
      return 'bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-300';
    }
  }

  // Get status icon
  getStatusIcon(status: string): string {
    if (status === 'Pending') {
      return 'pi pi-clock';
    } else if (status === 'Rejected') {
      return 'pi pi-times';
    } else {
      return 'pi pi-check';
    }
  }

  // Get card border color
  getCardBorderClass(status: string): string {
    if (status === 'Pending') {
      return 'border-yellow-400';
    } else if (status === 'Rejected') {
      return 'border-red-400';
    } else {
      return 'border-green-400';
    }
  }

  // Get title color
  getTitleColor(status: string): string {
    if (status === 'Pending') {
      return 'text-yellow-700';
    } else if (status === 'Rejected') {
      return 'text-red-700';
    } else {
      return 'text-green-700';
    }
  }

  // Get badge class
  getBadgeClass(status: string): string {
    if (status === 'Pending') {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    } else if (status === 'Rejected') {
      return 'bg-red-100 text-red-800 border border-red-300';
    } else if (status === 'In-Review') {
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    } else {
      return 'bg-green-100 text-green-800 border border-green-300';
    }
  }

  OnSubmitAction(action: string) {
    this.selectedAction = action == 'Approve' ? 'Approved' : action;
    const allArrays = [...this.conveyanceChildData, ...this.lodgingChildData, ...this.foodExpChildData, ...this.laundryChildData, ...this.otherExpenseChildData];
    const hasAnyEmptyApprovedAmount = allArrays.some(obj => obj.approvedAmount === '');

    let remark = '';
    // Try to get remark from jQuery if available, else from DOM, else from variable
    if (typeof $ !== 'undefined' && $('#approvalRemarks').length > 0) {
      remark = $('#approvalRemarks').val() as string || '';
    } else {
      const remarkElement = document.getElementById('approvalRemarks') as HTMLInputElement;
      remark = remarkElement?.value || this.remarks || '';
    }

    if (action == 'Reject' || action == 'Return') {
      // Remarks validation can be added here if needed
    } else {
      if (hasAnyEmptyApprovedAmount) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Alert!',
          detail: "Please enter approve amount in all entry.",
        });
        return;
      }
    }

    if (this.roledata == 86 && action === 'Approve') {
      if (this.bankDetails.length === 0 || this.bankDetails.invalid) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error!',
          detail: 'Please fill all bank details correctly.',
        });
        this.bankDetails.markAllAsTouched();
        return;
      }
    }

    this.paramvaluedata = '';
    const wfStatusId = this.getwfStatusId(action);

    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.paramvaluedata =
      `activity=${this.FormName}` +
      `|id=${this.selectedItem.id}` +
      `|wfStatusId=${wfStatusId}` +
      `|approvedAmount=${this.approvedPaybleAmount}` +
      `|approvalRemarks=${remark}` +
      `|conveyenceJson=${JSON.stringify(this.conveyanceChildData)}` +
      `|lodgingJson=${JSON.stringify(this.isConveyanceType ? [] : this.lodgingChildData)}` +
      `|foodExpJson=${JSON.stringify(this.isConveyanceType ? [] : this.foodExpChildData)}` +
      `|laundryJson=${JSON.stringify(this.isConveyanceType ? [] : this.laundryChildData)}` +
      `|otherExpDetail=${JSON.stringify(this.isConveyanceType ? [] : this.otherExpenseChildData)}` +
      `|appUserId=${sessionStorage.getItem('userId')}` +
      `|appUserRole=${roleID}`;

    this.openConfirmation(
      'Confirm?',
      `Are you sure you want to ${action}?`,
      'approval',
      action
    );
  }
  getwfStatusId(action: string): number {
    let code: number;
    switch (action) {
      case 'Approve':
        code = 1;
        break;
      case 'Forward':
        code = 6;
        break;
      case 'Reject':
        code = 3;
        break;
      case 'Return':
        code = 4;
        break;
      default:
        code = 0;
        break;
    }
    return code;
  }
  submitApprovalAction(action: string) {
    this.submitActionForm();
  }

  submitActionForm() {
    this.isLoading = true;
    this.userService.SubmitPostTypeData('uspPostReimbursementApproval', this.paramvaluedata, this.FormName)
      .subscribe((datacom: any) => {
        if (datacom != "") {
          const resultarray = datacom.split("-");
          if (resultarray[1] == "success" || resultarray[1]?.toLowerCase() == "success") {
            this.submitBankDetails();
            this.getPermission();
            this.getViewData(false);

            setTimeout(() => {
              this.closeDataDialog();
              // Show actual response message from API
              const responseMessage = resultarray.length > 2
                ? resultarray.slice(2).join("-")
                : (resultarray[1] && resultarray[1].toLowerCase() !== "success"
                  ? resultarray[1]
                  : `Data ${this.selectedAction} Successfully.`);
              this.messageService.add({
                severity: 'success',
                summary: 'Success!',
                detail: responseMessage,
              });
              this.isLoading = false;
            }, 500);
          } else if (resultarray[0] == "2") {
            setTimeout(() => {
              this.isLoading = false;
              this.submitBankDetails();
              // Show actual error message from API response
              const errorMessage = resultarray[1] || resultarray.slice(1).join("-") || "Data cannot be processed.";
              this.messageService.add({
                severity: 'warn',
                summary: 'Alert!',
                detail: errorMessage,
              });
            }, 1000);
          } else {
            setTimeout(() => {
              this.isLoading = false;
              // Show actual error message from API response
              const errorMessage = resultarray[1] || resultarray.slice(1).join("-") || "Data cannot be processed.";
              this.messageService.add({
                severity: 'warn',
                summary: 'Alert!',
                detail: errorMessage,
              });
            }, 1000);
          }
        } else {
          this.isLoading = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Alert!',
            detail: 'Something went wrong!',
          });
        }
      },
        (err: HttpErrorResponse) => {
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
          if (err.status == 401) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error!',
              detail: "You are not authorized!",
            });
          } else if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error!',
              detail: err.error?.message?.toString() || 'Server Error',
            });
          }
        });
  }

  submitBankDetails() {
    if (this.roledata !== 86) {
      return;
    }

    const userId = sessionStorage.getItem('userId');
    const bank = this.bankDetails.at(0)?.value;

    if (!bank) {
      console.warn('No bank details available');
      return;
    }

    const raw = `sourceId=${this.selectedItem.id}` +
      `|SourceName=tblExpenseReimbursementHead` +
      `|Purpose=${this.selectedItem.expensePurpose || ''}` +
      `|amount=${this.totalApprovedAmount}` +
      `|remarks=${this.approvalForm.get('approvalRemarks')?.value}` +
      `|bankName=${bank.bankName}` +
      `|ifsc=${bank.ifscCode}` +
      `|accountNo=${bank.account}` +
      `|panDetails=${bank.panDetails}` +
      `|appUserId=${userId}`;

    this.userService
      .SubmitPostTypeData('uspPostExpenseSettlement', raw, this.FormName)
      .subscribe(
        (res: any) => {
          if (res === 'Data Saved.-success') {
            console.log('Bank details saved successfully');
          } else {
            console.warn('Bank details save response:', res);
          }
        },
        (err: HttpErrorResponse) => {
          console.error('Error saving bank details:', err);
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getTotalAmount(key: string) {
    const allArrays = [
      ...this.conveyanceChildData,
      ...this.lodgingChildData,
      ...this.foodExpChildData,
      ...this.laundryChildData,
      ...this.otherExpenseChildData,
    ];
    const totalAmount = allArrays.reduce((acc, obj) => {
      const amount = parseFloat(obj[key]) || 0;
      return acc + amount;
    }, 0);
    const formattedAmount = Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(2);
    return formattedAmount;
  }

  // ================= PRINT FUNCTIONALITY =================

  print(data: any) {
    setTimeout(() => {
      let conveyanceData: any[] = [];
      let approvalData: any[] = [];
      let lodgingData: any[] = [];
      let foodData: any[] = [];
      let laundryData: any[] = [];
      let bankHTML: any[] = [];

      let otherData: any[] = [];
      const fromDateFormatted = data.fromDate
        ? this.datePipe.transform(data.fromDate, 'yyyy-MM-dd')
        : '-';
      const toDateFormatted = data.toDate
        ? this.datePipe.transform(data.toDate, 'yyyy-MM-dd')
        : '-';

      try {
        conveyanceData = data.conveyenceDetail ? JSON.parse(data.conveyenceDetail) : [];
        lodgingData = data.laudgingDetail ? JSON.parse(data.laudgingDetail) : [];
        foodData = data.foofExpDetail ? JSON.parse(data.foofExpDetail) : [];
        laundryData = data.laundryExpDetail ? JSON.parse(data.laundryExpDetail) : [];
        otherData = data.otherExpDetail ? JSON.parse(data.otherExpDetail) : [];
        approvalData = Array.isArray(data.approvalDetail) ? data.approvalDetail : [];
      } catch (e) {
        console.error('Error parsing data:', e);
      }

      const allItems = [
        ...conveyanceData,
        ...lodgingData,
        ...foodData,
        ...laundryData,
        ...otherData,
      ];

      const totalRequestAmount = allItems.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );

      const totalApprovedAmount = allItems.reduce((sum, item) => {
        return sum + (Number(item.approvedAmount) || 0);
      }, 0);

      const approvedPaybleAmount = totalApprovedAmount - (data.imprest || 0);

      const formatAmt = (amt: any) => (amt != null ? Number(amt).toFixed(2) : '-');

      let conveyanceHTML = conveyanceData.length
        ? `
        <h3>Conveyance Details</h3>
        <table>
          <tr>
            <th>Fare/ Conveyance</th>
            <th>Travel By</th>
            <th>Purpose</th>
            <th>Tavel From</th>
            <th>Travel To</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Start Meter Reading</th>
            <th>End Meter Reading</th>
            <th>Total Km</th>
            <th>Amount</th>
          </tr>
          ${conveyanceData
          .map(
            (item) => `
          <tr>
            <td>${item.expanseType || '-'}</td>
            <td>${item.travelBy || '-'}</td>
            <td>${item.text || '-'}</td>
            <td>${item.travelFrom || '-'}</td>
            <td>${item.travelTo || '-'}</td>
            <td>${item.fromDate || '-'}</td>
            <td>${item.toDate || '-'}</td>
            <td>${item.startMeterRead ?? '-'}</td>
            <td>${item.endMeterRead ?? '-'}</td>
            <td>${item.totalKm ?? '-'}</td>
            <td>${formatAmt(item.amount)}</td>
          </tr>`
          )
          .join('')}
        </table>`
        : '';

      let lodgingHTML = lodgingData.length
        ? `
        <h3>Lodging Details</h3>
        <table>
          <tr>
            <th>Hotel Name</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Amount</th>
          </tr>
          ${lodgingData
          .map(
            (item) => `
          <tr>
            <td>${item.text || '-'}</td>
            <td>${item.fromDate || '-'}</td>
            <td>${item.toDate || '-'}</td>
            <td>${formatAmt(item.amount)}</td>
          </tr>`
          )
          .join('')}
        </table>`
        : '';

      let foodHTML = foodData.length
        ? `
        <h3>Food Expenses</h3>
        <table>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
          ${foodData
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

      let laundryHTML = laundryData.length
        ? `
        <h3>Laundry Expenses</h3>
        <table>
          <tr>
            <th>Quantity</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
          ${laundryData
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

      //  let bankDetailsArray = bankHTML.length ? `
      // <h3>Bank Details</h3>
      // <table>
      //   <tr>
      //     <th>Bank Name</th>
      //     <th>Account Number</th>
      //     <th>PAN Details</th>
      //     <th>IFSE Code</th>
      //   </tr>
      //   ${laundryData.map(item => `
      //   <tr>
      //     <td>${item.bankName || '-'}</td>
      //     <td>${item.account || '-'}</td>
      //     <td>${item.panDetails}</td>
      //      <td>${item.ifscCode}</td>
      //   </tr>`).join('')}
      // </table>` : '';

      let otherHTML = otherData.length
        ? `
        <h3>Other Expenses</h3>
        <table>
          <tr>
            <th>Description</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
          ${otherData
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
              <td colspan="${approvalData.length
        }" style="text-align: left; font-weight: bold; padding-bottom: 20px; border: none;">
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
        <title>Tour Reimbursement</title>
           <style>
            .print-button-container {
              position: fixed;
              top: 20px;
              right: 20px;
              z-index: 1000;
            }
  
            .print-button {
              padding: 12px 24px;
              background: #2196F3;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              transition: background 0.3s;
            }
  
            .print-button:hover {
              background: #1976D2;
            }
  
            @media print {
              .print-button-container {
                display: none;
              }
            }
              @media print {
                       #print-tip {
                           display: none;
                          }
                        }
  
                     @page {
                         margin: 15mm 15mm 15mm 15mm; /* Adjusted margins */
                             size: auto; /* Prevent URL display in Firefox */
                         }
            head, title 
            {
              display: none;
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
              break-inside: avoid;
            }
  
            tr, td, th {
              page-break-inside: avoid;
              break-inside: avoid;
            }
  
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
              vertical-align: middle;
            }
  
            th {
              background-color: #f2f2f2;
            }
  
            table td:last-child,
            table th:last-child {
              width: 120px;
            }
           </style>
          </head>
        <body>
          <div class="print-button-container">
             <button class="btn btn-primary print-button" onclick="window.print()">
                 <i class="bi bi-printer"></i> Print Document
             </button>
          </div>
  
          <h1>Tour Reimbursement</h1>
          <h2>(Document No: ${data.serialNo})</h2>
          <br/>
  
          <table>
            <tr><td><strong>Submit For:</strong></td><td>${data.submitFrom || '-'}</td>
                <td><strong>Name:</strong></td><td>${data.empName || '-'}</td></tr>
            <tr><td><strong>Designation:</strong></td><td>${data.designation || '-'}</td>
                <td><strong>Purpose:</strong></td><td>${data.expensePurpose || '-'}</td></tr>
            <tr><td><strong>From Date: <strong></td><td> ${fromDateFormatted}</td>
                <td><strong>To date : </strong></td><td> ${toDateFormatted}</td></tr>
            <tr>
                <td><strong>Imprest:</strong></td><td>${formatAmt(data.imprest)}</td>
                <td><strong>${data.submitFrom == 'Tour' ? 'Travel To:' : ''}</strong></td><td>${data.submitFrom == 'Tour' ? data.travelTo || '-' : ''
        }</td>
            </tr>
             ${data.submitFrom == 'Tour'
          ? ` <tr>
                  <td><strong>Travel By:</strong></td><td>${data.travelBy || '-'}</td>
                  <td><strong>Expense Type:</strong></td><td>${data.expanseType || '-'}</td>
                </tr>
            `
          : ''
        }
         
          </table>
          
          ${conveyanceHTML}
          ${lodgingHTML}
          ${foodHTML}
          ${laundryHTML}
          ${otherHTML}
          
         
         
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

      // Calculate centered window position
      const width = Math.round(window.screen.availWidth * 0.7);
      const height = Math.round(window.screen.availHeight * 0.8);
      const left = Math.round((window.screen.availWidth - width) / 2);
      const top = Math.round((window.screen.availHeight - height) / 2);

      const popupWin = window.open(
        '',
        '_blank',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,location=no,status=no`
      );

      // Guard against popup blockers returning null
      if (popupWin && popupWin.document) {
        popupWin.document.open();
        popupWin.document.write(printContents);
        popupWin.document.close();
      } else {
        console.error('Unable to open print window. It may have been blocked by the browser.');
      }
    }, 500);
  }

  // ================= TRANSFORM DATE =================

  transformDate(newDate: any, formName: string, controlName: string) {
    const formattedDate = this.datePipe.transform(newDate.value, 'yyyy-MM-dd');
    const form = this[formName as keyof this] as FormGroup;
    form.patchValue({
      [controlName]: formattedDate,
    });
  }

  onChangeFromDate(event: any): void {
    this.minDate = event.value;
  }

  onChangeToDate(event: any): void {
    this.maxDate = event.value;
  }

  gotoFirstTab() {
    // Implementation for switching to first tab
    // Can be used for form reset scenarios
  }

  onChangeFinalRemark(event: any) {
    if (event.target.value == '') {
      this.isValidremark = false;
    } else {
      this.isValidremark = true;
    }
  }

  refreshSelectPickers(): void {
    setTimeout(() => {
      $('.searchdrop').selectpicker('refresh');
    }, 100);
  }

  gotoAdd() {
    this.postType = 'add';
    this.showDialog('add');
  }

  // ================= CHANGE CONVEYANCE TYPE =================

  changeConveyanceType(expanseType?: string) {
    let currentExpanseType = expanseType || this.conveyanceForm.get('expanseType')?.value || 'Fare';
    let action = '';
    if (currentExpanseType === 'Conveyance') {
      action = 'TRAVELTYPECONVEY';
    } else {
      action = 'TRAVELTYPE';
    }
    const districtId = sessionStorage.getItem('District');
    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=${action}|id=0|appUserId=${this.userId}|districtId=${districtId}|appUserRole=${this.currentRole}`
      )
      .subscribe(
        (res: any) => {
          this.travelByDrpAll = res['table'] || [];
          this.cdr.detectChanges();
        },
        (err: HttpErrorResponse) => {
          this.travelByDrpAll = [];
        }
      );
  }

  hasAnyAttachment(): boolean {
    return this.conveyanceChildData?.some((item) => !!item.attachment);
  }

  // ================= GETTERS FOR FORM CONTROLS =================

  get f() {
    return this.reimbursementForm.controls;
  }

  get f1() {
    return this.conveyanceForm.controls;
  }

  get f2() {
    return this.lodgingForm.controls;
  }

  get f3() {
    return this.foodForm.controls;
  }

  get f4() {
    return this.laundryForm.controls;
  }

  get f5() {
    return this.otherExpForm.controls;
  }

  get f6() {
    return this.approvalForm.controls;
  }
}
