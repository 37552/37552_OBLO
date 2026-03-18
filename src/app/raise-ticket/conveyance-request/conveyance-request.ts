import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableTemplate, TableColumn } from '../../table-template/table-template';

import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conveyance-request',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    DrawerModule,
    DatePickerModule,
    InputTextModule,
    ButtonModule,
    IftaLabelModule,
    ReactiveFormsModule,
    SelectModule,
    FormsModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TableTemplate,
    PopoverModule,
  ],
  templateUrl: './conveyance-request.html',
  styleUrl: './conveyance-request.scss',
  providers: [DatePipe],
})
export class ConveyanceRequest {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private datePipe: DatePipe,
    private Customvalidation: Customvalidation,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  /* ================= UI FLAGS ================= */
  showEmployeeSection = true;
  showRouteSection = true;
  showDateSection = true;

  visible = false;
  dialogType: 'add' | 'update' | 'view' = 'add';
  header = 'Add Conveyance Request';
  headerIcon = 'pi pi-plus';
  selectedItem: any = null;
  FormName = 'header';
  actitvityName = 'Conveyance';
  isProccess = false;
  historyDrawerVisible = false;
  approvalHistory: any[] = [];

  /* ================= DATE CONSTRAINTS ================= */
  minFromDate: Date | null = null;
  minToDate: Date | null = null;

  /* ================= FORM ================= */
  priceListForm: any;
  empName = '';

  /* ================= DROPDOWN ================= */
  travelByDrpAll: any[] = [];

