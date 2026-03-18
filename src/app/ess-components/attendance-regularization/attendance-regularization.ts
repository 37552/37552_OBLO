import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { TableTemplate } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

import { PopoverModule } from 'primeng/popover';

import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-attendance-regularization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    DialogModule,
    DrawerModule,
    TableTemplate,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    TagModule,
    ToastModule,
    TabsModule,
    ConfirmDialogModule,
    NgxSpinnerModule,
    PopoverModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './attendance-regularization.html',
  styleUrl: './attendance-regularization.scss'
})
export class AttendanceRegularization implements OnInit {
  // UI State
  breadcrumbItems: MenuItem[] = [];
  displayApprovalDialog: boolean = false;
  approvalRemarks: string = "";
  approalHistoryData: any = null;
  loading: boolean = false;

  // Data State
  userId = sessionStorage.getItem('userId');
  empId = sessionStorage.getItem('empId');
  param: any;
  menulabel: string = '';
  formlable: string = '';
  currDate: any;
  holidayList: any[] = [];
  empWeekStatus: any;

  regAttendanceData: any[] = [];
  regAttendanceDataModify: any[] = [];
  regAttendanceDataModify2: any[] = [];
  regularizeData: any[] = [];
  ProcessedData: any[] = [];

  noDatafoundCard: boolean = false;
  notFoundAlert: boolean = false;
  showTableData: boolean = false;
  enableSubmitBtn: boolean = false;
  isCreator: boolean = true;
  timeAlert: boolean = false;
  errMsg: string = '';

  selectedItem: any = null;
  selectedAction: any = null;

  // Workflow Permissions
  wfId: any;
  wfLevel: string = "";
  isApprove: number = 0;
  isForward: number = 0;
  isReject: number = 0;
  isReturn: number = 0;
  isSave: number = 0;

  // Pending Table Pagination
  pendingPageNo: number = 1;
  pendingPageSize: number = 10;
  pendingTotal: number = 0;
  pendingSearchText: string = '';

  // Processed Table Pagination
  processedPageNo: number = 1;
  processedPageSize: number = 10;
  processedTotal: number = 0;
  processedSearchText: string = '';

  // Creator Table Pagination
  creatorPageNo: number = 1;
  creatorPageSize: number = 10;
  creatorTotal: number = 0;
  creatorSearchText: string = '';

  get pendingPaginated() {
    let filtered = this.regAttendanceDataModify2;
    if (this.pendingSearchText) {
      filtered = filtered.filter(item =>
        item.empName?.toLowerCase().includes(this.pendingSearchText.toLowerCase()) ||
        item.location?.toLowerCase().includes(this.pendingSearchText.toLowerCase()) ||
        item.serialNo?.toLowerCase().includes(this.pendingSearchText.toLowerCase())
      );
    }
    this.pendingTotal = filtered.length;
    const start = (this.pendingPageNo - 1) * this.pendingPageSize;
    return filtered.slice(start, start + this.pendingPageSize);
  }

  get processedPaginated() {
    let filtered = this.ProcessedData;
    if (this.processedSearchText) {
      filtered = filtered.filter(item =>
        item.empName?.toLowerCase().includes(this.processedSearchText.toLowerCase()) ||
        item.reason?.toLowerCase().includes(this.processedSearchText.toLowerCase())
      );
    }
    this.processedTotal = filtered.length;
    const start = (this.processedPageNo - 1) * this.processedPageSize;
    return filtered.slice(start, start + this.processedPageSize);
  }

  get creatorPaginated() {
    let filtered = this.regAttendanceDataModify;
    if (this.creatorSearchText) {
      filtered = filtered.filter(item =>
        item.dateLabel?.toLowerCase().includes(this.creatorSearchText.toLowerCase()) ||
        item.reason?.toLowerCase().includes(this.creatorSearchText.toLowerCase())
      );
    }
    this.creatorTotal = filtered.length;
    const start = (this.creatorPageNo - 1) * this.creatorPageSize;
    return filtered.slice(start, start + this.creatorPageSize);
  }

  pendingHeaders = [
    { key: 'rowNo', header: 'No.', isVisible: true, isSortable: false },
    { key: 'actions', header: 'Actions', isVisible: true, isSortable: false, isCustom: true },
    { key: 'empName', header: 'Employee', isVisible: true, isSortable: true },
    { key: 'location', header: 'Location', isVisible: true, isSortable: true },
    { key: 'serialNo', header: 'Serial', isVisible: true, isSortable: true },
    { key: 'jsonDetails', header: 'Date', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Time', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Status', isVisible: true, isSortable: false, isCustom: true }
  ];

