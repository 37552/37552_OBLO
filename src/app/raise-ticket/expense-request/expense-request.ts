import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { PopoverModule } from 'primeng/popover';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

import { UserService } from '../../shared/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-expense-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    DrawerModule,
    IftaLabelModule,
    DatePickerModule,
    InputTextModule,
    ToastModule,
    InputNumberModule,
    SelectModule,
    ConfirmDialogModule,
    RadioButtonModule,
    CheckboxModule,
    TableTemplate,
    PopoverModule,
    DialogModule,
    TextareaModule,
  ],
  providers: [DatePipe],
  templateUrl: './expense-request.html',
  styleUrls: ['./expense-request.scss'],
})
export class ExpenseRequest implements OnInit {
  visible = false;
  drawerTitle = 'Add Travel Request Details';
  isViewMode = false;

  /* ================= UI FLAGS - COLLAPSIBLE SECTIONS ================= */
  showBasicInfoSection = true;
  showOptionsSection = true;
  showProjectSection = true;
  showExpenseForSection = true;

  /** ✅ DRAWER HEADER */
  header: string = 'Add Travel Request Details';
  headerIcon: string = 'pi pi-plus';

  breadcrumbItems = [
    { label: 'Home', title: 'Home' },
    { label: 'Raise Ticket', routerLink: '/raise-ticket', title: 'Raise Ticket' },
    { label: 'Travel Request', routerLink: '/expense-request', title: 'Travel Request' },
  ];

  priceListForm!: FormGroup;

  id: any;
  FormName: any;
  name: any;
  actitvityName: any;

  InfoData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
  empName = '';
  userInfoData: any = null;

  EmployeeData: any[] = [];
  travelByDrpAll: any[] = [];
  costcenterdata: any[] = [];

  /** ✅ TIMESLOT DROPDOWNS */
  timedata: any[] = [];
  timedataticket: any[] = [];
  preferredTimeDrp: any[] = [];

  /** ✅ DATE MANAGEMENT */
  currentDate = new Date();
  minFromDate: Date | null = null;
  minToDate: Date | null = null;
  maxHotelToDate: Date | null = null;

  /** ✅ TIME RANGE */
  minTime: Date | null = null;
  maxTime: Date | null = null;
  minTimeReturn: Date | null = null;
  maxTimeReturn: Date | null = null;
  timeRange: { min: string; max: string; isNightRange?: boolean } | null = null;
  timeRangeReturn: { min: string; max: string; isNightRange?: boolean } | null = null;

  /** ✅ PROJECT TYPE */
  selectedProjectType: string | null = null;

  /** ✅ SUBMITTER TYPE */
  showSelfTable = false;
  showOtherEmployeeTable = false;
  selectedSubmitterType: string = '';
  includeSelfData = false;

  /** ✅ EMPLOYEE MANAGEMENT */
  noOfEmployeesList: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  get f() {
    return this.priceListForm.controls;
  }

  get otherEmployees(): FormArray {
    return this.priceListForm.get('otherEmployees') as FormArray;
  }

  get otherEmployeesArray(): FormArray {
    return this.priceListForm.get('otherEmployees') as FormArray;
  }

