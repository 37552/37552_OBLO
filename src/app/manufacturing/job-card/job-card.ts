import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { Customvalidation, noInvalidPipelineName } from '../../shared/Validation';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';


interface EmployeeOption {
  drpValue: number;
  drpOption: string;
}


@Component({
  selector: 'app-job-card',
  imports: [
    TableTemplate,
    CardModule,
    TableModule,
    Dialog,
    ButtonModule,
    DrawerModule,
    Popover,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    ConfirmDialog,
    ProgressSpinner,
    MultiSelectModule,
    Toast,
    Tooltip,
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './job-card.html',
  styleUrl: './job-card.scss'
})
export class JobCard {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  groupMasterForm1: FormGroup;
  jobTimeLogForm: FormGroup;
  groupListArray = []
  totalCount = 0;
  editingLossIndex: number | null = null;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'jobCardSeries', header: 'Naming Series', isVisible: true, isSortable: false },
    { key: 'postingDate', header: 'Posting Date', isVisible: true, isSortable: false },
    { key: 'workOrderCode', header: 'Work Order', isVisible: true, isSortable: false },
    { key: 'bomCode', header: 'BOM Number', isVisible: true, isSortable: false },
    { key: 'stationDetails', header: 'Workstation', isVisible: true, isSortable: false },
    { key: 'operation', header: 'Operation Name', isVisible: true, isSortable: false },
    { key: 'quantity', header: 'Quantity to Manufacture', isVisible: true, isSortable: false },
    { key: 'totalCompletedQuantity', header: 'Total Completed Quantity', isVisible: true, isSortable: false },
    { key: 'expectedStartDate', header: 'Expected Start Date', isVisible: true, isSortable: false },
    { key: 'expectedEndDate', header: 'Expected End Date', isVisible: true, isSortable: false },
    { key: 'expectedHoursRequired', header: 'Expected Time Required', isVisible: true, isSortable: false },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Job Card - Time Logs', isVisible: true, isSortable: false, isCustom: true },
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  productTypedrp: any = []
  previousGroupType: any;
  selectedrowIndex: any
  itemDailog: boolean = false
  itemManufactureDrp = []
  relatedToDrp = []
  salesOrdersDrp = []
  workOrderDrp = []
  workOrderOpsDrp = []

  billMaterialDrp = []
  statusDrp = []
  workOrderMasterDrp = []
  applicationMasterDrp: EmployeeOption[] = [];
  workStationMasterDrp = [];
  OperationDrp = []

  jobTimeLogList: any[] = [];
  editingIndex: number | null = null;

  minToDate: string;
  minToDate1: string;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
  ) {

    this.minToDate = '';
    this.minToDate1 = '';

    this.groupMasterForm1 = this.fb.group({
      postingDate: ['', Validators.required],
      workOrder: ['', Validators.required],
      bomNumber: ['', Validators.required],
      workstation: ['', Validators.required],
      operations: ['', Validators.required],
      quantityToManufacture: ['', [Validators.required, noInvalidPipelineName()]],
      totalCompletedQty: ['', [Validators.required, noInvalidPipelineName()]],
      expectedStartDate: ['', Validators.required],
      expectedEndDate: ['', Validators.required],
      expectedTimeRequired: ['', Validators.required],
      status: ['', Validators.required],
    });

    this.jobTimeLogForm = this.fb.group({
      employeeName: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      fromTime: ['', Validators.required],
      toTime: ['', Validators.required],
    },
      {
        validators: [this.dateTimeValidator],
      }
    );
  }

  dateTimeValidator(control: AbstractControl) {
    const fromDate = control.get('fromDate')?.value;
    const toDate = control.get('toDate')?.value;
    const fromTime = control.get('fromTime')?.value;
    const toTime = control.get('toTime')?.value;

    const toTimeCtrl = control.get('toTime');

    if (toTimeCtrl?.hasError('timeInvalid')) {
      const errors = { ...toTimeCtrl.errors };
      delete errors['timeInvalid'];
      toTimeCtrl.setErrors(Object.keys(errors).length ? errors : null);
    }

    if (fromDate && toDate && fromTime && toTime && fromDate === toDate) {
      const fromTimeMs = new Date(fromTime).getTime();
      const toTimeMs = new Date(toTime).getTime();

      if (fromTimeMs >= toTimeMs) {
        const existingErrors = toTimeCtrl?.errors || {};
        toTimeCtrl?.setErrors({ ...existingErrors, timeInvalid: true });
        return { timeInvalid: true };
      }
    }

    return null;
  }

  isTimeInvalid(): boolean {
    const toTimeCtrl = this.jobTimeLogForm.get('toTime');
    return !!toTimeCtrl?.hasError('timeInvalid') && toTimeCtrl.touched;
  }


  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getBillMaterialDrpMaster()
    this.getStatusMaster();
    this.getWorkOrderMaster()
    this.getApplicationUsers()
    this.getWorkStationMaster()
    this.getOperationMaster()

    this.groupMasterForm1.get('expectedStartDate')?.valueChanges.subscribe(expectedStartDate => {
      this.minToDate = expectedStartDate || '';
      const expectedEndDate = this.groupMasterForm1.get('expectedEndDate');
      if (expectedEndDate?.value && expectedEndDate.value < this.minToDate) {
        expectedEndDate.setValue('');
      }
    });

    this.jobTimeLogForm.get('fromDate')?.valueChanges.subscribe(fromDate => {
      this.minToDate1 = fromDate || ''; 
      const toDateControl = this.jobTimeLogForm.get('toDate');
      if (toDateControl?.value && toDateControl.value < this.minToDate1) {
        toDateControl.setValue('');
      }
    });

    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  addJobTimeLog() {
    if (!this.jobTimeLogForm.valid) {
      this.jobTimeLogForm.markAllAsTouched();
      return;
    }

    if (this.isTimeInvalid()) {
      return;
    }
  
    const employeeId = this.jobTimeLogForm.get('employeeName')?.value;
  
    const selectedEmployee = this.applicationMasterDrp.find(
      emp => emp.drpValue == employeeId
    );
  
    const logEntry = {
      employeeId: selectedEmployee?.drpValue ?? null,      // POST me ID
      employeeName: selectedEmployee?.drpOption ?? '',     // TABLE me Name
  
      fromDate: this.jobTimeLogForm.get('fromDate')?.value,
      fromTime: this.formatTime(this.jobTimeLogForm.get('fromTime')?.value),
      toDate: this.jobTimeLogForm.get('toDate')?.value,
      toTime: this.formatTime(this.jobTimeLogForm.get('toTime')?.value),
      timeInMinutes: this.jobTimeLogForm.get('timeInMinutes')?.value
    };
  
    if (this.editingIndex !== null) {
      this.jobTimeLogList[this.editingIndex] = logEntry;
      this.editingIndex = null;
    } else {
      this.jobTimeLogList.push(logEntry);
    }
  
    this.jobTimeLogForm.reset();
  }

  editJobTimeLog(index: number) {
    const entry = this.jobTimeLogList[index];
  
    const cleanFromTime = entry.fromTime?.substring(0,5);
    const cleanToTime = entry.toTime?.substring(0,5);
  
    this.jobTimeLogForm.patchValue({
      employeeName: entry.employeeId,          // 👈 IMPORTANT FIX (ID bind)
  
      fromDate: entry.fromDate,
      toDate: entry.toDate,
  
      fromTime: new Date(`1970-01-01T${cleanFromTime}:00`),
      toTime: new Date(`1970-01-01T${cleanToTime}:00`),
  
      timeInMinutes: entry.timeInMinutes
    });
  
    this.editingIndex = index;

  }
  

  deleteJobTimeLog(index: number) {
    this.jobTimeLogList.splice(index, 1);
  }

  getApplicationUsers() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetApplicationUsers|userID=${sessionStorage.getItem('userId')}`).subscribe((res: any) => {
      this.applicationMasterDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  allowFloat(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);
    if (!/[0-9.]/.test(char)) {
      event.preventDefault();
      return;
    }
    if (char === '.' && input.includes('.')) {
      event.preventDefault();
      return;
    }
    const parts = input.split('.');
    if (parts.length === 2 && parts[1].length >= 2) {
      event.preventDefault();
    }
  }

  getBillMaterialDrpMaster() {
    this.userService.getQuestionPaper(`uspGetBillOfmaterialMaster`).subscribe((res: any) => {
      this.billMaterialDrp = res['table']      
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getStatusMaster() {
    this.userService.getQuestionPaper(`uspGetJobCardStatusMaster`).subscribe((res: any) => {
      this.statusDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getWorkOrderMaster() {
    this.userService.getQuestionPaper(`uspWorkOrderDetailsMaster`).subscribe((res: any) => {
      this.workOrderMasterDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getWorkStationMaster() {
    this.userService.getQuestionPaper(`uspGetWorkStationTypeMaster`).subscribe((res: any) => {
      this.workStationMasterDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getOperationMaster() {
    this.userService.getQuestionPaper(`uspGetOperationMaster`).subscribe((res: any) => {
      this.OperationDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  onCheckboxChange(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.groupMasterForm1.get(fieldName)?.setValue(isChecked);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      const districtId = sessionStorage.getItem('District') || '';
      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetJobCardDetails|${query}`).subscribe({
        next: (res: any) => {    
          try {
            setTimeout(() => {
              this.data = res?.table1 || [];
              this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
              this.cdr.detectChanges();
            }, 0);
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            }, 1000);
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.data = [];
            this.totalCount = 0;
          }
        }
      });

    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }



  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
  
    this.header =
      view === 'add' ? 'Add' :
      view === 'update' ? 'Update' : 'View';
  
    this.headerIcon =
      view === 'add' ? 'pi pi-plus' :
      view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
  
    // ADD Mode
    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.jobTimeLogForm.reset();
      this.jobTimeLogForm.enable();
      this.jobTimeLogList=[]
      document.body.style.overflow = 'hidden';
      return;
    }
  
    // UPDATE / VIEW Mode
    if (view === 'view') {
      this.groupMasterForm1.disable();
      this.jobTimeLogForm.disable();
      this.jobTimeLogList=[]
    } 
    else {
      this.groupMasterForm1.enable();
      this.jobTimeLogForm.enable();
      this.jobTimeLogList=[]
    }

    this.groupMasterForm1.patchValue({
      postingDate: data.postingDate,
      workOrder: data.workOrderId,
      bomNumber: data.bomId,
      workstation: data.stationId,
      operations: data.operationId,
      quantityToManufacture: String(data.quantity),             // STRING FIX
      totalCompletedQty: String(data.totalCompletedQuantity),   // STRING FIX
      expectedStartDate: data.expectedStartDate,
      expectedEndDate: data.expectedEndDate,
      expectedTimeRequired: String(data.expectedHoursRequired), // STRING FIX
      status: data.statusID,
    });
  
    // ---------------------------------------------
    let rawList = [];
    try {
      rawList = JSON.parse(data.jobCardTimeLog || '[]');  // FIX
    } catch (e) {
      console.error("Invalid JSON for JobCardTimeLog", e);
      rawList = [];
    }
  
    // MAP LIST
    this.jobTimeLogList = rawList.map((item: any) => ({
      employeeId: item.userId,                // <-- REQUIRED FOR DROPDOWN
      employeeName: item.Name,                // label
      fromDate: item.fromdate,
      fromTime: item.fromtime,
      toDate: item.toDate,
      toTime: item.toTime,
    }));
    
  
    document.body.style.overflow = 'hidden';
  }
  

  isInvalid(field: string): boolean {
    const control = this.groupMasterForm1.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(true);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getTableData(false);
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.groupMasterForm1.enable();
    this.groupMasterForm1.reset();
    this.jobTimeLogList=[]
    this.visible = false;
  }

  openConfirmation(title: string, msg: string, id: any, option?: string, event?: any) {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: msg,
      header: title,
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      accept: () => {
        if (option === '1') {
          this.submitcall();
        } else if (option === '2') {
          this.deleteData();
        } else if (option === '5') {
          this.groupMasterForm1.reset()
        }
      }
    });
  }

  onClear() {
    this.groupMasterForm1.reset();
  }



  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    if (this.jobTimeLogList?.length == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one Job Time Log entry. ',
        life: 3000
      });
      return;
    }

    const postingDate = this.groupMasterForm1.get('postingDate')?.value;
    const workOrder = this.groupMasterForm1.get('workOrder')?.value;
    const bomNumber = this.groupMasterForm1.get('bomNumber')?.value;
    const workstation = this.groupMasterForm1.get('workstation')?.value;
    const operations = this.groupMasterForm1.get('operations')?.value;
    const quantityToManufacture = this.groupMasterForm1.get('quantityToManufacture')?.value;
    const totalCompletedQty = this.groupMasterForm1.get('totalCompletedQty')?.value;
    const expectedStartDate = this.groupMasterForm1.get('expectedStartDate')?.value;
    const expectedEndDate = this.groupMasterForm1.get('expectedEndDate')?.value;
    const expectedTimeRequired = this.groupMasterForm1.get('expectedTimeRequired')?.value;
    const status = this.groupMasterForm1.get('status')?.value;

    const timeLogJson = this.jobTimeLogList.map(row => ({
      assignId: row.employeeId,   
      fromdate: row.fromDate,
      TODATE: row.toDate,
      fromTime: row.fromTime,
      toTime: row.toTime,
    }));

    this.paramvaluedata = `timeLogJson=${JSON.stringify(timeLogJson)}|postDate=${postingDate}|workOrderId=${workOrder}|bomId=${bomNumber}|workStationId=${workstation}|operationId=${operations}|quant=${quantityToManufacture}|totalQuant=${totalCompletedQty}|expeStartDate=${expectedStartDate}|expeEndDate=${expectedEndDate}|expeHoursReq=${expectedTimeRequired}|jobCardStatusId=${status}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  // Helper to format Date object to HH:mm
  formatTime(dateObj: Date): string {
    if (!dateObj) return '';
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateJobCardDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostJobCardDetails`;
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(false);
        setTimeout(() => this.cdr.detectChanges(), 0);
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
        });
        this.onDrawerHide();
      } else if (resultarray[0] == "2") {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      } else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom });
      }
    });
  }


  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteJobCardDetails`, query, 'header').subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.pageNo = 1;
              this.getTableData(true);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data deleted successfully.',
                life: 3000
              });
              this.onDrawerHide();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000
            });
          }
        },
        error: (err) => {
          this.isFormLoading = false;
          console.error('API call failed:', err);
          if (err.status === 401 || err.status === 403) {
            this.message.add({
              severity: 'error',
              summary: 'Session Expired',
              detail: 'Your session has expired. Please log in again.',
              life: 3000
            });
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete data. Please try again later.',
              life: 3000
            });
          }
        }
      });
    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
    }
  }


  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }


  showGrouplist(data: any) {
    this.itemDailog = true;
    try {
      const custArray = JSON.parse(data.jobCardTimeLog || '[]');
      this.groupListArray = custArray.map((item: any) => ({
        Name: item.Name,
        fromdate: item.fromdate,
        toDate: item.toDate,
        fromtime: item.fromtime,
        toTime: item.toTime,
      }));
  
    } catch (e) {
      console.error('Error parsing operationJson', e);
      this.groupListArray = [];
    }
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  openCalendar(event: any) {
    event.target.showPicker();
  }

}
