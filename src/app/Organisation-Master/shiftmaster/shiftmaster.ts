import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { Checkbox } from 'primeng/checkbox';

@Component({
  selector: 'app-shiftmaster',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialog,
    ProgressSpinner,
    Toast,
    Tooltip,
    FileUploadModule,
    Dialog,
    OnlyNumberDirective,
    BreadcrumbModule,
    SkeletonModule,
    Checkbox
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './shiftmaster.html',
  styleUrl: './shiftmaster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Shiftmaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  shiftForm: FormGroup;
  
  // Working days configuration
  workingDays: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isCustom: true },
    { key: 'shiftName', header: 'Shift Name', isVisible: true },
    { key: 'inTime', header: 'In Time', isVisible: true },
    { key: 'outTime', header: 'Out Time', isVisible: true},
    { key: 'breakStart', header: 'Break Start', isVisible: true },
    { key: 'breakEnd', header: 'Break End', isVisible: true },
     { key: 'jsonDetails',  header: 'Working Details', isVisible: true, isSortable: false, isCustom: true },
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;
 
  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  home: { icon: string; routerLink: string; } | undefined;
  jsonDetailsVisible: boolean = false;
  selectedItemDetails: any = null;
  jsonSectionType: 'shift' | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.shiftForm = this.fb.group({
      id: [0],
      shiftName: ['', Validators.required],
      inTime: ['', Validators.required],
      outTime: ['', Validators.required],
      breakStart: [''],
      breakEnd: [''],
      workingDay: ['', Validators.required]
    });
  }

  get f() { return this.shiftForm.controls }

  ngOnInit(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    this.loadWorkingDays();
    this.getTableData(true);
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  loadWorkingDays() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblWorkingDaysMaster`).subscribe({
      next: (res: any) => {
        const apiData = res['table'] || [];
        
        // Transform API data to match our expected structure
        this.workingDays = apiData.map((day: any) => ({
          id: day.drpValue, // Use drpValue as id
          name: day.drpOption, // Use drpOption as name
          shortName: this.getShortName(day.drpOption), // Generate short name
          selected: false
        }));
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error loading working days:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load working days.' });
        
        // Fallback to default working days
        this.workingDays = [
          { id: 10001, name: 'Sunday', shortName: 'Sun', selected: false },
          { id: 10002, name: 'Monday', shortName: 'Mon', selected: false },
          { id: 10003, name: 'Tuesday', shortName: 'Tue', selected: false },
          { id: 10004, name: 'Wednesday', shortName: 'Wed', selected: false },
          { id: 10005, name: 'Thursday', shortName: 'Thu', selected: false },
          { id: 10006, name: 'Friday', shortName: 'Fri', selected: false },
          { id: 10007, name: 'Saturday', shortName: 'Sat', selected: false }
        ];
        this.cdr.detectChanges();
      }
    });
  }

  getShortName(fullName: string): string {
    const shortNames: { [key: string]: string } = {
      'Sunday': 'Sun',
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat'
    };
    return shortNames[fullName] || fullName.substring(0, 3);
  }

  // Toggle day selection
  onDaySelectionChange() {
    this.updateWorkingDaysJson();
    this.cdr.detectChanges();
  }

  // Select all days
  selectAllDays() {
    this.workingDays.forEach(day => day.selected = true);
    this.updateWorkingDaysJson();
    this.cdr.detectChanges();
  }

  // Clear all days
  clearAllDays() {
    this.workingDays.forEach(day => day.selected = false);
    this.updateWorkingDaysJson();
    this.cdr.detectChanges();
  }

  // Update the workingDayJson form control
  updateWorkingDaysJson() {
    const selectedDays = this.workingDays
      .filter(day => day.selected)
      .map(day => ({
        workingDayId: day.id,
      }));
    
    this.shiftForm.patchValue({
      workingDay: JSON.stringify(selectedDays)
    });
    
    // Manually trigger validation
    this.shiftForm.get('workingDayJson')?.updateValueAndValidity();
  }

  // Get count of selected days
  getSelectedDaysCount(): number {
    return this.workingDays.filter(day => day.selected).length;
  }

  // Get names of selected days
  getSelectedDaysNames(): string {
    const selectedDays = this.workingDays.filter(day => day.selected);
    return selectedDays.map(day => day.shortName).join(', ');
  }

  // Format working days for display in table
  formatWorkingDaysDisplay(workingDay: string): string {
    if (!workingDay) return 'N/A';
    
    try {
      const days = JSON.parse(workingDay);
      if (Array.isArray(days)) {
        return days.map((day: any) => day.shortName).join(', ');
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  }

  // Format time for display
  formatTimeForDisplay(timeString: string): string {
    if (!timeString) return '';
    // Convert HH:mm:ss to HH:mm for display
    return timeString.substring(0, 5);
  }

  // Format time for API (ensure HH:mm:ss format)
  formatTimeForAPI(timeString: string): string {
    if (!timeString) return '';
    // Ensure time is in HH:mm:ss format
    if (timeString.length === 5) {
      return timeString + ':00';
    }
    return timeString;
  }

  // Helper method to convert time string to minutes
  timeToMinutes(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper method to format minutes to time string
  minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  hasBreakDuration(): boolean {
    const breakStart = this.shiftForm.get('breakStart')?.value;
    const breakEnd = this.shiftForm.get('breakEnd')?.value;
    return !!(breakStart && breakEnd);
  }

  getBreakDuration(): string {
    const breakStart = this.shiftForm.get('breakStart')?.value;
    const breakEnd = this.shiftForm.get('breakEnd')?.value;

    if (!breakStart || !breakEnd) return '';

    const startMinutes = this.timeToMinutes(breakStart);
    const endMinutes = this.timeToMinutes(breakEnd);
    const durationMinutes = endMinutes - startMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  // Handle break time changes
  onBreakTimeChange() {
    this.cdr.detectChanges();
  }

  // Validate break times on submit
  invalidBreakTimes(): boolean {
    const breakStart = this.shiftForm.get('breakStart')?.value;
    const breakEnd = this.shiftForm.get('breakEnd')?.value;
    const inTime = this.shiftForm.get('inTime')?.value;
    const outTime = this.shiftForm.get('outTime')?.value;

    // If both break times are provided, validate them
    if (breakStart && breakEnd) {
      const breakStartTime = this.timeToMinutes(breakStart);
      const breakEndTime = this.timeToMinutes(breakEnd);

      if (breakEndTime <= breakStartTime) {
        this.message.add({ severity: 'warn', summary: 'Invalid Break Time', detail: 'Break end time must be after break start time.' });
        return true;
      }

      // Validate break times against shift times
      if (inTime && outTime) {
        const shiftStartTime = this.timeToMinutes(inTime);
        const shiftEndTime = this.timeToMinutes(outTime);

        if (breakStartTime < shiftStartTime) {
          this.message.add({ severity: 'warn', summary: 'Invalid Break Time', detail: 'Break start time cannot be before shift start time.' });
          return true;
        }

        if (breakEndTime > shiftEndTime) {
          this.message.add({ severity: 'warn', summary: 'Invalid Break Time', detail: 'Break end time cannot be after shift end time.' });
          return true;
        }
      }
    }

    // If only one break time is provided
    if ((breakStart && !breakEnd) || (!breakStart && breakEnd)) {
      this.message.add({ severity: 'warn', summary: 'Invalid Break Time', detail: 'Both break start and end times must be provided or neither.' });
      return true;
    }

    return false;
  }

  getTableData(isTrue: boolean) {
    if (isTrue) {
      this.isLoading = true;
      this.cdr.detectChanges();
    } else {
      this.pageNo = 1;
    }
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    let query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}`;
    
    this.userService.getQuestionPaper(`uspGetShiftAndHours|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          this.data = this.data.map(item => ({
            ...item,
            workingDays: this.formatWorkingDaysDisplay(item.workingDay)
          }));
         
          this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
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
        console.error('Error loading table data:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load shifts.' });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.getTableData(false);
    }, this.debounceTime);
    
    this.cdr.markForCheck();
  }

  clearSearch() {
    this.searchText = '';
    this.pageNo = 1;
    this.getTableData(false);
    this.cdr.markForCheck();
  }

  onSearchChangeImmediate(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getTableData(false);
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();
   
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Shift';
      this.headerIcon = 'pi pi-plus';
      this.shiftForm.reset({
        id: 0
      });
      this.clearAllDays(); // Reset day selection
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Shift' : 'View Shift';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
     
      if (view === 'view') {
        this.shiftForm.disable();
      } else {
        this.shiftForm.enable();
      }

      // Patch form with data from get API
      const patchData = {
        id: data.id || 0,
        shiftName: data.shiftName || '',
        inTime: this.formatTimeForDisplay(data.inTime) || '',
        outTime: this.formatTimeForDisplay(data.outTime) || '',
        breakStart: this.formatTimeForDisplay(data.breakStart) || '',
        breakEnd: this.formatTimeForDisplay(data.breakEnd) || '',
        workingDay: data.workingDay || ''
      };

      this.shiftForm.patchValue(patchData);

      // Update working days selection
      if (data.workingDay) {
        try {
          const selectedDays = JSON.parse(data.workingDay);
          if (Array.isArray(selectedDays)) {
            this.workingDays.forEach(day => {
              day.selected = selectedDays.some((selected: any) => selected.dayId === day.id);
            });
          }
        } catch (error) {
          console.error('Error parsing workingDayJson:', error);
          this.clearAllDays();
        }
      } else {
        this.clearAllDays();
      }

      this.updateWorkingDaysJson();
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    this.shiftForm.markAllAsTouched();
    if (this.getSelectedDaysCount() === 0) {
      this.shiftForm.get('workingDay')?.setErrors({ required: true });
    }

    if (!this.shiftForm.valid) {
      this.cdr.detectChanges();
      return;
    }

    // Validate break times on submit
    if (this.invalidBreakTimes()) {
      this.cdr.detectChanges();
      return;
    }
    
    const rawValues = this.shiftForm.getRawValue();

    rawValues.inTime = this.formatTimeForAPI(rawValues.inTime);
    rawValues.outTime = this.formatTimeForAPI(rawValues.outTime);
    rawValues.breakStart = this.formatTimeForAPI(rawValues.breakStart);
    rawValues.breakEnd = this.formatTimeForAPI(rawValues.breakEnd);

    Object.keys(rawValues).forEach(key => {
      if (rawValues[key] === null || rawValues[key] === undefined) {
        rawValues[key] = '';
      }
    });

    if (this.postType === 'add') {
      rawValues.id = 0;
    }
   
    this.paramvaluedata = Object.entries(rawValues)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
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
        }
      },
      reject: () => {
      }
    });
  }

  submitcall() {
    this.isFormLoading = true;
    this.cdr.detectChanges();
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = '';
    let SP = 'uspPostOrgShiftEntry';
    query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
   
    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update' ? 'Shift Updated Successfully.' : 'Shift Saved Successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] == "2") {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save shift data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteOrgShiftEntry`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Shift deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete shift.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.shiftForm.enable();
    this.visible = false;
    this.onClear();
    this.cdr.detectChanges();
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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  isInvalid(field: string): boolean {
    const control = this.shiftForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.shiftForm.reset({
      id: 0
    });
    this.clearAllDays();
    this.cdr.detectChanges();
  }
viewShiftDetails(item: any) {
  this.selectedItemDetails = {
    shiftName: item.shiftName,
    inTime: item.inTime,
    outTime: item.outTime,
    breakStart: item.breakStart,
    breakEnd: item.breakEnd,
    workingDay: Array.isArray(item.workingDay)
      ? item.workingDay
      : (item.workingDay ? JSON.parse(item.workingDay) : [])
  };

  this.jsonSectionType = 'shift';
  this.jsonDetailsVisible = true;
  this.cdr.detectChanges();
}

  closeJsonDetails() {
    this.jsonDetailsVisible = false;
    this.selectedItemDetails = null;
    this.jsonSectionType = null;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}