  // Table properties
  viewData: any[] = [];
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];
  pageNoData: any[] = [];
  totalCount = 0;
  pageNo = 1;
  pageSize = 10;
  searchText = '';
  isLoading = false;
  postType: 'add' | 'update' | 'view' = 'add';
  selectedItem: any = null;
  isView = true;
  paramvaluedata: string = '';
  isProccess: boolean = false;
  afterHoursMessageVisible: boolean = false;
  showAdminHistoryModal: boolean = false;
  dataDialogRef: any = null;
  extendedDate: Date | null = null;
  extendedImprestAmount: number | null = null;
  Purpose: string | null = null;
  selectedAction: string | null = null;
  modelHeading: string = '';
  historyList: any[] = [];
  noOfEmployeesCount: number = 0;
  requestNo: any;
  currenyDrp: any[] = [];
  approalHistoryData: any = null;
  historyDrawerVisible: boolean = false;
  approvalHistory: any[] = [];
  imprestDialogVisible: boolean = false;
  minImprestDate: Date | null = null;
  conveyanceChildData: any[] = [];
  lodgingChildData: any[] = [];
  laundryChildData: any[] = [];
  otherExpenseChildData: any[] = [];
  foodExpChildData: any;
  totalRequestAmount: number = 0;
  totalApprovedAmount: number = 0;
  approvedPaybleAmount: number = 0;
  isValidremark: boolean = true;
  topUpImprestAmount: number | null = null;
  showDeleteBtn: boolean = false;
  showActiveBtn: boolean = false;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request Number', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Name', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'imprest', header: 'Requested Imprest', isVisible: true, isSortable: false },
    { key: 'travelSource', header: 'Source', isVisible: true, isSortable: false },
    { key: 'travelDestination', header: 'Destination', isVisible: true, isSortable: false },
    { key: 'travelMode', header: 'Travel Mode', isVisible: true, isSortable: false },
    { key: 'tileSlot', header: 'Time Preference', isVisible: true, isSortable: false },
    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation
  ) {}

  // 🔵 LIFECYCLE

  ngOnInit(): void {
    this.readRouteParams();
    this.setEmployeeName();
    this.setUserInfoData();
    this.initForm();
    this.GetEmployeeDataForOther();
    this.getTravelByDrp();
    this.getTimeslotDrp();
    this.getCostCenterDrp();
    this.getCurrencyDrp();
    this.initTimeRanges();
    this.setMinFromDate();
    this.getAllViewData(true);
  }

  // 🔵 FORM

  initForm(): void {
    this.priceListForm = this.fb.group({
      name: [{ value: this.empName, disabled: true }, Validators.required],

      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      purpose: ['', Validators.required],
      imprest: ['', [Validators.required, Validators.pattern(/^\d+$/)]],

      travelById: ['', Validators.required],
      Source: ['', Validators.required],
      destination: ['', Validators.required],
      other: ['', Validators.required],
      remarks: [''],

      timePreferenceId: [null, Validators.required],
      preferredTimeslot: [{ value: null, disabled: true }, Validators.required],

      timePreferenceIdReturn: [{ value: null, disabled: true }],
      preferredTimeslotReturn: [{ value: null, disabled: true }],
      returnFromDate: [{ value: null, disabled: true }, Validators.required],
      returnToDate: [{ value: null, disabled: true }, Validators.required],

      Project: [null, Validators.required],
      ExistingProject: [{ value: null, disabled: true }, Validators.required],
      NewProject: [{ value: null, disabled: true }, Validators.required],

      Hoteldate: [{ value: null, disabled: true }, Validators.required],
      Hoteldateto: [{ value: null, disabled: true }, Validators.required],

      Localfrom: [{ value: null, disabled: true }, Validators.required],
      Localto: [{ value: null, disabled: true }, Validators.required],

      numOfEmp: ['', Validators.required],
      IncludeSelf: [false],
      returnTicket: [false],
      accommodation: [false],
      conveyance: [false],

      otherEmployees: this.fb.array([]),

      selfName: [this.empName, Validators.required],
      selfEmail: [this.getUserValue('personalemail'), [Validators.required, Validators.email]],
      selfGender: [this.getUserValue('gender'), Validators.required],
      selfMobile: [
        this.getUserValue('officeMobileNo'),
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
      ],
    });

    // Subscribe to fromDate changes to update minToDate
    this.priceListForm.get('fromDate')?.valueChanges.subscribe((fromDate: Date | null) => {
      if (fromDate) {
        this.minToDate = new Date(fromDate);
        // If toDate is already selected and is before fromDate, reset it
        const toDate = this.priceListForm.get('toDate')?.value;
        if (toDate && new Date(toDate) < new Date(fromDate)) {
          this.priceListForm.patchValue({ toDate: null }, { emitEvent: false });
        }
      } else {
        this.minToDate = null;
      }
    });
  }

  // 🔵 API CALLS

  GetEmployeeDataForOther(): void {
    this.userService
      .getQuestionPaper(
        `uspGetFillDrpDown|table=reportingUser|appUserId=${sessionStorage.getItem('userId')}`
      )
      .subscribe({
        next: (res: any) => {
          this.EmployeeData = res?.table || [];
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getTravelByDrp(): void {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=TRAVELTYPE|id=0|appUserId=${sessionStorage.getItem(
          'userId'
        )}|districtId=${sessionStorage.getItem('District')}|appUserRole=${roleID}`
      )
      .subscribe({
        next: (res: any) => {
          this.travelByDrpAll = res?.table || [];
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (err: HttpErrorResponse) => console.error(err),
      });
  }

  // 🔵 EVENTS

  showDialog(type: 'add' | 'update' | 'view', data?: any): void {
    this.getCostCenterDrp();
    this.getTimeslotDrp();
    this.getTravelByDrp();
    this.GetEmployeeDataForOther();

    this.postType = type;
    this.isViewMode = type === 'view';
    this.isView = false;
    this.visible = true;

    // Reset date constraints
    this.minFromDate = null;
    this.minToDate = null;

    // Dynamic header text & icon (similar to Conveyance Request)
    if (type === 'add') {
      this.header = 'Add Travel Request Details';
      this.headerIcon = 'pi pi-plus';
    } else if (type === 'update') {
      this.header = 'Update Travel Request';
      this.headerIcon = 'pi pi-pencil';
    } else {
      this.header = 'View Travel Request';
      this.headerIcon = 'pi pi-eye';
    }

    if (type === 'add') {
      this.resetFormToInitialState();
      this.priceListForm.enable();
      this.priceListForm.get('name')?.disable();
      this.priceListForm.patchValue({
        name: this.empName,
      });
      // Ensure checkboxes are enabled for add mode
      this.priceListForm.get('returnTicket')?.enable();
      this.priceListForm.get('accommodation')?.enable();
      this.priceListForm.get('conveyance')?.enable();
    } else if (data) {
      this.loadFormData(data);
      if (type === 'view') {
        this.priceListForm.disable();
      } else {
        this.priceListForm.enable();
        this.priceListForm.get('name')?.disable();
        // Enable checkboxes for update mode
        this.priceListForm.get('returnTicket')?.enable();
        this.priceListForm.get('accommodation')?.enable();
        this.priceListForm.get('conveyance')?.enable();
      }

      // Enable/disable conditional fields based on checkbox states
      if (data.returnTicket) {
        this.priceListForm.get('returnFromDate')?.enable();
        this.priceListForm.get('returnToDate')?.enable();
        this.priceListForm.get('timePreferenceIdReturn')?.enable();
        this.priceListForm.get('preferredTimeslotReturn')?.enable();
      }

      if (data.accomodation) {
        this.priceListForm.get('Hoteldate')?.enable();
        this.priceListForm.get('Hoteldateto')?.enable();
      }

      if (data.localConveyance) {
        this.priceListForm.get('Localfrom')?.enable();
        this.priceListForm.get('Localto')?.enable();
      }

      if (data.toProjectId || data.toProject) {
        this.selectedProjectType = data.toProjectId ? 'ExistingProject' : 'NewProject';
        if (data.toProjectId) {
          this.priceListForm.get('ExistingProject')?.enable();
        } else {
          this.priceListForm.get('NewProject')?.enable();
        }
      }
    }

    this.cdr.detectChanges();
  }

  loadFormData(data: any): void {
    let employeeDetails: any[] = [];

    try {
      employeeDetails =
        typeof data.employeeDetails === 'string'
          ? JSON.parse(data.employeeDetails)
          : data.employeeDetails || [];
    } catch (e) {
      employeeDetails = [];
    }

    if (this.postType === 'update' && data.fromDate) {
      const existingFromDate = new Date(data.fromDate);
      existingFromDate.setHours(0, 0, 0, 0);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      this.minFromDate = existingFromDate > currentDate ? currentDate : existingFromDate;
      this.minToDate = this.minFromDate;
    } else {
      this.setMinFromDate();
    }

    const includeSelf = employeeDetails.some((emp) => emp.includeSelf === 1);
    this.includeSelfData = includeSelf;
    this.priceListForm.get('IncludeSelf')?.setValue(includeSelf);
    this.noOfEmployeesCount = employeeDetails.length;

    setTimeout(() => {
      const formatTimeForBinding = (timeString: string): string => {
        if (!timeString) return '';
        const timeMatch = timeString.match(/(\d{2}:\d{2})/);
        return timeMatch ? timeMatch[1] : timeString.slice(0, 5);
      };

      const timePrefValue = data.timeSlotId ?? '';
      const returnTimePrefValue = data.returnTimePrefId ?? '';
      if (timePrefValue) {
        this.priceListForm.get('timePreferenceId')?.setValue(timePrefValue);
        this.onTimePreferenceChange({ value: timePrefValue });
      }

      if (returnTimePrefValue) {
        this.priceListForm.get('timePreferenceIdReturn')?.setValue(returnTimePrefValue);
        this.onTimePreferenceChangeonticket({ value: returnTimePrefValue });
      }

      // Parse dates
      let fromDate: Date | null = null;
      let toDate: Date | null = null;

      if (data.fromDate) {
        try {
          fromDate = data.fromDate instanceof Date ? data.fromDate : new Date(data.fromDate);
        } catch (error) {
          console.error('Error parsing fromDate:', error);
        }
      }

      if (data.toDate) {
        try {
          toDate = data.toDate instanceof Date ? data.toDate : new Date(data.toDate);
        } catch (error) {
          console.error('Error parsing toDate:', error);
        }
      }

      // Parse preferred timeslot
      let preferredTimeslot: Date | null = null;
      let preferredTimeslotReturn: Date | null = null;
      if (data.prefTime) {
        try {
          const timeStr = formatTimeForBinding(data.prefTime);
          const timeParts = timeStr.split(':');
          if (timeParts.length >= 2) {
            const date = new Date();
            date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
            preferredTimeslot = date;
          }
        } catch (error) {
          console.error('Error parsing prefTime:', error);
        }
      }
      if (data.returnTime) {
        try {
          const timeStr = formatTimeForBinding(data.returnTime);
          const timeParts = timeStr.split(':');
          if (timeParts.length >= 2) {
            const date = new Date();
            date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
            preferredTimeslotReturn = date;
          }
        } catch (error) {
          console.error('Error parsing returnTime:', error);
        }
      }

      // Parse hotel dates
      let hotelFromDate: Date | null = null;
      let hotelToDate: Date | null = null;
      if (data.accFromDate) {
        try {
          hotelFromDate =
            data.accFromDate instanceof Date ? data.accFromDate : new Date(data.accFromDate);
        } catch (error) {
          console.error('Error parsing accFromDate:', error);
        }
      }
      if (data.accToDate) {
        try {
          hotelToDate = data.accToDate instanceof Date ? data.accToDate : new Date(data.accToDate);
          if (toDate) {
            this.maxHotelToDate = new Date(toDate);
            this.maxHotelToDate.setDate(this.maxHotelToDate.getDate() + 10);
          }
        } catch (error) {
          console.error('Error parsing accToDate:', error);
        }
      }

      // Set minToDate based on fromDate when loading data for edit
      if (fromDate) {
        this.minToDate = new Date(fromDate);
        this.minFromDate = new Date(fromDate);
      }

      // Load basic form data
      this.priceListForm.patchValue({
        name: data.employeeName ?? '',
        fromDate: fromDate,
        toDate: toDate,
        purpose: data.purpose ?? '',
        imprest: data.imprest ?? '',
        Source: data.travelSource ?? '',
        destination: data.travelDestination ?? '',
        travelById: data.travelById ?? '',
        timePreferenceId: timePrefValue,
        preferredTimeslot: preferredTimeslot,
        preferredTimeslotReturn: preferredTimeslotReturn,
        timePreferenceIdReturn: returnTimePrefValue,
        Hoteldate: hotelFromDate,
        Hoteldateto: hotelToDate,
        Localfrom: data.fromLocation ?? '',
        Localto: data.toLocation ?? '',
        other: data.expenseFor ?? '',
        ExistingProject: data.toProjectId ?? '',
        NewProject: data.toProject ?? '',
        numOfEmp: this.noOfEmployeesCount,
        IncludeSelf: includeSelf,
        remarks: data.remarks || '',
        returnTicket: data.returnTicket || false,
        accommodation: data.accomodation || false,
        conveyance: data.localConveyance || false,
      });

      if (data.expenseFor === 'Self') {
        if (employeeDetails.length > 0) {
          const emp = employeeDetails[0];
          this.userInfoData = {
            empnam: emp.name || '',
            personalemail: emp.email || '',
            gender: emp.gender || '',
            officeMobileNo: emp.number || '',
          };
          this.priceListForm.patchValue({
            selfName: emp.name || '',
            selfEmail: emp.email || '',
            selfGender: emp.gender || '',
            selfMobile: emp.number || '',
          });
        }
        this.showSelfTable = true;
        this.showOtherEmployeeTable = false;
      } else if (data.expenseFor === 'Other') {
        this.otherEmployeesArray.clear();
        employeeDetails.forEach((emp: any) => {
          const isSelf = emp.includeSelf === 1;
          let nameValue = isSelf ? emp.name : '';
          if (!isSelf) {
            const selectedEmployee = this.EmployeeData.find(
              (e: any) => e.drpValue === emp.employeeId
            );
            nameValue = selectedEmployee ? selectedEmployee.userId : '';
          }
          this.otherEmployeesArray.push(
            this.fb.group({
              name: [nameValue, Validators.required],
              email: [emp.email || '', [Validators.required, Validators.email]],
              number: [emp.number || '', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
              gender: [emp.gender || '', Validators.required],
              isSelf: [isSelf],
            })
          );
        });
        this.showOtherEmployeeTable = true;
        this.showSelfTable = false;
      }

      if (this.isViewMode) {
        this.priceListForm.disable();
      } else {
        this.priceListForm.enable();
        this.priceListForm.get('name')?.disable();
        this.priceListForm.get('IncludeSelf')?.enable();
        if (data.expenseFor === 'Other') {
          this.otherEmployeesArray.controls.forEach((control: AbstractControl) => {
            const empGroup = control as FormGroup;
            empGroup.get('name')?.enable();
            empGroup.get('email')?.enable();
            empGroup.get('number')?.enable();
            empGroup.get('gender')?.enable();
          });
        }
      }

      if (data.accomodation) {
        this.priceListForm.get('Hoteldate')?.enable();
        this.priceListForm.get('Hoteldateto')?.enable();
      }
      if (data.localConveyance) {
        this.priceListForm.get('Localfrom')?.enable();
        this.priceListForm.get('Localto')?.enable();
      }
      if (data.returnTicket) {
        this.priceListForm.get('timePreferenceIdReturn')?.enable();
        this.priceListForm.get('preferredTimeslotReturn')?.enable();
      }

      let projectType = '';
      if (data.toProject && (!data.toProjectId || data.toProjectId === 0)) {
        projectType = 'NewProject';
      } else if (data.toProjectId && data.toProject) {
        projectType = 'ExistingProject';
      }
      this.priceListForm.get('Project')?.setValue(projectType);
      this.onProjectSubmitter({ value: projectType });

      this.initializeTimeValidators();
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 100);
  }

  private populateSelfEmployeeData(data: any): void {
    let selfEmployee: any = null;

    // Parse employeeDetails JSON if available
    if (data.employeeDetails) {
      try {
        const employeeDetailsArray =
          typeof data.employeeDetails === 'string'
            ? JSON.parse(data.employeeDetails)
            : data.employeeDetails;
        selfEmployee =
          Array.isArray(employeeDetailsArray) && employeeDetailsArray.length > 0
            ? employeeDetailsArray[0]
            : null;
      } catch (error) {
        console.error('Error parsing employeeDetails:', error);
      }
    }

    // Populate form with available data (prioritize employeeDetails > userInfoData > defaults)
    this.priceListForm.patchValue({
      selfName:
        selfEmployee?.name?.trim() ||
        data.employeeName ||
        this.userInfoData?.empnam ||
        this.empName ||
        '',
      selfEmail: selfEmployee?.email?.trim() || this.userInfoData?.personalemail || '',
      selfMobile: selfEmployee?.number?.trim() || this.userInfoData?.officeMobileNo || '',
      selfGender: selfEmployee?.gender?.trim() || this.userInfoData?.gender || '',
    });
  }

  onSubmit(): void {
    console.log('Final Form Value:', this.priceListForm.getRawValue());
    this.visible = false;
  }

  onReset(): void {
    this.priceListForm.reset();
    this.minFromDate = null;
    this.minToDate = null;
  }

  clearData(): void {
    this.visible = false;
    this.isView = true;
    this.selectedItem = null;
    this.postType = 'add';
    this.resetFormToInitialState();
    this.cdr.detectChanges();
  }

  onDrawerHide(): void {
    this.isView = true;
    this.visible = false;
    this.selectedItem = null;
    this.resetFormToInitialState();
    this.cdr.detectChanges();
  }

  // 🔵 HELPERS

  private readRouteParams(): void {
    this.route.queryParams.subscribe((params) => {
      this.id = params['id'];
      this.FormName = params['formName'];
      this.name = `Raise Ticket - ${params['name']}`;
      this.actitvityName = params['name'];
    });
  }

  private setEmployeeName(): void {
    const userInfo = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.empName = Array.isArray(userInfo) ? userInfo[0]?.empnam || '' : userInfo?.empnam || '';
  }

  private getUserValue(key: string): string {
    const data = this.InfoData;
    return Array.isArray(data) ? data[0]?.[key] || '' : data?.[key] || '';
  }

  private setUserInfoData(): void {
    this.userInfoData = this.InfoData;
  }

  // 🔵 DATE & TIME METHODS

  transformDate(newDate: any, formName: string, controlName: string): void {
    const formattedDate = this.datePipe.transform(newDate.value, 'yyyy-MM-dd');
    this.priceListForm.patchValue({
      [controlName]: formattedDate,
    });

    if (controlName === 'fromDate') {
      const fromDate = new Date(newDate.value);
      fromDate.setHours(0, 0, 0, 0);
      this.minToDate = fromDate;
      const toDate = this.priceListForm.get('toDate')?.value;
      if (toDate && new Date(toDate) < fromDate) {
        this.priceListForm.patchValue({ toDate: '' });
        this.maxHotelToDate = null;
      }
      if (this.priceListForm.get('accommodation')?.value) {
        const hotelFromDate = this.priceListForm.get('Hoteldate')?.value;
        if (hotelFromDate && new Date(hotelFromDate) < fromDate) {
          this.priceListForm.patchValue({ Hoteldate: '' });
          this.priceListForm.patchValue({ Hoteldateto: '' });
          this.maxHotelToDate = null;
        }
      }
      this.cdr.detectChanges();
    } else if (controlName === 'toDate') {
      const toDate = new Date(newDate.value);
      toDate.setHours(0, 0, 0, 0);
      this.maxHotelToDate = new Date(toDate);
      this.maxHotelToDate.setDate(toDate.getDate() + 10);
      const hotelToDate = this.priceListForm.get('Hoteldateto')?.value;
      if (hotelToDate && new Date(hotelToDate) > this.maxHotelToDate) {
        this.priceListForm.patchValue({ Hoteldateto: '' });
      }
      if (this.priceListForm.get('accommodation')?.value) {
        const hotelFromDate = this.priceListForm.get('Hoteldate')?.value;
        if (hotelFromDate && new Date(hotelFromDate) < new Date(toDate)) {
          this.priceListForm.patchValue({ Hoteldate: '' });
          this.priceListForm.patchValue({ Hoteldateto: '' });
        }
      }
      this.cdr.detectChanges();
    } else if (controlName === 'Hoteldate') {
      const hotelFromDate = new Date(newDate.value);
      hotelFromDate.setHours(0, 0, 0, 0);
      const toDate = this.priceListForm.get('toDate')?.value;
      if (toDate) {
        this.maxHotelToDate = new Date(toDate);
        this.maxHotelToDate.setDate(this.maxHotelToDate.getDate() + 10);
      }
      const hotelToDate = this.priceListForm.get('Hoteldateto')?.value;
      if (
        hotelToDate &&
        hotelFromDate &&
        this.maxHotelToDate &&
        (new Date(hotelToDate) < hotelFromDate || new Date(hotelToDate) > this.maxHotelToDate)
      ) {
        this.priceListForm.patchValue({ Hoteldateto: '' });
      }
      this.cdr.detectChanges();
    }
  }

  onDateChangeValidate(): void {
    const fromDate = this.priceListForm.get('fromDate')?.value;
    const toDate = this.priceListForm.get('toDate')?.value;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'To Date must be greater than From Date',
      });
    }
  }

  initTimeRanges(): void {
    this.timeRange = null;
    this.timeRangeReturn = null;
    this.minTime = null;
    this.maxTime = null;
    this.minTimeReturn = null;
    this.maxTimeReturn = null;
  }

  // 🔵 TIME RANGE VALIDATION METHODS

  extractTimeRange(optionText: string): { min: string; max: string; isNightRange?: boolean } {
    const timeMatch = optionText.match(/\((\d{2}:\d{2})-(\d{2}:\d{2})\)/);
    if (timeMatch && timeMatch.length >= 3) {
      const minTime = timeMatch[1];
      let maxTime = timeMatch[2];
      let isNightRange = false;
      if (maxTime === '24:00') {
        maxTime = '23:59';
        isNightRange = true;
      } else {
        isNightRange = minTime > maxTime;
        if (isNightRange) {
          maxTime = '23:59';
        }
      }

      return {
        min: minTime,
        max: maxTime,
        isNightRange: isNightRange,
      };
    }

    return { min: '00:00', max: '23:59', isNightRange: false };
  }

  convertTo24HourFormat(timeStr: string): string {
    let match = timeStr.match(/^(\d{1,2}):(\d{2})([AP]M)$/);

    if (!match) {
      match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}`;
      }
    }

    if (!match) {
      return '00:00';
    }

    const [, hoursStr, minutes, period] = match;
    let hours = parseInt(hoursStr, 10);
    const mins = parseInt(minutes, 10);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  convertTo12HourFormat(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  }

  getTimeRangeText(): string {
    if (!this.timeRange) return '';

    const minDisplay = this.convertTo12HourFormat(this.timeRange.min);
    let maxDisplay = this.convertTo12HourFormat(this.timeRange.max);

    if (this.timeRange.isNightRange) {
      return `${minDisplay} to 6:00 AM (Next Day)`;
    } else if (this.timeRange.max === '23:59') {
      maxDisplay = '11:59 PM';
    }

    return `${minDisplay} to ${maxDisplay}`;
  }

  getTimeRangeTextReturn(): string {
    if (!this.timeRangeReturn) return '';
    const minDisplay = this.convertTo12HourFormat(this.timeRangeReturn.min);
    let maxDisplay = this.convertTo12HourFormat(this.timeRangeReturn.max);

    if (this.timeRangeReturn.isNightRange) {
      maxDisplay = '6:00 AM (Next Day)';
    }

    return `${minDisplay} to ${maxDisplay}`;
  }

  getTimeRangeDisplayText(): string {
    if (!this.timeRange) return '';

    const minDisplay = this.convertTo12HourFormat(this.timeRange.min);
    let maxDisplay = this.convertTo12HourFormat(this.timeRange.max);

    if (this.timeRange.isNightRange) {
      maxDisplay = this.convertTo12HourFormat('06:00');
      return `${minDisplay} to ${maxDisplay} (next day)`;
    }

    return `${minDisplay} to ${maxDisplay}`;
  }

  timeRangeValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.timeRange || !control.value) {
      return null;
    }

    const selectedTime = control.value;
    const minTime = this.timeRange.min;
    const maxTime = this.timeRange.max;
    const isNightRange = this.timeRange.isNightRange;

    let timeToCompare: string;
    if (selectedTime instanceof Date) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      timeToCompare = `${hours}:${minutes}`;
    } else {
      timeToCompare = selectedTime ? selectedTime.padStart(5, '0') : selectedTime;
    }

    if (isNightRange) {
      const isValidNightTime = timeToCompare >= minTime && timeToCompare <= maxTime;
      if (!isValidNightTime) {
        return {
          timeOutOfRange: true,
          message: `Time must be between ${this.getTimeRangeDisplayText()}`,
        };
      }
    } else {
      if (timeToCompare < minTime || timeToCompare > maxTime) {
        return {
          timeOutOfRange: true,
          message: `Time must be between ${this.getTimeRangeDisplayText()}`,
        };
      }
    }

    return null;
  }

  private updatePreferredTimeControl() {
    const preferredTimeslotControl = this.priceListForm.get('preferredTimeslot');
    const timePreferenceControl = this.priceListForm.get('timePreferenceId');

    if (this.timeRange && preferredTimeslotControl && timePreferenceControl) {
      preferredTimeslotControl.enable();
      preferredTimeslotControl.setValidators([this.timeRangeValidator.bind(this)]);
      preferredTimeslotControl.updateValueAndValidity();
    } else if (preferredTimeslotControl) {
      preferredTimeslotControl.disable();
      preferredTimeslotControl.clearValidators();
      preferredTimeslotControl.setErrors(null);
      preferredTimeslotControl.updateValueAndValidity();
    }
  }

  private initializeTimeValidators() {
    const preferredTimeslotControl = this.priceListForm.get('preferredTimeslot');
    const preferredTimeslotReturnControl = this.priceListForm.get('preferredTimeslotReturn');

    if (preferredTimeslotControl) {
      preferredTimeslotControl.clearValidators();
      preferredTimeslotControl.setValidators([]);
      preferredTimeslotControl.updateValueAndValidity({ emitEvent: false });
    }

    if (preferredTimeslotReturnControl) {
      preferredTimeslotReturnControl.clearValidators();
      preferredTimeslotReturnControl.setValidators([]);
      preferredTimeslotReturnControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  // 🔵 TIME PREFERENCE METHODS

  onTimePreferenceChange(event: any): void {
    const selectedValue = event?.target?.value || event?.value || event;

    // Find the selected object from timedata using the selected ID
    const selectedOption = this.timedata.find((option) => option.drpValue == selectedValue);
    const preferredTimeslotControl = this.priceListForm.get('preferredTimeslot');

    // Reset time range
    this.minTime = null;
    this.maxTime = null;
    this.timeRange = null;

    if (selectedOption) {
      // Extract the time range from the drpOption string (e.g., parse "06:00-09:00" from "Morning(06:00-09:00)")
      const timeMatch = selectedOption.drpOption.match(/\((\d{2}):(\d{2})-(\d{2}):(\d{2})\)/);

      if (timeMatch) {
        const [, startHour, startMinute, endHour, endMinute] = timeMatch;

        // Create new Date objects for the current day with those start and end hours
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(today);
        startDate.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);

        const endDate = new Date(today);
        // Handle the edge case where the end time is "24:00" (set it to 23:59:59)
        if (endHour === '24' && endMinute === '00') {
          endDate.setHours(23, 59, 59, 999);
        } else {
          endDate.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
        }

        // Assign them to minTime and maxTime
        this.minTime = startDate;
        this.maxTime = endDate;
      }

      // Update timeRange for validation
      this.timeRange = this.extractTimeRange(selectedOption.drpOption);
    }

    // Reset the preferredTimeslot form control value to null so the user has to pick a new valid time
    if (preferredTimeslotControl) {
      preferredTimeslotControl.setValue(null);
      preferredTimeslotControl.reset();
      preferredTimeslotControl.setErrors(null);
      preferredTimeslotControl.markAsPristine();
      preferredTimeslotControl.markAsUntouched();
    }

    this.updatePreferredTimeControl();
    this.cdr.detectChanges();
  }

  onTimePreferenceChangeonticket(event: any): void {
    const selectedValue = event?.target?.value || event?.value || event;
    const selectedOption = this.timedata.find((option) => option.drpValue == selectedValue);
    const preferredTimeslotReturnControl = this.priceListForm.get('preferredTimeslotReturn');
    const returnTicketEnabled = this.priceListForm.get('returnTicket')?.value;

    // Reset return time range
    this.minTimeReturn = null;
    this.maxTimeReturn = null;
    this.timeRangeReturn = null;

    if (selectedOption) {
      // Extract time range string and compute Date bounds for return preferred time
      const timeMatch = selectedOption.drpOption.match(/\((\d{2}):(\d{2})-(\d{2}):(\d{2})\)/);

      if (timeMatch) {
        const [, startHour, startMinute, endHour, endMinute] = timeMatch;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(today);
        startDate.setHours(parseInt(startHour, 10), parseInt(startMinute, 10), 0, 0);

        const endDate = new Date(today);
        if (endHour === '24' && endMinute === '00') {
          // Edge case: treat 24:00 as end of day
          endDate.setHours(23, 59, 59, 999);
        } else {
          endDate.setHours(parseInt(endHour, 10), parseInt(endMinute, 10), 0, 0);
        }

        this.minTimeReturn = startDate;
        this.maxTimeReturn = endDate;
      }

      // Also keep textual time range for any validation / display logic
      this.timeRangeReturn = this.extractTimeRange(selectedOption.drpOption);
    }

    if (preferredTimeslotReturnControl) {
      // Force user to re-select a valid time in the new range
      preferredTimeslotReturnControl.setValue(null);
      preferredTimeslotReturnControl.reset();
      preferredTimeslotReturnControl.setErrors(null);
      preferredTimeslotReturnControl.markAsPristine();
      preferredTimeslotReturnControl.markAsUntouched();
    }

    this.cdr.detectChanges();
  }

  handlePreferredTimeReturnClose(): void {
    const control = this.priceListForm.get('preferredTimeslotReturn');
    if (control) {
      control.updateValueAndValidity();
    }
  }

  // 🔵 CHECKBOX METHODS

  onCheckboxSelect(option: string): void {
    // Use setTimeout to ensure Angular change detection has processed the checkbox change
    setTimeout(() => {
      const newValue = this.priceListForm.get(option)?.value || false;

      if (option === 'returnTicket') {
        if (newValue) {
          // Enable return ticket fields
          this.priceListForm.get('timePreferenceIdReturn')?.enable();
          this.priceListForm.get('preferredTimeslotReturn')?.enable();
          this.priceListForm.get('returnFromDate')?.enable();
          this.priceListForm.get('returnToDate')?.enable();
          this.priceListForm.get('timePreferenceIdReturn')?.setValidators([Validators.required]);
          this.priceListForm.get('returnFromDate')?.setValidators([Validators.required]);
          this.priceListForm.get('returnToDate')?.setValidators([Validators.required]);
        } else {
          // Disable and clear return ticket fields
          this.priceListForm.get('timePreferenceIdReturn')?.disable();
          this.priceListForm.get('preferredTimeslotReturn')?.disable();
          this.priceListForm.get('returnFromDate')?.disable();
          this.priceListForm.get('returnToDate')?.disable();
          this.priceListForm.get('timePreferenceIdReturn')?.setValue(null);
          this.priceListForm.get('preferredTimeslotReturn')?.setValue(null);
          this.priceListForm.get('returnFromDate')?.setValue(null);
          this.priceListForm.get('returnToDate')?.setValue(null);
          this.priceListForm.get('timePreferenceIdReturn')?.clearValidators();
          this.priceListForm.get('returnFromDate')?.clearValidators();
          this.priceListForm.get('returnToDate')?.clearValidators();
        }
        this.priceListForm.get('timePreferenceIdReturn')?.updateValueAndValidity();
        this.priceListForm.get('preferredTimeslotReturn')?.updateValueAndValidity();
        this.priceListForm.get('returnFromDate')?.updateValueAndValidity();
        this.priceListForm.get('returnToDate')?.updateValueAndValidity();
      } else if (option === 'accommodation') {
        if (newValue) {
          // Enable accommodation fields
          this.priceListForm.get('Hoteldate')?.enable();
          this.priceListForm.get('Hoteldateto')?.enable();
          this.priceListForm.get('Hoteldate')?.setValidators([Validators.required]);
          this.priceListForm.get('Hoteldateto')?.setValidators([Validators.required]);
          const toDate = this.priceListForm.get('toDate')?.value;
          if (toDate) {
            this.maxHotelToDate = new Date(toDate);
            this.maxHotelToDate.setDate(this.maxHotelToDate.getDate() + 10);
          }
        } else {
          // Disable and clear accommodation fields
          this.priceListForm.get('Hoteldate')?.disable();
          this.priceListForm.get('Hoteldateto')?.disable();
          this.priceListForm.get('Hoteldate')?.setValue(null);
          this.priceListForm.get('Hoteldateto')?.setValue(null);
          this.priceListForm.get('Hoteldate')?.clearValidators();
          this.priceListForm.get('Hoteldateto')?.clearValidators();
        }
        this.priceListForm.get('Hoteldate')?.updateValueAndValidity();
        this.priceListForm.get('Hoteldateto')?.updateValueAndValidity();
      } else if (option === 'conveyance') {
        if (newValue) {
          // Enable conveyance fields
          this.priceListForm.get('Localfrom')?.enable();
          this.priceListForm.get('Localto')?.enable();
          this.priceListForm.get('Localfrom')?.setValidators([Validators.required]);
          this.priceListForm.get('Localto')?.setValidators([Validators.required]);
        } else {
          // Disable and clear conveyance fields
          this.priceListForm.get('Localfrom')?.disable();
          this.priceListForm.get('Localto')?.disable();
          this.priceListForm.get('Localfrom')?.setValue('');
          this.priceListForm.get('Localto')?.setValue('');
          this.priceListForm.get('Localfrom')?.clearValidators();
          this.priceListForm.get('Localto')?.clearValidators();
        }
        this.priceListForm.get('Localfrom')?.updateValueAndValidity();
        this.priceListForm.get('Localto')?.updateValueAndValidity();
      }

      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 0);
  }

  updateDynamicFieldValidation(): void {
    const controlsToUpdate = [
      'Hoteldate',
      'Hoteldateto',
      'Localfrom',
      'Localto',
      'numOfEmp',
      'ExistingProject',
      'NewProject',
    ];

    const expenseFor = this.priceListForm.get('other')?.value;

    if (expenseFor === 'Self') {
      ['selfName', 'selfEmail', 'selfGender', 'selfMobile'].forEach((field) => {
        this.priceListForm.get(field)?.enable();
        this.priceListForm.get(field)?.setValidators([Validators.required]);
        if (field === 'selfEmail') {
          this.priceListForm.get(field)?.setValidators([Validators.required, Validators.email]);
        }
        if (field === 'selfMobile') {
          this.priceListForm
            .get(field)
            ?.setValidators([Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]);
        }
        this.priceListForm.get(field)?.updateValueAndValidity();
      });
    } else if (expenseFor === 'Other') {
      ['selfName', 'selfEmail', 'selfGender', 'selfMobile'].forEach((field) => {
        this.priceListForm.get(field)?.clearValidators();
        this.priceListForm.get(field)?.clearAsyncValidators();
        this.priceListForm.get(field)?.updateValueAndValidity();
      });
    }

    controlsToUpdate.forEach((field) => {
      this.priceListForm.get(field)?.disable();
      this.priceListForm.get(field)?.clearValidators();
      this.priceListForm.get(field)?.clearAsyncValidators();
      this.priceListForm.get(field)?.updateValueAndValidity();
    });

    if (this.showOtherEmployeeTable) {
      this.priceListForm.get('numOfEmp')?.enable();
      this.priceListForm.get('numOfEmp')?.setValidators([Validators.required]);
      this.priceListForm.get('numOfEmp')?.updateValueAndValidity();
    }

    if (this.priceListForm.get('accommodation')?.value) {
      this.priceListForm.get('Hoteldate')?.enable();
      this.priceListForm.get('Hoteldate')?.setValidators([Validators.required]);
      this.priceListForm.get('Hoteldate')?.updateValueAndValidity();

      this.priceListForm.get('Hoteldateto')?.enable();
      this.priceListForm.get('Hoteldateto')?.setValidators([Validators.required]);
      this.priceListForm.get('Hoteldateto')?.clearAsyncValidators();
      this.priceListForm.get('Hoteldateto')?.updateValueAndValidity();
    }

    if (this.priceListForm.get('conveyance')?.value) {
      this.priceListForm.get('Localfrom')?.enable();
      this.priceListForm.get('Localfrom')?.setValidators([Validators.required]);
      this.priceListForm.get('Localfrom')?.updateValueAndValidity();

      this.priceListForm.get('Localto')?.enable();
      this.priceListForm.get('Localto')?.setValidators([Validators.required]);
      this.priceListForm.get('Localto')?.updateValueAndValidity();
    }

    const projectType = this.priceListForm.get('Project')?.value;
    if (projectType === 'NewProject') {
      this.priceListForm.get('NewProject')?.enable();
      this.priceListForm.get('NewProject')?.setValidators([Validators.required]);
      this.priceListForm.get('NewProject')?.updateValueAndValidity();
      this.priceListForm.get('ExistingProject')?.disable();
      this.priceListForm.get('ExistingProject')?.clearValidators();
      this.priceListForm.get('ExistingProject')?.updateValueAndValidity();
    } else if (projectType === 'ExistingProject') {
      this.priceListForm.get('ExistingProject')?.enable();
      this.priceListForm.get('ExistingProject')?.setValidators([Validators.required]);
      this.priceListForm.get('ExistingProject')?.updateValueAndValidity();
      this.priceListForm.get('NewProject')?.disable();
      this.priceListForm.get('NewProject')?.clearValidators();
      this.priceListForm.get('NewProject')?.updateValueAndValidity();
    } else {
      this.priceListForm.get('NewProject')?.disable();
      this.priceListForm.get('NewProject')?.clearValidators();
      this.priceListForm.get('NewProject')?.updateValueAndValidity();
      this.priceListForm.get('ExistingProject')?.disable();
      this.priceListForm.get('ExistingProject')?.clearValidators();
      this.priceListForm.get('ExistingProject')?.updateValueAndValidity();
    }

    // Handle employee validation
    const employeesArray = this.priceListForm.get('otherEmployees') as FormArray;
    if (employeesArray && employeesArray.length > 0) {
      employeesArray.controls.forEach((group: AbstractControl) => {
        const empGroup = group as FormGroup;
        empGroup.get('name')?.setValidators([Validators.required]);
        empGroup.get('email')?.setValidators([Validators.required, Validators.email]);
        empGroup
          .get('number')
          ?.setValidators([Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]);
        empGroup.get('gender')?.setValidators([Validators.required]);
        empGroup.updateValueAndValidity();
      });
    }
    if (this.postType === 'add') {
      this.initializeTimeValidators();
    }
  }

  // 🔵 PROJECT METHODS

  onProjectSubmitter(event: any): void {
    const value = event?.target?.value || event?.value || event;
    this.selectedProjectType = value;
    this.priceListForm.get('Project')?.setValue(value);

    if (value === 'ExistingProject') {
      // Enable ExistingProject, disable NewProject
      this.priceListForm.get('ExistingProject')?.enable();
      this.priceListForm.get('ExistingProject')?.setValidators([Validators.required]);
      this.priceListForm.get('NewProject')?.disable();
      this.priceListForm.get('NewProject')?.clearValidators();
      this.priceListForm.get('NewProject')?.setValue('');
    } else if (value === 'NewProject') {
      // Enable NewProject, disable ExistingProject
      this.priceListForm.get('NewProject')?.enable();
      this.priceListForm.get('NewProject')?.setValidators([Validators.required]);
      this.priceListForm.get('ExistingProject')?.disable();
      this.priceListForm.get('ExistingProject')?.clearValidators();
      this.priceListForm.get('ExistingProject')?.setValue(null);
    }

    this.priceListForm.get('ExistingProject')?.updateValueAndValidity();
    this.priceListForm.get('NewProject')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  // 🔵 SUBMITTER METHODS

  onToggleSubmitter(event: any): void {
    const selectedValue = event?.target?.value || event?.value || event;

    if (selectedValue === 'Self') {
      this.showSelfTable = true;
      this.showOtherEmployeeTable = false;
      this.noOfEmployeesCount = 0;
      this.includeSelfData = false;
      this.priceListForm.get('IncludeSelf')?.setValue(false);
      this.otherEmployeesArray.clear();
      this.loadSelfData();
    } else {
      this.showSelfTable = false;
      this.showOtherEmployeeTable = true;
      this.userInfoData = null;
      this.noOfEmployeesCount = 0;
      this.includeSelfData = false;
      this.priceListForm.get('IncludeSelf')?.setValue(false);
      this.otherEmployeesArray.clear();
      this.priceListForm.get('numOfEmp')?.enable();
      this.priceListForm.get('numOfEmp')?.setValidators([Validators.required]);
      this.priceListForm.get('numOfEmp')?.updateValueAndValidity();
    }
    this.updateDynamicFieldValidation();
    this.cdr.detectChanges();
  }

  // 🔵 EMPLOYEE MANAGEMENT METHODS

  onNoOfEmployeesSelected(event: any): void {
    const target = event?.target || event;
    const count = parseInt(target?.value || 0, 10);
    this.noOfEmployeesCount = isNaN(count) ? 0 : count;

    if (this.noOfEmployeesCount > 0) {
      this.createEmployeeRows();
    } else {
      this.otherEmployeesArray.clear();
    }
    this.updateDynamicFieldValidation();
  }

  deleteEmployeeRow(index: number): void {
    if (this.otherEmployees.length > 1) {
      this.otherEmployees.removeAt(index);
    }
  }

  clearOtherEmployees(): void {
    while (this.otherEmployees.length !== 0) {
      this.otherEmployees.removeAt(0);
    }
  }

  getAvailableEmployees(currentIndex: number): any[] {
    const selectedUserIds = this.otherEmployeesArray.controls
      .map((ctrl, idx) => (idx !== currentIndex ? ctrl.get('name')?.value : null))
      .filter((val) => !!val);

    return this.EmployeeData.filter((emp: any) => !selectedUserIds.includes(emp.userId));
  }

  onIncludeSelfToggle(): void {
    // Sync includeSelfData from form control so visual state stays correct
    this.includeSelfData = this.priceListForm.get('IncludeSelf')?.value ?? false;
    if (this.showOtherEmployeeTable) {
      if (this.includeSelfData) {
        this.loadSelfData(true);
        this.userInfoData = null;
        this.createEmployeeRows();
      } else {
        const employeesArray = this.priceListForm.get('otherEmployees') as FormArray;
        const selfIndex = employeesArray.controls.findIndex(
          (control) => control.get('isSelf')?.value === true
        );
        if (selfIndex !== -1) {
          employeesArray.removeAt(selfIndex);
        }
        this.userInfoData = null;
        this.createEmployeeRows();
        this.updateDynamicFieldValidation();
      }
      this.cdr.detectChanges();
    }
  }

  // 🔵 INPUT VALIDATION METHODS

  allowOnlyNumber(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  blockNonNumericPaste(event: ClipboardEvent): void {
    const paste = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(paste)) {
      event.preventDefault();
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Input',
        detail: 'Only numbers are allowed',
      });
    }
  }

  // 🔵 API CALLS

  getCostCenterDrp(): void {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=COSTCENTER|id=0|districtId=${sessionStorage.getItem(
          'District'
        )}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`
      )
      .subscribe({
        next: (res: any) => {
          this.costcenterdata = res?.table || [];
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getCurrencyDrp(): void {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblExpanseRequestType`).subscribe({
      next: (res: any) => {
        this.currenyDrp = res?.table || [];
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        }
      },
    });
  }
  onEmployeeSelect(selectedUserId: string, index: number): void {
    const employeeFormGroup = this.otherEmployeesArray.at(index) as FormGroup;
    if (!selectedUserId) {
      employeeFormGroup.patchValue({
        email: '',
        number: '',
        gender: '',
      });
      this.cdr.detectChanges();
      return;
    }
    const empHeadId = sessionStorage.getItem('UserIdToken') || '';
    const selectedTypeAtCall = 'other';
    this.isLoading = true;
    this.userService
      .getQuestionPaper(
        `uspGetExpenseMasters|action=TOURREQNO|type=${selectedTypeAtCall}|empHeadId=${empHeadId}|appUserId=${selectedUserId}`
      )
      .subscribe({
        next: (res: any) => {
          const result = res?.table1 || res?.table || [];
          if (result.length > 0) {
            const data = result[0];
            employeeFormGroup.patchValue({
              email: data.officeEmailId || data.email || '',
              number: data.officeMobileNo || data.number || '',
              gender: data.gender || '',
            });
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error loading employee data',
            });
          }
        },
      });
  }

  private loadSelfData(forInclude: boolean = false): void {
    const empHeadId = sessionStorage.getItem('UserIdToken') || '';
    const selectedTypeAtCall = 'other';
    this.isLoading = true;
    this.userService
      .getQuestionPaper(
        `uspGetExpenseMasters|action=TOURREQNO|type=${selectedTypeAtCall}|empHeadId=${empHeadId}|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe({
        next: (res: any) => {
          this.requestNo = res?.table1 || [];
          if (this.requestNo.length > 0) {
            const selfData = this.requestNo[0];
            this.userInfoData = {
              empnam: selfData.name || '',
              personalemail: selfData.officeEmailId || selfData.email || '',
              gender: selfData.gender || '',
              officeMobileNo: selfData.officeMobileNo || selfData.number || '',
            };

            this.priceListForm.patchValue({
              selfName: this.userInfoData.empnam,
              selfEmail: this.userInfoData.personalemail,
              selfGender: this.userInfoData.gender,
              selfMobile: this.userInfoData.officeMobileNo,
            });

            if (forInclude) {
              this.createEmployeeRows();
            }
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error loading self data',
            });
          }
        },
      });
  }

  private createEmployeeRows(): void {
    this.otherEmployeesArray.clear();

    if (this.includeSelfData && this.userInfoData) {
      const selfEmp = {
        name: this.userInfoData.empnam || '',
        email: this.userInfoData.personalemail || '',
        number: this.userInfoData.officeMobileNo || '',
        gender: this.userInfoData.gender || '',
        isSelf: true,
      };
      this.otherEmployeesArray.push(this.createEmployeeGroup(selfEmp));
    }

    const selfRowCount = this.includeSelfData ? 1 : 0;
    const emptyRowsNeeded = this.noOfEmployeesCount - selfRowCount;

    for (let i = 0; i < emptyRowsNeeded; i++) {
      const emptyEmp = {
        name: '',
        email: '',
        number: '',
        gender: '',
        isSelf: false,
      };
      this.otherEmployeesArray.push(this.createEmployeeGroup(emptyEmp));
    }
  }

  private createEmployeeGroup(emp: any): FormGroup {
    return this.fb.group({
      name: [emp.name || '', Validators.required],
      email: [emp.email || '', [Validators.required, Validators.email]],
      number: [emp.number || '', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      gender: [emp.gender || '', Validators.required],
      isSelf: [emp.isSelf || false],
    });
  }

  getTimeslotDrp(): void {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.isLoading = true;
    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=TIMESLOT|id=0|districtId=${sessionStorage.getItem(
          'District'
        )}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.table || [];
          this.timedata = data;
          this.timedataticket = [...data];
          this.isLoading = false;
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  // 🔵 TABLE METHODS

  getAllViewData(isTrue: boolean): void {
    try {
      if (isTrue) {
        this.isLoading = true;
        this.cdr.markForCheck();
      } else {
        this.pageNo = 1;
      }

      const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `uspGetExpenseRequest|searchText=${this.searchText || ''}|pageIndex=${Number(
        this.pageNo
      )}|size=${Number(this.pageSize)}|districtId=${sessionStorage.getItem(
        'District'
      )}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${userRole}`;

      this.userService.getQuestionPaper(query).subscribe({
        next: (res: any) => {
          this.allViewTableData = res['table1'] || [];
          this.paginationCountData = res['table'] || [];
          this.pageNoData = res['table2'] || [];

          if (Array.isArray(this.allViewTableData)) {
            this.allViewTableData = this.allViewTableData.map((e: any, idx: number) => {
              const fromDate = e.fromDate ? this.datePipe.transform(e.fromDate, 'dd-MM-yyyy') : '';
              const toDate = e.toDate ? this.datePipe.transform(e.toDate, 'dd-MM-yyyy') : '';
              return {
                ...e,
                sno: idx + 1 + (this.pageNo - 1) * this.pageSize,
                fromDate: fromDate,
                toDate: toDate,
              };
            });
          }

          this.viewData = [...this.allViewTableData];
          this.totalCount =
            res['table']?.[0]?.totalCount ??
            res['table']?.[0]?.totalCnt ??
            this.allViewTableData.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.viewData = [];
          this.allViewTableData = [];
          this.totalCount = 0;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
          this.cdr.detectChanges();
        },
      });
    } catch (error) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onPageChange(page: number): void {
    this.pageNo = page;
    this.getAllViewData(false);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNo = 1;
    this.getAllViewData(false);
  }

  onSearchChange(event: any): void {
    this.searchText = event.value || '';
    this.pageNo = 1;
    this.getAllViewData(false);
  }

  onAdd(): void {
    this.isView = false;
    this.isViewMode = false;
    this.postType = 'add';
    this.selectedItem = null;
    this.visible = true;
    setTimeout(() => {
      this.showDialog('add');
    }, 0);
  }

  gotoView(): void {
    this.isView = true;
    this.postType = 'add';
    this.visible = false;
    this.onReset();
    this.getAllViewData(true);
  }

  getViewDetails(item: any, type: 'view' | 'update'): void {
    this.postType = type;
    this.isViewMode = type === 'view';
    this.isView = false;
    this.selectedItem = item;
    this.visible = true;
    this.isLoading = true;
    this.showDialog(type, item);
  }

  goBack(): void {
    this.router.navigate(['/raise-ticket']);
  }

  // 🔵 MODAL/DRAWER METHODS

  openHistoryModal(item: any): void {
    this.selectedItem = item;
    this.showAdminHistoryModal = true;
  }

  openApprovalHistoryModal(item: any): void {
    this.selectedItem = item;
    try {
      const historyRaw =
        item?.approvalDetail || item?.approvaldetail || item?.approvalHistory || '[]';
      this.approvalHistory =
        typeof historyRaw === 'string' ? JSON.parse(historyRaw || '[]') : historyRaw || [];
    } catch (error) {
      console.error('Error parsing approval detail:', error);
      this.approvalHistory = [];
    }
    this.historyDrawerVisible = true;
    this.cdr.detectChanges();
  }

  closeHistoryDrawer(): void {
    this.historyDrawerVisible = false;
    this.approvalHistory = [];
    this.selectedItem = null;
    this.cdr.detectChanges();
  }

  hasReimbDetails(data: any): boolean {
    try {
      const reimbDetailsArray = JSON.parse(data.reimbDetails);
      return Array.isArray(reimbDetailsArray) && reimbDetailsArray.length > 0;
    } catch (e) {
      return false;
    }
  }

  shouldDisableImprestButton(item: any): boolean {
    if (!item?.imprestHistory) return false;

    try {
      const history = JSON.parse(item.imprestHistory);
      const first = history[0];

      return first?.imprestFor === 'Initial' && first?.Status === '';
    } catch (e) {
      console.error('Invalid JSON in imprestHistory', e);
      return false;
    }
  }

  openImprestModal(item: any): void {
    if (item?.imprestHistory) {
      try {
        this.historyList = JSON.parse(item.imprestHistory);
      } catch (e) {
        console.error('Invalid JSON in imprestHistory', e);
        this.historyList = [];
      }
    } else {
      this.historyList = [];
    }
    // Note: In PrimeNG, modals are handled differently - this would need a dialog component
    // For now, we'll set a flag that can be used in the template
    this.showAdminHistoryModal = true;
    this.selectedItem = item;
  }

  openApprovalModal(data: any): void {
    try {
      const reimbDetailsArray = JSON.parse(data.reimbDetails);
      this.selectedItem = reimbDetailsArray[0];
      this.conveyanceChildData = this.selectedItem.conveyenceDetail
        ? this.selectedItem.conveyenceDetail
        : [];
      this.lodgingChildData = this.selectedItem.laudgingDetail
        ? this.selectedItem.laudgingDetail
        : [];
      this.foodExpChildData = this.selectedItem.foofExpDetail
        ? this.selectedItem.foofExpDetail
        : [];
      this.laundryChildData = this.selectedItem.laundryExpDetail
        ? this.selectedItem.laundryExpDetail
        : [];
      this.otherExpenseChildData = this.selectedItem.otherExpDetail
        ? this.selectedItem.otherExpDetail
        : [];
      // Note: In PrimeNG, modals are handled differently - this would need a dialog component
      // For now, we'll set a flag that can be used in the template
      this.showAdminHistoryModal = true;
    } catch (e) {
      console.error('Error parsing reimbDetails', e);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load approval details',
      });
    }
  }

  AdddataImprest(item: any): void {
    this.modelHeading = 'Add Imprest';
    this.selectedAction = null;
    this.extendedDate = null;
    this.extendedImprestAmount = null;
    this.Purpose = null;
    this.topUpImprestAmount = null;
    this.selectedItem = item;

    // Set minimum date for extended date picker (should be after toDate)
    if (item?.toDate) {
      const toDate = new Date(item.toDate);
      toDate.setDate(toDate.getDate() + 1);
      this.minImprestDate = toDate;
    } else {
      this.minImprestDate = new Date();
    }

    this.imprestDialogVisible = true;
    this.cdr.detectChanges();
  }

  closeImprestDialog(): void {
    this.imprestDialogVisible = false;
    this.selectedAction = null;
    this.extendedDate = null;
    this.extendedImprestAmount = null;
    this.Purpose = null;
    this.topUpImprestAmount = null;
    this.minImprestDate = null;
    this.cdr.detectChanges();
  }

  // 🔵 FORM SUBMISSION UPDATED

  OnSubmitModal(): void {
    // Client-side form validation guard

    // Trigger all validation messages
    this.priceListForm.markAllAsTouched();

    // Show error message to user

    setTimeout(() => {
      const firstInvalidElement = document.querySelector(
        '.ng-invalid:not(form)'
      ) as HTMLElement | null;

      if (firstInvalidElement) {
        firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (typeof firstInvalidElement.focus === 'function') {
          firstInvalidElement.focus();
        }
      }
    }, 100);

    console.log('OnSubmitModal', this.priceListForm.getRawValue());
    let employeeJSON = '';
    const submitterType = this.priceListForm.get('other')?.value;

    if (submitterType === 'Self') {
      if (this.userInfoData) {
        const selfEmployeeData = {
          name: this.priceListForm.get('selfName')?.value || '',
          email: this.priceListForm.get('selfEmail')?.value || '',
          number: this.priceListForm.get('selfMobile')?.value || '',
          gender: this.priceListForm.get('selfGender')?.value || '',
          employeeId: this.InfoData?.empId || '',
        };
        employeeJSON = JSON.stringify([selfEmployeeData]);
      }
    } else if (submitterType === 'Other') {
      const employeeData = this.otherEmployeesArray.value;
      if (employeeData && employeeData.length > 0) {
        const cleanedEmployeeData = employeeData.map((emp: any, index: number) => {
          let selectedEmployee = null;
          let employeeId = '';
          let name = emp.name || '';

          if (this.includeSelfData && index === 0 && this.userInfoData) {
            return {
              name: this.userInfoData.empnam || '',
              email: this.userInfoData.personalemail || '',
              number: this.userInfoData.officeMobileNo || '',
              gender: this.userInfoData.gender || '',
              employeeId: this.InfoData.empId || '',
            };
          }

          selectedEmployee = this.EmployeeData.find((e: any) => e.userId === emp.name);
          employeeId = selectedEmployee ? selectedEmployee.drpValue : '';
          name = selectedEmployee ? selectedEmployee.drpOption : emp.name || '';

          return {
            name: name,
            email: emp.email || '',
            number: emp.number || '',
            gender: emp.gender || '',
            employeeId: employeeId,
          };
        });
        employeeJSON = JSON.stringify(cleanedEmployeeData);
      }
    }

    let toProjectText = '';
    let toProjectId = '';
    const existingProjectValue = this.priceListForm.get('ExistingProject')?.value;
    const newProjectValue = this.priceListForm.get('NewProject')?.value;
    if (existingProjectValue && existingProjectValue !== '0') {
      const selectedProjectOption = this.costcenterdata.find(
        (opt: any) => opt.drpValue == existingProjectValue
      );
      toProjectText = selectedProjectOption ? selectedProjectOption.drpOption : '';
      toProjectId = existingProjectValue;
    } else if (newProjectValue) {
      toProjectText = newProjectValue;
      toProjectId = '0';
    }

    const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    if (this.postType === 'add') {
      this.paramvaluedata =
        `requestTypeId=10001` +
        `|ticketId=0` +
        `|fromDate=${this.datePipe.transform(
          this.priceListForm.get('fromDate')?.value,
          'yyyy-MM-dd'
        )}` +
        `|toDate=${this.datePipe.transform(
          this.priceListForm.get('toDate')?.value,
          'yyyy-MM-dd'
        )}` +
        `|purpose=${this.priceListForm.get('purpose')?.value}` +
        `|isoPurposeId=0` +
        `|imprest=${this.priceListForm.get('imprest')?.value}` +
        `|appUserId=${sessionStorage.getItem('userId')}` +
        `|travelSource=${this.priceListForm.get('Source')?.value}` +
        `|travelDestination=${this.priceListForm.get('destination')?.value}` +
        `|remarks=${this.priceListForm.get('remarks')?.value || ''}` +
        `|travelModeId=${this.priceListForm.get('travelById')?.value}` +
        `|toProject=${toProjectText}` +
        `|toProjectId=${toProjectId}` +
        `|timePrefSlot=${this.priceListForm.get('timePreferenceId')?.value}` +
        `|prefTime=${
          this.priceListForm.get('preferredTimeslot')?.value
            ? this.datePipe.transform(
                this.priceListForm.get('preferredTimeslot')?.value,
                'HH:mm:ss'
              ) || ''
            : ''
        }` +
        `|returnTicket=${this.priceListForm.get('returnTicket')?.value ? 1 : 0}` +
        `|returnTime=${
          this.priceListForm.get('preferredTimeslotReturn')?.value
            ? this.datePipe.transform(
                this.priceListForm.get('preferredTimeslotReturn')?.value,
                'HH:mm:ss'
              ) || ''
            : ''
        }` +
        `|returnTimePrefId=${this.priceListForm.get('timePreferenceIdReturn')?.value || ''}` +
        `|accomodation=${this.priceListForm.get('accommodation')?.value ? 1 : 0}` +
        `|accFromDate=${
          this.datePipe.transform(this.priceListForm.get('Hoteldate')?.value, 'yyyy-MM-dd') || ''
        }` +
        `|accToDate=${
          this.datePipe.transform(this.priceListForm.get('Hoteldateto')?.value, 'yyyy-MM-dd') || ''
        }` +
        `|localConveyance=${this.priceListForm.get('conveyance')?.value ? 1 : 0}` +
        `|fromLocation=${this.priceListForm.get('Localfrom')?.value || ''}` +
        `|toLocation=${this.priceListForm.get('Localto')?.value || ''}` +
        `|appUserRole=${userRole}` +
        `|activity=${this.actitvityName}` +
        `|expenseFor=${submitterType}` +
        `|employeeJSON=${employeeJSON}`;
    } else {
      this.paramvaluedata =
        `id=${this.selectedItem.id}` +
        `|requestTypeId=10001` +
        `|fromDate=${this.datePipe.transform(
          this.priceListForm.get('fromDate')?.value,
          'yyyy-MM-dd'
        )}` +
        `|toDate=${this.datePipe.transform(
          this.priceListForm.get('toDate')?.value,
          'yyyy-MM-dd'
        )}` +
        `|purpose=${this.priceListForm.get('purpose')?.value}` +
        `|isoPurposeId=0` +
        `|imprest=${this.priceListForm.get('imprest')?.value}` +
        `|appUserId=${sessionStorage.getItem('userId')}` +
        `|travelSource=${this.priceListForm.get('Source')?.value}` +
        `|travelDestination=${this.priceListForm.get('destination')?.value}` +
        `|remarks=${this.priceListForm.get('remarks')?.value || ''}` +
        `|travelModeId=${this.priceListForm.get('travelById')?.value}` +
        `|toProject=${toProjectText}` +
        `|toProjectId=${toProjectId}` +
        `|timePrefSlot=${this.priceListForm.get('timePreferenceId')?.value}` +
        `|prefTime=${
          this.priceListForm.get('preferredTimeslot')?.value
            ? this.datePipe.transform(
                this.priceListForm.get('preferredTimeslot')?.value,
                'HH:mm:ss'
              ) || ''
            : ''
        }` +
        `|returnTicket=${this.priceListForm.get('returnTicket')?.value ? 1 : 0}` +
        `|returnTime=${
          this.priceListForm.get('preferredTimeslotReturn')?.value
            ? this.datePipe.transform(
                this.priceListForm.get('preferredTimeslotReturn')?.value,
                'HH:mm:ss'
              ) || ''
            : ''
        }` +
        `|returnTimePrefId=${this.priceListForm.get('timePreferenceIdReturn')?.value || ''}` +
        `|accomodation=${this.priceListForm.get('accommodation')?.value ? 1 : 0}` +
        `|accFromDate=${
          this.datePipe.transform(this.priceListForm.get('Hoteldate')?.value, 'yyyy-MM-dd') || ''
        }` +
        `|accToDate=${
          this.datePipe.transform(this.priceListForm.get('Hoteldateto')?.value, 'yyyy-MM-dd') || ''
        }` +
        `|localConveyance=${this.priceListForm.get('conveyance')?.value ? 1 : 0}` +
        `|fromLocation=${this.priceListForm.get('Localfrom')?.value || ''}` +
        `|toLocation=${this.priceListForm.get('Localto')?.value || ''}` +
        `|expenseFor=${submitterType}` +
        `|appUserRole=${userRole}` +
        `|activity=${this.actitvityName}` +
        `|employeeJSON=${employeeJSON}`;
    }

    this.openConfirmDialog('Confirm?', 'Are you sure you want to proceed?', '1', '1');
  }

  openConfirmDialog(title: string, msg: string, id: string, option?: string): void {
    const isUpdate = this.postType === 'update';
    this.confirmationService.confirm({
      header: isUpdate ? 'Confirm Update' : title,
      message: msg,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        if (option === '1') {
          this.submitcall();
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: isUpdate ? 'Request update cancelled' : 'Request submission cancelled',
        });
      },
    });
  }

  submitcall(): void {
    if (this.isProccess) {
      return;
    }

    this.isProccess = true;
    this.isLoading = true;

    const SP = this.postType === 'add' ? 'uspPostExpenseRequest' : 'uspPostUpdateExpenseRequest';

    this.userService.SubmitPostTypeData(SP, this.paramvaluedata, this.FormName).subscribe({
      next: (datacom: any) => {
        if (datacom !== '') {
          const resultarray = datacom.split('-');

          if (resultarray[1] === 'success') {
            setTimeout(() => {
              let successMessage = '';

              if (this.postType === 'update') {
                successMessage = 'Data Updated Successfully.';
              } else {
                successMessage = 'Data saved Successfully.';
                const currentHour = new Date().getHours();
                if (currentHour >= 18) {
                  successMessage +=
                    ' This request was submitted outside of regular business hours (after 6:00 PM). It will be reviewed and processed on the next working day. For urgent assistance, please contact the Administration staff directly.';
                }
              }

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: successMessage,
              });

              this.isLoading = false;
              this.isProccess = false;
              this.resetFormToInitialState();

              if (this.postType === 'update') {
                this.gotoView();
              } else {
                this.visible = false;
                this.isView = true;
                this.selectedItem = null;
                this.resetFormToInitialState();
                // Refresh table after closing drawer with a small delay
                setTimeout(() => {
                  this.getAllViewData(true);
                  this.cdr.detectChanges();
                }, 300);
              }
            }, 500);
          } else if (resultarray[0] === '2') {
            setTimeout(() => {
              this.isLoading = false;
              this.isProccess = false;

              this.messageService.add({
                severity: 'warn',
                summary: 'Alert',
                detail: resultarray[1] || 'Warning',
              });
            }, 1000);
          } else if (datacom === 'Error occured while processing data!--error') {
            setTimeout(() => {
              this.isLoading = false;
              this.isProccess = false;

              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Something went wrong!',
              });
            }, 1000);
          } else {
            this.isLoading = false;
            this.isProccess = false;

            this.messageService.add({
              severity: 'warn',
              summary: 'Alert',
              detail: datacom || 'Warning',
            });
          }
        } else {
          this.isLoading = false;
          this.isProccess = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong!',
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        setTimeout(() => {
          this.isProccess = false;
          this.isLoading = false;
        }, 500);

        if (err.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'You are not authorized!',
          });
        } else if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message?.toString() || err.message || 'Something went wrong',
          });
        }
      },
    });
  }

  Approvedimprest(): void {
    if (!this.selectedItem) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No item selected.',
      });
      return;
    }

    if (!this.extendedImprestAmount || this.extendedImprestAmount <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Please enter a valid Imprest Amount.',
      });
      return;
    }
    if (!this.Purpose) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Please enter a Purpose.',
      });
      return;
    }
    if (this.selectedAction === 'extendedDate' && !this.extendedDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Please select an Extended Date.',
      });
      return;
    }

    let toDateParam = '';

    if (this.selectedAction === 'extendedDate') {
      toDateParam = this.datePipe.transform(this.extendedDate, 'yyyy-MM-dd') || '';
    } else {
      const today = new Date();
      toDateParam = this.datePipe.transform(today, 'yyyy-MM-dd') || '';
    }

    const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const actionText = this.selectedAction === 'extendedDate' ? 'Extended Date' : 'Top-Up';
    const paramvaluedata =
      `id=${this.selectedItem.id}` +
      `|todate=${toDateParam}` +
      `|imprestFor=${actionText}` +
      `|imprestAmount=${this.extendedImprestAmount}` +
      `|purpose=${this.Purpose || 'N/A'}` +
      `|appUserId=${sessionStorage.getItem('userId')}` +
      `|apUseRole=${userRole}`;

    this.isLoading = true;
    this.userService
      .SubmitPostTypeData('uspPostExpenseImprest', paramvaluedata, this.FormName)
      .subscribe({
        next: (datacom: any) => {
          this.isLoading = false;

          if (datacom && typeof datacom === 'string' && datacom.toLowerCase().includes('success')) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Imprest extended successfully.',
            });
            if (this.dataDialogRef) {
              this.dataDialogRef.close();
            }
            this.getAllViewData(true);
          } else if (typeof datacom === 'string' && datacom.toLowerCase().includes('error')) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: datacom.replace(/--error/i, '').trim(),
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: datacom || 'Something went wrong',
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;

          if (err.status === 401) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You are not authorized!',
            });
          } else if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message?.toString() || err.message || 'Something went wrong',
            });
          }
        },
      });
  }

  resetFormToInitialState(): void {
    this.showSelfTable = false;
    this.showOtherEmployeeTable = false;
    this.selectedProjectType = null;
    this.userInfoData = null;
    this.includeSelfData = false;
    this.priceListForm.get('IncludeSelf')?.setValue(false);
    this.noOfEmployeesCount = 0;
    this.clearOtherEmployees();
    this.currentDate = new Date();
    this.currentDate.setHours(0, 0, 0, 0);

    // Reset date constraints
    this.minFromDate = null;
    this.minToDate = null;

    this.timeRange = null;
    this.timeRangeReturn = null;

    const empName = JSON.parse(sessionStorage.getItem('UserInfo') || '{}').empnam || '';
    this.priceListForm.reset({
      name: empName,
      fromDate: '',
      toDate: '',
      purpose: '',
      imprest: '',
      travelById: '',
      timePreferenceId: '',
      other: '',
      Source: '',
      destination: '',
      Project: '',
      ExistingProject: '',
      NewProject: '',
      timePreferenceIdReturn: '',
      returnFromDate: '',
      returnToDate: '',
      Hoteldate: '',
      Hoteldateto: '',
      Localfrom: '',
      Localto: '',
      numOfEmp: '',
      IncludeSelf: false,
      returnTicket: false,
      accommodation: false,
      conveyance: false,
    });

    this.priceListForm.get('name')?.disable();
    this.priceListForm.get('Hoteldate')?.disable();
    this.priceListForm.get('Hoteldateto')?.disable();
    this.priceListForm.get('Localfrom')?.disable();
    this.priceListForm.get('Localto')?.disable();
    this.priceListForm.get('ExistingProject')?.disable();
    this.priceListForm.get('NewProject')?.disable();
    this.priceListForm.get('returnFromDate')?.disable();
    this.priceListForm.get('returnToDate')?.disable();

    // Enable checkboxes so they can be toggled
    this.priceListForm.get('returnTicket')?.enable();
    this.priceListForm.get('accommodation')?.enable();
    this.priceListForm.get('conveyance')?.enable();

    const timeControls = ['preferredTimeslot', 'preferredTimeslotReturn', 'timePreferenceIdReturn'];
    timeControls.forEach((controlName) => {
      const control = this.priceListForm.get(controlName);
      if (control) {
        control.disable();
        control.clearValidators();
        control.setErrors(null);
        control.updateValueAndValidity({ emitEvent: false });
      }
    });

    this.cdr.detectChanges();
  }

  closeAfterHoursModal(): void {
    this.afterHoursMessageVisible = false;
    this.cdr.detectChanges();
  }

  closeAccessoryModal(): void {
    this.showAdminHistoryModal = false;
    this.selectedItem = null;
  }

  viewAttachment(url: string): void {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
    }
  }

  setMinFromDate(): void {
    this.minFromDate = new Date(this.currentDate);
    this.minFromDate.setDate(this.currentDate.getDate() - 5);
    this.minFromDate.setHours(0, 0, 0, 0);
    this.minToDate = new Date(this.minFromDate);
  }

  /* ================= DATE HANDLERS ================= */
  onFromDateSelect(event: any): void {
    const selectedDate = event;
    if (selectedDate) {
      // Set minToDate to the selected fromDate
      this.minToDate = new Date(selectedDate);
      // Update minFromDate to disable dates before selected date in fromDate picker
      this.minFromDate = new Date(selectedDate);

      // If toDate is already selected and is before fromDate, reset it
      const toDate = this.priceListForm.get('toDate')?.value;
      if (toDate && new Date(toDate) < new Date(selectedDate)) {
        this.priceListForm.patchValue({ toDate: null }, { emitEvent: false });
      }
    }
  }
}