  processedHeaders = [
    { key: 'rowNo', header: 'No.', isVisible: true, isSortable: false },
    { key: 'actions', header: 'History', isVisible: true, isSortable: false, isCustom: true },
    { key: 'empName', header: 'Employee', isVisible: true, isSortable: true },
    { key: 'jsonDetails', header: 'Date', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Time', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Reason', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails3', header: 'Status', isVisible: true, isSortable: false, isCustom: true }
  ];

  creatorHeaders = [
    { key: 'rowNo', header: 'No.', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Date', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'In Time', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Out Time', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails3', header: 'Reason', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails4', header: 'Status', isVisible: true, isSortable: false, isCustom: true },
    { key: 'actions', header: 'History', isVisible: true, isSortable: false, isCustom: true }
  ];

  onPendingPageChange(page: number) { this.pendingPageNo = page; }
  onPendingPageSizeChange(size: number) { this.pendingPageSize = size; this.pendingPageNo = 1; }
  onPendingSearchChange(search: string) { this.pendingSearchText = search; this.pendingPageNo = 1; }

  onProcessedPageChange(page: number) { this.processedPageNo = page; }
  onProcessedPageSizeChange(size: number) { this.processedPageSize = size; this.processedPageNo = 1; }
  onProcessedSearchChange(search: string) { this.processedSearchText = search; this.processedPageNo = 1; }

  onCreatorPageChange(page: number) { this.creatorPageNo = page; }
  onCreatorPageSizeChange(size: number) { this.creatorPageSize = size; this.creatorPageNo = 1; }
  onCreatorSearchChange(search: string) { this.creatorSearchText = search; this.creatorPageNo = 1; }

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private spinner: NgxSpinnerService,
    public customValidation: Customvalidation,
    public zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: 'ESS', routerLink: '/ess' },
      { label: 'Attendance Regularization', styleClass: 'font-bold text-blue-600' }
    ];
  }

  ngOnInit() {
    this.loadSessionParams();
    this.updateBreadcrumbs();

    let date = (new Date()).toLocaleDateString('en-CA');
    this.currDate = date + "T00:00:00";

    this.getPermission();
    this.getAttendanceData();
    this.getHolidayList();
    this.getEmployeeWeekOff();
  }

  loadSessionParams() {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.menulabel = paramjs.menu;
      this.formlable = paramjs.formName;
    }
  }

  updateBreadcrumbs() {
    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: this.menulabel || 'ESS', routerLink: '/ess' },
      { label: this.formlable || 'Attendance Regularization', styleClass: 'font-bold text-blue-600' }
    ];
    this.cdr.detectChanges();
  }

  getHolidayList() {
    this.userService.getQuestionPaper(`uspReportHolidayList|appUserId=${this.userId}`).subscribe((res: any) => {
      this.holidayList = res['table'];
    });
  }

  getEmployeeWeekOff() {
    const userInfoString = sessionStorage.getItem('UserInfo');
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo.empId) {
        this.userService.getQuestionPaper(`uspGetEmployeeWeekOffStatus|employeeId=${userInfo.empId}`).subscribe((res: any) => {
          this.empWeekStatus = res['table']?.[0]?.['weekOffStatus'];
        });
      }
    }
  }

  getPermission() {
    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService.getQuestionPaper(`uspGetPermissionByactivity_role|actitvityName=${this.formlable}|appUserId=${this.userId}|appUserRole=${roleID}`).subscribe(
      res => {
        if (res['table'] && res['table'].length !== 0) {
          const p = res['table'][0];
          this.wfId = p.wfId;
          this.wfLevel = p.wfLevel;
          this.isApprove = p.wfApprove;
          this.isForward = p.wfForword;
          this.isReject = p.wfReject;
          this.isReturn = p.wfReturn;
          this.isSave = p.wfSave;
        } else {
          this.wfId = "";
          this.isApprove = this.isForward = this.isReject = this.isReturn = this.isSave = 0;
        }
      },
      (err: HttpErrorResponse) => {
        if (err.status === 403) this.customValidation.loginroute(err.status);
      }
    );
  }

  getAttendanceData() {
    this.spinner.show();
    this.loading = true;
    this.regAttendanceDataModify = [];
    this.regAttendanceDataModify2 = [];
    this.regAttendanceData = [];

    let userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService.getQuestionPaper(
      `uspAttendanceToRegularizeGetList|UserId=${this.userId}|RoleId=${userRole}|orgId=${sessionStorage.getItem('Organization')}`
    ).subscribe(
      (res: any) => {
        this.regAttendanceData = res['table1'];
        this.isCreator = res['table2']?.[0]?.['wfLevel'] === "Creator";

        if (this.isCreator) {
          const holidays: string[] = [];
          const hList = this.holidayList?.filter(e => e['holiday Type'] == 'Festival' || e['holiday Type'] == 'National Holiday') || [];
          hList.forEach(key => {
            let holidayDate = (key.date).split("/").reverse().join('-');
            holidays.push(holidayDate);
          });

          let todayDate = new Date();
          this.regAttendanceData.forEach((element: any) => {
            const nextTwoDates = this.getNextDatesSkippingHolidays(holidays, new Date(element.dateLabel), 2);
            if (this.isCurrentDateLessThanOrEqual(todayDate, nextTwoDates)) {
              if (element.approvalDetail && typeof element.approvalDetail === 'string') {
                element.approvalDetail = JSON.parse(element.approvalDetail);
              }
              // Set default times if not present
              if (!element.in) element.in = "10:00";
              if (!element.out) element.out = "19:00";
              
              this.regAttendanceDataModify.push(element);
            }
          });
          this.regAttendanceDataModify.forEach((item, i) => Math.abs(item.rowNo = i + 1));
          this.notFoundAlert = this.regAttendanceDataModify.length <= 0;
          this.showTableData = true;
        } else {
          this.regAttendanceDataModify2 = [...this.regAttendanceData];
          this.regAttendanceDataModify2.forEach((e, i) => {
            e.rowNo = i + 1;
            if (e.approvalDetail && typeof e.approvalDetail === 'string') {
              e.approvalDetail = JSON.parse(e.approvalDetail);
            }
            // Set default times if not present
            if (!e.in) e.in = "10:00";
            if (!e.out) e.out = "19:00";
          });
          this.notFoundAlert = this.regAttendanceDataModify2.length <= 0;
        }
        this.loading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        this.spinner.hide();
        if (err.status === 403) this.customValidation.loginroute(err.status);
      }
    );
  }

  getProcessedData() {
    this.spinner.show();
    this.loading = true;
    let userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let orgId = sessionStorage.getItem('Organization');

    this.userService.getQuestionPaper(
      `uspAttendanceRegularizationGetListProcessed|UserId=${this.userId}|RoleId=${userRole}|orgId=${orgId}`
    ).subscribe((res: any) => {
      if (!res['table'] || res['table'].length === 0) {
        this.noDatafoundCard = true;
      } else {
        this.ProcessedData = res['table'];
        this.ProcessedData.forEach((e, i) => {
          e.rowNo = i + 1;
          if (e.approvalDetail && typeof e.approvalDetail === 'string') {
            e.approvalDetail = JSON.parse(e.approvalDetail);
          }
        });
        this.noDatafoundCard = false;
      }
      this.loading = false;
      this.spinner.hide();
      this.cdr.detectChanges();
    }, (err: HttpErrorResponse) => {
      this.loading = false;
      this.spinner.hide();
      if (err.status === 403) this.customValidation.loginroute(err.status);
    });
  }

  getNextDatesSkippingHolidays(holidays: string[], startDate: Date, numOfDates: number) {
    const result = [];
    let currentDate = new Date(startDate);
    while (result.length < numOfDates) {
      currentDate.setDate(currentDate.getDate() + 1);
      let isWeekend = this.empWeekStatus ? (currentDate.getDay() === 0 || currentDate.getDay() === 6) : (currentDate.getDay() === 0);
      const isHoliday = holidays.includes(this.formatDate(currentDate));

      if (!isWeekend && !isHoliday && currentDate > startDate) {
        result.push(this.formatDate(currentDate));
      }
    }
    return result;
  }

  isCurrentDateLessThanOrEqual(currentDate: Date, dateArray: string[]) {
    const formattedCurrentDate = this.formatDate(currentDate);
    return dateArray.some(date => formattedCurrentDate <= date);
  }

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handelData(event: any, index: number, item: any, type: string) {
    const value = event.target.value;
    if (type === 'IN') {
      item.in = value;
      item.out = null; // Reset out when in changes
    }
    if (type === 'OUT') item.out = value;
    if (type === 'REASON') item.reason = value;

    if (item.in && item.out) {
      const checkTime = (time: string) => {
        const parts = time.split(':');
        return new Date(2020, 1, 1, parseInt(parts[0]), parseInt(parts[1]), 0, 0);
      };

      let tOut = checkTime(item.out);
      let tIn = checkTime(item.in);

      let timeoutHours = (tOut.getHours() * 60 + tOut.getMinutes()) / 60;
      let timeInHours = (tIn.getHours() * 60 + tIn.getMinutes()) / 60;
      let result = timeoutHours - timeInHours;

      if (result < 4) {
        this.timeAlert = true;
        this.errMsg = 'Working hours must be greater than 4 hours';
      } else if (!item.reason) {
        this.timeAlert = true;
        this.errMsg = 'Please enter the reason';
      } else {
        this.timeAlert = false;
        const rowObj = {
          absentDate: item.dateLabel,
          timeIn: item.in,
          timeOut: item.out,
          reason: item.reason
        };
        const existingIndex = this.regularizeData.findIndex(d => d.absentDate === item.dateLabel);
        if (existingIndex > -1) {
          this.regularizeData[existingIndex] = rowObj;
        } else {
          this.regularizeData.push(rowObj);
        }
      }
    }
    this.enableSubmitBtn = this.regularizeData.length > 0;
  }

  submitAttendance() {
    this.spinner.show();
    let finalAttendanceArr = this.regularizeData.map(item => {
      let dateformat = item.absentDate.split('T')[0];
      return `${dateformat}^${item.timeIn}^${item.timeOut}^${item.reason}`;
    });

    let dateRange = finalAttendanceArr.toString();
    let userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = `UserId=${this.userId}|DateRange=${dateRange}|EmployeeId=${this.empId}|appUserRole=${userRole}|activity=${this.formlable}|orgId=${sessionStorage.getItem('Organization')}`;

    this.userService.SubmitPostTypeNotification('uspAttendanceRegularizationSubmitted', query, this.formlable).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.includes("Data Saved.")) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attendance Regularization Requested Successfully!' });
          this.regularizeData = [];
          this.getAttendanceData();
          this.cdr.detectChanges();
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Alert', detail: res.split("-")[1] || res });
        }
      },
      (err: HttpErrorResponse) => {
        this.spinner.hide();
        this.handleError(err);
      }
    );
  }

  openApprovalModal(item: any) {
    this.selectedItem = { ...item };
    if (!this.selectedItem.in) this.selectedItem.in = "10:00";
    if (!this.selectedItem.out) this.selectedItem.out = "19:00";
    this.approvalRemarks = "";
    this.displayApprovalDialog = true;
  }

  openApprovalHistoryModal(item: any) {
    this.approalHistoryData = item;
  }

  OnSubmitAction(action: string) {
    const wfStatusId = this.getwfStatusId(action);
    if ((wfStatusId === 3 || wfStatusId === 4) && !this.approvalRemarks) {
      this.messageService.add({ severity: 'warn', summary: 'Alert', detail: 'Please Enter Remarks.' });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} this request?`,
      header: 'Confirmation Pending',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
        let orgId = sessionStorage.getItem('Organization');
        let query = `orgid=${orgId}|inTme=${this.selectedItem.in}|outTime=${this.selectedItem.out}|appUserId=${this.userId}|approvalRemarks=${this.approvalRemarks}|id=${this.selectedItem.id}|appUserRole=${roleID}|activity=${this.formlable}|wfStatusId=${wfStatusId}`;

        this.spinner.show();
        this.userService.SubmitPostTypeData(`uspPostRegularizationApproval`, query, this.formlable).subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.includes("success")) {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: `Data ${action === 'Approve' ? 'Approved' : action + 'ed'} successfully.` });
              this.displayApprovalDialog = false;
              this.getAttendanceData();
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Alert', detail: res.split("-")[1] || res });
            }
          },
          (err: HttpErrorResponse) => {
            this.spinner.hide();
            this.handleError(err);
          }
        );
      }
    });
  }

  getwfStatusId(action: string): number {
    switch (action) {
      case 'Approve': return 1;
      case 'Forward': return 6;
      case 'Reject': return 3;
      case 'Return': return 4;
      default: return 0;
    }
  }

  getSeverity(statusCode: number): "success" | "info" | "warn" | "danger" | "secondary" {
    switch (statusCode) {
      case 1: return 'success';
      case 3: return 'danger';
      case 2: return 'warn';
      case 6: return 'info';
      default: return 'secondary';
    }
  }

  getStepColor(wflevel: string | null) {
    if (!wflevel) return 'border-slate-300 text-slate-400';
    const level = wflevel.toLowerCase();
    if (level.includes('creator')) return 'border-blue-500 text-blue-500';
    if (level.includes('approved')) return 'border-green-500 text-green-500';
    if (level.includes('reviewer')) return 'border-amber-500 text-amber-500';
    if (level.includes('approver')) return 'border-indigo-500 text-indigo-500';
    return 'border-slate-300 text-slate-400';
  }

  handleError(err: HttpErrorResponse) {
    if (err.status === 403) {
      this.customValidation.loginroute(err.status);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Something went wrong!' });
    }
  }
}