  /* ================= TABLE ================= */
  viewData: any[] = [];
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];
  pageNoData: any[] = [];
  totalCount = 0;
  pageNo = 1;
  pageSize = 10;
  searchText = '';
  isLoading = false;
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request No', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'travelByText', header: 'Travel Mode', isVisible: true, isSortable: false },
    //wfLevel
    { key: 'wfLevel', header: 'WF Level', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'travelSource', header: 'Source', isVisible: true, isSortable: false },
    { key: 'travelDestination', header: 'Destination', isVisible: true, isSortable: false },
    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
    { key: 'imprest', header: 'Imprest', isVisible: true, isSortable: false },
    { key: 'approvedStatus', header: 'Status', isVisible: true, isSortable: false },
  ];

  /* ================= BREADCRUMB ================= */
  breadcrumbItems = [
    { label: 'Home', url: '/', title: 'Home' },
    { label: 'Raise Ticket', url: '/raise-ticket', title: 'Raise Ticket' },
    { label: 'Conveyance Request', title: 'Conveyance Request' },
  ];

  /* ================= INIT ================= */
  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params['formName']) {
      this.FormName = params['formName'];
    }
    if (params['name']) {
      this.actitvityName = params['name'];
    }

    const userInfo = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.empName = userInfo.empnam || '';

    this.initForm();
    this.getTravelByDrp();
    this.getAllViewData(true);
  }

  initForm() {
    this.priceListForm = this.fb.group({
      name: [{ value: this.empName, disabled: true }, Validators.required],
      travelById: [null, Validators.required],
      purpose: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      imprest: [null, [Validators.required, Validators.min(1)]],
      source: ['', Validators.required],
      destination: ['', Validators.required],
      remarks: ['', Validators.required],
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

  /* ================= DIALOG ================= */
  showDialog(type: 'add' | 'update' | 'view', data: any) {
    this.dialogType = type;
    this.visible = true;
    this.selectedItem = data || null;
    this.priceListForm.reset();
    this.priceListForm.enable();
    
    // Reset date constraints
    this.minFromDate = null;
    this.minToDate = null;

    if (type === 'add') {
      this.header = 'Add Conveyance Request';
      this.headerIcon = 'pi pi-plus';
      this.priceListForm.patchValue({
        name: this.empName,
      });
    } else {
      this.header = type === 'update' ? 'Update Conveyance Request' : 'View Conveyance Request';
      this.headerIcon = type === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      if (data) {
        setTimeout(() => {
          this.loadDataForEdit(data);
          if (type === 'view') {
            this.priceListForm.disable();
          }
        }, 100);
      } else {
        if (type === 'view') {
          this.priceListForm.disable();
        }
      }
    }
  }

  loadDataForEdit(data: any) {
    const nameControl = this.priceListForm.get('name');
    if (nameControl?.disabled) {
      nameControl.enable();
    }

    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (data.fromDate) {
      try {
        if (data.fromDate instanceof Date) {
          fromDate = data.fromDate;
        } else if (typeof data.fromDate === 'string') {
          const dateStr = data.fromDate.trim();
          if (dateStr) {
            const dateValue = new Date(dateStr);
            if (!isNaN(dateValue.getTime())) {
              fromDate = dateValue;
            } else {
              console.warn('Invalid fromDate:', dateStr);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing fromDate:', error, data.fromDate);
      }
    }

    if (data.toDate) {
      try {
        if (data.toDate instanceof Date) {
          toDate = data.toDate;
        } else if (typeof data.toDate === 'string') {
          const dateStr = data.toDate.trim();
          if (dateStr) {
            const dateValue = new Date(dateStr);
            if (!isNaN(dateValue.getTime())) {
              toDate = dateValue;
            } else {
              console.warn('Invalid toDate:', dateStr);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing toDate:', error, data.toDate);
      }
    }

    this.priceListForm.patchValue(
      {
        name: data.employeeName || data.name || this.empName,
        travelById: data.travelById || data.travelModeId || null,
        purpose: data.purpose || '',
        fromDate: fromDate,
        toDate: toDate,
        imprest: data.imprest || null,
        source: data.travelSource || data.source || '',
        destination: data.travelDestination || data.destination || '',
        remarks: data.remarks || '',
      },
      { emitEvent: false }
    );

    // Set minToDate based on fromDate when loading data for edit
    if (fromDate) {
      this.minToDate = new Date(fromDate);
    }

    if (nameControl && this.dialogType === 'view') {
      nameControl.disable();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }

  /* ================= DROPDOWN ================= */
  onTravelByChange(event: any) {
    this.priceListForm.patchValue({
      travelById: event.value,
    });
  }

  /* ================= DATE HANDLERS ================= */
  onFromDateSelect(event: any) {
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

  /* ================= API ================= */
  getTravelByDrp() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=TRAVELTYPECONVEY|id=0|appUserId=${sessionStorage.getItem(
          'userId'
        )}|districtId=${sessionStorage.getItem('District')}|appUserRole=${roleID}`
      )
      .subscribe((res: any) => {
        this.travelByDrpAll = res?.table || [];
      });
  }

  getAllViewData(isTrue: boolean): void {
    try {
      if (isTrue) {
        this.isLoading = true;
        this.cdr.markForCheck();
      } else {
        this.pageNo = 1;
      }

      const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `uspGetSiteExpenseRequest|searchText=${
        this.searchText || ''
      }|pageIndex=${Number(this.pageNo)}|size=${Number(
        this.pageSize
      )}|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem(
        'userId'
      )}|appUserRole=${userRole}`;

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

  onsearchChange(event: any): void {
    this.searchText = event.value || '';
    this.pageNo = 1;
    this.getAllViewData(false);
  }

  openHistoryDrawer(item: any): void {
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
  }

  /* ================= SUBMIT ================= */
  onSubmit() {
    this.priceListForm.markAllAsTouched();

    if (this.priceListForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill required fields',
      });
      return;
    }

    const formValue = this.priceListForm.getRawValue();

    const fromDate = new Date(formValue.fromDate);
    const toDate = new Date(formValue.toDate);

    if (fromDate > toDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: "'To Date' should be greater than 'From Date'",
      });
      return;
    }

    const isUpdate = this.dialogType === 'update';

    this.confirmationService.confirm({
      header: isUpdate ? 'Confirm Update' : 'Confirm',
      message: isUpdate
        ? 'Do you want to update this request?'
        : 'Do you want to submit this request?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => this.submitAfterConfirm(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: isUpdate ? 'Request update cancelled' : 'Request submission cancelled',
        });
      },
    });
  }

  submitAfterConfirm() {
    const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const appUserId = sessionStorage.getItem('userId') || '';

    const fromDate =
      this.datePipe.transform(this.priceListForm.get('fromDate')?.value, 'yyyy-MM-dd') || '';
    const toDate =
      this.datePipe.transform(this.priceListForm.get('toDate')?.value, 'yyyy-MM-dd') || '';
    const purpose = this.priceListForm.get('purpose')?.value || '';
    const imprest = this.priceListForm.get('imprest')?.value || 0;
    const travelSource = this.priceListForm.get('source')?.value || '';
    const travelDestination = this.priceListForm.get('destination')?.value || '';
    const travelModeId = this.priceListForm.get('travelById')?.value || 0;
    const remarks = this.priceListForm.get('remarks')?.value || '';

    const employeeJSON = JSON.stringify([]);

    let paramvaluedata = '';

    if (this.dialogType === 'add') {
      paramvaluedata =
        `requestTypeId=10003` +
        `|ticketId=0` +
        `|fromDate=${fromDate}` +
        `|toDate=${toDate}` +
        `|purpose=${purpose}` +
        `|imprest=${imprest}` +
        `|appUserId=${appUserId}` +
        `|travelSource=${travelSource}` +
        `|travelDestination=${travelDestination}` +
        `|travelModeId=${travelModeId || 0}` +
        `|remarks=${remarks}` +
        `|toProjectId=0` +
        `|toProject=` +
        `|timePrefSlot=0` +
        `|prefTime=` +
        `|returnTicket=0` +
        `|returnTime=` +
        `|returnTimePrefId=0` +
        `|accomodation=0` +
        `|accFromDate=` +
        `|accToDate=` +
        `|localConveyance=0` +
        `|isoPurposeId=0` +
        `|fromLocation=` +
        `|toLocation=` +
        `|expenseFor=` +
        `|employeeJSON=${employeeJSON}` +
        `|activity=${this.actitvityName}` +
        `|appUserRole=${userRole}`;
    } else {
      paramvaluedata =
        `id=${this.selectedItem?.id || 0}` +
        `|requestTypeId=10003` +
        `|fromDate=${fromDate}` +
        `|toDate=${toDate}` +
        `|purpose=${purpose}` +
        `|isoPurposeId=0` +
        `|imprest=${imprest}` +
        `|appUserId=${appUserId}` +
        `|travelSource=${travelSource}` +
        `|travelDestination=${travelDestination}` +
        `|travelModeId=${travelModeId || 0}` +
        `|remarks=${remarks}` +
        `|toProjectId=0` +
        `|toProject=` +
        `|timePrefSlot=0` +
        `|prefTime=` +
        `|returnTicket=0` +
        `|returnTime=` +
        `|returnTimePrefId=0` +
        `|accomodation=0` +
        `|accFromDate=` +
        `|accToDate=` +
        `|localConveyance=0` +
        `|fromLocation=` +
        `|toLocation=` +
        `|expenseFor=` +
        `|employeeJSON=${employeeJSON}` +
        `|activity=${this.actitvityName}` +
        `|appUserRole=${userRole}`;
    }

    console.log('FINAL PAYLOAD:', paramvaluedata);
    this.submitcall(paramvaluedata);
  }

  /* ================= FINAL API CALL ================= */
  submitcall(paramvaluedata: string) {
    if (this.isProccess) {
      return;
    }

    this.isProccess = true;
    const SP = this.dialogType === 'add' ? 'uspPostExpenseRequest' : 'uspPostUpdateExpenseRequest';

    this.userService.SubmitPostTypeData(SP, paramvaluedata, this.FormName).subscribe({
      next: (datacom: any) => {
        if (datacom != '') {
          const resultarray = datacom.split('-');

          if (resultarray[1] == 'success') {
            setTimeout(() => {
              let successMessage = '';
              if (this.dialogType === 'update') {
                successMessage = 'Data Updated Successfully.';
              } else {
                successMessage = 'Data Saved Successfully.';
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

              this.isProccess = false;
              this.priceListForm.reset();
              this.priceListForm.patchValue({
                name: this.empName,
              });
              this.visible = false;
              this.selectedItem = null;
              this.getAllViewData(false);
            }, 500);
          } else if (resultarray[0] == '2') {
            setTimeout(() => {
              this.isProccess = false;
              this.messageService.add({
                severity: 'warn',
                summary: 'Alert',
                detail: resultarray[1] || 'Warning',
              });
            }, 1000);
          } else if (datacom == 'Error occured while processing data!--error') {
            setTimeout(() => {
              this.isProccess = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Something went wrong!',
              });
            }, 1000);
          } else {
            this.isProccess = false;
            this.messageService.add({
              severity: 'warn',
              summary: 'Alert',
              detail: datacom || 'Warning',
            });
          }
        } else {
          this.isProccess = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong!',
          });
        }
      },
      error: (err: any) => {
        setTimeout(() => {
          this.isProccess = false;
        }, 500);

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
            detail: err.error?.message?.toString() || err.message || 'Something went wrong',
          });
        }
      },
    });
  }

  onReset() {
    this.priceListForm.reset();
    this.minFromDate = null;
    this.minToDate = null;
  }
}
